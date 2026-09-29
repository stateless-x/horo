---
type: PLAN
status: active — T1, T2, T3, T4 (มู ledger) and T8's locked mode + spend built on feat/monetization-prep, not merged; payments (T5) not built (2026-09-27); T5 and T7 redesigned, T15 product pass and T16 audit trail planned (2026-09-29)
scope: paid products, credits, payments, removal of donation and forced Shopee, wallpaper waitlist
last_reviewed: 2026-09-29
owner: product
decision_log: ~/product-decisions/horo/2026-09-29-monetize.md (current); 2026-09-27-monetize.md (origin)
---

# Monetization tickets

Horo's first paid products. **One-time payments only, no subscription.** When this doc and the code
disagree, the code wins; update this doc in the same commit.

## Summary

| ID | Ticket | Repo | Size | Depends on |
|---|---|---|---|---|
| T1 | Remove the auto-opening donation modal | fe | S | — |
| T2 | Remove the two forced Shopee openers | fe | S | — |
| T3 | Payment + credit schema (built: มู) | be | S | — |
| T4 | Credit and entitlement service (built: มู wallet) | be | M | T3 |
| T5 | PromptPay gateway: charge, webhook, status | be | M | T3, T4 |
| T6 | Tracking plan: 17 events + 4 columns (see Tracking plan) | fe + be | M | — |
| T7 | เติมมู sheet: packs, PromptPay QR, return from bank app | fe | M | T5, T6 |
| T8 | ดวงคู่: free summary, locked detail, credits | be + fe | M | T4, T7 |
| T9 | ดวงเดือนหน้า month pass ฿29 | be + fe | L | T4, T7 |
| T10 | ดวงทั้งปี year reading ฿99 | be + fe | L | T4, T7, T9 |
| T11 | Lucky wallpaper coming-soon page + waitlist | fe | S | T6 |
| T12 | Opt-in element picks (Shopee, strategic) | fe | S | T2, T6 |
| T13 | Revenue page + manual grant/refund in horo-admin (via horo-be internal routes) | admin + be | M | T3, T4, T16 |
| T14 | Trust: refund policy, Thai receipt, terms | fe + be | S | T5 |
| T15 | Product pass: ดวงคู่ 3 คน for 98 มู | be + fe | M | T4, T8 (one-flow purchase also T5, T7) |
| T16 | Wallet audit trail: actor on every ledger row, user history route | be + fe | S | T4; before merge to master |
| T17 | Accounting routes: monthly reconciliation, CSV exports, month close, `corrects` on reversals | be | M | T16, T5 |

Release order: **R0** T1, T2, T6 (ship now, no dependencies) → **R1** T3, T4, T16, T5, T7, T8, T13, T14 (first money: ดวงคู่) →
**R2** T9, T11, T12, T15 → **R3** T10.

## Product ladder

| Product | Price | What the buyer gets | Free forever |
|---|---|---|---|
| ดวงคู่ unlock | 49 มู per person · pass: 3 คน for 98 มู (T15, proposed) | Unlock the full analysis for one person | Score, one-line verdict, both elements, share card. Plus a **49 มู welcome gift** per account. |
| ดวงเดือนหน้า (month pass) | ฿29 per month | That month's reading early (from the 20th of the month before) + a 30-day good-days calendar | This month's full reading, exactly as today |
| ดวงทั้งปี (year reading) | ฿99 per 12 months | 12-month outlook, best months for love, money and work, and a month pass for each of the 12 months | — |
| Lucky wallpaper | coming soon, "39 มู เมื่อเปิดขาย"; a fixed price per design, never a paid random draw | Waitlist only | — |
| ถามแม่หมอ (AI chat, not built) | ~10 มู per question [?, needs the measured DeepSeek cost per answer]; 1 free question per account | An answer framed as guidance, never as certainty | The first question |
| ดวงวันนี้ | free | — | All of it |

**มู packs (the only thing sold for baht; 1 มู = ฿1; `pricing.ts`):**

