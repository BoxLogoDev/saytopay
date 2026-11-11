# SayToPay — Filming Runbook (execute in order)

Companion to `DEMO_SCRIPT.md`. The script fixes *what* is said and shown;
this runbook fixes *how* the recording session runs, so scenes 1–3 can be
filmed in one take block today and scenes 4–5 can be appended the moment a
QA cycle completes a real sandbox create → approve → capture run.

## Pre-flight (5 minutes, before recording)

```bash
npm test        # must be 127/127 passing
npm start       # http://localhost:3000
```

Then verify in the browser, in this order:

1. `GET /api/health` shows `paypalEnv: sandbox` and
   `credentialsConfigured: true`. If it shows `false`, stop — do not film
   the payment path on a misconfigured app. It also shows `ai.configured`:
   `false` means the draft on camera is produced by the built-in rules
   fallback (the draft note says so); `true` names the provider and model
   that produced it. Either state is filmable — never claim the other one
   on camera.
2. The home page shows the demo catalog list (12 items) under the input.
3. Typing `2 coffee beans and a notebook` and clicking **Build order
   draft** shows Coffee beans 1kg ×2 ($36.00) + Paper notebook ×1
   ($9.50) = **$45.50**.
4. Close every other tab. Nothing on screen may show a credential, a
   secret, a personal email, a real name, or any employer material.
5. Browser zoom: draft table and result box must be readable at 100%
   playback size on a phone screen — if not, zoom in before recording.

## Block A — Scenes 1–3 (filmable now)

Record as one continuous take if possible; the script timings
(0:00–1:15) already leave transition headroom.

| Step | Action | Check before moving on |
|---|---|---|
| A1 | Home screen, empty input, catalog visible (Scene 1) | Tagline and catalog both in frame |
| A2 | Type the example sentence exactly, click **Build order draft** (Scene 2) | Sentence spelled exactly `2 coffee beans and a notebook` |
| A3 | Pause on the draft table; hover the quantity input and Remove button without changing the total (Scene 3) | $45.50 total readable |
| A4 | Stop the take. Save as `saytopay-demo-blockA.mp4` | Runtime of Block A ≈ 1:15 or less |

If a take fails, retake Block A only — do not improvise narration; the
wording in `DEMO_SCRIPT.md` is the submitted wording.

## Block B — Scenes 4–5 (gated, do not film yet)

Gate: a QA cycle must first complete a **real** sandbox run —
create → buyer approval → capture — and record the real order ID and
capture ID in `DEVPOST_COPY.md`. A local stand-in run does not open
this gate.

| Step | Action | Check before moving on |
|---|---|---|
| B1 | Click **Pay with PayPal (sandbox)**, approve with the sandbox buyer test account only | Approval page shows sandbox, never a live account |
| B2 | Return to the app; the result box shows order ID, capture ID, $45.50, COMPLETED | IDs match the values recorded in `DEVPOST_COPY.md` |
| B3 | Show the same transaction in the PayPal sandbox dashboard (Scene 5) | No other account data visible |
| B4 | Save as `saytopay-demo-blockB.mp4` | Block A + Block B edited total stays **under 3:00** |

## Edit & upload

- Edit order: Block A → Block B, no reordering of steps — the narration
  follows the real user path.
- Final file name: `saytopay-demo-final.mp4`.
- Upload target: YouTube (unlisted is acceptable for Devpost) or Vimeo.
- Title: `SayToPay — Say it, review it, pay for it (PayPal AI Hackathon 2026)`
- Description first line: `Type what you want to buy in one sentence —
  SayToPay builds the order draft and completes a real PayPal sandbox
  payment: create order → approve → capture.`
- After upload, paste the link into `DEVPOST_COPY.md` as `[VIDEO_URL]`
  and check the evidence checklist there — the video link is the last
  placeholder besides the sandbox transaction IDs.

## Privacy sweep (before uploading, watch the full video once)

- [ ] No Client ID / Secret, `.env`, or terminal showing credentials
- [ ] No personal email, real name, or employer-related tab or text
- [ ] Sandbox buyer account only; no live PayPal account anywhere
- [ ] Total runtime under 3:00
