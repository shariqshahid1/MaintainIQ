"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPublicAssetUrl } from "@/lib/qr";
import {
  Download,
  Copy,
  Printer,
  Check,
  QrCode,
  ScanLine,
} from "lucide-react";

const ORGANIZATION = "MaintainIQ";

interface QrPreviewProps {
  assetId: string;
  assetCode: string;
  assetName: string;
  organization?: string;
}

export function QrPreview({
  assetId,
  assetCode,
  assetName,
  organization = ORGANIZATION,
}: QrPreviewProps) {
  const [copied, setCopied] = useState(false);
  const qrApiUrl = `/api/qr/${assetId}`;
  const publicUrl = getPublicAssetUrl(assetCode);

  async function handleDownload() {
    try {
      const response = await fetch(qrApiUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${assetCode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      console.error("Failed to download QR code");
    }
  }

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy URL");
    }
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const qrSrc = `${window.location.origin}${qrApiUrl}`;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Asset Label - ${assetCode}</title>
          <style>
            @page { margin: 0; size: 70mm 40mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: #f1f5f9;
            }
            .label {
              width: 66mm;
              background: #fff;
              border: 2px solid #0f172a;
              border-radius: 10px;
              overflow: hidden;
            }
            .label-head {
              background: linear-gradient(90deg, #4f46e5, #2563eb, #06b6d4);
              color: #fff;
              padding: 6px 10px;
              display: flex;
              align-items: center;
              gap: 6px;
              font-weight: 700;
              font-size: 13px;
              letter-spacing: 0.3px;
            }
            .label-body { display: flex; gap: 10px; padding: 10px; align-items: center; }
            .label-body img { width: 64px; height: 64px; }
            .meta { flex: 1; min-width: 0; }
            .name { font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.2; }
            .code {
              font-family: ui-monospace, monospace;
              font-size: 12px;
              font-weight: 700;
              color: #4f46e5;
              margin-top: 2px;
            }
            .hint {
              font-size: 9px;
              color: #64748b;
              margin-top: 6px;
              line-height: 1.3;
            }
            .scan {
              text-align: center;
              font-size: 9px;
              color: #475569;
              padding: 0 10px 8px;
              border-top: 1px dashed #cbd5e1;
              margin-top: 4px;
              padding-top: 6px;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="label-head">
              <span style="font-size:14px;">&#9633;</span> ${organization}
            </div>
            <div class="label-body">
              <img src="${qrSrc}" alt="QR Code" />
              <div class="meta">
                <div class="name">${assetName}</div>
                <div class="code">${assetCode}</div>
                <div class="hint">Scan to view asset details &amp; report issues.</div>
              </div>
            </div>
            <div class="scan">Point a phone camera at the QR code &middot; No app or login required</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 350);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="size-4" />
          QR Code &amp; Label
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* On-screen label preview that mirrors the printed label */}
        <div className="mx-auto w-fit overflow-hidden rounded-xl border-2 border-foreground/80 bg-card shadow-card">
          <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-3 py-1.5 text-white">
            <QrCode className="size-4" />
            <span className="text-sm font-bold tracking-wide">{organization}</span>
          </div>
          <div className="flex items-center gap-3 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrApiUrl}
              alt={`QR code for ${assetCode}`}
              className="size-20 rounded-md border bg-white p-1"
              width={80}
              height={80}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{assetName}</p>
              <p className="font-mono text-xs font-bold text-primary">{assetCode}</p>
              <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                <ScanLine className="size-3" />
                Scan for details &amp; issues
              </p>
            </div>
          </div>
          <p className="border-t border-dashed border-border bg-muted/40 px-3 py-1.5 text-center text-[10px] text-muted-foreground">
            Point a phone camera at the QR code &middot; No app or login required
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="w-full gap-2"
          >
            <Download className="size-3.5" />
            Download PNG
          </Button>

          <Button
            onClick={handleCopyUrl}
            variant="outline"
            size="sm"
            className="w-full gap-2"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Copied!" : "Copy Public URL"}
          </Button>

          <Button
            onClick={handlePrint}
            size="sm"
            className="w-full gap-2"
          >
            <Printer className="size-3.5" />
            Print Label
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground break-all">
          {publicUrl}
        </p>
      </CardContent>
    </Card>
  );
}
