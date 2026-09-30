---
type: REFERENCE
status: active
scope: documentation-routing
last_reviewed: 2026-09-30
owner: product
---

# Horo docs index

- [ui-content-refinement-plan.md](ui-content-refinement-plan.md) — canonical active product, content, retention, schema-rollout, and UI plan. Read before changing generated readings or dashboard result surfaces.
- [claude-ui-handoff.md](claude-ui-handoff.md) — bounded frontend implementation packet for Claude. Read only when working on the current `horo-fe` UI refinement.
- [claude-ui-correction-1.md](claude-ui-correction-1.md) — first reviewed correction packet for closing Today hierarchy, donation interruption, and adapter gaps. §4's donation *frequency* rules (seven-day cooldown, permanent dismiss) were superseded 2026-09-10; the rest of the packet still applies.
- [deterministic-category-scores.md](deterministic-category-scores.md) — shipped record of the 0 to 100 daily and chart scoring: formulas, constants, route overwrite, legacy-row upgrade, verification. Read before touching any score or its prompt.
- [horo-admin-plan.md](horo-admin-plan.md) — plan and architecture decision for the `horo-admin` analytics dashboard: separate repo, own email/password login in a Postgres schema `admin`, read-only stats from production. Read before touching admin auth, the seed script, or dashboard metrics.
- [monetization-tickets.md](monetization-tickets.md) — ticket list T1–T21 for Horo's paid products, permanent and promotional มู, 30-day campaign resets/admin controls, feature credits, compatibility conversion, payment flows, donation removal and wallpaper demand tests. Read before touching prices, wallet grants, campaigns, credits, paywalls, payments, donation or affiliate code.
- [shop-catalog-plan.md](shop-catalog-plan.md) — approved plan (2026-09-30, owner decisions D1–D8) for the Shop catalog: eTicket, ตั๋วรู้ใจ (1 ใบ 49 มู; 2 ใบ แถม 1 = 3 tickets 99 มู), ladder p50–p1000, no cap, no welcome gift, มู → ticket exchange, unlock audit, admin catalog, shop/มู/eTicket stats. API contract §6, backend steps B0–B9. Read before touching the Shop, packs, tickets or catalog.
- [shop-frontend-handoff.md](shop-frontend-handoff.md) — self-contained horo-fe packet for ChatGPT: reader API with example JSON, files to replace, steps F1–F9, fixed copy, client events. Read before building Shop/wallet/door UI.
- [../horo-be/docs/wallet.md](../horo-be/docs/wallet.md) — มู wallet (1 มู = ฿1): the p50–p1000 ladder in `pricing.ts` (permanent bonus, no cap, welcome gift behind a flag), the append-only `wallet_ledger`, spend/refund/credit invariants, orders and PromptPay payments, `/api/wallet` routes, the one-flow door purchase, the planned audit trail and accounting, and what's deferred. Tickets and the Shop: shop.md. Read before touching prices, orders, payments or the ledger.
- [../horo-be/docs/shop.md](../horo-be/docs/shop.md) — built Shop spec (2026-09-30): catalog rows + fulfilment handlers, the มู → ticket exchange, ตั๋วรู้ใจ grants/uses/adjustments, the ticket-only unlock and `unlock_attempts`, admin refunds/restores/retries, sales events. Read before touching the Shop, tickets or the unlock.
- [../horo-be/docs/compatibility-scoring.md](../horo-be/docs/compatibility-scoring.md) — implemented compatibility v2 formula, guarantees, evidence, and deployment gate.
- [../horo-be/docs/compatibility-response-fix.md](../horo-be/docs/compatibility-response-fix.md) — the one ดวงคู่ report (canon v1): legacy rows hidden, MBTI never shown, teaser-first locked mode, unlock flow, live budget. Read before touching compatibility generation, responses or the door.
- [../horo-be/docs/feature-flags.md](../horo-be/docs/feature-flags.md) — product switches set in horo-admin (`compat_lock`, `compat_unlock_free`): rules, routes, local use, rollout. Read before adding a flag or gating a feature.

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

