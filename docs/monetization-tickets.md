---
type: PLAN
status: active — built on feat/monetization-prep, not merged: T1, T2, T3, T4, T5 (Stripe PromptPay), T7 (เติมมู pay step), T8 lock + spend, T16 (audit actors + history route), and the T21 compatibility conversion UI; verified end to end on the Stripe sandbox 2026-09-29. T18 wallet + เติมมู scope and design direction approved 2026-09-30. Owner decided permanent bonus มู, separate 90-day feature credits (T19), and admin-managed 30-day promotional มู campaigns (T20) on 2026-09-30. Not built: T6 events, T9–T15, T13/T17/T19/T20 admin, accounting, feature-credit and promotion work, the history page
scope: paid products, permanent and promotional มู, feature credits, payments, removal of donation and forced Shopee, wallpaper waitlist
last_reviewed: 2026-09-30
owner: product
decision_log: ~/product-decisions/horo/2026-09-30-monetize.md (current); 2026-09-27-monetize.md (origin)
---

# Monetization tickets

> **2026-09-30 — Shop catalog supersedes parts of this doc.** See [shop-catalog-plan.md](shop-catalog-plan.md):
> packs are now p50/p100/p300/p500/p1000 (+0/5/10/15/20%, bonus permanent), no balance cap, no welcome gift (flag
> `welcome_gift`, off), and T15's "3 คน 98 มู" is replaced by ตั๋วรู้ใจ offers 1 ใบ 49 มู and 2 ใบ แถม 1 (3 tickets) 99 มู,
> bought by exchanging มู in the Shop. The pack table and the T15/T19 detail sections below are historical; the built
> system is specified in horo-be/docs/wallet.md and horo-be/docs/shop.md.

Horo's first paid products. **One-time payments only, no subscription.** When this doc and the code
disagree, the code wins; update this doc in the same commit.

## Summary

| ID | Ticket | Repo | Size | Depends on |
|---|---|---|---|---|
| T1 | Remove the auto-opening donation modal | fe | S | — |
| T2 | Remove the two forced Shopee openers | fe | S | — |
| T3 | Payment + credit schema (built: มู) | be | S | — |
| T4 | Credit and entitlement service (built: มู wallet) | be | M | T3 |
| T5 | PromptPay gateway: charge, webhook, status — **built** (horo-be ee4453b…e70dafa) | be | M | T3, T4 |
| T6 | Tracking plan: 17 events + 4 columns (see Tracking plan) | fe + be | M | — |
| T7 | เติมมู sheet: packs, PromptPay QR, return from bank app — **built** (horo-fe 43a882d…60c5080) | fe | M | T5, T6 |
| T8 | ดวงคู่: free summary, locked detail, credits | be + fe | M | T4, T7 |
| T9 | ดวงเดือนหน้า month pass ฿29 | be + fe | L | T4, T7 |
| T10 | ดวงทั้งปี year reading ฿99 | be + fe | L | T4, T7, T9 |
| T11 | Lucky wallpaper coming-soon page + waitlist | fe | S | T6 |
| T12 | Opt-in element picks (Shopee, strategic) | fe | S | T2, T6 |
| T13 | Revenue page + manual grant/refund in horo-admin (via horo-be internal routes) | admin + be | M | T3, T4, T16 |
| T14 | Trust: refund policy, Thai receipt, terms | fe + be | S | T5 |
| T15 | ~~Product pass: ดวงคู่ 3 คน for 98 มู~~ **superseded** by the Shop's ตั๋วรู้ใจ 2 ใบ แถม 1 (shop-catalog-plan.md); backend built 2026-09-30 | be + fe | M | — |
| T16 | Wallet audit trail: actor on every ledger row, user history route — **built** (horo-be 2056e95); history page not yet | be + fe | S | T4; before merge to master |
| T17 | Accounting routes: monthly reconciliation, CSV exports, month close, `corrects` on reversals | be | M | T16, T5 |
| T18 | กระเป๋ามู + เติมมู: value-first story, currency assets, conversion-safe UX copy | fe | M | T7; T6 for measurement |
| T19 | Feature credits: **built as ตั๋วรู้ใจ** 2026-09-30 (purchased never expire, promotion 30 days; horo-be/docs/shop.md); horo-fe pending | be + fe | M | — |
| T20 | Promotional มู: admin-managed 30-day earn campaigns, reset rules, caps and audit | admin + be | M | T4, T6, T13, T16 |
| T21 | ดวงคู่ conversion: personal question to beautiful wallet-aware unlock | fe | M | T8, T18; T19 coupon path; T6 measurement |

Release order: **R0** T1, T2, T6 (ship now, no dependencies) → **R1** T3, T4, T16, T5, T7, T18, T8, T21, T13, T14 (first money: ดวงคู่) →
**R2** T9, T11, T12, T19, T15, T20 → **R3** T10.

## Product ladder

| Product | Price | What the buyer gets | Free forever |
|---|---|---|---|
| ดวงคู่ unlock | 49 มู per person · pass: 3 คน for 98 มู (T15, proposed) | Unlock the full analysis for one person | Score, one-line verdict, both elements and share card. No automatic 49-มู welcome gift at launch; promotional มู comes only from an active T20 campaign. |
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
- **All มู are permanent.** Purchased มู, pack bonus มู, promotional มู and adjustments do not expire. A bonus changes how
  much มู arrives, not the rules of the balance.
- **Campaign progress resets; earned มู does not.** A T20 campaign may count qualifying actions for up to 30 Bangkok
  calendar days. At the campaign end, its progress and unearned milestones close. มู already granted remains in the
  permanent wallet and is never clawed back merely because the campaign ended.
- **No automatic welcome balance.** Free มู is an explicit, named promotion with dates, eligibility, caps and an audit
  trail. Opening the wallet or reaching a paywall never silently grants 49 มู.
- **Feature credits are not มู.** A feature may grant a counted use right, shown as a coupon with a ticket asset. Each
  grant expires 90 days after it is issued, cannot be converted to มู, and is never included in the มู balance (T19).
- **Promotional and leftover มู must be spendable.** A campaign cannot launch unless at least one live product costs no
  more than the campaign's attainable reward, or the campaign clearly names the larger live target users are saving
  toward. A small 10-มู item is desired but not committed until its feature ticket is approved. Until then, see the T9
  leftover rule.
- **Legacy ดวงคู่ retired (owner, 2026-09-30; replaces the grandfather rule).** v1 and v2 compatibility rows (532 in
  production) are hidden everywhere, kept in the table, and never deleted; only canon v1 (the teaser-first report) is
  shown. A reader who checks the same person again gets a new canon report. See
  `horo-be/docs/compatibility-response-fix.md`, "Canon v1".
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

