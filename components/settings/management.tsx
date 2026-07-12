"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateMyRole,
  createCategory,
  createLocation,
} from "@/actions/settings";
import { UserRole } from "@/app/generated/prisma/client";
import { Plus, Check } from "lucide-react";

const ROLES: UserRole[] = [
  "ADMINISTRATOR",
  "TECHNICIAN",
  "SUPERVISOR",
  "REPORTER",
];

export function RoleSwitcher({ currentRole }: { currentRole: UserRole }) {
  const [role, setRole] = useState<UserRole>(currentRole);
  const [pending, startTransition] = useTransition();

  function save() {
    const fd = new FormData();
    fd.set("role", role);
    startTransition(async () => {
      try {
        await updateMyRole(fd);
        toast.success(`Role updated to ${role}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update role");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor="role">Active Role</Label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="flex h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={save} disabled={pending || role === currentRole}>
          {pending ? "Saving..." : "Save Role"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Demo affordance — switch roles to explore the RBAC model. In production
        this is managed by administrators.
      </p>
    </div>
  );
}

export function CategoryManager({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!name.trim()) return;
    const fd = new FormData();
    fd.set("name", name);
    fd.set("description", description);
    startTransition(async () => {
      try {
        await createCategory(fd);
        toast.success("Category created");
        setName("");
        setDescription("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        ) : (
          categories.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium"
            >
              {c.name}
            </span>
          ))
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <Button onClick={submit} disabled={pending || !name.trim()} size="sm">
        <Plus className="size-4" />
        Add Category
      </Button>
    </div>
  );
}

export function LocationManager({
  locations,
}: {
  locations: { id: string; name: string }[];
}) {
  const [form, setForm] = useState({ name: "", building: "", floor: "", room: "" });
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!form.name.trim()) return;
    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("building", form.building);
    fd.set("floor", form.floor);
    fd.set("room", form.room);
    startTransition(async () => {
      try {
        await createLocation(fd);
        toast.success("Location created");
        setForm({ name: "", building: "", floor: "", room: "" });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {locations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No locations yet.</p>
        ) : (
          locations.map((l) => (
            <span
              key={l.id}
              className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium"
            >
              {l.name}
            </span>
          ))
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder="Location name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Building"
          value={form.building}
          onChange={(e) => setForm({ ...form, building: e.target.value })}
        />
        <Input
          placeholder="Floor"
          value={form.floor}
          onChange={(e) => setForm({ ...form, floor: e.target.value })}
        />
        <Input
          placeholder="Room"
          value={form.room}
          onChange={(e) => setForm({ ...form, room: e.target.value })}
        />
      </div>
      <Button onClick={submit} disabled={pending || !form.name.trim()} size="sm">
        <Plus className="size-4" />
        Add Location
      </Button>
    </div>
  );
}