| Pack | มู | Chip | Where shown |
|---|---|---|---|
| ฿49 | 49 | none | everywhere |
| ฿99 | 109 | +10% | everywhere; preselected in the store |
| ฿199 | 229 | +15% · คุ้มสุด | everywhere |
| ฿399 | 479 | +20% | store only (it's the anchor); **not yet in `pricing.ts`** |

Rules that hold across tickets:
- **Every paid product is priced in มู.** No product gets its own credit, apart from the product pass (T15). Physical
  merch is never sold for มู: it goes through Shopee or a separate baht order.
- **Leftover มู must be spendable.** A small item (ถามแม่หมอ at about 10 มู) absorbs remainders. Until it ships, see the
  T9 leftover rule.
- **Grandfather.** Every compatibility row created before R1 launch stays fully readable. Nothing free today is taken away.
- **No ads or affiliate links on paid content, paywalls, or checkout.**
- Prices live in one config (`horo-be/src/lib/pricing.ts`), in satang (integer), never floats.

## Credit tracking design (T3, T4)

**Superseded for credits (2026-09-27):** credits became มู, a closed-loop unit pegged 1 = ฿1 and sold in packs.
The built design is `horo-be/docs/wallet.md`: tables `orders` and `wallet_ledger`, prices in `src/lib/pricing.ts`.
The sketch below is kept for the `entitlements` table, which T9 and T10 still need.

Three tables. The ledger is append-only: a row is never updated or deleted, the balance is `SUM(delta)`, and a
refund or correction is a new row. That gives an audit trail for free and makes "where did this credit come from"
a single query.

```
orders          id uuid pk · user_id · sku · amount_satang int · currency 'THB'
                status: pending | paid | failed | expired | refunded
                provider · provider_charge_id (unique) · qr_expires_at · paid_at · refunded_at · created_at

credit_ledger   id uuid pk · user_id · credit_type 'compat' · delta int (+n / -1)
                reason: purchase | welcome | spend | refund | admin_adjust
                order_id (nullable) · compatibility_id (nullable) · note · created_at

entitlements    id uuid pk · user_id · sku 'month_pass' | 'year_reading'
                scope text ('2026-11' for a month) · valid_from · valid_to · order_id · created_at
```

Guarantees, enforced by unique indexes rather than code:
- `credit_ledger (order_id, reason)` → a replayed webhook can't credit twice.
- `credit_ledger (user_id, compatibility_id) WHERE reason='spend'` → one person can't be unlocked twice.
- `credit_ledger (user_id) WHERE reason='welcome'` → one welcome credit per account, ever.
- `entitlements (user_id, sku, scope)` → a month can't be granted twice.
- `spend` runs in one transaction that locks the user (`pg_advisory_xact_lock(hashtext(user_id))`), re-reads the
  balance, and inserts `-1` only if balance ≥ 1. Two taps at once never go negative.

State changes only come from the gateway **webhook**. A client redirect or "I paid" button only polls status.

Credits don't expire at launch. The small liability doesn't justify the extra trust cost. `reason` can later add
`expire` without a migration.

## Tracking plan (T6)

Defined 2026-09-29 (PO log `2026-09-29-monetize.md`). There is one principle: **money comes from the money tables,
behaviour comes from events.**
- Revenue, pack mix, refunds and spends are counted from `orders`, `wallet_ledger`, `product_passes` and `pass_uses`.
  They are never counted from events, so there is nothing to double-count and nothing to reconcile.
- Events cover only what those tables can't see: views, taps, the QR and the return from the bank app.

This list replaces the separate event names proposed in the 2026-09-28 and 2026-09-29 feature briefs
(`compatibility_locked_impression`, `compatibility_full_section_viewed`, `compatibility_action_chosen` …).

### Event columns (additive, nullable, on `product_events`)

| Column | Holds |
|---|---|
| `ref_id` text | the order id, report id or pass row id; joins an event to the money tables |
| `context` varchar(32) | where it happened: `door`, `chip`, `wallet`, `history` or `success` |
| `value` integer | a number that belongs to the event: the shortfall in มู, or a depth percentage |
| `variant` varchar(16) | an experiment arm, e.g. `cta_baht` / `cta_mu`; null outside tests |

`detail` keeps its role (a pack id or a product id). No personal data goes in any column.

### Events

| # | Event | Side | Fires when | detail · context · value · ref | Dedup |
|---|---|---|---|---|---|
| 1 | `paywall_viewed` | fe | a locked door is on screen | product · balance state `short` / `covered` / `pass` · — · report id | user + product + ref + day |
| 2 | `unlock_tapped` | fe | a door button is tapped | product · `single` / `pass_buy` / `pass_use` · — · report id | none |
| 3 | `topup_opened` | fe | the เติมมู sheet opens | — · door / chip / wallet · shortfall มู · — | none |
| 4 | `pack_selected` | fe | the user changes the preselected pack | pack id · context · — · — | none |
| 5 | `checkout_started` | be | an order row is created | pack id · context · baht · order id | order |
| 6 | `qr_shown` | fe | the QR renders | `mobile` / `desktop` · — · — · order id | order |
| 7 | `qr_saved` | fe | บันทึก QR is tapped | — · — · — · order id | order |
| 8 | `payment_return` | fe | the tab becomes visible again while an order is pending | — · — · seconds away · order id | order |
| 9 | `qr_refreshed` | fe | ขอ QR ใหม่ is tapped after expiry | — · — · — · old order id | none |
| 10 | `payment_succeeded` | be | the webhook marks the order paid | pack id · — · baht · order id | order |
| 11 | `payment_expired` | be | the intent expires or fails | pack id · — · — · order id | order |
| 12 | `unlock_succeeded` | be | a row opens | product · paid with `mu` / `pass` / `welcome` · — · report id | user + product + ref |
| 13 | `unlock_failed` | be | generation fails (nothing is charged) | product · failure class · — · report id | none |
| 14 | `report_depth` | fe | the full report passes 25 / 50 / 75 / 100% | product · — · depth % · report id | user + ref + depth |
| 15 | `report_action_chosen` | fe | a next-step action in the report is chosen | action id · relationship type · — · report id | none |
| 16 | `support_opened` | fe | "ไม่เห็นยอด?" or a refund link is tapped | — · context · — · order id | none |
| 17 | `waitlist_joined` | fe | wallpaper waitlist | product · — · — · — | user + product |

Wallet pages reuse `surface_viewed`, with `wallet` and `wallet_history` added to `TRACKED_EVENT_SURFACES`.

### Metrics and the decision each one drives

| Metric | Computed from | Decision it drives | Rule |
|---|---|---|---|
| Door → paid (first purchase) | 1 → 10 per user, with a `ref` join | door copy and baht-first label (T7) | <1% after 300 doors → interview 5 who left before touching price |
| Sheet → checkout | 3 → 5 | pack sheet layout | <40% → cut the sheet to 2 packs everywhere [A threshold] |
| Preselect override rate | 4 ÷ 3 | which pack is preselected | >50% override to one pack → preselect that pack |
| Pack mix and average order value | `orders` | chips, คุ้มสุด, the ฿399 anchor | ฿199 <15% after 30 orders → move คุ้มสุด or the preselect |
| QR → paid, mobile vs desktop | 6 → 10, split by device | **Stripe QR vs Opn bank-app buttons** | mobile ≥15 points below desktop → build the app-switch |
| Save-QR use, return rate, seconds away | 7, 8 | the same-phone flow | a return without payment >30% → rewrite the hint |
| QR expiry rate | 11 ÷ 5 and 9 | QR lifetime | >20% → longer expiry |
| Median time to pay | 5 → 10 timestamps | overall flow friction | tracked; no target yet |
| Unlock failure rate | 13 ÷ 2 | generation reliability | >2% → fix before any growth push |
| Report depth ≥75% | 14 | whether the paid report delivers | <50% of unlocks → rework the report, not the price |
| Second purchase ≤30 days | `orders` | packs and passes | see Tracking below |
| Pass share of ดวงคู่ buys | `wallet_ledger` | keeping T15 | <10% after 30 orders → retire the pass |
| Stranded balance | users with 1 to (cheapest item − 1) มู for 30+ days, from `wallet_ledger` | the T9 leftover rule | >10% of payers → ship the 10 มู item first |
| Support opens and refund rate | 16, `wallet_ledger` | trust copy, report quality | refunds >10% → pause sales |

**Ownership.** The admin revenue page (T13) shows these in the order above, with this week and last week side by
side. The PO re-reads them at every review date. Until T13 ships, a saved SQL file in the PO log folder is enough.

---

## Tickets

### T1 · Remove the auto-opening donation modal
**Why:** the auto-opening modal interrupts every result page. A donation the user chooses to open is fine.
- Delete `<AutoDonationModal …/>` and its import from `horo-fe/src/app/dashboard/{today,fortune,compatibility}/page.tsx`,
  and the `AutoDonationModal` export from `donation-modal.tsx`. `donation-eligibility.ts` and its test go too, since
  only the auto modal read its delay.
- **Keep** the footer line "☕ ชอบใจ? ซื้อกาแฟให้พี่ภูสักแก้ว ♡", its "สนับสนุน" `DonationButton`, and the
  `DonationModal` it opens (`horo-fe/src/components/layout/footer.tsx`). That modal opens nothing on open or close;
  its save-QR `window.open` fallback runs only on a tap.
- Rewrite `horo-fe/src/components/ads/donation-mounts.test.ts` as a guard for the new intent: no page under `src/app`
  mounts the auto modal and the export is gone, the footer still renders `DonationButton` and `DonationModal`, the
  modal never imports the Shopee opener, and `read-next.tsx` has no forced Shopee opener (T2).
- `pawjai-ads-banner.tsx` (the Pawjai cross-promo on today and compatibility) stays for now. **Open question for the owner:** did "remove donation banner" mean this banner too? Either way, T8 moves it off the compatibility result, because that page will carry paid content.

**Done when:** `rg -n "AutoDonationModal" horo-fe/src` returns nothing (the guard test builds the name rather than
writing it, so it does not match itself), and the guard test passes along with `bun run type-check`, `bun test` and
`bun run build`.

### T2 · Remove the two forced Shopee openers
- `horo-fe/src/components/ads/donation-modal.tsx` modal-close opener goes away with T1's `AutoDonationModal`.
- `horo-fe/src/features/fortune/chart/read-next.tsx` ~line 86: drop the `onClick` that calls
  `openTrackedShopeeAffiliateLink(... 'fortune_compatibility_cta')`. The ดวงคู่ card becomes a plain link.
- Keep `horo-fe/src/lib/shopee-affiliate.ts` and its test for T12. Remove the `donation_modal_close` and
  `fortune_compatibility_cta` placements from `AFFILIATE_PLACEMENTS` in `horo-be/lib/shared/types/analytics.ts`, then
  run `bun run sync:types` in horo-be. The list stays empty until T12 adds `element_picks`.
- `POST /api/analytics/event` drops its `affiliate_link_opened` body member while the list is empty, so a stale
  cached bundle posting a retired placement gets a 422 (the client only warns, never retries). T12 adds it back.
- horo-admin keeps both labels for historical rows, suffixed "(เลิกใช้แล้ว)".

**Done when:** no code path opens a new tab the user didn't tap for. Baseline to beat: 178 opens, 93% forced [M, 2026-09-27].

### T3 · Payment + credit schema
**Built on feat/monetization-prep (2026-09-27):**
- `horo-be/lib/db/schema/wallet.ts`: `orders` and the append-only `wallet_ledger`. There is no `entitlements` table
  yet, since `compat_unlock` doesn't need one.
- Partial unique indexes cover order credit, the welcome gift, one spend per thing, and one refund per spend.
- `bun run db:push` on the local DB created both tables, and a second push reports "No changes detected".
- Duplicate inserts on each unique index fail with 23505 (`tests/wallet.test.ts`).
- Design and invariants: `horo-be/docs/wallet.md`.

### T4 · Credit and entitlement service
**Built on feat/monetization-prep (2026-09-27) as the มู wallet:**
- `horo-be/src/lib/wallet.ts` provides `balance`, `ensureWelcome`, `spend`, `refundSpend`, `createOrder`, `getOrder`,
  `creditOrder`, `adjust` and `ledger`. Each balance-dependent write runs under the per-user advisory lock.
- Routes: `GET /api/wallet` returns `{ balance, cap, packs, prices, ledger }`.
  - `POST /api/wallet/checkout` creates a pending order and returns `payment: 'unavailable'` until T5.
  - `GET /api/wallet/orders/:id` returns the order's status.
  - A dev-only `POST /api/wallet/dev/grant` exists.
- Tests cover:
  - concurrent double-spend;
  - welcome granted once across concurrent first touches;
  - a replayed `creditOrder`;
  - a refund, then spend again (refused, never free);
  - the cap at checkout and on credit;
  - the dev grant refused in production and on a non-local DB.

**Still to do:**
- `hasMonthPass`, `hasYearReading` and `grantFromOrder` with the `entitlements` table (T9, T10), plus the Bangkok month
  boundary tests.
- Bonus expiry enforcement.

### T5 · PromptPay gateway
- **Provider (decided 2026-09-27): Stripe, PromptPay.** Still to confirm: whether an individual or a business account
  is eligible [?]. Fee ≈ 1.65% [A].
  - Stripe PromptPay only offers a QR code. Opn Payments may offer buttons that open the buyer's bank app directly
    [?, unverified]. That would remove the same-phone QR step.
  - Owner to decide before building. Nothing else in the design depends on it.
- **No Stripe Products or Prices.** `startPayment(order)` in `horo-be/src/routes/wallet.ts` creates a PaymentIntent:
  - `amount: packAmountSatang(pack)`, `currency: 'thb'`, `payment_method_types: ['promptpay']`;
  - `metadata: { orderId, packId, userId }`;
  - it returns the QR and `qr_expires_at` in `CheckoutResponse`.

  Prices stay only in `pricing.ts`.
- **`POST /api/payments/webhook`:**
  - Verifies the signature and is idempotent on the Stripe event id.
  - On `payment_intent.succeeded`: `wallet.markPaid(orderId)`, then `fulfilPaidOrder(orderId)`. That credits the pack
    and, when `unlock_ref` is set, unlocks that row.
  - Expired or failed intents set the order status.
  - Ledger rows carry `actor_type = 'system'` and the event id (T16).
- `GET /api/wallet/orders/:id` (exists) is the only status read. The client polls it, and only the webhook changes
  state.
- Re-scan of an already-paid QR (known gap, decision 2026-09-29): Stripe takes the money, adds it to Horo's balance and
  notifies the account outside the PaymentIntent (docs.stripe.com/payments/promptpay, "Repeated payments"). No webhook
  fires, so nothing lands in `payment_events` by itself. Handling: (1) the pay step hides the QR the moment the order is
  paid and the saved-QR hint says it works once; (2) an admin checks the Stripe balance for reimbursements weekly and
  records each one as an `excess_payment` row through the internal route (T13), then contacts the buyer for a
  PromptPay refund (T14). Never `adjust` from the webhook.
- Env: Stripe secret and webhook secret in Railway. Never log the customer fields in the payload.

**Done when:** a test-mode payment is credited within 5 seconds of the webhook; the ดวงคู่ unlock finishes when generation
ends (about 20 s) behind a visible progress state; replaying the webhook changes nothing. Verified in the sandbox on
2026-09-29 (PO review): credit in ~7 s, report open in ~30 s, replay idempotent.

### T6 · Tracking plan events
The spec is "Tracking plan (T6)" above.
- `horo-be/lib/db/schema/analytics.ts`: add the four nullable columns (`ref_id`, `context`, `value`, `variant`) to
  `product_events`. The change is additive, so a normal push is safe.
- Add events 1–17 to `TRACKED_EVENT_NAMES` / `TrackedEvent` in `horo-be/lib/shared/types/analytics.ts` (then
  `bun run sync:types`) and to `dedupKeyFor` in `src/lib/analytics-events.ts`.
  - The backend events (5, 10, 11, 12, 13) are written by T5, T4 and T8 inside the same code path as the money write.
  - The frontend events go through the existing tracking hook.
- Add `wallet` and `wallet_history` to `TRACKED_EVENT_SURFACES`.
- Keep the TS unions closed. No free-form event names or details.

**Done when:**
- each event lands in `product_events` from a local lock-on run, with the expected dedup;
- one pack purchase can be joined from `paywall_viewed` to `payment_succeeded` by `ref_id`;
- no event row contains a name, email or partner name.

### T7 · Checkout sheet (เติมมู)
The design was settled in the PO log on 2026-09-29. The pack sheet exists at `horo-fe/src/features/wallet/pack-sheet.tsx`;
this ticket adds the pay step.
- **Pack step.**
  - Header "เติมมู", then a line with the balance and "1 มู = ฿1".
  - One line on what มู is for: "ใช้ได้กับทุกอย่างใน Horo: ดวงคู่ วอลเปเปอร์ ถามแม่หมอ". Rows never name a product.
  - Rows show the มู amount, the bonus chip, the baht price and a radio mark. The chip is
    `Math.floor(bonus / base * 100)`, computed from `pricing.ts` and never rounded up.
  - คุ้มสุด goes on ฿199. No "ยอดนิยม" badge until the pack mix is measured.
  - One pay button that repeats the amount, "จ่าย ฿99 ด้วย PromptPay", and two trust lines under it:
    "จ่ายครั้งเดียว ไม่ตัดเงินอัตโนมัติ" / "มูที่เติมไม่หมดอายุ · โบนัสใช้ได้ 180 วัน" (bonus มู expire; PO review 2026-09-29).
- **Two contexts, one component.**
  - From a locked door: the shortfall line, two packs (the smallest one that covers the price, plus one step up), the
    smallest preselected. It is paid as a one-flow purchase with `unlockRef`.
  - From the balance chip or the wallet page: all four packs, with ฿99 preselected.
- **Door label.** When the balance is short, the button reads baht-first ("เปิดคำตอบทั้งหมด · ฿49"). When the balance
  covers it, "เปิดคำตอบทั้งหมด · 49 มู". Built and verified 2026-09-29.
- **Open (owner):** whether the short-balance button opens the 2-pack door sheet (built, B) or goes straight to the QR
  for the smallest covering pack with packs behind a link (A). PO recommends A for a first purchase.
- **"ขอ QR ใหม่"** sends `replaceOrderId`; the server cancels the old charge first (409 `already_paid` if it had
  succeeded). Found in the 2026-09-29 browser run: without it two QRs stayed live for one user.
- **Pay step.**
  - On a phone: a large QR, a **บันทึก QR** button, and the hint "บันทึก → เปิดแอปธนาคาร → สแกนจากรูป". Add the
    bank-app buttons first if T5 picks Opn.
  - On desktop: the QR only.
  - A countdown to `qr_expires_at`, then a one-tap "ขอ QR ใหม่" instead of an error.
- **Return from the bank app.**
  - Store the pending `orderId` in localStorage.
  - Poll every 2–3 s, and again immediately on `visibilitychange`.
  - After a reload, reopen the sheet in a "กำลังตรวจสอบการชำระ" state.
- **Success.**
  - The balance counts up ("+109 มู"). From a door, the report opens.
  - Only then offer a bigger pack ("ครั้งหน้าเติม ฿199 ได้ 229 มู").
  - For the month pass or year reading: "กำลังเตรียมดวง (ไม่กี่นาที)", plus an email when it's ready.
- "ไม่เห็นยอด?" links to support with the order id.
- Copy is transactional and pronoun-free. Hand the screen to `impeccable`, following `horo-fe/DESIGN.md`.

**Done when:**
- The paid → credited → unlocked path works at phone width without a reload, including a tab reload while the order
  is pending.
- An expired QR recovers in one tap.

### T8 · ดวงคู่: free summary, locked detail, credits
**Built on feat/monetization-prep (2026-09-27), behind `COMPAT_LOCK_ENABLED` (off by default):**
- **Teaser-first generation.** With the lock on, a check writes only the free teaser: the insight plan, then the cover
  (verdict and three locked hints). The paid detail is written on unlock, from the same stored plan, and patched into
  the same row. The detail's model cost is only spent on unlocks.
  - Stored shape, flow and latency: `horo-be/docs/compatibility-response-fix.md`, "Locked mode".
  - Measured: teaser about 7 s, detail about 15 s.
- **`POST /api/fortune/compatibility/:id/unlock`.** Owner only and idempotent. The single-flight lock allows one generation
  per row. Entitlement goes through `checkUnlock` (before generation) and `chargeUnlockWithin` (in the patch transaction) in `horo-be/src/lib/entitlements.ts`; `assertCanUnlock` was removed (`horo-be/docs/wallet.md`, "The ดวงคู่ unlock").
- **No locked text reaches a client.** POST, `GET /compatibility/:id` and unlock return `locked` and the teaser view
  while `detail` is null, and never the stored `analysis` JSON for v4. The share link returns the free fields only for
  every v4 row. History carries no reading text. Tested per route on the serialized JSON.
- **Grandfather.** A row with its detail present is always full. v1 and v2 rows are unchanged. Their share links still
  return the stored text, which was never paid.
- **Frontend.** A locked row renders the teaser and the door (CTA text now from the wallet, below). The tap shows
  "กำลังเขียนฉบับเต็ม (ราว 20 วินาที)", then reveals the full report in place, without a reload.

**Built with T4 (2026-09-27):**
- `assertCanUnlock` grants the welcome gift (49 มู), then spends `compat_unlock` (49) for the row.
- The wallet exists only while the lock is on. Otherwise `GET /api/wallet` returns `{ enabled: false }`, with no welcome
  gift and no header chip. So the gift lands at the first locked ดวงคู่ result. The wallet page shows no donation button.
- **One-flow purchase:** short of the price, the door's primary button is "ปลดล็อก ฿49". It creates an order with
  `unlock_ref` = this row, and payment credits the pack, then unlocks the row with no second tap (`fulfilPaidOrder`).
  "ซื้อแพ็กคุ้มกว่า" opens the packs. Ledger rows name the pair and link to it. The Pawjai banner is off the ดวงคู่ page.
- An unlock that is short answers 402 `{ error: 'insufficient_balance', balance, price }` (`INSUFFICIENT_BALANCE` in the shared wallet types). `page.tsx` rethrows the 402 so the door sees it.
- The door reads `GET /api/wallet`: "ใช้ 49 มู ปลดล็อก (มี N มู)". A 402 turns it into "เติมมู", which
  opens a pack sheet with 3 packs, each with a disabled "PromptPay เร็ว ๆ นี้".
- A header chip "มู N" links to `/dashboard/wallet`: balance, packs, ledger.
- Verified on the lock-on stack without `COMPAT_UNLOCK_FREE`: a new check shows the door with มี 49, the unlock spends
  49 and opens the full report, and a second locked row gets a 402 and the pack sheet.

**Still to do:**
- **The route still charges before generating.** The wallet side of the fix is built. The route should call
  `checkUnlock`, then generate, then run one transaction `{ chargeUnlockWithin + patch the detail }`
  (`horo-be/docs/wallet.md`). Until then, a failure that repeats on every attempt leaves the user paid with no report.
  **This blocks turning the lock on in production.**
- Paid unlocks don't count toward the daily 5-check cap. The unlock route has no rate limit today.
- Checkout (T7) replaces the disabled pack buttons.

**Done when:**
- a new account sees one free unlock;
- the second person shows the ฿49 path;
- old rows stay open;
- the share, history and detail responses contain no locked text for a locked row. The route tests exist; extend them
  for the ledger.

### T9 · ดวงเดือนหน้า month pass ฿29
- The current month stays exactly as today. `chart_narratives` keeps one row per profile and is overwritten monthly.
- New table `month_readings (profile_id, month 'YYYY-MM', structured_reading, good_days json, created_at)`, unique on
  `(profile_id, month)`. Generate on first paid view, reusing the chart prompt with the target month
  (`src/lib/prompts/md/chart.md`) plus a good-days section: per day, love/money/work rated good, neutral or careful.
- Sell from the 20th for next month, and anytime for the current month's calendar.
- On the 1st, the free chart for the new month regenerates as today, **except** for buyers: if a `month_readings` row
  exists for that profile and month, the chart route serves that text as the free reading instead of generating a
  new one (hook into the month-boundary check, `src/systems/fortune/routes.ts` ~656–703). A buyer must never see two
  different readings for the same month. The good-days calendar stays paid.
- Generation takes minutes (DeepSeek). Start it in the webhook the moment the order is paid (T5 → T4 `grantFromOrder`),
  and let the reader show a "กำลังเตรียมดวงของเดือนหน้า" state until the row exists.
- Entry point: the existing monthly promo on `/dashboard/today` (`horo-fe/src/features/fortune/monthly-chart-promo.tsx`,
  49% tap-through [M]) and the bottom of `/dashboard/fortune`.
- Reminder email on the 20th to past buyers, using the existing campaign sender (`src/lib/campaign-sender.ts`).
  This replaces a subscription with a nudge.

**Done when:** buying on the 20th shows next month's reading and calendar, and on the 1st the free reading still
generates and the calendar is still there.
- **Leftover rule.** Buying the 29 มู month pass through the ฿49 pack leaves 20 มู that can't buy anything else yet.
  Before T9 ships, either ship ถามแม่หมอ (10 มู items absorb it) or let the door charge exactly ฿29 through a hidden p29
  pack. Owner to pick.

### T10 · ดวงทั้งปี year reading ฿99
- New table `year_readings (profile_id, start_month, structured_reading, created_at)`: a year overview, best and worst
  months per area, and one line per month.
- One purchase also grants 12 `month_pass` entitlements (T4). On the ฿29 screen, show "ทั้งปี ฿99" as the anchor.
- Generate in the webhook, same as T9, and show a preparing state until it's ready.
- Seasonal push: "ดวงปี 2570" in the Dec–Jan campaign.

**Done when:** a year buyer never sees the ฿29 paywall for months inside the window.

### T11 · Lucky wallpaper coming-soon page
- `/dashboard/wallpaper`: a preview built from the user's own element and Thai birth-day colour (already stored:
  `bazi_charts.primary_element`, `thai_astrology_data.day/color`), the line "฿39 เมื่อเปิดขาย", and one button,
  "แจ้งฉันเมื่อพร้อม", which fires `waitlist_joined`.
