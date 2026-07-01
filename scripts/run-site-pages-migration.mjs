/**
 * Add site_pages column to catalog_store on Supabase Postgres.
 */

import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function loadEnv() {
  const raw = await readFile(join(root, ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL?.trim()) return process.env.DATABASE_URL.trim();

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!password || !match) return null;

  const ref = match[1];
  const region = process.env.SUPABASE_DB_REGION?.trim() || "ap-southeast-1";
  return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
}

const SQL = `
alter table public.catalog_store
  add column if not exists site_pages jsonb not null default '{}'::jsonb;
`;

async function checkColumn(supabase) {
  const { error } = await supabase
    .from("catalog_store")
    .select("id, site_pages")
    .eq("id", "main")
    .maybeSingle();

  if (error) {
    if (/column .* does not exist/i.test(error.message)) {
      return { ok: false, reason: error.message };
    }
    throw new Error(error.message);
  }

  return { ok: true };
}

async function runWithPg(databaseUrl) {
  const { default: pg } = await import("pg");
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(SQL);
  } finally {
    await client.end();
  }
}

async function main() {
  await loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    process.exitCode = 1;
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const before = await checkColumn(supabase);

  if (before.ok) {
    console.log("Migration already applied — site_pages column exists.");
    return;
  }

  console.log("Column missing:", before.reason);

  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) {
    console.error(
      "Cannot run DDL without DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local.\n" +
        "Or paste migration-site-pages.sql into Supabase Dashboard → SQL Editor."
    );
    process.exitCode = 1;
    return;
  }

  console.log("Running migration via Postgres...");
  await runWithPg(databaseUrl);

  const after = await checkColumn(supabase);
  if (!after.ok) {
    console.error("Migration ran but column still missing:", after.reason);
    process.exitCode = 1;
    return;
  }

  console.log("Migration successful.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
