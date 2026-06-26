const PRODUCTION_REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_SESSION_SECRET",
  "ADMIN_PASSWORD",
] as const;

const INSECURE_SECRETS = new Set(["nelly-dev-admin", "change-me", "change-me-to-a-strong-password"]);

export function validateProductionEnv(): void {
  if (process.env.VERCEL_ENV !== "production") return;

  const missing = PRODUCTION_REQUIRED.filter(
    (key) => !process.env[key]?.trim()
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`
    );
  }

  const sessionSecret = process.env.ADMIN_SESSION_SECRET!.trim();
  if (sessionSecret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be at least 32 characters in production."
    );
  }

  if (INSECURE_SECRETS.has(sessionSecret)) {
    throw new Error(
      "ADMIN_SESSION_SECRET must not use a default placeholder in production."
    );
  }

  const adminPassword = process.env.ADMIN_PASSWORD!.trim();
  if (adminPassword.length < 8) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 8 characters in production."
    );
  }

  if (INSECURE_SECRETS.has(adminPassword)) {
    throw new Error(
      "ADMIN_PASSWORD must not use a default placeholder in production."
    );
  }
}
