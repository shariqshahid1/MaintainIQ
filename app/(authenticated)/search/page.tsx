import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchResults, type AssetResult, type IssueResult } from "@/components/shared/search-results";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    categoryId?: string;
    locationId?: string;
    status?: string;
    priority?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  const query = params.q?.trim() || "";

  const [categories, locations] = await Promise.all([
    db.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.location.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  let assets: AssetResult[] = [];
  let issues: IssueResult[] = [];

  if (query) {
    const assetWhere: Record<string, unknown> = {
      isDeleted: false,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { assetCode: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { serialNumber: { contains: query, mode: "insensitive" } },
        { model: { contains: query, mode: "insensitive" } },
        { manufacturer: { contains: query, mode: "insensitive" } },
      ],
    };

    if (params.categoryId) assetWhere.categoryId = params.categoryId;
    if (params.locationId) assetWhere.locationId = params.locationId;
    if (params.status) assetWhere.status = params.status;
    if (params.from || params.to) {
      const dateFilter: Record<string, Date> = {};
      if (params.from) dateFilter.gte = new Date(params.from);
      if (params.to) dateFilter.lte = new Date(params.to);
      assetWhere.createdAt = dateFilter;
    }

    const issueWhere: Record<string, unknown> = {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { issueNumber: { contains: query, mode: "insensitive" } },
      ],
    };

    if (params.priority) issueWhere.priority = params.priority;
    if (params.status) issueWhere.status = params.status;

    [assets, issues] = await Promise.all([
      db.asset.findMany({
        where: assetWhere,
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true } },
          location: { select: { name: true } },
        },
      }),
      db.issue.findMany({
        where: issueWhere,
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          asset: { select: { name: true } },
        },
      }),
    ]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-muted-foreground">
          Find assets and issues across the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="flex gap-3">
              <Input
                name="q"
                defaultValue={query}
                placeholder="Search assets and issues..."
                className="flex-1"
              />
              <Button type="submit">Search</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                name="categoryId"
                defaultValue={params.categoryId || ""}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                name="locationId"
                defaultValue={params.locationId || ""}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="">All Locations</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <select
                name="status"
                defaultValue={params.status || ""}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="OPERATIONAL">Operational</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
                <option value="RETIRED">Retired</option>
              </select>
              <select
                name="priority"
                defaultValue={params.priority || ""}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
              <input
                type="date"
                name="from"
                defaultValue={params.from || ""}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                placeholder="From"
              />
              <input
                type="date"
                name="to"
                defaultValue={params.to || ""}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                placeholder="To"
              />
            </div>
          </form>
        </CardContent>
      </Card>

      <SearchResults
        query={query}
        assets={assets}
        issues={issues}
      />
    </div>
  );
}
