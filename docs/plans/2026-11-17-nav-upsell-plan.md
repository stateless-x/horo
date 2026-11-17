---
type: PLAN
status: draft, not built; waits on owner decisions (section 8)
scope: signed-in navigation, the ดวงวันนี้ page, the มู page, tracking for all three (horo-fe, horo-be, horo-admin)
last_reviewed: 2026-11-18
owner: product
supersedes: null
superseded_by: null
---

# Navigation and upsell: build plan

Decision log: `~/product-decisions/horo/2026-11-17-feature-nav-upsell.md` (verdict: test first; build tracking and the
offer card now, decide the rest on data).
Mock: [2026-11-17-nav-mock/index.html](2026-11-17-nav-mock/index.html) (a direction proposal, not approved design; open
the file in a browser).
Authority: when this plan and the code disagree, the code wins. Line references were read on 2026-11-17 at horo-fe
`ab28985` plus the uncommitted เซียมซี edits.

## 1. Increments at a glance

Each one merges, ships and reverts by itself. A later one never requires reverting an earlier one.

| # | What ships | Flag (horo-admin /flags, off by default) | Repos | Gate before starting |
| --- | --- | --- | --- | --- |
| 0 | Tracking: block reach on ดวงวันนี้, nav taps, small disclosures; a "หน้าดวงวันนี้" block in horo-admin | none (nothing visible) | be, fe, admin | none |
| 1 | One state-aware offer card replaces the ดวงเดือน band and the ดวงคู่ row; เซียมซี row moves up under it | `today_offer_card`, `today_siamsi_up` | be, fe, admin | decision 2 (rule order), decision 3 |
| 2 | Short footer on signed-in pages | none (one commit to revert) | fe | decision 6 |
| 3 | มู page: รับมู, ใช้มู, ประวัติ (with ประวัติเซียมซี); one มู chip with the gold dot | `moo_hub` | be (one enum), fe | owner OK on the DESIGN.md changes in 5.3 |
| 4 | ดวงวันนี้ trimmed: compact lucky row, tips folded, โบนัส row gone, share button, ค่าครู line | `today_compact` (child of `moo_hub`), `today_share_button`, `today_kru_line` | fe | 14 days of increment 0 data; decisions 4 and 5 |
| 5 | Phone tab bar and เพิ่มเติม sheet | `app_tabbar` | fe | 14 days of nav data; decision 7 |

Order differs from the request in one place: the trim (4) comes after the มู page (3), because the โบนัส row cannot
leave ดวงวันนี้ until the มู page and the chip's dot exist.

## 2. What is there today (read, not assumed)

- Header: `horo-fe/src/components/layout/app-header.tsx`, mounted by `components/dashboard/dashboard-profile-gate.tsx:193`.
  Tabs come from `src/lib/systems.ts` (5) plus ร้านค้า and ตั้งค่า. Phones and tablets (below `lg`) get `StreakChip`,
  `BalanceChip` and a hamburger whose drawer has 10 rows. `StreakSheetHost` (the "ดูเช็คอินของฉัน" popup) is mounted
  inside `StreakChip` (`streak-chip.tsx:237`).
- ดวงวันนี้: `src/app/dashboard/fortune/daily/page.tsx` (477 lines, no test file). Offers are `TodayNextReads`
  (`features/fortune/today-next-reads.tsx`), stateless. ค่าครู is `TodayKru`. Share is `ShareCardInline`. โบนัส is
  `TodayStreakSlot`, which also mounts the once-a-day `StreakClaimSheet`. เซียมซี is `TodaySiamsiSlot`.
- Measured at 375 x 812 on the local app: content 4,459 px, page 5,381 px with an 858 px footer (`Footer` is global, in
  `src/app/layout.tsx`).
- Already tracked: `cta_clicked` (`today_monthly_chart`, `today_compatibility`), `reading_shared`, `kru_card_viewed`,
  `kru_sheet_opened`, `kru_amount_chosen`, `siamsi_opened`, `category_opened`, `surface_viewed`. Vocabulary:
  horo-be `lib/shared/types/analytics.ts`; row mapping `src/lib/analytics-events.ts`; body validation
  `src/routes/analytics.ts`; client `horo-fe/src/lib/analytics.ts`; "seen once" hook `useViewedOnce` in
  `features/shop/offer-hooks.ts` (half visible for one second).
