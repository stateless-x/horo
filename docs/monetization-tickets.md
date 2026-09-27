---
type: PLAN
status: active — T1, T2, T3, T4 (มู ledger) and T8's locked mode + spend built on feat/monetization-prep, not merged; payments (T5) not built (2026-09-27)
scope: paid products, credits, payments, removal of donation and forced Shopee, wallpaper waitlist
last_reviewed: 2026-09-27
owner: product
decision_log: ~/product-decisions/horo/2026-09-27-monetize.md
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
| T6 | Funnel events | fe + be | S | — |
| T7 | Checkout sheet (PromptPay QR) | fe | M | T5, T6 |
| T8 | ดวงคู่: free summary, locked detail, credits | be + fe | M | T4, T7 |
| T9 | ดวงเดือนหน้า month pass ฿29 | be + fe | L | T4, T7 |
| T10 | ดวงทั้งปี year reading ฿99 | be + fe | L | T4, T7, T9 |
| T11 | Lucky wallpaper coming-soon page + waitlist | fe | S | T6 |
| T12 | Opt-in element picks (Shopee, strategic) | fe | S | T2, T6 |
| T13 | Revenue page + manual grant/refund in horo-admin | admin | M | T3, T4 |
| T14 | Trust: refund policy, Thai receipt, terms | fe + be | S | T5 |

Release order: **R0** T1, T2, T6 (ship now, no dependencies) → **R1** T3, T4, T5, T7, T8, T13, T14 (first money: ดวงคู่) →
**R2** T9, T11, T12 → **R3** T10.

## Product ladder

| Product | Price | What the buyer gets | Free forever |
|---|---|---|---|
| ดวงคู่ credit | ฿49 for 1 · ฿99 for 3 | Unlock the full analysis for one person | Score, one-line verdict, both elements, share card. Plus **1 welcome credit** per account. |
| ดวงเดือนหน้า (month pass) | ฿29 per month | That month's reading early (from the 20th of the month before) + a 30-day good-days calendar | This month's full reading, exactly as today |
| ดวงทั้งปี (year reading) | ฿99 per 12 months | 12-month outlook, best months for love, money and work, and a month pass for each of the 12 months | — |
| Lucky wallpaper | coming soon, "฿39 เมื่อเปิดขาย" | Waitlist only | — |
| ดวงวันนี้ | free | — | All of it |

Rules that hold across tickets:
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

## Funnel we measure (T6)

| Event | Where | Fires when |
|---|---|---|
| `paywall_viewed` | fe | a locked section scrolls into view (dedup per user/product/day) |
| `unlock_tapped` | fe | the unlock or buy button is tapped |
| `checkout_started` | be | an order row is created |
| `payment_succeeded` | be | the webhook marks the order paid |
| `credit_spent` | be | a spend row is inserted |
| `waitlist_joined` | fe | wallpaper waitlist tap (dedup per user/product) |

Per product, the report is: viewed → tapped → started → paid, plus refunds, and for ดวงคู่ also welcome credit
spent → second person bought.

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
- **Decision (2026-09-27): provider = Stripe, PromptPay via Stripe.** Merchant eligibility (individual or
  business account) is still to confirm [?]. Fee ≈ 1.65% [A].
- `POST /api/checkout { sku }` creates an order and charge, and returns `{ orderId, qrImage, amount, expiresAt }`.
- `POST /api/payments/webhook` verifies the signature, is idempotent on the provider event id, marks the order paid,
  and calls `creditFromOrder` or `grantFromOrder` in the same transaction.
- `GET /api/checkout/:orderId` returns status for polling.
- Env: provider secret and webhook secret in Railway. Never log the payload's customer fields.

**Done when:** a test-mode payment unlocks within 5 seconds of the webhook, and replaying the webhook changes nothing.

### T6 · Funnel events
- Add the six events to `TrackedEvent` in both shared type copies (`horo-fe/src/lib-packages/shared/types/analytics.ts`,
  `horo-be/lib/shared/types/analytics.ts`) and to `dedupKeyFor`. Server events are written directly in T5 and T4.
- Add a `product` detail value: `compat | month_pass | year_reading | wallpaper`.

**Done when:** each event lands in `product_events` from a local run.

### T7 · Checkout sheet
- One bottom sheet: product name, price, PromptPay QR, a countdown to expiry, "เปิดแอปธนาคารแล้วสแกน", and a line
  "คืนเงินเต็มจำนวนภายใน 7 วัน". It polls every 3 seconds, then shows success and closes into the unlocked content.
  For ดวงคู่ the text already exists, so the unlock is instant. For the month pass and year reading, success lands on a
  "กำลังเตรียมดวง (ไม่กี่นาที)" state, plus an email when it's ready.
- Copy is transactional and pronoun-free. The oracle voice resumes inside the reading.
- Hand to `impeccable` for the screen, following `horo-fe/DESIGN.md`.

**Done when:** the paid → unlocked path works on a phone-width viewport without a reload.

### T8 · ดวงคู่: free summary, locked detail, credits
**Built on feat/monetization-prep (2026-09-27), behind `COMPAT_LOCK_ENABLED` (off by default):**
- **Teaser-first generation.** With the lock on, a check writes only the free teaser: the insight plan, then the cover
  (verdict and three locked hints). The paid detail is written on unlock, from the same stored plan, and patched into
  the same row. The detail's model cost is only spent on unlocks.
  - Stored shape, flow and latency: `horo-be/docs/compatibility-response-fix.md`, "Locked mode".
  - Measured: teaser about 7 s, detail about 15 s.
- **`POST /api/fortune/compatibility/:id/unlock`.** Owner only and idempotent. The single-flight lock allows one generation
  per row. Entitlement goes through the single seam `assertCanUnlock` in `horo-be/src/lib/entitlements.ts`.
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
  Refunds are sent manually by PromptPay transfer, and the row records it.
- Follow `horo-admin/DESIGN.md`. Verification per the admin limits: type-check, test, build.

### T14 · Trust
- `/refund` page: full refund within 7 days, no questions, by PromptPay transfer.
- Thai receipt email on `payment_succeeded` (Resend, transactional, ignores `emailOptOut`).
- Terms: add paid products, one-time, no auto-renew, refund policy, and a contact channel.

## Tracking

| Metric | Baseline [M] | Target | Review | Kill-or-keep |
|---|---|---|---|---|
| ดวงคู่ welcome credit spent / granted | 0 | ≥50% | 4 weeks after T8 ships | <25% → the locked detail isn't wanted; show more before the lock |
| ดวงคู่ paid (second person) | 0 | first 3 payments | 4 weeks after T8 ships | 0 → rework copy or price once; 0 again after another 4 weeks → stop per-person pricing |
| Month-pass payments | 0 | ≥3 in the first full sale window (20th–month end) after T9 ships | end of that window | 0 in two windows → drop the month pass, keep the free monthly |
| Wallpaper waitlist joins | 0 | ≥20 in 30 days | 30 days after T11 | <5 → shelve wallpaper |
| Voluntary Shopee opens / week | 0 (all forced today) | ≥2 | 4 weeks after T12 | <2 → remove the card |
| Refunds / payments | — | ≤10% | monthly | >10% → pause sales, fix reading quality |

Scale warning: 74 users active in 30 days [M, 2026-09-27]. These are counts, not conversion rates.
