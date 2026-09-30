---
type: PLAN
status: approved 2026-09-30 (owner decisions D1–D8 below). horo-be B0–B7 built and verified on the local DB (4f5aa35…b4060a2, not pushed); horo-admin B8 built (not pushed); horo-fe not started; B9 docs in progress. Supersedes the ticket-pass checkpoint (horo-be ea7e3b8, horo-fe 086f58e, horo-admin 6b779a2) and T15 "3 คน 98 มู" in monetization-tickets.md
scope: Shop catalog (eTicket category, ตั๋วรู้ใจ), มู top-up ladder, มู → eTicket exchange, ticket consumption and unlock audit, admin catalog/audit, sales and activity stats, gift phase 1
last_reviewed: 2026-09-30
owner: product
decision_log: ~/product-decisions/horo/2026-09-30c-monetize.md
---

# Shop catalog: eTicket + ตั๋วรู้ใจ

When this doc and the code disagree, the code wins; fix this doc in the same commit.

**Who builds what (owner, 2026-09-30):**

| Repo | Builder | Reads |
|---|---|---|
| horo-be | Claude (this session) | §3–6, §8 |
| horo-admin | Claude subagent | §5 tables, §6 admin routes, §9 stats, B8 |
| horo-fe | ChatGPT | **[shop-frontend-handoff.md](shop-frontend-handoff.md)** (self-contained, same contract as §6) |

| § | Section |
|---|---|
| 1 | What we ship |
| 2 | Owner decisions |
| 3 | Starting point: the checkpoint and its traps |
| 4 | Architecture decision |
| 5 | Data model |
| 6 | API contract |
| 7 | Frontend (pointer) |
| 8 | Backend build plan B0–B9 |
| 9 | Stats and tracking |
| 10 | Gates and docs |

---

## 1. What we ship

Evidence: **39% of 504 compatibility rows came from readers who checked at least two people** [M, prod snapshot
2026-09-04]. That's enough for a bundle. It isn't enough for a bigger tier, inventory, or buyer-to-recipient gifts.

| Area | Decision |
|---|---|
| Shop category | `eticket` (shown as **eTicket**) |
| First product | **ตั๋วรู้ใจ**: "ตั๋วสำหรับเปิดคำอ่านดวงคู่ ใช้ 1 ใบต่อ 1 คน ตั๋วที่ซื้อไม่มีวันหมดอายุ" |
| Offer 1 | `heart_ticket_1`: 1 ใบ · 49 มู |
| Offer 2 | `heart_ticket_3`: **2 ใบ แถม 1** → the buyer receives **3 tickets** · 99 มู · badges `แถม 1` (prominent) + `แนะนำ` |
| Bigger tier | **Deprecated.** No ultra offer, not even as a draft |
| Payment model | Top up general มู (PromptPay) → exchange มู for an offer. Two separate records, always |
| Unlock model | One ticket is consumed **only in the same transaction that saves the report**. A failed generation consumes nothing and is logged for admin |
| Mini-shop | Any page can open a designated product in a sheet. The full Shop stays browsable at `/dashboard/shop` |
| Wallet | The มู balance, the ticket balance (with expiring grants called out), and a readable history for each |
| Gifts, phase 1 | Admin, support and promotion grants only. Promotion grants expire after 30 days by default and are used first. Purchased tickets never expire |

**Top-up ladder** (replaces p49/p99/p199/p399; 1 มู = ฿1; bonus มู are permanent; **no balance cap**):

| Pack id | Pay | Base | Bonus | Receive | Chip |
|---|---|---|---|---|---|
| `p50` | ฿50 | 50 | 0 | 50 มู | — |
| `p100` | ฿100 | 100 | 5 | 105 มู | +5% |
| `p300` | ฿300 | 300 | 30 | 330 มู | +10% |
| `p500` | ฿500 | 500 | 75 | 575 มู | +15% |
| `p1000` | ฿1,000 | 1,000 | 200 | 1,200 มู | +20% |

`p50` covers offer 1 and `p100` covers offer 2, so a zero-balance reader always pays in one step.

