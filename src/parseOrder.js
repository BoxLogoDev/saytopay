import { CATALOG } from "./catalog.js";

const NUMBER_WORDS = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

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
  const matched = new Map(); // sku -> hit
  for (const hit of hits) {
    if (claimed.some(([s, e]) => hit.start < e && s < hit.end)) continue;
    claimed.push([hit.start, hit.end]);
    if (!matched.has(hit.product.sku)) matched.set(hit.product.sku, hit);
  }

  const items = [...matched.values()]
    .sort((a, b) => a.start - b.start)
    .map(({ product, start }) => {
      // Look backwards from the keyword for a quantity: "2 coffees", "two mugs".
      const before = input.slice(Math.max(0, start - 20), start);
      const m = before.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten|a|an)\s*(?:x\s*)?$/);
      let quantity = 1;
      if (m) {
        const token = m[1];
        quantity = /^\d+$/.test(token) ? parseInt(token, 10) : NUMBER_WORDS[token] ?? 1;
      }
      quantity = Math.min(Math.max(quantity, 1), 99);
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
