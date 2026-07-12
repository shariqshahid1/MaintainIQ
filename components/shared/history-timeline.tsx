import {
  FilePen,
  UserPlus,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ArrowLeftRight,
  LucideIcon,
  Clock,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const actionIcons: Record<string, LucideIcon> = {
  created: FilePen,
  edited: FilePen,
  assigned: UserPlus,
  unassigned: ArrowLeftRight,
  maintenance_created: Wrench,
  issue_reported: AlertTriangle,
  issue_resolved: CheckCircle2,
  status_changed: ArrowLeftRight,
  default: History,
};

const actionColors: Record<string, string> = {
  created: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  edited: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  assigned: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  unassigned: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  maintenance_created: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  issue_reported: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  issue_resolved: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  status_changed: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  default: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
};

interface HistoryEntry {
  id: string;
  action: string;
  description: string | null;
  createdAt: Date;
  performedBy: {
    firstName: string | null;
    lastName: string | null;
  } | null;
}

interface HistoryTimelineProps {
  entries: HistoryEntry[];
}

export function HistoryTimeline({ entries }: HistoryTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="mb-2 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No history entries yet</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {entries.map((entry, index) => {
        const Icon =
          actionIcons[entry.action] || actionIcons.default;
        const colorClass =
          actionColors[entry.action] || actionColors.default;
        const isLast = index === entries.length - 1;
        const actorName = entry.performedBy
          ? [entry.performedBy.firstName, entry.performedBy.lastName]
              .filter(Boolean)
              .join(" ") || "Unknown"
          : "System";

        return (
          <div key={entry.id} className="relative flex gap-4 pb-8">
            {!isLast && (
              <div className="absolute left-[19px] top-10 h-full w-px bg-border" />
            )}
            <div className={cn("relative flex size-10 shrink-0 items-center justify-center rounded-full", colorClass)}>
              <Icon className="size-4" />
            </div>
            <div className="flex-1 space-y-1 pt-1.5">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{actorName}</span>
                <span className="text-muted-foreground">
                  {entry.action.replace(/_/g, " ")}
                </span>
              </div>
              {entry.description && (
                <p className="text-sm text-muted-foreground">
                  {entry.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(entry.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
