"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Loader2,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  ShieldAlert,
  Stethoscope,
  Sparkles,
} from "lucide-react";

export interface TriageResult {
  title: string;
  category: string;
  priority: string;
  possibleCauses: string[];
  safetyWarnings: string[];
  diagnosticChecks: string[];
  confidenceScore: number;
}

interface AiTriageProps {
  issueDescription: string;
  onAccept?: (result: TriageResult) => void;
  onReject?: () => void;
}

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-sky-100 text-sky-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
  EMERGENCY: "bg-red-600 text-white",
};

export function AiTriage({ issueDescription, onAccept, onReject }: AiTriageProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runTriage() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: issueDescription }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "AI analysis failed");
      }

      const data: TriageResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {!result && !loading && (
        <Button
          onClick={runTriage}
          variant="outline"
          disabled={!issueDescription || issueDescription.trim().length < 10}
          className="gap-2"
        >
          <Brain className="size-4" />
          Run AI Triage
        </Button>
      )}

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Analyzing issue with AI...
            </span>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="size-5 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                Analysis Failed
              </p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
            <Button onClick={runTriage} variant="ghost" size="sm" className="gap-1.5">
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-amber-500" />
                AI Triage Results
              </span>
              <Badge
                variant="secondary"
                className={PRIORITY_STYLES[result.priority] ?? ""}
              >
                {result.priority}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Suggested Title
                </p>
                <p className="mt-1 text-sm font-medium">{result.title}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Category
                </p>
                <p className="mt-1 text-sm font-medium">{result.category}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Confidence
                </p>
                <p className="mt-1 text-sm font-medium">
                  {Math.round(result.confidenceScore * 100)}%
                </p>
              </div>
            </div>

            {result.possibleCauses.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Possible Causes
                </p>
                <ul className="space-y-1">
                  {result.possibleCauses.map((cause, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.safetyWarnings.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400">
                  <ShieldAlert className="size-3.5" />
                  Safety Warnings
                </p>
                <ul className="space-y-1">
                  {result.safetyWarnings.map((warning, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-300"
                    >
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-amber-500" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.diagnosticChecks.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Stethoscope className="size-3.5" />
                  Diagnostic Checks
                </p>
                <ol className="space-y-1.5">
                  {result.diagnosticChecks.map((check, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                        {i + 1}
                      </span>
                      {check}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="flex gap-2 border-t pt-4">
              <Button
                onClick={() => onAccept?.(result)}
                size="sm"
                className="gap-1.5"
              >
                <Check className="size-3.5" />
                Accept
              </Button>
              <Button
                onClick={() => {
                  setResult(null);
                  onReject?.();
                }}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <X className="size-3.5" />
                Reject
              </Button>
              <Button
                onClick={runTriage}
                variant="ghost"
                size="sm"
                className="gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                Regenerate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
