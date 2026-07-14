import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { STATUS_COLORS, CONDITION_COLORS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Tag,
  User,
  Calendar,
  DollarSign,
  Hash,
  Cpu,
  Building2,
  Wrench,
  AlertTriangle,
  Clock,
  HeartPulse,
  TrendingDown,
} from "lucide-react";
import { deleteAsset } from "@/actions/assets";
import { QrPreview } from "@/components/assets/qr-preview";

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Lightweight, deterministic health model (no extra API calls). Combines
// asset status, condition, open-issue load, and service recency into a 0-100
// score with a qualitative label.
function computeAssetHealth(
  asset: { status: string; condition: string; lastServiceDate: Date | string | null },
  openIssues: number
): { score: number; label: string; color: string } {
  let score = 100;

  if (asset.status === "OUT_OF_SERVICE") score -= 45;
  else if (asset.status === "UNDER_MAINTENANCE") score -= 18;

  if (asset.condition === "CRITICAL") score -= 30;
  else if (asset.condition === "POOR") score -= 20;
  else if (asset.condition === "FAIR") score -= 10;

  score -= Math.min(openIssues * 6, 30);

  if (asset.lastServiceDate) {
    const days = (Date.now() - new Date(asset.lastServiceDate).getTime()) / 86_400_000;
    if (days > 365) score -= 15;
    else if (days > 180) score -= 8;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label = "Excellent";
  let color = "text-emerald-600 dark:text-emerald-400";
  if (score < 50) {
    label = "Critical";
    color = "text-red-600 dark:text-red-400";
  } else if (score < 70) {
    label = "At Risk";
    color = "text-amber-600 dark:text-amber-400";
  } else if (score < 90) {
    label = "Good";
    color = "text-sky-600 dark:text-sky-400";
  }

  return { score, label, color };
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;

  const asset = await db.asset.findUnique({
    where: { id },
    include: {
      category: true,
      location: true,
      assignedTo: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
        },
      },
      issues: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          reportedBy: {
            select: { firstName: true, lastName: true },
          },
        },
      },
      maintenanceRecords: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          performedBy: {
            select: { firstName: true, lastName: true },
          },
        },
      },
      historyEntries: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          performedBy: {
            select: { firstName: true, lastName: true },
          },
        },
      },
    },
  });

  if (!asset || asset.isDeleted) {
    notFound();
  }

  // AI-style insights: health score + repeated-failure detection.
  const issueStats = await db.issue.findMany({
    where: { assetId: id },
    select: { status: true, priority: true, category: { select: { name: true } } },
  });

  const openIssueCount = issueStats.filter(
    (i) => !["RESOLVED", "CLOSED"].includes(i.status)
  ).length;

  const repeatedCategories = Object.entries(
    issueStats.reduce<Record<string, number>>((acc, i) => {
      const name = i.category?.name ?? "Uncategorized";
      acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    }, {})
  )
    .filter(([, count]) => count >= 2)
    .map(([name]) => name);

  const health = computeAssetHealth(asset, openIssueCount);


  const infoItems = [
    { icon: Hash, label: "Asset Code", value: asset.assetCode },
    { icon: Tag, label: "Category", value: asset.category?.name ?? "-" },
    { icon: MapPin, label: "Location", value: asset.location?.name ?? "-" },
    {
      icon: User,
      label: "Assigned To",
      value: asset.assignedTo
        ? `${asset.assignedTo.firstName ?? ""} ${asset.assignedTo.lastName ?? ""}`.trim() || asset.assignedTo.email
        : "-",
    },
    { icon: Cpu, label: "Serial Number", value: asset.serialNumber ?? "-" },
    { icon: Building2, label: "Manufacturer", value: asset.manufacturer ?? "-" },
    { icon: Wrench, label: "Model", value: asset.model ?? "-" },
    { icon: Calendar, label: "Purchase Date", value: formatDate(asset.purchaseDate) },
    { icon: DollarSign, label: "Purchase Price", value: formatCurrency(asset.purchasePrice) },
  ];

  const assetId = asset.id;

  async function handleDelete() {
    "use server";
    await deleteAsset(assetId);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/assets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{asset.name}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[asset.status] ?? ""}`}
              >
                {formatLabel(asset.status)}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CONDITION_COLORS[asset.condition] ?? ""}`}
              >
                {formatLabel(asset.condition)}
              </span>
            </div>
            <p className="text-muted-foreground">
              Created {formatDate(asset.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/assets/${asset.id}/edit`}>
            <Button variant="outline">
              <Pencil className="size-4" />
              Edit
            </Button>
          </Link>
          <form action={handleDelete}>
            <Button variant="destructive" type="submit">
              <Trash2 className="size-4" />
              Delete
            </Button>
          </form>
        </div>
      </div>

      {asset.description && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">{asset.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="info">
            <TabsList variant="line">
              <TabsTrigger value="info">Details</TabsTrigger>
              <TabsTrigger value="issues">
                Issues ({asset.issues.length})
              </TabsTrigger>
              <TabsTrigger value="maintenance">
                Maintenance ({asset.maintenanceRecords.length})
              </TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    {infoItems.map((item) => (
                      <div key={item.label} className="flex items-start gap-3">
                        <item.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            {item.label}
                          </dt>
                          <dd className="text-sm font-medium">{item.value}</dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="issues" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Issue History</CardTitle>
                </CardHeader>
                <CardContent>
                  {asset.issues.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <AlertTriangle className="size-8 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No issues reported for this asset
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {asset.issues.map((issue: { id: string; title: string; issueNumber: string; status: string; createdAt: Date; reportedBy: { firstName?: string | null; lastName?: string | null } }) => (
                        <div
                          key={issue.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {issue.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {issue.issueNumber} &middot; Reported by{" "}
                              {issue.reportedBy.firstName || issue.reportedBy.lastName
                                ? `${issue.reportedBy.firstName ?? ""} ${issue.reportedBy.lastName ?? ""}`.trim()
                                : "Unknown"}{" "}
                              &middot; {formatDate(issue.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`ml-4 shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[issue.status] ?? ""}`}
                          >
                            {formatLabel(issue.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance History</CardTitle>
                </CardHeader>
                <CardContent>
                  {asset.maintenanceRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Wrench className="size-8 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No maintenance records for this asset
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {asset.maintenanceRecords.map((record: { id: string; title: string; type: string; description?: string | null; cost?: number | null; completedAt?: Date | null; createdAt: Date; performedBy: { firstName?: string | null; lastName?: string | null } }) => (
                        <div
                          key={record.id}
                          className="rounded-lg border p-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{record.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatLabel(record.type)} &middot; Performed by{" "}
                                {record.performedBy.firstName || record.performedBy.lastName
                                  ? `${record.performedBy.firstName ?? ""} ${record.performedBy.lastName ?? ""}`.trim()
                                  : "Unknown"}{" "}
                                &middot; {formatDate(record.completedAt ?? record.createdAt)}
                              </p>
                            </div>
                            {record.cost !== null && record.cost !== undefined && (
                              <span className="ml-4 shrink-0 text-sm font-medium text-muted-foreground">
                                {formatCurrency(record.cost)}
                              </span>
                            )}
                          </div>
                          {record.description && (
                            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                              {record.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {asset.historyEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Clock className="size-8 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No activity recorded yet
                      </p>
                    </div>
                  ) : (
                    <div className="relative ml-3 border-l-2 border-muted pl-6 space-y-6">
                      {asset.historyEntries.map((entry: { id: string; action: string; description?: string | null; createdAt: Date; performedBy: { firstName?: string | null; lastName?: string | null } }) => (
                        <div key={entry.id} className="relative">
                          <div className="absolute -left-[31px] top-1 size-3 rounded-full border-2 border-muted bg-background" />
                          <div>
                            <p className="text-sm font-medium">{entry.action}</p>
                            {entry.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {entry.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {entry.performedBy.firstName || entry.performedBy.lastName
                                ? `${entry.performedBy.firstName ?? ""} ${entry.performedBy.lastName ?? ""}`.trim()
                                : "Unknown"}{" "}
                              &middot; {formatDate(entry.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <QrPreview
            assetId={asset.id}
            assetCode={asset.assetCode}
            assetName={asset.name}
          />

          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <HeartPulse className="size-4 text-rose-500" />
                Asset Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative flex size-20 items-center justify-center rounded-full border-4 border-muted">
                  <span className={`text-2xl font-bold ${health.color}`}>
                    {health.score}
                  </span>
                </div>
                <div>
                  <p className={`text-sm font-semibold ${health.color}`}>
                    {health.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Based on status, condition, open issues & service history
                  </p>
                </div>
              </div>

              {repeatedCategories.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    <TrendingDown className="size-3.5" />
                    Repeated failure detected
                  </p>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                    Recurring issues in: {repeatedCategories.join(", ")}.
                    Consider a root-cause review.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {(asset.lastServiceDate || asset.nextServiceDate || asset.warrantyExpiry) && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {asset.lastServiceDate && (
                  <div>
                    <p className="text-xs text-muted-foreground">Last Service</p>
                    <p className="text-sm font-medium">
                      {formatDate(asset.lastServiceDate)}
                    </p>
                  </div>
                )}
                {asset.nextServiceDate && (
                  <div>
                    <p className="text-xs text-muted-foreground">Next Service</p>
                    <p className="text-sm font-medium">
                      {formatDate(asset.nextServiceDate)}
                    </p>
                  </div>
                )}
                {asset.warrantyExpiry && (
                  <div>
                    <p className="text-xs text-muted-foreground">Warranty Expiry</p>
                    <p className="text-sm font-medium">
                      {formatDate(asset.warrantyExpiry)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {asset.assignedTo && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Technician</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {asset.assignedTo.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.assignedTo.avatarUrl}
                      alt=""
                      className="size-10 rounded-full"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {(asset.assignedTo.firstName?.[0] ?? asset.assignedTo.lastName?.[0] ?? "?").toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {asset.assignedTo.firstName || asset.assignedTo.lastName
                        ? `${asset.assignedTo.firstName ?? ""} ${asset.assignedTo.lastName ?? ""}`.trim()
                        : "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {asset.assignedTo.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
