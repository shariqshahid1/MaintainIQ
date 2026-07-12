"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  maintenanceSchema,
  type MaintenanceFormData,
} from "@/lib/validators";
import { MAINTENANCE_TYPES, ASSET_CONDITIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMaintenance } from "@/actions/maintenance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileUpload, type UploadedAttachment } from "@/components/shared/file-upload";

interface AssetOption {
  id: string;
  name: string;
  assetCode: string;
}

interface IssueOption {
  id: string;
  title: string;
  issueNumber: string;
}

interface MaintenanceFormProps {
  assets: AssetOption[];
  issues: IssueOption[];
  defaultAssetId?: string;
  defaultIssueId?: string;
}

export function MaintenanceForm({
  assets,
  issues,
  defaultAssetId,
  defaultIssueId,
}: MaintenanceFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema) as never,
    defaultValues: {
      type: "CORRECTIVE",
      assetId: defaultAssetId || "",
      issueId: defaultIssueId || "",
    },
  });

  async function onSubmit(data: MaintenanceFormData) {
    setSubmitting(true);
    try {
          const fData = new FormData();
          fData.set("type", data.type);
          fData.set("title", data.title);
          if (data.description) fData.set("description", data.description);
          if (data.inspectionNotes)
            fData.set("inspectionNotes", data.inspectionNotes);
          if (data.repairNotes) fData.set("repairNotes", data.repairNotes);
          if (data.workDone) fData.set("workDone", data.workDone);
          if (data.cost !== undefined) fData.set("cost", String(data.cost));
          if (data.workingHours !== undefined)
            fData.set("workingHours", String(data.workingHours));
          if (data.conditionAfter)
            fData.set("conditionAfter", data.conditionAfter);
          fData.set("assetId", data.assetId);
          if (data.issueId) fData.set("issueId", data.issueId);
          if (attachments.length > 0) {
            fData.set("attachmentIds", JSON.stringify(attachments.map((a) => a.id)));
          }

      const result = await createMaintenance(fData);
      if (result.success) {
        toast.success("Maintenance record created");
        router.push(`/maintenance/${result.id}`);
      }
    } catch {
      toast.error("Failed to create maintenance record");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            {...register("type")}
            className="flex h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {MAINTENANCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-xs text-destructive">{errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="inspectionNotes">Inspection Notes</Label>
          <Textarea id="inspectionNotes" {...register("inspectionNotes")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="repairNotes">Repair Notes</Label>
          <Textarea id="repairNotes" {...register("repairNotes")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="workDone">Work Done</Label>
        <Textarea id="workDone" {...register("workDone")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="cost">Cost</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            min="0"
            {...register("cost", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workingHours">Working Hours</Label>
          <Input
            id="workingHours"
            type="number"
            step="0.5"
            min="0"
            {...register("workingHours", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="conditionAfter">Condition After</Label>
          <Select
            onValueChange={(v) => setValue("conditionAfter", (v ?? undefined) as MaintenanceFormData["conditionAfter"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {ASSET_CONDITIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="assetId">Asset *</Label>
          <Select
            onValueChange={(v) => v && setValue("assetId", v)}
            defaultValue={defaultAssetId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {assets.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name} ({a.assetCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.assetId && (
            <p className="text-xs text-destructive">
              {errors.assetId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="issueId">Issue (optional)</Label>
          <Select
            onValueChange={(v) => setValue("issueId", v || undefined)}
            defaultValue={defaultIssueId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select issue" />
            </SelectTrigger>
            <SelectContent>
              {issues.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.issueNumber} - {i.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Evidence (optional)</Label>
        <FileUpload value={attachments} onChange={setAttachments} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Maintenance Record"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