**Not in this build:** physical products, shipping, inventory, recipient gifts, gift-card purchase, baht refunds
through Stripe (those stay manual, T13), a welcome gift, and any new currency. The code leaves a `physical`
fulfilment seam that stays unimplemented.

---

## 2. Owner decisions (2026-09-30)

| # | Decision |
|---|---|
| D1 | **"2 ใบ แถม 1" is canon: 3 tickets for 99 มู.** Offer id `heart_ticket_3`: `quantity 2`, `bonus_quantity 1` |
| D2 | **No balance cap.** Remove `BALANCE_CAP`, `BalanceCapExceeded`, the cap check in `createOrder`/`creditOrder`/`adjust`, and the `credit_failed_cap` review path. `GET /api/wallet` drops `cap`. Legal note: the 2026-09-27 decision log listed a closed-loop e-money confirmation as a launch gate; removing the cap makes that confirmation more important, not less |
| D3 | **No welcome gift for now; still on the table.** `GET /api/wallet` stops calling `ensureWelcome`. The code stays behind a new feature flag `welcome_gift` (default **off**, set in horo-admin สวิตช์ฟีเจอร์), so turning it on later is a switch, not a rebuild |
| D4 | **A failed generation costs nothing, automatically, and admins can see every attempt.** Tickets are consumed only when the report saves (a failure never touches the ticket). Every unlock attempt writes an `unlock_attempts` row: outcome, failure class, error reference, model, tokens, duration, and which grant paid. Admins can **restore a ticket** (a compensating row) when a saved report turns out broken. Refunding a bundle back to มู is admin-only, and only for unused tickets |
| D5 | Claude builds horo-be. A Claude subagent builds horo-admin. ChatGPT builds horo-fe from `shop-frontend-handoff.md` |
| D6 | The ticket-pass work is committed as a checkpoint in all three repos (not pushed). horo-be has 7 red tests and horo-fe 12; this plan's steps turn them green |
| D7 | **The ultra tier is deprecated.** Nothing is seeded for it |
| D8 | **Promotion grants expire after 30 days** by default; an admin can pick another date. Admin grants may be permanent |

---

## 3. Starting point

The checkpoint commits hold the ticket-pass work. Build on it; don't start fresh.
- horo-be: `src/lib/feature-credits.ts`, `src/routes/internal-feature-credits.ts`, `feature_credit_grants` /
  `feature_credit_uses` in `lib/db/schema/wallet.ts`, `orders.ticket_pass_id`, `TICKET_PASSES` in `pricing.ts`,
  and ticket-only `checkUnlock` / `chargeUnlockWithin` in `src/lib/entitlements.ts`.
- horo-fe: `src/app/dashboard/shop/page.tsx`, `features/wallet/mini-shop-dialog.tsx`,
  `components/ui/heart-knowing-ticket.tsx`, `features/wallet/feature-credit-card.tsx`.
- horo-admin: `src/app/(dashboard)/tickets/`, `src/lib/tickets-api.ts`.

**Keep:** the grant/use tables, expiring-first consumption, `consumeWithin` inside the report-save transaction, the
`ticket_required` 402, and the rule that feature credits are never มู ledger rows.

**Traps:**

| # | Trap | Fix |
|---|---|---|
| W1 | Purchase idempotency is keyed on `unlockRef` (grant `source_ref` and spend `ref_id` are both the report id), so there's no Shop purchase without a report, and at most one bundle per report | A `catalog_purchases` row per purchase with unique `(user_id, idempotency_key)`. The spend `ref_id` and the grant `source_ref` are the purchase id |
| W2 | `startCheckout` skips `expireSuperseded` when `ticketPassId` is set, bringing back two live QRs | The offer path supersedes exactly like the `unlockRef` path |
| W3 | `fulfilPaidOrder` calls `buyTicket` after `creditOrder`; an offer archived or repriced in between throws inside the webhook | Snapshot `offer_id` and `offer_price_moo` onto the order. On failure keep the มู, write `catalog_fulfilment_failures`, emit `fulfilment_failed`, and **don't rethrow** into the webhook |
| W4 | `summaries()` always returns `expiresAt: null` | Return `usesLeft` plus an `expiring[]` breakdown (§6) |
| W5 | Hand-written `drizzle/0014_heart_knowing_tickets.sql` and a `_journal.json` edit contradict the push-only workflow | If nothing reads `drizzle/` at deploy, delete the SQL and revert the journal |
| W6 | `internal-feature-credits` takes `body.actor` as both the admin id and email | horo-admin sends `{ id, email }` from its own server session; the form never supplies it |
| W7 | Grant `source_type` values `admin_grant` / `promotion` | `purchase` / `admin` / `promotion` / `gift` |
| W8 | `spendWithin`/`refundSpend` read the price from `PRODUCT_PRICES` and accept only `SpendableProductId` (`src/lib/wallet.ts:209`, `:259`) | Explicit-amount twins `spendAmountWithin` / `refundAmount` sharing the same lock and idempotency code |

