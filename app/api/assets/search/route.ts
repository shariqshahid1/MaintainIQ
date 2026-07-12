import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

// Authenticated, lightweight asset search used by the issue reporter autocomplete.
export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  const assets = await db.asset.findMany({
    where: {
      isDeleted: false,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { assetCode: { contains: q, mode: "insensitive" } },
              { category: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    select: { id: true, name: true, assetCode: true },
    orderBy: { name: "asc" },
    take: 20,
  });

  return NextResponse.json(assets);
}
