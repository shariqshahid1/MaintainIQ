import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { STATUS_COLORS, CONDITION_COLORS } from "@/lib/constants";
import { MapPin, Tag, User, ArrowUpRight, QrCode } from "lucide-react";

interface AssetCardProps {
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
  };
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const statusDotColor: Record<string, string> = {
  OPERATIONAL: "bg-emerald-500",
  UNDER_MAINTENANCE: "bg-amber-500",
  OUT_OF_SERVICE: "bg-red-500",
  RETIRED: "bg-gray-400",
};

export function AssetCard({ asset }: AssetCardProps) {
  return (
    <Link href={`/assets/${asset.id}`}>
      <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 cursor-pointer h-full border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`size-2 shrink-0 rounded-full ${statusDotColor[asset.status] || "bg-gray-400"}`}
                  />
                  <h3 className="truncate text-sm font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {asset.name}
                  </h3>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <QrCode className="size-3 text-muted-foreground" />
                  <span className="font-mono text-xs text-muted-foreground">
                    {asset.assetCode}
                  </span>
                </div>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[asset.status] ?? "bg-gray-100 text-gray-800"}`}
              >
                {formatLabel(asset.status)}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CONDITION_COLORS[asset.condition] ?? "bg-gray-100 text-gray-800"}`}
              >
                {formatLabel(asset.condition)}
              </span>
            </div>
          </div>

          <div className="border-t bg-muted/30 px-5 py-3">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {asset.category && (
                <div className="flex items-center gap-1.5">
                  <Tag className="size-3 shrink-0" />
                  <span className="truncate">{asset.category.name}</span>
                </div>
              )}
              {asset.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{asset.location.name}</span>
                </div>
              )}
              {asset.assignedTo && (
                <div className="flex items-center gap-1.5">
                  <User className="size-3 shrink-0" />
                  <span className="truncate">
                    {asset.assignedTo.firstName || asset.assignedTo.lastName
                      ? `${asset.assignedTo.firstName ?? ""} ${asset.assignedTo.lastName ?? ""}`.trim()
                      : "Assigned"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
