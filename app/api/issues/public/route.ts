import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { publicIssueSchema } from "@/lib/validators";

// Public route — anyone scanning a QR code can report an issue without logging in.
// Public reporters are not Clerk users, so we attribute the report to a dedicated
// system user while preserving the reporter's name/email on the Issue row.
const PUBLIC_REPORTER_CLERK_ID = "system:public-reporter";

async function ensurePublicReporter() {
  const existing = await db.user.findUnique({
    where: { clerkId: PUBLIC_REPORTER_CLERK_ID },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await db.user.create({
    data: {
      clerkId: PUBLIC_REPORTER_CLERK_ID,
      email: "public@maintainiq.app",
      firstName: "Public",
      lastName: "Reporter",
      role: "REPORTER",
    },
    select: { id: true },
  });
  return created.id;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = publicIssueSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid submission", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, priority, reporterName, reporterEmail } =
      validated.data;
    const assetCode = body.assetCode;
    if (!assetCode || typeof assetCode !== "string") {
      return NextResponse.json({ error: "Asset code is required" }, { status: 400 });
    }

    const asset = await db.asset.findFirst({
      where: { assetCode, isDeleted: false },
      select: { id: true, name: true },
    });
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const reporterId = await ensurePublicReporter();

    const year = new Date().getFullYear();
    const count = await db.issue.count({
      where: { issueNumber: { startsWith: `IQ-${year}-` } },
    });
    const issueNumber = `IQ-${year}-${String(count + 1).padStart(5, "0")}`;

    const issue = await db.issue.create({
      data: {
        issueNumber,
        title,
        description,
        priority,
        assetId: asset.id,
        reportedById: reporterId,
        reporterName,
        reporterEmail,
      },
    });

    await db.historyEntry.create({
      data: {
        action: "ISSUE_REPORTED",
        description: `Public issue ${issueNumber} reported via QR code by ${reporterName}`,
        assetId: asset.id,
        issueId: issue.id,
        performedById: reporterId,
      },
    });

    return NextResponse.json({ success: true, issueNumber: issue.issueNumber });
  } catch (error) {
    console.error("Public issue submission failed:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