- Link to it from the lucky-colour spots on `/dashboard/today` and `/dashboard/fortune`.
- Launch email to the waitlist via the campaign system when the product exists.

**Done when:** waitlist joins show in horo-admin. Decision rule: ≥20 joins in 30 days → build the wallpaper.

### T12 · Opt-in element picks (Shopee, strategic)
- One card at the end of the chart reading: "ของเสริมดวงธาตุ{element}", with 3 curated picks per element
  (15 links, each with an optional `expiresOn`) in `horo-fe/src/lib/shopee-affiliate.ts`. Label it "ลิงก์พันธมิตร".
- Opens only on tap. Fires `affiliate_link_opened` with placement `element_picks`. Add a Shopee `sub_id` per placement
  so the Shopee conversion report splits by placement [A — confirm sub_id support in the Shopee Affiliate dashboard].
- A secondary spot on the wallpaper coming-soon page ("ระหว่างรอ").
- **Never** on the ดวงคู่ result, paid content, the paywall or checkout.

**Done when:** voluntary opens show per placement. Decision rule: <2 opens per week after 4 weeks → remove it.

### T13 · Revenue page in horo-admin
- `/revenue`: orders per day by SKU, revenue in baht, funnel per product (T6), refunds, credits outstanding
  (`SUM(delta)` over all users), and welcome credit spent → paid second-person rate.
