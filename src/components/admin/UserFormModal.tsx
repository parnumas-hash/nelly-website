"use client";

import { FormEvent, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  ADMIN_ROLES,
  ROLE_DEFINITIONS,
  type AdminRole,
} from "@/lib/admin/permissions";
import { AdminUserPublic } from "@/types/admin-user";
import { cn } from "@/lib/utils";

export interface UserFormValues {
  username: string;
  display_name: string;
  password: string;
  roles: AdminRole[];
  active: boolean;
  must_change_password: boolean;
}

interface UserFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: AdminUserPublic | null;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

const defaultValues: UserFormValues = {
  username: "",
  display_name: "",
  password: "",
  roles: ["product_editor"],
  active: true,
  must_change_password: true,
};

export default function UserFormModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const [values, setValues] = useState<UserFormValues>(defaultValues);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (mode === "edit" && initial) {
      setValues({
        username: initial.username,
        display_name: initial.display_name,
        password: "",
        roles: initial.roles,
        active: initial.active,
        must_change_password: initial.must_change_password,
      });
    } else {
      setValues(defaultValues);
    }
  }, [open, mode, initial]);

  if (!open) return null;

  const toggleRole = (role: AdminRole) => {
    setValues((current) => {
      const hasRole = current.roles.includes(role);
      const nextRoles = hasRole
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role];
      return {
        ...current,
        roles: nextRoles.length > 0 ? nextRoles : current.roles,
      };
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit(values);
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save user."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="text-xl font-semibold">
          {mode === "create" ? "Create User" : "Edit User"}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Assign one or more roles. Permissions are combined from all selected roles.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "create" ? (
            <Input
              id="user-username"
              label="Username"
              value={values.username}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
              required
            />
          ) : (
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Username
              </p>
              <p className="rounded-xl border border-neutral-200 px-4 py-3 text-sm dark:border-neutral-800">
                {values.username}
              </p>
            </div>
          )}

          <Input
            id="user-display-name"
            label="Display Name"
            value={values.display_name}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                display_name: event.target.value,
              }))
            }
            required
          />

          {mode === "create" ? (
            <Input
              id="user-password"
              label="Password"
              type="password"
              value={values.password}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              required
            />
          ) : null}

          <div>
            <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Roles
            </p>
            <div className="space-y-2">
              {ADMIN_ROLES.map((role) => {
                const selected = values.roles.includes(role);
                return (
                  <label
                    key={role}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-neutral-200 dark:border-neutral-800"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleRole(role)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium">
                        {ROLE_DEFINITIONS[role].label}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500">
                        {ROLE_DEFINITIONS[role].description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {mode === "edit" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={values.active}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      active: event.target.checked,
                    }))
                  }
                />
                Active account
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={values.must_change_password}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      must_change_password: event.target.checked,
                    }))
                  }
                />
                Require password change on next login
              </label>
            </div>
          ) : (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.must_change_password}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    must_change_password: event.target.checked,
                  }))
                }
              />
              Require password change on first login
            </label>
          )}

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Create User" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
