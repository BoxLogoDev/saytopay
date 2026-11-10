# SayToPay — Demo Video Script (target 2:20, hard limit under 3:00)

Filming rule: one packet sentence = one screen. Show only the app, the PayPal
**sandbox** approval page, and the sandbox dashboard. Never show credentials,
a real name, a personal email, or any employer-related material on screen.
Do not fake the payment segment: scenes 4–5 are filmed only after a real
sandbox run succeeds (see Filming status at the bottom).

Narration pace: ~130 words/minute. The full narration below is ~270 words
(about 2:05 spoken), leaving headroom for screen transitions.

## Shot list

### Scene 1 — Problem & hook (0:00–0:20) · Screen: app home, empty input
Narration: "Online checkout still starts with a cart you have to build by
hand — searching, clicking, counting. SayToPay starts with one sentence
instead. You say what you want to buy, and the app builds the order for you."

### Scene 2 — Say it (0:20–0:50) · Screen: type the example sentence, click "Build order draft"
On-screen action: type `2 coffee beans and a notebook`, click
**Build order draft**.
Narration: "Here is the whole input: '2 coffee beans and a notebook.' One
natural-language sentence goes in. The app's AI step — a real language
model when a key is configured, the built-in rules parser otherwise —
reads the items and quantities and turns them into a structured order
draft. There is no separate product search and no manual cart."

### Scene 3 — Review the draft (0:50–1:15) · Screen: order draft table
On-screen action: pause on the draft table — Coffee beans 1kg ×2 ($36.00),
Paper notebook ×1 ($9.50), total **$45.50**. Point to the editable quantity
inputs and Remove buttons without changing the final total.
Narration: "The draft is not a black box. Every item, quantity, and price is
shown before any money moves, and the total is forty-five dollars fifty
cents. You can adjust a quantity or remove an item right in the table, and
the server recalculates every price from the catalog — the browser's
numbers are never trusted."

### Scene 4 — Pay with PayPal sandbox (1:15–1:55) · Screen: PayPal approval → return
On-screen action: click **Pay with PayPal (sandbox)**, complete the sandbox
buyer approval, return to the app.
Narration: "When the draft looks right, one click creates a real PayPal
order through the Orders API and sends you to PayPal to approve it. This is
the sandbox, so no real money moves — but every step, the order creation,
the approval, and the capture, is the real PayPal flow."

### Scene 5 — Proof & close (1:55–2:20) · Screen: payment result + sandbox dashboard
On-screen action: show the result box (order ID, capture ID, $45.50,
COMPLETED), then the same transaction in the PayPal sandbox dashboard.
Narration: "Approval is followed by capture, and the app shows the order ID
and capture ID as proof. The same transaction appears in the PayPal sandbox
dashboard. Say it, review it, pay for it — that is SayToPay."

## Filming checklist

- [ ] Browser zoom set so the draft table and result box are readable
- [ ] Example sentence is exactly `2 coffee beans and a notebook` ($45.50)
- [ ] Sandbox buyer login uses a sandbox test account only
- [ ] No credential, secret, personal email, or real name visible in any tab
- [ ] Total runtime checked after edit: must stay under 3:00
- [ ] Upload as YouTube or Vimeo link for the Devpost form

