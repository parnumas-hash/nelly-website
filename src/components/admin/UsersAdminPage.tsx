"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, Trash2, KeyRound, Pencil } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import UserFormModal, { type UserFormValues } from "@/components/admin/UserFormModal";
import { formatRoleLabels } from "@/context/AdminSessionContext";
import { AdminUserPublic } from "@/types/admin-user";
import { cn } from "@/lib/utils";

export default function UsersAdminPage() {
  const [users, setUsers] = useState<AdminUserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<AdminUserPublic | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminUserPublic | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const data = (await response.json().catch(() => null)) as {
        users?: AdminUserPublic[];
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(data?.error ?? "Could not load users.");
      }
      setUsers(data?.users ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(normalized) ||
        user.display_name.toLowerCase().includes(normalized) ||
        user.roles.join(" ").toLowerCase().includes(normalized)
    );
  }, [users, query]);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedUser(null);
    setModalOpen(true);
  };

  const openEditModal = (user: AdminUserPublic) => {
    setModalMode("edit");
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCreateOrUpdate = async (values: UserFormValues) => {
    if (modalMode === "create") {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(data?.error ?? "Could not create user.");
      }
    } else if (selectedUser) {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: values.display_name,
          roles: values.roles,
          active: values.active,
          must_change_password: values.must_change_password,
        }),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(data?.error ?? "Could not update user.");
      }
    }
    await loadUsers();
  };

  const handleDelete = async (user: AdminUserPublic) => {
    if (
      !window.confirm(
        `Delete user "${user.username}"? This cannot be undone.`
      )
    ) {
      return;
    }

    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "DELETE",
    });
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    if (!response.ok) {
      window.alert(data?.error ?? "Could not delete user.");
      return;
    }
    await loadUsers();
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    setResetLoading(true);
    try {
      const response = await fetch(
        `/api/admin/users/${resetTarget.id}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: resetPassword }),
        }
      );
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(data?.error ?? "Could not reset password.");
      }
      setResetTarget(null);
      setResetPassword("");
      await loadUsers();
    } catch (resetError) {
      window.alert(
        resetError instanceof Error
          ? resetError.message
          : "Could not reset password."
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Users
          </h1>
          <p className="mt-1 text-neutral-500">
            Create staff accounts and assign one or more roles.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2" onClick={() => void loadUsers()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            New User
          </Button>
        </div>
      </div>

      <div className="mb-4 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            id="user-search"
            placeholder="Search username, name, or role"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-11"
          />
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/60">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-neutral-400">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-neutral-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-neutral-100 last:border-b-0 dark:border-neutral-800"
                  >
                    <td className="px-4 py-4">
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {user.display_name}
                      </p>
                      <p className="text-xs text-neutral-500">@{user.username}</p>
                    </td>
                    <td className="px-4 py-4 text-neutral-600 dark:text-neutral-300">
                      {formatRoleLabels(user.roles)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                          user.active
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                        )}
                      >
                        {user.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-neutral-500">
                      {user.last_login_at
                        ? new Date(user.last_login_at).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary dark:hover:bg-neutral-800"
                          aria-label={`Edit ${user.username}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setResetTarget(user);
                            setResetPassword("");
                          }}
                          className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary dark:hover:bg-neutral-800"
                          aria-label={`Reset password for ${user.username}`}
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(user)}
                          className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                          aria-label={`Delete ${user.username}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserFormModal
        open={modalOpen}
        mode={modalMode}
        initial={selectedUser}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
      />

      {resetTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setResetTarget(null)}
            aria-hidden
          />
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
            <h2 className="text-lg font-semibold">
              Reset Password for @{resetTarget.username}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              User will be required to change password on next login.
            </p>
            <div className="mt-4 space-y-4">
              <Input
                id="reset-password"
                label="New Password"
                type="password"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setResetTarget(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={resetLoading || resetPassword.length < 8}
                  onClick={() => void handleResetPassword()}
                >
                  {resetLoading ? "Saving..." : "Reset Password"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
