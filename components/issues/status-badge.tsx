import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";

  return (
    <Badge className={`${colorClass} border-0 font-medium`} variant="outline">
      <span className="size-1.5 rounded-full bg-current" />
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
