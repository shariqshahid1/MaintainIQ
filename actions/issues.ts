"use server";

import { refresh } from "next/cache";
import { requireAuth, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { issueSchema } from "@/lib/validators";
import { VALID_TRANSITIONS } from "@/lib/constants";
import type { IssueStatus, Prisma } from "@/app/generated/prisma/client";

export async function createIssue(formData: FormData) {
  const user = await requireAuth();

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    priority: (formData.get("priority") as string) || "MEDIUM",
    assetId: formData.get("assetId") as string,
    categoryId: (formData.get("categoryId") as string) || undefined,
  };

  // Optional AI triage payload (JSON string) produced by the AI Triage panel.
  const aiRaw = formData.get("aiSuggestion");
  let aiSuggestion:
    | {
        title: string;
        category: string;
        priority: string;
        possibleCauses: string[];
        safetyWarnings: string[];
        diagnosticChecks: string[];
        confidenceScore: number;
        recurringPatternWarning?: string;
      }
    | null = null;
  if (typeof aiRaw === "string" && aiRaw.trim()) {
    try {
      aiSuggestion = JSON.parse(aiRaw);
    } catch {
      aiSuggestion = null;
    }
  }

  // Attachment ids produced by the evidence uploader (best-effort linking).
  const attachmentRaw = formData.get("attachmentIds");
  let attachmentIds: string[] = [];
  if (typeof attachmentRaw === "string" && attachmentRaw.trim()) {
    try {
      const parsed = JSON.parse(attachmentRaw);
      if (Array.isArray(parsed)) {
        attachmentIds = parsed.filter((id): id is string => typeof id === "string");
      }
    } catch {
      attachmentIds = [];
    }
  }

  const validated = issueSchema.safeParse(raw);
  if (!validated.success) {
    throw new Error(
      validated.error.flatten().fieldErrors
        ? JSON.stringify(validated.error.flatten().fieldErrors)
        : "Validation failed",
    );
  }

  const year = new Date().getFullYear();
  const count = await db.issue.count({
    where: { issueNumber: { startsWith: `IQ-${year}-` } },
  });
  const issueNumber = `IQ-${year}-${String(count + 1).padStart(5, "0")}`;

  const issue = await db.issue.create({
    data: {
      title: validated.data.title,
      description: validated.data.description,
      priority: validated.data.priority,
      issueNumber,
      assetId: validated.data.assetId,
      reportedById: user.id,
      categoryId: validated.data.categoryId || null,
      aiSuggestions: aiSuggestion
        ? {
            create: {
              title: aiSuggestion.title,
              category: aiSuggestion.category,
              priority: aiSuggestion.priority,
              possibleCauses: aiSuggestion.possibleCauses.join("\n"),
              safetyWarnings: aiSuggestion.safetyWarnings.join("\n"),
              diagnosticChecks: aiSuggestion.diagnosticChecks.join("\n"),
              confidenceScore: aiSuggestion.confidenceScore,
              recurringPatternWarning:
                aiSuggestion.recurringPatternWarning ?? null,
              userId: user.id,
              wasAccepted: true,
            },
          }
        : undefined,
    },
  });

  if (attachmentIds.length > 0) {
    await db.attachment.updateMany({
      where: { id: { in: attachmentIds } },
      data: { issueId: issue.id },
    });
  }

  await db.historyEntry.create({
    data: {
      action: "ISSUE_REPORTED",
      description: `Issue "${issueNumber}" was reported`,
      assetId: validated.data.assetId,
      issueId: issue.id,
      performedById: user.id,
    },
  });

  await db.notification.create({
    data: {
      title: "New Issue Reported",
      message: `Issue ${issueNumber}: ${validated.data.title}`,
      type: "issue_created",
      link: `/issues/${issue.id}`,
      userId: user.id,
    },
  });

  refresh();
  return { success: true, id: issue.id };
}

export async function updateIssueStatus(id: string, status: string) {
  const user = await requireAuth();

  const issue = await db.issue.findUnique({ where: { id } });
  if (!issue) throw new Error("Issue not found");

  const validNextStatuses = VALID_TRANSITIONS[issue.status];
  if (!validNextStatuses || !validNextStatuses.includes(status)) {
    throw new Error(
      `Invalid transition from ${issue.status} to ${status}. Allowed: ${validNextStatuses?.join(", ") || "none"}`,
    );
  }

  const updateData: Record<string, unknown> = { status: status as IssueStatus };
  if (status === "RESOLVED") {
    updateData.resolvedAt = new Date();
  }
  if (status === "REOPENED") {
    updateData.resolvedAt = null;
    updateData.resolutionNotes = null;
  }

  await db.issue.update({ where: { id }, data: updateData as Prisma.IssueUpdateInput });

  await db.historyEntry.create({
    data: {
      action: `STATUS_${status}`,
      description: `Issue status changed from ${issue.status} to ${status}`,
      assetId: issue.assetId,
      issueId: id,
      performedById: user.id,
    },
  });

  refresh();
  return { success: true };
}

export async function assignIssue(id: string, technicianId: string) {
  const user = await requireRole("ADMINISTRATOR", "SUPERVISOR");

  const issue = await db.issue.findUnique({ where: { id } });
  if (!issue) throw new Error("Issue not found");

  const technician = await db.user.findUnique({
    where: { id: technicianId },
  });
  if (!technician || technician.role !== "TECHNICIAN") {
    throw new Error("Invalid technician");
  }

  const validNextStatuses = VALID_TRANSITIONS[issue.status];
  if (!validNextStatuses || !validNextStatuses.includes("ASSIGNED")) {
    throw new Error(
      `Cannot assign in current status: ${issue.status}. Allowed transitions: ${validNextStatuses?.join(", ") || "none"}`,
    );
  }

  await db.issue.update({
    where: { id },
    data: { assignedToId: technicianId, status: "ASSIGNED" },
  });

  await db.historyEntry.create({
    data: {
      action: "ISSUE_ASSIGNED",
      description: `Issue assigned to ${technician.firstName} ${technician.lastName}`,
      assetId: issue.assetId,
      issueId: id,
      performedById: user.id,
    },
  });

  await db.notification.create({
    data: {
      title: "Issue Assigned",
      message: `Issue ${issue.issueNumber} has been assigned to you`,
      type: "issue_assigned",
      link: `/issues/${id}`,
      userId: technicianId,
    },
  });

  refresh();
  return { success: true };
}

export async function resolveIssue(id: string, resolutionNotes: string) {
  const user = await requireAuth();

  const issue = await db.issue.findUnique({ where: { id } });
  if (!issue) throw new Error("Issue not found");

  const validNextStatuses = VALID_TRANSITIONS[issue.status];
  if (!validNextStatuses || !validNextStatuses.includes("RESOLVED")) {
    throw new Error(
      `Cannot resolve in current status: ${issue.status}. Allowed transitions: ${validNextStatuses?.join(", ") || "none"}`,
    );
  }

  await db.issue.update({
    where: { id },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
      resolutionNotes,
    },
  });

  await db.historyEntry.create({
    data: {
      action: "ISSUE_RESOLVED",
      description: `Issue resolved: ${resolutionNotes.substring(0, 200)}`,
      assetId: issue.assetId,
      issueId: id,
      performedById: user.id,
    },
  });

  refresh();
  return { success: true };
}
