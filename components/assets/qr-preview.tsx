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
} from "lucide-react";

interface QrPreviewProps {
  assetId: string;
  assetCode: string;
  assetName: string;
}

export function QrPreview({ assetId, assetCode, assetName }: QrPreviewProps) {
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

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Asset Label - ${assetCode}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 20mm;
              margin: 0;
            }
            img { width: 150px; height: 150px; }
            h1 { font-size: 18px; margin: 12px 0 4px; }
            p { font-size: 12px; color: #666; margin: 2px 0; }
            .asset-code { font-family: monospace; font-size: 14px; font-weight: bold; }
          </style>
        </head>
        <body>
          <img src="${window.location.origin}${qrApiUrl}" alt="QR Code" />
          <h1>${assetName}</h1>
          <p class="asset-code">${assetCode}</p>
          <p>${publicUrl}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrApiUrl}
            alt={`QR code for ${assetCode}`}
            className="rounded-lg border bg-white p-2"
            width={200}
            height={200}
          />
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
            variant="outline"
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
