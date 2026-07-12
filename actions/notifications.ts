"use server";

import { refresh } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  link?: string
) {
  await db.notification.create({
    data: { userId, title, message, type, link },
  });
  refresh();
}

export async function markAsRead(id: string) {
  await requireAuth();
  await db.notification.update({
    where: { id },
    data: { isRead: true },
  });
  refresh();
}

export async function markAllAsRead() {
  const user = await requireAuth();
  await db.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  refresh();
}
