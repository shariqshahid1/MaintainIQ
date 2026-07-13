"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ISSUE_STATUSES, ISSUE_PRIORITIES } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/issues/status-badge";
import { PriorityBadge } from "@/components/issues/priority-badge";
import { Plus, ArrowUpRight, AlertCircle } from "lucide-react";

interface Issue {
  id: string;
  issueNumber: string;
  title: string;
  priority: string;
  status: string;
  createdAt: Date;
  reportedBy: { firstName: string | null; lastName: string | null };
  asset: { name: string };
}

interface IssueTableProps {
  issues: Issue[];
}

export function IssueTable({ issues }: IssueTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "";
  const currentPriority = searchParams.get("priority") ?? "";

  function handleStatusChange(status: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    router.push(`/issues?${params.toString()}`);
  }

  function handlePriorityChange(priority: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (priority) {
      params.set("priority", priority);
    } else {
      params.delete("priority");
    }
    router.push(`/issues?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={currentStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Statuses</SelectItem>
              {ISSUE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currentPriority} onValueChange={handlePriorityChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Priorities</SelectItem>
              {ISSUE_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Link href="/issues/new">
          <Button>
            <Plus className="size-4" />
            New Issue
          </Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Issue #</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Asset</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead>Date</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                No issues found.{" "}
                <Link href="/issues/new" className="text-primary hover:underline">
                  Report a new issue
                </Link>
              </TableCell>
            </TableRow>
          ) : (
            issues.map((issue) => {
              const reporterName =
                `${issue.reportedBy.firstName ?? ""} ${issue.reportedBy.lastName ?? ""}`.trim() ||
                "Unknown";
              const reporterInitial = reporterName.charAt(0).toUpperCase();
              return (
              <TableRow
                key={issue.id}
                className="group transition-colors hover:bg-muted/50"
              >
                <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                  {issue.issueNumber}
                </TableCell>
                <TableCell className="max-w-[260px]">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500/15 to-orange-500/15 text-rose-600 dark:text-rose-300">
                      <AlertCircle className="size-4" />
                    </div>
                    <span className="block truncate font-medium">
                      {issue.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {issue.asset.name}
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={issue.priority} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={issue.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                      {reporterInitial}
                    </div>
                    <span className="text-sm text-muted-foreground">{reporterName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Link href={`/issues/${issue.id}`}>
                    <Button variant="ghost" size="icon-sm" className="opacity-0 transition-opacity group-hover:opacity-100">
                      <ArrowUpRight className="size-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
