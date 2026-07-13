import { redirect } from "next/navigation";
import { RevealBlock } from "@/components/shared/motion";
import Link from "next/link";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { AssetStatus } from "@/app/generated/prisma/client";
import { AssetCard } from "@/components/assets/asset-card";
import { AssetTable } from "@/components/assets/asset-table";
import { Button } from "@/components/ui/button";
import {
  Plus,
  LayoutGrid,
  List,
  Boxes,
  Filter,
  X,
} from "lucide-react";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Assets | MaintainIQ",
  description: "Manage your organization's assets",
};

interface AssetsPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    category?: string;
    location?: string;
    view?: string;
  }>;
}

export default async function AssetsPage({ searchParams }: AssetsPageProps) {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status = params.status;
  const category = params.category;
  const location = params.location;
  const view = params.view || "grid";

  const where = {
    isDeleted: false,
    ...(status && status !== "all"
      ? { status: status as AssetStatus }
      : {}),
    ...(category ? { categoryId: category } : {}),
    ...(location ? { locationId: location } : {}),
  };

  const [assets, totalCount] = await Promise.all([
    db.asset.findMany({
      where,
      include: {
        category: { select: { name: true } },
        location: { select: { name: true } },
        assignedTo: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    db.asset.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  function buildPageUrl(p: number, viewOverride?: string) {
    const sp = new URLSearchParams();
    sp.set("page", String(p));
    if (status && status !== "all") sp.set("status", status);
    if (category) sp.set("category", category);
    if (location) sp.set("location", location);
    if (viewOverride) sp.set("view", viewOverride);
    return `/assets?${sp.toString()}`;
  }

  const statusLabels: Record<string, string> = {
    OPERATIONAL: "Operational",
    UNDER_MAINTENANCE: "Under Maintenance",
    OUT_OF_SERVICE: "Out of Service",
    RETIRED: "Retired",
  };

  return (
    <RevealBlock className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} total asset{totalCount !== 1 ? "s" : ""} in the system
          </p>
        </div>
        <Link href="/assets/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20">
            <Plus className="mr-1.5 size-4" />
            New Asset
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-xl border bg-muted/50 p-0.5">
            <Link href={buildPageUrl(1, "grid")}>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                  view === "grid"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="size-3.5" />
                Grid
              </span>
            </Link>
            <Link href={buildPageUrl(1, "table")}>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                  view === "table"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="size-3.5" />
                Table
              </span>
            </Link>
          </div>

          {/* Active Filters */}
          {status && status !== "all" && (
            <Link href={buildPageUrl(1)}>
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Filter className="size-3" />
                {statusLabels[status] || status}
                <X className="size-3" />
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      {view === "grid" ? (
        assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 p-16 text-center">
            <div className="rounded-2xl bg-muted p-4">
              <Boxes className="size-10 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">No assets found</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {status && status !== "all"
                ? "Try adjusting your filters to see more assets."
                : "Get started by adding your first asset to the system."}
            </p>
            <Link href="/assets/new" className="mt-6">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-1.5 size-4" />
                Add First Asset
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {assets.map(
              (
                asset: {
                  id: string;
                  name: string;
                  assetCode: string;
                  status: string;
                  condition: string;
                  category?: { name: string } | null;
                  location?: { name: string } | null;
                  assignedTo?: {
                    firstName?: string | null;
                    lastName?: string | null;
                  } | null;
                }
              ) => <AssetCard key={asset.id} asset={asset} />
            )}
          </div>
        )
      ) : (
        <AssetTable assets={assets} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={buildPageUrl(p)}>
              <Button
                variant={p === page ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "size-9 p-0",
                  p === page && "bg-indigo-600 hover:bg-indigo-700"
                )}
              >
                {p}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </RevealBlock>
  );
}
