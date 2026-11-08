# SayToPay

Type what you want to buy in one sentence. SayToPay turns natural language into a structured order draft, lets you review it, and completes a real **PayPal sandbox** payment — create order → approve → capture — with the transaction ID as proof.

Built for the PayPal AI Hackathon 2026. Category: AI Shopping Assistant / Agentic Commerce.

## How it works

1. **Say it** — one sentence, e.g. `2 coffee beans and a notebook`.
2. **Review and edit the draft** — the app's single AI-style step converts the sentence into items, quantities and a total (`src/parseOrder.js`). It is a deterministic offline parser over a small demo catalog, behind a function boundary that an LLM call can replace without touching the payment flow. You can then adjust quantities or remove items in the draft table; the server reprices the edited draft from the catalog (`src/draft.js`) — client-supplied prices are never trusted.
3. **Pay with PayPal (sandbox)** — the server rebuilds the draft from the catalog (SKU + quantity only), creates a PayPal Orders v2 order, redirects the buyer to the PayPal approval page, and captures the order on return (`src/paypal.js`, `src/server.js`).
4. **Proof** — the result screen shows the order ID, capture ID and amount; the same transaction appears in the PayPal sandbox dashboard.

## Run it

Requirements: Node.js 18+ (no dependencies to install).

```bash
# 1. Create a Sandbox app at https://developer.paypal.com/dashboard/
#    and copy its Client ID and Secret into a local .env file
#    (see .env.example; .env is git-ignored and is loaded automatically
#    at startup — shell exports still take precedence).
#    Or export them instead:
export PAYPAL_CLIENT_ID=your-sandbox-client-id
export PAYPAL_CLIENT_SECRET=your-sandbox-secret

# 2. Start
npm start
# -> http://localhost:3000
```

Without credentials the UI still runs and the order-draft step works; the payment endpoints return `paypal_credentials_missing` with setup instructions. **Sandbox only** — no real money moves. Do not set `PAYPAL_ENV=live` for the hackathon demo.

## Demo walkthrough (under 3 minutes)

1. Type `2 coffee beans and a notebook` and click **Build order draft**.
2. Review the draft: Coffee beans 1kg ×2 ($36.00) + Paper notebook ×1 ($9.50) = **$45.50**. Quantities are editable and items removable; the server recalculates the total from the catalog.
3. Click **Pay with PayPal (sandbox)**, approve with a sandbox buyer account, and return.
4. The result screen shows the order ID, capture ID and `COMPLETED` status — the same transaction appears in the PayPal sandbox dashboard.

The full timed filming script lives in `DEMO_SCRIPT.md`, and the Devpost submission text in `DEVPOST_COPY.md`.

## Test

```bash
npm test
```

The test suite (13 tests) covers the natural-language parser, the
server-side draft repricing (a price-tampered draft is corrected to the
catalog total before payment), the `.env` loader, and a full create →
approve → capture run
against a local stand-in for the PayPal API (same app code,
`PAYPAL_API_BASE` pointed at the stand-in), including the refusal to
capture before approval.

## Layout

- `src/parseOrder.js` — natural language → order draft (the AI step)
- `src/draft.js` — server-side repricing of an edited draft from the catalog
- `src/catalog.js` — demo catalog with fixed USD prices
- `src/paypal.js` — PayPal Orders v2 client (token, create, capture)
- `src/env.js` — dependency-free `.env` loader (shell exports win)
- `src/server.js` — HTTP server and API endpoints
- `public/` — the single-page demo UI
- `test/` — parser tests and the end-to-end flow test

## License

MIT — see [LICENSE](LICENSE).
