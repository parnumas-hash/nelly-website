import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { AdminRole, normalizeRoles, resolvePermissions } from "@/lib/admin/permissions";
import { hashPassword, validatePasswordPolicy } from "@/lib/admin/password";
import { AdminSession } from "@/lib/admin/session-types";
import { AdminUserPublic } from "@/types/admin-user";

export type { AdminUserPublic };

export interface AdminUserRecord {
  id: string;
  username: string;
  password_hash: string;
  display_name: string;
  roles: AdminRole[];
  active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAdminUserInput {
  username: string;
  display_name: string;
  password: string;
  roles: AdminRole[];
  must_change_password?: boolean;
}

export interface UpdateAdminUserInput {
  display_name?: string;
  roles?: AdminRole[];
  active?: boolean;
  must_change_password?: boolean;
}

function mapRow(row: Record<string, unknown>): AdminUserRecord {
  return {
    id: String(row.id),
    username: String(row.username),
    password_hash: String(row.password_hash),
    display_name: String(row.display_name),
    roles: normalizeRoles(row.roles),
    active: row.active !== false,
    must_change_password: row.must_change_password !== false,
    last_login_at: row.last_login_at ? String(row.last_login_at) : null,
    created_by: row.created_by ? String(row.created_by) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function toPublicUser(user: AdminUserRecord): AdminUserPublic {
  return {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    roles: user.roles,
    active: user.active,
    must_change_password: user.must_change_password,
    last_login_at: user.last_login_at,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export function userRecordToSession(user: AdminUserRecord): AdminSession {
  return {
    userId: user.id,
    username: user.username,
    displayName: user.display_name,
    roles: user.roles,
    permissions: resolvePermissions(user.roles),
    mustChangePassword: user.must_change_password,
  };
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function validateUsername(username: string): string | null {
  const normalized = normalizeUsername(username);
  if (normalized.length < 3) {
    return "Username must be at least 3 characters.";
  }
  if (!/^[a-z0-9._-]+$/.test(normalized)) {
    return "Username may only use letters, numbers, dots, dashes, and underscores.";
  }
  return null;
}

export async function countAdminUsers(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const client = createAdminClient();
  const { count, error } = await client
    .from("admin_users")
    .select("id", { count: "exact", head: true });

  if (error) {
    if (error.message.includes("admin_users")) return 0;
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function listAdminUsers(): Promise<AdminUserPublic[]> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("admin_users")
    .select(
      "id, username, display_name, roles, active, must_change_password, last_login_at, created_at, updated_at"
    )
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toPublicUser(mapRow(row)));
}

export async function getAdminUserByUsername(
  username: string
): Promise<AdminUserRecord | null> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("admin_users")
    .select("*")
    .eq("username", normalizeUsername(username))
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data) : null;
}

export async function getAdminUserById(
  id: string
): Promise<AdminUserRecord | null> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("admin_users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data) : null;
}

export async function countActiveSuperAdmins(
  excludeUserId?: string
): Promise<number> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("admin_users")
    .select("id, roles, active")
    .eq("active", true);

  if (error) throw new Error(error.message);

  return (data ?? []).filter((row) => {
    if (excludeUserId && String(row.id) === excludeUserId) return false;
    return normalizeRoles(row.roles).includes("super_admin");
  }).length;
}

export async function ensureBootstrapSuperAdmin(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) return;

  const client = createAdminClient();
  const { count, error } = await client
    .from("admin_users")
    .select("id", { count: "exact", head: true });

  if (error) {
    if (error.message.includes("admin_users")) return;
    throw new Error(error.message);
  }

  if ((count ?? 0) > 0) return;

  const now = new Date().toISOString();
  const { error: insertError } = await client.from("admin_users").insert({
    username: "admin",
    password_hash: hashPassword(configuredPassword),
    display_name: "Super Admin",
    roles: ["super_admin"],
    active: true,
    must_change_password: false,
    created_at: now,
    updated_at: now,
  });

  if (insertError) throw new Error(insertError.message);
}

export async function authenticateAdminUser(
  username: string,
  password: string
): Promise<AdminUserRecord | null> {
  await ensureBootstrapSuperAdmin();
  const user = await getAdminUserByUsername(username);
  if (!user || !user.active) return null;

  const { verifyPassword } = await import("@/lib/admin/password");
  if (!verifyPassword(password, user.password_hash)) return null;

  const client = createAdminClient();
  await client
    .from("admin_users")
    .update({
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  return user;
}

export async function createAdminUser(
  input: CreateAdminUserInput,
  createdBy?: string
): Promise<AdminUserPublic> {
  const usernameError = validateUsername(input.username);
  if (usernameError) throw new Error(usernameError);

  const passwordError = validatePasswordPolicy(input.password);
  if (passwordError) throw new Error(passwordError);

  const roles = normalizeRoles(input.roles);
  const now = new Date().toISOString();
  const client = createAdminClient();

  const { data, error } = await client
    .from("admin_users")
    .insert({
      username: normalizeUsername(input.username),
      password_hash: hashPassword(input.password),
      display_name: input.display_name.trim(),
      roles,
      active: true,
      must_change_password: input.must_change_password !== false,
      created_by: createdBy ?? null,
      created_at: now,
      updated_at: now,
    })
    .select(
      "id, username, display_name, roles, active, must_change_password, last_login_at, created_at, updated_at"
    )
    .single();

  if (error) throw new Error(error.message);
  return toPublicUser(mapRow(data));
}

export async function updateAdminUser(
  id: string,
  input: UpdateAdminUserInput
): Promise<AdminUserPublic> {
  const existing = await getAdminUserById(id);
  if (!existing) throw new Error("User not found.");

  const nextRoles = input.roles ? normalizeRoles(input.roles) : existing.roles;
  const nextActive = input.active ?? existing.active;

  if (
    existing.roles.includes("super_admin") &&
    !nextRoles.includes("super_admin") &&
    (await countActiveSuperAdmins(id)) === 0
  ) {
    throw new Error("At least one active Super Admin is required.");
  }

  if (
    existing.roles.includes("super_admin") &&
    nextActive === false &&
    (await countActiveSuperAdmins(id)) === 0
  ) {
    throw new Error("Cannot disable the last active Super Admin.");
  }

  const client = createAdminClient();
  const { data, error } = await client
    .from("admin_users")
    .update({
      ...(input.display_name !== undefined
        ? { display_name: input.display_name.trim() }
        : {}),
      ...(input.roles !== undefined ? { roles: nextRoles } : {}),
      ...(input.active !== undefined ? { active: nextActive } : {}),
      ...(input.must_change_password !== undefined
        ? { must_change_password: input.must_change_password }
        : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(
      "id, username, display_name, roles, active, must_change_password, last_login_at, created_at, updated_at"
    )
    .single();

  if (error) throw new Error(error.message);
  return toPublicUser(mapRow(data));
}

export async function deleteAdminUser(id: string, actorId?: string): Promise<void> {
  const existing = await getAdminUserById(id);
  if (!existing) throw new Error("User not found.");
  if (actorId && actorId === id) {
    throw new Error("You cannot delete your own account.");
  }
  if (
    existing.roles.includes("super_admin") &&
    (await countActiveSuperAdmins()) <= 1
  ) {
    throw new Error("Cannot delete the last Super Admin.");
  }

  const client = createAdminClient();
  const { error } = await client.from("admin_users").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function resetAdminUserPassword(
  id: string,
  password: string
): Promise<void> {
  const passwordError = validatePasswordPolicy(password);
  if (passwordError) throw new Error(passwordError);

  const client = createAdminClient();
  const { error } = await client
    .from("admin_users")
    .update({
      password_hash: hashPassword(password),
      must_change_password: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function changeOwnPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<AdminSession> {
  const passwordError = validatePasswordPolicy(newPassword);
  if (passwordError) throw new Error(passwordError);

  const user = await getAdminUserById(userId);
  if (!user || !user.active) throw new Error("User not found.");

  const { verifyPassword } = await import("@/lib/admin/password");
  if (!verifyPassword(currentPassword, user.password_hash)) {
    throw new Error("Current password is incorrect.");
  }

  const client = createAdminClient();
  const { error } = await client
    .from("admin_users")
    .update({
      password_hash: hashPassword(newPassword),
      must_change_password: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  const updated = await getAdminUserById(userId);
  if (!updated) throw new Error("User not found.");
  return userRecordToSession(updated);
}
