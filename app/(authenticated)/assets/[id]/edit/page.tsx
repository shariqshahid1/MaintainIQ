import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { AssetForm } from "@/components/assets/asset-form";
import type { Metadata } from "next";

interface EditAssetPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Asset | MaintainIQ",
  description: "Edit asset details",
};

export default async function EditAssetPage({ params }: EditAssetPageProps) {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;

  const asset = await db.asset.findUnique({ where: { id } });
  if (!asset || asset.isDeleted) {
    notFound();
  }

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
      mode="edit"
      asset={asset}
      categories={categories}
      locations={locations}
      technicians={technicians}
    />
  );
}
