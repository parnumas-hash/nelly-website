/**
 * Run footer/about column migration on Supabase Postgres.
 * Requires DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local
 *
 * DATABASE_URL example:
 * postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
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
  add column if not exists footer jsonb not null default '{}'::jsonb;

alter table public.catalog_store
  add column if not exists home_collections jsonb not null default '{}'::jsonb;
`;

async function checkColumns(supabase) {
  const { data, error } = await supabase
    .from("catalog_store")
    .select("id, footer, about, home_collections")
    .eq("id", "main")
    .maybeSingle();

  if (error) {
    if (/column .* does not exist/i.test(error.message)) {
      return { ok: false, reason: error.message };
    }
    throw new Error(error.message);
  }

  return { ok: true, data };
}

async function runWithPg(databaseUrl) {
  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(SQL);
  } finally {
    await client.end();
  }
}

await loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);
const before = await checkColumns(supabase);

if (before.ok) {
  console.log("Migration already applied — footer, about, and home_collections columns exist.");
  process.exit(0);
}

console.log("Columns missing:", before.reason);

const databaseUrl = resolveDatabaseUrl();
if (!databaseUrl) {
  console.error(
    "Cannot run DDL without DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local.\n" +
      "Add your Supabase database password from Dashboard → Project Settings → Database."
  );
  process.exit(1);
}

console.log("Running migration via Postgres...");
await runWithPg(databaseUrl);

const after = await checkColumns(supabase);
if (!after.ok) {
  console.error("Migration ran but columns still missing:", after.reason);
  process.exit(1);
}

console.log("Migration successful.");
