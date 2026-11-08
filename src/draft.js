import { CATALOG } from "./catalog.js";

function money(n) {
  return Math.round(n * 100) / 100;
}

const BY_SKU = new Map(CATALOG.map((p) => [p.sku, p]));

/**
 * Rebuild a client-supplied draft from the catalog, server-side.
 *
 * The browser may edit quantities or remove items, but it is never trusted
 * for prices: unit prices, line totals and the grand total are always
 * recalculated from CATALOG by SKU. Unknown SKUs are dropped, duplicate
 * SKUs are merged, and quantities are clamped to integers in [1, 99]
 * (a quantity of 0 or less removes the item).
 */
export function normalizeDraft(draft) {
  const rawItems = Array.isArray(draft?.items) ? draft.items : [];
  const merged = new Map(); // sku -> quantity, first-seen order kept
  for (const raw of rawItems) {
    const product = BY_SKU.get(raw?.sku);
    if (!product) continue;
    const qty = Math.floor(Number(raw?.quantity));
    if (!Number.isFinite(qty) || qty <= 0) continue;
    merged.set(product.sku, Math.min((merged.get(product.sku) || 0) + qty, 99));
  }
  const items = [...merged.entries()].map(([sku, quantity]) => {
    const product = BY_SKU.get(sku);
    return {
      sku,
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
      ? "Prices recalculated from the catalog on the server."
      : "No valid catalog items in the draft.",
  };
}