มู never expire. The small liability does not justify the trust cost of expiring a cash-pegged balance. The ledger may
retain `expire` as a historical/compatibility kind, but pack purchase, bonus, welcome and adjustment rows have no
expiry. Feature credits use their own 90-day entitlement model (T19), not `wallet_ledger`.

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
| 12 | `unlock_succeeded` | be | a row opens | product · paid with `mu` / `pass` · — · report id | user + product + ref |
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
- Remove the retired 180-day bonus expiry from pricing, shared types, frontend copy and tests before launch. Existing
  local-only bonus rows may be reset; no production wallet rows exist yet.

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
    "จ่ายครั้งเดียว ไม่ตัดเงินอัตโนมัติ" / "มูที่เติมและมูโบนัสเก็บไว้ใช้ได้ตลอด" (owner decision 2026-09-30).
- **Two contexts, one component.**
  - From a locked door: the shortfall line, two packs (the smallest one that covers the price, plus one step up), the
    smallest preselected. It is paid as a one-flow purchase with `unlockRef`.
  - From the balance chip or the wallet page: all four packs, with ฿99 preselected.
- **Door label.** When the balance is short, the button reads baht-first ("เปิดคำตอบทั้งหมด · ฿49"). When the balance
  covers it, "เปิดคำตอบทั้งหมด · 49 มู". Built and verified 2026-09-29.
- **Decided (owner, 2026-09-29): B.** The short-balance button opens the 2-pack door sheet. Revisit A only if door →
  paid is poor after 300 doors.
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
**Built on feat/monetization-prep (2026-09-27), behind the `compat_lock` feature flag (off by default; set in horo-admin
สวิตช์ฟีเจอร์ since 2026-09-30, `horo-be/docs/feature-flags.md`; the `COMPAT_LOCK_ENABLED` env var is retired):**
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
- **Legacy retired (2026-09-30).** A row with its detail present is always full. v1 and v2 rows are hidden and their
  share links answer 404 ("Legacy ดวงคู่ retired" above). Until 2026-09-30 they stayed readable and their share links
  returned the stored text.
- **Frontend.** A locked row renders the teaser and the door (CTA text now from the wallet, below). The tap shows
  "กำลังเขียนฉบับเต็ม (ราว 20 วินาที)", then reveals the full report in place, without a reload.

**Built with T4 (2026-09-27):**
- `checkUnlock` grants the welcome gift (49 มู), then `chargeUnlockWithin` spends `compat_unlock` (49) for the row.
- The wallet exists only while the lock is on. Otherwise `GET /api/wallet` returns `{ enabled: false }`, with no welcome
  gift and no header chip. So the gift lands at the first locked ดวงคู่ result. The wallet page shows no donation button.
- **One-flow purchase:** short of the price, the door's primary button is "ปลดล็อก ฿49". It creates an order with
  `unlock_ref` = this row, and payment credits the pack, then unlocks the row with no second tap (`fulfilPaidOrder`).
  "ซื้อแพ็กคุ้มกว่า" opens the packs. Ledger rows name the pair and link to it. The Pawjai banner is off the ดวงคู่ page.
- An unlock that is short answers 402 `{ error: 'insufficient_balance', balance, price }` (`INSUFFICIENT_BALANCE` in the shared wallet types). `page.tsx` rethrows the 402 so the door sees it.
- The door reads `GET /api/wallet`: "ใช้ 49 มู ปลดล็อก (มี N มู)". A 402 turns it into "เติมมู", which
  opens a pack sheet with 3 packs, each with a disabled "PromptPay เร็ว ๆ นี้".
- A header chip "มู N" links to `/dashboard/wallet`: balance, packs, ledger.
- Verified on the lock-on stack without free unlocks (then `COMPAT_UNLOCK_FREE`, now the `compat_unlock_free` sub-flag): a new check shows the door with มี 49, the unlock spends
  49 and opens the full report, and a second locked row gets a 402 and the pack sheet.

**Superseded before launch (owner, 2026-09-30):** the automatic 49-มู welcome grant above documents the current branch,
not the launch policy. Remove `ensureWelcome` from wallet reads and compatibility unlock checks, stop presenting
`welcome` as an unlock source, and leave existing local-only welcome rows resettable. Free มู is issued only by an
active T20 promotion. No production wallet rows exist yet, so this is a pre-launch contract change rather than a user
balance migration.

**Still to do:**
- Remove the automatic welcome grant and update its unique index, response copy and tests to the T20 campaign policy.
- **Delivery safety is built.** The route checks eligibility, generates the detail, then runs one transaction
  `{ chargeUnlockWithin + patch the detail }` (`horo-be/docs/wallet.md`). A generation failure writes no spend; a
  patch failure rolls the spend back. This no longer blocks turning the lock on in production.
- Paid unlocks don't count toward the daily 5-check cap. The unlock route has no rate limit today.
- Checkout (T7) replaces the disabled pack buttons.

**Done when:**
- a new account sees the free summary and a ฿49 path unless an active T20 campaign has already granted enough มู;
- an eligible promotional balance spends through the same ordinary 49-มู path, with no special welcome entitlement;
- canon rows with a detail stay open; legacy rows stay hidden;
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
  (`SUM(delta)` over all users), promotional มู issued/spent, and paid conversion after promotional spend.
- Admin actions write ledger rows only: grant credit (`admin_adjust`) and refund order (`refund`), each with a note.
- Every action records the acting admin on the ledger row (`actor_type = 'admin'`, `actor_id`, `actor_label` = email).
  See `horo-be/docs/wallet.md`, "Audit trail". Pages:
  - a per-user history (baht paid, มู credited and spent, pass uses, who did each);
  - an admin action log, filterable by admin.
- **Comp (owner, 2026-09-29): moo grant only.** No "reopen a report free" action. The user's history shows
  "ปรับยอดโดยทีมงาน · date · +N" and nothing else; the reason and the admin stay admin-side.
- **Decided 2026-09-29:** admin writes go only through horo-be's private `/internal/wallet/*` and
  `/internal/orders/mark-paid` routes, behind `INTERNAL_API_SECRET`. horo-admin reads the wallet tables and never writes
  them (`horo-be/docs/wallet.md`, "How horo-admin writes").
  Refunds are sent manually by PromptPay transfer, and the row records it.
- **Accountant audit (owner request 2026-09-29):** the monthly reconciliation (cash in, moo issued split
  paid/promo/admin, moo spent, reversals, outstanding, with the identity check), CSV exports of ledger and orders, a
  monthly close snapshot, a needs-review queue, and correction-by-reversal with a `corrects` reference. Spec:
  `horo-be/docs/wallet.md`, "Accounting and audit". The backend routes are ticket T17; this page renders them.
