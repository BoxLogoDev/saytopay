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

test("parses a trailing list-style count after a colon", () => {
  const d = parseOrderText("mugs: 3");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "mug");
  assert.equal(d.items[0].quantity, 3);
  assert.equal(d.total, 36);
  const list = parseOrderText("mugs: 3, candles: 2");
  assert.equal(list.items.find((i) => i.sku === "mug").quantity, 3);
  assert.equal(list.items.find((i) => i.sku === "candle").quantity, 2);
  assert.equal(list.total, 63);
  const word = parseOrderText("candles: two");
  assert.equal(word.items[0].quantity, 2);
  assert.equal(word.total, 27);
});

test("parses a trailing list-style count in parentheses", () => {
  const d = parseOrderText("mugs (3)");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].quantity, 3);
  assert.equal(d.total, 36);
  const word = parseOrderText("notebooks (two)");
  assert.equal(word.items[0].quantity, 2);
  assert.equal(word.total, 19);
  const x = parseOrderText("mugs (x3)");
  assert.equal(x.items[0].quantity, 3);
});

test("a colon or parenthesis without a count invents nothing, and a comma count stays with the next item", () => {
  const colon = parseOrderText("a mug: it was great");
  assert.equal(colon.items[0].quantity, 1);
  assert.equal(colon.total, 12);
  const comma = parseOrderText("mugs, 3 candles");
  assert.equal(comma.items.find((i) => i.sku === "mug").quantity, 1);
  assert.equal(comma.items.find((i) => i.sku === "candle").quantity, 3);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
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

test("a pair or a couple of an item drafts two of it", () => {
  const pair = parseOrderText("a pair of headphones");
  assert.equal(pair.items.length, 1);
  assert.equal(pair.items[0].sku, "headphones");
  assert.equal(pair.items[0].quantity, 2);
  assert.equal(pair.total, 118);
  const couple = parseOrderText("a couple of mugs");
  assert.equal(couple.items[0].quantity, 2);
  assert.equal(couple.total, 24);
  const bare = parseOrderText("a couple mugs");
  assert.equal(bare.items[0].quantity, 2);
});

test("counted pairs multiply, and a couple of dozen is twenty-four", () => {
  const two = parseOrderText("two pairs of headphones");
  assert.equal(two.items[0].quantity, 4);
  assert.equal(two.total, 236);
  const dozenPairs = parseOrderText("a dozen pairs of headphones");
  assert.equal(dozenPairs.items[0].quantity, 24);
  const coupleDozen = parseOrderText("a couple of dozen mugs");
  assert.equal(coupleDozen.items[0].quantity, 24);
  assert.equal(coupleDozen.total, 288);
});

test("negation still covers pair phrasing and the standard example is unchanged", () => {
  const d = parseOrderText("no pair of mugs, just a notebook");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "notebook");
  assert.equal(d.total, 9.5);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
});

test("a counted container drafts that many of the item it holds", () => {
  const boxes = parseOrderText("3 boxes of candles");
  assert.equal(boxes.items.length, 1);
  assert.equal(boxes.items[0].sku, "candle");
  assert.equal(boxes.items[0].quantity, 3);
  assert.equal(boxes.total, 40.5);
  const sets = parseOrderText("2 sets of headphones");
  assert.equal(sets.items[0].quantity, 2);
  assert.equal(sets.total, 118);
  const packs = parseOrderText("two packs of coffee beans and a notebook");
  assert.equal(packs.items.find((i) => i.sku === "coffee-beans").quantity, 2);
  assert.equal(packs.items.find((i) => i.sku === "notebook").quantity, 1);
  assert.equal(packs.total, 45.5);
  const large = parseOrderText("2 large boxes of candles");
  assert.equal(large.items[0].quantity, 2);
  assert.equal(large.total, 27);
});

test("a container alone does not invent a quantity", () => {
  const d = parseOrderText("a box of candles");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].quantity, 1);
  assert.equal(d.total, 13.5);
  const bare = parseOrderText("boxes of candles please");
  assert.equal(bare.items[0].quantity, 1);
});

test("negation still covers container phrasing", () => {
  const d = parseOrderText("no boxes of candles, just a mug");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "mug");
  assert.equal(d.total, 12);
  const pack = parseOrderText("no pack of mugs, just a notebook");
  assert.equal(pack.items.length, 1);
  assert.equal(pack.items[0].sku, "notebook");
  assert.equal(pack.total, 9.5);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
});

test("scale words draft the scaled quantity, clamped to 99", () => {
  const hundred = parseOrderText("a hundred notebooks");
  assert.equal(hundred.items.length, 1);
  assert.equal(hundred.items[0].sku, "notebook");
  assert.equal(hundred.items[0].quantity, 99);
  assert.equal(hundred.total, 99 * 9.5);
  const oneHundred = parseOrderText("one hundred candles");
  assert.equal(oneHundred.items[0].quantity, 99);
  assert.equal(oneHundred.total, 99 * 13.5);
  const twoHundred = parseOrderText("two hundred mugs");
  assert.equal(twoHundred.items[0].quantity, 99);
  const thousand = parseOrderText("a thousand candles");
  assert.equal(thousand.items[0].quantity, 99);
});

