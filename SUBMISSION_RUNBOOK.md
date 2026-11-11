# SayToPay — Final Submission Runbook (execute in order, 2026-11-12 18:00 KST phase)

Companion to `DEVPOST_COPY.md` (the paste-ready text) and
`FILMING_RUNBOOK.md` (how to record). This runbook fixes the *submission
execution order* for the final phase so nothing is hunted across documents
at deadline time. Deadline: **2026-11-13 05:00 KST** (Devpost). After the
deadline the repository and video must not be edited until winners are
announced (2026-12-21).

## Gate 0 — the one blocker (must clear before anything below)

A QA cycle must complete a **real** sandbox run — create → buyer approval
→ capture — and record the real order ID and capture ID. Order creation
alone does not clear this gate. As of the 76th cycle (2026-11-11) creation
is verified again (order 7AR77701GM4453437, CREATED, $45.50,
coffee-beans ×2 + notebook ×1 from the filmed sentence
"2 coffee beans and a notebook"; status
lookup returned CREATED with no capture and an
unapproved capture was refused by the real API with 422
`ORDER_NOT_APPROVED`) but approval
→ capture is still unverified: it needs the owner signed in to PayPal
Developer in the browser so the sandbox buyer account password can be
read from Sandbox Accounts (the value is never recorded), or the owner
approving the sandbox checkout directly. Everything below that depends
on a captured transaction stays gated until this clears.

## Step 1 — Push the latest snapshot to the public repository

- Repository: https://github.com/BoxLogoDev/saytopay (public, MIT LICENSE
  already in the tree)
- Remote HEAD is the commit f0da5612998c022d610ac40f647a254057a28357
  ("SayToPay QA cycle 74", confirmed with the GitHub read tool
  `list_commits` in the 74th cycle; the 73rd-cycle edits and the
  74th-cycle code, tests, documents, and DEVLOG entry are reflected;
  the 74th-cycle DEVLOG sync note, this Step 1 HEAD refresh, and the
  75th- and 76th-cycle runbook/script edits are local until the next push — the
  58th cycle has no DEVLOG entry of its own; see the supplement note
  recorded in the 59th cycle).
  Push the current snapshot (`.env` excluded) and re-read the remote HEAD
  before submitting — the submitted link must show the final code and the
  127-test suite.

## Step 2 — Fill the three remaining placeholders in DEVPOST_COPY.md

- `[SANDBOX_ORDER_ID]` / `[SANDBOX_CAPTURE_ID]` — only from the Gate 0
  captured run, amount $45.50, status COMPLETED. Never from a CREATED
  order.
- `[VIDEO_URL]` — only after Step 3 uploads the final video.
- No other placeholders exist (re-verified 76th cycle: `[REPO_URL]` was
  already replaced with the real repository address; the only remaining
  placeholders in the submission copy are the three listed above).

## Step 3 — Film Block B and upload the demo video

- Follow `FILMING_RUNBOOK.md` Block B (scenes 4–5), gated on Gate 0.
- Edit Block A (scenes 1–3, filmable since the 2nd cycle) + Block B;
  total runtime must stay **under 3:00**.
- Upload (YouTube unlisted or Vimeo) with the title and first description
  line fixed in `FILMING_RUNBOOK.md`, then paste the link as `[VIDEO_URL]`.

## Step 4 — Capture the two proof screenshots

- [ ] App result screen: order ID, capture ID, $45.50, COMPLETED
- [ ] PayPal sandbox dashboard: the same transaction
- Privacy sweep first: no credential, secret, personal email, real name,
  or employer material in any screenshot.

## Step 5 — Fill the Devpost form from DEVPOST_COPY.md

| Devpost field | Source in DEVPOST_COPY.md | Ready? |
|---|---|---|
| Project name | Project name | Yes — SayToPay |
| Tagline | Tagline (one line) | Yes |
| Categories | Categories | Yes — AI Shopping Assistant, Agentic Commerce |
| Built with | Built with | Yes |
| Description | Inspiration → What's next | Yes, except the Demo transaction line (Step 2) |
| Repository link | Try it out / Links | Yes — after Step 1 push |
| Demo video link | Try it out / Links | No — Step 3 |
| Project images | Evidence checklist | Yes — `saytopay-cover.png` + `saytopay-flow.png` (1600x900, in the submission-assets folder, uploaded to the Devpost gallery here) |
| Sponsor tool selection | Form only | Select PayPal if offered |
| Team | Form only | Solo — confirm solo state on the form |

## Step 6 — Submit and verify

- Submit, then confirm the Devpost "submitted" / project-submitted state
  on screen — a filled form is not a submission.
- Report completion to the owner with the submitted project link.
- After this point: do not edit the repository, video, or linked
  materials until 2026-12-21, and keep the sandbox app and demo
  credentials active until then.
- If Devpost sign-in (2-step etc.) blocks this step, prepare everything
  through Step 5 and report exactly what sign-in action is needed.