- T20 adds a `Promotions` area to `/revenue`. Admins can draft, schedule, pause, end and clone a campaign; see its
  qualifying users, milestone grants, per-user cap and global grant budget; and export its ledger rows. Starting an
  active campaign is not a manual wallet adjustment, and a campaign grant never hides the campaign id or milestone
  from the admin audit trail.
- Follow `horo-admin/DESIGN.md`. Verification per the admin limits: type-check, test, build.

### T14 · Trust
- `/refund` page: full refund within 7 days, no questions, by PromptPay transfer.
- Thai receipt email on `payment_succeeded` (Resend, transactional, ignores `emailOptOut`).
- Terms: add paid products, one-time, no auto-renew, refund policy, and a contact channel.

### T15 · Product pass (ดวงคู่ 3 คน for 98 มู)
Owner decisions 2026-09-29 and 2026-09-30. The spec is `horo-be/docs/wallet.md`, “Feature credits” and “Product passes”.
The pass is the first planned T19 feature-credit grant and expires 90 days after purchase; the price remains proposed.
- A pass is bought with มู and grants three counted `compat_unlock` uses. Singles never add up to a pass.
- Backend: T19's `feature_credit_grants` and `feature_credit_uses` (additive), a `PASSES` config in `pricing.ts`, and
  `compat_pass_3` in `ProductId`. `hasPaid`, `checkUnlock` and `chargeUnlockWithin` use a live grant before charging
  49 มู. Add a refund operation (unused uses only). `GET /api/wallet` returns grouped `featureCredits`.
- Frontend: the door shows natural Thai without middle-dot separators, or `ใช้สิทธิ์ที่มี เหลือ N คน` when a pass is
  live. The wallet page lists it in `คูปอง` with the exact expiry date and the ticket asset.
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

### T18 — กระเป๋ามู + เติมมู: value-first story and conversion-safe UX
**Status: scope approved by owner 2026-09-30 — recommended design direction below is awaiting approval; no production UI changed.**

**Why now.** The built flow works, but its first impression is accounting: the wallet opens with `1 มู = ฿1` and
withdrawal restrictions, the pack sheet opens with the exchange rate and a list of future products, the primary action
names PromptPay before the value received, and the success state immediately asks the buyer to consider a larger pack.
That is clear but emotionally flat. The redesign should make มู feel like saved possibility inside สายมู—something that
lets the reader continue when curiosity is already high—without hiding its cash value or inventing scarcity.

**Product decision to approve.** Use a **value-first, transparent wallet**, not a deliberately obscured game-currency
model. Keep `1 มู = ฿1`, the baht price, permanent มู rule, feature-credit expiry, and one-time-payment language visible
at the relevant decision point.
Shift attention with hierarchy and outcome copy, not odd exchange ratios, fake discounts, countdown pressure, or
casino-style animation. Riot Points are a reference for a memorable currency identity and strong visual hierarchy, not
for making mental conversion difficult.

#### Experience scope

1. **Entry and wallet home (`/dashboard/wallet`).**
   - Lead with what the balance can unlock, then the balance; move the exchange-rate and closed-loop restrictions into a
     calm, always-available “มูใช้ยังไง” disclosure below the primary card.
   - Rename the visible surface only after the direction gate. Candidates to test in Thai are `มูของฉัน` (warmest),
     `กระเป๋ามู` (clearest branded object), and the incumbent `กระเป๋าตัง` (most literal). Keep the URL and API names.
   - Give the balance one clear primary action and one contextual next step. Do not turn the wallet into a shop grid.
   - Make history reassuring and human: what opened, when, and what changed. Keep signed amounts and audit truth intact.

2. **Pack choice (`PackSheet`, store and locked-door contexts).**
   - Store context tells a short story: what มู helps the reader continue, current balance, then packs. Door context stays
     shorter and names the immediate outcome first because the user already chose what to unlock.
   - Present the selected pack as the hero: มู received first, baht paid second, bonus explained in plain Thai. Pack
     names or use-case hints may be added only when they are true for the live product catalogue; never advertise an
     unshipped product as available.
   - Replace provider-led CTA copy such as `จ่าย ฿99 ด้วย PromptPay` with outcome-led copy that still carries the exact
     baht amount; PromptPay remains visible as the payment method beside or below the action.
   - Keep `คุ้มสุด` only on the configured p199 pack. Do not add `ยอดนิยม`, crossed-out prices, urgency, or savings claims
     until measured evidence supports them.

3. **Payment (`PayStep`).**
   - Once the QR is shown, remove marketing noise. The job is confidence: amount, what will be credited, QR, countdown,
     phone save-and-scan path, payment status, and recovery.
   - Make interruption states explicit: backgrounded app, reload, offline/check failed, expired QR, late provider
     confirmation, and already-paid recovery. Never imply payment failed while status is merely unknown.

4. **Success and return.**
   - Celebrate the newly credited balance and lead back to the reason the user topped up. A door purchase continues to
     its report automatically; a store purchase offers a calm `กลับไปดูดวง` or relevant recent destination.
   - Remove the immediate `ครั้งหน้าเติม…` upsell from the success state. Cross-sell only after the user receives value,
     and only with measured evidence.

5. **History, empty, error, and cap states.**
   - Empty history explains what will appear there; `ครบแล้ว` becomes a natural end state rather than a dead end.
   - Errors say what happened, whether money/balance is safe, and the next action. Cap and email requirements remain
     factual and local to the blocked action.

#### Voice and content rules

- Thai should sound like a perceptive Gen-Z friend: short, warm, confident, and specific; no translated-English rhythm,
  mystical narrator, baby talk, forced slang, or excessive exclamation marks.
- Tell one story across the flow: **อยากรู้ต่อ → เลือกมูที่พอดี → จ่ายอย่างมั่นใจ → มูกลับเข้ากระเป๋า → ไปต่อทันที**.
- `มู` is a unit after a number and part of `เติมมู`; use `ยอด` elsewhere when it reads more naturally.
- Do not use middle-dot separators in user-facing copy. Write one natural sentence, use a line break, or let layout
  express the relationship instead of joining fragments with punctuation.
- Lead with the user outcome, then amount, then mechanics. Trust copy stays adjacent to the decision, not buried.
- Do not say มู works with วอลเปเปอร์ or ถามแม่หมอ until those products are live. Copy derives use cases from the live
  product catalogue or uses evergreen wording.
- Final copy needs a native-Thai pass across wallet, sheet, QR, success, history, empty, loading, error, and recovery
  states; assertions in tests update with the approved copy in the same change.

#### Asset roles

