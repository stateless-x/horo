---
type: HANDOFF
status: ready for the frontend agent (ChatGPT). Contract frozen (G1 passed 2026-09-30): horo-be feat/monetization-prep 4f5aa35…452b76f implements every route below, not pushed yet. The types are already synced into horo-fe (3ceeb6b), which leaves 31 compile errors in the checkpoint UI for F1 to fix
scope: horo-fe only — Shop, mini-shop, exchange, top-up, door unlock, wallet balances and histories, client events
last_reviewed: 2026-09-30
owner: product
source_of_truth: docs/shop-catalog-plan.md §6 (API contract). If this file and §6 disagree, §6 wins; tell the owner
---

# Shop frontend handoff (horo-fe)

You're building the reader-facing Shop for Horo, a Thai astrology web app. The backend (horo-be) is being built by
another agent to the contract below. Build only in **horo-fe**. Don't edit horo-be or horo-admin.

## 0. Ground rules

- **Stack:** Next.js App Router, TypeScript, React Query, bun. Run from `horo-fe/`:
  `bun run type-check`, `bun run lint`, `bun test`, `bun run build`. All four must pass before you hand back.
- **Design:** follow `horo-fe/DESIGN.md`. Don't add new colors, fonts or components the guidelines don't cover; if you
  think one is needed, ask the owner first, and if approved, add it to DESIGN.md.
- **Voice:** grounded, contemporary Thai. Transactional copy is short and pronoun-free. Never เจ้า/ข้า.
- **Money display:** always มู with baht beside it: `99 มู (฿99)`. 1 มู = ฿1.
- **Types:** never hand-write API types. `src/lib-packages/shared/types/{shop,wallet,analytics}.ts` are already
  synced from horo-be (files headed "GENERATED — do not edit"); import from there. If the backend changes them, the
  owner re-runs `bun run sync:types` in horo-be. Without a running backend, put mocks in one file
  (`src/features/shop/mock-shop.ts`) and delete it after.
- **No `as any`, no swallowed errors, no fallback values that hide a failure.**
- The whole wallet/Shop exists only while the backend flag `compat_lock` is on. `GET /api/wallet` returns
  `{ "enabled": false }` otherwise; show no Shop entry, no wallet, no door payment in that case (existing behaviour in
  `src/features/wallet/use-wallet.ts` → `enabledWallet`).

## 1. The product in one paragraph

The Shop has categories. The first is **eTicket**, holding one product, **ตั๋วรู้ใจ** ("ตั๋วสำหรับเปิดคำอ่านดวงคู่
ใช้ 1 ใบต่อ 1 คน ตั๋วที่ซื้อไม่มีวันหมดอายุ"). It has two offers: **1 ใบ · 49 มู** and **2 ใบ แถม 1 · 99 มู** (the reader
gets 3 tickets; show a prominent `แถม 1` and a `แนะนำ` tag; preselect it). Readers first top up มู with PromptPay,
then exchange มู for an offer. A ticket opens one locked ดวงคู่ (compatibility) report, and is used only when the
report is saved successfully. Some tickets are gifts from Horo with an expiry date; they're used first.

## 2. Files to replace (don't duplicate)

| File | Now | Becomes |
|---|---|---|
| `src/app/dashboard/shop/page.tsx` | hard-coded `PASSES` (`compat_ticket_1/3`) | renders `GET /api/shop` |
| `src/features/wallet/mini-shop-dialog.tsx` | `DEFAULT_TICKET_PRODUCTS` | takes a `productId`, fetches `GET /api/shop/products/:id` |
| `src/components/ui/heart-knowing-ticket.tsx` | ticket visual | keep; used when `imageKey === "heart-knowing"` |
| `src/features/wallet/feature-credit-card.tsx` | ticket summary | reads `wallet.tickets.usesLeft` / `expiring` |
| `src/features/wallet/wallet-copy.ts` | pack copy for p49–p399 | new ladder; `smallestPackCovering` still applies |
| `src/features/compatibility/report/report-door.tsx` | มู / pass door | ticket-first door (F5) |
| `src/app/dashboard/wallet/page.tsx` | มู only | two balances, two histories (F6) |

