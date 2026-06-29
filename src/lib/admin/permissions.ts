export const ADMIN_ROLES = [
  "super_admin",
  "catalog_manager",
  "product_editor",
  "fulfillment_staff",
  "viewer",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const PERMISSIONS = [
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
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export interface RoleDefinition {
  label: string;
  description: string;
  permissions: Permission[];
}

export const ROLE_DEFINITIONS: Record<AdminRole, RoleDefinition> = {
  super_admin: {
    label: "Super Admin",
    description: "Full access including user management and settings.",
    permissions: [...PERMISSIONS],
  },
  catalog_manager: {
    label: "Catalog Manager",
    description: "Manage products, brands, categories, media, and banners.",
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
      "catalog:write",
      "orders:read",
    ],
  },
  product_editor: {
    label: "Product Editor",
    description: "Add and edit products and upload media.",
    permissions: [
      "dashboard:view",
      "products:read",
      "products:write",
      "media:read",
      "media:write",
      "catalog:write",
    ],
  },
  fulfillment_staff: {
    label: "Fulfillment Staff",
    description: "View orders and manage picking and shipping.",
    permissions: [
      "dashboard:view",
      "products:read",
      "orders:read",
      "orders:pick",
      "orders:ship",
    ],
  },
  viewer: {
    label: "Viewer",
    description: "Read-only access to catalog data.",
    permissions: [
      "dashboard:view",
      "products:read",
      "brands:read",
      "categories:read",
      "media:read",
      "banners:read",
      "orders:read",
    ],
  },
};

export function isAdminRole(value: string): value is AdminRole {
  return (ADMIN_ROLES as readonly string[]).includes(value);
}

export function normalizeRoles(roles: unknown): AdminRole[] {
  if (!Array.isArray(roles)) return ["product_editor"];
  const normalized = roles.filter(
    (role): role is AdminRole => typeof role === "string" && isAdminRole(role)
  );
  return normalized.length > 0 ? Array.from(new Set(normalized)) : ["product_editor"];
}

export function resolvePermissions(roles: AdminRole[]): Permission[] {
  const set = new Set<Permission>();
  for (const role of normalizeRoles(roles)) {
    for (const permission of ROLE_DEFINITIONS[role].permissions) {
      set.add(permission);
    }
  }
  return Array.from(set);
}

export function hasPermission(
  permissions: Permission[] | readonly Permission[],
  required: Permission
): boolean {
  return permissions.includes(required);
}

export function hasAnyPermission(
  permissions: Permission[] | readonly Permission[],
  required: Permission[]
): boolean {
  return required.some((permission) => permissions.includes(permission));
}

export interface AdminNavItem {
  href: string;
  label: string;
  permission: Permission;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", permission: "dashboard:view" },
  { href: "/admin/products", label: "Products", permission: "products:read" },
  { href: "/admin/brands", label: "Brands", permission: "brands:read" },
  { href: "/admin/categories", label: "Categories", permission: "categories:read" },
  { href: "/admin/media", label: "Media", permission: "media:read" },
  { href: "/admin/site-content", label: "Site Content", permission: "banners:read" },
  { href: "/admin/settings", label: "Settings", permission: "settings:read" },
  { href: "/admin/users", label: "Users", permission: "users:manage" },
];

export function getRequiredPermissionForPath(pathname: string): Permission | null {
  if (pathname === "/admin" || pathname === "/admin/") {
    return "dashboard:view";
  }
  if (pathname.startsWith("/admin/change-password")) return null;
  if (pathname.startsWith("/admin/users")) return "users:manage";
  if (pathname.startsWith("/admin/settings")) return "settings:read";
  if (pathname.startsWith("/admin/products")) return "products:read";
  if (pathname.startsWith("/admin/brands")) return "brands:read";
  if (pathname.startsWith("/admin/categories")) return "categories:read";
  if (pathname.startsWith("/admin/media")) return "media:read";
  if (pathname.startsWith("/admin/site-content")) return "banners:read";
  if (pathname.startsWith("/admin/banners")) return "banners:read";
  if (pathname.startsWith("/admin/footer")) return "banners:read";
  return "dashboard:view";
}
