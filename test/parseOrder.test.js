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

test("parses a trailing number-times count after the item", () => {
  const d = parseOrderText("mugs 3x");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "mug");
  assert.equal(d.items[0].quantity, 3);
  assert.equal(d.total, 36);
  const twoDigit = parseOrderText("mugs 12x");
  assert.equal(twoDigit.items[0].quantity, 12);
  assert.equal(twoDigit.total, 144);
  const list = parseOrderText("candles 2x and a mug");
  assert.equal(list.items.find((i) => i.sku === "candle").quantity, 2);
  assert.equal(list.items.find((i) => i.sku === "mug").quantity, 1);
});

test("parses a trailing number-times count in delimiter forms", () => {
  const colon = parseOrderText("mugs: 3x");
  assert.equal(colon.items[0].quantity, 3);
  const paren = parseOrderText("mugs (3x)");
  assert.equal(paren.items[0].quantity, 3);
  const bracket = parseOrderText("mugs [3x]");
  assert.equal(bracket.items[0].quantity, 3);
  const dash = parseOrderText("mugs - 3x");
  assert.equal(dash.items[0].quantity, 3);
  const equals = parseOrderText("mugs = 3x");
  assert.equal(equals.items[0].quantity, 3);
  const comma = parseOrderText("mugs, 3x");
  assert.equal(comma.items[0].quantity, 3);
});

test("a trailing number-times count invents nothing for a longer number or a glued unit", () => {
  const year = parseOrderText("mugs 2026x");
  assert.equal(year.items[0].quantity, 1);
  const glued = parseOrderText("mugs 3xg");
  assert.equal(glued.items[0].quantity, 1);
  const unit = parseOrderText("coffee beans 500g");
  assert.equal(unit.items[0].quantity, 1);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
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

test("parses a trailing bare-number count after the item", () => {
  const d = parseOrderText("mugs 3");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "mug");
  assert.equal(d.items[0].quantity, 3);
  assert.equal(d.total, 36);
  const list = parseOrderText("mugs 3, candles 2");
  assert.equal(list.items.find((i) => i.sku === "mug").quantity, 3);
  assert.equal(list.items.find((i) => i.sku === "candle").quantity, 2);
  assert.equal(list.total, 63);
  const next = parseOrderText("mugs 3 and candles");
  assert.equal(next.items.find((i) => i.sku === "candle").quantity, 1);
});

test("parses trailing dash and bracket counts after the item", () => {
  const dash = parseOrderText("mugs - 3");
  assert.equal(dash.items[0].quantity, 3);
  assert.equal(dash.total, 36);
  const dashWord = parseOrderText("candles - two");
  assert.equal(dashWord.items[0].quantity, 2);
  assert.equal(dashWord.total, 27);
  const bracket = parseOrderText("mugs [3]");
  assert.equal(bracket.items[0].quantity, 3);
  const bracketWord = parseOrderText("notebooks [two]");
  assert.equal(bracketWord.items[0].quantity, 2);
  assert.equal(bracketWord.total, 19);
  const bracketX = parseOrderText("mugs [x3]");
  assert.equal(bracketX.items[0].quantity, 3);
});

test("parses a trailing equals-sign count after the item", () => {
  const d = parseOrderText("mugs = 3");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "mug");
  assert.equal(d.items[0].quantity, 3);
  assert.equal(d.total, 36);
  const word = parseOrderText("candles = two");
  assert.equal(word.items[0].quantity, 2);
  assert.equal(word.total, 27);
  const tight = parseOrderText("mugs =3");
  assert.equal(tight.items[0].quantity, 3);
});

test("a trailing equals-sign count applies to its own item only", () => {
  const list = parseOrderText("mugs = 3, candles = 2");
  assert.equal(list.items.find((i) => i.sku === "mug").quantity, 3);
  assert.equal(list.items.find((i) => i.sku === "candle").quantity, 2);
  assert.equal(list.total, 63);
  const next = parseOrderText("notebooks = 2 and a mug");
  assert.equal(next.items.find((i) => i.sku === "notebook").quantity, 2);
  assert.equal(next.items.find((i) => i.sku === "mug").quantity, 1);
  assert.equal(next.total, 31);
});