- **มู gem:** keep `CurrencyImage` and `mu-gem-clay-{size}.webp` as the only mark beside a numeric มู amount.
- **Feature-credit ticket asset:** the earlier card direction is superseded. Create one premium, text-free clay ticket
  through `clay-asset-maker`, inspired by a lottery-ticket silhouette and PixAI's readable expiry-ticket hierarchy but
  without gambling symbols, copied branding or generated text. Export transparent PNG + WebP size variants and expose
  them through a dedicated `FeatureCreditImage` component. It represents 90-day feature credits only, never permanent
  มู or a payment method. It never appears in the PromptPay checkout.
- **New art:** none required for the first pass. If visual QA finds a real comprehension or empty-state gap, create one
  transparent, text-free asset through `clay-asset-maker`; follow the Clay Cast Rule in `horo-fe/DESIGN.md`. Decorative
  art stays secondary to amount, action, and payment status.

#### Responsive and accessibility contract

- Mobile: bottom sheet, one-thumb primary action, no clipped pack labels, QR large enough for same-phone save/scan,
  safe-area padding, and no essential horizontal gesture.
- iPad/desktop: centered dialog with the same order and states; pack options may use a wider composition without
  changing semantics. Desktop QR remains the focal point.
- Controls are semantic and keyboard-operable; touch targets are at least 44 px; selected state is not color-only;
  status announcements use the correct live-region behavior; reduced motion replaces balance-count and celebration
  motion with an instant state change.
- Long Thai copy, four-digit balances, maximum bonuses, email errors, and 200% text zoom must not clip or hide actions.

#### Implementation design (Software Architect handoff)

Recommended: keep the existing state machine and API contract, and add one **wallet presentation layer** that maps
`context × step × live products` to copy, destination, and approved assets. This is preferred over route-local strings
(fast but guaranteed to drift) and backend/CMS marketing copy (flexible but too much release and localization risk for
one flow). `wallet-copy.ts` remains the pure formatting boundary; components render state rather than invent prose.

Mergeable increments:

1. Restore/export the approved card asset; add its dedicated component and image-selection tests. No behavior change.
2. Add the presentation/copy model and state fixtures; unit-test door/store differences and live-product truthfulness.
3. Recompose wallet home and history states against `DESIGN.md`; component tests at phone and long-copy widths.
4. Recompose pack choice, QR, checking, expiry, failure, paid, and resume states without changing checkout APIs.
5. Update analytics from T6 and run one bounded visual QA pass at phone, iPad, and desktop widths; then type-check, test,
   and build. Each increment is revertable independently.

No backend schema, price, exchange rate, pack inventory, entitlement, or payment-provider change belongs in T18.
Payment and ledger truth remain owned by T3–T7 and T16.

**Measurement.** T18 does not claim conversion improvement before data exists. Use T6's `topup_opened`,
`pack_selected`, `checkout_started`, `qr_shown`, `payment_succeeded`, `payment_expired`, and `support_opened`, split by
`door` / `chip` / `wallet`. Compare against the pre-T18 baseline only after enough traffic; keep the existing 300-door
and 30-order decision thresholds. Add a copy/layout `variant` only if an actual controlled comparison ships.

**Done when:**
- the wallet and every top-up state tell the same value-first story in fluent Thai while showing the true baht amount
  and exchange rate before purchase;
- the card and gem have distinct, documented roles and remain sharp at phone, iPad, and desktop sizes;
- all live, empty, pending, resumed, expired, failed, paid, cap, and email-required states are covered by tests;
- a door top-up returns to its report, a store top-up returns to a useful destination, and success has no immediate
  larger-pack upsell;
- keyboard, focus, touch-target, reduced-motion, long-copy, and 200%-zoom checks pass;
- `bun run type-check`, focused wallet tests, and `bun run build` pass, followed by one Impeccable detector pass.

**Approval gate:** approve this scope before selecting the final wallet name, committing screen hierarchy and Thai copy,
or changing production UI. After scope approval, the design direction gets its own checkpoint; implementation then runs
through `software-architect`.

#### Recommended design direction — “มูที่พาไปต่อ”

**Thesis.** The wallet is not a bank account and the sheet is not a currency exchange. They are the bridge between a
question the reader already cares about and the next useful answer. Use one focal object, one clear amount, and one next
action per state. Personality comes from the clay assets, confident Thai, and a small moment of arrival—not from more
badges, confetti, urgency, or hiding the price.

**Visible name.** Use `มูของฉัน` for the page title and app-menu label. It is warmer and more natural than
`กระเป๋าตัง`, while staying clearer than inventing a fantasy noun. Keep `/dashboard/wallet`, wallet API names, and
internal component names unchanged. `เติมมู` remains the action because it is already short and understandable.

**Wallet home hierarchy.**

1. Header: title `มูของฉัน`; supporting line `เก็บไว้เปิดเรื่องที่อยากรู้ต่อ เมื่อพร้อมค่อยใช้`.
2. Balance hero: label `มูที่มีตอนนี้`; large numeric balance with the gem; one contextual value line derived from live
   prices (for example `พอเปิดดวงคู่ฉบับเต็มได้ 2 ครั้ง`, never a hard-coded promise).
3. Primary action: `เติมมู`. Secondary action appears only when there is a real destination, such as the most recent
   locked reading; do not manufacture a generic shop CTA.
4. The permanent มู gem is the hero asset. Below it, one two-option tab control switches between `ประวัติ` and `คูปอง`.
   Feature credits live only in `คูปอง`; the tab shows a count when active coupons exist.
5. Collapsed disclosure: `มูใช้ยังไง` → `1 มู = 1 บาท ใช้เปิดคำอ่านและฟีเจอร์ในสายมู โอนหรือถอนเป็นเงินไม่ได้
   และไม่มีวันหมดอายุ`. This remains one tap away and is expanded by default only when policy requires it.
6. `ประวัติ`: heading `รายการมูล่าสุด`; support line `เช็กได้ทุกครั้งว่าเติมหรือใช้ไปกับอะไร`. Filters become
   `ทั้งหมด`, `เติมเข้า`, `ใช้ไป`, `คืนกลับ`, and `ปรับยอด`. Empty copy:
   `ยังไม่มีรายการ พอเติมหรือใช้มู รายการจะมาอยู่ตรงนี้`.
7. `คูปอง`: active coupons first, then used and expired coupons in a quieter section. Each ticket names the feature,
   remaining uses and an absolute Thai expiry date, with one contextual action such as `ไปใช้คูปอง`. Empty copy:
   `ตอนนี้ยังไม่มีคูปอง พอได้รับสิทธิ์ใหม่จะมาอยู่ตรงนี้`.

**Store top-up sheet.**