Remove every use of `TicketPassId`, `TICKET_PASS_IDS`, `compat_ticket_1`, `compat_ticket_3`, `ticketPassId`, pack ids
`p49`/`p99`/`p199`/`p399`, `cap`, and the `/api/wallet/tickets/buy` call. Existing tests that assert them get updated,
not deleted. Keep the existing pay step (`pay-step.tsx`, `use-order-status.ts`, `pending-order.ts`): QR, countdown,
"ขอ QR ใหม่" with `replaceOrderId`, polling, reload recovery.

## 3. API contract (reader routes)

All routes need the signed-in session (the existing `api` client in `src/lib/api.ts` handles it).

### `GET /api/shop`
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
Render generically from the data: never hard-code offer ids, prices or labels. `badges`: `"bonus"` → the `แถม {bonusQuantity}`
chip (prominent), `"recommended"` → `แนะนำ`. Preselect the offer with `"recommended"`, else the first.
An empty `categories` (everything archived) is valid: show a calm empty state.

### `GET /api/shop/products/:productId`
`{ "product": { …same product shape } }` · 404 `{ "error": "product_unavailable" }`.

### `POST /api/shop/purchases` — exchange มู for an offer
```json
// request
{ "offerId": "heart_ticket_3", "expectedPriceMoo": 99, "idempotencyKey": "<crypto.randomUUID(), made once per confirm tap>" }
// 200
{ "purchaseId": "…", "offerId": "heart_ticket_3", "priceMoo": 99, "units": 3,
  "balance": 6, "tickets": { "usesLeft": 3, "expiring": [] } }
```
Reuse the same `idempotencyKey` when retrying the same tap after a network error; a replay is free and returns the same
body. Make a new key for a new tap.

| Status | Body | Do |
|---|---|---|
| 402 | `{ "error": "insufficient_balance", "balance": 20, "price": 99 }` | switch to the top-up path (F4) |
| 409 | `{ "error": "price_changed", "offer": { … } }` | refresh the sheet, show the new price, ask again; never auto-buy |
| 404 | `{ "error": "offer_unavailable" }` | refresh the Shop / sheet |
| 400 | `{ "error": "invalid_request" }` | generic error toast |

### `GET /api/wallet`
```json
{ "enabled": true, "balance": 55,
  "packs": [
    { "id": "p50", "priceBaht": 50, "base": 50, "bonus": 0, "bonusPercent": 0 },
    { "id": "p100", "priceBaht": 100, "base": 100, "bonus": 5, "bonusPercent": 5 },
    { "id": "p300", "priceBaht": 300, "base": 300, "bonus": 30, "bonusPercent": 10 },
    { "id": "p500", "priceBaht": 500, "base": 500, "bonus": 75, "bonusPercent": 15 },
    { "id": "p1000", "priceBaht": 1000, "base": 1000, "bonus": 200, "bonusPercent": 20 }
  ],
  "ledger": [ /* newest 20 มู rows, LedgerEntry */ ],
  "tickets": { "usesLeft": 4, "expiring": [ { "uses": 1, "expiresAt": "2026-10-30T00:00:00.000Z", "source": "promotion" } ] } }
```
No balance cap exists. There is no welcome gift. A pack's credited มู = `base + bonus`; its chip shows `+{bonusPercent}%`
when > 0.

### `GET /api/wallet/history?cursor=&kind=` — มู history (unchanged route)
An exchange appears as `kind: "spend"`, `productId: "heart_ticket_3"`, `refName: "ตั๋วรู้ใจ 2 ใบ แถม 1"`, `delta: -99`.
A top-up is `purchase` (+ `bonus`), with `amountBaht`. A refund of a purchase is `refund`.

