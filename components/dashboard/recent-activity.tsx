"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  Plus,
  Pencil,
  ArrowRightLeft,
  Wrench,
  CheckCircle2,
  UserPlus,
  XCircle,
} from "lucide-react";
import type { HistoryEntry, Asset, User } from "@/app/generated/prisma/client";

interface Entry extends HistoryEntry {
  asset: Asset;
  performedBy: User;
}

function getActionIcon(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes("create") || lower.includes("added"))
    return { icon: Plus, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" };
  if (lower.includes("edit") || lower.includes("update"))
    return { icon: Pencil, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" };
  if (lower.includes("assign"))
    return { icon: UserPlus, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" };
  if (lower.includes("maintenance") || lower.includes("repair"))
    return { icon: Wrench, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400" };
  if (lower.includes("resolve") || lower.includes("complete"))
    return { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" };
  if (lower.includes("reopen") || lower.includes("reject"))
    return { icon: XCircle, color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400" };
  if (lower.includes("status") || lower.includes("change"))
    return { icon: ArrowRightLeft, color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400" };
  return { icon: Activity, color: "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400" };
}

export function RecentActivity({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-2xl bg-muted p-4">
          <Activity className="size-8 text-muted-foreground" />
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          No recent activity
        </p>
        <p className="text-xs text-muted-foreground">
          Actions will appear here as they happen
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {entries.map((entry) => {
        const { icon: ActionIcon, color } = getActionIcon(entry.action);
        return (
          <div
            key={entry.id}
            className="group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50"
          >
            <div className={`mt-0.5 rounded-lg p-1.5 ${color}`}>
              <ActionIcon className="size-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{entry.action}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="truncate">{entry.asset.name}</span>
                <span>·</span>
                <span>
                  {entry.performedBy.firstName} {entry.performedBy.lastName}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap tabular-nums">
              {formatDistanceToNow(new Date(entry.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
