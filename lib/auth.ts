import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Prisma, type UserRole } from "@/app/generated/prisma/client";

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

  // Fast path: a DB record already linked to this Clerk account.
  const existingByClerk = await db.user.findUnique({
    where: { clerkId: userId },
  });
  if (existingByClerk) return existingByClerk;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const profile = {
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    avatarUrl: clerkUser.imageUrl,
  };

  // A record with this email may already exist (e.g. seeded/demo users) but
  // without a linked clerkId. Rather than failing on the unique(email)
  // constraint, attach the Clerk id to that record and keep its existing role.
  if (email) {
    const existingByEmail = await db.user.findUnique({ where: { email } });
    if (existingByEmail) {
      return db.user.update({
        where: { id: existingByEmail.id },
        data: { clerkId: userId, ...profile },
      });
    }
  }

  try {
    return await db.user.create({
      data: {
        clerkId: userId,
        email,
        ...profile,
        role: roleFromClerkMetadata(clerkUser.publicMetadata),
      },
    });
  } catch (error) {
    // Concurrent sign-in may have created the account between our lookups.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return db.user.findUnique({ where: { clerkId: userId } });
    }
    throw error;
  }
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
