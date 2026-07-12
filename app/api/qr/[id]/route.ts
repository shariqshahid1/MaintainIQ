import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateQrCodeBuffer } from "@/lib/qr";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const asset = await db.asset.findUnique({
      where: { id },
      select: { assetCode: true, name: true },
    });

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      );
    }

    const buffer = await generateQrCodeBuffer(asset.assetCode);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "Content-Disposition": `inline; filename="qr-${asset.assetCode}.png"`,
      },
    });
  } catch (error) {
    console.error("QR generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
