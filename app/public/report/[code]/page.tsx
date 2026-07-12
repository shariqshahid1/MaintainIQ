"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { publicIssueSchema, type PublicIssueFormData } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wrench,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Check,
} from "lucide-react";

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
  { value: "EMERGENCY", label: "Emergency" },
] as const;

export default function PublicReportPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const [submitted, setSubmitted] = useState(false);
  const [issueNumber, setIssueNumber] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PublicIssueFormData>({
    resolver: zodResolver(publicIssueSchema) as never,
    defaultValues: {
      priority: "MEDIUM",
    },
  });

  const selectedPriority = watch("priority");

  async function onSubmit(data: PublicIssueFormData) {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/issues/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, assetCode: code }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to submit report");
      }

      const result = await response.json();
      setIssueNumber(result.issueNumber ?? null);
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setSubmitting(false);
    }
  }

   if (submitted) {
     return (
       <div className="bg-muted/30">
         <header className="border-b border-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">
           <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
             <Wrench className="size-6 text-white" />
             <span className="text-lg font-semibold text-white">
               MaintainIQ
             </span>
           </div>
         </header>

        <main className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
              <CheckCircle2 className="size-16 text-emerald-500" />
              <h1 className="text-xl font-bold">Report Submitted</h1>
              <p className="text-muted-foreground">
                Thank you for reporting this issue. Our maintenance team will
                review it shortly.
              </p>
              {issueNumber && (
                <div className="rounded-lg bg-muted px-4 py-2 text-center">
                  <p className="text-xs text-muted-foreground">Reference Number</p>
                  <p className="font-mono text-sm font-semibold">
                    {issueNumber}
                  </p>
                </div>
              )}
              <div className="mt-4 flex gap-3">
                <Link href={`/public/asset/${code}`}>
                  <Button variant="outline">Back to Asset</Button>
                </Link>
                <Button onClick={() => setSubmitted(false)}>
                  Report Another Issue
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-muted/30">
      <header className="border-b border-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
          <Wrench className="size-6 text-white" />
          <span className="text-lg font-semibold text-white">
            MaintainIQ
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <Link
          href={`/public/asset/${code}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to asset
        </Link>

        <Card>
          <CardHeader>
            <div className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Check className="size-3.5" />
              No login required
            </div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              Report an Issue
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Asset:{" "}
              <span className="font-mono font-medium text-foreground">
                {code}
              </span>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the problem"
                  {...register("title")}
                  aria-invalid={!!errors.title}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide as much detail as possible about the issue..."
                  rows={5}
                  {...register("description")}
                  aria-invalid={!!errors.description}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={selectedPriority}
                  onValueChange={(val) =>
                    setValue("priority", val as PublicIssueFormData["priority"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporterName">Your Name</Label>
                <Input
                  id="reporterName"
                  placeholder="John Doe"
                  {...register("reporterName")}
                  aria-invalid={!!errors.reporterName}
                />
                {errors.reporterName && (
                  <p className="text-xs text-destructive">
                    {errors.reporterName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporterEmail">Your Email</Label>
                <Input
                  id="reporterEmail"
                  type="email"
                  placeholder="john@example.com"
                  {...register("reporterEmail")}
                  aria-invalid={!!errors.reporterEmail}
                />
                {errors.reporterEmail && (
                  <p className="text-xs text-destructive">
                    {errors.reporterEmail.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
