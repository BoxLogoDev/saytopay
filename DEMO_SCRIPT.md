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
natural-language sentence goes in. The app's single AI-style step reads the
items and quantities and turns them into a structured order draft. There is
no separate product search and no manual cart."

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
