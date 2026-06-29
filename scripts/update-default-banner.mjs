/**
 * Update hero banner in Supabase catalog to the new default image banner.
 * Run: node scripts/update-default-banner.mjs
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

function loadEnv() {
  try {
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^([A-Z_]+)=(.*)$/);
      if (!match) continue;
      const [, key, value] = match;
      if (!process.env[key]) {
        process.env[key] = value.replace(/^"|"$/g, "");
      }
    }
  } catch {
    // ignore
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase env in .env.local");
  process.exit(1);
}

const banner = {
  eyebrow: "NELLY GROUP",
  title: "Premium Pet Lifestyle",
  subtitle: "A New Journey With Your Best Friend",
  ctaLabel: "Explore Collection",
  ctaHref: "/shop",
  videoUrl: "",
  posterUrl: "/images/hero-banner.jpg",
  active: true,
};

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase
  .from("catalog_store")
  .select("banner")
  .eq("id", "main")
  .maybeSingle();

if (error) {
  console.error(error.message);
  process.exit(1);
}

if (!data) {
  console.error("No catalog_store row found.");
  process.exit(1);
}

const { error: updateError } = await supabase
  .from("catalog_store")
  .update({ banner })
  .eq("id", "main");

if (updateError) {
  console.error(updateError.message);
  process.exit(1);
}

console.log("Updated Supabase hero banner to new image banner.");