- Title: `เติมมูไว้ดูต่อ`.
- Subtitle: `เลือกจำนวนที่พอดีกับสิ่งที่อยากรู้`.
- Quiet balance line: `ตอนนี้มี N มู`.
- Pack hierarchy: total มู is the largest text; bonus chip follows it; baht is the second line or trailing column;
  selection is visible by radio + border, never color alone. Keep the pack list compact enough to compare without
  scrolling the selected CTA away on a common phone.
- CTA: `เติม 109 มู จ่าย ฿99` (dynamic). Supporting method: `ชำระด้วย PromptPay`.
- Trust lines: `จ่ายครั้งเดียว ไม่มีการตัดเงินอัตโนมัติ` and `มูที่เติมและมูโบนัสเก็บไว้ใช้ได้ตลอด`.
- Pack helper copy is optional and must remain evergreen (`เริ่มแบบพอดี`, `มีเผื่อครั้งถัดไป`) unless it is generated
  from a live product catalogue. Do not label a pack “ยอดนิยม” without order evidence.

**Locked-reading top-up sheet.**

- Title: `อีกนิดเดียวก็อ่านต่อได้`.
- Support: `เติมแล้วเปิดคำตอบนี้ต่อให้อัตโนมัติ` plus the exact shortfall.
- Show only the smallest covering pack and one step up, preserving T7.
- CTA: `เติมมูแล้วเปิดต่อ ฿49` (dynamic); the selected pack above already shows how many มู will arrive. `PromptPay`
  stays directly below as the method.
- Do not repeat the full wallet story here; the reader already has intent and needs reassurance plus a short path.

**QR and pending payment.**

- Heading: `สแกนเพื่อเติม 109 มู`; support `ยอดชำระ ฿99 ผ่าน PromptPay`.
- Phone action: `บันทึก QR ไปสแกนในแอปธนาคาร`; short hint `บันทึกรูป แล้วเลือกสแกนจากรูปในแอปธนาคาร`.
- Pending status: `กำลังรอยืนยัน ไม่ต้องกดจ่ายซ้ำ`. Countdown remains visible but neutral.
- Resume after reload/background: `กำลังเช็กการชำระให้`; support `ปิดหน้านี้ได้ ยอดจะเข้าเองเมื่อยืนยันแล้ว` only if
  the implementation truly continues polling after close; otherwise keep the sheet open and omit that promise.
- Expired: message `QR นี้หมดเวลาแล้ว`; action `สร้าง QR ใหม่`. Unknown provider status must not be described as a failed
  payment.

**Success.**

- Store: `มูเข้าแล้ว ✦`; detail `ได้เพิ่ม 109 มู ตอนนี้มีทั้งหมด 180 มู`; primary action `กลับไปดูดวง` or the real originating
  destination; secondary `อยู่หน้านี้ต่อ`. No larger-pack upsell.
- Locked reading: `มูเข้าแล้ว กำลังเปิดคำตอบให้…`; keep the sheet in one continuous state until the report opens.
- Use the existing gem as the focal asset with a restrained scale/settle motion. Under reduced motion it appears
  immediately. No confetti, coins, or new asset is needed.

**Failure and support.**

- Start failure: heading `ยังเริ่มการชำระไม่ได้`; support `ลองใหม่ได้เลย ยอดยังไม่เปลี่ยน`.
- Verification problem: heading `ยังเช็กสถานะไม่ได้`; support `รายการยังอยู่ ลองเช็กอีกครั้งได้`.
- Known provider failure: message `รายการนี้ยังไม่สำเร็จ`; offer `ลองอีกครั้ง`; never claim baht was not charged unless the
  provider state proves it.
- Support entry stays `จ่ายแล้วแต่ยอดยังไม่เข้า?` and reveals the short order reference only after use.

**Composition by breakpoint.**

- Phone: one-column balance hero with the gem; equal-width `ประวัติ` and `คูปอง` tabs follow it. Bottom sheet uses a
  sticky action zone only when content exceeds the viewport; it must not cover the last pack or trust line.
- iPad/desktop: wallet hero is a two-column composition (copy/balance left, gem artwork right). Coupons remain inside
  their tab rather than merging into the balance. The pack dialog remains
  one decision column; do not turn four packs into a dense pricing table. QR shrinks to leave breathing room.
- The same content order and labels survive every breakpoint; only composition changes.

**Direction anti-goals.** No fake wallet balance animation on entry, loot-box language, “limited time” pressure, crossed
out prices, mystery bonuses, glossy finance dashboard, purple text everywhere, or decorative art in error/recovery
states. The user should feel invited, not gamed.

**Direction approval gate:** after approval, `software-architect` implements the five increments above. Any change to
prices, pack count, expiry, provider, or ledger truth returns to product scope rather than being invented in UI code.

### T19 — Feature credits: separate 90-day use rights
**Owner decision 2026-09-30.** Feature credits are not another name for มู. They are a counted right to use one named
feature. All มู—including pack bonuses—remain permanent; feature-credit grants expire 90 days after issuance.

- A grant carries `feature_id`, total uses, `granted_at`, and `expires_at = granted_at + 90 days`. The UI shows the exact
  Bangkok expiry date, not only “เหลือ N วัน”.
- A use consumes the live grant with the nearest expiry first. An expired or exhausted grant is never selected.
- Credits cannot be transferred, withdrawn, converted to มู, combined into the มู balance, or silently substituted for
  มู. A feature decides explicitly whether it accepts its credit, มู, or both.
- Keep feature credits in separate `feature_credit_grants` and `feature_credit_uses` records. Do not write them to
  `wallet_ledger`; the accounting report must not count them as outstanding มู.
- `GET /api/wallet` may return grouped `featureCredits` only after the first real feature grants them. Each group includes
  the feature label, uses left, soonest expiry, status and destination. Empty groups are omitted.
- On `มูของฉัน`, one equal-width segmented control toggles `ประวัติ` and `คูปอง`. The selected tab is encoded as
  `?tab=history|coupons` so Back, Forward and shared wallet links preserve it. Default to `ประวัติ`; a newly granted
  coupon may deep-link to `?tab=coupons`, but must not steal the tab on an ordinary visit.
- Each coupon is a ticket-shaped row/card: clay ticket image, feature name, `ใช้ได้อีก N ครั้ง`, exact expiry
  `ใช้ได้ถึง 29 ธ.ค. 2569`, and one `ไปใช้คูปอง` action when the feature has a valid destination. Active coupons come
  first; used and expired coupons remain visible below with clear status and no active CTA.
- The ticket image comes from `clay-asset-maker`: premium tactile clay, transparent, text-free, readable at 48–64 px,
  with a perforated/stub silhouette but no lottery number, gambling mark, currency mark, logo or embedded expiry text.
  `FeatureCreditImage` owns its WebP/PNG variants. `CurrencyImage` continues to own the มู gem and never resolves to a
  ticket file. The older generation-credit card artwork is not used on this surface.
