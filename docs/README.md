---
type: REFERENCE
status: active
scope: documentation-routing
last_reviewed: 2026-10-06
owner: product
---

# Horo docs index

- [horo-admin-plan.md](horo-admin-plan.md) — plan and architecture decision for the `horo-admin` analytics dashboard: separate repo, own email/password login in a Postgres schema `admin`, read-only stats from production. Read before touching admin auth, the seed script, or dashboard metrics.
- [monetization-tickets.md](monetization-tickets.md) — ticket list T1–T21 for Horo's paid products, permanent and promotional มู, 30-day campaign resets/admin controls, feature credits, compatibility conversion, payment flows, donation removal and wallpaper demand tests. Read before touching prices, wallet grants, campaigns, credits, paywalls, payments, donation or affiliate code.
- [shop-catalog-plan.md](shop-catalog-plan.md) — approved plan (2026-09-30, owner decisions D1–D8) for the Shop catalog: eTicket, ตั๋วรู้ใจ (1 ใบ 49 มู; 2 ใบ แถม 1 = 3 tickets 99 มู), ladder p50–p1000, no cap, no welcome gift, มู → ticket exchange, unlock audit, admin catalog, shop/มู/eTicket stats. API contract §6, backend steps B0–B9. Read before touching the Shop, packs, tickets or catalog.
- [../horo-be/docs/wallet.md](../horo-be/docs/wallet.md) — มู wallet (1 มู = ฿1): the p50–p1000 ladder in `pricing.ts` (permanent bonus, no cap, welcome gift behind a flag), the append-only `wallet_ledger`, spend/refund/credit invariants, orders and PromptPay payments, `/api/wallet` routes, the one-flow door purchase, the planned audit trail and accounting, and what's deferred. Tickets and the Shop: shop.md. Read before touching prices, orders, payments or the ledger.
- [../horo-be/docs/shop.md](../horo-be/docs/shop.md) — built Shop spec (2026-09-30): catalog rows + fulfilment handlers, the มู → ticket exchange, ตั๋วรู้ใจ grants/uses/adjustments, the ticket-only unlock and `unlock_attempts`, admin refunds/restores/retries, sales events. Read before touching the Shop, tickets or the unlock.
- [../horo-be/docs/compatibility-scoring.md](../horo-be/docs/compatibility-scoring.md) — implemented compatibility v2 formula, guarantees, evidence, and deployment gate.
- [../horo-be/docs/compatibility-response-fix.md](../horo-be/docs/compatibility-response-fix.md) — the one ดวงคู่ report (canon v1): legacy rows hidden, MBTI never shown, teaser-first locked mode, unlock flow, live budget. Read before touching compatibility generation, responses or the door.
- [../horo-be/docs/feature-flags.md](../horo-be/docs/feature-flags.md) — product switches set in horo-admin (`compat_lock`, `compat_unlock_free`): rules, routes, local use, rollout. Read before adding a flag or gating a feature.

- [../horo-fe/DEPLOYMENT.md](../horo-fe/DEPLOYMENT.md) — where each piece runs (frontend on Vercel; API, Postgres, Redis, admin on Railway), env vars, OAuth callbacks. Read before deploying or changing domains.
- [../horo-fe/docs/decisions/static-assets-cdn.md](../horo-fe/docs/decisions/static-assets-cdn.md) — images: the `IMAGES` registry, `bun run build:art`, folder layout, bunny.net CDN and caching. Read before adding or changing any image.
- [../horo-fe/docs/decisions/compatibility-result-routes.md](../horo-fe/docs/decisions/compatibility-result-routes.md) — why ดวงคู่ results live at `/dashboard/compatibility/[id]` and share links at `/compatibility/[token]`.
- [post-deploy-2026-10-06.md](post-deploy-2026-10-06.md) — after deploying 1.0.0: deploy order, the light-mode reset (automatic), and the compatibility score backfill command.

Other repo-specific docs live in `horo-fe/docs/`, `horo-be/docs/` and `horo-admin/docs/` (each has a `CODEMAP.md`).