**Schema freedom.** wallet.md says the wallet tables were never pushed to production. If that's still true at G3,
reshaping is free. After merge, every new column must be nullable or defaulted (`.claude/CLAUDE.md`).

---

## 4. Architecture decision (ADR-lite)

**Context.** Ticket passes were hard-coded IDs threaded through pricing, checkout, orders and UI. Later products need
a browsable catalog, admin management, and a different fulfilment (physical) without weakening the audit trail.

| Option | For | Against |
|---|---|---|
| A. Catalog as code constants (extend `pricing.ts`) | No new tables, versioned in git | No admin management; every price change is a deploy |
| **B. Catalog rows in Postgres; product types and fulfilment handlers in code** | Admins manage offers; purchases snapshot the price so edits never rewrite history; a new product type is one handler | New tables, a seed, and a publish/archive rule |
| C. Full commerce platform (inventory, carts, shipping, gifting) | Ready for merch | Unvalidated operations work; the decision log rejects it |

**Decision: B**, because admin catalog management needs mutable rows, and keeping fulfilment in code means a DB edit
can never invent a new way to grant something.

**Rules:**
- `pricing.ts` stays the source of truth for **packs and QR TTL only**. Offer prices live in `catalog_offers`.
- An offer's `price_moo`, `quantity` and `bonus_quantity` are editable only while it's a `draft`. Once `published`
  they're locked; a price change means archive and create a new offer. Label, badges and sort stay editable.
- Purchases, failures, grants, uses, revocations, restorations, reversals and unlock attempts are **insert-only**.
  Status is derived, never updated.
- **Rollback:** archive the offers and/or turn off `compat_lock`. Granted tickets stay usable. Nothing is deleted.

---

## 5. Data model (horo-be `lib/db/schema/`)

Existing conventions: varchar enums with allowed values in `lib/shared/types/*`, the actor columns
(`actor_type`/`actor_id`/`actor_label`) on every audit row, partial unique indexes as the guarantees.