- Admin actions write ledger rows only: grant credit (`admin_adjust`) and refund order (`refund`), each with a note.
- Every action records the acting admin on the ledger row (`actor_type = 'admin'`, `actor_id`, `actor_label` = email).
  See `horo-be/docs/wallet.md`, "Audit trail". Pages:
  - a per-user history (baht paid, มู credited and spent, pass uses, who did each);
  - an admin action log, filterable by admin.
- **Decided 2026-09-29:** admin writes go only through horo-be's private `/internal/wallet/*` and
  `/internal/orders/mark-paid` routes, behind `INTERNAL_API_SECRET`. horo-admin reads the wallet tables and never writes
  them (`horo-be/docs/wallet.md`, "How horo-admin writes").
  Refunds are sent manually by PromptPay transfer, and the row records it.
- **Accountant audit (owner request 2026-09-29):** the monthly reconciliation (cash in, moo issued split
  paid/promo/admin, moo spent, reversals, outstanding, with the identity check), CSV exports of ledger and orders, a
  monthly close snapshot, a needs-review queue, and correction-by-reversal with a `corrects` reference. Spec:
  `horo-be/docs/wallet.md`, "Accounting and audit". The backend routes are ticket T17; this page renders them.
- Follow `horo-admin/DESIGN.md`. Verification per the admin limits: type-check, test, build.

