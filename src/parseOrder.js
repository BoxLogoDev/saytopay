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

function detectQuantity(beforeRaw) {
  let before = beforeRaw;
  for (let i = 0; i < 3; i += 1) {
    const tail = before.match(/([a-z]+)\s*$/);
    if (!tail || !FILLER_WORDS.has(tail[1])) break;
    before = before.slice(0, before.length - tail[0].length);
  }
  const halfDozen = before.match(/half\s+(?:a\s+)?dozen\s*(?:of\s*)?$/);
  if (halfDozen) return 6;
  const dozen = before.match(new RegExp(`(${QUANTITY_TOKEN})?\\s*dozen\\s*(?:of\\s*)?$`));
  if (dozen) return quantityValue(dozen[1]) * 12;
  const m = before.match(new RegExp(`(${QUANTITY_TOKEN})\\s*(?:x\\s*)?$`));
  if (m) return quantityValue(m[1]);
  return 1;
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
      let from = 0;
      for (;;) {
        const idx = input.indexOf(keyword, from);
        if (idx === -1) break;
        hits.push({ product, keyword, start: idx, end: idx + keyword.length });
        from = idx + keyword.length;
      }
    }
  }
  hits.sort((a, b) => b.keyword.length - a.keyword.length || a.start - b.start);

  const claimed = [];
  const matched = new Map(); // sku -> { product, firstStart, quantity }
  for (const hit of hits) {
    if (claimed.some(([s, e]) => hit.start < e && s < hit.end)) continue;
    claimed.push([hit.start, hit.end]);
    // Look backwards from the keyword for a quantity: "2 coffees", "two mugs".
    // Dozen forms count too: "a dozen mugs" is 12, "two dozen mugs" is 24,
    // and "half a dozen mugs" is 6 — before this, all of them silently
    // drafted a quantity of 1.
    const before = input.slice(Math.max(0, hit.start - 24), hit.start);
    let quantity = detectQuantity(before);
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
