import { z } from "zod";

export const assetSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  assetCode: z
    .string()
    .min(1, "Asset code is required")
    .max(50)
    .regex(/^[A-Z0-9-]+$/i, "Asset code must be alphanumeric with hyphens"),
  status: z.enum(["OPERATIONAL", "UNDER_MAINTENANCE", "OUT_OF_SERVICE", "RETIRED"]).default("OPERATIONAL"),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "CRITICAL"]).default("GOOD"),
  serialNumber: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  manufacturer: z.string().max(100).optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().min(0).optional(),
  warrantyExpiry: z.string().optional(),
  lastServiceDate: z.string().optional(),
  nextServiceDate: z.string().optional(),
  categoryId: z.string().optional(),
  locationId: z.string().optional(),
  assignedToId: z.string().optional(),
});

export type AssetFormData = z.infer<typeof assetSchema>;

export const issueSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL", "EMERGENCY"]).default("MEDIUM"),
  assetId: z.string().min(1, "Asset is required"),
  categoryId: z.string().optional(),
});

export type IssueFormData = z.infer<typeof issueSchema>;

export const maintenanceSchema = z.object({
  type: z.enum(["PREVENTIVE", "CORRECTIVE", "PREDICTIVE", "INSPECTION", "EMERGENCY"]).default("CORRECTIVE"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  inspectionNotes: z.string().max(5000).optional(),
  repairNotes: z.string().max(5000).optional(),
  workDone: z.string().max(5000).optional(),
  cost: z.number().min(0).optional(),
  workingHours: z.number().min(0).optional(),
  conditionAfter: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "CRITICAL"]).optional(),
  assetId: z.string().min(1, "Asset is required"),
  issueId: z.string().optional(),
});

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const locationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  building: z.string().max(100).optional(),
  floor: z.string().max(20).optional(),
  room: z.string().max(50).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export type LocationFormData = z.infer<typeof locationSchema>;

export const publicIssueSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL", "EMERGENCY"]).default("MEDIUM"),
  reporterEmail: z.string().email("Valid email is required"),
  reporterName: z.string().min(1, "Name is required").max(100),
});

export type PublicIssueFormData = z.infer<typeof publicIssueSchema>;

export const assignmentSchema = z.object({
  assignedToId: z.string().min(1, "Technician is required"),
  status: z.enum([
    "REPORTED",
    "ASSIGNED",
    "INSPECTION_STARTED",
    "MAINTENANCE_IN_PROGRESS",
    "WAITING_PARTS",
    "RESOLVED",
    "CLOSED",
    "REOPENED",
  ]),
});

export type AssignmentFormData = z.infer<typeof assignmentSchema>;