```
catalog_products            -- mutable config, admin-managed
  id text pk                'heart_ticket'
  category varchar(16)      'eticket'                      (SHOP_CATEGORIES in shared types)
  type varchar(16)          'feature_credit' | 'physical'  (physical: no handler → publish refused)
  feature_id varchar(32)    'compat_unlock'                (required when type = feature_credit)
  name_th, description_th text
  image_key text            'heart-knowing'                (frontend maps key → asset)
  status varchar(12)        'draft' | 'published' | 'archived'
  sort int, created_at, updated_at, updated_by_label

catalog_offers
  id text pk                'heart_ticket_1' | 'heart_ticket_3'
  product_id text fk
  label_th text             '1 ใบ' | '2 ใบ แถม 1'
  quantity int              paid units (1 | 2)
  bonus_quantity int        free units (0 | 1)   → units delivered = quantity + bonus_quantity
  price_moo int
  badges text[]             subset of ['bonus','recommended']
  status, sort, published_at, archived_at, created_at, updated_at, updated_by_label

catalog_purchases           -- insert-only, one row per completed exchange
  id uuid pk, user_id, offer_id, product_id, product_type
  snapshot jsonb            { productName, offerLabel, quantity, bonusQuantity, priceMoo }
  price_moo int, units int
  source varchar(8)         'wallet' (Shop/mini-shop) | 'order' (one-flow after top-up)
  order_id uuid null
  idempotency_key text      client UUID per confirm, or 'order:<orderId>'
  actor_*, created_at
  unique (user_id, idempotency_key)

catalog_fulfilment_failures -- insert-only, reviewable
  id uuid, user_id, offer_id, order_id null, idempotency_key, reason varchar(32), detail jsonb, created_at
  reason: 'offer_unavailable' | 'price_changed' | 'insufficient_balance' | 'handler_error'
  "Resolved" = a catalog_purchases row exists with the same (user_id, idempotency_key). Derived.

catalog_reversals           -- insert-only; admin refund of an unused purchase
  id uuid, purchase_id uuid unique, refunded_moo int, revoked_units int, reason text, actor_*, created_at

feature_credit_grants       -- amended
  source_type: 'purchase' | 'admin' | 'promotion' | 'gift'
  source_ref: purchase id | campaign/promo id | null
  note text                 the admin's reason (required for admin/promotion)
  unique (source_ref) where source_type = 'purchase'

feature_credit_uses         -- unchanged: unique (user_id, feature_id, ref_id)

feature_credit_adjustments  -- insert-only; units taken back or given back
  id uuid, grant_id fk, delta int (−n revoke | +1 restore), reason text,
  reversal_id null, use_id null (the use a restore compensates), actor_*, created_at
  unique (use_id) where delta > 0        -- a use can be restored once

unlock_attempts             -- insert-only (D4): one row per unlock attempt, written at the end with its outcome
  id uuid, user_id, compatibility_id, outcome varchar(16) 'unlocked' | 'failed' | 'refused' | 'already_open'
  failure_class varchar(32) null, error_ref text null  (the existing failure reference id in 500 bodies)
  use_id uuid null          the ticket use when outcome = 'unlocked'
  model text null, prompt_tokens int null, completion_tokens int null, cache_hit_tokens int null
  duration_ms int, source varchar(8) 'route' | 'order', order_id null, created_at

orders                      -- amended
  ticket_pass_id → offer_id text null, offer_price_moo int null, offer_idempotency_key text null
```

**Balances (derived):**
- A grant's units left = `usesTotal − uses + sum(adjustments.delta)`. It's usable when that's > 0 and `expires_at`
  is null or in the future.
- Consumption order: the earliest `expires_at` first, then the oldest non-expiring grant.

**One exchange**, in one transaction under `lockWalletUser`:
1. Look up the purchase by idempotency key; if it exists, return it (a replay costs nothing).
2. The offer and its product must be `published`, and the price must equal `expectedPriceMoo`.
3. Insert `catalog_purchases`.
4. `spendAmountWithin(tx, user, { productId: offerId, refId: purchaseId, price })` writes the −price row.
5. Dispatch by `product_type`. `feature_credit` inserts one grant (`usesTotal = units`, `source_type = 'purchase'`,
   `source_ref = purchaseId`, `expires_at = null`).

Any failure rolls back everything. On the order path, the failure is then recorded in `catalog_fulfilment_failures`.

**Unlock (D4).** Generation happens before the save transaction, as today. The save transaction consumes one ticket
and patches the detail together. Whatever happens, one `unlock_attempts` row is written afterwards with the outcome.
`llm.ts` already reads `usage` from DeepSeek; return it to the caller instead of only logging it.

**Admin refund of a purchase:** refused if any use came from its grant; otherwise `refundAmount` (+price, once),
`catalog_reversals`, and an adjustment of −unused.
**Admin restore of a ticket:** an adjustment of +1 on the grant that paid, pointing at the use. Once per use.

**Seed.** `ensureCatalogSeed()` inserts `heart_ticket`, `heart_ticket_1` and `heart_ticket_3` (published) with
`ON CONFLICT (id) DO NOTHING`, so it never overwrites admin edits. It's **lazy and memoized**: every catalog read and
purchase calls it, a failure is logged and retried next call, and it never fails startup. (Railway runs
`drizzle-kit push &` in the background, so the tables may not exist yet at boot on the first deploy.)

---

## 6. API contract

All reader routes use the existing session auth and the `compat_lock` gate: with the lock off they return 404, as
`/api/wallet` does today. Shapes live in `horo-be/lib/shared/types/shop.ts` (new), `wallet.ts` and `analytics.ts`.
horo-fe gets them with `cd horo-be && bun run sync:types`.