test("a scale remainder adds, and a scale survives an adjective and a dozen", () => {
  const rest = parseOrderText("a hundred and five mugs");
  assert.equal(rest.items[0].quantity, 99);
  assert.equal(rest.total, 99 * 12);
  const compoundRest = parseOrderText("one thousand and twenty-one candles");
  assert.equal(compoundRest.items[0].quantity, 99);
  const adj = parseOrderText("a hundred ceramic mugs");
  assert.equal(adj.items[0].quantity, 99);
  const dozen = parseOrderText("a hundred dozen mugs");
  assert.equal(dozen.items[0].quantity, 99);
});

test("negation still covers scale phrasing and the standard example is unchanged", () => {
  const d = parseOrderText("no hundred mugs, just a notebook");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "notebook");
  assert.equal(d.total, 9.5);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
});

test("a quantity before 'more' drafts that quantity", () => {
  const two = parseOrderText("two more mugs");
  assert.equal(two.items.length, 1);
  assert.equal(two.items[0].quantity, 2);
  assert.equal(two.total, 24);
  const digits = parseOrderText("3 more candles");
  assert.equal(digits.items[0].quantity, 3);
  assert.equal(digits.total, 40.5);
  const dozen = parseOrderText("a dozen more mugs");
  assert.equal(dozen.items[0].quantity, 12);
  assert.equal(dozen.total, 144);
  const summed = parseOrderText("two mugs and two more mugs");
  assert.equal(summed.items.length, 1);
  assert.equal(summed.items[0].quantity, 4);
  assert.equal(summed.total, 48);
});

test("'more' survives a connector and an adjective, and alone invents nothing", () => {
  const connector = parseOrderText("two more of the mugs");
  assert.equal(connector.items[0].quantity, 2);
  assert.equal(connector.total, 24);
  const adj = parseOrderText("two more ceramic mugs");
  assert.equal(adj.items[0].quantity, 2);
  const bare = parseOrderText("more mugs please");
  assert.equal(bare.items[0].quantity, 1);
  assert.equal(bare.total, 12);
});

test("negation still covers 'more' phrasing and the standard example is unchanged", () => {
  const d = parseOrderText("no more mugs, just a candle");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "candle");
  assert.equal(d.total, 13.5);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
});

test("a standalone cup still means a mug (catalog keyword)", () => {
  const d = parseOrderText("coffee cups");
  assert.equal(d.items.find((i) => i.sku === "coffee-beans").quantity, 1);
  assert.equal(d.items.find((i) => i.sku === "mug").quantity, 1);
  assert.equal(d.total, 30);
});

test("hyphenated half-dozen forms draft six, not twelve", () => {
  for (const text of ["half-dozen mugs", "half-a-dozen mugs", "a half-dozen mugs", "half-a-dozen ceramic mugs"]) {
    const d = parseOrderText(text);
    assert.equal(d.items.length, 1, text);
    assert.equal(d.items[0].quantity, 6, text);
    assert.equal(d.total, 72, text);
  }
});

test("hyphenated counted dozen drafts the counted amount", () => {
  const two = parseOrderText("two-dozen mugs");
  assert.equal(two.items[0].quantity, 24);
  assert.equal(two.total, 288);
  const three = parseOrderText("three-dozen candles");
  assert.equal(three.items[0].quantity, 36);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
});

test("negation covers half and hyphenated quantity phrasing", () => {
  for (const text of [
    "no half a dozen mugs, just a candle",
    "no half-dozen mugs, just a candle",
    "no half-a-dozen mugs, just a candle",
    "no twenty-one mugs, just a candle",
  ]) {
    const d = parseOrderText(text);
    assert.equal(d.items.length, 1, text);
    assert.equal(d.items[0].sku, "candle", text);
    assert.equal(d.total, 13.5, text);
  }
});

test("quantity survives a general descriptive adjective before the item", () => {
  const d = parseOrderText("2 black headphones and 3 red mugs");
  assert.equal(d.items.find((i) => i.sku === "headphones").quantity, 2);
  assert.equal(d.items.find((i) => i.sku === "mug").quantity, 3);
  assert.equal(d.total, 2 * 59 + 3 * 12);
  const stacked = parseOrderText("2 large red mugs");
  assert.equal(stacked.items[0].quantity, 2);
  assert.equal(stacked.total, 24);
  const material = parseOrderText("2 leather backpacks");
  assert.equal(material.items[0].quantity, 2);
  assert.equal(material.total, 128);
});

test("dozen, pair, and of-the quantities survive a general adjective", () => {
  const dozen = parseOrderText("a dozen red candles");
  assert.equal(dozen.items[0].quantity, 12);
  assert.equal(dozen.total, 162);
  const pair = parseOrderText("a pair of black headphones");
  assert.equal(pair.items[0].quantity, 2);
  assert.equal(pair.total, 118);
  const connector = parseOrderText("2 of the black mugs");
  assert.equal(connector.items[0].quantity, 2);
  assert.equal(connector.total, 24);
});

test("a general adjective alone invents nothing, and negation covers it", () => {
  const bare = parseOrderText("black headphones please");
  assert.equal(bare.items[0].quantity, 1);
  assert.equal(bare.total, 59);
  const d = parseOrderText("no red mugs, just a candle");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "candle");
  assert.equal(d.total, 13.5);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
});
