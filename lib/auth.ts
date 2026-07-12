import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { UserRole } from "@/app/generated/prisma/client";

const VALID_ROLES: readonly UserRole[] = [
  "ADMINISTRATOR",
  "TECHNICIAN",
  "REPORTER",
  "SUPERVISOR",
];

// Reads the role assigned in Clerk (dashboard / API). Falls back to REPORTER
// so a brand-new account is safe by default. Once a DB record exists, the DB
// remains the source of truth (so the in-app role switcher persists).
function roleFromClerkMetadata(metadata: unknown): UserRole {
  const role = (metadata as { role?: string } | undefined)?.role;
  return VALID_ROLES.includes(role as UserRole)
    ? (role as UserRole)
    : "REPORTER";
}

export async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) return null;

  let user = await db.user.findUnique({ where: { clerkId: userId } });

  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    user = await db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        avatarUrl: clerkUser.imageUrl,
        role: roleFromClerkMetadata(clerkUser.publicMetadata),
      },
    });
  }

  return user;
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) throw new Error("Forbidden");
  return user;
}

export async function isAdmin() {
  const user = await getAuthUser();
  return user?.role === "ADMINISTRATOR";
}

export async function isTechnician() {
  const user = await getAuthUser();
  return user?.role === "TECHNICIAN";
}

export async function isSupervisor() {
  const user = await getAuthUser();
  return user?.role === "SUPERVISOR";
}
