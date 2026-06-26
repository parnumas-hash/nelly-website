/**
 * Download catalog from production and save as admin backup JSON.
 * Usage: node scripts/pull-production-backup.mjs [production-url]
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_URL = "https://nelly-website-seven.vercel.app";
const BACKUP_FORMAT_VERSION = 1;

const productionUrl = (process.argv[2] || DEFAULT_URL).replace(/\/$/, "");
const apiUrl = `${productionUrl}/api/catalog`;

const response = await fetch(apiUrl, { cache: "no-store" });
if (!response.ok) {
  console.error(`Failed to fetch catalog: HTTP ${response.status}`);
  process.exit(1);
}

const catalog = await response.json();

if (catalog.empty || !Array.isArray(catalog.products)) {
  console.error("Production catalog is empty or not configured.");
  process.exit(1);
}

const backup = {
  formatVersion: BACKUP_FORMAT_VERSION,
  exportedAt: new Date().toISOString(),
  catalogVersion: catalog.catalogVersion ?? 4,
  app: "nelly-admin",
  products: catalog.products,
  brands: catalog.brands ?? [],
  categories: catalog.categories ?? [],
  media: catalog.media ?? [],
  banner: catalog.banner,
};

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "data");
const stamp = backup.exportedAt.slice(0, 10);
const outPath = join(outDir, `nelly-production-backup-${stamp}.json`);

await mkdir(outDir, { recursive: true });
await writeFile(outPath, JSON.stringify(backup, null, 2), "utf8");

console.log(`Saved production backup:`);
console.log(`  Source: ${apiUrl}`);
console.log(`  Products: ${backup.products.length}`);
console.log(`  Brands: ${backup.brands.length}`);
console.log(`  Media: ${backup.media.length}`);
console.log(`  File: ${outPath}`);
console.log("");
console.log("Restore on localhost:");
console.log("  1. npm run dev");
console.log("  2. Open http://localhost:3000/admin/settings");
console.log("  3. Restore Backup → select the file above");
