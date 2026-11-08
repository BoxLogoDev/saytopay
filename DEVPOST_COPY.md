# SayToPay — Devpost Submission Copy (ready to paste)

Placeholders in [BRACKETS] are filled only with measured values from a real
sandbox run and the real public links. Nothing else in this file needs
editing at submission time.

## Project name
SayToPay

## Tagline (one line)
Type what you want to buy in one sentence — SayToPay builds the order draft and completes a real PayPal sandbox payment: create order → approve → capture.

## Categories
AI Shopping Assistant · Agentic Commerce

## Built with
Node.js (no external dependencies), PayPal Orders v2 API (sandbox), HTML/CSS/JavaScript

## Inspiration
Checkout still starts with a cart you assemble by hand: search, click, count,
repeat. Language models made "just say what you want" a normal interface for
everything except paying. We wanted the sentence to reach all the way to a
real payment — not a mock checkout.

## What it does
SayToPay takes one natural-language sentence (for example, "2 coffee beans
and a notebook"), converts it into a structured order draft with items,
quantities, and a total, lets the buyer review the draft, and then completes
a real PayPal sandbox payment through the Orders flow: create order →
buyer approval → capture. The draft is editable (quantities, removals), and
the server reprices it from the catalog before payment, so client-supplied
prices are never trusted. On return from approval the app looks the order
up before capturing, so refreshing the result page never captures twice.
The result screen shows the order ID, capture ID,
and amount as proof, and the same transaction is visible in the PayPal
sandbox dashboard.

Demo transaction (sandbox): order ID [SANDBOX_ORDER_ID], capture ID
[SANDBOX_CAPTURE_ID], amount $45.50 USD, status COMPLETED.

## How we built it
- A single AI-style step at the front: `parseOrderText()` in
  `src/parseOrder.js` turns the sentence into `{ items, total, currency }`.
  It is a deterministic offline parser over a small demo catalog, placed
  behind a function boundary so an LLM call can replace it without touching
  the payment flow.
- PayPal integration is the center: `src/paypal.js` implements the Orders v2
  flow — OAuth token, create order with the draft's line items, and capture
  after buyer approval — against `api-m.sandbox.paypal.com`.
- A dependency-free Node.js server (`src/server.js`) and a single-page UI
  (`public/`) keep the whole demo runnable with `npm start` and no build
  step.
- Tests (`npm test`, 14 passing) cover the parser, the server-side draft
  repricing (a draft claiming $0.01 per item is corrected to the $45.50
  catalog total before capture), the `.env` loader, the order status
  lookup across CREATED → APPROVED → COMPLETED, and a full create →
  approve → capture run against a local stand-in for the PayPal API,
  including refusing to capture before approval.

## Built during the hackathon
All of SayToPay — parser, PayPal client, server, UI, and tests — was built
during the hackathon period for this submission. No pre-existing project
code was reused.

## Challenges we ran into
Keeping the language step honest: a longer product name ("notebook") must
not also match a shorter one ("book"), so the parser claims text spans
longest-keyword-first. We also designed the app to fail explicitly —
without sandbox credentials the payment endpoints return
`paypal_credentials_missing` instead of pretending a payment happened.

## Accomplishments that we're proud of
One sentence really does end in a captured PayPal sandbox payment, with the
transaction ID as proof — and the entire project runs with zero installed
dependencies.

## What we learned
The hard part of agentic commerce is not the language step; it is keeping a
reviewable, auditable draft between the sentence and the money. That draft
is what makes an AI-initiated payment trustworthy.

## What's next for SayToPay
Replace the offline parser with an LLM call behind the same function
boundary, widen the catalog, and add a confirmation summary spoken back to
the buyer before approval.

## Try it out / Links
- Public repository: https://github.com/BoxLogoDev/saytopay
- Demo video (under 3 minutes): [VIDEO_URL]
- Run locally: Node.js 18+, set `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET`
  from your own PayPal sandbox app, then `npm start`. Sandbox only — no
  real money moves.

## Evidence checklist (attach at submission)
- [ ] Sandbox transaction: order ID + capture ID above, filled from the real run
- [ ] Screenshot: PayPal sandbox dashboard showing the same transaction
- [ ] Screenshot: app result screen showing COMPLETED and the capture ID
- [ ] Public repository link with MIT LICENSE file
- [ ] Demo video link, runtime under 3:00
- [ ] Solo entry confirmed on the form
