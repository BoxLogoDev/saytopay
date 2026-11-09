import { CATALOG } from "./catalog.js";

const NUMBER_WORDS = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};

const QUANTITY_TOKEN = String.raw`\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|a|an`;

function quantityValue(token) {
  if (token == null) return 1;
  return /^\d+$/.test(token) ? parseInt(token, 10) : NUMBER_WORDS[token] ?? 1;
}

// Descriptive words from the catalog's own item names (plus common size
// words) that buyers naturally put between a quantity and the item:
// "2 wireless headphones", "a dozen ceramic mugs", "2 steel water bottles".
// They carry no quantity or product meaning of their own, so the quantity
// lookup may skip over them — before this, every such sentence silently
// drafted a quantity of 1.
const FILLER_WORDS = new Set([
  "wireless", "steel", "ceramic", "paper", "paperback", "cotton",
  "mechanical", "canvas", "scented", "large", "small", "fresh",
]);

// Quantity may also be written after the item, shopping-list style:
// "mugs x3", "coffee beans x2", "headphones x 2". Before this, the
// trailing count was silently ignored and every such sentence drafted
// a quantity of 1. Only a digit count after x/× counts — a bare "x"
// with no number invents nothing.
function detectTrailingQuantity(afterRaw) {
  const m = String(afterRaw || "").match(/^\s*[x×]\s*(\d{1,3})\b/);
  return m ? parseInt(m[1], 10) : null;
}

function detectQuantity(beforeRaw) {
  let before = beforeRaw;
  for (let i = 0; i < 3; i += 1) {
    const tail = before.match(/([a-z]+)\s*$/);
    if (!tail || !FILLER_WORDS.has(tail[1])) break;
    before = before.slice(0, before.length - tail[0].length);
  }
  // A quantity may be separated from its item by an "of" connector:
  // "two of the mugs", "three of those candles", "a dozen of the
  // mugs". Before this, the connector hid the quantity and every
  // such sentence silently drafted a quantity of 1. Stripping one
  // trailing "of (the|those|these|that|them)" — or a bare "of" —
  // exposes the quantity (or dozen form) written before it. A
  // connector with no quantity before it still drafts 1.
  const connector = before.match(/\bof\s+(?:the|those|these|that|them)\s*$|\bof\s*$/);
  if (connector) before = before.slice(0, before.length - connector[0].length);
  const halfDozen = before.match(/half\s+(?:a\s+)?dozen\s*(?:of\s*)?$/);
  if (halfDozen) return 6;
  const dozen = before.match(new RegExp(`(${QUANTITY_TOKEN})?\\s*dozen\\s*(?:of\\s*)?$`));
  if (dozen) return quantityValue(dozen[1]) * 12;
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
  ...Object.keys(NUMBER_WORDS), "any", "the", "add", "include", "want",
  "need", "buy", "get", "please", ...FILLER_WORDS,
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
  const between = (cue[2] || "").trim().split(/\s+/).filter(Boolean);
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
    const before = input.slice(Math.max(0, hit.start - 24), hit.start);
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
