import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-6 text-center">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500">
          <QrCode className="size-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">
          Maintain<span className="text-indigo-600">IQ</span>
        </span>
      </Link>
      <p className="text-6xl font-bold tracking-tight text-indigo-600">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
      </p>
      <Link href="/" className="mt-8">
        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
