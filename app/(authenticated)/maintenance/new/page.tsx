import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";

export default async function NewMaintenancePage() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const [assets, issues] = await Promise.all([
    db.asset.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true, assetCode: true },
      orderBy: { name: "asc" },
    }),
    db.issue.findMany({
      where: { status: { notIn: ["RESOLVED", "CLOSED"] } },
      select: { id: true, title: true, issueNumber: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Maintenance Record</h1>
        <p className="text-muted-foreground">
          Log a completed maintenance activity
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <MaintenanceForm assets={assets} issues={issues} />
        </CardContent>
      </Card>
    </div>
  );
}