### Reader routes

**`GET /api/shop`** returns only published categories, products and offers.
```json
{
  "categories": [{
    "id": "eticket", "name": "eTicket",
    "products": [{
      "id": "heart_ticket", "type": "feature_credit", "featureId": "compat_unlock",
      "name": "ตั๋วรู้ใจ",
      "description": "ตั๋วสำหรับเปิดคำอ่านดวงคู่ ใช้ 1 ใบต่อ 1 คน ตั๋วที่ซื้อไม่มีวันหมดอายุ",
      "imageKey": "heart-knowing",
      "offers": [
        { "id": "heart_ticket_1", "label": "1 ใบ", "quantity": 1, "bonusQuantity": 0, "units": 1, "priceMoo": 49, "badges": [] },
        { "id": "heart_ticket_3", "label": "2 ใบ แถม 1", "quantity": 2, "bonusQuantity": 1, "units": 3, "priceMoo": 99, "badges": ["bonus", "recommended"] }
      ]
    }]
  }]
}
```

**`GET /api/shop/products/:productId`** returns `{ "product": { …one product as above } }`. A draft, archived or
unknown product returns 404 `{ "error": "product_unavailable" }`.

**`POST /api/shop/purchases`** exchanges มู for an offer.
```json
// request
{ "offerId": "heart_ticket_3", "expectedPriceMoo": 99, "idempotencyKey": "<uuid v4 made once per confirm tap>" }
// 200: a replay with the same key returns the same body and costs nothing
{ "purchaseId": "…", "offerId": "heart_ticket_3", "priceMoo": 99, "units": 3,
  "balance": 6, "tickets": { "usesLeft": 3, "expiring": [] } }
```

| Status | Body |
|---|---|
| 402 | `{ "error": "insufficient_balance", "balance": 20, "price": 99 }` |
| 409 | `{ "error": "price_changed", "offer": { …current offer } }` |
| 404 | `{ "error": "offer_unavailable" }` |
| 400 | `{ "error": "invalid_request" }` |

**`GET /api/wallet`** (D2, D3: no `cap`, no welcome gift):
```json
{ "enabled": true, "balance": 55,
  "packs": [ { "id": "p50", "priceBaht": 50, "base": 50, "bonus": 0, "bonusPercent": 0 }, … ],
  "ledger": [ … ],
  "tickets": { "usesLeft": 4, "expiring": [ { "uses": 1, "expiresAt": "2026-10-30T00:00:00.000Z", "source": "promotion" } ] } }
```
`expiring` lists only grants with an expiry and units left, soonest first.

**`GET /api/wallet/history`**: unchanged (มู rows). An exchange is `kind: "spend"`, `productId: "heart_ticket_3"`,
`refName: "ตั๋วรู้ใจ 2 ใบ แถม 1"`. `LedgerEntry.productId` widens to `ProductId | OfferId | null` (`OfferId = string`).

**`GET /api/wallet/tickets/history?cursor=`** returns ticket events, newest first, keyset-paged.
```json
{ "entries": [
  { "id": "use:…", "kind": "used", "units": 1, "label": "เปิดดวงคู่กับ ต้นข้าว", "refId": "<compat row id>", "createdAt": "…", "expiresAt": null },
  { "id": "grant:…", "kind": "granted", "units": 3, "source": "purchase", "label": "แลก 2 ใบ แถม 1 · 99 มู", "refId": null, "createdAt": "…", "expiresAt": null },
  { "id": "grant:…", "kind": "granted", "units": 1, "source": "promotion", "label": "ของขวัญจาก Horo", "refId": null, "createdAt": "…", "expiresAt": "…" },
  { "id": "adjust:…", "kind": "restored", "units": 1, "label": "คืนตั๋ว", "refId": null, "createdAt": "…", "expiresAt": null },
  { "id": "adjust:…", "kind": "revoked", "units": 3, "label": "คืนมู 99 มู", "refId": null, "createdAt": "…", "expiresAt": null },
  { "id": "expired:…", "kind": "expired", "units": 1, "label": "หมดอายุ", "refId": null, "createdAt": "<expires_at>", "expiresAt": "…" }
], "nextCursor": null }
```
`expired` is derived, not stored. Readers never see an admin's identity.

