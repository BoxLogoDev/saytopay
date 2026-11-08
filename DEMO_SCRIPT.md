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

## Filming status (2026-11-08, 5th cycle)

- Scenes 1–3 are filmable today: health (`credentialsConfigured: true`),
  parse ($45.50), and UI serving were re-verified live in this cycle, and
  `npm test` passes 13/13. Scene 3 now also shows the editable draft
  (quantity inputs, Remove buttons, server-side repricing).
- Scene 4 is **partly verified but not yet filmable end to end**: real
  sandbox order creation succeeded in the 4th cycle (orders created in
  CREATED state with approval URLs, and an unapproved capture was refused
  by the real sandbox API with 422 `ORDER_NOT_APPROVED`). Buyer approval
  itself has not been completed yet, so there is no verified capture.
- Scenes 4–5 stay unfilmed until a QA cycle completes a real sandbox
  create → approve → capture run and records its order and capture IDs.
- Public repository: https://github.com/BoxLogoDev/saytopay
