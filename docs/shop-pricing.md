---
type: SPEC
status: active; the 2026-10-24 price set is built in horo-be (see "Live"), not yet deployed
scope: how Shop prices, struck anchors, offers, bundles and special offers are made and shown
last_reviewed: 2026-10-24
owner: product
---

# Shop pricing: how we make a price

One page for anyone adding or changing a price in the Shop, the mini shop (the buy dialog at a paid door) or a sale event. Code wins over this page where they disagree; the reasoning and numbers are in `~/product-decisions/horo/2026-10-24-monetize.md` (owner's local decision log, not in the repo).

## The three tiers

Every ticket product shows up to three prices. Same numbers on every surface: Shop cards, the Shop dialog, the mini shop and the sale modal all render one `ShopOffer` from the catalog API (`horo-be/src/lib/catalog.ts`), through `horo-fe/src/features/shop/offer-choices.tsx`.

| Tier | Also called | What it is | Charged? | Shown as |
| --- | --- | --- | --- | --- |
| Anchor | ราคาอ้างอิง, list price | A high number that makes the offer read as a deal | **Never** | struck-through number plus a "ลด N%" chip |
| Offer | everyday price | The price we intend to sell at, every day | Yes | the bold price, always on show |
| Special offer | ราคาพิเศษ, event offer | A deeper price, only inside a sale event, once per reader per offer per event | Yes | first in the dialog, with the event countdown and the same anchor |

Rules that follow:

- A special offer is always deeper than the everyday price of the same item, and uses the same anchor, so the reader sees one number struck out all year.
- A single ticket is always discounted less than a bundle of the same item (single below bundle, bundle below bigger bundle).
- The everyday price of a 1-ticket offer is a real price someone can buy; "รู้ใจ 1 ใบ = 99" is the fixed entry point.
- Special offers live only in `EVENT_OFFERS` (`horo-be/src/lib/sale-events.ts`) and are never listed in the Shop outside an event. Events, dates and the modal: `horo-be/docs/shop.md` (sales events) and `horo-fe/DESIGN.md` ("Signature: โปรวันคู่").

## How a price is made, in order

1. **Everyday price.** Start from what the reader pays today and from the top-up ladder below. Prices end in 9 (99, 199, 299, 399, 449, 1,199).
2. **Fit the ladder.** Every offer price must be covered by one pack with under about 75 มู left over. A price that forces a much bigger pack (299 forcing ฿449) loses the sale at the top-up step; change the price or the ladder.
3. **One list price per ticket.** ตั๋วรู้ใจ 200, ตั๋วดวงเดือน 500. Anchor = list price × tickets in the offer. Never a different per-ticket anchor inside one product: readers divide.
4. **Discount shown = exact discount rounded down to a multiple of 5.** Exact is `1 - price / anchor`. Rounding down means the chip never overstates. Pick the price or the anchor so the exact discount is within 5 points above a multiple of 5.
5. **Bundles.** A bundle of two products costs less than buying the parts (state that real saving in baht, e.g. "ประหยัด 49 มู", because it is true), and its anchor is the sum of the parts' anchors.
6. **Special offer price.** Pick a price that is a clear step under the everyday price (usually the 99 pack). Check the shown discount is above the everyday offer's.
7. **Check the table above still holds.** Single < bundle, special > everyday, every chip a multiple of 5.

## Honesty rules (the anchor is never charged)

- No label like "ราคาปกติ" or "ราคาเดิม" next to the struck number, and no copy saying the price "was" that. The strike and the chip only.
- The same anchor on every surface for the same offer. Never a different strike in the dialog and on the card.
- Real savings (bundle vs parts) are stated as the baht difference; the chip uses the anchor.
- If a reader or complaint reads the strike as false, remove the strike and chip from that offer; the everyday price stays.
- The ticket expiry rule is separate: only the promo ticket of an event offer expires, at month end (`horo-be/docs/shop.md`).

## Live

Built in horo-be on 2026-10-24 (committed locally, not yet deployed). The anchors are data in `horo-be/src/lib/list-prices.ts`
(`TICKET_LIST_PRICE` per ticket by product, `OFFER_ANCHOR` for the pack and the bundles); `anchorFor` in
`horo-be/src/lib/sale-events.ts` applies them and `shownPercentOff` rounds down to a multiple of 5. An offer with no entry
there (an admin-created offer on another product) keeps the older rule: the product's single price × tickets, a whole
percent. The Shop card shows one "เริ่มต้น" price with its strike (`startingPrice` in `horo-fe/src/features/shop/offer-display.ts`).

| Offer | Price | Anchor | Shown | Per ticket |
| --- | --- | --- | --- | --- |
| รู้ใจ 1 (`heart_1_99`) | 99 | 200 | ลด 50% | 99 |
| รู้ใจ 3 (`heart_3_199`) | 199 | 600 | ลด 65% | 66 |
| รู้ใจ 5 (`heart_5_299`) | 299 | 1,000 | ลด 70% | 60 |
| รู้ใจ 3, special (`event_heart_3_99`) | 99 | 600 | ลด 80% | 33 |
| ดวงเดือน 1 (`monthly_1_199`) | 199 | 500 | ลด 60% | 199 |
| ดวงเดือน 3 (`monthly_3_399`) | 399 | 1,500 | ลด 70% | 133 |
| ดวงเดือน 12 (`monthly_12_1199`) | 1,199 | 6,000 | ลด 80% | 100 |
| ดวงเดือน 1, special (`event_monthly_99`) | 99 | 500 | ลด 80% | 99 |
| ดูเพิ่ม 10 ครั้ง (`compat_check_10`) | 99 | 200 | ลด 50% | 9.9 |
| หนึ่งเดือน หนึ่งใจ (`bundle_pair_249`: ดวงเดือน 1 + รู้ใจ 1) | 249 | 700 | ลด 60% | |
| สามเดือน สามใจ (`bundle_full_449`: ดวงเดือน 3 + รู้ใจ 3) | 449 | 2,100 | ลด 75% | |

The monthly offer ids encode their price, so 199 and 399 are new offers that superseded `monthly_1_249` and `monthly_3_447`
(published terms are locked; `SEED_SUPERSEDES` in `horo-be/src/lib/catalog.ts` archives the old ones in the seed call that
inserts the new). The old ids stay readable on past purchases, the ledger and analytics.

Bundles are the product `bundle_set` (type `bundle`, `horo-be/src/lib/bundles.ts`). A bundle is one set: its offer has
`units` 1 and carries `savingMoo` (parts at everyday offers minus its price: 49 and 149), so the Shop says "ประหยัด N มู"
and never shows a price per ticket. The tie to know: ดวงเดือน 1 and หนึ่งเดือน หนึ่งใจ both show 60%, so "single below bundle" holds
strictly for the same item (1 < 3 < 12, 1 < 3 < 5) and for ตั๋วรู้ใจ 1 against the bundles, and ties for ตั๋วดวงเดือน 1 against
the pair.

Top-up ladder (`OFFERED_PACK_IDS`): ฿99 = 99 (`p100`), ฿199 = 199 (`p199`), ฿299 = 299 (`p299`), ฿449 = 449 + 22 (`p450`),
฿999 = 999 + 200 (`p999`; 1,199 is exactly the 12-ticket price). Old pack ids stay in `pricing.ts` (`p150`, `p250`, `p300`,
...) so orders and history still resolve; an id never changes meaning.

Tests that hold the table: `horo-be/tests/shop.test.ts` (every seeded offer, percent a multiple of 5, single below bundle,
special deeper with the same anchor, bundle purchase and refund, supersede), `tests/sale-events.test.ts` (anchor math),
`tests/wallet.test.ts` (the ladder).

## Changing a price: checklist

1. Edit `SEED_OFFERS` and, for a new price, add the superseded id to `SEED_SUPERSEDES` (never edit a published offer's price). A new product or pack needs its list price in `list-prices.ts`; a new bundle needs its parts in `bundles.ts`.
2. Keep `MONTHLY_PASS_OFFER_ID` style constants (`lib/shared/types/shop.ts`, copied into `horo-fe/src/lib-packages/shared/types/`) and horo-admin's `MONTHLY_REGULAR_OFFER_IDS` in step. horo-admin keeps its own copy of the anchors, offer ids and packs in `horo-admin/src/lib/shop/price-set.ts` (and its test): mirror every price change there, or the admin pricing panel flags a mismatch.
3. Run the pricing tests (backend catalog tests, `offer-display.test.ts`) and look at the Shop and one mini shop dialog in dev.
4. Update this page, `horo-be/docs/shop.md` and `horo-be/docs/wallet.md` if packs changed, and log the decision.
5. Production: push-first deploy; new offers are rows inserted by the catalog seed, no `db:migrate` (see `horo-be/scripts/ensure-migrations.md`).

## Done when

A new or changed price passes the steps in "How a price is made" and the checklist above, shows the same on the Shop card, the Shop dialog and the mini shop, and this page and the decision log name the new number.

FRESH before → after (2026-10-24, planned → live): F 3→3 (indexed in docs/README.md, wording updated) · R 3→2 (the table and rules now
state built behaviour and match `list-prices.ts`, `catalog.ts` seed and the horo-be tests, but the horo-fe `startingPrice`
claim was not re-checked and nothing is deployed, so it is not a verified 3) · E 2→2 (one longer section, no new bulk) · S 3→3
(still one pricing spec; shop.md and wallet.md own the mechanics) · H 2→3 (every row of the table names its offer id, the
checklist names `list-prices.ts` and `bundles.ts`, the tests that hold the table are listed). Total 13/15 (B) → 13/15 (B).