**`POST /api/wallet/checkout`**, the one-flow top-up → exchange → (unlock):
```json
{ "packId": "p100",
  "offer": { "offerId": "heart_ticket_3", "expectedPriceMoo": 99 },                              // optional
  "unlockRef": "<compat row uuid>",                                                                  // optional; requires offer
  "replaceOrderId": "<uuid>" }                                                                       // optional, unchanged
```
- `unlockRef` without `offer` → 400 `{ "error": "offer_required" }`. An unknown/unpublished offer → 404
  `offer_unavailable`, a stale price → 409 `price_changed`, and a pack that plus the balance can't reach the price →
  409 `{ "error": "pack_too_small", "balance", "credit", "price" }`, all before any order or charge.
- The exchange's idempotency key is always `order:<orderId>`; the client sends none.
- The response is unchanged (the QR). Once paid: credit the pack, exchange the offer, unlock `unlockRef`.
- `GET /api/wallet/orders/:id` gains `"fulfilment": "done" | "failed" | null` and `"tickets": { usesLeft, expiring }`.
  On `failed` the มู stays in the wallet and the reader can retry with `POST /api/shop/purchases`.

**`POST /api/fortune/compatibility/:id/unlock`**: a reader with no usable ticket gets
402 `{ "error": "ticket_required", "balance": 55 }`. A successful unlock consumes one ticket as it saves. A failed
generation returns 5xx (with the existing failure reference) and consumes nothing.

**`POST /api/analytics/events`**: existing route; accepts the three new client events (§9).

Removed: `POST /api/wallet/tickets/buy`, `ticketPassId` on checkout, `compat_ticket_1`/`compat_ticket_3`, `cap`.

### Admin routes (`/internal/*`, `x-admin-secret`, actor `{ id, email }` from the horo-admin session)

| Route | Purpose |
|---|---|
| `GET /internal/catalog/products` · `POST` · `PATCH /:id` | Products, drafts included |
| `GET /internal/catalog/offers?productId` · `POST` · `PATCH /:id` | Offers. Price/quantity locked after publish → 409 `offer_locked` |
| `POST /internal/catalog/offers/:id/publish` · `/archive` (same for products) | Status. Publishing a `physical` product → 409 `no_fulfilment_handler` |
| `POST /internal/catalog/failures/:id/retry { reason, actor }` | Re-run a failed order exchange with its idempotency key at the price agreed at checkout; the reason is stored on the purchase (`note`) or on the new failure row |
| `POST /internal/catalog/purchases/:id/refund { reason, actor }` | Refund an unused purchase to มู. 409 `tickets_used` |
| `POST /internal/feature-credits/grant { userId, uses, source: 'admin'\|'promotion', expiresAt?, reason, actor }` | Phase-1 gifts. `promotion` defaults to +30 days |
| `POST /internal/feature-credits/uses/:useId/restore { reason, actor }` | Give back the ticket a use consumed. 409 `already_restored` |

Admin **reads** (lists, audits, stats) come straight from Postgres through horo-admin's read-only connection, like
its other dashboards. horo-be adds no read routes for them.

---

## 7. Frontend

ChatGPT builds horo-fe from **[shop-frontend-handoff.md](shop-frontend-handoff.md)**. That file restates §6 for the
reader routes and adds the screens, copy, states, events and files to replace. Change the contract here first, then
there.

---

## 8. Backend build plan

Each step is mergeable, tested and revertable. Verify with `bun run type-check` and `bun test` in horo-be; the ledger
blocks need the local Postgres (`horo-be-dev-localdb`). `bun run build` also runs the tests.

