/**
 * Stage production backup and apply it to browser localStorage via localhost.
 * Usage: node scripts/restore-local-backup.mjs [backup-file]
 */

import { access, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "data");
const stagedPath = join(dataDir, "staged-local-restore.json");
const devUrl = process.env.LOCAL_DEV_URL ?? "http://localhost:3000";

async function resolveBackupPath(explicitPath) {
  if (explicitPath) return explicitPath;

  const files = (await readdir(dataDir))
    .filter((name) => name.startsWith("nelly-production-backup-") && name.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    throw new Error("No production backup found. Run: npm run pull:production");
  }

  return join(dataDir, files[0]);
}

async function stageBackup(raw) {
  const response = await fetch(`${devUrl}/api/dev/stage-local-restore`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Could not stage backup (${response.status}): ${body}`);
  }
}

function openBrowser(url) {
  if (process.platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], {
      detached: true,
      stdio: "ignore",
    }).unref();
    return;
  }

  const opener =
    process.platform === "darwin"
      ? "open"
      : process.platform === "linux"
        ? "xdg-open"
        : null;

  if (!opener) return;
  spawn(opener, [url], { detached: true, stdio: "ignore" }).unref();
}

async function waitForStagedConsumption(timeoutMs = 90000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      await access(stagedPath, constants.F_OK);
    } catch {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return false;
}

async function main() {
  const backupPath = await resolveBackupPath(process.argv[2]);
  const raw = await readFile(backupPath, "utf8");
  const backup = JSON.parse(raw);

  console.log(`Using backup: ${backupPath}`);
  console.log(`  Products: ${backup.products?.length ?? 0}`);
  console.log(`  Brands: ${backup.brands?.length ?? 0}`);

  console.log(`Staging on ${devUrl}...`);
  await stageBackup(raw);

  console.log("Opening browser to apply restore...");
  openBrowser(`${devUrl}/admin`);

  const consumed = await waitForStagedConsumption();
  if (!consumed) {
    throw new Error(
      "Timed out waiting for restore. Open http://localhost:3000/admin manually."
    );
  }

  console.log("");
  console.log("Local restore complete.");
  console.log(`Verify at ${devUrl}/admin/settings`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
