import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Storage abstraction.
 *
 * The app ships with a local-disk provider (writes into /public/uploads so
 * Next.js can serve the files statically). Swapping to S3 / Cloudinary later
 * only requires implementing `StorageProvider` and changing `getStorage()`.
 */
export interface StoredFile {
  url: string;
  key: string;
  fileName: string;
}

export interface StorageProvider {
  save(buffer: Buffer, originalName: string): Promise<StoredFile>;
}

const PUBLIC_DIR = path.join(process.cwd(), "public");
const UPLOAD_DIR = path.join(PUBLIC_DIR, "uploads");

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

export function assertValidUpload(mimeType: string, size: number) {
  if (!ALLOWED_MIME.has(mimeType)) {
    throw new Error("Only image files (JPEG, PNG, WebP, GIF, AVIF) are allowed");
  }
  if (size > MAX_UPLOAD_BYTES) {
    throw new Error("File is too large (max 8 MB)");
  }
}

class LocalDiskStorage implements StorageProvider {
  async save(buffer: Buffer, originalName: string): Promise<StoredFile> {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const ext = path.extname(originalName) || ".bin";
    const key = `${randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, key);
    await fs.writeFile(filePath, buffer);
    return {
      url: `/uploads/${key}`,
      key,
      fileName: originalName,
    };
  }
}

let provider: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (!provider) provider = new LocalDiskStorage();
  return provider;
}
