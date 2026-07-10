# Persian Content Instructions

These rules apply to Persian editorial files in `content/fa/`.

## Required Workflow

Before changing prose, read `editorial/fa/README.md`, then use only the relevant canonical files under `editorial/fa/`.

For every Persian content edit:

- Identify the content mode from `editorial/fa/fa-content-modes.md`.
- Build a factual inventory before rewriting: ownership, current status, shipped/planned scope, security/privacy claims, links, numbers, and limitations.
- Keep the actual problem close to the opening.
- Explain choices through constraints, decisions, and trade-offs.
- Use first-person singular when Ali made or owns the decision; do not inflate `من` into `ما`.
- Keep IropHome framed as client/commercial delivery, not Ali-owned IP.
- Keep Nekonymous security and anonymity wording within the verified threat model.
- Distinguish shipped, tested, release-candidate, planned, and speculative work.
- Preserve Markdown with runtime meaning: frontmatter, anchors, links, code fences, tables, embeds, image paths, and identifiers.
- Use Persian characters, Persian punctuation, ZWNJ, and the house-style `ه‌ی`.
- Keep canonical English technical terms from `editorial/fa/fa-lexicon.md`.
- Avoid generic introductions, corporate phrases, decorative adjectives, fake vulnerability, literal translation, and repeated conclusions.

## Completion

```bash
python3 editorial/fa/scripts/editorial_lint.py --strict <changed-files>
```

Self-score with `editorial/fa/fa-review-rubric.md`. Do not mark complete below 85/100 or when a hard gate fails. Report unresolved factual uncertainty instead of guessing.
