"use server";

import { requireAuth, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { refresh } from "next/cache";
import { categorySchema, locationSchema } from "@/lib/validators";
import type { UserRole } from "@/app/generated/prisma/client";

/**
 * Demo affordance: lets the signed-in user switch their own role so the
 * RBAC model can be explored without a separate admin console. In a real
 * deployment this would be restricted to administrators.
 */
export async function updateMyRole(formData: FormData) {
  const user = await requireAuth();
  const role = formData.get("role") as UserRole;
  const allowed: UserRole[] = [
    "ADMINISTRATOR",
    "TECHNICIAN",
    "REPORTER",
    "SUPERVISOR",
  ];
  if (!allowed.includes(role)) {
    throw new Error("Invalid role");
  }

  await db.user.update({ where: { id: user.id }, data: { role } });
  refresh();
  return { success: true };
}

export async function createCategory(formData: FormData) {
  await requireRole("ADMINISTRATOR");

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    icon: (formData.get("icon") as string) || undefined,
  };
  const validated = categorySchema.safeParse(raw);
  if (!validated.success) {
    throw new Error("Invalid category");
  }

  await db.category.create({ data: validated.data });
  refresh();
  return { success: true };
}

export async function createLocation(formData: FormData) {
  await requireRole("ADMINISTRATOR");

  const raw = {
    name: formData.get("name") as string,
    building: (formData.get("building") as string) || undefined,
    floor: (formData.get("floor") as string) || undefined,
    room: (formData.get("room") as string) || undefined,
    latitude: formData.get("latitude")
      ? Number(formData.get("latitude"))
      : undefined,
    longitude: formData.get("longitude")
      ? Number(formData.get("longitude"))
      : undefined,
  };
  const validated = locationSchema.safeParse(raw);
  if (!validated.success) {
    throw new Error("Invalid location");
  }

  await db.location.create({ data: validated.data });
  refresh();
  return { success: true };
}

export async function listCategoriesLocations() {
  await requireAuth();
  const [categories, locations] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.location.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return { categories, locations };
}
