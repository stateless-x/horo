---
type: REFERENCE
status: active
scope: documentation-routing
last_reviewed: 2026-09-04
owner: product
---

# Horo docs index

- [ui-content-refinement-plan.md](ui-content-refinement-plan.md) — canonical active product, content, retention, schema-rollout, and UI plan. Read before changing generated readings or dashboard result surfaces.
- [claude-ui-handoff.md](claude-ui-handoff.md) — bounded frontend implementation packet for Claude. Read only when working on the current `horo-fe` UI refinement.
- [claude-ui-correction-1.md](claude-ui-correction-1.md) — first reviewed correction packet for closing Today hierarchy, donation interruption, and adapter gaps.
- [../horo-be/docs/compatibility-scoring.md](../horo-be/docs/compatibility-scoring.md) — implemented compatibility v2 formula, guarantees, evidence, and deployment gate.

Repo-specific docs live in `horo-fe/docs/` and `horo-be/docs/`.

## FRESH scores for this update

| Document | F | R | E | S | H | Total |
|---|---:|---:|---:|---:|---:|---:|
| `claude-ui-correction-1.md` | 3 | 3 | 2 | 3 | 3 | 14/15 (A) |
| `claude-ui-handoff.md` | 3 | 3 | 2 | 3 | 3 | 14/15 (A) |
| `horo-be/docs/compatibility-scoring.md` | 3 | 3 | 3 | 3 | 3 | 15/15 (A) |

The handoff and correction packet trade a little efficiency for explicit acceptance detail. The scoring reference is short, indexed, verified against code and tests, and includes an explicit rollout gate and verification commands.

FRESH before → after:

- `claude-ui-handoff.md`: 13/15 → 14/15; R 2→3 after replacing the stale backend-contract note with the verified v2 response shape and rollout order. Other dimensions unchanged.
- `horo-be/docs/compatibility-scoring.md`: 14/15 → 15/15; H 2→3 after resolving the migration ambiguity with the API `contentVersion` boundary and an explicit reader-before-writer rollout. Other dimensions unchanged.
