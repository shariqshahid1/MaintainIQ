import { Badge } from "@/components/ui/badge";
import { PRIORITY_COLORS } from "@/lib/constants";

interface PriorityBadgeProps {
  priority: string;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colorClass = PRIORITY_COLORS[priority] ?? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";

  return (
    <Badge className={`${colorClass} border-0 font-medium`} variant="outline">
      {priority}
    </Badge>
  );
}
