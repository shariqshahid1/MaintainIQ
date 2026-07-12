import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoryTimeline } from "@/components/shared/history-timeline";

interface PageProps {
  searchParams: Promise<{
    action?: string;
    assetId?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const { action, assetId } = await searchParams;

  const where: Record<string, unknown> = {};
  if (action) where.action = action;
  if (assetId) where.assetId = assetId;

  const [entries, actions, assets] = await Promise.all([
    db.historyEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        performedBy: { select: { firstName: true, lastName: true } },
        asset: { select: { id: true, name: true } },
      },
    }),
    db.historyEntry.groupBy({
      by: ["action"],
      _count: { action: true },
      orderBy: { _count: { action: "desc" } },
    }),
    db.asset.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">History Timeline</h1>
        <p className="text-muted-foreground">
          Chronological log of all system activity
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-3">
            <select
              name="action"
              defaultValue={action || ""}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="">All Actions</option>
              {actions.map((a) => (
                <option key={a.action} value={a.action}>
                  {a.action.replace(/_/g, " ")} ({a._count.action})
                </option>
              ))}
            </select>
            <select
              name="assetId"
              defaultValue={assetId || ""}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="">All Assets</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Filter
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <HistoryTimeline entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