test("an equals sign without a count or with a longer number invents nothing", () => {
  const prose = parseOrderText("a mug = it was great");
  assert.equal(prose.items[0].quantity, 1);
  assert.equal(prose.total, 12);
  const year = parseOrderText("mugs = 2026");
  assert.equal(year.items[0].quantity, 1);
  const colonYear = parseOrderText("mugs: 2026");
  assert.equal(colonYear.items[0].quantity, 1);
  const dashYear = parseOrderText("mugs - 2026");
  assert.equal(dashYear.items[0].quantity, 1);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
});

test("parses a postposed comma count with 'of them'", () => {
  const word = parseOrderText("mugs, three of them");
  assert.equal(word.items.length, 1);
  assert.equal(word.items[0].sku, "mug");
  assert.equal(word.items[0].quantity, 3);
  assert.equal(word.total, 36);
  const digit = parseOrderText("I need mugs, 3 of them please");
  assert.equal(digit.items[0].quantity, 3);
  assert.equal(digit.total, 36);
  const second = parseOrderText("two mugs and candles, three of them");
  assert.equal(second.items.find((i) => i.sku === "mug").quantity, 2);
  assert.equal(second.items.find((i) => i.sku === "candle").quantity, 3);
  assert.equal(second.total, 64.5);
});

test("parses a postposed comma count that closes the sentence", () => {
  const digit = parseOrderText("mugs, 3");
  assert.equal(digit.items[0].quantity, 3);
  assert.equal(digit.total, 36);
  const word = parseOrderText("candles, two");
  assert.equal(word.items[0].quantity, 2);
  assert.equal(word.total, 27);
  const punct = parseOrderText("mugs, 3.");
  assert.equal(punct.items[0].quantity, 3);
});

test("parses a trailing compound number word after a colon, dash, or equals sign", () => {
  const colon = parseOrderText("mugs: twenty-one");
  assert.equal(colon.items[0].quantity, 21);
  assert.equal(colon.total, 252);
  const spaced = parseOrderText("candles: twenty one");
  assert.equal(spaced.items[0].quantity, 21);
  assert.equal(spaced.total, 283.5);
  const dash = parseOrderText("mugs - twenty-one");
  assert.equal(dash.items[0].quantity, 21);
  const equals = parseOrderText("notebooks = forty-two");
  assert.equal(equals.items[0].quantity, 42);
  assert.equal(equals.total, 399);
});

test("parses a trailing compound number word in parentheses or brackets", () => {
  const paren = parseOrderText("mugs (twenty-one)");
  assert.equal(paren.items[0].quantity, 21);
  assert.equal(paren.total, 252);
  const parenSpaced = parseOrderText("mugs (forty two)");
  assert.equal(parenSpaced.items[0].quantity, 42);
  assert.equal(parenSpaced.total, 504);
  const bracket = parseOrderText("mugs [twenty-one]");
  assert.equal(bracket.items[0].quantity, 21);
  const list = parseOrderText("mugs (twenty-one), candles: two");
  assert.equal(list.items.find((i) => i.sku === "mug").quantity, 21);
  assert.equal(list.items.find((i) => i.sku === "candle").quantity, 2);
});

test("parses a postposed comma compound count and keeps the next-item boundary", () => {
  const word = parseOrderText("mugs, twenty-one of them");
  assert.equal(word.items[0].quantity, 21);
  assert.equal(word.total, 252);
  const next = parseOrderText("mugs, twenty-one candles");
  assert.equal(next.items.find((i) => i.sku === "mug").quantity, 1);
  assert.equal(next.items.find((i) => i.sku === "candle").quantity, 21);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
});

test("a comma count followed by another item still belongs to that item", () => {
  const word = parseOrderText("mugs, three candles");
  assert.equal(word.items.find((i) => i.sku === "mug").quantity, 1);
  assert.equal(word.items.find((i) => i.sku === "candle").quantity, 3);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
});

