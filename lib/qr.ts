import QRCode from "qrcode";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "http://localhost:3000";

export async function generateQrCode(assetCode: string): Promise<string> {
  const publicUrl = `${BASE_URL}/public/asset/${assetCode}`;
  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
  return qrDataUrl;
}

export async function generateQrCodeBuffer(assetCode: string): Promise<Buffer> {
  const publicUrl = `${BASE_URL}/public/asset/${assetCode}`;
  const buffer = await QRCode.toBuffer(publicUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
  return buffer;
}

export function getPublicAssetUrl(assetCode: string): string {
  return `${BASE_URL}/public/asset/${assetCode}`;
}
