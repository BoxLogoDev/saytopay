import test from "node:test";
import assert from "node:assert/strict";
import { parseOrderText } from "../src/parseOrder.js";

test("parses quantities from digits and number words", () => {
  const d = parseOrderText("2 coffee beans and a notebook");
  assert.equal(d.items.length, 2);
  assert.equal(d.items[0].sku, "coffee-beans");
  assert.equal(d.items[0].quantity, 2);
  assert.equal(d.items[1].sku, "notebook");
  assert.equal(d.items[1].quantity, 1);
  assert.equal(d.total, 45.5);
});

test("parses number words", () => {
  const d = parseOrderText("three mugs and two candles");
  assert.equal(d.items.find((i) => i.sku === "mug").quantity, 3);
  assert.equal(d.items.find((i) => i.sku === "candle").quantity, 2);
  assert.equal(d.total, 63);
});

test("empty and unmatched input produce an empty draft", () => {
  assert.equal(parseOrderText("").items.length, 0);
  const d = parseOrderText("a spaceship please");
  assert.equal(d.items.length, 0);
  assert.equal(d.total, 0);
  assert.match(d.note, /No catalog item matched/);
});

test("repeated mentions of the same item are summed, not dropped", () => {
  const d = parseOrderText("a mug and three mugs");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "mug");
  assert.equal(d.items[0].quantity, 4);
  assert.equal(d.total, 48);
});

test("repeated mentions across different keywords for one SKU are summed", () => {
  const d = parseOrderText("1 coffee and 2 coffee beans");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "coffee-beans");
  assert.equal(d.items[0].quantity, 3);
  assert.equal(d.total, 54);
});

test("summed quantity is clamped to 99", () => {
  const d = parseOrderText("60 candles and 60 candles");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].quantity, 99);
  assert.equal(d.total, 1336.5);
});

test("parses eleven and twelve as number words", () => {
  const d = parseOrderText("eleven notebooks and twelve candles");
  assert.equal(d.items.find((i) => i.sku === "notebook").quantity, 11);
  assert.equal(d.items.find((i) => i.sku === "candle").quantity, 12);
  assert.equal(d.total, 11 * 9.5 + 12 * 13.5);
});

test("parses dozen quantities", () => {
  const a = parseOrderText("a dozen mugs");
  assert.equal(a.items.length, 1);
  assert.equal(a.items[0].quantity, 12);
  assert.equal(a.total, 144);
  const two = parseOrderText("two dozen candles");
  assert.equal(two.items[0].quantity, 24);
  assert.equal(two.total, 324);
  const digits = parseOrderText("3 dozen notebooks");
  assert.equal(digits.items[0].quantity, 36);
});

test("parses half a dozen as six", () => {
  const d = parseOrderText("half a dozen mugs");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].quantity, 6);
  assert.equal(d.total, 72);
});

test("quantity survives a catalog adjective before the item", () => {
  const d = parseOrderText("2 wireless headphones and 1 ceramic mug");
  assert.equal(d.items.find((i) => i.sku === "headphones").quantity, 2);
  assert.equal(d.items.find((i) => i.sku === "mug").quantity, 1);
  assert.equal(d.total, 2 * 59 + 12);
  const b = parseOrderText("2 steel water bottles");
  assert.equal(b.items[0].sku, "bottle");
  assert.equal(b.items[0].quantity, 2);
  assert.equal(b.total, 42);
});

test("dozen quantity survives a catalog adjective before the item", () => {
  const d = parseOrderText("a dozen ceramic mugs");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].quantity, 12);
  assert.equal(d.total, 144);
});

test("an adjective alone does not invent a quantity", () => {
  const d = parseOrderText("wireless headphones please");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].quantity, 1);
  assert.equal(d.total, 59);
});

test("longest keyword wins per product (book vs notebook)", () => {
  const d = parseOrderText("one notebook");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "notebook");
});
