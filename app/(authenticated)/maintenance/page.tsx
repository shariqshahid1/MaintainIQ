import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Wrench, Plus, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MAINTENANCE_TYPES } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{
    type?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function MaintenancePage({ searchParams }: PageProps) {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const { type, from, to } = await searchParams;

  const where: Record<string, unknown> = {};

  if (type && MAINTENANCE_TYPES.includes(type as (typeof MAINTENANCE_TYPES)[number])) {
    where.type = type;
  }

  if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    where.completedAt = dateFilter;
  }

  const records = await db.maintenanceRecord.findMany({
    where,
    orderBy: { completedAt: "desc" },
    include: {
      asset: { select: { id: true, name: true, assetCode: true } },
      issue: { select: { id: true, issueNumber: true, title: true } },
      performedBy: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Maintenance Records</h1>
          <p className="text-muted-foreground">
            Track all maintenance activities
          </p>
        </div>
        <Link href="/maintenance/new">
          <Button>
            <Plus className="size-4" />
            New Record
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-3">
            <select
              name="type"
              defaultValue={type || ""}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="">All Types</option>
              {MAINTENANCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="from"
              defaultValue={from || ""}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
              placeholder="From"
            />
            <input
              type="date"
              name="to"
              defaultValue={to || ""}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
              placeholder="To"
            />
            <Button type="submit" size="sm">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {records.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance records"
          description="Create your first maintenance record to start tracking activities."
          actionLabel="New Record"
          actionHref="/maintenance/new"
        />
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <Link key={record.id} href={`/maintenance/${record.id}`}>
              <Card className="transition-shadow hover:shadow-md cursor-pointer">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{record.type}</Badge>
                      <span className="font-medium">{record.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Asset: {record.asset.name} ({record.asset.assetCode})
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {record.cost != null && <span>Cost: ${record.cost.toFixed(2)}</span>}
                      {record.workingHours != null && <span>Hours: {record.workingHours}h</span>}
                      {record.completedAt && (
                        <span>
                          Completed {formatDistanceToNow(new Date(record.completedAt), { addSuffix: true })}
                        </span>
                      )}
                      <span>
                        by{" "}
                        {[record.performedBy.firstName, record.performedBy.lastName]
                          .filter(Boolean)
                          .join(" ") || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
