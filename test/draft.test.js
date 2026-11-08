import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDraft } from "../src/draft.js";

test("normalizeDraft reprices a tampered draft from the catalog", () => {
  const d = normalizeDraft({
    items: [
      { sku: "coffee-beans", quantity: 2, unitPrice: 0.01, lineTotal: 0.02 },
      { sku: "notebook", quantity: 1, unitPrice: 0.01, lineTotal: 0.01 },
    ],
    total: 0.03,
    currency: "USD",
  });
  assert.equal(d.items[0].unitPrice, 18);
  assert.equal(d.items[1].unitPrice, 9.5);
  assert.equal(d.total, 45.5);
});

test("normalizeDraft drops unknown SKUs and zero-quantity items", () => {
  const d = normalizeDraft({
    items: [
      { sku: "spaceship", quantity: 1 },
      { sku: "mug", quantity: 0 },
      { sku: "mug", quantity: 2 },
    ],
  });
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "mug");
  assert.equal(d.items[0].quantity, 2);
  assert.equal(d.total, 24);
});

test("normalizeDraft merges duplicates and clamps quantity to 99", () => {
  const d = normalizeDraft({
    items: [
      { sku: "candle", quantity: 60 },
      { sku: "candle", quantity: 60 },
    ],
  });
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].quantity, 99);
  assert.equal(d.total, 1336.5);
});
