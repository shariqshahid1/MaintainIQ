"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { issueSchema, type IssueFormData } from "@/lib/validators";
import { createIssue } from "@/actions/issues";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Loader2, Sparkles } from "lucide-react";
import { AiTriage, type TriageResult } from "@/components/issues/ai-triage";
import { Separator } from "@/components/ui/separator";
import { FileUpload, type UploadedAttachment } from "@/components/shared/file-upload";

interface AssetOption {
  id: string;
  name: string;
  assetCode: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

export function IssueForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [assetSearch, setAssetSearch] = useState("");
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const assetDropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema) as never,
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      assetId: "",
      categoryId: "",
    },
  });

  const selectedAssetId = watch("assetId");

  useEffect(() => {
    async function fetchAssets() {
      const url = assetSearch
        ? `/api/assets/search?q=${encodeURIComponent(assetSearch)}`
        : "/api/assets/search";
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setAssets(data);
        }
      } catch {}
    }
    fetchAssets();
  }, [assetSearch]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch {}
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (assetDropdownRef.current && !assetDropdownRef.current.contains(e.target as Node)) {
        setShowAssetDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectAsset = useCallback(
    (asset: AssetOption) => {
      setValue("assetId", asset.id);
      setAssetSearch(`${asset.name} (${asset.assetCode})`);
      setShowAssetDropdown(false);
    },
    [setValue],
  );

  async function onSubmit(data: IssueFormData) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("priority", data.priority);
      formData.append("assetId", data.assetId);
      if (data.categoryId) formData.append("categoryId", data.categoryId);
      if (triage) formData.append("aiSuggestion", JSON.stringify(triage));
      if (attachments.length > 0) {
        formData.append("attachmentIds", JSON.stringify(attachments.map((a) => a.id)));
      }

      const result = await createIssue(formData);
      toast.success("Issue created successfully");
      router.push(`/issues/${result.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create issue");
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Report an Issue</CardTitle>
          <CardDescription>
            Submit a new issue for an asset that requires attention.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Detailed description of the issue (min 10 characters)"
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-transparent p-4 dark:border-indigo-900/40 dark:from-indigo-950/20">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
              <Sparkles className="size-4" />
              AI-Assisted Triage
            </div>
            <AiTriage
              issueDescription={watch("description")}
              onAccept={(result) => {
                setTriage(result);
                if (!watch("title")) setValue("title", result.title);
                setValue("priority", result.priority as IssueFormData["priority"]);
                toast.success("AI suggestion applied");
              }}
              onReject={() => setTriage(null)}
            />
            {triage && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <Sparkles className="size-3.5" />
                Suggestion accepted and will be attached to this issue.
              </p>
            )}
          </div>

          <Separator className="my-2" />

          <div className="space-y-2">
            <Label>Evidence (optional)</Label>
            <FileUpload value={attachments} onChange={setAttachments} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              defaultValue="MEDIUM"
              onValueChange={(value) => setValue("priority", value as IssueFormData["priority"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2" ref={assetDropdownRef}>
            <Label htmlFor="assetSearch">Asset</Label>
            <div className="relative">
              <div className="relative">
                <Input
                  id="assetSearch"
                  placeholder={selectedAsset ? `${selectedAsset.name} (${selectedAsset.assetCode})` : "Search for an asset..."}
                  value={assetSearch}
                  onChange={(e) => {
                    setAssetSearch(e.target.value);
                    setShowAssetDropdown(true);
                    if (!e.target.value) setValue("assetId", "");
                  }}
                  onFocus={() => setShowAssetDropdown(true)}
                />
                <Search className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              {showAssetDropdown && (
                <div className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border bg-popover p-1 shadow-md">
                  {assets.length === 0 ? (
                    <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                      {assetSearch ? "No assets found" : "Type to search assets..."}
                    </p>
                  ) : (
                    assets.map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        className="flex w-full cursor-default items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => selectAsset(asset)}
                      >
                        {asset.name}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({asset.assetCode})
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {errors.assetId && (
              <p className="text-sm text-destructive">{errors.assetId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category (optional)</Label>
            <Select
              onValueChange={(value: string | null) =>
                setValue("categoryId", value ?? undefined)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Submit Issue
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