- Tabs use semantic controls with a visible selected state, keyboard operation and focus. Content switches without a
  page reload; loading, empty and error states belong to each panel. On phone, neither label truncates or scrolls.
- Expiry is disclosed when granted and wherever the credit is offered as payment. Do not use expiry as artificial
  urgency or add countdown animation.

Implementation is deferred until a named feature actually grants credits. When selected, Software Architect must record
the grant/refund semantics for that feature and add local-Postgres tests for concurrent use, earliest-expiry selection,
idempotent use, and the exact 90-day boundary.

**Done when:** permanent มู and expiring feature credits cannot be confused in API types, assets, copy, accounting or
history; a feature credit works through day 90 according to the stored timestamp and is refused after `expires_at`; the
wallet's `คูปอง` tab shows active, used and expired tickets with exact dates without changing the มู balance, and the
`ประวัติ` tab retains its selected filters and existing audit truth.

### T20 — Promotional มู: admin-managed 30-day earn campaigns
**Owner direction 2026-09-30.** Free มู should come from explicit promotions that encourage useful repeat behaviour,
not from opening the wallet, reaching a paywall, tapping Share, or an invisible permanent rule. This ticket defines the
promotion and reset contract only. The feature that supplies the qualifying action—Tarot is one candidate—gets its own
feature ticket and design.

#### Product contract

- Call it a **30-day challenge**, not a 30-day consecutive streak. Progress counts distinct qualifying Bangkok dates
  inside one campaign window. Missing a day does not erase progress already earned.
- A campaign has a start and end timestamp and may run for at most 30 Bangkok calendar days. The interval is
  `[starts_at, ends_at)`: an action at the end timestamp belongs to no campaign.
- Milestones are configured before launch, for example 3, 7, 14, 21 and 30 distinct days. Each milestone may grant a
  fixed amount of permanent มู. No amounts are hard-coded into the feature that emits the qualifying action.
- Recommended first-campaign guardrail [A]: no more than 20 promotional มู attainable per user across the 30-day
  window. Admin may choose a smaller total after the redemption catalogue is known.
- The promotion must name at least one live thing the attainable มู can buy, or a larger live target users are saving
  toward. Do not advertise Tarot, ถามแม่หมอ, wallpaper or any other spender before that product is live.
- Tapping Share never qualifies. A future referral campaign may qualify only after a unique recipient completes a
  named activation event. Its feature ticket defines recipient uniqueness and abuse controls.
- Promotional มู is ordinary permanent มู after grant: 1 มู = ฿1, spendable on any live มู product, never transferred
  or withdrawn, never restricted to the promotion, and never expired or clawed back because the campaign ends.
- Feature credits remain separate under T19. Admin must choose “มู” or a named feature credit when creating a campaign;
  one reward rule cannot silently switch between them.

#### Reset rules

- At `ends_at`, unearned milestone progress closes and the campaign no longer accepts qualifying actions or grants.
  Earned wallet balance does **not** reset.
- A repeat promotion is a new campaign id. Every user starts that campaign at zero qualifying days, even if it was
  cloned from the prior campaign. The previous progress and grants remain readable in history.
- Only one active campaign may count the same qualifying event for the same audience unless the owner explicitly marks
  both campaigns stackable before either starts. Default: not stackable.
- Once a campaign is active, its dates, audience, qualifying event, milestones, reward amounts and caps are immutable.
  Admin may pause or end it. A changed offer is created by cloning into a new draft, so past grants keep their meaning.
- Pausing stops display, progress and new grants immediately; it does not extend the scheduled end. Resume continues
  within the original window. An admin may create a separate compensation campaign when a pause materially hurt users.

#### Admin management

`horo-admin /revenue/promotions` owns promotion operations. A campaign has:

- internal name and user-facing Thai title/description;
- status `draft | scheduled | active | paused | ended`;
- Bangkok `starts_at` and `ends_at`, with a maximum 30-day window;
- an allowlisted audience (`all_signed_in`, `new_accounts`, or a saved product segment) and allowlisted qualifying event;
- distinct-day rule, milestone thresholds and fixed grant per milestone;
- per-user grant cap and global grant budget in มู;
- optional `stackable` flag, off by default;
- terms/support note, creator, approver, created/updated timestamps and the reason for pause/end.

Admin can preview the user-facing offer, save a draft, schedule it, pause/resume, end early and clone it. There is no
free-form production SQL, arbitrary event name, direct balance overwrite or editing of active reward rules. Activation
requires a second confirmation that repeats the audience, dates, maximum มู per user, global budget and live redemption
target. If the global budget is exhausted, new grants stop atomically and the campaign moves to `paused`; already-earned
grants remain.

The admin detail shows eligible users, users with progress, each milestone's grants, total มู issued, remaining global
budget, earned-to-spent rate and suspicious duplicate/referral signals. Export includes the campaign id, milestone id,
user id, delta, ledger row id and timestamp; it excludes reading content and birth data.

#### Ledger and measurement contract

- Each reward writes one append-only `wallet_ledger` row with origin `promo`, plus stable `campaign_id` and
  `milestone_id`. Idempotency is unique on `(campaign_id, user_id, milestone_id)`.
- A qualifying action is accepted at most once per user per Bangkok date for that campaign. Retried events cannot add a
  second progress day or repeat a grant.
- Money reporting continues to separate paid, promo, admin and reversal origins. Promotional issuance is not revenue.
- Campaign progress and wallet balance are different records. Deleting or ending a campaign never deletes ledger rows.
- Track qualifying users, milestone completion, มู granted, มู spent within 7/30 days, product spent on, next-period
  return and paid purchase after first promotional spend. Do not claim the campaign caused retention without a valid
  comparison.

#### Done when

- an admin can draft, preview, schedule and activate a 30-day campaign without a deploy;
- two retries of the same qualifying action produce one progress day and one grant at most;
- missing a day preserves earlier progress, while a new campaign starts at zero;
- campaign end, pause and budget exhaustion stop new grants without changing earned wallet balances;
- active rules cannot be edited, and cloning creates a new campaign id;
- overlapping non-stackable campaigns are rejected before activation;
- every promotional มู can be traced from the user history and monthly accounting report to its campaign and milestone;
- the campaign cannot activate without a live redemption target, per-user cap, global budget, dates and Thai-facing
  explanation.

### T21 — ดวงคู่ conversion: from a personal question to a beautiful unlock
**Status: built on `feat/monetization-prep` 2026-09-30.** A spend from balance now asks once before any มู move
(`SpendConfirmSheet`: what it opens, the balance before and after, `49 มู เท่ากับ ฿49`, confirm or `ยังไม่ใช้ตอนนี้`);
a top-up needs no second confirmation because the QR payment is the consent. The resolver, question-to-door handoff, relationship-aware
copy, responsive behavior and failure reassurance are implemented. T6 measurement and the future T19 coupon payment
path remain out of scope until their tickets ship.

