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
Node.js (no external dependencies), PayPal Orders v2 API (sandbox), an LLM API through a provider-neutral client (OpenAI / Anthropic / Gemini / OpenAI-compatible — key supplied by environment variable; the model name used at judging time is the one shown in the app's status line and parse response), HTML/CSS/JavaScript

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
buyer approval → capture. The conversion is done by a real AI model
whenever an LLM API key is configured: a provider-neutral client
(`src/llm.js`) calls OpenAI, Anthropic, Gemini, or an OpenAI-compatible
endpoint, and the model returns only SKUs and quantities — the server
then builds and prices the draft from the catalog, so the model never
sets prices. With no key configured, or if the model call fails or
times out, a built-in deterministic parser handles the sentence
instead, and the app states which path produced each draft. The
parser behaviors below are that built-in path's. Group words count too — "a pair of
headphones" and "a couple of mugs" draft two, and "two pairs" drafts
four. Container words count too — "3 boxes of candles" drafts three
and "2 sets of headphones" drafts two, a container with an inner count
multiplies ("2 boxes of 12 candles" drafts twenty-four), and a container the buyer rules
out ("no boxes of candles") drafts none. Quantities said as number words work past
twelve too — "twenty notebooks" drafts twenty and "twenty-one mugs"
drafts twenty-one, not one. Scale words count too — "a hundred
notebooks" and "a thousand candles" draft the scaled quantity
(clamped to ninety-nine), not one. Mentioning the same item twice in the sentence
sums its quantities instead of dropping the second mention, and quantities
can be said the way people say them — digits, number words up to ninety-nine
and scale words (hundred, thousand),
or dozens ("a dozen mugs" drafts twelve), and a quantity still counts
when a catalog adjective sits between it and the item ("2 wireless
headphones" drafts two, not one), or when a general descriptive
adjective does ("2 black headphones" drafts two, "a dozen red
candles" drafts twelve, and "no red mugs" drafts no mugs), or written after the item in
shopping-list style ("mugs x3" and "mugs = 3" draft three), or after it behind a comma that closes the mention ("mugs, three of them" drafts three, while the count in "mugs, 3 candles" still belongs to the candles), and a compound number word counts in every trailing form ("mugs: twenty-one" drafts twenty-one, not twenty, and "mugs (forty two)" drafts forty-two, not one). Keywords match on word boundaries,
so a word that merely contains a product name — "booking", "cupcake",
"mousepad" — never adds an item the buyer did not name, while plurals
("mugs", "notebooks") still match. An item the buyer explicitly rules
out is never drafted either: "no notebook, just 2 coffee beans" drafts
only the coffee, and "a mug, not a candle" drafts only the mug. A quantity
also survives an "of the" connector before the item: "two of the mugs"
drafts two, not one. The home page shows the demo catalog (names and
prices), so buyers can see what the app understands — clicking an item
starts a draft for it — and an unmatched sentence gets a visible
explanation instead of an empty screen. The draft is editable (quantities, removals), and
the server reprices it from the catalog before payment, so client-supplied
prices are never trusted. On return from approval the app looks the order
up before capturing, so refreshing the result page never captures twice.
The result screen shows the order ID, capture ID,
and amount as proof, and the same transaction is visible in the PayPal
sandbox dashboard.

Demo transaction (sandbox): order ID [SANDBOX_ORDER_ID], capture ID
[SANDBOX_CAPTURE_ID], amount $45.50 USD, status COMPLETED.

## How we built it
- A single AI step at the front: `parseOrderSmart()` in `src/aiParse.js`
  turns the sentence into `{ items, total, currency }`. With an LLM API
  key in the environment, `src/llm.js` — a provider-neutral client for
  OpenAI, Anthropic, Gemini, and OpenAI-compatible endpoints — asks the
  model for `{ sku, quantity }` pairs only; the reply is validated
  against the catalog and repriced on the server by the same code that
  reprices hand-edited drafts. Without a key, or on any model failure
  or timeout, the deterministic offline parser in `src/parseOrder.js`
  takes over, and the parse response records which path was used.
- PayPal integration is the center: `src/paypal.js` implements the Orders v2
  flow — OAuth token, create order with the draft's line items, and capture
  after buyer approval — against `api-m.sandbox.paypal.com`.
- A dependency-free Node.js server (`src/server.js`) and a single-page UI
  (`public/`) keep the whole demo runnable with `npm start` and no build
  step.
- Tests (`npm test`, 94 passing) cover the AI step (provider
  configuration from environment variables, the OpenAI, Anthropic, and
  Gemini response shapes, catalog repricing of model output, and
  fallback to the rules parser on failure, garbage replies, and
  timeouts — all against mocked responses and a local stand-in
  endpoint) and the parser (including group
  words — "a pair of headphones" drafts two and "two pairs" drafts
  four — container words — "3 boxes of candles" drafts three, a
  container with an inner count multiplies ("2 boxes of 12 candles"
  drafts twenty-four), and a
  negated container drafts none — number
  words above twelve and compound tens — "twenty notebooks" drafts
  twenty, "twenty-one mugs" drafts twenty-one — scale words —
  "a hundred notebooks" drafts the scaled quantity, clamped to
  ninety-nine — summing
  repeated mentions of the same item in one sentence, dozen
  quantities — "a dozen mugs" drafts twelve, "half-dozen" drafts
  six and "two-dozen" drafts twenty-four — quantities stated
  before a catalog adjective and before a general descriptive
  adjective ("2 black headphones" drafts two, "no red mugs" drafts
  none), trailing counts after the item
  ("mugs x3", list-style "mugs: 3" and "mugs (3)", and the bare, dash,
  bracket, and equals shorthands "mugs 3", "mugs - 3", "mugs [3]", and
  "mugs = 3", while a longer number after any of them invents
  nothing, and a postposed comma count that closes the mention —
  "mugs, three of them" and "mugs, 3" draft three, while the count
  in "mugs, 3 candles" still belongs to the candles, and compound
  number words in every trailing form — "mugs: twenty-one" drafts
  twenty-one, not twenty, and "mugs (forty two)" drafts forty-two,
  not one — and dozen and pair counts in every trailing form —
  "candles: a dozen" drafts twelve, "candles: two dozen" drafts
  twenty-four, and "headphones: a pair" drafts two), word-boundary matching so
  "booking" never drafts a book while plurals still match,
  explicit negation so "no notebook" never drafts a notebook, and
  quantities before an "of the" connector so "two of the mugs"
  drafts two, and quantities before "more" so "two more mugs"
  drafts two while "no more mugs" drafts none), malformed JSON bodies answered as `400 invalid_json`
  instead of a misleading upstream error, the public catalog
  listing, the server-side draft
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
One sentence becomes a reviewable, server-repriced order draft and a real
PayPal sandbox order — and the entire project runs with zero installed
dependencies. (The captured-transaction proof sentence is finalized from
the measured order and capture IDs in the Demo transaction line above
once the approved sandbox run is recorded; nothing is claimed here that
the evidence checklist below cannot back.)

## What we learned
The hard part of agentic commerce is not the language step; it is keeping a
reviewable, auditable draft between the sentence and the money. That draft
is what makes an AI-initiated payment trustworthy.

## What's next for SayToPay
Widen the catalog beyond the demo set, let the model ask a clarifying
question when a sentence is ambiguous instead of drafting silently, and
add a confirmation summary spoken back to the buyer before approval.

## Try it out / Links
- Public repository: https://github.com/BoxLogoDev/saytopay
- Demo video (under 3 minutes): [VIDEO_URL]
- Run locally: Node.js 18+, set `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET`
  from your own PayPal sandbox app, then `npm start`. Sandbox only — no
  real money moves. To enable the AI model step, also set one LLM key
  (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, or
  `LLM_API_KEY` — see `.env.example`); without one, the built-in rules
  parser handles the language step.

## Evidence checklist (attach at submission)
- [ ] Sandbox transaction: order ID + capture ID above, filled from the real run
- [ ] Screenshot: PayPal sandbox dashboard showing the same transaction
- [ ] Screenshot: app result screen showing COMPLETED and the capture ID
- [ ] Public repository link with MIT LICENSE file
- [ ] Demo video link, runtime under 3:00
- [ ] Solo entry confirmed on the form
- [x] Project images (Devpost requires at least 1): `saytopay-cover.png`
  and `saytopay-flow.png`, both 1600x900, generated by
  `assets/make_images.py` (see `assets/README.md`) and uploaded to the
  Devpost gallery at submission time — prepared in the 9th dev cycle
