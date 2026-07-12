"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface UploadedAttachment {
  id: string;
  fileUrl: string;
  fileName: string;
}

interface FileUploadProps {
  value: UploadedAttachment[];
  onChange: (attachments: UploadedAttachment[]) => void;
  max?: number;
}

export function FileUpload({ value, onChange, max = 5 }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = max - value.length;
    if (remaining <= 0) {
      toast.error(`You can attach up to ${max} files`);
      return;
    }

    setUploading(true);
    try {
      const next: UploadedAttachment[] = [];
      for (const file of Array.from(files).slice(0, remaining)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "Upload failed");
        }
        const data = await res.json();
        next.push({ id: data.id, fileUrl: data.fileUrl, fileName: data.fileName });
      }
      onChange([...value, ...next]);
      toast.success("Upload complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(id: string) {
    onChange(value.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {value.map((att) => (
          <div
            key={att.id}
            className="group relative size-20 overflow-hidden rounded-lg border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={att.fileUrl}
              alt={att.fileName}
              className="size-full object-cover"
            />
            <button
              type="button"
              onClick={() => remove(att.id)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove attachment"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex size-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-indigo-300 hover:text-indigo-600"
          >
            {uploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Upload className="size-5" />
            )}
            <span className="text-[10px]">Add</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ImageIcon className="size-3.5" />
        Images only · max 8 MB each · up to {max} files
      </p>
    </div>
  );
}