## Filming status (2026-11-11, 63rd cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`,
  `ai.configured: false` — no LLM key in this environment, so the draft
  on camera is produced by the rules fallback and the draft note says
  so), parse ($45.50 for the filmed example, `source: rules`), catalog
  (12 items), and UI serving were re-verified live in this cycle, and
  `npm test` passes 106/106. Real sandbox order creation for the filmed
  sentence was re-verified (order 8JY965682T022990H, CREATED, $45.50,
  approval URL issued; status lookup returned CREATED with no capture
  — items coffee-beans ×2 + notebook ×1 — and an unapproved capture
  was refused by the real API with 422 `ORDER_NOT_APPROVED`) —
  creation only, not capture. The submission images (cover + flow,
  1600x900) are still in place in the submission-assets folder. The
  owner is traveling in Ishigaki; the approval step still needs the
  owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 62nd cycle's, Step 1 now
  cites the real remote HEAD — the 62nd-cycle commit 78de5243,
  re-read with the GitHub read tool in this cycle — instead of the
  stale 54th-cycle commit it still named, and the placeholder
  re-verification now cites the 63rd cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-11, 62nd cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`,
  `ai.configured: false` — no LLM key in this environment, so the draft
  on camera is produced by the rules fallback and the draft note says
  so), parse ($45.50 for the filmed example, `source: rules`), catalog
  (12 items), and UI serving were re-verified live in this cycle, and
  `npm test` passes 106/106. The parser now also reads a multiplier
  written after its number — "mugs 3x" drafts three, not one —
  verified against the real sandbox (order 28J54742JF615125X, CREATED,
  $36.00, mug ×3). Real sandbox order creation for the filmed
  sentence was re-verified (order 9CP83183YB135401M, CREATED, $45.50,
  approval URL issued; status lookup returned CREATED with no capture
  — items coffee-beans ×2 + notebook ×1 — and an unapproved capture
  was refused by the real API with 422 `ORDER_NOT_APPROVED`) —
  creation only, not capture. The submission images (cover + flow,
  1600x900) are still in place in the submission-assets folder. The
  owner is traveling in Ishigaki; the approval step still needs the
  owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 61st cycle's, Step 1
  notes the 55th- through 62nd-cycle edits are local until the next
  push, and the placeholder re-verification now cites the 62nd cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-11, 61st cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`,
  `ai.configured: false` — no LLM key in this environment, so the draft
  on camera is produced by the rules fallback and the draft note says
  so), parse ($45.50 for the filmed example, `source: rules`), catalog
  (12 items), and UI serving were re-verified live in this cycle, and
  `npm test` passes 103/103. Real sandbox order creation for the filmed
  sentence was re-verified (order 0T334168SG0733824, CREATED, $45.50,
  approval URL issued; status lookup returned CREATED with no capture
  — items coffee-beans ×2 + notebook ×1 — and an unapproved capture
  was refused by the real API with 422 `ORDER_NOT_APPROVED`) —
  creation only, not capture. The submission images (cover + flow,
  1600x900) are still in place in the submission-assets folder. The
  owner is traveling in Ishigaki; the approval step still needs the
  owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 60th cycle's, Step 1
  notes the 55th- through 61st-cycle edits are local until the next
  push, and the placeholder re-verification now cites the 61st cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-11, 60th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`,
  `ai.configured: false` — no LLM key in this environment, so the draft
  on camera is produced by the rules fallback and the draft note says
  so), parse ($45.50 for the filmed example, `source: rules`), catalog
  (12 items), and UI serving were re-verified live in this cycle, and
  `npm test` passes 103/103. The parser now also matches the irregular
  plural "mice" for the mouse — "two mice" drafts two mice ($68),
  verified against the real sandbox (order 5MK46597VS2612811, CREATED,
  $68.00, mouse ×2). Real sandbox order creation for the filmed
  sentence was re-verified (order 7HF50922BF3243722, CREATED, $45.50,
  approval URL issued; status lookup returned CREATED with no capture
  — items coffee-beans ×2 + notebook ×1 — and an unapproved capture
  was refused by the real API with 422 `ORDER_NOT_APPROVED`) —
  creation only, not capture. The submission images (cover + flow,
  1600x900) are still in place in the submission-assets folder. The
  owner is traveling in Ishigaki; the approval step still needs the
  owner's PayPal Developer sign-in.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-11, 59th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`,
  `ai.configured: false` — no LLM key in this environment, so the draft
  on camera is produced by the rules fallback and the draft note says
  so), parse ($45.50 for the filmed example, `source: rules`), catalog
  (12 items), and UI serving were re-verified live in this cycle, and
  `npm test` passes 100/100. The 58th cycle's decimal handling was also
  re-verified live ("1.5 mugs" drafts one mug, $12.00). Real sandbox
  order creation for the filmed sentence was re-verified (order
  71V29207G1916032E, CREATED, $45.50, approval URL issued; status
  lookup returned CREATED with no capture — items coffee-beans ×2 +
  notebook ×1 — and an unapproved capture was refused by the real API
  with 422 `ORDER_NOT_APPROVED`) — creation only, not capture. The
  submission images (cover + flow, 1600x900) are still in place in the
  submission-assets folder. The owner is traveling in Ishigaki; the
  approval step still needs the owner's PayPal Developer sign-in.
