import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { AssetForm } from "@/components/assets/asset-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Asset | MaintainIQ",
  description: "Create a new asset",
};

export default async function NewAssetPage() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const [categories, locations, technicians] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.location.findMany({ orderBy: { name: "asc" } }),
    db.user.findMany({
      where: { role: "TECHNICIAN", isActive: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
  ]);

  return (
    <AssetForm
      mode="create"
      categories={categories}
      locations={locations}
      technicians={technicians}
    />
  );
}
