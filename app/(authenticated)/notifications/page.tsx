import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { markAsRead, markAllAsRead } from "@/actions/notifications";

export default async function NotificationsPage() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllAsRead}>
            <Button type="submit" variant="outline" size="sm">
              <CheckCheck className="size-4" />
              Mark All Read
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You'll see notifications here when something needs your attention."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.isRead ? "opacity-60" : ""}
            >
              <CardContent className="flex items-start justify-between p-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <span className="size-2 rounded-full bg-primary" />
                    )}
                    <span className="font-medium">{notification.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {notification.link && (
                    <Link href={notification.link}>
                      <Button variant="ghost" size="icon-sm">
                        <ExternalLink className="size-4" />
                      </Button>
                    </Link>
                  )}
                  {!notification.isRead && (
                    <form action={markAsRead.bind(null, notification.id)}>
                      <Button type="submit" variant="ghost" size="icon-sm">
                        <CheckCheck className="size-4" />
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
