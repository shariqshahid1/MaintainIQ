"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { STATUS_COLORS, CONDITION_COLORS } from "@/lib/constants";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  assetCode: string;
  status: string;
  condition: string;
  serialNumber?: string | null;
  category?: { name: string } | null;
  location?: { name: string } | null;
  assignedTo?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  createdAt: Date;
}

interface AssetTableProps {
  assets: Asset[];
}

type SortField = "name" | "assetCode" | "status" | "condition" | "createdAt";
type SortDirection = "asc" | "desc";

function SortIcon({
  field,
  activeField,
  direction,
}: {
  field: SortField;
  activeField: SortField;
  direction: SortDirection;
}) {
  if (activeField !== field)
    return <ArrowUpDown className="size-3 opacity-50" />;
  return direction === "asc" ? (
    <ArrowUp className="size-3" />
  ) : (
    <ArrowDown className="size-3" />
  );
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getTechnicianName(tech: Asset["assignedTo"]): string {
  if (!tech) return "-";
  if (tech.firstName || tech.lastName) {
    return `${tech.firstName ?? ""} ${tech.lastName ?? ""}`.trim();
  }
  return "-";
}

export function AssetTable({ assets }: AssetTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const filtered = assets
    .filter((a) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.assetCode.toLowerCase().includes(q) ||
        a.category?.name.toLowerCase().includes(q) ||
        a.location?.name.toLowerCase().includes(q) ||
        a.serialNumber?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortField) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "assetCode":
          return dir * a.assetCode.localeCompare(b.assetCode);
        case "status":
          return dir * a.status.localeCompare(b.status);
        case "condition":
          return dir * a.condition.localeCompare(b.condition);
        case "createdAt":
          return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        default:
          return 0;
      }
    });

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                onClick={() => toggleSort("name")}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                Name <SortIcon field="name" activeField={sortField} direction={sortDir} />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort("assetCode")}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                Code <SortIcon field="assetCode" activeField={sortField} direction={sortDir} />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort("status")}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                Status <SortIcon field="status" activeField={sortField} direction={sortDir} />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort("condition")}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                Condition <SortIcon field="condition" activeField={sortField} direction={sortDir} />
              </button>
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                {search
                  ? "No assets match your search."
                  : "No assets found."}
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/assets/${asset.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {asset.name}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {asset.assetCode}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[asset.status] ?? ""}`}
                  >
                    {formatLabel(asset.status)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CONDITION_COLORS[asset.condition] ?? ""}`}
                  >
                    {formatLabel(asset.condition)}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {asset.category?.name ?? "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {asset.location?.name ?? "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getTechnicianName(asset.assignedTo)}
                </TableCell>
                <TableCell>
                  <Link href={`/assets/${asset.id}`}>
                    <Button variant="ghost" size="icon-xs">
                      <ExternalLink className="size-3" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {assets.length} assets
      </p>
    </div>
  );
}