- Record-keeping note (this cycle): the 58th cycle's code and doc
  edits are present and verified (100/100 tests, this file's 58th-cycle
  block below, and the runbook's Gate 0 history), but its DEVLOG entry
  was never appended — DEVLOG still ends at the 57th cycle. A
  supplement note in DEVLOG (recorded in the 59th cycle) documents the
  gap instead of back-dating an entry.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-11, 58th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`,
  `ai.configured: false` — no LLM key in this environment, so the draft
  on camera is produced by the rules fallback and the draft note says
  so), parse ($45.50 for the filmed example, `source: rules`), catalog
  (12 items), and UI serving were re-verified live in this cycle, and
  `npm test` passes 100/100. The parser now also refuses to read a
  decimal amount as a count — "1.5 mugs" drafts one mug, not five,
  "1.25 mugs" drafts one, not twenty-five, and "1.5 dozen mugs" drafts
  one, not sixty — verified against the real sandbox with an order
  created from the decimal sentence (order 1GB62448XU781240X, $12.00,
  mug ×1, CREATED; status lookup matched) and the filmed sentence
  re-created (order 7UA282532N840831C, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture — items
  coffee-beans ×2 + notebook ×1 — and an unapproved capture was
  refused by the real API with 422 `ORDER_NOT_APPROVED`) — creation
  only, not capture. The submission images (cover + flow, 1600x900)
  are still in place in the submission-assets folder. The owner is
  traveling in Ishigaki; the approval step still needs the owner's
  PayPal Developer sign-in.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-11, 57th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`,
  `ai.configured: false` — no LLM key in this environment, so the draft
  on camera is produced by the rules fallback and the draft note says
  so), parse ($45.50 for the filmed example, `source: rules`), catalog
  (12 items), and UI serving were re-verified live in this cycle, and
  `npm test` passes 97/97. Real sandbox order creation for the filmed
  sentence was also re-verified (order 63934376W92325625, CREATED,
  $45.50, approval URL issued; status lookup returned CREATED with no
  capture — items coffee-beans ×2 + notebook ×1 — and an unapproved
  capture was refused by the real API with 422 `ORDER_NOT_APPROVED`)
  — creation only, not capture. The submission images (cover + flow,
  1600x900) are still in place in the submission-assets folder. The
  owner is traveling in Ishigaki; the approval step still needs the
  owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 56th cycle's, Step 1
  notes the 54th-cycle DEVLOG entry and the 55th–57th-cycle edits are
  local until the next push, and the placeholder re-verification now
  cites the 57th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-11, 56th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`,
  `ai.configured: false` — no LLM key in this environment, so the draft
  on camera is produced by the rules fallback and the draft note says
  so), parse ($45.50 for the filmed example, `source: rules`), catalog
  (12 items), and UI serving were re-verified live in this cycle, and
  `npm test` passes 97/97. The parser now also reads a scale phrase
  written after the item — "mugs: a hundred" drafts ninety-nine (one
  hundred, clamped), not one, and "candles: two hundred" drafts
  ninety-nine, not two — verified against the real sandbox with an
  order created from that sentence (order 64N51550HJ856735U,
  $1188.00, mug ×99, CREATED; status lookup matched) and the filmed
  sentence re-created (order 66F40026KF659010K, CREATED, $45.50,
  approval URL issued; status lookup returned CREATED with no
  capture — items coffee-beans ×2 + notebook ×1 — and an unapproved
  capture was refused by the real API with 422 `ORDER_NOT_APPROVED`)
  — creation only, not capture. The submission images (cover + flow,
  1600x900) are still in place in the submission-assets folder. The
  owner is traveling in Ishigaki; the approval step still needs the
  owner's PayPal Developer sign-in.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 55th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`,
  `ai.configured: false` — no LLM key in this environment, so the draft
  on camera is produced by the rules fallback and the draft note says
  so), parse ($45.50 for the filmed example, `source: rules`), catalog
  (12 items), and UI serving were re-verified live in this cycle, and
  `npm test` passes 94/94. Real sandbox order creation for the filmed
  sentence was also re-verified (order 8JK04423FL973042P, CREATED,
  $45.50, approval URL issued; status lookup returned CREATED with no
  capture — items coffee-beans ×2 + notebook ×1 — and an unapproved
  capture was refused by the real API with 422 `ORDER_NOT_APPROVED`)
  — creation only, not capture. The submission images (cover + flow,
  1600x900) are still in place in the submission-assets folder. The
  owner is traveling in Ishigaki; the approval step still needs the
  owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 54th cycle's, Step 1
  notes the 54th-cycle DEVLOG entry and the 55th-cycle edits are
  local until the next push, and the placeholder re-verification now
  cites the 55th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 54th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`,
  `ai.configured: false` — no LLM key in this environment, so the draft
  on camera is produced by the rules fallback and the draft note says
  so), parse ($45.50 for the filmed example, `source: rules`), catalog
  (12 items), and UI serving were re-verified live in this cycle, and
  `npm test` passes 94/94. The parser now also multiplies a container
  count by an inner count — "2 boxes of 12 candles" drafts
  twenty-four, not twelve — verified against the real sandbox with an
  order created from that sentence (order 21T11910PT994803L,
  $324.00, candle ×24, CREATED; status lookup matched, and an
  unapproved capture was refused by the real API with 422
  `ORDER_NOT_APPROVED`) and the filmed sentence re-created (order
  7GB081042M823615D, CREATED, $45.50) — creation only, not capture.
  The submission images (cover + flow, 1600x900) are still in place
  in the submission-assets folder. The owner is traveling in
  Ishigaki; the approval step still needs the owner's PayPal
  Developer sign-in.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 53rd cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`,
  `ai.configured: false` — no LLM key in this environment, so the draft
  on camera is produced by the rules fallback and the draft note says
  so), parse ($45.50 for the filmed example, `source: rules`), catalog
  (12 items), and UI serving were re-verified live in this cycle, and
  `npm test` passes 91/91. Real sandbox order creation for the filmed
  sentence was also re-verified (order 5N025594MX428222R, CREATED,
  $45.50, approval URL issued; status lookup returned CREATED with no
  capture — items coffee-beans ×2 + notebook ×1 — and an unapproved
  capture was refused by the real API with 422 `ORDER_NOT_APPROVED`)
  — creation only, not capture. The submission images (cover + flow,
  1600x900) are still in place in the submission-assets folder. The
  owner is traveling in Ishigaki; the approval step still needs the
  owner's PayPal Developer sign-in.
