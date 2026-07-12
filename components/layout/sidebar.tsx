"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Boxes,
  AlertTriangle,
  Wrench,
  History,
  Search,
  Bell,
  Settings,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Zap,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assets", label: "Assets", icon: Boxes },
  { href: "/issues", label: "Issues", icon: AlertTriangle },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/history", label: "History", icon: History },
  { href: "/search", label: "Search", icon: Search },
];

const workspaceNav = [
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  collapsed,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground shadow-card shadow-primary/25"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <Icon
        className={cn(
          "size-[18px] shrink-0 transition-colors",
          !active && "text-muted-foreground group-hover:text-foreground"
        )}
      />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-card/70 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className="flex items-center gap-3 border-b px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-card shadow-indigo-500/30">
            <QrCode className="size-5 text-white" />
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-card" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">
              Maintain<span className="text-primary">IQ</span>
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-3">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Menu
            </p>
          )}
          {mainNav.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              collapsed={collapsed}
              active={isActive(item.href)}
            />
          ))}
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Workspace
            </p>
          )}
          {workspaceNav.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              collapsed={collapsed}
              active={isActive(item.href)}
            />
          ))}
        </div>
      </nav>

      <div className="space-y-3 p-3">
        {!collapsed && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 p-3.5 text-white shadow-card shadow-indigo-500/25">
            <div className="absolute -right-4 -top-4 size-16 rounded-full bg-white/10" />
            <div className="relative flex items-center gap-2 text-xs font-semibold">
              <Sparkles className="size-4" />
              AI Triage Active
            </div>
            <p className="relative mt-1 text-[11px] text-white/80">
              Gemini is analyzing every reported issue in real time.
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-xl border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
