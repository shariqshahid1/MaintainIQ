"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wrench } from "lucide-react";

interface Tech {
  id: string;
  firstName: string | null;
  lastName: string | null;
  assignedIssues: { id: string; priority: string }[];
}

function getInitials(firstName: string | null, lastName: string | null) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
}

export function TechnicianWorkload({ technicians }: { technicians: Tech[] }) {
  if (technicians.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-2xl bg-muted p-4">
          <Wrench className="size-8 text-muted-foreground" />
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          No technicians assigned
        </p>
        <p className="text-xs text-muted-foreground">
          Assign technicians to see their workload
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {technicians.map((tech) => {
        const critical = tech.assignedIssues.filter(
          (i) => i.priority === "CRITICAL" || i.priority === "EMERGENCY"
        ).length;
        const total = tech.assignedIssues.length;
        const percentage = Math.min((total / 10) * 100, 100);

        return (
          <div
            key={tech.id}
            className="group rounded-xl p-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-9 border-2 border-indigo-100 dark:border-indigo-900/50">
                <AvatarFallback className="bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {getInitials(tech.firstName, tech.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">
                    {tech.firstName} {tech.lastName}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {critical > 0 && (
                      <Badge
                        variant="destructive"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {critical}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {total}
                    </Badge>
                  </div>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
