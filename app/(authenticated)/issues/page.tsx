import { Suspense } from "react";
import { RevealBlock } from "@/components/shared/motion";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { IssueTable } from "@/components/issues/issue-table";
import { Skeleton } from "@/components/ui/skeleton";

interface IssuesPageProps {
  searchParams: Promise<{
    status?: string;
    priority?: string;
  }>;
}

async function IssuesContent({ searchParams }: IssuesPageProps) {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const { status, priority } = await searchParams;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const issues = await db.issue.findMany({
    where: filter,
    orderBy: { createdAt: "desc" },
    include: {
      asset: { select: { name: true } },
      reportedBy: { select: { firstName: true, lastName: true } },
      assignedTo: { select: { firstName: true, lastName: true } },
      category: { select: { name: true } },
    },
  });

  return <IssueTable issues={issues} />;
}

export default function IssuesPage(props: IssuesPageProps) {
  return (
    <RevealBlock className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Issues</h1>
        <p className="text-muted-foreground">
          Track and manage reported issues across your assets.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <IssuesContent searchParams={props.searchParams} />
      </Suspense>
    </RevealBlock>
  );
}
