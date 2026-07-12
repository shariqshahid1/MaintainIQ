import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStorage, assertValidUpload } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    assertValidUpload(file.type, file.size);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid upload" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await getStorage().save(buffer, file.name, file.type);

  const attachment = await db.attachment.create({
    data: {
      fileName: stored.fileName,
      fileUrl: stored.url,
      fileSize: file.size,
      mimeType: file.type,
    },
    select: { id: true, fileUrl: true, fileName: true },
  });

  return NextResponse.json(attachment, { status: 201 });
}
