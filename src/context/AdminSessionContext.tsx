"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ADMIN_NAV_ITEMS,
  hasPermission,
  Permission,
  ROLE_DEFINITIONS,
  type AdminRole,
} from "@/lib/admin/permissions";

export interface AdminSessionUser {
  id: string;
  username: string;
  display_name: string;
  roles: AdminRole[];
  permissions: Permission[];
  active: boolean;
  must_change_password: boolean;
  legacy?: boolean;
}

interface AdminSessionContextValue {
  user: AdminSessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  navItems: typeof ADMIN_NAV_ITEMS;
}

const AdminSessionContext = createContext<AdminSessionContextValue | undefined>(
  undefined
);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminSessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/me", { cache: "no-store" });
      if (!response.ok) {
        setUser(null);
        return;
      }
      const data = (await response.json()) as { user: AdminSessionUser };
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const canAccess = useCallback(
    (permission: Permission) =>
      user ? hasPermission(user.permissions, permission) : false,
    [user]
  );

  const navItems = useMemo(
    () => ADMIN_NAV_ITEMS.filter((item) => canAccess(item.permission)),
    [canAccess]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      hasPermission: canAccess,
      navItems,
    }),
    [user, loading, refresh, canAccess, navItems]
  );

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error("useAdminSession must be used within AdminSessionProvider");
  }
  return context;
}

export function formatRoleLabels(roles: AdminRole[]): string {
  return roles.map((role) => ROLE_DEFINITIONS[role].label).join(", ");
}
