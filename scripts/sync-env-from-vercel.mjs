/**
 * Write app env vars from process.env into .env.local.
 * Run via: vercel env run --environment=production -- node scripts/sync-env-from-vercel.mjs
 */

import { writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const keys = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
];

const missing = keys.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  console.error(`Missing env from Vercel: ${missing.join(", ")}`);
  process.exit(1);
}

const lines = [
  "# Synced from Vercel production (nelly-website)",
  "# Re-run: npm run env:sync",
  "",
  ...keys.map((key) => `${key}=${JSON.stringify(process.env[key] ?? "")}`),
  "",
];

const outPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
await writeFile(outPath, lines.join("\n"), "utf8");

console.log(`Wrote ${keys.length} variables to .env.local`);