| Step | Change | Tests | Done when |
|---|---|---|---|
| **B0** | W5: drop the hand-written SQL and journal edit if nothing reads `drizzle/` | Existing suite | — |
| **B1** | **Ladder, no cap, no welcome gift.** `PACKS` → p50…p1000. Remove `BONUS_TTL_DAYS` (bonus `expires_at = null`), `BALANCE_CAP` and every cap path (D2). `welcome_gift` flag, default off; `GET /api/wallet` and `checkUnlock` call `ensureWelcome` only when it's on (D3). Fix the 7 red tests | Unit: `bonusPercent` 0/5/10/15/20; a 10,000 มู credit succeeds; no welcome row with the flag off, one with it on | `GET /api/wallet` returns 5 packs, no `cap` |
| **B2** | **Catalog schema, lazy seed, reader routes.** §5 tables; `GET /api/shop`, `GET /api/shop/products/:id`; `lib/shared/types/shop.ts` | Seed idempotent, doesn't overwrite an edited row, fails while tables are missing and succeeds next call. Drafts/archived never returned | **G1: contract frozen** |
| **B3** | **Exchange.** `spendAmountWithin`/`refundAmount` (W8); `createCatalog(db, wallet, credits).purchase(...)`; `FULFILMENT_HANDLERS` (`feature_credit`; `physical` throws `NoFulfilmentHandler`); `POST /api/shop/purchases`. Delete `buyTicket`, `/tickets/buy`, `TICKET_PASSES` (W1, W7) | Replay = one purchase/spend/grant. Concurrent double-tap = one charge. Price mismatch 409, archived 404, short 402: nothing written. A handler throw rolls back the spend | Two purchases of `heart_ticket_3` with no report → 6 tickets |
| **B4** | **Consumption + unlock audit + wallet read.** `consumeWithin` honours adjustments. `unlock_attempts` written for every outcome with LLM usage from `llm.ts` (D4). `ticket_required` adds `balance`. `GET /api/wallet` `tickets` with `expiring` (W4). `GET /api/wallet/tickets/history` | A failed generation consumes nothing and writes a `failed` attempt with the error ref. Promo used before purchase. Expired never used. Same row twice = one use | Ticket count and history match after grant → use → restore → expire |
| **B5** | **One-flow order.** `orders.offer_*`. Checkout validates the offer before any charge, `offer_required`, supersedes like `unlockRef` (W2). `fulfilPaidOrder*`: credit → purchase(`order:<id>`) → unlock; failure → failure row + event, มู kept, no rethrow (W3). Order status adds `fulfilment`, `tickets` | Fake gateway: paid → credited → exchanged → unlocked. Replay changes nothing. Offer archived after checkout → มู kept + failure row + webhook 200. Two checkouts for one row → first QR expired | `tests/stripe-sandbox.test.ts` still passes |
| **B6** | **Admin writes.** §6 admin routes: catalog CRUD with publish lock, failure retry, purchase refund, grant (promo +30 d default), use restore. W6 | 401 without the secret; `offer_locked`; `no_fulfilment_handler`; refund twice → one; refund after a use → 409; restore twice → 409 | — |
| **B7** | **Events (§9).** Surfaces `shop`, `wallet`; 10 events in `analytics.ts`; `buildProductEventRow` + `dedupKeyFor`; `recordServerEvent` for server events at their emission points | Row mapping rejects unknown values; a webhook replay → one `topup_completed` | The funnel query in §9 returns rows on the dev DB |
| **B8** | **horo-admin (subagent)** against §6 admin routes and the §9 read queries: Shop catalog, Shop stats, per-user activity, unlock attempts, grants/restore, failures | horo-admin `type-check`, `test`, `build` (no dev login on :3002) | Pages render from the local DB |
| **B9** | **Docs.** `horo-be/docs/wallet.md`, `docs/monetization-tickets.md`, `horo-be/docs/CODEMAP.md`, `horo-be/docs/feature-flags.md` (`welcome_gift`), `docs/README.md`; mark this plan built | — | FRESH scored |

**Integration check:** dev stack with the fake gateway; walk shop → exchange → door unlock → both histories through
the API, then in the browser at phone width once horo-fe is ready.

---

## 9. Stats and tracking

Two sources, each the truth for its own question:
- **Money and entitlements** come from the source tables: `orders`, `wallet_ledger`, `catalog_purchases`,
  `feature_credit_grants`/`_uses`/`_adjustments`, `catalog_fulfilment_failures`, `unlock_attempts`. Never count money
  from events.
