import { CATALOG } from "./catalog.js";

const NUMBER_WORDS = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40,
  fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};

const TENS_WORDS = {
  twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};

const ONES_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9,
};

const QUANTITY_TOKEN = String.raw`\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|a|an`;

// The word-only part of QUANTITY_TOKEN (no \d+ alternative). The
// trailing-count patterns below pair it with a guarded \d{1,3}: the
// shared token's \d+ alternative would otherwise swallow a longer
// number whole ("mugs = 2026" drafted 2026, clamped to 99).
const QUANTITY_WORD_TOKEN = QUANTITY_TOKEN.split("|").slice(1).join("|");

function quantityValue(token) {
  if (token == null) return 1;
  return /^\d+$/.test(token) ? parseInt(token, 10) : NUMBER_WORDS[token] ?? 1;
}

// Descriptive words that buyers naturally put between a quantity and
// the item: the catalog's own item-name adjectives ("2 wireless
// headphones", "a dozen ceramic mugs", "2 steel water bottles") and
// general descriptive adjectives — colors, materials, and common
// qualities ("2 black headphones", "3 red mugs", "a dozen red
// candles", "2 leather backpacks"). They carry no quantity or product
// meaning of their own, so the quantity lookup may skip over them —
// before this, every sentence whose adjective was not one of the
// catalog's own silently drafted a quantity of 1, and a negated one
// ("no red mugs") was drafted at all because the adjective was not
// recognised negation filler either. Because this set feeds both the
// quantity lookup and NEGATION_FILLER below, one list keeps the two
// readings in agreement.
const FILLER_WORDS = new Set([
  "wireless", "steel", "ceramic", "paper", "paperback", "cotton",
  "mechanical", "canvas", "scented", "large", "small", "fresh",
  "black", "white", "red", "blue", "green", "yellow", "orange",
  "pink", "purple", "brown", "gray", "grey", "gold", "golden",
  "silver", "leather", "wooden", "wood", "plastic", "glass",
  "metal", "metallic", "denim", "linen", "rubber", "bamboo",
  "new", "old", "big", "hot", "cold", "warm", "soft", "round",
  "square", "reusable", "portable", "electric", "digital",
  "handmade", "organic", "instant",
]);

// Quantity may also be written after the item, shopping-list style:
// "mugs x3", "coffee beans x2", "headphones x 2". Before this, the
// trailing count was silently ignored and every such sentence drafted
// a quantity of 1. Only a digit count after x/× counts — a bare "x"
// with no number invents nothing.
//
// The same list style also writes the count after a colon or in
// parentheses: "mugs: 3", "candles: two", "mugs (3)", "notebooks
// (two)". Before this, those counts were silently ignored too and
// every such entry drafted a quantity of 1. A colon or parenthesis
// binds the count to the item right before it, so it cannot be
// confused with a quantity written for the next item. A colon with
// no count after it ("a mug: it was great") invents nothing.
//
// List shorthand also writes the count as a bare number, after a
// dash, or in brackets: "mugs 3", "mugs - 3", "candles - two",
// "mugs [3]", "notebooks [two]". Before this, all of those drafted
// a quantity of 1 as well. The bare-number form counts digits only
// and only when the number stands alone — a number glued to a unit
// ("coffee beans 500g") or a longer number ("mugs 2026") invents
// nothing, and a comma still separates items, so the count in
// "mugs, 3 candles" still belongs to the candles.
//
// The same shorthand also writes the count after an equals sign,
// spreadsheet style: "mugs = 3", "candles = two", "mugs =3".
// Before this, those counts were silently ignored too and every
// such entry drafted a quantity of 1. An equals sign with no count
// after it ("a mug = it was great") invents nothing, and a longer
// number ("mugs = 2026") invents nothing either, exactly like the
// bare-number form.
function detectTrailingQuantity(afterRaw) {
  const after = String(afterRaw || "");
  const x = after.match(/^\s*[x×]\s*(\d{1,3})\b/);
  if (x) return parseInt(x[1], 10);
  const colon = after.match(new RegExp(`^\\s*:\\s*(?:(\\d{1,3})(?!\\d)|(${QUANTITY_WORD_TOKEN}))\\b`));
  if (colon) return quantityValue(colon[1] ?? colon[2]);
  const paren = after.match(new RegExp(`^\\s*\\(\\s*(?:[x×]\\s*)?(?:(\\d{1,3})(?!\\d)|(${QUANTITY_WORD_TOKEN}))\\s*\\)`));
  if (paren) return quantityValue(paren[1] ?? paren[2]);
  const bracket = after.match(new RegExp(`^\\s*\\[\\s*(?:[x×]\\s*)?(?:(\\d{1,3})(?!\\d)|(${QUANTITY_WORD_TOKEN}))\\s*\\]`));
  if (bracket) return quantityValue(bracket[1] ?? bracket[2]);
  const dash = after.match(new RegExp(`^\\s*[-\\u2013\\u2014]\\s*(?:(\\d{1,3})(?!\\d)|(${QUANTITY_WORD_TOKEN}))\\b`));
  if (dash) return quantityValue(dash[1] ?? dash[2]);
  const equals = after.match(new RegExp(`^\\s*=\\s*(?:[x×]\\s*)?(?:(\\d{1,3})(?!\\d)|(${QUANTITY_WORD_TOKEN}))\\b`));
  if (equals) return quantityValue(equals[1] ?? equals[2]);
  const bare = after.match(/^\s+(\d{1,3})(?![\dA-Za-z])(?!\.\d)/);
  if (bare) return parseInt(bare[1], 10);
  return null;
}

