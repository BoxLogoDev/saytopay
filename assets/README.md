# Submission images

Devpost requires at least one project image (up to 10). SayToPay's gallery
set is generated — not screenshotted from any account — by
`make_images.py` (Pillow, deterministic, offline):

| File | Size | Role |
|---|---|---|
| `saytopay-cover.png` | 1600x900 | Gallery image 1 / project cover: name, tagline, the $45.50 example sentence, and the create -> approve -> capture flow |
| `saytopay-flow.png` | 1600x900 | Gallery image 2: the four steps (say it, review the draft, pay with PayPal sandbox, proof) |

Regenerate with:

```bash
python3 assets/make_images.py <output-dir>
```

The rendered PNGs are kept with the submission packet, outside this
repository tree: the snapshot sync that publishes this repo transfers
UTF-8 text files only, so binary files must not live in the project
tree (the sync aborts on the first non-text file). At submission time
the two PNGs are uploaded to the Devpost gallery in the order above.

Honesty rule: the images show only facts the app already demonstrates —
the example draft ($45.50) and the Orders flow. They do not show a
transaction ID or a dashboard; those proofs come from the real sandbox
run and are attached separately at submission.
