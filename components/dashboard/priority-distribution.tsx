"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";

interface PriorityCount {
  priority: string;
  _count: number;
}

const priorityConfig: Record<
  string,
  { label: string; color: string; bgClass: string }
> = {
  EMERGENCY: {
    label: "Emergency",
    color: "#dc2626",
    bgClass: "bg-red-600",
  },
  CRITICAL: {
    label: "Critical",
    color: "#ea580c",
    bgClass: "bg-orange-500",
  },
  HIGH: {
    label: "High",
    color: "#d97706",
    bgClass: "bg-amber-500",
  },
  MEDIUM: {
    label: "Medium",
    color: "#2563eb",
    bgClass: "bg-blue-500",
  },
  LOW: {
    label: "Low",
    color: "#16a34a",
    bgClass: "bg-emerald-500",
  },
};

export function PriorityDistribution({ counts }: { counts: PriorityCount[] }) {
  const total = counts.reduce((sum, c) => sum + c._count, 0);

  if (total === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-2xl bg-muted p-4">
              <PieChart className="size-8 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">No open issues</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...counts].sort((a, b) => {
    const order = ["EMERGENCY", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
    return order.indexOf(a.priority) - order.indexOf(b.priority);
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Priority Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.map((item) => {
            const config = priorityConfig[item.priority] || {
              label: item.priority,
              color: "#6b7280",
              bgClass: "bg-gray-500",
            };
            const pct = Math.round((item._count / total) * 100);
            return (
              <div key={item.priority}>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-2.5 rounded-full ${config.bgClass}`}
                    />
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <span className="text-muted-foreground tabular-nums">
                    {item._count} ({pct}%)
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${config.bgClass} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
