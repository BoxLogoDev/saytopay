import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Minimal .env loader (no dependencies). Values already present in the
// process environment win, so an explicit shell export always overrides
// the file. Missing file is not an error — the app then reports the
// credentials as missing through /api/health, as before.
export function loadEnvFile(envPath, target = process.env) {
  const file =
    envPath ||
    path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env");
  if (!existsSync(file)) return false;
  const text = readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in target)) target[key] = value;
  }
  return true;
}
