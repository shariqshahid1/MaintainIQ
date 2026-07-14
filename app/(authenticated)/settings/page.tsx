import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Shield, Mail, Phone, Calendar, Tags, MapPin } from "lucide-react";
import { format } from "date-fns";
import { RoleSwitcher, CategoryManager, LocationManager } from "@/components/settings/management";

export default async function SettingsPage() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const [categories, locations] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.location.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((n) => n!.charAt(0).toUpperCase())
    .join("") || "U";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, role, and reference data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-medium">
                {[user.firstName, user.lastName].filter(Boolean).join(" ") || "User"}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Shield className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Mail className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <Phone className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{user.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Calendar className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium">
                  {format(new Date(user.createdAt), "MMMM yyyy")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-4" />
            Role & Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RoleSwitcher currentRole={user.role} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="size-4" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryManager categories={categories} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-4" />
              Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LocationManager locations={locations} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
