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

// Compound tens for trailing counts: "twenty-one", "forty two". A
// single-word token can only ever read the tens part ("mugs:
// twenty-one" drafted twenty, not twenty-one) or nothing at all
// where a closing delimiter follows the word ("mugs (twenty-one)"
// drafted one). The trailing patterns try this two-word form first.
const TENS_TOKEN = "twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety";
const ONES_TOKEN = "one|two|three|four|five|six|seven|eight|nine";

function compoundValue(tens, ones) {
  return TENS_WORDS[tens] + ONES_WORDS[ones];
}

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
// with no number invents nothing. The multiplier can also follow its
// number — "mugs 3x", "mugs: 3x", "mugs (3x)" — the mirror of the
// front-of-item "3x mugs" form; before that was read, every such
// entry drafted a quantity of 1 as well.
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
//
// A count can also come after the item behind a comma, the way a
// buyer corrects or confirms an amount out loud: "mugs, three of
// them", "I need mugs, 3 of them please", "mugs, 3". Before this,
// those counts were silently ignored too and every such sentence
// drafted a quantity of 1. The comma form only counts when the
// number closes the mention — followed by "of them/those/these",
// "please", sentence punctuation, or the end of the sentence — so
// the count in "mugs, 3 candles" still belongs to the candles,
// exactly as the bare-number rule below already guarantees.
//
// Every word form above also accepts a compound number word —
// "mugs: twenty-one", "mugs (forty two)", "mugs, twenty-one of
// them". Before this, the compound was read as just its tens word
// ("mugs: twenty-one" drafted twenty) or, where a closing bracket
// or paren followed, as nothing at all ("mugs (twenty-one)"
// drafted one). The one gap noted in the 46th cycle — the
// parenthesised compound — is part of this same fix.
//
// The dozen and pair forms the front-of-item lookup has always
// understood also count when they are written after the item, in
// every delimiter form above: "candles: a dozen", "candles: two
// dozen", "mugs (half a dozen)", "mugs, a dozen of them",
// "headphones: a pair", "headphones (two pairs)". Before this,
// those counts were misread or dropped — "candles: a dozen"
// drafted one, "candles: two dozen" drafted two (only the count
// word was read), "headphones: a pair" drafted one. The x form
// stays digit-only, exactly as documented above.
//
// The scale phrases the front-of-item lookup understands also count
// when they are written after the item, in every delimiter form
// above: "mugs: a hundred", "candles: two hundred", "mugs (a
// thousand)", "mugs, a hundred of them", "candles: a hundred and
// five", "candles: a hundred dozen". Before this, those counts were
// misread or dropped — "mugs: a hundred" drafted one (only the
// article was read) and "candles: two hundred" drafted two (only
// the count word was read). Scaled quantities above ninety-nine are
// clamped by the caller, exactly like the front-of-item scale forms.
const GROUP_PHRASE = `(?:half[-\\s]+(?:a[-\\s]+)?dozen|(?:a[-\\s]+)?couple[-\\s]+of[-\\s]+dozen|(?:(?:${TENS_TOKEN})[-\\s](?:${ONES_TOKEN})|${QUANTITY_WORD_TOKEN}|\\d{1,3})\\s+dozen|dozen|(?:(?:${TENS_TOKEN})[-\\s](?:${ONES_TOKEN})|${QUANTITY_WORD_TOKEN}|\\d{1,3})\\s+(?:pairs?|couples?)|pairs?|couples?)`;

function groupPhraseValue(phrase) {
  const p = String(phrase || "").replace(/-/g, " ").trim();
  if (/^half\s+(?:a\s+)?dozen$/.test(p)) return 6;
  if (/^(?:a\s+)?couple\s+of\s+dozen$/.test(p)) return 24;
  let m = p.match(new RegExp(`^(${TENS_TOKEN})[-\\s](${ONES_TOKEN})\\s+dozen$`));
  if (m) return compoundValue(m[1], m[2]) * 12;
  m = p.match(/^(?:(\d{1,3})(?!\d)|([a-z]+))?\s*dozen$/);
  if (m) return quantityValue(m[1] ?? m[2]) * 12;
  m = p.match(new RegExp(`^(${TENS_TOKEN})[-\\s](${ONES_TOKEN})\\s+(?:pairs?|couples?)$`));
  if (m) return compoundValue(m[1], m[2]) * 2;
  m = p.match(/^(?:(\d{1,3})(?!\d)|([a-z]+))?\s*(?:pairs?|couples?)$/);
  if (m) return quantityValue(m[1] ?? m[2]) * 2;
  return null;
}

