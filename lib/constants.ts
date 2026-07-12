export const ASSET_STATUSES = [
  "OPERATIONAL",
  "UNDER_MAINTENANCE",
  "OUT_OF_SERVICE",
  "RETIRED",
] as const;

export const ASSET_CONDITIONS = [
  "EXCELLENT",
  "GOOD",
  "FAIR",
  "POOR",
  "CRITICAL",
] as const;

export const ISSUE_STATUSES = [
  "REPORTED",
  "ASSIGNED",
  "INSPECTION_STARTED",
  "MAINTENANCE_IN_PROGRESS",
  "WAITING_PARTS",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
] as const;

export const ISSUE_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
  "EMERGENCY",
] as const;

export const MAINTENANCE_TYPES = [
  "PREVENTIVE",
  "CORRECTIVE",
  "PREDICTIVE",
  "INSPECTION",
  "EMERGENCY",
] as const;

export const USER_ROLES = [
  "ADMINISTRATOR",
  "TECHNICIAN",
  "REPORTER",
  "SUPERVISOR",
] as const;

export const STATUS_COLORS: Record<string, string> = {
  OPERATIONAL: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  UNDER_MAINTENANCE: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  OUT_OF_SERVICE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  RETIRED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  REPORTED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  ASSIGNED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  INSPECTION_STARTED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  MAINTENANCE_IN_PROGRESS: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  WAITING_PARTS: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  RESOLVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  REOPENED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
  MEDIUM: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  EMERGENCY: "bg-red-600 text-white dark:bg-red-700 dark:text-white",
};

export const CONDITION_COLORS: Record<string, string> = {
  EXCELLENT: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  GOOD: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  FAIR: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  POOR: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export const VALID_TRANSITIONS: Record<string, string[]> = {
  REPORTED: ["ASSIGNED", "CLOSED"],
  ASSIGNED: ["INSPECTION_STARTED", "CLOSED"],
  INSPECTION_STARTED: ["MAINTENANCE_IN_PROGRESS", "WAITING_PARTS", "RESOLVED"],
  MAINTENANCE_IN_PROGRESS: ["WAITING_PARTS", "RESOLVED"],
  WAITING_PARTS: ["MAINTENANCE_IN_PROGRESS", "RESOLVED"],
  RESOLVED: ["CLOSED", "REOPENED"],
  CLOSED: [],
  REOPENED: ["ASSIGNED", "INSPECTION_STARTED"],
};

export const ITEMS_PER_PAGE = 12;
