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

test("keywords inside other words do not draft items", () => {
  for (const text of [
    "I need a booking for tonight",
    "a cupcake and a teaspoon",
    "plantation tour and a mousepad",
  ]) {
    const d = parseOrderText(text);
    assert.equal(d.items.length, 0, text);
    assert.equal(d.total, 0, text);
  }
  const booked = parseOrderText("booked a shirt for the meeting");
  assert.equal(booked.items.length, 1);
  assert.equal(booked.items[0].sku, "tshirt");
  assert.equal(booked.total, 24);
});

test("plural forms still match on word boundaries", () => {
  const d = parseOrderText("2 notebooks and 3 cups");
  assert.equal(d.items.find((i) => i.sku === "notebook").quantity, 2);
  assert.equal(d.items.find((i) => i.sku === "mug").quantity, 3);
  assert.equal(d.total, 2 * 9.5 + 3 * 12);
});

test("parses a trailing x-count after the item", () => {
  const d = parseOrderText("mugs x3");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "mug");
  assert.equal(d.items[0].quantity, 3);
  assert.equal(d.total, 36);
  const spaced = parseOrderText("headphones x 2");
  assert.equal(spaced.items[0].quantity, 2);
  assert.equal(spaced.total, 118);
});

test("trailing x-count applies to its own item only", () => {
  const d = parseOrderText("coffee beans x2 and a notebook");
  assert.equal(d.items.find((i) => i.sku === "coffee-beans").quantity, 2);
  assert.equal(d.items.find((i) => i.sku === "notebook").quantity, 1);
  assert.equal(d.total, 45.5);
  const next = parseOrderText("mugs x3 and candles");
  assert.equal(next.items.find((i) => i.sku === "candle").quantity, 1);
});

test("trailing mentions are summed and a bare x invents nothing", () => {
  const d = parseOrderText("mugs x2 and mugs x3");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].quantity, 5);
  assert.equal(d.total, 60);
  const bare = parseOrderText("mugs x");
  assert.equal(bare.items[0].quantity, 1);
});

test("an explicitly negated item is not drafted", () => {
  const d = parseOrderText("no notebook, just 2 coffee beans");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "coffee-beans");
  assert.equal(d.items[0].quantity, 2);
  assert.equal(d.total, 36);
  const without = parseOrderText("2 coffee beans without a notebook");
  assert.equal(without.items.length, 1);
  assert.equal(without.items[0].sku, "coffee-beans");
  assert.equal(without.total, 36);
  const notA = parseOrderText("a mug, not a candle");
  assert.equal(notA.items.length, 1);
  assert.equal(notA.items[0].sku, "mug");
  assert.equal(notA.total, 12);
});

test("negation forms cover don't-add and but-no", () => {
  const d = parseOrderText("don't add a mug, just a notebook");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "notebook");
  assert.equal(d.total, 9.5);
  const butNo = parseOrderText("coffee but no mug");
  assert.equal(butNo.items.length, 1);
  assert.equal(butNo.items[0].sku, "coffee-beans");
  assert.equal(butNo.total, 18);
});

test("negation does not leak onto the next item or block a later positive mention", () => {
  const d = parseOrderText("no mug and a candle");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "candle");
  assert.equal(d.total, 13.5);
  const later = parseOrderText("no mug, actually two mugs");
  assert.equal(later.items.length, 1);
  assert.equal(later.items[0].sku, "mug");
  assert.equal(later.items[0].quantity, 2);
  assert.equal(later.total, 24);
});

test("quantity survives an of-the connector before the item", () => {
  const d = parseOrderText("two of the mugs and three of those candles");
  assert.equal(d.items.find((i) => i.sku === "mug").quantity, 2);
  assert.equal(d.items.find((i) => i.sku === "candle").quantity, 3);
  assert.equal(d.total, 2 * 12 + 3 * 13.5);
  const digits = parseOrderText("2 of the mugs");
  assert.equal(digits.items[0].quantity, 2);
  assert.equal(digits.total, 24);
});

test("dozen quantity survives an of-the connector and an adjective", () => {
  const d = parseOrderText("a dozen of the mugs");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].quantity, 12);
  assert.equal(d.total, 144);
  const adj = parseOrderText("2 of the ceramic mugs");
  assert.equal(adj.items[0].quantity, 2);
  assert.equal(adj.total, 24);
});

test("an of-the connector alone does not invent a quantity", () => {
  const d = parseOrderText("of the mugs please");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].quantity, 1);
  assert.equal(d.total, 12);
});

test("parses number words from thirteen to ninety", () => {
  const d = parseOrderText("twenty notebooks and fifteen candles");
  assert.equal(d.items.find((i) => i.sku === "notebook").quantity, 20);
  assert.equal(d.items.find((i) => i.sku === "candle").quantity, 15);
  assert.equal(d.total, 20 * 9.5 + 15 * 13.5);
  const teen = parseOrderText("thirteen mugs");
  assert.equal(teen.items[0].quantity, 13);
  assert.equal(teen.total, 156);
});

test("parses compound tens quantities, hyphenated and spaced", () => {
  const hyphen = parseOrderText("twenty-one mugs");
  assert.equal(hyphen.items[0].quantity, 21);
  assert.equal(hyphen.total, 252);
  const spaced = parseOrderText("forty two candles");
  assert.equal(spaced.items[0].quantity, 42);
  assert.equal(spaced.total, 42 * 13.5);
});

test("larger number words do not break dozen or the standard example", () => {
  const dozen = parseOrderText("two dozen candles");
  assert.equal(dozen.items[0].quantity, 24);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
});

test("a standalone cup still means a mug (catalog keyword)", () => {
  const d = parseOrderText("coffee cups");
  assert.equal(d.items.find((i) => i.sku === "coffee-beans").quantity, 1);
  assert.equal(d.items.find((i) => i.sku === "mug").quantity, 1);
  assert.equal(d.total, 30);
});
