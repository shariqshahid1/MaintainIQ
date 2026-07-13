"use server";

import { refresh } from "next/cache";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { maintenanceSchema } from "@/lib/validators";
import type { Prisma } from "@/app/generated/prisma/client";

export async function createMaintenance(formData: FormData) {
  const user = await requireRole("TECHNICIAN", "ADMINISTRATOR", "SUPERVISOR");

  const raw = {
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    inspectionNotes: formData.get("inspectionNotes") || undefined,
    repairNotes: formData.get("repairNotes") || undefined,
    workDone: formData.get("workDone") || undefined,
    cost: formData.get("cost") ? Number(formData.get("cost")) : undefined,
    workingHours: formData.get("workingHours")
      ? Number(formData.get("workingHours"))
      : undefined,
    conditionAfter: formData.get("conditionAfter") || undefined,
    assetId: formData.get("assetId"),
    issueId: formData.get("issueId") || undefined,
  };

  const parsed = maintenanceSchema.parse(raw);

  // Attachment ids produced by the evidence uploader.
  const attachmentRaw = formData.get("attachmentIds");
  let attachmentIds: string[] = [];
  if (typeof attachmentRaw === "string" && attachmentRaw.trim()) {
    try {
      const arr = JSON.parse(attachmentRaw);
      if (Array.isArray(arr)) {
        attachmentIds = arr.filter((id): id is string => typeof id === "string");
      }
    } catch {
      attachmentIds = [];
    }
  }

  const maintenance = await db.maintenanceRecord.create({
    data: {
      ...parsed,
      performedById: user.id,
      completedAt: new Date(),
    },
  });

  if (attachmentIds.length > 0) {
    await db.attachment.updateMany({
      where: { id: { in: attachmentIds } },
      data: { maintenanceRecordId: maintenance.id },
    });
  }

  const updateData: Record<string, unknown> = {
    status: "UNDER_MAINTENANCE",
  };

  if (parsed.conditionAfter) {
    updateData.condition = parsed.conditionAfter;
  }

  if (parsed.type !== "INSPECTION") {
    updateData.lastServiceDate = new Date();
  }

  await db.asset.update({
    where: { id: parsed.assetId },
    data: updateData as Prisma.AssetUpdateInput,
  });

  if (parsed.issueId) {
    await db.issue.update({
      where: { id: parsed.issueId },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    });
  }

  await db.historyEntry.create({
    data: {
      action: "maintenance_created",
      description: `${parsed.type} maintenance: ${parsed.title}`,
      assetId: parsed.assetId,
      issueId: parsed.issueId || null,
      performedById: user.id,
    },
  });

  refresh();
  return { success: true, id: maintenance.id };
}