### `GET /api/wallet/tickets/history?cursor=` — ticket history
```json
{ "entries": [
  { "id": "use:…", "kind": "used", "units": 1, "label": "เปิดดวงคู่กับ ต้นข้าว", "refId": "<compat row id>", "createdAt": "…", "expiresAt": null },
  { "id": "grant:…", "kind": "granted", "units": 3, "source": "purchase", "label": "แลก 2 ใบ แถม 1 · 99 มู", "refId": null, "createdAt": "…", "expiresAt": null },
  { "id": "grant:…", "kind": "granted", "units": 1, "source": "promotion", "label": "ของขวัญจาก Horo", "refId": null, "createdAt": "…", "expiresAt": "…" },
  { "id": "adjust:…", "kind": "restored", "units": 1, "label": "คืนตั๋ว", "refId": null, "createdAt": "…", "expiresAt": null },
  { "id": "adjust:…", "kind": "revoked", "units": 3, "label": "คืนมู 99 มู", "refId": null, "createdAt": "…", "expiresAt": null },
  { "id": "expired:…", "kind": "expired", "units": 1, "label": "หมดอายุ", "refId": null, "createdAt": "…", "expiresAt": "…" }
], "nextCursor": null }
```
Show `label` as given; `used` rows link to the report via `refId` (`compatibilityResultPath(refId)` in
`src/features/compatibility/compatibility-routes.ts`). Pass `nextCursor` back as `cursor`.

### `POST /api/wallet/checkout` — top-up, optionally followed by an exchange and an unlock
```json
{ "packId": "p100",
  "offer": { "offerId": "heart_ticket_3", "expectedPriceMoo": 99 },
  "unlockRef": "<compat row uuid>",
  "replaceOrderId": "<uuid>" }
```
`offer`, `unlockRef` and `replaceOrderId` are optional, but `unlockRef` requires `offer` (else 400
`offer_required`). All of these come back **before** any QR, with nothing charged:

| Status | Body | Do |
|---|---|---|
| 400 | `{ "error": "offer_required" }` | a bug: always send `offer` with `unlockRef` |
| 404 | `{ "error": "offer_unavailable" }` | refresh the sheet |
| 409 | `{ "error": "price_changed", "offer": { … } }` | show the new price, ask again |
| 409 | `{ "error": "pack_too_small", "balance": 20, "credit": 50, "price": 99 }` | pick the next pack up (your smallest-pack rule should prevent it) |
| 409 | `{ "error": "already_paid", "orderId": "…" }` | existing: that row's earlier QR was paid; poll that order |
| 409 | `{ "error": "email_required" }` | existing |

The server makes the exchange's idempotency key itself; don't send one in `offer`. The response and the pay step
are unchanged (QR + `orderId`). Poll `GET /api/wallet/orders/:id`; it now also returns
`"fulfilment": "done" | "failed" | null` and `"tickets": { usesLeft, expiring }`.
- `status: "paid"` + `fulfilment: "done"`: the tickets are in; if `unlockRef` was sent, the report is opening.
- `status: "paid"` + `fulfilment: "failed"`: the มู arrived but the exchange didn't. Show the new balance and a
  "แลกตั๋วอีกครั้ง" button that calls `POST /api/shop/purchases` with a **new** key.

### `POST /api/fortune/compatibility/:id/unlock`
- 200: the full report (existing behaviour; the page already reveals it in place).
- 402 `{ "error": "ticket_required", "balance": 55 }`: no usable ticket → open the mini-shop (F5).
- 5xx: generation failed. **No ticket was used.** Show the existing error with its reference id and a retry.

## 4. Build steps