### T14 · Trust
- `/refund` page: full refund within 7 days, no questions, by PromptPay transfer.
- Thai receipt email on `payment_succeeded` (Resend, transactional, ignores `emailOptOut`).
- Terms: add paid products, one-time, no auto-renew, refund policy, and a contact channel.

### T15 · Product pass (ดวงคู่ 3 คน for 98 มู)
Owner decision 2026-09-29. The spec is `horo-be/docs/wallet.md`, "Product passes (planned, not built)". The numbers there
are proposed defaults the owner has not confirmed.
- A pass is bought with มู and holds counted uses of one product. Singles never add up to a pass.
- Backend: `product_passes` and `pass_uses` (additive), a `PASSES` config in `pricing.ts`, and `compat_pass_3` in
  `ProductId`. `hasPaid`, `checkUnlock` and `chargeUnlockWithin` use a live pass before charging 49 มู. Add a pass
  refund operation (unused uses only). `GET /api/wallet` returns `passes`.
- Frontend: the door shows "เปิดคนนี้ · 49 มู" and "ชุด 3 คน · 98 มู", or "ใช้สิทธิ์ (เหลือ N คน)" when a pass is live.
  The wallet page lists passes with their expiry.
- Open: the one-flow purchase of a pass by QR needs an order column saying what to buy after the credit.