- `horo-be/docs/wallet.md` (Shop build, 2026-09-30): 12/15 (B) → 14/15 (A); R 2→3 (cap, 180-day bonus, welcome and pass claims rewritten against the built code) · S 2→3 (tickets and the Shop moved to shop.md).
- `horo-be/docs/shop.md` (new, 2026-09-30): 14/15 (A) current only; E 2 (dense).
- `horo-be/docs/feature-flags.md`: `welcome_gift` added and `compat_lock` reworded for tickets; score unchanged.
- `shop-catalog-plan.md` (new, rewritten with owner decisions 2026-09-30): F 3 (indexed; section table) · R 2 (status metadata, checkpoint claims checked against the committed code; nothing built yet) · E 2 (long, JSON examples) · S 3 (the frontend packet moved to its own file; §7 is a pointer) · H 3 (paths, IDs, tests and done-conditions per step). Total 13/15 (A, borderline; R is the gap until built).
- `shop-frontend-handoff.md` (new): F 3 (indexed) · R 2 (contract not frozen until G1) · E 2 (repeats §6 on purpose so it stands alone) · S 3 (one handoff) · H 3 (files, steps, copy, done-conditions). Total 13/15 (A, borderline).

- `horo-be/docs/compatibility-response-fix.md` (canon v1, 2026-09-30): 12/15 (B) → 13/15 (A).
  - F 2→3: the env-flag table, the flat-v4 and "v2 unchanged" claims and the removed harness path were stale; all now match the code.
  - H 2→3: a "Canon v1" section states the legacy rule, the MBTI rule, the door confirm and the one production backfill statement.
  - R 3, E 2 (long doc), S 3 unchanged.
- `horo-be/docs/feature-flags.md` (new, 2026-09-30): 13/15 (A). F 3, R 3 (verified with the live route and tests), E 3, S 2 (rules and rollout in one doc), H 2 (multi-process cache behaviour is reasoned, not measured).
- `horo-be/docs/compatibility-scoring.md` (2026-09-30): 13/15 (A) → 14/15 (A). F 2→3: the v1/v2 API marking and the deleted content test were removed.
- `monetization-tickets.md` (legacy retired, flags, confirm, 2026-09-30): 14/15 (A) → 14/15 (A). The grandfather rule was replaced by the owner's 2026-09-30 decision, T8 now names the flag, and T21 records the confirm step. No dimension moved.

- `monetization-tickets.md` (tracking plan, 2026-09-29): 14/15 (A) → 14/15 (A).
  - The "Funnel we measure" section became the "Tracking plan": 17 events, 4 columns, and a metric → decision → rule
    table.
  - T6 was rewritten with done-when conditions and resized S → M.
  - E stays 3 (tables); S stays 2 (the plan still carries specs). No dimension moved.

- `monetization-tickets.md` (ticket sync, 2026-09-29): 13/15 (A) → 14/15 (A).
  - R 3→3: the stale T5 route names (`/api/checkout { sku }`, `creditFromOrder`) were replaced with the built
    `/api/wallet/checkout` and `fulfilPaidOrder`, and the ladder and decision-log pointer were updated.
  - H 2→3: T5, T7, T13 and T16 now carry concrete routes, the admin-write decision and done-when conditions. The
    provider choice is isolated as the one open item.
  - F 3, E 3, S 2 unchanged.
- `horo-be/docs/wallet.md` (admin route decided, 2026-09-29): 13/15 (A) → 14/15 (A).
  - H 2→3: the open admin-write choice was replaced with the decided internal routes, the auth rule and the required
    note.
  - F 3, R 3, E 3, S 2 unchanged.

- `horo-be/docs/wallet.md` (audit trail, user pages, 2026-09-29, second pass): 12/15 (B) → 13/15 (A).
  - E 2→3: added a contents list that splits built from planned sections.
  - H 2→2: the actor table, rollout rule and route contract are concrete, but how horo-admin writes is still an open choice between (a) and (b).
  - F 3, R 3, S 2 unchanged.
- `monetization-tickets.md` (T16, 2026-09-29): 13/15 (A) → 13/15 (A). T16 was added with done-when conditions, and T13 now requires the acting admin on each row. No dimension moved.

