// Demo catalog used by the natural-language order parser.
// Prices are fixed demo prices in USD for the PayPal sandbox only.

/**
 * The public view of the catalog: what a buyer can actually say in a
 * sentence, with prices. Parser internals (keywords) are deliberately not
 * exposed — the UI renders this list so the demo's buyable items are
 * discoverable instead of guessable only from the placeholder text.
 */
export function publicCatalog() {
  return CATALOG.map(({ sku, name, price }) => ({ sku, name, price, currency: "USD" }));
}

export const CATALOG = [
  { sku: "coffee-beans", name: "Coffee beans 1kg", price: 18.0, keywords: ["coffee beans", "coffee bean", "coffee"] },
  { sku: "headphones", name: "Wireless headphones", price: 59.0, keywords: ["headphones", "headphone", "earbuds"] },
  { sku: "notebook", name: "Paper notebook", price: 9.5, keywords: ["notebook", "journal"] },
  { sku: "tshirt", name: "Cotton t-shirt", price: 24.0, keywords: ["t-shirt", "tshirt", "tee shirt", "shirt"] },
  { sku: "keyboard", name: "Mechanical keyboard", price: 79.0, keywords: ["keyboard"] },
  { sku: "mouse", name: "Wireless mouse", price: 34.0, keywords: ["mouse"] },
  { sku: "backpack", name: "Canvas backpack", price: 64.0, keywords: ["backpack", "rucksack"] },
  { sku: "bottle", name: "Steel water bottle", price: 21.0, keywords: ["water bottle", "bottle"] },
  { sku: "plant", name: "Desk plant", price: 15.0, keywords: ["plant", "succulent"] },
  { sku: "candle", name: "Scented candle", price: 13.5, keywords: ["candle"] },
  { sku: "book", name: "Paperback book", price: 16.0, keywords: ["paperback book", "book", "novel"] },
  { sku: "mug", name: "Ceramic mug", price: 12.0, keywords: ["mug", "cup"] },
];
