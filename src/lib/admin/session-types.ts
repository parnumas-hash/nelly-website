import { AdminRole, Permission } from "@/lib/admin/permissions";

export const SESSION_VERSION = "v1";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

export interface SessionPayload {
  uid: string;
  un: string;
  dn: string;
  roles: AdminRole[];
  permissions: Permission[];
  mcp: boolean;
  exp: number;
}

export interface AdminSession {
  userId: string;
  username: string;
  displayName: string;
  roles: AdminRole[];
  permissions: Permission[];
  mustChangePassword: boolean;
  legacy?: boolean;
}

export function sessionToPayload(session: AdminSession): SessionPayload {
  return {
    uid: session.userId,
    un: session.username,
    dn: session.displayName,
    roles: session.roles,
    permissions: [...session.permissions],
    mcp: session.mustChangePassword,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC,
  };
}

export function payloadToSession(payload: SessionPayload): AdminSession {
  return {
    userId: payload.uid,
    username: payload.un,
    displayName: payload.dn,
    roles: payload.roles,
    permissions: payload.permissions,
    mustChangePassword: payload.mcp,
  };
}

export function getLegacySuperAdminSession(): AdminSession {
  return {
    userId: "legacy-admin",
    username: "admin",
    displayName: "Legacy Admin",
    roles: ["super_admin"],
    permissions: [
      "dashboard:view",
      "products:read",
      "products:write",
      "brands:read",
      "brands:write",
      "categories:read",
      "categories:write",
      "media:read",
      "media:write",
      "banners:read",
      "banners:write",
      "settings:read",
      "settings:write",
      "catalog:write",
      "users:manage",
      "orders:read",
      "orders:pick",
      "orders:ship",
      "orders:manage",
    ],
    mustChangePassword: false,
    legacy: true,
  };
}