- `horo-be/docs/wallet.md` (product passes, 2026-09-29): 11/15 (B) → 12/15 (B). This is a realistic re-score. The 13/15 recorded on 2026-09-27 no longer held: the door label claim had gone stale.
  - F 3→3: the index entry now mentions passes.
  - R 1→3: the stale "ปลดล็อก ฿49" label was replaced with the current `unlockLabel` and a pointer to the open decision; status and `last_reviewed` were bumped; the pass section is marked planned, not built.
  - E 3→2: about 85 lines added with no TOC. Sections are still independently retrievable.
  - S 2→2: a spec that now also carries a planned design, kept in its own section.
  - H 2→2: tables, lock and transaction order, and refund rules are concrete; the one-flow pass purchase and the owner-unconfirmed numbers are still open.
- `monetization-tickets.md` (T15, 2026-09-29): 11/15 (B) → 13/15 (A). Also a realistic re-score: the stale `assertCanUnlock` seam capped R at 1.
  - R 1→3: the seam was renamed to `checkUnlock` / `chargeUnlockWithin` (0 hits for `assertCanUnlock` in `horo-be/src`), and status and date were bumped.
  - H 2→2: T15 has done-when conditions, but the gateway and the pass one-flow are still open.
  - F 3, E 3, S 2 unchanged.

- `horo-be/docs/wallet.md` (new, 2026-09-27): 13/15 (A) current only; F 3 (index entry, descriptive name, frontmatter scope) · R 3 (status and date metadata, authority rule; invariants checked against `tests/wallet.test.ts` and a lock-on browser run on 2026-09-27) · E 3 (file map table first, short sections) · S 2 (a spec that also carries the deferred list and a note on the unlock route, which the compatibility doc owns) · H 2 (paths, test command and guard order, but no explicit own / don't-touch boundary for the compatibility files).
- `horo-be/docs/compatibility-response-fix.md` (locked mode now paid in มู, 2026-09-27): 10/15 (B) → 12/15 (B); R 1→3 (the stale `NO_CREDIT` 402, the "ใช้ 1 เครดิต" door and "refused without credit" test lines replaced by the มู contract, and the retry and repeat-failure behaviour stated). F 2 (still not in this index) · E 2 · S 2 · H 3 unchanged.
- `monetization-tickets.md`: 12/15 (B) → 13/15 (A); R 2→3 (T3 and T4 marked built with pointers to the code, T8 split into built and still-to-do, the credit-ledger sketch marked superseded by `wallet.md`). Other dimensions unchanged.

- `monetization-tickets.md` (new, 2026-09-27): 12/15 (B) current only; F 3 (index entry, frontmatter scope, summary table) · R 2 (status and date metadata; file paths and line anchors spot-checked 2026-09-27, but it's a plan, so the new files it names don't exist yet) · E 3 (summary table first, each ticket independently readable) · S 2 (plan that also carries the credit-ledger design, which moves to a horo-be doc once built) · H 2 (paths, done-when and dependencies, but the gateway choice (Opn vs Stripe) is still open).

- `deterministic-category-scores.md`: 12/15 (B) → 13/15 (A); F 2→3 (added this index entry) · R 1→3 (status shipped with updated date and an authority rule; scale corrected from 1 to 5 to 0 to 100; constants and ranges spot-checked against `daily-scores.ts`, the test suites, and production rows on 2026-09-05) · E 3→2 (grew with the chart section and two tables) · S 3→3 · H 3→2 (the surgical file list that made it handoff-ready as a plan was dropped once it shipped; commands and acceptance properties remain).
- `ui-content-refinement-plan.md`: the daily category-score defect section is marked RESOLVED with a pointer; not rescored, one marker only.

- `claude-ui-handoff.md`: 13/15 → 14/15; R 2→3 after replacing the stale backend-contract note with the verified v2 response shape and rollout order. Other dimensions unchanged.
- `horo-be/docs/compatibility-scoring.md`: 14/15 → 15/15; H 2→3 after resolving the migration ambiguity with the API `contentVersion` boundary and an explicit reader-before-writer rollout. Other dimensions unchanged.

- `horo-admin-plan.md` (new, 2026-09-07): 13/15 (A) current only; F 3 (index entry, frontmatter scope) · R 2 (metadata and authority rule present, but the repo it describes is being built, so paths are prescriptive rather than spot-checked) · E 3 (decision table, data-source table, no transcript) · S 2 (plan carrying an ADR-lite block) · H 3 (seed command, env vars, increments with verify steps, done-when).
