import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/issues/status-badge";
import { PriorityBadge } from "@/components/issues/priority-badge";
import {
  ArrowLeft,
  CalendarDays,
  User,
  Boxes,
  ClipboardList,
  Stethoscope,
  DollarSign,
  Clock,
  Activity,
} from "lucide-react";
import { format } from "date-fns";

interface MaintenanceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MaintenanceDetailPage({
  params,
}: MaintenanceDetailPageProps) {
  const user = await getAuthUser();
  if (!user) {
    return notFound();
  }

  const { id } = await params;

  const record = await db.maintenanceRecord.findUnique({
    where: { id },
    include: {
      asset: { select: { id: true, name: true, assetCode: true, status: true } },
      issue: {
        select: { id: true, issueNumber: true, title: true, status: true, priority: true },
      },
      performedBy: { select: { firstName: true, lastName: true } },
      partsUsed: { orderBy: { createdAt: "asc" } },
      attachments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!record) notFound();

  const totalPartsCost = record.partsUsed.reduce(
    (sum, p) => sum + (p.unitCost ? p.unitCost * p.quantity : 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/maintenance"
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to Maintenance
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{record.title}</h1>
            <Badge variant="secondary">{record.type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Recorded {format(record.createdAt, "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-4" />
                Work Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {record.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Description</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{record.description}</p>
                </div>
              )}
              {record.inspectionNotes && (
                <div>
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Stethoscope className="size-3.5" /> Inspection Notes
                  </p>
                  <p className="whitespace-pre-wrap text-sm">{record.inspectionNotes}</p>
                </div>
              )}
              {record.repairNotes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Repair Notes</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{record.repairNotes}</p>
                </div>
              )}
              {record.workDone && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Work Done</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{record.workDone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Boxes className="size-4" />
                Parts Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              {record.partsUsed.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No parts were recorded for this maintenance.
                </p>
              ) : (
                <div className="space-y-3">
                  {record.partsUsed.map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{part.name}</p>
                        {part.partNumber && (
                          <p className="text-xs text-muted-foreground">
                            Part #: {part.partNumber}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Qty: {part.quantity}</p>
                        {part.unitCost != null && (
                          <p className="text-xs text-muted-foreground">
                            ${(part.unitCost * part.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {totalPartsCost > 0 && (
                    <div className="flex justify-between pt-2 text-sm font-medium">
                      <span>Total Parts Cost</span>
                      <span>${totalPartsCost.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Boxes className="size-4 text-muted-foreground" />
                <Link
                  href={`/assets/${record.asset.id}`}
                  className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {record.asset.name} ({record.asset.assetCode})
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Performed by:</span>
                <span className="font-medium">
                  {record.performedBy.firstName} {record.performedBy.lastName}
                </span>
              </div>
              {record.completedAt && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="font-medium">
                    {format(record.completedAt, "MMM d, yyyy")}
                  </span>
                </div>
              )}
              {record.cost != null && (
                <div className="flex items-center gap-2">
                  <DollarSign className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Cost:</span>
                  <span className="font-medium">${record.cost.toFixed(2)}</span>
                </div>
              )}
              {record.workingHours != null && (
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Hours:</span>
                  <span className="font-medium">{record.workingHours}</span>
                </div>
              )}
              {record.conditionAfter && (
                <div className="flex items-center gap-2">
                  <Activity className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Condition after:</span>
                  <span className="font-medium">{record.conditionAfter}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {record.issue && (
            <Card>
              <CardHeader>
                <CardTitle>Related Issue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <PriorityBadge priority={record.issue.priority} />
                  <StatusBadge status={record.issue.status} />
                </div>
                <p className="text-sm font-medium">{record.issue.title}</p>
                <p className="text-xs text-muted-foreground">
                  {record.issue.issueNumber}
                </p>
                <Link href={`/issues/${record.issue.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Issue
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