- A state rule already exists for the Shop: `features/shop/shop-recommendation.ts` and `use-shop-recommendation.ts`
  (month locked, a locked ดวงคู่ with the partner's name, an exam within 7 days, tickets held).
- Flags: horo-be `src/lib/feature-flags.ts` (`FEATURE_FLAGS`, `audience: 'reader'` reaches the app through
  `GET /api/features`); the app reads them with `useFeatures` and `isFeatureOn` (`src/lib/features.ts`), which is true
  only on a confirmed `true`.
- Auto overlays (gift, sale) open only on `/dashboard/fortune/daily` (`features/overlays/promo-placement.ts`). Nothing
  in this plan changes the signed-in landing or adds an auto-opening surface.
- The sticky envelope is `fixed` bottom-left (`features/beliefs/survey-envelope.tsx:138`) on three exact paths
  (`envelope-rules.ts`).

## 3. Design decisions

### 3.1 Flags: database flags through `/api/features`

```
Context: each visible increment must switch off without a deploy; the owner keeps switches in horo-admin, never env.
Options: A database flags with audience 'reader', read by the app · B env vars (NEXT_PUBLIC_*) · C per-reader buckets
Decision: A, because it is the existing pattern and the only one the owner's rule allows. C adds assignment storage
  for about 53 active readers, where no split reaches significance.
Consequences: one admin toggle per increment; the app's first paint does not know the flag yet (see "first paint").
Rollback: turn the flag off; delete the row's code path at the review.
```

New category in `FLAG_CATEGORIES`: `{ key: 'layout', label: 'หน้าตาและเมนู' }`. New flags, all `audience: 'reader'`,
no `defaultEnabled`: `today_offer_card`, `today_siamsi_up`, `moo_hub`, `today_compact` (parent `moo_hub`),
`today_share_button`, `today_kru_line`, `app_tabbar`. No schema change: a missing row is off.

In horo-fe add `LAYOUT_FLAGS` and `useLayoutFlag(key): boolean | undefined` beside `FEATURES` in `src/lib/features.ts`
(not inside `FEATURES`: that list feeds the maintenance page and the navbar). First paint: `undefined` while
`/api/features` is pending. Blocks below the fold render the old version only on a confirmed `false`, and nothing
while `undefined`; the header and tab bar render their shared part (brand, chip) while `undefined`, so no control
appears and then moves.

Every flag is temporary. Its increment names the review that deletes the flag and the losing branch.

### 3.2 Tracking: three new events in the existing pipeline

```
Context: the brief needs block reach, nav taps and disclosure opens; the app has a closed first-party event list.
Options: A new members of TrackedEvent in product_events · B one free-form ui_event · C @vercel/analytics custom events
Decision: A. B breaks the closed list (a mistyped id splits a number in two); C sends reader behaviour to a third
  party and horo-admin could not show it.
Consequences: three edits per event (type, row builder, route validation) plus a types sync; horo-be deploys first.
Rollback: revert the horo-fe commit; the backend additions are inert.
```

### 3.3 Offer rule: a pure function in the app, sharing the Shop's signals

```
Context: the card needs month state, a waiting ดวงคู่, exams, tickets; the Shop's card already loads all of them.
Options: A extract the signals into one hook, add a pure nextOffer() · B a new backend route GET /api/me/next-offer
  · C alternate ดวงเดือน and ดวงคู่ by day with no state
Decision: A, because no backend change is needed and one hook then feeds both the Shop card and this card. B is one
  request instead of four, but it puts the same rule in two repos while the Shop's stays in the app.
Consequences: ดวงวันนี้ makes four more GETs (monthly history, ดวงคู่ history, exam list, monthly pass), started only
  after the reading is on screen and cached for 60 s. Seam: nextOffer(signals) moves server-side unchanged if the
  signals ever need data the app does not have.
Rollback: flag off; TodayNextReads is still in the tree until the review.
```

Rule (first match wins; decision 2 confirms the order):

1. `ticket_ready`: a ticket in hand fits something waiting (ตั๋วรู้ใจ and a locked ดวงคู่; ตั๋วดวงเดือน and this month
   unopened; ตั๋วดวงสอบ and a locked exam).
2. `compat_waiting`: a ดวงคู่ waits locked; the card names the partner.
3. `exam_soon`: a locked exam reading within 7 days.
4. This month unopened: `love_top` or `love_low` when love is first or last of today's four areas and the reader has no
   ดวงคู่ report yet; otherwise `month_locked`.
5. `month_open`: a quiet "อ่านดวงเดือนนี้ต่อ" row, not a sale.

A signal that failed to load counts as unknown, and the rule falls through to `month_locked`, which is today's band in
words. The card links to the reading's own page (the door), never to the Shop. A card that names a partner carries a
"ซ่อนไว้ก่อนวันนี้" control (`horo-offer-hidden:<userId>:<Bangkok date>` in localStorage).

### 3.4 มู page: rework `/dashboard/wallet` in place

```
Context: มู lives in four places; the wallet route is linked from the chip, the drawer, the Shop and old emails.
Options: A reorganise /dashboard/wallet into three segments · B a new /dashboard/moo with a redirect · C a separate
  /dashboard/bonus page beside the wallet
Decision: A. B renames a route for no reader benefit and touches the `wallet` flag's paths, the promo placement list
  and the `wallet` analytics surface. C adds a destination, the opposite of the goal.
Consequences: deep links by query (`?tab=earn|spend|history&history=moo|tickets|siamsi`); the page file becomes a
  thin switch between the legacy page and the hub while the flag lives.
Rollback: flag off.
```

### 3.5 Phone navigation: a tab bar as its own last step, with a cheaper fallback

```
Context: the drawer hides 7 destinations; a bottom bar touches every page and rewrites DESIGN.md's app nav.
Options: A a bottom tab bar below lg (4 tabs and เพิ่มเติม), top bar keeps brand and the มู chip · B keep the top bar
  and regroup the drawer under three headings with one-line descriptions · C a tab bar at every width
Decision: plan A behind `app_tabbar`, build it only if increment 0 shows under 1 in 4 active readers ever opens the
  menu; otherwise ship B (one file, no flag). C is out: desktop has room for the inline links it already has.
Consequences of A: every fixed bottom element moves up; the dashboard content needs bottom padding; DESIGN.md
  "Navigation" changes. Rollback: flag off.
```

Design review (boundaries, dependencies, files, failure): new code lives with its feature (`features/offers`,
`features/wallet/moo-hub`, `components/layout`); dependencies stay one way (pages → features → lib); no new package;
no data store changes, so the migration checklist is skipped. Failure modes are stated per increment.

## 4. Increment 0: tracking

Goal: 14 days of numbers before anything moves. Nothing visible changes.

horo-be
- `lib/shared/types/analytics.ts`: `TODAY_BLOCKS = ['lucky','reading','areas','next_reads','guidance','share','bonus','siamsi','footer']`,
  `NAV_ITEMS = ['brand','today','fortune','bazi','compatibility','exam','shop','wallet','settings','bonus','theme','logout','menu','more']`,
  `NAV_PLACES = ['bar','drawer','chip','tabbar']`,
  `TODAY_EXTRAS = ['reading_more','guidance_more','moo_uses','checkin_sheet','siamsi_history']`; events
  `today_block_viewed { block }`, `nav_tapped { item, place }`, `today_extra_opened { detail }`; add to
  `TRACKED_EVENT_NAMES`; `dedupKeyFor`: block, `null` (every tap), detail.
- `src/lib/analytics-events.ts`: rows `surface 'today', detail block`; `surface null, category place, detail item`;
  `surface 'today', detail`.
- `src/routes/analytics.ts`: three body shapes with `oneOf(...)`.
- `bun run sync:types` (writes horo-fe `src/lib-packages/shared`).
- Tests: `tests/analytics-events.test.ts` (rows, dedup keys, a bad member throws), `tests/analytics-route.test.ts`
  (200 for each new event, 422 for an unknown block).

horo-fe
- Move `useViewedOnce` to `src/hooks/use-viewed-once.ts` and re-export it from `features/shop/offer-hooks.ts` (three
  features use it now). A block taller than twice the viewport can never be half visible; none is today, and the hook
  gains an "or covers half the viewport" branch so an expanded block still counts.
- `src/features/fortune/today-block.tsx`: `<TodayBlock block="lucky">` wraps a section and fires `today_block_viewed`.
- `src/app/dashboard/fortune/daily/page.tsx`: wrap the nine blocks; `today_extra_opened` on อ่านต่อ and ดูเพิ่มอีก N ข้อ.
- `features/streak/streak-card.tsx`: `moo_uses` and `checkin_sheet`. `features/siamsi/today-siamsi-slot.tsx`:
  `siamsi_history`. `components/layout/footer.tsx`: block `footer` on `/dashboard/fortune/daily` only.
- `components/layout/app-header.tsx`, `features/streak/streak-chip.tsx`, `features/wallet/balance-chip.tsx`:
  `nav_tapped` on every link, the hamburger opening (`menu`), the theme row and sign-out.
- Tests: `today-block.test.tsx` (fires once, not before one second, not while the tab is hidden; the
  IntersectionObserver stub pattern is in `features/wallet/mini-shop-analytics.test.tsx`), `app-header.test.tsx`
  (bar, drawer and chip taps carry the right item and place).

horo-admin
- `src/lib/stats/engagement.ts` and `engagement-model.ts`: readers who opened ดวงวันนี้, then readers per block (count
  before percent, `notTeamUser`); nav taps by item and place; disclosure opens. `engagement/page.tsx`: one block
  "หน้าดวงวันนี้". `src/lib/people/events-model.ts`: Thai labels for the three events. Model tests for each.

Deploy order: horo-be, then horo-fe, then horo-admin. A frontend that sends an event the backend does not know gets a
422 that the client swallows by design, so the numbers would be silently missing: prove the backend is live first
(`POST /api/analytics/event` with `today_block_viewed` answers 200; the Railway build keeps the old image when a test
fails).

Rollback: revert the horo-fe commit. Verify locally: open ดวงวันนี้ at 375 px, scroll to the end, tap every menu row,
then `SELECT event, surface, category, detail, count(*) FROM product_events WHERE event IN ('today_block_viewed','nav_tapped','today_extra_opened') GROUP BY 1,2,3,4`
on `horo_dev` shows one row per block and one per tap; the admin preview (`horo-admin-preview-3013-local-be`) shows
the block.

Done when: the three events arrive in production, the admin block renders, and the brief's baseline query has been
run once with the owner's OK.

## 5. Visible increments

### 5.1 Increment 1: the offer card (`today_offer_card`) and เซียมซี up (`today_siamsi_up`)

horo-be: `today_offer_viewed { offer, reason }` (dedup `offer:reason`), `today_offer_clicked { offer, reason }` (every
tap), `today_offer_hidden { reason }`; `TODAY_OFFERS = ['monthly','compat','exam']`, `TODAY_OFFER_REASONS = ['ticket_ready','compat_waiting','exam_soon','month_locked','love_top','love_low','month_open']`;
rows `surface 'today', category offer, detail reason`; the two flags. Same three files and tests as increment 0.

horo-fe
- `src/features/offers/use-reader-signals.ts`: the queries now inside `use-shop-recommendation.ts`, plus
  `hasAnyCompat`, taking `enabled`. `use-shop-recommendation.ts` calls it (behaviour unchanged;
  `shop-recommendation` tests must still pass untouched).
- `src/features/offers/next-offer.ts`: `nextOffer(signals, today: { loveRank: 'top' | 'low' | null }): Offer`, pure.
  `next-offer.test.ts`: one case per reason, the order, unknown signals fall to `month_locked`, a held ticket never
  produces a purchase pitch for the same product.
- `src/features/offers/today-offer-card.tsx` and `offer-copy.ts`: the card (whole card answers a tap,
  `STRETCHED_TAP`; the hide control is `relative z-10`), view and tap events, the hide key. Copy goes through
  thai-ux-writer before merge; the mock's lines are placeholders.
- `src/app/dashboard/fortune/daily/page.tsx`: `today_offer_card` on → `TodayOfferCard`, confirmed off →
  `TodayNextReads`, unknown → nothing. `today_siamsi_up` on → `TodaySiamsiSlot` sits directly under the offer.
  `src/features/fortune/today-layout.ts` holds these choices as one pure function with a test, so the page file
  only renders what it returns.
- Tests: `today-offer-card.test.tsx` (each state's link target, the partner's name appears only in the named states,
  hide writes the key and survives a reload the same day, the card never renders while signals load).

horo-admin: offer views and taps by reason in the "หน้าดวงวันนี้" block.

Failure modes: a signal request fails → unknown → `month_locked`. The features read fails → `useLayoutFlag` answers
`false` once the request has errored, so the reader gets today's page with the band, never an empty slot.

Rollback: both flags off. Review: 14 days after the flag goes on, against `cta_clicked` for the 14 days before
(same drop phase); keep or kill per the brief; then delete the flag and the loser.

Verify locally: with `horo-be-dev-localdb`, turn on `compat_lock`, `monthly_lock` and `today_offer_card`
(`PUT /internal/flags/<key>`), sign in as the dev user and make one new ดวงคู่ check so a locked report exists (the
seeded three may be open). Then walk the states: `compat_waiting`; grant a ตั๋วรู้ใจ → `ticket_ready`; open that report
→ `month_locked`; open the month on the fake-pay stack (`horo-be-shop-fake-3021`) → `month_open`.

### 5.2 Increment 2: short footer on signed-in pages

`components/layout/footer.tsx`: on `/dashboard/*` render the compact footer: `FooterCoffee` (same rule as today,
never on the wallet page), the legal links, `FooterUserId`. The dashboard is `noindex`, so the SEO link grid there
serves no crawler. The guard test in `src/components/ads/` (coffee line and its button) must stay green; add a test
that the public pages keep the full footer. No flag: one commit, reverted by `git revert`.

### 5.3 Increment 3: the มู page (`moo_hub`)

horo-be: `SIAMSI_OPEN_SURFACES` gains `'moo'`; the flag. Types sync.

horo-fe
- `src/app/dashboard/wallet/page.tsx`: flag on → `<MooHub />`, else the page as it is (moved unchanged into
  `features/wallet/legacy-wallet-page.tsx`).
- `src/features/wallet/moo-hub/`: `moo-hub.tsx` (balance, the three segments as a tablist, state in the query
  string), `earn-panel.tsx` (the check-in row from `features/streak`, "ดูเช็คอินของฉัน", the letter row, เติมมู opening
  the existing `PackSheet`), `spend-panel.tsx` (เซียมซี row opening `SiamsiSheet` with `surface="moo"`, ticket rows
  from `FeatureCreditCard` and `MonthlyTicketsCard`, the Shop link), `history-panel.tsx` (`WalletHistory`,
  `TicketHistory`, and a third tab that renders `SiamsiHistory` from `useSiamsiHistory`).
- `features/siamsi/siamsi-sheet.tsx`: `startOn` also accepts `{ draw }`, so a history row outside the sheet opens
  that ใบ. No tier tag anywhere (matches the uncommitted change to `siamsi-history.tsx` and `siamsi-slip.tsx`).
- Header: with the flag on, `StreakChip` is not rendered and `BalanceChip` shows the gold dot while a check-in waits
  and links to `/dashboard/wallet?tab=earn`. Move the `StreakSheetHost` mount out of `StreakChip` into
  `dashboard-profile-gate.tsx`, or "ดูเช็คอินของฉัน" loses its popup when the chip goes.
- The letter row needs to open the letter from outside the envelope: `features/feedback/letter-store.ts` (a request
  flag the envelope listens to). The envelope's own rules do not change. If this proves awkward, ship the hub without
  the letter row and add it after; the row is not on the critical path.
- ค่าครู is not on this page: the support line never sits next to money (owner, 2026-09-27; `footer.tsx` already
  hides it here).
- Tests: `moo-hub.test.tsx` (segment from the query string, the dot follows the streak state, history tab shows date,
  ใบที่ and name and no tier word, a row opens that ใบ), `streak.test.tsx` (host still mounted without the chip),
  `app-header.test.tsx` (one chip with the flag on, two with it off), `wallet.test.tsx` unchanged for the legacy page.

DESIGN.md changes that need the owner's OK before merge: "Signature: โบนัส" (the nav button and dropdown become the
มู chip's dot and the รับมู segment; Lantern Gold marks that dot), "Navigation" (one chip), the wallet-history bullet
(third tab). Update the doc in the same commit and score it with the FRESH rubric.

Rollback: flag off (turns `today_compact` off with it). Review: 14 days; check-in claims per day must not fall
(server records, horo-admin /streak) and เซียมซี opens by surface should rise.

Verify locally: both flag states at 375 px and 1280 px; claim a check-in from รับมู; draw from ใช้มู and find the ใบ in
ประวัติ; the once-a-day gift popup still opens on ดวงวันนี้.

### 5.4 Increment 4: trim ดวงวันนี้ (three flags, each with its own kill rule)

Starts only with 14 days of block reach in hand; fold or move what under 1 in 3 daily readers see, keep what 2 in 3 see.

- `today_compact` (child of `moo_hub`): lucky kit as one four-cell row under the hero, tips collapsed behind one
  disclosure, the โบนัส row not rendered. `TodayStreakSlot` still mounts `StreakClaimSheet` so the gift popup and its
  overlay slot are untouched. Files: `daily/page.tsx`, `today-layout.ts`, `features/streak/today-streak-slot.tsx`
  (a `row={false}` prop).
- `today_share_button` (decision 4): `components/share/share-button.tsx` opens the existing `ShareCardSheet`; placed
  under the title on ดวงวันนี้, ดวงเดือน (`monthly/page.tsx`) and the ดวงคู่ report (`compatibility-result.tsx`); the
  inline block is not rendered. The sheet still shows the image first with บันทึกรูป first. `reading_shared` is
  unchanged, so before and after compare directly. DESIGN.md "share cards: the image is visible before anyone asks"
  changes; owner OK first.
- `today_kru_line` (decision 5): `TodayKru` gains `variant: 'card' | 'line'`; the same three events fire.

Tests: `today-layout.test.ts` (every flag combination, and `today_compact` ignored while `moo_hub` is off),
`share-button.test.tsx`, `kru-sheet.test.tsx` (line variant opens the same sheet and fires the same events).
Rollback: each flag by itself. Review: 14 days each, per the brief's kill rules (ค่าครู payments, shares).

### 5.5 Increment 5: phone tab bar (`app_tabbar`), or the regrouped drawer

Build only if decision 7 says so after the nav data.

- `src/lib/systems.ts`: each tab gains `primary?: boolean` and `description` (one line for the เพิ่มเติม sheet). Which
  readings are primary follows the page-open counts in the baseline query; the mock assumes ดวงวันนี้, ดวงเดือน, ดวงคู่.
- `components/layout/app-tab-bar.tsx`: below `lg`, fixed, safe-area padded; วันนี้, ดวงเดือน (the one hero pill,
  `.nav-hero`, outline when current), ดวงคู่, มู (crystal, gold dot), เพิ่มเติม. A closed feature leaves the bar
  (`openTabs`). `nav_tapped` with place `tabbar`.
- `components/layout/more-sheet.tsx`: native `<dialog>` through `useRegisteredDialog` (so no promo opens over it):
  พื้นดวง, ดวงการเรียน, ร้านค้า, สนับสนุนแม่หมอ (opens `KruSheet`), ตั้งค่า, โหมดกลางคืน, ออกจากระบบ.
- `components/layout/app-header.tsx`: with the flag on, no hamburger and no drawer below `lg`.
- `components/dashboard/dashboard-profile-gate.tsx`: mount the bar; bottom padding on the content.
- Everything fixed to the bottom moves above the bar: `features/beliefs/survey-envelope.tsx`,
  `components/ui/scroll-to-top.tsx`, `components/ui/status-toast.tsx`, `components/dev/horo-devtools.tsx`. Find the
  rest at build time: `grep -rn "fixed.*bottom\|bottom-\[calc" src --include='*.tsx'`.
- Tests: `app-tab-bar.test.tsx` (five slots, a closed feature drops out, hero outline, current page), `more-sheet.test.tsx`,
  `app-header.test.tsx` (no hamburger with the flag on; unchanged with it off), `beliefs.test.tsx` (envelope offset).
- DESIGN.md "Navigation" rewrite; owner OK first.

Fallback (5-alt, no flag): group the drawer rows in `app-header.tsx` under อ่านดวง, มู, บัญชี with the same one-line
descriptions.

Checks a test cannot give: iPhone Safari with the URL bar collapsing, the keyboard open on the ดวงคู่ form, the
`SiamsiSheet` shake stage, a sale modal and the gift popup over the bar, 320 px width, dark mode.

## 6. Commands and deploy

- horo-fe: `bun test`, `bun run type-check`, `bun run lint`, `bun run build`. Never `bun run build` while `next dev`
  runs in the same checkout (it clobbers `.next`): stop the dev server or build in a second checkout. Never two
  `next dev` at once.
- horo-be: `PW=$(docker exec local-postgres printenv POSTGRES_PASSWORD); REDIS_URL= DATABASE_URL="postgresql://dev:$PW@localhost:5432/horo_test" WALLET_TEST_DATABASE_URL="postgresql://dev:$PW@localhost:5432/horo_test" bun test`
  then `bun run type-check`. `REDIS_URL=` matters: `.env.local` points at production Redis. Tests on `horo_test`
  empty `feature_flags`, so they must not run against `horo_dev`.
- horo-admin: `bun test`, `bun run type-check`, `bun run build`.
- No schema change in any increment (events fit `product_events` as is; flags are rows by key).
- Deploy each increment backend first, prove it live (`GET /api/features` lists the new key, or the new event answers
  200), then the frontend, then admin. Flags stay off until the owner turns them on in horo-admin /flags.
- Tests never reach a live service: no production database, Redis, Stripe or Resend.

## 7. What must not break

- The auto gift and sale popups open only on ดวงวันนี้ and never over a loader (`OverlayPageReady` stays where it is).
- No new auto-opening surface; the offer card never opens anything by itself.
- The footer's สนับสนุน line and its button stay (guard test in `src/components/ads/`), and never on the wallet page.
- ดวงประจำเดือน is the one emphasised nav item; no romance pink in navigation.
- Thai copy: no emoji, dashes or middle dots (`src/lib/site-copy-style.test.ts`), คุณ, no promised outcomes.
- Spending มู always asks first (`SpendConfirmSheet`); nothing here adds a spend.
- MBTI and ages are never shown; the offer card never says why by age.

## 8. Owner decisions that gate work

| # | Decision | Blocks | Recommendation |
| --- | --- | --- | --- |
| 1 | OK one read-only aggregate query on production for baselines | the reviews of 1, 3, 4 | yes |
| 2 | Offer rule order (3.3): the reader's own waiting item before "month locked" | increment 1 | yes |
| 3 | เซียมซี keeps a row on ดวงวันนี้, moved up, as well as its place on the มู page | increment 1 | yes |
| 4 | Share: button under the title instead of the image on the page | `today_share_button` | keep the image until shares are read, then test |
| 5 | ค่าครู: one line instead of the card | `today_kru_line` | keep the card until ค่าครู numbers are read, then test |
| 6 | Short footer on signed-in pages | increment 2 | yes |
| 7 | Tab bar or regrouped drawer | increment 5 | decide on 14 days of nav taps |
| 8 | DESIGN.md changes for the มู chip and the รับมู segment (5.3) | increment 3 | yes, with the doc updated in the same commit |

## 9. Not verified

- No code was written or run for this plan. File paths and line numbers were read; behaviour claims about the app
  come from the code and one local session at 375 x 812.
- The baseline counts are unread (no production access this session).
- Request cost of the four extra GETs on ดวงวันนี้ was not measured; measure in increment 1 before the flag goes on.
- The mock approximates sizes; its 1,790 px for ดวงวันนี้ is indicative only.

FRESH (new doc, 2026-11-18): F 3 (entry added to docs/README.md, descriptive name, frontmatter scope) · R 2 (status
metadata present and paths read from the code, but nothing here is built, and the referenced เซียมซี edits are
uncommitted) · E 2 (long; the table in section 1 lets a reader stop early, sections 4 and 5 are retrievable alone) ·
S 2 (a plan, with ADR-lite blocks kept inline instead of a decisions folder) · H 2 (paths, flags, tests and commands
are concrete; copy, the primary-tab choice and several owner decisions are still open). Total 11/15 (B).