**Why.** The locked result already gives substantial free value: the talisman, four dimension scores and three personal
questions. The conversion door then makes the reader work through four disclosure rows before the action and ends on a
generic `เปิดคำตอบทั้งหมด` button. It names the price, but not the reader's most relevant outcome or why this one
answer is worth opening now. The current source also still uses middle-dot strings in several locked-state labels.

**Goal.** Make the last free question feel like a respectful invitation into a more useful, personal reading—never a
hard sell. The unlock should feel like: *“นี่คือสิ่งที่คุณอยากเข้าใจต่อ และมีคำตอบที่ช่วยได้จริง”*, then resolve
payment with the shortest truthful path.

#### Conversion structure

1. **Keep free value free.** The cover, all four scores and the three question prompts stay visible. Do not remove a
   score, blur text, fake a preview, or repeat locks on every list item.
2. **Turn each personal question into an intent signal.** A tap highlights the matching promise in the door and moves
   focus there. It does not reveal paid prose or open a payment sheet by surprise. On return, the chosen question stays
   visually connected to the door.
3. **Make the decision visible immediately.** The top of the door contains one relationship-specific title, one short
   explanation, the wallet-aware price state and the primary action. The action must be visible in the first phone
   viewport of the door; benefit detail moves below it into a single optional `ดูสิ่งที่จะได้อ่าน` disclosure.
4. **Promise outcomes, not homework.** Show at most three compact outcomes: understand the pattern, find a better way
   to talk or work together, and choose the next move at the right time. These map to the reader's relationship type.
5. **Close the loop.** Successful unlock opens the focused full report at the question/section the reader chose. It does
   not return them to a generic table of contents or present an upsell.

#### Wallet-aware conversion states

| Reader state | Door message | Primary action |
|---|---|---|
| Paid or promotional balance covers 49 มู | `ใช้ 49 มู เพื่ออ่านคำตอบเฉพาะคู่นี้` | `เปิดคำอ่านฉบับเต็มด้วย 49 มู`, then the confirm sheet: `ยืนยัน ใช้ 49 มู` |
| Balance is short | `เติมแล้วเปิดคำตอบนี้ต่อให้อัตโนมัติ` | `เติมมูแล้วเปิดคำอ่านฉบับเต็ม ฿49` |
| A valid feature credit applies | `ใช้สิทธิ์ที่มีได้ถึง 29 ธ.ค. 2569` | `ใช้คูปองเปิดคำอ่านฉบับเต็ม` |
| Unlock is generating | `กำลังเขียนคำอ่านเฉพาะคู่นี้` | disabled progress state |

Every state shows the relevant monetary truth before confirmation: `49 มู เท่ากับ ฿49` for a wallet spend, or the
exact pack price for a top-up. The permanent-Mู rule is not repeated here; it lives in the wallet top-up trust copy.
The door reassures with `เปิดครั้งเดียว กลับมาอ่านได้ตลอด` only when the full report is actually stored and readable.

#### Relationship-aware promise and copy

The title and three outcomes come from one `relationshipType × intent` presentation model, never scattered conditionals.
The existing `lockedOfferCopy` remains the content source but becomes shorter and outcome-first. Recommended headline
directions:

- **ความรัก:** `เข้าใจเขา เข้าใจเรา แล้วคุยกันได้ง่ายขึ้น`
- **คนคุย:** `รู้จังหวะว่าจะคุยต่อยังไง โดยไม่ต้องรีบ`
- **เพื่อน:** `รักษาความเป็นเพื่อน โดยไม่ต้องฝืนกัน`
- **หัวหน้า:** `เข้าใจสไตล์เขา แล้วทำงานให้ลงตัวขึ้น`
- **เพื่อนร่วมงาน:** `คุยงานให้ชัด แล้วทำงานด้วยกันให้ลื่นขึ้น`
- **ครอบครัว:** `เข้าใจกันมากขึ้น โดยยังมีพื้นที่ของตัวเอง`

No middle-dot separators appear in reader-facing copy. Replace composite labels with a sentence, a subordinate line or
a real visual relationship. Avoid `ฉบับเต็ม` as a bare product label where `คำอ่านฉบับเต็ม` is clearer.

#### Visual and interaction direction

- The compatibility talisman remains the emotional hero. The door receives a quieter companion image chosen from the
  existing relationship-aware clay asset map; do not add a generic oracle icon beside every purchase button.
- A wallet spend uses the มู gem. A feature-credit redemption uses the coupon-ticket asset from T19. PromptPay uses no
  fictional card icon. The visible asset changes with the actual payment path.
- The locked door is one premium container, not a stack of nested cards. Relationship pink stays as a restrained
  payload accent; purple stays for actionable controls. Price, selected intent and CTA have stronger hierarchy than
  decorative imagery.
- On desktop, the offer rail remains sticky within the existing 1080px shell. On phone, it is a normal narrative block
  with an action visible before optional details; never use a global sticky purchase bar that covers report content.
- The chosen intent is keyboard-operable and announced to assistive technology. Controls remain at least 44px, focus is
  visible, and reduced motion removes focus/door transition motion without losing the selected state.

#### Implementation design (Software Architect handoff)

Recommended: add a pure `unlockPresentation` resolver that receives `relationshipType`, selected intent and entitlement
state (`welcome | balance | short | coupon | generating`) and returns the title, outcomes, asset role, reassurance and
CTA copy. This is preferred over conditionals spread across `locked-hints`, `report-door`, `wallet-copy` and the pack
sheet. It keeps all relationship types and payment paths complete and testable while preserving the existing unlock API
and one-flow checkout behavior.

Mergeable increments:

1. Add intent selection/focus semantics to locked hints and resolver unit tests for every relationship type.
2. Recompose the locked door so the action appears before optional benefit detail; remove middle-dot reader copy.
3. Connect balance and short states to the resolver without altering the unlock endpoint or PackSheet state
   machine.
4. Add the T19 coupon branch when feature credits exist, including expiry visibility and redemption rollback semantics.
5. Run T6 measurement, phone/iPad/desktop visual QA, accessibility checks, focused tests, type-check and build.

**Measurement.** Use `paywall_viewed`, `unlock_tapped`, `topup_opened`, `checkout_started`, `payment_succeeded`,
`unlock_succeeded`, `unlock_failed` and `report_depth`. Track only relationship type, payment path and report id; never
send partner names, birth data, free question text or paid reading text. Do not claim conversion improvement until the
existing 300-door and 30-order thresholds are reached.