function stripFillerWords(before) {
  let out = before;
  for (let i = 0; i < 3; i += 1) {
    const tail = out.match(/([a-z]+)\s*$/);
    if (!tail || !FILLER_WORDS.has(tail[1])) break;
    out = out.slice(0, out.length - tail[0].length);
  }
  return out;
}

// Container words buyers put between a quantity and the item:
// "3 boxes of candles", "2 sets of headphones", "two packs of coffee
// beans". The container is not a catalog item of its own — in this demo
// catalog each container counts as one unit of the item it holds — so
// the word (and its "of") is skipped to expose the quantity written
// before it. Before this, the container hid the quantity and every
// such sentence silently drafted a quantity of 1, and a negated
// container ("no boxes of candles") was drafted at all because the
// container words were not recognised negation filler either.
const CONTAINER_WORDS = [
  "box", "boxes", "pack", "packs", "set", "sets",
  "case", "cases", "bundle", "bundles", "carton", "cartons",
];

function detectQuantity(beforeRaw, allowGroup = true) {
  // Hyphenated quantity phrases mean the same as their spaced forms:
  // "half-dozen" and "half-a-dozen" are six, "two-dozen" is twenty-four.
  // Before this, the hyphen hid the count from every rule below, so
  // "half-dozen mugs" silently drafted twelve (double the spoken
  // amount) and "two-dozen mugs" drafted twelve instead of twenty-four.
  // Only the quantity look-back copy is normalised — keyword matching
  // on the original text is untouched.
  let before = stripFillerWords(String(beforeRaw || "").replace(/-/g, " "));
  // A quantity may be separated from its item by an "of" connector:
  // "two of the mugs", "three of those candles", "a dozen of the
  // mugs". Before this, the connector hid the quantity and every
  // such sentence silently drafted a quantity of 1. Stripping one
  // trailing "of (the|those|these|that|them)" — or a bare "of" —
  // exposes the quantity (or dozen form) written before it. A
  // connector with no quantity before it still drafts 1.
  const connector = before.match(/\bof\s+(?:the|those|these|that|them)\s*$|\bof\s*$/);
  if (connector) before = before.slice(0, before.length - connector[0].length);
  // Skip one trailing container word ("3 boxes of …" → "3"), then any
  // catalog adjective that sat in front of it ("2 large boxes of …").
  const container = before.match(/\b(?:boxes|box|packs?|sets?|cases?|bundles?|cartons?)\s*$/);
  if (container) before = stripFillerWords(before.slice(0, before.length - container[0].length));
  // "More" between a quantity and its item: "two more mugs", "3 more
  // candles", "a dozen more mugs", "two more of the mugs". Before
  // this, "more" hid the quantity and every such sentence silently
  // drafted a quantity of 1, and "no more mugs" was drafted at all
  // because "more" was not recognised negation filler either. A bare
  // "more mugs" still drafts 1 — "more" alone invents no quantity.
  const more = before.match(/\bmore\s*$/);
  if (more) before = stripFillerWords(before.slice(0, before.length - more[0].length));
  const halfDozen = before.match(/half\s+(?:a\s+)?dozen\s*(?:of\s*)?$/);
  if (halfDozen) return 6;
  // "A couple of dozen mugs" is two dozen — 24, not 12. The generic
  // dozen rule below cannot see the "couple" across the "of", so this
  // combined form is checked first.
  if (/(?:^|\s)(?:a\s+)?couple\s+of\s+dozen\s*(?:of\s*)?$/.test(before)) return 24;
  // Scale words: "a hundred mugs", "one hundred candles", "two
  // hundred notebooks", "a thousand candles" — a scale word multiplies
  // the count before it (default one), and an "and" remainder adds
  // ("a hundred and five mugs"). Before this, scale words were not
  // number words at all, so every such sentence silently drafted a
  // quantity of 1 — or, with a remainder, just the remainder ("a
  // hundred and five mugs" drafted five). Quantities above 99 are
  // clamped by the caller, as with every other form.
  const scaleDozen = before.match(new RegExp(`(?:^|\\s)(?:(${QUANTITY_TOKEN})\\s+)?(hundred|thousand)\\s+dozen\\s*(?:of\\s*)?$`));
  if (scaleDozen) return quantityValue(scaleDozen[1]) * (scaleDozen[2] === "thousand" ? 1000 : 100) * 12;
  const scale = before.match(new RegExp(`(?:^|\\s)(?:(${QUANTITY_TOKEN})\\s+)?(hundred|thousand)(?:\\s+and\\s+(?:(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[-\\s](one|two|three|four|five|six|seven|eight|nine)|(${QUANTITY_TOKEN})))?\\s*$`));
  if (scale) {
    const base = quantityValue(scale[1]) * (scale[2] === "thousand" ? 1000 : 100);
    const rest = scale[3] ? TENS_WORDS[scale[3]] + ONES_WORDS[scale[4]] : scale[5] ? quantityValue(scale[5]) : 0;
    return base + rest;
  }
  const dozen = before.match(new RegExp(`(${QUANTITY_TOKEN})?\\s*dozen\\s*(?:of\\s*)?$`));
  if (dozen) return quantityValue(dozen[1]) * 12;
  // Group words: "a pair of headphones", "a couple of mugs", "two
  // pairs of headphones" — a pair/couple is two of the item, and a
  // counted number of pairs multiplies ("two pairs" is four). Before
  // this, every such sentence silently drafted a quantity of 1. The
  // count before the group word is read by recursing on the prefix
  // (so "a dozen pairs" is 24 and "twenty-one pairs" is 42); the
  // recursion is one level only.
  if (allowGroup) {
    const group = before.match(/\b(?:pairs?|couples?)\s*$/);
    if (group) {
      const prefix = before.slice(0, before.length - group[0].length);
      return detectQuantity(prefix, false) * 2;
    }
  }
  // Compound tens: "twenty-one mugs" and "twenty one mugs" are 21.
  // Before this, number words stopped at twelve, so every quantity
  // from thirteen up silently drafted 1.
  const compound = before.match(/(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[-\s](one|two|three|four|five|six|seven|eight|nine)\s*(?:x\s*)?$/);
  if (compound) return TENS_WORDS[compound[1]] + ONES_WORDS[compound[2]];
  const m = before.match(new RegExp(`(${QUANTITY_TOKEN})\\s*(?:x\\s*)?$`));
  if (m) return quantityValue(m[1]);
  return 1;
}

// A mention the buyer explicitly negates must not be charged for:
// "no notebook, just 2 coffee beans", "2 coffee beans without a
// notebook", "a mug, not a candle", "don't add a mug" all drafted the
// negated item before this check. The negation cue has to sit in the
// same clause as the mention (text after the last , ; . ! ?) and only
// filler between the cue and the item is allowed — determiners, a
// quantity, a catalog adjective, or a verb like "add"/"want" — so a
// cue aimed at an earlier item ("no mug and a candle") never leaks
// onto the next one.
const NEGATION_FILLER = new Set([
  ...Object.keys(NUMBER_WORDS), "any", "the", "more", "half", "add", "include", "want",
  "need", "buy", "get", "please", "pair", "pairs", "couple", "couples",
  "of", "dozen", "hundred", "thousand", "and", ...FILLER_WORDS, ...CONTAINER_WORDS,
]);

function isNegatedMention(input, hitStart) {
  const clauseStart = Math.max(
    input.lastIndexOf(",", hitStart - 1),
    input.lastIndexOf(";", hitStart - 1),
    input.lastIndexOf(".", hitStart - 1),
    input.lastIndexOf("!", hitStart - 1),
    input.lastIndexOf("?", hitStart - 1),
  ) + 1;
  const before = input.slice(clauseStart, hitStart).trim();
  const cue = before.match(/(?:^|\s)(no|not|without|never|don't|dont|do not|exclude|remove)(?:\s+(.+))?$/);
  if (!cue) return false;
  const between = (cue[2] || "").trim().split(/[\s-]+/).filter(Boolean);
  return between.length <= 5 && between.every((w) => NEGATION_FILLER.has(w) || /^\d+$/.test(w));
}

function money(n) {
  return Math.round(n * 100) / 100;
}

/**
 * The single AI-style step of the app: turn one natural-language sentence
 * into a structured order draft (items, quantities, total).
 *
 * This is a deterministic, offline parser over the demo catalog so the demo
 * runs anywhere with no extra API key. The function boundary is the swap
 * point: replace the body with an LLM call that returns the same shape
 * ({ items: [{ sku, name, quantity, unitPrice }], total, currency })
 * and the rest of the PayPal flow is unchanged.
 */
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Find keyword hits on word boundaries only. A plain substring search
// charged buyers for items they never named: "booking" drafted a book
// ($16), "cupcake" drafted a mug via "cup" ($12), and "plantation tour
// and a mousepad" drafted a plant and a mouse ($49). A keyword now
// matches only when it is not flanked by letters, with an optional
// plural suffix ("mugs", "candles", "notebooks") counted as part of
// the same hit — plurals worked before via the substring and must
// keep working.
function findKeywordHits(input, product, keyword) {
  const re = new RegExp(`(?<![a-z])${escapeRegExp(keyword)}(?:es|s)?(?![a-z])`, "g");
  const found = [];
  for (const m of input.matchAll(re)) {
    found.push({ product, keyword, start: m.index, end: m.index + m[0].length });
  }
  return found;
}

export function parseOrderText(text) {
  const input = String(text || "").toLowerCase();
  if (!input.trim()) {
    return { items: [], total: 0, currency: "USD", note: "Empty input." };
  }

  // Collect every keyword hit, longest keyword first, and claim its span so
  // a shorter keyword inside it ("book" inside "notebook") cannot also match.
  const hits = [];
  for (const product of CATALOG) {
    for (const keyword of product.keywords) {
      hits.push(...findKeywordHits(input, product, keyword));
    }
  }
  hits.sort((a, b) => b.keyword.length - a.keyword.length || a.start - b.start);

  const claimed = [];
  const matched = new Map(); // sku -> { product, firstStart, quantity }
  for (const hit of hits) {
    if (claimed.some(([s, e]) => hit.start < e && s < hit.end)) continue;
    claimed.push([hit.start, hit.end]);
    // An explicitly negated mention ("no notebook", "not a candle")
    // claims its span — so "book" inside a negated "notebook" cannot
    // sneak back in — but contributes nothing to the draft. A later
    // positive mention of the same item still counts.
    if (isNegatedMention(input, hit.start)) continue;
    // Look backwards from the keyword for a quantity: "2 coffees", "two mugs".
    // Dozen forms count too: "a dozen mugs" is 12, "two dozen mugs" is 24,
    // and "half a dozen mugs" is 6 — before this, all of them silently
    // drafted a quantity of 1.
    // The look-back window is 48 chars so a full scale phrase
    // ("one thousand and twenty-one …") still fits in front of its item.
    const before = input.slice(Math.max(0, hit.start - 48), hit.start);
    // A trailing "xN" count is written for this exact mention, so it
    // takes precedence over any quantity word before the item.
    const trailing = detectTrailingQuantity(input.slice(hit.end, hit.end + 12));
    let quantity = trailing != null ? trailing : detectQuantity(before);
    quantity = Math.min(Math.max(quantity, 1), 99);
    // A buyer may mention the same item more than once in one sentence
    // ("a mug and three mugs", "1 coffee and 2 coffee beans"). Sum the
    // quantities of every distinct, non-overlapping mention instead of
    // keeping only the first one — the same merge the draft normalizer
    // already applies to edited drafts.
    const existing = matched.get(hit.product.sku);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, 99);
    } else {
      matched.set(hit.product.sku, { product: hit.product, firstStart: hit.start, quantity });
    }
  }

  const items = [...matched.values()]
    .sort((a, b) => a.firstStart - b.firstStart)
    .map(({ product, quantity }) => {
      return {
        sku: product.sku,
        name: product.name,
        quantity,
        unitPrice: product.price,
        lineTotal: money(product.price * quantity),
      };
    });

  const total = money(items.reduce((sum, i) => sum + i.lineTotal, 0));
  return {
    items,
    total,
    currency: "USD",
    note: items.length
      ? "Review the draft, then pay with PayPal (sandbox)."
      : "No catalog item matched. Try: '2 coffee beans and a notebook'.",
  };
}