const SCALE_COUNT = `(?:(?:${TENS_TOKEN})[-\\s](?:${ONES_TOKEN})|${QUANTITY_WORD_TOKEN}|\\d{1,3}(?!\\d))`;
const SCALE_PHRASE = `(?:${SCALE_COUNT}\\s+)?(?:hundred|thousand)(?:\\s+dozen|\\s+and\\s+${SCALE_COUNT})?`;

function scalePhraseValue(phrase) {
  const p = String(phrase || "").replace(/-/g, " ").trim();
  const dozen = /\sdozen$/.test(p);
  const core = dozen ? p.replace(/\sdozen$/, "") : p;
  const m = core.match(/^(?:(.+?)\s+)?(hundred|thousand)(?:\s+and\s+(.+))?$/);
  if (!m) return null;
  const count = m[1] ? countPhraseValue(m[1]) : 1;
  const base = count * (m[2] === "thousand" ? 1000 : 100);
  if (dozen) return base * 12;
  return base + (m[3] ? countPhraseValue(m[3]) : 0);
}

function detectTrailingQuantity(afterRaw) {
  // A decimal number never supplies a trailing count either:
  // "mugs: 2.5" read the integer part (2) and "mugs x1.5" the digit
  // after the x. Neutralising decimals in this copy makes every
  // trailing pattern below see no count, exactly like the front
  // lookup in detectQuantity.
  const after = String(afterRaw || "").replace(/\d+\.\d+/g, " decimal ");
  const x = after.match(/^\s*[x×]\s*(\d{1,3})\b/);
  if (x) return parseInt(x[1], 10);
  // The multiplier can also be written after its number: "mugs 3x",
  // "mugs: 3x", "mugs (3x)". Before this, every such form drafted
  // one — the digit patterns below need a word boundary after the
  // number, which the attached "x" denies, and the bare-number form
  // refuses a number followed by a letter. This is the mirror of
  // the front-of-item "3x mugs" form. A longer number ("mugs
  // 2026x") or a unit glued after the x ("mugs 3xg") invents
  // nothing, exactly like the other trailing forms.
  const nxBare = after.match(/^\s+(\d{1,3})(?!\d)x(?![a-z])/);
  if (nxBare) return parseInt(nxBare[1], 10);
  const nxColon = after.match(/^\s*:\s*(\d{1,3})(?!\d)x(?![a-z])/);
  if (nxColon) return parseInt(nxColon[1], 10);
  const nxParen = after.match(/^\s*\(\s*(\d{1,3})(?!\d)x\s*\)/);
  if (nxParen) return parseInt(nxParen[1], 10);
  const nxBracket = after.match(/^\s*\[\s*(\d{1,3})(?!\d)x\s*\]/);
  if (nxBracket) return parseInt(nxBracket[1], 10);
  const nxDash = after.match(/^\s*[-\u2013\u2014]\s*(\d{1,3})(?!\d)x(?![a-z])/);
  if (nxDash) return parseInt(nxDash[1], 10);
  const nxEquals = after.match(/^\s*=\s*(\d{1,3})(?!\d)x(?![a-z])/);
  if (nxEquals) return parseInt(nxEquals[1], 10);
  const nxComma = after.match(/^\s*,\s*(\d{1,3})(?!\d)x(?![a-z])(?:\s+of\s+(?:them|those|these)\b|\s+please\b|\s*[.!?;]|\s*$)/);
  if (nxComma) return parseInt(nxComma[1], 10);
  // Compound number words ("twenty-one", "forty two") come first:
  // the single-word patterns below would read only the tens word
  // where they can match at all. The x form stays digit-only, as
  // documented above.
  const colonCompound = after.match(new RegExp(`^\\s*:\\s*(${TENS_TOKEN})[-\\s](${ONES_TOKEN})\\b`));
  if (colonCompound) return compoundValue(colonCompound[1], colonCompound[2]);
  const parenCompound = after.match(new RegExp(`^\\s*\\(\\s*(?:[x×]\\s*)?(${TENS_TOKEN})[-\\s](${ONES_TOKEN})\\s*\\)`));
  if (parenCompound) return compoundValue(parenCompound[1], parenCompound[2]);
  const bracketCompound = after.match(new RegExp(`^\\s*\\[\\s*(?:[x×]\\s*)?(${TENS_TOKEN})[-\\s](${ONES_TOKEN})\\s*\\]`));
  if (bracketCompound) return compoundValue(bracketCompound[1], bracketCompound[2]);
  const dashCompound = after.match(new RegExp(`^\\s*[-\\u2013\\u2014]\\s*(${TENS_TOKEN})[-\\s](${ONES_TOKEN})\\b`));
  if (dashCompound) return compoundValue(dashCompound[1], dashCompound[2]);
  const equalsCompound = after.match(new RegExp(`^\\s*=\\s*(?:[x×]\\s*)?(${TENS_TOKEN})[-\\s](${ONES_TOKEN})\\b`));
  if (equalsCompound) return compoundValue(equalsCompound[1], equalsCompound[2]);
  const commaCompound = after.match(new RegExp(`^\\s*,\\s*(${TENS_TOKEN})[-\\s](${ONES_TOKEN})\\b(?:\\s+of\\s+(?:them|those|these)\\b|\\s+please\\b|\\s*[.!?;]|\\s*$)`));
  if (commaCompound) return compoundValue(commaCompound[1], commaCompound[2]);
  // Scale phrases come before the single-word patterns below for
  // the same reason: those would read only the count word
  // ("candles: two hundred" drafted two) or just the article
  // ("mugs: a hundred" drafted one).
  const colonScale = after.match(new RegExp(`^\\s*:\\s*(${SCALE_PHRASE})\\b`));
  if (colonScale) return scalePhraseValue(colonScale[1]);
  const parenScale = after.match(new RegExp(`^\\s*\\(\\s*(?:[x×]\\s*)?(${SCALE_PHRASE})\\s*\\)`));
  if (parenScale) return scalePhraseValue(parenScale[1]);
  const bracketScale = after.match(new RegExp(`^\\s*\\[\\s*(?:[x×]\\s*)?(${SCALE_PHRASE})\\s*\\]`));
  if (bracketScale) return scalePhraseValue(bracketScale[1]);
  const dashScale = after.match(new RegExp(`^\\s*[-\\u2013\\u2014]\\s*(${SCALE_PHRASE})\\b`));
  if (dashScale) return scalePhraseValue(dashScale[1]);
  const equalsScale = after.match(new RegExp(`^\\s*=\\s*(?:[x×]\\s*)?(${SCALE_PHRASE})\\b`));
  if (equalsScale) return scalePhraseValue(equalsScale[1]);
  const commaScale = after.match(new RegExp(`^\\s*,\\s*(${SCALE_PHRASE})\\b(?:\\s+of\\s+(?:them|those|these)\\b|\\s+please\\b|\\s*[.!?;]|\\s*$)`));
  if (commaScale) return scalePhraseValue(commaScale[1]);
  // Dozen and pair phrases come before the single-word patterns
  // below: those would read only the count word ("candles: two
  // dozen" drafted two) or just the article ("candles: a dozen"
  // drafted one).
  const colonGroup = after.match(new RegExp(`^\\s*:\\s*(${GROUP_PHRASE})\\b`));
  if (colonGroup) return groupPhraseValue(colonGroup[1]);
  const parenGroup = after.match(new RegExp(`^\\s*\\(\\s*(?:[x×]\\s*)?(${GROUP_PHRASE})\\s*\\)`));
  if (parenGroup) return groupPhraseValue(parenGroup[1]);
  const bracketGroup = after.match(new RegExp(`^\\s*\\[\\s*(?:[x×]\\s*)?(${GROUP_PHRASE})\\s*\\]`));
  if (bracketGroup) return groupPhraseValue(bracketGroup[1]);
  const dashGroup = after.match(new RegExp(`^\\s*[-\\u2013\\u2014]\\s*(${GROUP_PHRASE})\\b`));
  if (dashGroup) return groupPhraseValue(dashGroup[1]);
  const equalsGroup = after.match(new RegExp(`^\\s*=\\s*(?:[x×]\\s*)?(${GROUP_PHRASE})\\b`));
  if (equalsGroup) return groupPhraseValue(equalsGroup[1]);
  const commaGroup = after.match(new RegExp(`^\\s*,\\s*(${GROUP_PHRASE})\\b(?:\\s+of\\s+(?:them|those|these)\\b|\\s+please\\b|\\s*[.!?;]|\\s*$)`));
  if (commaGroup) return groupPhraseValue(commaGroup[1]);
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
  const comma = after.match(new RegExp(`^\\s*,\\s*(?:(\\d{1,3})(?!\\d)|(${QUANTITY_WORD_TOKEN}))\\b(?:\\s+of\\s+(?:them|those|these)\\b|\\s+please\\b|\\s*[.!?;]|\\s*$)`));
  if (comma) return quantityValue(comma[1] ?? comma[2]);
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

// A quantity phrase for the container rules below: a digit count, a
// single number word, or a compound tens phrase ("twenty one").
const QTY_PHRASE = `(?:(?:${TENS_TOKEN})\\s+(?:${ONES_TOKEN})|${QUANTITY_WORD_TOKEN}|\\d{1,3}(?!\\d))`;
// The same phrase, or a dozen form of it ("a dozen", "two dozen",
// "half a dozen", a bare "dozen").
const COUNT_PHRASE = `(?:half\\s+(?:a\\s+)?dozen|(?:${QTY_PHRASE}\\s+)?dozen|${QTY_PHRASE})`;

function countPhraseValue(phrase) {
  const p = String(phrase || "").trim();
  if (/\bdozen$/.test(p)) return groupPhraseValue(p);
  const compound = p.match(new RegExp(`^(${TENS_TOKEN})\\s+(${ONES_TOKEN})$`));
  if (compound) return compoundValue(compound[1], compound[2]);
  return quantityValue(p);
}

// A container can itself carry a count of the item it holds:
// "2 boxes of 12 candles" is two boxes of twelve — 24 candles, not
// 12. Before this, the inner count was the last quantity before the
// item, so it alone was read and the outer container count was
// silently dropped ("3 boxes of 6 mugs" drafted six mugs). A filler
// adjective may sit between the outer count and the container
// ("2 large boxes of 12 candles"). A container with no outer count
// ("a box of 12 candles") needs no rule here: the inner count is
// already the quantity, exactly as the plain rules below read it.
function detectContainerInnerQuantity(before) {
  const filler = [...FILLER_WORDS].join("|");
  const m = before.match(
    new RegExp(
      `(?:^|\\s)(${COUNT_PHRASE})\\s+(?:(?:${filler})\\s+)?(?:boxes|box|packs?|sets?|cases?|bundles?|cartons?)\\s+of\\s+(${COUNT_PHRASE})\\s*$`,
    ),
  );
  if (!m) return null;
  return countPhraseValue(m[1]) * countPhraseValue(m[2]);
}

function detectQuantity(beforeRaw, allowGroup = true) {
  // Hyphenated quantity phrases mean the same as their spaced forms:
  // "half-dozen" and "half-a-dozen" are six, "two-dozen" is twenty-four.
  // Before this, the hyphen hid the count from every rule below, so
  // "half-dozen mugs" silently drafted twelve (double the spoken
  // amount) and "two-dozen mugs" drafted twelve instead of twenty-four.
  // Only the quantity look-back copy is normalised — keyword matching
  // on the original text is untouched.
  let before = stripFillerWords(String(beforeRaw || "").replace(/-/g, " "));
  // A decimal number never supplies a count. The catalog sells whole
  // units, so a fractional amount ("1.5 mugs") cannot be ordered —
  // but before this, the digit patterns below read only the digits
  // after the point: "1.5 mugs" drafted five mugs ($60), "1.25 mugs"
  // drafted twenty-five ($300), and "1.5 dozen mugs" drafted sixty
  // ($720, the fractional digit times twelve). Neutralising every
  // decimal in this look-back copy makes the integer rules see no
  // count in it, so the mention falls back to a single unit, exactly
  // like a longer number ("mugs 2026") or a bare "more". The dozen
  // and scale rules can match with an empty count, so a decimal
  // directly in front of one of those words is refused outright
  // instead of silently becoming a full dozen or hundred.
  before = before.replace(/\d+\.\d+/g, " decimal ");
  if (
    /(?:^|\s)decimal\s+dozen\b/.test(before) ||
    /(?:^|\s)decimal\s+(?:hundred|thousand)\b/.test(before)
  ) {
    return 1;
  }
  // Container with an inner count first: "2 boxes of 12 candles" is
  // the product of the two counts, which no rule below can recover
  // once it has read only the inner one.
  const containerInner = detectContainerInnerQuantity(before);
  if (containerInner != null) return containerInner;
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
 * The built-in rules parser: turn one natural-language sentence into a
 * structured order draft (items, quantities, total) with no API key.
 *
 * This is the no-key path and the fallback of the app's language step.
 * When an LLM API key is configured, src/aiParse.js asks the model
 * first and only uses this parser if that call fails; both paths
 * produce the same draft shape and are repriced from the catalog.
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
    // takes precedence over any quantity word before the item. The
    // window is 24 chars so a full comma form ("…, three of them")
    // still fits after its item; every trailing pattern is anchored
    // to the start of the window, so a longer window matches nothing
    // that does not immediately follow the item.
    const trailing = detectTrailingQuantity(input.slice(hit.end, hit.end + 24));
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
