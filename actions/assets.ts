"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth";
import { generateQrCode } from "@/lib/qr";
import { assetSchema } from "@/lib/validators";

export async function createAsset(formData: FormData) {
  const user = await requireRole("ADMINISTRATOR");

  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    assetCode: formData.get("assetCode") as string,
    status: (formData.get("status") as string) || "OPERATIONAL",
    condition: (formData.get("condition") as string) || "GOOD",
    serialNumber: (formData.get("serialNumber") as string) || undefined,
    model: (formData.get("model") as string) || undefined,
    manufacturer: (formData.get("manufacturer") as string) || undefined,
    purchaseDate: (formData.get("purchaseDate") as string) || undefined,
    purchasePrice: formData.get("purchasePrice")
      ? Number(formData.get("purchasePrice"))
      : undefined,
    categoryId: (formData.get("categoryId") as string) || undefined,
    locationId: (formData.get("locationId") as string) || undefined,
    assignedToId: (formData.get("assignedToId") as string) || undefined,
  };

  const validated = assetSchema.safeParse(rawData);
  if (!validated.success) {
    throw new Error(
      validated.error.flatten().fieldErrors
        ? JSON.stringify(validated.error.flatten().fieldErrors)
        : "Validation failed"
    );
  }

  const existingAsset = await db.asset.findUnique({
    where: { assetCode: validated.data.assetCode },
  });
  if (existingAsset) {
    throw new Error("An asset with this code already exists");
  }

  const qrCodeUrl = await generateQrCode(validated.data.assetCode);

  const asset = await db.asset.create({
    data: {
      name: validated.data.name,
      description: validated.data.description,
      assetCode: validated.data.assetCode,
      status: validated.data.status,
      condition: validated.data.condition,
      serialNumber: validated.data.serialNumber,
      model: validated.data.model,
      manufacturer: validated.data.manufacturer,
      purchaseDate: validated.data.purchaseDate
        ? new Date(validated.data.purchaseDate)
        : undefined,
      purchasePrice: validated.data.purchasePrice,
      qrCodeUrl,
      categoryId: validated.data.categoryId || null,
      locationId: validated.data.locationId || null,
      assignedToId: validated.data.assignedToId || null,
    },
  });

  await db.historyEntry.create({
    data: {
      action: "ASSET_CREATED",
      description: `Asset "${asset.name}" (${asset.assetCode}) was created`,
      assetId: asset.id,
      performedById: user.id,
    },
  });

  revalidatePath("/assets");
  redirect(`/assets/${asset.id}`);
}

export async function updateAsset(id: string, formData: FormData) {
  const user = await requireRole("ADMINISTRATOR");

  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    assetCode: formData.get("assetCode") as string,
    status: (formData.get("status") as string) || "OPERATIONAL",
    condition: (formData.get("condition") as string) || "GOOD",
    serialNumber: (formData.get("serialNumber") as string) || undefined,
    model: (formData.get("model") as string) || undefined,
    manufacturer: (formData.get("manufacturer") as string) || undefined,
    purchaseDate: (formData.get("purchaseDate") as string) || undefined,
    purchasePrice: formData.get("purchasePrice")
      ? Number(formData.get("purchasePrice"))
      : undefined,
    categoryId: (formData.get("categoryId") as string) || undefined,
    locationId: (formData.get("locationId") as string) || undefined,
    assignedToId: (formData.get("assignedToId") as string) || undefined,
  };

  const validated = assetSchema.safeParse(rawData);
  if (!validated.success) {
    throw new Error(
      validated.error.flatten().fieldErrors
        ? JSON.stringify(validated.error.flatten().fieldErrors)
        : "Validation failed"
    );
  }

  const existing = await db.asset.findUnique({ where: { id } });
  if (!existing || existing.isDeleted) {
    throw new Error("Asset not found");
  }

  if (existing.assetCode !== validated.data.assetCode) {
    const codeExists = await db.asset.findUnique({
      where: { assetCode: validated.data.assetCode },
    });
    if (codeExists) {
      throw new Error("An asset with this code already exists");
    }
  }

  const asset = await db.asset.update({
    where: { id },
    data: {
      name: validated.data.name,
      description: validated.data.description,
      assetCode: validated.data.assetCode,
      status: validated.data.status,
      condition: validated.data.condition,
      serialNumber: validated.data.serialNumber,
      model: validated.data.model,
      manufacturer: validated.data.manufacturer,
      purchaseDate: validated.data.purchaseDate
        ? new Date(validated.data.purchaseDate)
        : undefined,
      purchasePrice: validated.data.purchasePrice,
      categoryId: validated.data.categoryId || null,
      locationId: validated.data.locationId || null,
      assignedToId: validated.data.assignedToId || null,
    },
  });

  const changes: string[] = [];
  if (existing.status !== asset.status)
    changes.push(`status: ${existing.status} → ${asset.status}`);
  if (existing.condition !== asset.condition)
    changes.push(`condition: ${existing.condition} → ${asset.condition}`);
  if (existing.assignedToId !== asset.assignedToId)
    changes.push("assignment updated");

  await db.historyEntry.create({
    data: {
      action: "ASSET_UPDATED",
      description: changes.length
        ? `Asset "${asset.name}" updated: ${changes.join(", ")}`
        : `Asset "${asset.name}" was updated`,
      assetId: asset.id,
      performedById: user.id,
    },
  });

  revalidatePath("/assets");
  revalidatePath(`/assets/${id}`);
  redirect(`/assets/${id}`);
}

export async function deleteAsset(id: string) {
  const user = await requireRole("ADMINISTRATOR");

  const asset = await db.asset.findUnique({ where: { id } });
  if (!asset || asset.isDeleted) {
    throw new Error("Asset not found");
  }

  await db.asset.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  await db.historyEntry.create({
    data: {
      action: "ASSET_DELETED",
      description: `Asset "${asset.name}" (${asset.assetCode}) was soft deleted`,
      assetId: asset.id,
      performedById: user.id,
    },
  });

  revalidatePath("/assets");
  redirect("/assets");
}
