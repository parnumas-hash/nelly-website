import { createHmac, timingSafeEqual } from "crypto";
import {
  AdminSession,
  SESSION_MAX_AGE_SEC,
  SESSION_VERSION,
  SessionPayload,
  getLegacySuperAdminSession,
  payloadToSession,
  sessionToPayload,
} from "@/lib/admin/session-types";

export const ADMIN_COOKIE = "nelly_admin_session";

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "nelly-dev-admin"
  );
}

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(encoded: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as SessionPayload;
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

function signPayload(encodedPayload: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(`${SESSION_VERSION}.${encodedPayload}`)
    .digest("hex");
}

export function createAdminSessionToken(session: AdminSession): string {
  const encoded = encodePayload(sessionToPayload(session));
  const signature = signPayload(encoded);
  return `${SESSION_VERSION}.${encoded}.${signature}`;
}

function verifyLegacyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = createHmac("sha256", getSessionSecret())
    .update("nelly-admin")
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function parseAdminSessionToken(
  token: string | undefined
): AdminSession | null {
  if (!token) return null;

  if (token.startsWith(`${SESSION_VERSION}.`)) {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const encoded = parts[1]!;
    const signature = parts[2]!;
    const expected = signPayload(encoded);
    try {
      if (
        signature.length !== expected.length ||
        !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
      ) {
        return null;
      }
    } catch {
      return null;
    }

    const payload = decodePayload(encoded);
    if (!payload) return null;
    if (payload.exp * 1000 < Date.now()) return null;
    return payloadToSession(payload);
  }

  if (verifyLegacyAdminSessionToken(token)) {
    return getLegacySuperAdminSession();
  }

  return null;
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

export function verifyAdminPasswordLegacy(password: string): boolean {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) return password.length >= 6;
  return password === configured;
}
