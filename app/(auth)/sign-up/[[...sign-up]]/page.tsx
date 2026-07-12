"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { QrCode } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-md text-center text-white">
          <div className="mb-8 inline-flex items-center justify-center rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <QrCode className="size-16" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            Start Managing Assets
          </h1>
          <p className="text-lg text-white/80">
            Create your account and transform how your organization handles
            maintenance with AI-powered intelligence.
          </p>
          <div className="mt-12 space-y-4 text-left">
            {[
              "QR codes for every asset",
              "AI-powered issue diagnosis",
              "Complete maintenance lifecycle",
              "Real-time dashboard & analytics",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <div className="size-2 rounded-full bg-white" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-lg font-bold"
          >
            <QrCode className="size-7 text-indigo-600" />
            MaintainIQ
          </Link>
          <SignUp
            routing="hash"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/dashboard"
            forceRedirectUrl="/dashboard"
            appearance={{
              variables: {
                colorPrimary: "#6366f1",
                colorBackground: "transparent",
                colorForeground: "#e5e7eb",
                colorMutedForeground: "#9ca3af",
                colorInput: "rgba(255,255,255,0.04)",
                colorInputForeground: "#f3f4f6",
                borderRadius: "0.75rem",
              },
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 w-full bg-transparent",
                headerTitle: "text-2xl font-bold",
                headerSubtitle: "text-muted-foreground",
                formButtonPrimary:
                  "bg-indigo-600 hover:bg-indigo-700 text-white normal-case font-medium h-11 rounded-lg",
                formFieldInput:
                  "h-11 rounded-lg border-white/10 focus:ring-indigo-500 focus:border-indigo-500",
                footerActionLink: "text-indigo-400 hover:text-indigo-300",
                socialButtonsBlockButton:
                  "border-white/10 rounded-lg normal-case font-medium hover:bg-white/5",
                dividerLine: "bg-white/10",
                dividerText: "text-gray-500",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
