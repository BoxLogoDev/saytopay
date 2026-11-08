import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadEnvFile } from "../src/env.js";

test("loadEnvFile parses KEY=VALUE, skips comments, strips quotes", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "saytopay-env-"));
  const file = path.join(dir, ".env");
  writeFileSync(file, "# comment\nPAYPAL_ENV=sandbox\nQUOTED=\"a b\"\nEMPTY=\n");
  const target = {};
  assert.equal(loadEnvFile(file, target), true);
  assert.equal(target.PAYPAL_ENV, "sandbox");
  assert.equal(target.QUOTED, "a b");
  assert.equal(target.EMPTY, "");
});

test("loadEnvFile does not override existing environment values", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "saytopay-env-"));
  const file = path.join(dir, ".env");
  writeFileSync(file, "PAYPAL_ENV=from-file\n");
  const target = { PAYPAL_ENV: "from-shell" };
  loadEnvFile(file, target);
  assert.equal(target.PAYPAL_ENV, "from-shell");
});

test("loadEnvFile returns false for a missing file", () => {
  assert.equal(loadEnvFile(path.join(tmpdir(), "saytopay-no-such-.env"), {}), false);
});
