---
type: SPEC
status: active; the 2026-10-25 price set is built in horo-be (see "Live"), not yet deployed; horo-fe and horo-admin follow
scope: how Shop prices, struck anchors, offers, bundles, event specials and the monthly drop are made and shown
last_reviewed: 2026-10-25
owner: product
---

# Shop pricing: how we make a price

One page for anyone adding or changing a price in the Shop, the mini shop (the buy dialog at a paid door) or a sale. Code wins over this page where they disagree; the reasoning and numbers are in `~/product-decisions/horo/2026-10-25b-monetize.md` (owner's local decision log, not in the repo).

## The three tiers

Every ticket product shows up to three prices. Same numbers on every surface: Shop cards, the Shop dialog, the mini shop and the sale modal all render one `ShopOffer` from the catalog API (`horo-be/src/lib/catalog.ts`), through `horo-fe/src/features/shop/offer-choices.tsx`.

| Tier | Also called | What it is | Charged? | Shown as |
| --- | --- | --- | --- | --- |
| Anchor | ราคาอ้างอิง, list price | A high number that makes the offer read as a deal | **Never** | struck-through number plus a "ลด N%" chip |
| Offer | everyday price | The price we intend to sell at, every day | Yes | the bold price, always on show |
| Special offer | ราคาพิเศษ | A deeper price in one of two kinds of sale (below), once per reader per sale | Yes | first in the dialog, with its tag and countdown, and the same anchor |

The two kinds of special offer:

- **Sale 1, event specials** (`EVENT_OFFERS` in `horo-be/src/lib/sale-events.ts`): only inside a sale event (โปรวันคู่, Songkran, Halloween), once per reader per offer per event.
- **Sale 2, the monthly drop** (`horo-be/src/lib/monthly-drop.ts`): a clock-based price on ตั๋วดวงเดือน for the current month, no event row. Days 1 to 14 of the Bangkok month: no drop (the everyday 189). Days 15 to 21: one promo ticket for this month at 139 (`drop_monthly_139`). Day 22 to the end of the month: a **set of two** promo tickets, this month and next month, at 149 (`drop_monthly_set_149`). Once per reader per month (either step, never both), and only while the reader's report for the current month is unopened. Off until the admin turns the `monthly_drop` flag on, which is also its kill switch.

**Overlap rule.** The monthly door shows one special at a time. While a sale event is active and the reader may buy `event_monthly_99`, the event offer wins and the drop is not offered or buyable: one tag, one price, never stacked. They are different products (a single ticket at 99 against a set of two at 149), so the lower price is not compared; the event is the price the owner promoted. Without an eligible event offer the drop shows. A reader who already holds a usable promo ตั๋วดวงเดือน for the current month (from the event offer, an earlier drop or an admin grant) is not offered the drop and cannot buy it, so nobody gets a second promo ticket for one month.

Rules that follow:

- A special offer is always deeper than the everyday price of the same item, and uses the same anchor, so the reader sees one number struck out all year. The drop set is the exception by shape: it is two tickets, so its anchor is two single anchors (2 x 330 = 660).
- A single ticket is always discounted less than a bigger pack of the same item (1 < 3 < 12, 1 < 3 < 5) and less than a bundle that contains it.
- The everyday price of a 1-ticket offer is a real price someone can buy; "รู้ใจ 1 ใบ = 69" is the entry point.
- Special offers are never listed in the Shop outside their sale. Events, dates and the modal: `horo-be/docs/shop.md` (sale events) and `horo-fe/DESIGN.md` ("Signature: โปรวันคู่").

## How a price is made, in order

1. **Everyday price.** Start from what the reader pays today and from the top-up ladder below. The owner's set: 69, 169, 239 (รู้ใจ), 189, 389, 999 (ดวงเดือน), 99 (ดูเพิ่ม 10 ครั้ง), 219 and 439 (bundles).
2. **Fit the ladder.** Every offer price must be covered by one pack with at most 75 มู left over. A price that forces a much bigger pack loses the sale at the top-up step; change the price or the ladder. The one accepted exception: ดวงเดือน 12 at 999 is covered by the ฿999 pack, which credits 1,199 (999 + 200 bonus), so that buyer keeps 200 มู on purpose, a thank-you balance of about one monthly special.
3. **One explicit anchor per offer.** Not a per-ticket list price times a count. A per-ticket anchor cannot hold: every pack is cheaper per ticket than the single, and the owner wants every chip between 40 and 45% (everyday), so a single list price per ticket would give the 5-pack a larger or smaller chip than it has earned, and one rounding would show up in all of them. Each offer has its own number in `OFFER_ANCHOR` (`horo-be/src/lib/list-prices.ts`). Readers see per-ticket numbers 330 / 230 / 150 for ดวงเดือน 1 / 3 / 12 and 115 / 100 / 86 for รู้ใจ 1 / 3 / 5, which fall with pack size on purpose.
4. **Discount shown = the exact discount floored to a whole percent.** Integer maths: `floor((anchor - price) * 100 / anchor)`. Never rounded up, so the chip never overstates, and no longer stepped to a multiple of 5.
5. **Bundles.** A bundle of two products costs less than buying the parts (state that real saving in baht, e.g. "ประหยัด 39 มู", because it is true), and its anchor is the **sum of its parts' anchors** (pair 330 + 115 = 445, full 690 + 300 = 990). That is why a bundle may show a higher chip (50 and 55%) than its parts (42 to 44%).
6. **Special offer price.** Pick a price that is a clear step under the everyday price (events about 70%). Check the shown discount is above the everyday offer's.
7. **Check the table below still holds.** Single < pack < bundle, special > everyday, every price on the ladder.

## ดูเพิ่ม 10 ครั้ง is the free-check pack, not a ticket

`compat_check_10` (product `compat_check_pack`, feature `compat_check`) sells **10 more free ดวงคู่ checks** after the 5 free checks in 24 hours run out. A check is the cheap step (a free summary of a new person); the paid step is the ตั๋วรู้ใจ that opens the full report. So the pack is priced per check (9.9), must stay cheaper per unit than a รู้ใจ ticket, and is **not** a ticket: it has no expiry rule, no promo, no month scope, is not in any bundle or event, and does not appear in the ticket history (`GET /api/wallet/tickets/history` lists ตั๋วรู้ใจ and ตั๋วดวงเดือน only). Cost to serve is about 8.7 on 99 (9% of the price).

## Honesty rules (the anchor is never charged)

- No label like "ราคาปกติ" or "ราคาเดิม" next to the struck number, and no copy saying the price "was" that. The strike and the chip only.
- The same anchor on every surface for the same offer. Never a different strike in the dialog and on the card.
- Real savings (bundle vs parts) are stated as the baht difference; the chip uses the anchor.
- If a reader or complaint reads the strike as false, remove the strike and chip from that offer; the everyday price stays. (Anchors draw complaints weekly in the owner's pre-mortem; watch it.)
- Promo tickets expire at the end of their month (below); say so where the offer is shown.

## Live

Built in horo-be on 2026-10-25 (not committed, not deployed). The anchors are data in `horo-be/src/lib/list-prices.ts` (`OFFER_ANCHOR`, one entry per offer id); `anchorFor` in `horo-be/src/lib/sale-events.ts` applies them and `shownPercentOff` floors to a whole percent. An offer with no entry (an admin-created offer on another product) keeps the older rule: the product's single price x tickets, a whole percent.

| Offer | Id | Price | Anchor | Chip | Per ticket |
| --- | --- | --- | --- | --- | --- |
| รู้ใจ 1 | `heart_1_69` | 69 | 115 | 40% | 69 |
| รู้ใจ 3 | `heart_3_169` | 169 | 300 | 43% | 56 |
| รู้ใจ 5 | `heart_5_239` | 239 | 430 | 44% | 48 |
| ดูเพิ่ม 10 ครั้ง (free checks) | `compat_check_10` | 99 | 180 | 45% | 9.9 a check |
| ดวงเดือน 1 | `monthly_1_189` | 189 | 330 | 42% | 189 |
| ดวงเดือน 3 | `monthly_3_389` | 389 | 690 | 43% | 130 |
| ดวงเดือน 12 | `monthly_12_999` | 999 | 1,800 | 44% | 83 |
| หนึ่งเดือน หนึ่งใจ (ดวงเดือน 1 + รู้ใจ 1) | `bundle_pair_219` | 219 | 445 | 50% | saves 39 |
| สามเดือน สามใจ (ดวงเดือน 3 + รู้ใจ 3) | `bundle_full_439` | 439 | 990 | 55% | saves 119 |
| Event: ดวงเดือน 1, promo for this month | `event_monthly_99` | 99 | 330 | 70% | 99 |
| Event: รู้ใจ 3 | `event_heart_3_89` | 89 | 300 | 70% | 30 |
| Event: รู้ใจ 5 | `event_heart_5_129` | 129 | 430 | 70% | 26 |
| Event: pair, promo ดวงเดือน 1 (this month) + รู้ใจ 1 | `event_pair_129` | 129 | 445 | 71% | |
| Drop days 15 to 21: ดวงเดือน 1, promo for this month | `drop_monthly_139` | 139 | 330 | 57% | 139 |
| Drop day 22 to month end: ดวงเดือน, set of 2 promo (this month and next) | `drop_monthly_set_149` | 149 | 660 | 77% | 75 |

Ids encode their price, so a changed price is a new offer: `heart_1_99`, `heart_3_199`, `heart_5_299`, `monthly_1_199`, `monthly_3_399`, `monthly_12_1199`, `bundle_pair_249`, `bundle_full_449` and `event_heart_3_99` are archived by `SEED_SUPERSEDES` (`horo-be/src/lib/catalog.ts`) in the seed call that inserts their replacement, with the older chain (`monthly_1_249`, `monthly_3_447`, `heart_ticket_N`, ...). Old ids stay readable on past purchases, the ledger and analytics. `event_monthly_99` and `compat_check_10` keep their ids (the price did not change; only the anchor did).

The drop's promo tickets: this-month's expires at 00:00 Bangkok on the 1st of the next month; the set's second ticket is scoped to **next month**, is not valid before 00:00 on that 1st (`validFrom`; it cannot open any report earlier) and expires 00:00 on the 1st of the month after (31 Dec rolls into January of the next year). An event special's promo ticket (`event_monthly_99`, the monthly half of `event_pair_129`) is this month's only. Expired promo tickets stay in the ticket history as derived `expired` rows (`horo-be/docs/shop.md`).

Bundles are the product `bundle_set` (type `bundle`, `horo-be/src/lib/bundles.ts`). A bundle is one set: its offer has `units` 1 and carries `savingMoo` (parts at everyday offers minus its price: 189 + 69 - 219 = 39 and 389 + 169 - 439 = 119), so the Shop says "ประหยัด N มู" and never shows a price per ticket. `event_pair_129` is a bundle-product special (its tickets come from its event definition, not from `bundles.ts`).

Top-up ladder (`OFFERED_PACK_IDS`): ฿99 = 99 (`p100`), ฿189 = 189 (`p189`), ฿239 = 239 (`p239`), ฿439 = 439 + 22 = 461 (`p439`), ฿999 = 999 + 200 = 1,199 (`p999`). Old pack ids stay in `pricing.ts` (`p150`, `p199`, `p250`, `p299`, `p300`, `p450`, ...) so orders and history still resolve; an id never changes meaning. Leftovers: the worst case is 389 on ฿439 (72 left); 129 on ฿189 leaves 60; 139 leaves 50; 149 leaves 40; the 12-ticket 999 on ฿999 leaves 200 (the accepted exception above).

Tests that hold the table: `horo-be/tests/shop.test.ts` (every seeded offer, exact chips, single below bundle, special deeper with the same anchor, bundle purchase and refund, supersede), `tests/sale-events.test.ts` (anchor math, table of 15 offers), `tests/monthly-drop.test.ts` (days 14/15/21/22/last day, month and year rollover, set grants, the event-wins rule), `tests/sale-events-db.test.ts` (the drop and the pair end to end, once per month, ticket history), `tests/wallet.test.ts` (the ladder and the 75 rule).

## Changing a price: checklist

1. Edit `SEED_OFFERS` and, for a new price, add the superseded id to `SEED_SUPERSEDES` (never edit a published offer's price). A new offer needs its explicit anchor in `list-prices.ts`; a new bundle needs its parts in `bundles.ts`; a new special needs its definition in `sale-events.ts` or `monthly-drop.ts`.
2. Keep the offer-id constants (`lib/shared/types/shop.ts`, copied into `horo-fe/src/lib-packages/shared/types/` by `bun run sync:types`) and horo-admin's `MONTHLY_REGULAR_OFFER_IDS` in step. horo-admin keeps its own copy of the anchors, offer ids and packs in `horo-admin/src/lib/shop/price-set.ts` (and its test): mirror every price change there, or the admin pricing panel flags a mismatch.
3. Run the pricing tests (backend catalog tests, `offer-display.test.ts`) and look at the Shop and one mini shop dialog in dev.
4. Update this page, `horo-be/docs/shop.md` and `horo-be/docs/wallet.md` if packs changed, and log the decision.
5. Production: push-first deploy; new offers are rows inserted by the catalog seed, no `db:migrate` (see `horo-be/scripts/ensure-migrations.md`). A live sale event gets new event offers from the same lazy seed (`ensureEventOffers`) when nobody has edited it.

## Done when

A new or changed price passes the steps in "How a price is made" and the checklist above, shows the same on the Shop card, the Shop dialog and the mini shop, and this page and the decision log name the new number.

FRESH before → after (2026-10-25, final price set): F 3→3 (indexed in docs/README.md, `last_reviewed` and status updated) · R 2→2 (the table, the anchors and the rules were rewritten from `list-prices.ts`, `catalog.ts`, `monthly-drop.ts` and asserted by the horo-be tests on a local Postgres; nothing is deployed and the horo-fe and horo-admin sides are not yet built, so it is not a 3) · E 2→2 (longer: a 15-row table and the drop; still one page) · S 3→3 (one pricing spec; shop.md and wallet.md own the mechanics) · H 3→3 (every row names its offer id, the checklist names the files, the tests that hold the table are listed). Total 13/15 (B) → 13/15 (B).