**Done when:**
- Buying a pass, then unlocking three different people, writes exactly one −98 spend and three `pass_uses` rows. The
  fourth unlock charges 49.
- One row can't be opened by both a pass and a spend.
- A failed generation leaves the use unspent.
- All of these are covered by tests on the local Postgres.

### T17 · Accounting routes
Spec: `horo-be/docs/wallet.md`, "Accounting and audit".
- Schema (additive): `wallet_ledger.corrects uuid null` (the row a reversal undoes), `report_snapshots`.
- `/internal/reports/monthly`, `/internal/reports/ledger.csv`, `/internal/reports/orders.csv`,
  `/internal/reports/close`, all behind `INTERNAL_API_SECRET`.
- Origins (paid / promo / admin / reversal) derived in one shared function used by both the report and the CSV.

**Done when:**
- on the local DB, `issued_paid` equals cash in for a month with three paid orders and one refund;
- the identity check passes, then fails after a hand-inserted row, and the report names that row;
- a closed month re-run reproduces its snapshot;
- the CSV opens in Excel with Thai text intact (BOM) and contains no admin email in the accountant variant.

### T16 · Wallet audit trail
The spec is `horo-be/docs/wallet.md`, "Audit trail: who did what".
- Backend:
  - `actor_type`, `actor_id` and `actor_label` on `wallet_ledger` (not null, before the first production push);
  - backfill local rows;
  - `adjust` takes an actor and needs a note;
  - the T5 webhook writes `system` with the Stripe event id;
  - `GET /api/wallet/history` merges ledger rows and pass uses.
