---
type: REFERENCE
status: active
scope: documentation-routing
last_reviewed: 2026-09-10
owner: product
---

# Horo docs index

- [ui-content-refinement-plan.md](ui-content-refinement-plan.md) — canonical active product, content, retention, schema-rollout, and UI plan. Read before changing generated readings or dashboard result surfaces.
- [claude-ui-handoff.md](claude-ui-handoff.md) — bounded frontend implementation packet for Claude. Read only when working on the current `horo-fe` UI refinement.
- [claude-ui-correction-1.md](claude-ui-correction-1.md) — first reviewed correction packet for closing Today hierarchy, donation interruption, and adapter gaps. §4's donation *frequency* rules (seven-day cooldown, permanent dismiss) were superseded 2026-09-10; the rest of the packet still applies.
- [deterministic-category-scores.md](deterministic-category-scores.md) — shipped record of the 0 to 100 daily and chart scoring: formulas, constants, route overwrite, legacy-row upgrade, verification. Read before touching any score or its prompt.
- [horo-admin-plan.md](horo-admin-plan.md) — plan and architecture decision for the `horo-admin` analytics dashboard: separate repo, own email/password login in a Postgres schema `admin`, read-only stats from production. Read before touching admin auth, the seed script, or dashboard metrics.
- [../horo-be/docs/wallet.md](../horo-be/docs/wallet.md) — มู wallet (1 มู = ฿1): prices in `pricing.ts`, the append-only `wallet_ledger`, spend/refund/credit invariants, `/api/wallet` routes, the ดวงคู่ unlock seam, and what's deferred (Stripe, bonus expiry, admin). Read before touching prices, credits, orders or the unlock.
- [../horo-be/docs/compatibility-scoring.md](../horo-be/docs/compatibility-scoring.md) — implemented compatibility v2 formula, guarantees, evidence, and deployment gate.

Repo-specific docs live in `horo-fe/docs/` and `horo-be/docs/`.

## FRESH scores for this update

| Document | F | R | E | S | H | Total |
|---|---:|---:|---:|---:|---:|---:|
| `claude-ui-correction-1.md` | 3 | 3 | 2 | 3 | 3 | 14/15 (A) |
| `claude-ui-handoff.md` | 3 | 3 | 2 | 3 | 3 | 14/15 (A) |
| `horo-be/docs/compatibility-scoring.md` | 3 | 3 | 3 | 3 | 3 | 15/15 (A) |
| `deterministic-category-scores.md` | 3 | 3 | 2 | 3 | 2 | 13/15 (A) |
| `horo-admin-plan.md` | 3 | 2 | 3 | 2 | 3 | 13/15 (A) |

The handoff and correction packet trade a little efficiency for explicit acceptance detail. The scoring reference is short, indexed, verified against code and tests, and includes an explicit rollout gate and verification commands.

FRESH before → after:

- `horo-be/docs/wallet.md` (new, 2026-09-27): 13/15 (A) current only; F 3 (index entry, descriptive name, frontmatter scope) · R 3 (status and date metadata, authority rule; invariants checked against `tests/wallet.test.ts` and a lock-on browser run on 2026-09-27) · E 3 (file map table first, short sections) · S 2 (a spec that also carries the deferred list and a note on the unlock route, which the compatibility doc owns) · H 2 (paths, test command and guard order, but no explicit own / don't-touch boundary for the compatibility files).
- `horo-be/docs/compatibility-response-fix.md` (locked mode now paid in มู, 2026-09-27): 10/15 (B) → 12/15 (B); R 1→3 (the stale `NO_CREDIT` 402, the "ใช้ 1 เครดิต" door and "refused without credit" test lines replaced by the มู contract, and the retry and repeat-failure behaviour stated). F 2 (still not in this index) · E 2 · S 2 · H 3 unchanged.
- `monetization-tickets.md`: 12/15 (B) → 13/15 (A); R 2→3 (T3 and T4 marked built with pointers to the code, T8 split into built and still-to-do, the credit-ledger sketch marked superseded by `wallet.md`). Other dimensions unchanged.

- `deterministic-category-scores.md`: 12/15 (B) → 13/15 (A); F 2→3 (added this index entry) · R 1→3 (status shipped with updated date and an authority rule; scale corrected from 1 to 5 to 0 to 100; constants and ranges spot-checked against `daily-scores.ts`, the test suites, and production rows on 2026-09-05) · E 3→2 (grew with the chart section and two tables) · S 3→3 · H 3→2 (the surgical file list that made it handoff-ready as a plan was dropped once it shipped; commands and acceptance properties remain).
- `ui-content-refinement-plan.md`: the daily category-score defect section is marked RESOLVED with a pointer; not rescored, one marker only.

- `claude-ui-handoff.md`: 13/15 → 14/15; R 2→3 after replacing the stale backend-contract note with the verified v2 response shape and rollout order. Other dimensions unchanged.
- `horo-be/docs/compatibility-scoring.md`: 14/15 → 15/15; H 2→3 after resolving the migration ambiguity with the API `contentVersion` boundary and an explicit reader-before-writer rollout. Other dimensions unchanged.

- `horo-admin-plan.md` (new, 2026-09-07): 13/15 (A) current only; F 3 (index entry, frontmatter scope) · R 2 (metadata and authority rule present, but the repo it describes is being built, so paths are prescriptive rather than spot-checked) · E 3 (decision table, data-source table, no transcript) · S 2 (plan carrying an ADR-lite block) · H 3 (seed command, env vars, increments with verify steps, done-when).