- **Behaviour** (views, selections, the funnel's top) comes from `product_events`.

### Events

| Event | Sent by | Where | `surface` / `category` / `detail` | Dedup |
|---|---|---|---|---|
| `shop_viewed` | client | Shop page mounts | `shop` / entry (`nav`\|`door`\|`wallet`\|`link`) / — | per user per day |
| `product_viewed` | client | product sheet or mini-shop opens | `shop` / productId / entry (`shop`\|`mini_shop`) | per user, product, day |
| `offer_selected` | client | reader taps an offer (not the preselection) | `shop` / productId / offerId | none |
| `topup_started` | server | checkout started a charge | `wallet` / packId / offerId or — | order id |
| `topup_completed` | server | the paid order is credited | `wallet` / packId / offerId or — | order id |
| `catalog_purchase_completed` | server | exchange commits | `shop` / source (`wallet`\|`order`) / offerId | purchase id |
| `ticket_consumed` | server | unlock saves | `compatibility` / `compat_unlock` / grant source | use id |
| `fulfilment_failed` | server | order exchange fails | `shop` / offerId / reason | failure id |
| `refund_requested` | server | admin refund route starts | `shop` / offerId / purchase id | purchase id |
| `refund_completed` | server | refund commits | `shop` / offerId / purchase id | purchase id |

### What horo-admin shows (a **ร้านค้า** section)

| View | Built from |
|---|---|
| **Funnel** (7/30 days, unique users per step): shop_viewed → product_viewed → offer_selected → catalog_purchase_completed → ticket_consumed | `product_events` |
| **Door funnel**: locked report opened → unlock attempt → unlocked; ticket_required → top-up started → paid | `product_events`, `unlock_attempts`, `orders` |
| **Top-ups**: orders by pack and status (pending/paid/expired/failed), baht collected, paid ÷ started | `orders` |
| **มู**: issued (purchase + bonus), spent, refunded, outstanding balance across all users (the liability) | `wallet_ledger` |
| **eTicket**: purchases and units by offer, units consumed, units outstanding, promo units expired unused, share of `heart_ticket_3` | `catalog_purchases`, grants/uses/adjustments |
| **Repeat**: buyers who used a 2nd ticket; days from purchase to 2nd use | uses per buyer |
| **Unlock health**: attempts by outcome and failure class, median duration, tokens and estimated LLM cost per unlock | `unlock_attempts` |
| **Needs attention**: unresolved fulfilment failures, failed attempts in the last 24 h | failures, attempts |
| **User activity** (search by email/id): one timeline of orders, มู rows, purchases, grants, uses, restores, unlock attempts and shop events | all of the above |

### Review metrics (decision log)

| Metric | Review | Kill / keep |
|---|---|---|
| Product views → offer selected | 2026-10-14 or 100 views | No selection signal → simplify the offers |
| Offer selected → purchase | first 30 selections | Steep loss → test price/checkout disclosure |
| Buyers who use a 2nd ticket by day 90 | buyer #30 + 90 days | Low → drop the 3-ticket default |
| Promo credits used before expiry | after the admin/promo pilot | Low → no recipient gifts in phase 2 |
| Unresolved fulfilment failures | daily | Any older than 24 h → support |

---

## 10. Gates and docs

- **G1** (after B2): contract frozen; ChatGPT builds against it (or against the handoff's mocks before that).
- **G2** (after B5): one-flow order passes on the Stripe sandbox.
- **G3** (before merge to master):
  - The owner OKs a read-only prod check that the wallet/catalog tables don't exist yet, or that every new column is
    nullable.
  - `bun test` green on bun 1.1.38; a red Docker build silently keeps the old image.
  - After deploy, probe `GET /api/shop` live. The first call may retry the lazy seed while push creates the tables.
  - The closed-loop e-money legal confirmation (D2) is on record.
- **G4** (launch): turn on `compat_lock` in horo-admin. Rollback = archive offers and/or flag off.

**Phase 2 (not now): recipient gifts** add a `gifts` table (sender, recipient, offer snapshot, delivery state,
accepted_at, expires_at, actor) and grant on acceptance with `source_type = 'gift'`. No reshaping of the exchange,
ledger or grant tables. Build only after the promo metric shows use.
