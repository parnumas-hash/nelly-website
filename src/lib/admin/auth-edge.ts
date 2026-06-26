import {
  AdminSession,
  SESSION_VERSION,
  SessionPayload,
  getLegacySuperAdminSession,
  payloadToSession,
} from "@/lib/admin/session-types";

export const ADMIN_COOKIE = "nelly_admin_session";

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "nelly-dev-admin"
  );
}

function decodePayload(encoded: string): SessionPayload | null {
  try {
    const pad = encoded.length % 4;
    const padded = pad ? `${encoded}${"=".repeat(4 - pad)}` : encoded;
    const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
    const parsed = JSON.parse(atob(base64)) as SessionPayload;
    if (
      !parsed ||
      typeof parsed.uid !== "string" ||
      typeof parsed.un !== "string" ||
      typeof parsed.exp !== "number" ||
      !Array.isArray(parsed.roles) ||
      !Array.isArray(parsed.permissions)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function signPayload(encodedPayload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${SESSION_VERSION}.${encodedPayload}`)
  );
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyLegacyAdminSessionTokenEdge(
  token: string
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode("nelly-admin")
  );
  const expected = Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  if (token.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < token.length; i += 1) {
    mismatch |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function parseAdminSessionEdge(
  token: string | undefined
): Promise<AdminSession | null> {
  if (!token) return null;

  if (token.startsWith(`${SESSION_VERSION}.`)) {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const encoded = parts[1]!;
    const signature = parts[2]!;
    const expected = await signPayload(encoded);
    if (signature.length !== expected.length) return null;
    let mismatch = 0;
    for (let i = 0; i < signature.length; i += 1) {
      mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (mismatch !== 0) return null;

    const payload = decodePayload(encoded);
    if (!payload) return null;
    if (payload.exp * 1000 < Date.now()) return null;
    return payloadToSession(payload);
  }

  if (await verifyLegacyAdminSessionTokenEdge(token)) {
    return getLegacySuperAdminSession();
  }

  return null;
}

export async function verifyAdminSessionTokenEdge(
  token: string | undefined
): Promise<boolean> {
  const session = await parseAdminSessionEdge(token);
  return session !== null;
}
