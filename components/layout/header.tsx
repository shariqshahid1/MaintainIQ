"use client";

import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Bell, Search, Command } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/assets": "Assets",
  "/issues": "Issues",
  "/maintenance": "Maintenance",
  "/history": "History",
  "/search": "Search",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const title =
    pageTitles[pathname] ||
    (pathname.startsWith("/assets/")
      ? "Asset Detail"
      : pathname.startsWith("/issues/")
        ? "Issue Detail"
        : pathname.startsWith("/maintenance/")
          ? "Maintenance Detail"
          : "MaintainIQ");

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 px-6 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
          Workspace
        </p>
        <span className="text-muted-foreground/40">/</span>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/search"
          className="group flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-muted"
        >
          <Search className="size-4 transition-colors group-hover:text-primary" />
          <span className="hidden sm:inline">Search…</span>
          <kbd className="ml-1 hidden items-center gap-0.5 rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-mono sm:inline-flex">
            <Command className="size-2.5" />K
          </kbd>
        </Link>

        <Link
          href="/notifications"
          className="relative rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-[18px]" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
        </Link>
        <ThemeToggle />
        <div className="ml-1 rounded-full ring-2 ring-border transition-shadow hover:ring-primary/30">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-9",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