**Done when:** the free report retains its value, every relationship type receives a natural promise, the relevant CTA
is visible without opening benefits, every wallet state is truthful and leads to the correct next step, selected
questions land readers in the matching full-report section, and no user-facing middle-dot strings remain in the locked
conversion path.

#### Recommended design direction — “คำถามที่ค้างใจ มีทางไปต่อ”

**Focal moment.** The reader has already seen the score and recognises a question that feels personal. Tapping that
question gives it a soft selected edge and shifts focus to a door whose first line answers, “คำตอบนี้ช่วยคุณเรื่อง
อะไรได้บ้าง”. The selected question remains visible as a small plain-text echo above the door, so the purchase never
feels detached from the reader's original curiosity.

**Door order.**

1. Intent echo: `อยากเข้าใจเรื่องนี้ต่อ` followed by the selected free question. No lock icon and no repeated badge.
2. Type-aware promise: one two-line headline from the model below.
3. Three short outcomes, shown as a quiet list with existing relationship-aware clay cue art: understand the pattern,
   talk or work together more clearly, and know the next move. These are not accordions and do not hide the CTA.
4. The relevant wallet-aware price sentence and primary action.
5. Reassurance: `เปิดครั้งเดียว กลับมาอ่านได้ตลอด`.
6. One optional disclosure: `ดูสิ่งที่จะได้อ่าน` with the four full-report sections. It is below the action and never
   required to make a purchase decision.

**Relationship-aware headline copy.**

| Type | Headline | Supporting line |
|---|---|---|
| ความรัก | `เข้าใจเขา เข้าใจเรา แล้วคุยกันได้ง่ายขึ้น` | `เห็นทั้งสิ่งที่ดึงกันไว้ และเรื่องที่ต้องค่อย ๆ เข้าใจกัน` |
| คนคุย | `รู้จังหวะว่าจะคุยต่อยังไง โดยไม่ต้องรีบ` | `รู้จักกันให้ชัดขึ้น โดยไม่ต้องเร่งให้ความสัมพันธ์มีคำตอบ` |
| เพื่อน | `รักษาความเป็นเพื่อน โดยไม่ต้องฝืนกัน` | `เข้าใจความต่าง แล้วคุยเรื่องค้างใจให้เบาลง` |
| หัวหน้า | `เข้าใจสไตล์เขา แล้วทำงานให้ลงตัวขึ้น` | `เห็นสิ่งที่เขาให้ความสำคัญ และคุยงานได้ตรงประเด็นกว่าเดิม` |
| เพื่อนร่วมงาน | `คุยงานให้ชัด แล้วทำงานด้วยกันให้ลื่นขึ้น` | `เห็นจุดที่เติมกันได้ และเรื่องที่ควรเคลียร์ก่อนงานสะดุด` |
| ครอบครัว | `เข้าใจกันมากขึ้น โดยยังมีพื้นที่ของตัวเอง` | `เห็นสิ่งที่แต่ละคนต้องการ แล้วคุยกันโดยไม่ต้องโทษใคร` |

**Payment states and exact copy.**

| State | Price sentence | Button | After tap |
|---|---|---|---|
| มีมูพอ | `ใช้ 49 มู เพื่อเปิดคำอ่านเฉพาะคู่นี้` | `เปิดคำอ่านฉบับเต็มด้วย 49 มู` | `กำลังเขียนคำอ่านเฉพาะคู่นี้` then matching section opens |
| มูไม่พอ | `เติมแล้วเปิดคำตอบนี้ต่อให้อัตโนมัติ ราคา ฿49` | `เติมมูแล้วเปิดคำอ่านฉบับเต็ม ฿49` | T18 door sheet, then matching section opens |
| มีคูปอง | `ใช้สิทธิ์ที่มีได้ถึง 29 ธ.ค. 2569` | `ใช้คูปองเปิดคำอ่านฉบับเต็ม` | use writes, then matching section opens |
| กำลังเขียน | `กำลังเตรียมคำตอบให้คุณ` | disabled `กำลังเปิดคำอ่าน` | live status `เสร็จแล้วจะเปิดตรงนี้เลย` |
| เขียนไม่สำเร็จ | `ยังเปิดคำอ่านไม่ได้` | `ลองอีกครั้ง` | show the support reference only after a second failure or explicit help tap |

`49 มู เท่ากับ ฿49` appears as supporting disclosure for a wallet spend, not as punctuation inside the button. A
coupon shows its feature and expiry date; it never shows a baht-equivalent. PromptPay is introduced only in the top-up
sheet, not on the report door.

**Interaction and responsive behavior.**

- A locked hint is a semantic button. It sets `selectedIntent`, scrolls the door into view, and moves focus to its
  heading. Keyboard users receive the same result; reduced motion jumps rather than animates.
- The selected intent maps to the focused full-report section through the stable existing `?section=` ids. For example,
  a communication question opens `?section=conversation`; no personal text is added to the URL or analytics.
- On phone, the intent echo, price and CTA fit before the optional detail disclosure. On iPad and desktop, the door's
  action remains in the existing sticky offer rail, aligned with free content inside the 1080px shell.
- CTA asset follows the payment route: gem for มู, ticket for coupon, no decorative asset for top-up because its own
  sheet explains PromptPay. Existing relationship-specific clay art appears once in the outcome list, never repeated
  on every CTA.

**Anti-goals.** Do not blur the free reading, hide score detail, put a countdown on the door, show crossed-out prices,
use forced urgency, claim that a score predicts a relationship's future, or make the reader feel they need to pay to
fix themselves or another person. No middle-dot separators in any reader-facing string.

**Scope boundary:** the built resolver owns relationship type, intent and wallet state. Any change to price, promotion
eligibility, coupon expiry or full-report content returns to product scope rather than being invented in UI code.

## Tracking

| Metric | Baseline [M] | Target | Review | Kill-or-keep |
|---|---|---|---|---|
| Promotional มู spent / granted | 0 | set per T20 campaign after its live redemption target is selected | 7 and 30 days after each milestone | <20% spent by day 30 → stop the reward or ship a useful lower-priced spender before repeating |
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

## Documentation health

FRESH before → after: F 2→3 (refreshed the existing docs-index entry to name T1–T21, promotional มู, campaign and
compatibility-conversion routing) · R 2→3 (corrected the stale charge-before-generation and T21 implementation
status; frontmatter is current and delivery safety was spot-checked in the backend) · E 2→2 (the large plan remains independently retrievable by summary table
and ticket ID, but still has no full TOC) · S 2→2 (one monetization plan, still mixing roadmap and implementation status
by design) · H 3→3 (T20 adds exact lifecycle, reset, cap and audit rules; T21 adds conversion states, named targets and
done-when rules while leaving payment mechanics and content generation out of scope). Total: 12/15 (B) → 13/15 (A).
