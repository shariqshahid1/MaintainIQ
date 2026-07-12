"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { assetSchema, type AssetFormData } from "@/lib/validators";
import { createAsset, updateAsset } from "@/actions/assets";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ASSET_STATUSES, ASSET_CONDITIONS } from "@/lib/constants";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
  building?: string | null;
  floor?: string | null;
  room?: string | null;
}

interface User {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}

interface AssetFormProps {
  mode: "create" | "edit";
  asset?: {
    id: string;
    name: string;
    description?: string | null;
    assetCode: string;
    status: string;
    condition: string;
    serialNumber?: string | null;
    model?: string | null;
    manufacturer?: string | null;
    purchaseDate?: Date | null;
    purchasePrice?: number | null;
    categoryId?: string | null;
    locationId?: string | null;
    assignedToId?: string | null;
  };
  categories: Category[];
  locations: Location[];
  technicians?: User[];
}

function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AssetForm({
  mode,
  asset,
  categories,
  locations,
  technicians = [],
}: AssetFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema) as never,
    defaultValues: {
      name: asset?.name ?? "",
      description: asset?.description ?? "",
      assetCode: asset?.assetCode ?? "",
      status: (asset?.status as AssetFormData["status"]) ?? "OPERATIONAL",
      condition: (asset?.condition as AssetFormData["condition"]) ?? "GOOD",
      serialNumber: asset?.serialNumber ?? "",
      model: asset?.model ?? "",
      manufacturer: asset?.manufacturer ?? "",
      purchaseDate: asset?.purchaseDate
        ? new Date(asset.purchaseDate).toISOString().split("T")[0]
        : "",
      purchasePrice: asset?.purchasePrice ?? undefined,
      categoryId: asset?.categoryId ?? "",
      locationId: asset?.locationId ?? "",
      assignedToId: asset?.assignedToId ?? "",
    },
  });

  const watchStatus = watch("status");
  const watchCondition = watch("condition");

  async function onSubmit(data: AssetFormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });

      if (mode === "create") {
        await createAsset(formData);
      } else if (asset) {
        await updateAsset(asset.id, formData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "Create New Asset" : "Edit Asset"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create"
              ? "Add a new asset to the system"
              : `Editing ${asset?.name} (${asset?.assetCode})`}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g. HVAC Unit A1"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="assetCode">Asset Code *</Label>
                <Input
                  id="assetCode"
                  {...register("assetCode")}
                  placeholder="e.g. HVAC-001"
                />
                {errors.assetCode && (
                  <p className="text-xs text-destructive">
                    {errors.assetCode.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe this asset..."
                rows={3}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={watchStatus}
                  onValueChange={(val) =>
                    setValue("status", val as AssetFormData["status"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatStatus(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select
                  value={watchCondition}
                  onValueChange={(val) =>
                    setValue("condition", val as AssetFormData["condition"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_CONDITIONS.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {formatStatus(condition)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  {...register("serialNumber")}
                  placeholder="e.g. SN12345678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  {...register("model")}
                  placeholder="e.g. X200 Pro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  {...register("manufacturer")}
                  placeholder="e.g. Siemens"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  {...register("purchaseDate")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("purchasePrice", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.purchasePrice && (
                  <p className="text-xs text-destructive">
                    {errors.purchasePrice.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classification & Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={watch("categoryId") || ""}
                  onValueChange={(val) => setValue("categoryId", val || "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
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
              <div className="space-y-2">
                <Label>Location</Label>
                <Select
                  value={watch("locationId") || ""}
                  onValueChange={(val) => setValue("locationId", val || "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                        {loc.building ? ` - ${loc.building}` : ""}
                        {loc.room ? `, Room ${loc.room}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {technicians.length > 0 && (
                <div className="space-y-2">
                  <Label>Assigned Technician</Label>
                  <Select
                    value={watch("assignedToId") || ""}
                    onValueChange={(val) =>
                      setValue("assignedToId", val || "")
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.firstName || tech.lastName
                            ? `${tech.firstName ?? ""} ${tech.lastName ?? ""}`.trim()
                            : tech.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="size-4" />
                {mode === "create" ? "Create Asset" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