| Step | Deliverable | Done when |
|---|---|---|
| F1 | Fix the 31 compile errors the synced types expose (shop page, wallet page, pack sheet, mini-shop, feature-credit card, wallet-copy, two tests) | `type-check` passes |
| F2 | **Shop** at `/dashboard/shop`: category heading → product card (visual, name, description, tickets-left) → offer list | Renders from `GET /api/shop`; empty state works |
| F3 | **Product sheet / mini-shop**: `openProduct(productId, { entry, unlockRef? })` callable from any page (a provider + hook, e.g. `useMiniShop()`); the recommended offer preselected | Opens in place from the Shop, the wallet, and the ดวงคู่ door |
| F4 | **Exchange.** Balance ≥ price → confirm → `POST /api/shop/purchases`. Balance < price → show the shortfall and two packs: the smallest whose `base + bonus ≥ price − balance` (preselected) and the next one up → `POST /api/wallet/checkout` with `offer` (+ `unlockRef` from a door) → existing pay step | Every §3 error handled; after success, balances update without a reload (invalidate `WALLET_QUERY_KEY`) |
| F5 | **Door** on a locked ดวงคู่ report: has tickets → "ใช้ตั๋วรู้ใจ 1 ใบ (เหลือ {n} ใบ)" → unlock. No ticket → open the mini-shop for `heart_ticket` with `unlockRef`; after the exchange, unlock automatically. 402 `ticket_required` also opens it | A failed generation shows the error and the ticket count stays the same |
| F6 | **Wallet page**: two balances side by side (มู / ตั๋วรู้ใจ), expiring grants ("1 ใบ หมดอายุ 30 ต.ค."), a "ไปร้านค้า" link. Two history tabs: **มู** and **ตั๋ว**, each paged | Every row readable without jargon; no admin identity anywhere |
| F7 | **Tooltip** "ทำไมต้องแลกมู?" next to the exchange confirm, in the Shop and the mini-shop | Text exactly as in §5 |
| F8 | **Events** (§6) | Each fires once per real action |
| F9 | **Tests**: update the red wallet/topup tests; add tests for offer rendering from data, the smallest-pack choice, 402/409 handling, and `fulfilment: "failed"` | `bun test` green |

## 5. Copy

| Where | Text |
|---|---|
| Category | eTicket |
| Product | ตั๋วรู้ใจ |
| Description | ตั๋วสำหรับเปิดคำอ่านดวงคู่ ใช้ 1 ใบต่อ 1 คน ตั๋วที่ซื้อไม่มีวันหมดอายุ |
| Badges | แถม 1 · แนะนำ |
| Confirm | แลก {price} มู เป็นตั๋วรู้ใจ {units} ใบ |
| Short of มู | ขาดอีก {shortfall} มู · เติม ฿{priceBaht} ได้ {base+bonus} มู |
| Door, has ticket | ใช้ตั๋วรู้ใจ 1 ใบ (เหลือ {n} ใบ) |
| Door, no ticket | เปิดคำอ่านนี้ด้วยตั๋วรู้ใจ |
| Exchange failed after top-up | เติมมูเข้ากระเป๋าแล้ว แต่ยังแลกตั๋วไม่สำเร็จ · แลกตั๋วอีกครั้ง |
| Tooltip "ทำไมต้องแลกมู?" | มูคือยอดกลางสำหรับของในร้าน ส่วนตั๋วรู้ใจใช้เปิดคำอ่านดวงคู่ การเติมมู การแลกตั๋ว และการใช้ตั๋วแยกเป็นคนละรายการ จึงตรวจสอบได้ชัดเจน หากเปิดคำอ่านไม่สำเร็จ ตั๋วจะไม่ถูกใช้ |

Only the tooltip, the description and the product/category names are fixed. Adjust the rest to DESIGN.md's voice if
needed, keeping the numbers.

## 6. Events

Send with the existing hook `useTrackEvent()` from `src/lib/analytics.ts`. The event types come from the synced
`src/lib-packages/shared/types/analytics.ts`.

| Event | When | Payload |
|---|---|---|
| `shop_viewed` | Shop page mounts | `{ event: 'shop_viewed', surface: 'shop', entry: 'nav' \| 'door' \| 'wallet' \| 'link' }` |
| `product_viewed` | product sheet or mini-shop opens | `{ event: 'product_viewed', surface: 'shop', productId, entry: 'shop' \| 'mini_shop' }` |
| `offer_selected` | the reader taps an offer (not the preselection) | `{ event: 'offer_selected', surface: 'shop', productId, offerId }` |

Pass `entry` through the Shop URL as `?from=door|wallet|nav` when you link to it. The server records
`topup_started`, `topup_completed`, `catalog_purchase_completed`, `ticket_consumed`, `fulfilment_failed`,
`refund_requested` and `refund_completed` itself. **Never send those from the client.**

## 7. Done when

- At phone width (375 px): Shop → pick `2 ใบ แถม 1` → short of มู → pay the QR (dev: the backend's fake gateway,
  `POST /api/wallet/dev/pay { orderId }`) → tickets appear → the door opens a report and the count drops by one.
- A tab reload during a pending payment recovers (existing behaviour, still working).
- `type-check`, `lint`, `test`, `build` pass. Report which files you changed, one line each.
