import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, CONDITION_COLORS } from "@/lib/constants";
import { QrCode, AlertTriangle, MapPin, Calendar, Wrench, History } from "lucide-react";
import { format } from "date-fns";

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const asset = await db.asset.findUnique({
    where: { assetCode: code },
    select: { name: true, assetCode: true },
  });

  if (!asset) {
    return { title: "Asset Not Found" };
  }

  return {
    title: `${asset.name} (${asset.assetCode}) - MaintainIQ`,
    description: `Public information for asset ${asset.name}`,
  };
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ");
}

function formatCondition(condition: string): string {
  return condition.charAt(0) + condition.slice(1).toLowerCase();
}

// Only status-level lifecycle events are safe to show on a public page.
const PUBLIC_SAFE_ACTIONS = [
  "ASSET_CREATED",
  "STATUS_RESOLVED",
  "STATUS_CLOSED",
  "STATUS_REOPENED",
  "MAINTENANCE_CREATED",
];

const ACTION_LABELS: Record<string, string> = {
  ASSET_CREATED: "Asset registered",
  STATUS_RESOLVED: "Issue resolved",
  STATUS_CLOSED: "Issue closed",
  STATUS_REOPENED: "Issue reopened",
  MAINTENANCE_CREATED: "Maintenance performed",
};

export default async function PublicAssetPage({ params }: Props) {
  const { code } = await params;

  const asset = await db.asset.findUnique({
    where: { assetCode: code },
    select: {
      id: true,
      name: true,
      assetCode: true,
      status: true,
      condition: true,
      lastServiceDate: true,
      nextServiceDate: true,
      imageUrl: true,
      category: {
        select: { name: true, icon: true },
      },
      location: {
        select: { name: true, building: true, floor: true, room: true },
      },
    },
  });

  if (!asset) {
    notFound();
  }

  const recentActivity = await db.historyEntry.findMany({
    where: { assetId: asset.id, action: { in: PUBLIC_SAFE_ACTIONS } },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { action: true, createdAt: true },
  });

  const qrApiUrl = `/api/qr/${asset.id}`;
  const locationParts = [
    asset.location?.building,
    asset.location?.floor,
    asset.location?.room,
  ].filter(Boolean);

  return (
    <div className="bg-muted/30">
      <header className="border-b border-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
          <QrCode className="size-6 text-white" />
          <span className="text-lg font-semibold text-white">MaintainIQ</span>
          <span className="ml-auto rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
            Public Asset Page
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {asset.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Asset Code:{" "}
                <span className="font-mono font-medium text-foreground">
                  {asset.assetCode}
                </span>
              </p>
            </div>
            <Badge
              className={cn(
                "shrink-0 text-xs font-semibold",
                STATUS_COLORS[asset.status]
              )}
            >
              {formatStatus(asset.status)}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Asset Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="mt-1">
                      <Badge variant="secondary">
                        {formatStatus(asset.status)}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Condition</dt>
                    <dd className="mt-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-semibold",
                          CONDITION_COLORS[asset.condition]
                        )}
                      >
                        {formatCondition(asset.condition)}
                      </Badge>
                    </dd>
                  </div>
                  {asset.category && (
                    <div>
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="mt-1 font-medium">
                        {asset.category.name}
                      </dd>
                    </div>
                  )}
                  {(asset.location || locationParts.length > 0) && (
                    <div>
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="mt-1 flex items-center gap-1.5 font-medium">
                        <MapPin className="size-3.5 text-muted-foreground" />
                        {asset.location?.name ||
                          locationParts.join(", ")}
                      </dd>
                    </div>
                  )}
                  {asset.lastServiceDate && (
                    <div>
                      <dt className="text-muted-foreground">
                        Last Service
                      </dt>
                      <dd className="mt-1 flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        {new Date(
                          asset.lastServiceDate
                        ).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {asset.nextServiceDate && (
                    <div>
                      <dt className="text-muted-foreground">
                        Next Service
                      </dt>
                      <dd className="mt-1 flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        {new Date(
                          asset.nextServiceDate
                        ).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Link href={`/public/report/${asset.assetCode}`}>
                  <Button className="w-full gap-2" size="lg">
                    <AlertTriangle className="size-4" />
                    Report an Issue
                  </Button>
                </Link>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Found a problem with this asset? Let us know — no login required.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="size-4" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No public activity recorded yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {recentActivity.map((entry) => (
                      <li
                        key={entry.createdAt.toISOString() + entry.action}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="font-medium">
                          {ACTION_LABELS[entry.action] ?? entry.action}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(entry.createdAt, "MMM d, yyyy")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="size-4" />
                  QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrApiUrl}
                  alt={`QR code for ${asset.assetCode}`}
                  className="rounded-lg border bg-white p-2"
                  width={200}
                  height={200}
                />
                <p className="text-center text-xs text-muted-foreground">
                  Scan to view asset details
                </p>
              </CardContent>
            </Card>

            {asset.imageUrl && (
              <Card>
                <CardContent className="pt-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.imageUrl}
                    alt={asset.name}
                    className="w-full rounded-lg object-cover"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t bg-background py-6 text-center text-xs text-muted-foreground">
        Powered by MaintainIQ
      </footer>
    </div>
  );
}
