---
type: REFERENCE
status: active
scope: documentation-routing
last_reviewed: 2026-09-05
owner: product
---

# Horo docs index

- [ui-content-refinement-plan.md](ui-content-refinement-plan.md) — canonical active product, content, retention, schema-rollout, and UI plan. Read before changing generated readings or dashboard result surfaces.
- [claude-ui-handoff.md](claude-ui-handoff.md) — bounded frontend implementation packet for Claude. Read only when working on the current `horo-fe` UI refinement.
- [claude-ui-correction-1.md](claude-ui-correction-1.md) — first reviewed correction packet for closing Today hierarchy, donation interruption, and adapter gaps.
- [deterministic-category-scores.md](deterministic-category-scores.md) — shipped record of the 0 to 100 daily and chart scoring: formulas, constants, route overwrite, legacy-row upgrade, verification. Read before touching any score or its prompt.
- [../horo-be/docs/compatibility-scoring.md](../horo-be/docs/compatibility-scoring.md) — implemented compatibility v2 formula, guarantees, evidence, and deployment gate.

Repo-specific docs live in `horo-fe/docs/` and `horo-be/docs/`.

## FRESH scores for this update

| Document | F | R | E | S | H | Total |
|---|---:|---:|---:|---:|---:|---:|
| `claude-ui-correction-1.md` | 3 | 3 | 2 | 3 | 3 | 14/15 (A) |
| `claude-ui-handoff.md` | 3 | 3 | 2 | 3 | 3 | 14/15 (A) |
| `horo-be/docs/compatibility-scoring.md` | 3 | 3 | 3 | 3 | 3 | 15/15 (A) |
| `deterministic-category-scores.md` | 3 | 3 | 2 | 3 | 2 | 13/15 (A) |

The handoff and correction packet trade a little efficiency for explicit acceptance detail. The scoring reference is short, indexed, verified against code and tests, and includes an explicit rollout gate and verification commands.

FRESH before → after:

- `deterministic-category-scores.md`: 12/15 (B) → 13/15 (A); F 2→3 (added this index entry) · R 1→3 (status shipped with updated date and an authority rule; scale corrected from 1 to 5 to 0 to 100; constants and ranges spot-checked against `daily-scores.ts`, the test suites, and production rows on 2026-09-05) · E 3→2 (grew with the chart section and two tables) · S 3→3 · H 3→2 (the surgical file list that made it handoff-ready as a plan was dropped once it shipped; commands and acceptance properties remain).
- `ui-content-refinement-plan.md`: the daily category-score defect section is marked RESOLVED with a pointer; not rescored, one marker only.

- `claude-ui-handoff.md`: 13/15 → 14/15; R 2→3 after replacing the stale backend-contract note with the verified v2 response shape and rollout order. Other dimensions unchanged.
- `horo-be/docs/compatibility-scoring.md`: 14/15 → 15/15; H 2→3 after resolving the migration ambiguity with the API `contentVersion` boundary and an explicit reader-before-writer rollout. Other dimensions unchanged.