test("a bare number glued to a unit or a longer number invents nothing", () => {
  const unit = parseOrderText("coffee beans 500g");
  assert.equal(unit.items[0].quantity, 1);
  assert.equal(unit.total, 18);
  const year = parseOrderText("mugs 2026");
  assert.equal(year.items[0].quantity, 1);
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

test("a container with an inner count drafts the product of both counts", () => {
  const boxes = parseOrderText("2 boxes of 12 candles");
  assert.equal(boxes.items.length, 1);
  assert.equal(boxes.items[0].sku, "candle");
  assert.equal(boxes.items[0].quantity, 24);
  assert.equal(boxes.total, 24 * 13.5);
  const mugs = parseOrderText("3 boxes of 6 mugs");
  assert.equal(mugs.items[0].quantity, 18);
  assert.equal(mugs.total, 216);
  const one = parseOrderText("a box of 12 candles");
  assert.equal(one.items[0].quantity, 12);
  const noInner = parseOrderText("2 boxes of candles");
  assert.equal(noInner.items[0].quantity, 2);
});

test("container inner counts accept number words, compounds, dozen, and a filler adjective", () => {
  const words = parseOrderText("two boxes of twelve candles");
  assert.equal(words.items[0].quantity, 24);
  const compound = parseOrderText("2 boxes of twenty-one candles");
  assert.equal(compound.items[0].quantity, 42);
  assert.equal(compound.total, 42 * 13.5);
  const dozen = parseOrderText("2 boxes of a dozen candles");
  assert.equal(dozen.items[0].quantity, 24);
  const large = parseOrderText("2 large boxes of 12 candles");
  assert.equal(large.items[0].quantity, 24);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
});

test("negation still covers a container with an inner count", () => {
  const d = parseOrderText("no boxes of 12 candles, just a mug");
  assert.equal(d.items.length, 1);
  assert.equal(d.items[0].sku, "mug");
  assert.equal(d.total, 12);
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

test("trailing dozen counts are read in delimiter forms", () => {
  const colon = parseOrderText("candles: a dozen");
  assert.equal(colon.items[0].quantity, 12);
  assert.equal(colon.total, 162);
  const counted = parseOrderText("candles: two dozen");
  assert.equal(counted.items[0].quantity, 24);
  assert.equal(counted.total, 324);
  const paren = parseOrderText("candles (a dozen)");
  assert.equal(paren.items[0].quantity, 12);
  const bracket = parseOrderText("mugs [a dozen]");
  assert.equal(bracket.items[0].quantity, 12);
  assert.equal(bracket.total, 144);
  const equals = parseOrderText("candles = a dozen");
  assert.equal(equals.items[0].quantity, 12);
  const list = parseOrderText("candles: a dozen, mugs: 2");
  assert.equal(list.items.find((i) => i.sku === "candle").quantity, 12);
  assert.equal(list.items.find((i) => i.sku === "mug").quantity, 2);
  assert.equal(list.total, 162 + 24);
});

test("trailing half-dozen and comma dozen counts are read", () => {
  const half = parseOrderText("mugs: half a dozen");
  assert.equal(half.items[0].quantity, 6);
  assert.equal(half.total, 72);
  const parenHalf = parseOrderText("mugs (half-dozen)");
  assert.equal(parenHalf.items[0].quantity, 6);
  const comma = parseOrderText("mugs, a dozen of them");
  assert.equal(comma.items[0].quantity, 12);
  assert.equal(comma.total, 144);
  const coupleDozen = parseOrderText("mugs: a couple of dozen");
  assert.equal(coupleDozen.items[0].quantity, 24);
  assert.equal(coupleDozen.total, 288);
});

test("trailing pair counts are read, and the standard example is unchanged", () => {
  const pair = parseOrderText("headphones: a pair");
  assert.equal(pair.items[0].quantity, 2);
  assert.equal(pair.total, 118);
  const counted = parseOrderText("headphones (two pairs)");
  assert.equal(counted.items[0].quantity, 4);
  assert.equal(counted.total, 236);
  const commaPair = parseOrderText("headphones, a pair of them");
  assert.equal(commaPair.items[0].quantity, 2);
  const nextItem = parseOrderText("mugs, two dozen candles");
  assert.equal(nextItem.items.find((i) => i.sku === "mug").quantity, 1);
  assert.equal(nextItem.items.find((i) => i.sku === "candle").quantity, 24);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
});

test("trailing scale counts are read in delimiter forms (clamped to 99)", () => {
  const colon = parseOrderText("mugs: a hundred");
  assert.equal(colon.items[0].quantity, 99);
  assert.equal(colon.total, 1188);
  const counted = parseOrderText("candles: two hundred");
  assert.equal(counted.items[0].quantity, 99);
  assert.equal(counted.total, 1336.5);
  const paren = parseOrderText("mugs (a thousand)");
  assert.equal(paren.items[0].quantity, 99);
  const bracket = parseOrderText("notebooks [two hundred]");
  assert.equal(bracket.items[0].quantity, 99);
  const dash = parseOrderText("notebooks - a thousand");
  assert.equal(dash.items[0].quantity, 99);
  const equals = parseOrderText("mugs = a hundred");
  assert.equal(equals.items[0].quantity, 99);
  const list = parseOrderText("mugs: a hundred, candles: 2");
  assert.equal(list.items.find((i) => i.sku === "mug").quantity, 99);
  assert.equal(list.items.find((i) => i.sku === "candle").quantity, 2);
  assert.equal(list.total, 1188 + 27);
});

test("trailing scale counts read an 'and' remainder, a dozen, and the comma form", () => {
  const remainder = parseOrderText("candles: a hundred and five");
  assert.equal(remainder.items[0].quantity, 99);
  const compoundRemainder = parseOrderText("mugs: a hundred and twenty-one");
  assert.equal(compoundRemainder.items[0].quantity, 99);
  const scaledDozen = parseOrderText("candles: a hundred dozen");
  assert.equal(scaledDozen.items[0].quantity, 99);
  const comma = parseOrderText("mugs, a hundred of them");
  assert.equal(comma.items[0].quantity, 99);
  assert.equal(comma.total, 1188);
  const bare = parseOrderText("mugs: hundred");
  assert.equal(bare.items[0].quantity, 99);
});

test("trailing scale counts do not leak, and the standard example is unchanged", () => {
  const nextItem = parseOrderText("mugs, a hundred candles");
  assert.equal(nextItem.items.find((i) => i.sku === "mug").quantity, 1);
  assert.equal(nextItem.items.find((i) => i.sku === "candle").quantity, 99);
  const front = parseOrderText("a hundred notebooks");
  assert.equal(front.items[0].quantity, 99);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
  assert.equal(standard.items.find((i) => i.sku === "coffee-beans").quantity, 2);
  assert.equal(standard.items.find((i) => i.sku === "notebook").quantity, 1);
});

test("a decimal in front of the item never supplies a count", () => {
  assert.equal(parseOrderText("1.5 mugs").items[0].quantity, 1);
  assert.equal(parseOrderText("2.5 mugs").items[0].quantity, 1);
  assert.equal(parseOrderText("0.5 mugs").items[0].quantity, 1);
  assert.equal(parseOrderText("1.25 mugs").items[0].quantity, 1);
  assert.equal(parseOrderText("10.5 mugs").items[0].quantity, 1);
  assert.equal(parseOrderText("1.5 mugs").total, 12);
  const second = parseOrderText("a mug and 1.5 candles");
  assert.equal(second.items.find((i) => i.sku === "mug").quantity, 1);
  assert.equal(second.items.find((i) => i.sku === "candle").quantity, 1);
  assert.equal(second.total, 25.5);
});

test("a decimal before dozen or a scale word drafts one, not the scaled count", () => {
  assert.equal(parseOrderText("1.5 dozen mugs").items[0].quantity, 1);
  assert.equal(parseOrderText("1.5 dozen mugs").total, 12);
  assert.equal(parseOrderText("2.5 hundred candles").items[0].quantity, 1);
  assert.equal(parseOrderText("version 1.5 mugs").items[0].quantity, 1);
});

test("trailing decimals invent nothing, and integer counts are unchanged", () => {
  assert.equal(parseOrderText("mugs: 2.5").items[0].quantity, 1);
  assert.equal(parseOrderText("mugs (1.5)").items[0].quantity, 1);
  assert.equal(parseOrderText("mugs x1.5").items[0].quantity, 1);
  assert.equal(parseOrderText("mugs: 2").items[0].quantity, 2);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
});

test("the irregular plural 'mice' matches the mouse, with its quantity", () => {
  const two = parseOrderText("two mice");
  assert.equal(two.items.length, 1);
  assert.equal(two.items[0].sku, "mouse");
  assert.equal(two.items[0].quantity, 2);
  assert.equal(two.total, 68);
  const mixed = parseOrderText("2 mice and a keyboard");
  assert.equal(mixed.items.find((i) => i.sku === "mouse").quantity, 2);
  assert.equal(mixed.items.find((i) => i.sku === "keyboard").quantity, 1);
  assert.equal(mixed.total, 147);
});

test("'mice' merges with a 'mouse' mention of the same item", () => {
  const merged = parseOrderText("a mouse and two mice");
  assert.equal(merged.items.length, 1);
  assert.equal(merged.items[0].sku, "mouse");
  assert.equal(merged.items[0].quantity, 3);
  assert.equal(merged.total, 102);
  assert.equal(parseOrderText("twenty-one mice").items[0].quantity, 21);
});

test("'mice' inside another word invents nothing, and the standard example is unchanged", () => {
  assert.deepEqual(parseOrderText("micellar water and a promise").items, []);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
});

test("'by the dozen' after the item drafts twelve of that item only", () => {
  const dozen = parseOrderText("mugs by the dozen");
  assert.equal(dozen.items.length, 1);
  assert.equal(dozen.items[0].sku, "mug");
  assert.equal(dozen.items[0].quantity, 12);
  assert.equal(dozen.total, 144);
  const mixed = parseOrderText("buy mugs by the dozen and candles by the dozen");
  assert.equal(mixed.items.find((i) => i.sku === "mug").quantity, 12);
  assert.equal(mixed.items.find((i) => i.sku === "candle").quantity, 12);
  assert.equal(mixed.total, 306);
});

test("'by the pair' drafts two, and the trailing idiom takes precedence", () => {
  const pair = parseOrderText("headphones by the pair");
  assert.equal(pair.items[0].sku, "headphones");
  assert.equal(pair.items[0].quantity, 2);
  assert.equal(pair.total, 118);
  assert.equal(parseOrderText("mugs by the dozen, please").items[0].quantity, 12);
  // The trailing count is written for this exact mention, so it wins
  // over a quantity word before the item, like every trailing form.
  assert.equal(parseOrderText("2 mugs by the dozen").items[0].quantity, 12);
});

test("an unsized 'by the …' unit invents nothing, and the standard example is unchanged", () => {
  assert.equal(parseOrderText("mugs by the case").items[0].quantity, 1);
  assert.equal(parseOrderText("candles by the box").items[0].quantity, 1);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
});

test("the singular 'earbud' matches the headphones, with its quantity", () => {
  const one = parseOrderText("an earbud");
  assert.equal(one.items.length, 1);
  assert.equal(one.items[0].sku, "headphones");
  assert.equal(one.items[0].quantity, 1);
  assert.equal(one.total, 59);
  const mixed = parseOrderText("an earbud and a notebook");
  assert.equal(mixed.items.find((i) => i.sku === "headphones").quantity, 1);
  assert.equal(mixed.items.find((i) => i.sku === "notebook").quantity, 1);
  assert.equal(mixed.total, 68.5);
  assert.equal(parseOrderText("two earbuds").items[0].quantity, 2);
});

test("'earbud' merges with an 'earbuds' mention of the same item", () => {
  const merged = parseOrderText("an earbud and two earbuds");
  assert.equal(merged.items.length, 1);
  assert.equal(merged.items[0].sku, "headphones");
  assert.equal(merged.items[0].quantity, 3);
  assert.equal(merged.total, 177);
});

test("a negated 'earbud' drafts none, and the standard example is unchanged", () => {
  const negated = parseOrderText("no earbud, just a notebook");
  assert.equal(negated.items.length, 1);
  assert.equal(negated.items[0].sku, "notebook");
  assert.equal(negated.total, 9.5);
  const standard = parseOrderText("2 coffee beans and a notebook");
  assert.equal(standard.total, 45.5);
});
