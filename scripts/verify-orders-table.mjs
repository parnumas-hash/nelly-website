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

await loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error("FAIL: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error, count } = await supabase
  .from("orders")
  .select("id, order_number, status, customer_name, total, created_at", {
    count: "exact",
  })
  .order("created_at", { ascending: false })
  .limit(5);

if (error) {
  console.error("FAIL:", error.message);
  if (error.code) console.error("CODE:", error.code);
  process.exit(1);
}

console.log("OK: public.orders table is reachable");
console.log(`PROJECT: ${url.replace(/^https:\/\//, "").split(".")[0]}`);
console.log(`ORDER_COUNT: ${count ?? 0}`);

if (!data?.length) {
  console.log("(table exists but no orders yet)");
} else {
  for (const row of data) {
    console.log(
      `- ${row.order_number} | ${row.status} | ${row.customer_name} | ${row.total} | ${row.created_at}`
    );
  }
}

const testId = `verify-${Date.now()}`;
const testRow = {
  id: testId,
  order_number: `VERIFY-${Date.now()}`,
  status: "pending",
  customer_name: "Migration Verify",
  customer_email: "verify@example.com",
  customer_phone: "000",
  shipping_address: "Test address",
  items: [],
  subtotal: 0,
  shipping_fee: 0,
  total: 0,
};

const insert = await supabase.from("orders").insert(testRow).select("id").single();
if (insert.error) {
  console.error("WRITE_FAIL:", insert.error.message);
  process.exit(1);
}

const del = await supabase.from("orders").delete().eq("id", testId);
if (del.error) {
  console.error("DELETE_FAIL:", del.error.message);
  process.exit(1);
}

console.log("OK: insert + delete test passed");