- Accuracy fixes (this cycle): Scene 2 narration no longer calls the
  language step "AI-style" — it now states the real behaviour since
  the 52nd cycle (a real language model when a key is configured, the
  built-in rules parser otherwise). `FILMING_RUNBOOK.md` pre-flight
  now requires 91/91 tests and explains the `ai.configured` health
  field. `SUBMISSION_RUNBOOK.md` Gate 0 now cites this cycle's
  creation order instead of the 51st cycle's, and Step 1 cites the
  52nd-cycle remote HEAD and the 91-test suite.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 39th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  58/58. Real sandbox order creation for the filmed sentence was also
  re-verified (order 3CP48688EL295780Y, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture — items
  coffee-beans ×2 + notebook ×1 — and an unapproved capture was
  refused by the real API with 422 `ORDER_NOT_APPROVED`) — creation
  only, not capture. The submission images (cover + flow, 1600x900)
  are still in place in the submission-assets folder. The owner is
  traveling in Ishigaki; the approval step still needs the owner's
  PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 38th cycle's, Step 1
  notes the 38th-cycle DEVLOG entry and the 39th-cycle edits are
  local until the next push, and the placeholder re-verification now
  cites the 39th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 40th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  61/61. The parser now also reads list-style trailing counts —
  "mugs: 3", "candles: two", and "mugs (3)" draft those quantities
  for that item, while a colon with no count invents nothing —
  verified against the real sandbox with an order created from
  "mugs: 3" (order 4GX52615UX210882D, $36.00, mug ×3, CREATED) and
  the filmed sentence re-created (order 67G497887U836021G, CREATED,
  $45.50, status lookup CREATED with no capture; an unapproved
  capture was refused by the real API with 422
  `ORDER_NOT_APPROVED`) — creation only, not capture. The submission
  images (cover + flow, 1600x900) are still in place in the
  submission-assets folder. The owner is traveling in Ishigaki; the
  approval step still needs the owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 39th cycle's, Step 1
  notes the 39th- and 40th-cycle edits are local until the next push,
  and the placeholder re-verification now cites the 40th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 41st cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  61/61. Real sandbox order creation for the filmed sentence was also
  re-verified (order 83Y63320LP539122C, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture — items
  coffee-beans ×2 + notebook ×1 — and an unapproved capture was
  refused by the real API with 422 `ORDER_NOT_APPROVED`) — creation
  only, not capture. The submission images (cover + flow, 1600x900)
  are still in place in the submission-assets folder. The owner is
  traveling in Ishigaki; the approval step still needs the owner's
  PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 40th cycle's, Step 1
  notes the 40th-cycle DEVLOG entry and the 41st-cycle edits are
  local until the next push, and the placeholder re-verification now
  cites the 41st cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 42nd cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  64/64. The parser now also reads the remaining list shorthands
  after an item — "mugs 3", "mugs - 3", and "mugs [3]" draft three
  mugs, while a number glued to a unit ("coffee beans 500g") or a
  longer number ("mugs 2026") invents nothing — verified against
  the real sandbox with an order created from "mugs 3" (order
  84S607109W473271V, $36.00, mug ×3, CREATED) and the filmed
  sentence re-created (order 3KF70461TG6035500, CREATED, $45.50,
  status lookup CREATED with no capture; an unapproved capture was
  refused by the real API with 422 `ORDER_NOT_APPROVED`) —
  creation only, not capture. The submission images (cover + flow,
  1600x900) are still in place in the submission-assets folder. The
  owner is traveling in Ishigaki; the approval step still needs the
  owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 41st cycle's, Step 1
  notes the 41st- and 42nd-cycle edits are local until the next
  push, and the placeholder re-verification now cites the 42nd
  cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 43rd cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  64/64. Real sandbox order creation for the filmed sentence was also
  re-verified (order 02C08427SH391302H, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture — items
  coffee-beans ×2 + notebook ×1 — and an unapproved capture was
  refused by the real API with 422 `ORDER_NOT_APPROVED`) — creation
  only, not capture. The submission images (cover + flow, 1600x900)
  are still in place in the submission-assets folder. The owner is
  traveling in Ishigaki; the approval step still needs the owner's
  PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 42nd cycle's, Step 1
  notes the 42nd-cycle DEVLOG entry and the 43rd-cycle edits are
  local until the next push, and the placeholder re-verification now
  cites the 43rd cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 50th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  76/76. The parser now also reads dozen and pair counts written
  after the item in every list form — "candles: a dozen" drafts
  twelve, "candles: two dozen" drafts twenty-four, "mugs (half a
  dozen)" drafts six, and "headphones: a pair" drafts two — verified
  against the real sandbox with an order created from "candles: a
  dozen" (order 7E030902YU443464S, $162.00, candle ×12, CREATED;
  status lookup matched) and the filmed sentence re-created (order
  4V457322210776357, CREATED, $45.50, status lookup CREATED with no
  capture — items coffee-beans ×2 + notebook ×1 — and an unapproved
  capture was refused by the real API with 422
  `ORDER_NOT_APPROVED`) — creation only, not capture. The submission
  images (cover + flow, 1600x900) are still in place in the
  submission-assets folder. The owner is traveling in Ishigaki; the
  approval step still needs the owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 49th cycle's, and the
  placeholder re-verification now cites the 50th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 51st cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  76/76. Real sandbox order creation for the filmed sentence was also
  re-verified (order 5DW14048RY3741315, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture — items
  coffee-beans ×2 + notebook ×1 — and an unapproved capture was
  refused by the real API with 422 `ORDER_NOT_APPROVED`) — creation
  only, not capture. The submission images (cover + flow, 1600x900)
  are still in place in the submission-assets folder. The owner is
  traveling in Ishigaki; the approval step still needs the owner's
  PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 50th cycle's, Step 1
  notes the 50th-cycle DEVLOG entry and the 51st-cycle edits are
  local until the next push, and the placeholder re-verification now
  cites the 51st cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 49th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  73/73. Real sandbox order creation for the filmed sentence was also
  re-verified (order 3TY27024AX2159446, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture — items
  coffee-beans ×2 + notebook ×1 — and an unapproved capture was
  refused by the real API with 422 `ORDER_NOT_APPROVED`) — creation
  only, not capture. The submission images (cover + flow, 1600x900)
  are still in place in the submission-assets folder. The owner is
  traveling in Ishigaki; the approval step still needs the owner's
  PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 48th cycle's, Step 1
  notes the 48th-cycle DEVLOG entry and the 49th-cycle edits are
  local until the next push, and the placeholder re-verification now
  cites the 49th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 48th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  73/73. The parser now also reads a compound number word in every
  trailing count form — "mugs: twenty-one" drafts twenty-one, not
  twenty, and "mugs (forty two)" drafts forty-two, not one —
  verified against the real sandbox with an order created from
  "mugs (twenty-one)" (order 7T956112XG984564W, $252.00, mug ×21,
  CREATED; status lookup matched) and the filmed sentence
  re-created (order 8XN98829GL955240B, CREATED, $45.50, status
  lookup CREATED with no capture; an unapproved capture was refused
  by the real API with 422 `ORDER_NOT_APPROVED`) — creation only,
  not capture. The submission images (cover + flow, 1600x900) are
  still in place in the submission-assets folder. The owner is
  traveling in Ishigaki; the approval step still needs the owner's
  PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 47th cycle's, Step 1
  notes the 48th-cycle edits are local until the next push, and the
  placeholder re-verification now cites the 48th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 47th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  70/70. Real sandbox order creation for the filmed sentence was also
  re-verified (order 5M032300AP315353K, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture — items
  coffee-beans ×2 + notebook ×1 — and an unapproved capture was
  refused by the real API with 422 `ORDER_NOT_APPROVED`) — creation
  only, not capture. The submission images (cover + flow, 1600x900)
  are still in place in the submission-assets folder. The owner is
  traveling in Ishigaki; the approval step still needs the owner's
  PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 46th cycle's, Step 1
  notes the 46th-cycle DEVLOG entry and the 47th-cycle edits are
  local until the next push, and the placeholder re-verification now
  cites the 47th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 46th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  70/70. The parser now also reads a postposed comma count that
  closes the mention — "mugs, three of them" drafts three and
  "mugs, 3" drafts three, while the count in "mugs, 3 candles"
  still belongs to the candles — verified against the real sandbox
  with an order created from "mugs, three of them" (order
  758113591U5256639, $36.00, mug ×3, CREATED; status lookup returned
  the same items and amount) and the filmed sentence re-created
  (order 3D074120W79779345, CREATED, $45.50, status lookup CREATED
  with no capture — items coffee-beans ×2 + notebook ×1 — and an
  unapproved capture was refused by the real API with 422
  `ORDER_NOT_APPROVED`) — creation only, not capture. The submission
  images (cover + flow, 1600x900) are still in place in the
  submission-assets folder. The owner is traveling in Ishigaki; the
  approval step still needs the owner's PayPal Developer sign-in.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 45th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  67/67. Real sandbox order creation for the filmed sentence was also
  re-verified (order 9RS07487CN617284H, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture — items
  coffee-beans ×2 + notebook ×1 — and an unapproved capture was
  refused by the real API with 422 `ORDER_NOT_APPROVED`) — creation
  only, not capture. The submission images (cover + flow, 1600x900)
  are still in place in the submission-assets folder. The owner is
  traveling in Ishigaki; the approval step still needs the owner's
  PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 44th cycle's, Step 1
  notes the 44th-cycle DEVLOG entry and the 45th-cycle edits are
  local until the next push, and the placeholder re-verification now
  cites the 45th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 44th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  67/67. The parser now also reads an equals-sign trailing count —
  "mugs = 3" drafts three and "candles = two" drafts two — and a
  longer number after any trailing shorthand invents nothing
  ("mugs = 2026" drafts one) — verified against the real sandbox
  with an order created from "mugs = 3" (order 8JR30170EA025224J,
  $36.00, mug ×3, CREATED; status lookup returned the same items
  and amount) and the filmed sentence re-created (order
  6C392928PC5453305, CREATED, $45.50, status lookup CREATED with
  no capture; an unapproved capture was refused by the real API
  with 422 `ORDER_NOT_APPROVED`) — creation only, not capture. The
  submission images (cover + flow, 1600x900) are still in place in
  the submission-assets folder. The owner is traveling in Ishigaki;
  the approval step still needs the owner's PayPal Developer
  sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now
  cites this cycle's creation order instead of the 43rd cycle's,
  and the placeholder re-verification now cites the 44th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 38th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  58/58. The parser now counts quantities in front of general
  descriptive adjectives, not just the catalog's own — "2 black
  headphones" drafts two ($118), "a dozen red candles" drafts
  twelve, "a pair of black headphones" drafts two, and "no red
  mugs" drafts no mugs — verified against the real sandbox with an
  order created from "2 black headphones" (order
  3FD20730AD638661L, $118.00, headphones ×2, CREATED; status lookup
  returned the same items and amount) and the filmed sentence
  re-created (order 31X868563M5989230, CREATED, $45.50, status
  lookup CREATED with no capture; an unapproved capture was
  refused by the real API with 422 `ORDER_NOT_APPROVED`) —
  creation only, not capture. The submission images (cover + flow,
  1600x900) are still in place in the submission-assets folder. The
  owner is traveling in Ishigaki; the approval step still needs the
  owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 37th cycle's, and the
  placeholder re-verification now cites the 38th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 37th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  55/55. Real sandbox order creation for the filmed sentence was also
  re-verified (order 59F87930C76939222, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture — items
  coffee-beans ×2 + notebook ×1 — and an unapproved capture was
  refused by the real API with 422 `ORDER_NOT_APPROVED`) — creation
  only, not capture. The submission images (cover + flow, 1600x900)
  are still in place in the submission-assets folder. The owner is
  traveling in Ishigaki; the approval step still needs the owner's
  PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 36th cycle's, Step 1
  notes the 36th-cycle DEVLOG entry and the 37th-cycle edits are
  local until the next push, and the placeholder re-verification now
  cites the 37th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 36th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  55/55. The parser now counts hyphenated quantity phrases the same
  as their spaced forms — "half-dozen mugs" drafts six ($72), not
  twelve, and "two-dozen mugs" drafts twenty-four — and negation now
  covers half/hyphenated phrasing ("no half a dozen mugs" drafts no
  mugs), verified against the real sandbox with an order created
  from "half-dozen mugs" (order 32W91710HX352244S, $72.00, mug ×6,
  CREATED; status lookup returned the same items and amount) and the
  filmed sentence re-created (order 8MR87777YY6014117, CREATED,
  $45.50, status lookup CREATED with no capture; an unapproved
  capture was refused by the real API with 422
  `ORDER_NOT_APPROVED`) — creation only, not capture. The submission
  images (cover + flow, 1600x900) are still in place in the
  submission-assets folder. The owner is traveling in Ishigaki; the
  approval step still needs the owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 35th cycle's, Step 1
  notes the 29th–36th-cycle edits are local until the next push, and
  the placeholder re-verification now cites the 36th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 35th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  52/52. Real sandbox order creation for the filmed sentence was also
  re-verified (order 9M484224LN026561R, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture — items
  coffee-beans ×2 + notebook ×1 — and an unapproved capture was
  refused by the real API with 422 `ORDER_NOT_APPROVED`) — creation
  only, not capture. The submission images (cover + flow, 1600x900)
  are still in place in the submission-assets folder. The owner is
  traveling in Ishigaki; the approval step still needs the owner's
  PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 34th cycle's, Step 1
  notes the 29th–35th-cycle edits are local until the next push, and
  the placeholder re-verification now cites the 35th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 34th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  52/52. The parser now understands "more" between a quantity and its
  item — "two more mugs" drafts two ($24) and "a dozen more mugs"
  drafts twelve — and "no more mugs" now drafts no mugs, verified
  against the real sandbox with an order created from that sentence
  (order 6N106878NW1127536, $24.00, mug ×2, CREATED; status lookup
  returned the same items and amount) and the filmed sentence
  re-created (order 1DA33828SJ8068536, CREATED, $45.50, status lookup
  CREATED with no capture; an unapproved capture was refused by the
  real API with 422 `ORDER_NOT_APPROVED`). The filmed example
  sentence and its $45.50 total are unchanged. The submission images
  (cover + flow, 1600x900) are still in place in the submission-assets
  folder. The owner is traveling in Ishigaki; the approval step still
  needs the owner's PayPal Developer sign-in.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 33rd cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  49/49. Real sandbox order creation for the filmed sentence was also
  re-verified (order 9KU884251B974482F, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture, and an
  unapproved capture was refused by the real API with 422
  `ORDER_NOT_APPROVED`) — creation only, not capture. The submission
  images (cover + flow, 1600x900) are still in place in the
  submission-assets folder. The owner is traveling in Ishigaki; the
  approval step still needs the owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 32nd cycle's, Step 1
  notes the 29th–33rd-cycle edits are local until the next push, and
  the placeholder re-verification now cites the 33rd cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 32nd cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  49/49. The parser now understands scale words — "a hundred
  notebooks" drafts ninety-nine (the scaled quantity, clamped) and
  "a hundred and five mugs" drafts the scaled quantity instead of
  just the five — verified against the real sandbox with an order
  created from that sentence (order 3C559409AA541464T, $940.50,
  notebook ×99, CREATED; status lookup returned the same items and
  amount) and the filmed sentence re-created (order
  321244271N371305X, CREATED, $45.50, status lookup CREATED with no
  capture; an unapproved capture was refused by the real API with
  422 `ORDER_NOT_APPROVED`). The filmed example sentence and its
  $45.50 total are unchanged. The submission images (cover + flow,
  1600x900) are still in place in the submission-assets folder. The
  owner is traveling in Ishigaki; the approval step still needs the
  owner's PayPal Developer sign-in.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-10, 31st cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  46/46. Real sandbox order creation for the filmed sentence was also
  re-verified (order 9NM41140LG197135P, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture, and an
  unapproved capture was refused by the real API with 422
  `ORDER_NOT_APPROVED`) — creation only, not capture. The submission
  images (cover + flow, 1600x900) are still in place in the
  submission-assets folder. The owner is traveling in Ishigaki; the
  approval step still needs the owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 30th cycle's, Step 1
  notes the 29th–31st-cycle edits are local until the next push, and
  the placeholder re-verification now cites the 31st cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 30th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  46/46. The parser now understands container words — "3 boxes of
  candles" drafts three ($40.50) and a negated container drafts none —
  verified against the real sandbox with an order created from that
  sentence (order 35S05946D2935991J, $40.50, candle ×3, CREATED; status
  lookup returned the same items and amount) and the filmed sentence
  re-created (order 6Y740682977301323, CREATED, $45.50, status lookup
  CREATED with no capture; an unapproved capture was refused by the
  real API with 422 `ORDER_NOT_APPROVED`). The filmed example sentence
  and its $45.50 total are unchanged. The submission images (cover +
  flow, 1600x900) are still in place in the submission-assets folder.
  The owner is traveling in Ishigaki; the approval step still needs
  the owner's PayPal Developer sign-in.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 29th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  43/43. Real sandbox order creation for the filmed sentence was also
  re-verified (order 1PX73360V23408906, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture, and an
  unapproved capture was refused by the real API with 422
  `ORDER_NOT_APPROVED`) — creation only, not capture. The submission
  images (cover + flow, 1600x900) are still in place in the
  submission-assets folder. The owner is traveling in Ishigaki; the
  approval step still needs the owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 28th cycle's, Step 1
  notes the 29th-cycle edits are local until the next push, and the
  placeholder re-verification now cites the 29th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 28th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  43/43. The parser now understands group words — "a pair of
  headphones" drafts two ($118) and "two pairs of headphones" drafts
  four — verified against the real sandbox with an order created from
  that sentence (order 3L7524324P675093L, $118.00, headphones ×2,
  CREATED; status lookup returned the same items and amount) and the
  filmed sentence re-created (order 0X1503868C460321C, CREATED,
  $45.50, status lookup CREATED with no capture; an unapproved
  capture was refused by the real API with 422
  `ORDER_NOT_APPROVED`). The filmed example sentence and its $45.50
  total are unchanged. The submission images (cover + flow, 1600x900)
  are still in place in the submission-assets folder. The owner is
  traveling in Ishigaki; the approval step still needs the owner's
  PayPal Developer sign-in.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 27th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  40/40. Real sandbox order creation for the filmed sentence was also
  re-verified (order 9XB580908J300582P, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture, and an
  unapproved capture was refused by the real API with 422
  `ORDER_NOT_APPROVED`) — creation only, not capture. The submission
  images (cover + flow, 1600x900) are still in place in the
  submission-assets folder. The owner is traveling in Ishigaki; the
  approval step still needs the owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 26th cycle's, Step 1 now
  cites the verified 26th-cycle remote HEAD
  (d66ed0449794887a2441366a842d1656d5c48d97) instead of the stale
  25th-cycle commit, and the placeholder re-verification now cites
  the 27th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 26th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  40/40. The parser now understands number words above twelve —
  "twenty notebooks" drafts twenty ($190) and "twenty-one mugs"
  drafts twenty-one — verified against the real sandbox with an order
  created from that sentence (order 3DU72477T0435774R, $190.00,
  notebook ×20, CREATED; an unapproved capture was refused by the real
  API with 422 `ORDER_NOT_APPROVED`) and the filmed sentence
  re-created (order 24Y693325A9971517, CREATED, $45.50, status lookup
  CREATED with no capture). The filmed example sentence and its
  $45.50 total are unchanged. The submission images (cover + flow,
  1600x900) are still in place in the submission-assets folder. The
  owner is traveling in Ishigaki; the approval step still needs the
  owner's PayPal Developer sign-in.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 25th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  37/37. Real sandbox order creation for the filmed sentence was also
  re-verified (order 2M500460LG0249640, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture, and an
  unapproved capture was refused by the real API with 422
  `ORDER_NOT_APPROVED`) — creation only, not capture. The submission
  images (cover + flow, 1600x900) are still in place in the
  submission-assets folder. The owner is traveling in Ishigaki; the
  approval step still needs the owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 24th cycle's, Step 1 now
  cites the verified 24th-cycle remote HEAD
  (ad553400913ca7eb05a1c537145bee1a57f115a9) instead of the stale
  23rd-cycle commit, and the placeholder re-verification now cites
  the 25th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 24th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  37/37. This cycle fixed a server error-handling defect: a malformed
  JSON request body was answered `502 upstream_error` (as if PayPal
  were down) and is now `400 invalid_json` on all four POST endpoints.
  Real sandbox order creation for the filmed sentence was also
  re-verified (order 99121525LY221404D, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture, and an
  unapproved capture was refused by the real API with 422
  `ORDER_NOT_APPROVED`) — creation only, not capture. The submission
  images (cover + flow, 1600x900) are still in place in the
  submission-assets folder. The owner is traveling in Ishigaki; the
  approval step still needs the owner's PayPal Developer sign-in.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 23rd cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  36/36. Real sandbox order creation for the filmed sentence was also
  re-verified (order 9DX60970CC199763K, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture, and an
  unapproved capture was refused by the real API with 422
  `ORDER_NOT_APPROVED`) — creation only, not capture. The submission
  images (cover + flow, 1600x900) are still in place in the
  submission-assets folder. The owner is traveling in Ishigaki; the
  approval step still needs the owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 22nd cycle's, Step 1 notes
  the 23rd-cycle edits are local until the next push, and the
  placeholder re-verification now cites the 23rd cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 22nd cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  36/36. The parser now keeps a quantity stated before an "of the"
  connector — "two of the mugs" drafts two mugs, not one — verified
  against the real sandbox with an order created from that sentence
  (order 4GE76849PK502954L, $24.00, mug ×2, CREATED; an unapproved
  capture was refused by the real API with 422 `ORDER_NOT_APPROVED`)
  and the filmed sentence re-created (order 1SV70090FT5481130,
  CREATED, $45.50, status lookup CREATED with no capture). The filmed
  example sentence and its $45.50 total are unchanged. The owner is
  traveling in Ishigaki; the approval step still needs the owner's
  PayPal Developer sign-in.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 21st cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  33/33. Real sandbox order creation for the filmed sentence was also
  re-verified (order 7AD21634829808130, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture, and an
  unapproved capture was refused by the real API with 422
  `ORDER_NOT_APPROVED`) — creation only, not capture. The submission
  images (cover + flow, 1600x900) are still in place in the
  submission-assets folder. The owner is traveling in Ishigaki; the
  approval step still needs the owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 20th cycle's, Step 1 notes
  the 21st-cycle edits are local until the next push, and the
  placeholder re-verification now cites the 21st cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 20th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  33/33. The parser now drops an explicitly negated item — "no
  notebook, just 2 coffee beans" drafts only the coffee ($36) and
  "a mug, not a candle" drafts only the mug — verified against the
  real sandbox with an order created from the negated sentence
  (order 5LS44628EE239502H, $36.00, coffee-beans ×2 only, CREATED)
  and the filmed sentence re-created (order 8AY683334W458144A,
  CREATED, $45.50; an unapproved capture was refused by the real API
  with 422 `ORDER_NOT_APPROVED`). The filmed example sentence and
  its $45.50 total are unchanged. The owner is traveling in Ishigaki;
  the approval step still needs the owner's PayPal Developer sign-in.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 19th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  30/30. Real sandbox order creation for the filmed sentence was also
  re-verified (order 4WL940150S167233X, CREATED, $45.50, approval URL
  issued; status lookup returned CREATED with no capture, and an
  unapproved capture was refused by the real API with 422
  `ORDER_NOT_APPROVED`) — creation only, not capture. The submission
  images (cover + flow, 1600x900) are still in place in the
  submission-assets folder. The owner is traveling in Ishigaki; the
  approval step still needs the owner's PayPal Developer sign-in.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 18th cycle's, Step 1 notes
  the 19th-cycle edits are local until the next push, and the
  placeholder re-verification now cites the 19th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 18th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  30/30. The parser now also reads a trailing count written after the
  item ("mugs x3" drafts three, "coffee beans x2" drafts two) —
  verified against the real sandbox with an order created from the
  sentence "mugs x3" (order 5TE15262XE3265828, $36.00, quantity 3,
  CREATED; an unapproved capture was refused with 422
  `ORDER_NOT_APPROVED`) and the filmed sentence re-created
  (order 2EL29556P6514500V, CREATED, approval URL issued). The filmed
  example sentence and its $45.50 total are unchanged. The owner is
  traveling in Ishigaki; the approval step still needs the owner's
  PayPal Developer sign-in.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 17th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  27/27. Real sandbox order creation for the filmed sentence was also
  re-verified (order 64431265S0790443D, CREATED, approval URL issued) —
  creation only, not capture. The owner departed for Ishigaki today
  (09:45 KST); the approval step still needs the owner's PayPal
  Developer sign-in, so it cannot clear during travel.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): Gate 0 now cites
  this cycle's creation order instead of the 16th cycle's, and Step 1
  notes the 17th-cycle edits are local until the next push.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 16th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  27/27. The parser now matches keywords on word boundaries only —
  "booking" no longer drafts a book, "cupcake" no longer drafts a
  mug, and plurals still match — verified against the real sandbox
  with an order created from the sentence "booked a shirt for the
  meeting" (order 00X56668XY460732A, $24.00, t-shirt only, CREATED)
  and a false-positive sentence refused as an empty order (400).
  The filmed example sentence and its $45.50 total are unchanged.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 15th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  24/24. Real sandbox order creation for the filmed sentence was also
  re-verified (order 3AF46217X36820646, CREATED, approval URL issued) —
  creation only, not capture.
