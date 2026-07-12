import { notFound, redirect } from "next/navigation";
import { getAuthUser, isAdmin, requireAuth, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";
import { VALID_TRANSITIONS } from "@/lib/constants";
import { StatusBadge } from "@/components/issues/status-badge";
import { PriorityBadge } from "@/components/issues/priority-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CalendarDays, User, Tag, AlertTriangle, Wrench } from "lucide-react";
import Link from "next/link";

interface IssueDetailPageProps {
  params: Promise<{ id: string }>;
}

async function IssueDetailContent({ params }: IssueDetailPageProps) {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;

  const issue = await db.issue.findUnique({
    where: { id },
    include: {
      asset: { select: { id: true, name: true, assetCode: true, status: true } },
      reportedBy: { select: { firstName: true, lastName: true, email: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
      category: { select: { name: true } },
      historyEntries: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          action: true,
          description: true,
          createdAt: true,
          performedBy: { select: { firstName: true, lastName: true } },
        },
      },
      maintenanceRecords: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          type: true,
          completedAt: true,
          performedBy: { select: { firstName: true, lastName: true } },
        },
      },
      attachments: {
        orderBy: { createdAt: "asc" },
        select: { id: true, fileUrl: true, fileName: true },
      },
      aiSuggestions: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          title: true,
          category: true,
          priority: true,
          confidenceScore: true,
          safetyWarnings: true,
          recurringPatternWarning: true,
        },
      },
    },
  });

  if (!issue) notFound();

  const validNextStatuses = VALID_TRANSITIONS[issue.status] || [];
  const isAdministrator = await isAdmin();

  async function transitionIssue(formData: FormData) {
    "use server";

    const actor = await requireAuth();

    const nextStatus = formData.get("status") as string;
    if (!nextStatus) return;

    const issueRecord = await db.issue.findUnique({ where: { id } });
    if (!issueRecord) return;

    // Server-side authorization: admins/supervisors or the assigned technician.
    const isPrivileged =
      actor.role === "ADMINISTRATOR" || actor.role === "SUPERVISOR";
    if (!isPrivileged && issueRecord.assignedToId !== actor.id) {
      throw new Error("You are not authorized to change this issue's status");
    }

    const validNext = VALID_TRANSITIONS[issueRecord.status];
    if (!validNext || !validNext.includes(nextStatus)) return;

    const updateData: Record<string, unknown> = { status: nextStatus };
    if (nextStatus === "RESOLVED") {
      updateData.resolvedAt = new Date();
    }
    if (nextStatus === "REOPENED") {
      updateData.resolvedAt = null;
      updateData.resolutionNotes = null;
    }

    await db.issue.update({
      where: { id },
      data: updateData as Prisma.IssueUpdateInput,
    });

    await db.historyEntry.create({
      data: {
        action: `STATUS_${nextStatus}`,
        description: `Issue status changed from ${issueRecord.status} to ${nextStatus}`,
        assetId: issueRecord.assetId,
        issueId: id,
        performedById: actor.id,
      },
    });

    redirect(`/issues/${id}`);
  }

  async function assignTechnician(formData: FormData) {
    "use server";

    const actor = await requireRole("ADMINISTRATOR", "SUPERVISOR");

    const technicianId = formData.get("technicianId") as string;
    if (!technicianId) return;

    const issueRecord = await db.issue.findUnique({ where: { id } });
    if (!issueRecord) return;

    const technician = await db.user.findUnique({
      where: { id: technicianId },
    });
    if (!technician || technician.role !== "TECHNICIAN") return;

    const validNext = VALID_TRANSITIONS[issueRecord.status];
    if (!validNext || !validNext.includes("ASSIGNED")) return;

    await db.issue.update({
      where: { id },
      data: { assignedToId: technicianId, status: "ASSIGNED" },
    });

    await db.historyEntry.create({
      data: {
        action: "ISSUE_ASSIGNED",
        description: `Issue assigned to ${technician.firstName} ${technician.lastName}`,
        assetId: issueRecord.assetId,
        issueId: issueRecord.id,
        performedById: actor.id,
      },
    });

    redirect(`/issues/${id}`);
  }

  const technicians = isAdministrator
    ? await db.user.findMany({
        where: { role: "TECHNICIAN", isActive: true },
        select: { id: true, firstName: true, lastName: true },
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{issue.title}</h1>
            <StatusBadge status={issue.status} />
          </div>
          <p className="text-muted-foreground">{issue.issueNumber}</p>
        </div>
        <Link href="/issues/new">
          <Button variant="outline">New Issue</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">{issue.description}</p>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Tag className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span className="text-sm font-medium">
                    {issue.category?.name || "Uncategorized"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={issue.priority} />
                  <span className="text-sm text-muted-foreground">Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Reporter:</span>
                  <span className="text-sm font-medium">
                    {issue.reportedBy.firstName} {issue.reportedBy.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Assigned to:</span>
                  <span className="text-sm font-medium">
                    {issue.assignedTo ? (
                      `${issue.assignedTo.firstName} ${issue.assignedTo.lastName}`
                    ) : (
                      <span className="text-muted-foreground italic">Not assigned</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Reported:</span>
                  <span className="text-sm font-medium">
                    {format(issue.createdAt, "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Asset:</span>
                  <span className="text-sm font-medium">
                    {issue.asset.name} ({issue.asset.assetCode})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {issue.historyEntries.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No history entries yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {issue.historyEntries.map((entry) => (
                    <div key={entry.createdAt.toString() + entry.action} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="size-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1 w-px bg-border" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm">{entry.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(entry.createdAt, "MMM d, yyyy HH:mm")} | {entry.performedBy.firstName} {entry.performedBy.lastName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Triage Suggestion</CardTitle>
            </CardHeader>
            <CardContent>
              {issue.aiSuggestions.length > 0 ? (
                <div className="space-y-2">
                  {issue.aiSuggestions.map((suggestion) => (
                    <div key={suggestion.title}>
                      <p className="text-sm font-medium">{suggestion.title}</p>
                      <div className="grid gap-2 mt-2 sm:grid-cols-2">
                        {suggestion.category && (
                          <div>
                            <span className="text-xs text-muted-foreground">Category:</span>
                            <span className="text-sm ml-1">{suggestion.category}</span>
                          </div>
                        )}
                        {suggestion.priority && (
                          <div>
                            <span className="text-xs text-muted-foreground">Priority:</span>
                            <span className="text-sm ml-1">{suggestion.priority}</span>
                          </div>
                        )}
                        {suggestion.confidenceScore && (
                          <div>
                            <span className="text-xs text-muted-foreground">Confidence:</span>
                            <span className="text-sm ml-1">{(suggestion.confidenceScore * 100).toFixed(0)}%</span>
                          </div>
                        )}
                        {suggestion.safetyWarnings && (
                          <div className="col-span-full">
                            <span className="text-xs text-muted-foreground">Safety Warnings:</span>
                            <span className="text-sm ml-1">{suggestion.safetyWarnings}</span>
                          </div>
                        )}
                        {suggestion.recurringPatternWarning && (
                          <div className="col-span-full">
                            <span className="text-xs text-muted-foreground">Recurring Pattern:</span>
                            <span className="text-sm ml-1">{suggestion.recurringPatternWarning}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-2 text-sm text-muted-foreground">
                  No AI suggestions yet. AI triage will be performed when the issue is processed.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              {issue.attachments.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No evidence attached to this issue.
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {issue.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block size-28 overflow-hidden rounded-lg border bg-muted transition-transform hover:scale-[1.02]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={att.fileUrl}
                        alt={att.fileName}
                        className="size-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Maintenance Records</CardTitle>
            </CardHeader>
            <CardContent>
              {issue.maintenanceRecords.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No maintenance records associated with this issue.
                </p>
              ) : (
                <div className="space-y-3">
                  {issue.maintenanceRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <Wrench className="size-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{record.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {record.type} | {record.completedAt ? format(record.completedAt, "MMM d, yyyy") : "In progress"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {validNextStatuses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Change Status</CardTitle>
                <CardDescription>
                  Current: {issue.status.replace(/_/g, " ")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={transitionIssue}>
                  <div className="flex flex-wrap gap-2">
                    {validNextStatuses.map((nextStatus) => (
                      <Button
                        key={nextStatus}
                        variant="outline"
                        className="flex-1"
                        name="status"
                        value={nextStatus}
                        type="submit"
                      >
                        {nextStatus.replace(/_/g, " ")}
                      </Button>
                    ))}
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isAdministrator && (
            <Card>
              <CardHeader>
                <CardTitle>Assign Technician</CardTitle>
                <CardDescription>
                  Assign a technician to this issue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={assignTechnician} className="space-y-3">
                  <select
                    name="technicianId"
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select a technician...
                    </option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.firstName} {tech.lastName}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" className="w-full" disabled={technicians.length === 0}>
                    Assign
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IssueDetailPage(props: IssueDetailPageProps) {
  return <IssueDetailContent params={props.params} />;
}