- Frontend, two pages per user:
  - `/dashboard/wallet` (exists): balance, live passes, packs, and a 5-row preview linking to the history page;
  - `/dashboard/wallet/history` (new): full paginated history with a kind filter.
  - Admin rows read "ปรับยอดโดยทีมงาน" plus the note.

**Done when:**
- every ledger row in tests has a non-null `actor_type`;
- an `admin_adjust` without a note or an admin actor is refused;
- the history route pages correctly;
- no user-facing response contains an admin id or email.
- a user can never read another user's history: the route takes no user id, which is tested.

## Tracking

| Metric | Baseline [M] | Target | Review | Kill-or-keep |
|---|---|---|---|---|
| ดวงคู่ welcome credit spent / granted | 0 | ≥50% | 4 weeks after T8 ships | <25% → the locked detail isn't wanted; show more before the lock |
| ดวงคู่ paid (second person) | 0 | first 3 payments | 4 weeks after T8 ships | 0 → rework copy or price once; 0 again after another 4 weeks → stop per-person pricing |
| Month-pass payments | 0 | ≥3 in the first full sale window (20th–month end) after T9 ships | end of that window | 0 in two windows → drop the month pass, keep the free monthly |
| Wallpaper waitlist joins | 0 | ≥20 in 30 days | 30 days after T11 | <5 → shelve wallpaper |
| Voluntary Shopee opens / week | 0 (all forced today) | ≥2 | 4 weeks after T12 | <2 → remove the card |
| Pass share of ดวงคู่ purchases (T15) | 0 | ≥10% | after 30 ดวงคู่ orders | <10% → retire the pass, keep the pack bonus |
| Pack mix (share of orders per pack) | 0 orders | ฿199 ≥15% of orders | after 30 paid orders | <15% → move คุ้มสุด or the preselect; don't reprice |
| First orders above ฿49 | 0 | tracked, no target yet | after 30 first orders | baseline for pack-sheet tests |
| Locked door → paid (first purchase) | [?] (T6 events not live) | set after 300 door impressions | 2026-10-12 | <1% after 300 → interview 5 who left before touching price |
| Refunds / payments | — | ≤10% | monthly | >10% → pause sales, fix reading quality |

Scale warning: 74 users active in 30 days [M, 2026-09-27]. These are counts, not conversion rates.