- `SUBMISSION_RUNBOOK.md` accuracy fix (this cycle): its Step 1 still
  claimed the remote HEAD was the 6th-cycle commit and the suite was
  21 tests. The remote HEAD actually moved in the 14th cycle
  (603b83682d9bef1ab38da9db85d13bed1a65265e) and the suite is 24 tests;
  Gate 0 and the placeholder check now cite the 15th cycle.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 14th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  24/24. The parser now keeps a quantity stated before a catalog
  adjective ("2 wireless headphones" drafts two; "a dozen ceramic
  mugs" drafts twelve) — verified against the real sandbox with an
  order created from the sentence "2 wireless headphones"
  (order 0E065240BN377353M, $118.00, quantity 2, CREATED). The filmed
  example sentence and its $45.50 total are unchanged.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 13th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog (12 items), and UI
  serving were re-verified live in this cycle, and `npm test` passes
  21/21. Real sandbox order creation for the filmed sentence was also
  re-verified (order 21352014JM528924L, CREATED, approval URL issued) —
  creation only, not capture.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.
  The final-phase execution order now lives in `SUBMISSION_RUNBOOK.md`
  (Gate 0 is that approved run).

## Filming status (2026-11-09, 12th cycle)

- Scenes 1–3 remain filmable: health (`credentialsConfigured: true`),
  parse ($45.50 for the filmed example), catalog, and UI serving were
  re-verified live in this cycle, and `npm test` passes 21/21. The parser
  now also understands dozen quantities ("a dozen mugs" drafts twelve,
  "half a dozen" six) and the number words eleven and twelve — verified
  against the real sandbox with an order created from the sentence
  "a dozen mugs" (order 67B24889RL986734U, $144.00, CREATED). The filmed
  example sentence and its $45.50 total are unchanged.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.

## Filming status (2026-11-09, 11th cycle)

- Execution order, pre-flight checks, take blocks, edit/upload metadata,
  and the pre-upload privacy sweep now live in `FILMING_RUNBOOK.md`.
  Block A (scenes 1–3) is filmed from that runbook today; Block B
  (scenes 4–5) stays gated on the real approved sandbox run below.
- `DEVPOST_COPY.md` accuracy audit (this cycle): the Accomplishments
  section no longer claims a captured sandbox payment as an accomplished
  fact — sandbox order creation is verified, capture is not yet, and the
  proof sentence is finalized only from measured order/capture IDs.

## Filming status (2026-11-09, 10th cycle)

- Scenes 1–3 are filmable today: health (`credentialsConfigured: true`),
  parse ($45.50), and UI serving were re-verified live in this cycle, and
  `npm test` passes 18/18. The parser now sums repeated mentions of the
  same item in one sentence ("a mug and three mugs" drafts four mugs);
  the filmed example sentence and its $45.50 total are unchanged.
  Scene 1 can now also show the demo catalog
  list on the home page (clicking an item starts its draft), and an
  unmatched sentence shows a visible explanation next to the input.
  Scene 3 now also shows the editable draft
  (quantity inputs, Remove buttons, server-side repricing). The return
  page now checks the order status before capturing, so a refresh after
  the result screen is safe to show on camera.
- Scene 4 is **partly verified but not yet filmable end to end**: real
  sandbox order creation succeeded in the 4th cycle (orders created in
  CREATED state with approval URLs, and an unapproved capture was refused
  by the real sandbox API with 422 `ORDER_NOT_APPROVED`). Buyer approval
  itself has not been completed yet, so there is no verified capture.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.
- Devpost gallery images are ready (9th cycle): `saytopay-cover.png` and
  `saytopay-flow.png` (1600x900, generated by `assets/make_images.py`).
  They are presentation images only — they do not replace the scene 4–5
  payment proof, which still requires the real approved run.
- Public repository: https://github.com/BoxLogoDev/saytopay
