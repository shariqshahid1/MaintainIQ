import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Boxes,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  TrendingUp,
  CalendarClock,
  Plus,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { TechnicianWorkload } from "@/components/dashboard/technician-workload";
import { PriorityDistribution } from "@/components/dashboard/priority-distribution";
import { Reveal, RevealItem, RevealBlock } from "@/components/shared/motion";
import { AnimatedCounter } from "@/components/shared/counter";

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  // Compute time boundaries once (outside the query) using date arithmetic
  // instead of Date.now(), which is forbidden inside render by React's purity rule.
  const now = new Date();
  const weekAhead = new Date(now);
  weekAhead.setDate(now.getDate() + 7);

  const [
    totalAssets,
    operationalAssets,
    underMaintenanceAssets,
    outOfServiceAssets,
    openIssues,
    resolvedToday,
    upcomingServices,
    recentHistory,
    technicianStats,
    criticalIssues,
    priorityCounts,
  ] = await Promise.all([
    db.asset.count({ where: { isDeleted: false } }),
    db.asset.count({ where: { isDeleted: false, status: "OPERATIONAL" } }),
    db.asset.count({
      where: { isDeleted: false, status: "UNDER_MAINTENANCE" },
    }),
    db.asset.count({ where: { isDeleted: false, status: "OUT_OF_SERVICE" } }),
    db.issue.count({
      where: { status: { notIn: ["RESOLVED", "CLOSED"] } },
    }),
    db.issue.count({
      where: {
        status: "RESOLVED",
        resolvedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    db.asset.count({
      where: {
        isDeleted: false,
        nextServiceDate: {
          gte: now,
          lte: weekAhead,
        },
      },
    }),
    db.historyEntry.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { asset: true, performedBy: true },
    }),
    db.user.findMany({
      where: { role: "TECHNICIAN", isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        assignedIssues: {
          where: { status: { notIn: ["RESOLVED", "CLOSED"] } },
          select: { id: true, priority: true },
        },
      },
    }),
    db.issue.count({
      where: {
        status: { notIn: ["RESOLVED", "CLOSED"] },
        priority: { in: ["CRITICAL", "EMERGENCY"] },
      },
    }),
    db.issue.groupBy({
      by: ["priority"],
      where: { status: { notIn: ["RESOLVED", "CLOSED"] } },
      _count: true,
    }),
  ]);

  const stats = [
    {
      title: "Total Assets",
      value: totalAssets,
      icon: Boxes,
      gradient: "from-blue-500 to-blue-600",
      shadowColor: "shadow-blue-500/20",
      href: "/assets",
      change: null,
    },
    {
      title: "Operational",
      value: operationalAssets,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-emerald-600",
      shadowColor: "shadow-emerald-500/20",
      href: "/assets?status=OPERATIONAL",
      change: null,
    },
    {
      title: "Under Maintenance",
      value: underMaintenanceAssets,
      icon: Wrench,
      gradient: "from-amber-500 to-orange-500",
      shadowColor: "shadow-amber-500/20",
      href: "/assets?status=UNDER_MAINTENANCE",
      change: null,
    },
    {
      title: "Open Issues",
      value: openIssues,
      icon: AlertTriangle,
      gradient: "from-rose-500 to-red-500",
      shadowColor: "shadow-rose-500/20",
      href: "/issues",
      badge: criticalIssues > 0 ? `${criticalIssues} critical` : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <RevealBlock>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-indigo-500/20 sm:p-8">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-20 size-60 rounded-full bg-white/5" />
        <div className="relative">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Welcome back, {user.firstName || "User"} {user.lastName || ""}
          </h1>
          <p className="mt-2 text-white/80">
            Here&apos;s what&apos;s happening with your operations today.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/assets/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <Plus className="size-4" />
              New Asset
            </Link>
            <Link
              href="/issues/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <AlertTriangle className="size-4" />
              Report Issue
            </Link>
          </div>
        </div>
        </div>
      </RevealBlock>

      {/* Stats Grid */}
      <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <RevealItem key={stat.title}>
            <Link href={stat.href}>
              <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <AnimatedCounter
                      value={stat.value}
                      className="mt-2 block text-3xl font-bold tracking-tight tabular-nums"
                    />
                    {stat.badge && (
                      <span className="mt-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {stat.badge}
                      </span>
                    )}
                  </div>
                  <div
                    className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-3 shadow-lg ${stat.shadowColor}`}
                  >
                    <stat.icon className="size-5 text-white" />
                  </div>
                </div>
              </CardContent>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Card>
            </Link>
          </RevealItem>
        ))}
      </Reveal>

      {/* Secondary Stats */}
      <RevealBlock>
        <div className="grid gap-4 sm:grid-cols-3">
        <Card className="group border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolved Today</p>
              <AnimatedCounter
                value={resolvedToday}
                className="block text-2xl font-bold tabular-nums"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="group border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-orange-100 p-3 dark:bg-orange-900/30">
              <CalendarClock className="size-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Upcoming Services
              </p>
              <AnimatedCounter
                value={upcomingServices}
                className="block text-2xl font-bold tabular-nums"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="group border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30">
              <Activity className="size-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Out of Service
              </p>
              <AnimatedCounter
                value={outOfServiceAssets}
                className="block text-2xl font-bold tabular-nums"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      </RevealBlock>

      {/* Main Content Grid */}
      <RevealBlock>
        <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Link
                href="/history"
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <RecentActivity entries={recentHistory} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Technician Workload
                </CardTitle>
                <Link
                  href="/issues"
                  className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                >
                  View Issues
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <TechnicianWorkload technicians={technicianStats} />
            </CardContent>
          </Card>

          <PriorityDistribution counts={priorityCounts} />
        </div>
      </div>
      </RevealBlock>
    </div>
  );
}
