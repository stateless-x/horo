# เซียมซี: build plan

Status: plan, not built. Date: 2026-11-17.
Copy: [2026-11-17-siamsi-copy-draft.md](2026-11-17-siamsi-copy-draft.md) (owner's version, 28 ใบ, tiers 7/7/7/7).
Decision log: ~/product-decisions/horo/2026-11-17-feature-9moo-sink.md.

## What the reader gets

A signed-in reader thinks of one matter, shakes, and draws one of 28 fixed ใบ. A draw costs 9 มู, and a reader can draw
as often as they like (unlimited, owner decision 2026-11-17). The ใบ shows its name, its caption and its short text. The reader can keep it in history and
share it as an image. A ร้าย ใบ is never undone or lifted by a paid way; the reader can only draw again for another 9 มู.

## Flow (screens)

1. **Ask.** "ตั้งจิตนึกถึงเรื่องที่อยากถาม", with the mascot praying (`loader/heart-pray-loop`, the animated one). One
   button: เขย่าเซียมซี, with the 9 มู price on `CurrencyImage`.
2. **Confirm.** The existing `SpendConfirmSheet` (balance, 9 มู, what's left). If the balance is short, the existing
   402 `insufficient_balance` path sends the reader to top up, as other spends do.
3. **Shake (owner 2026-11-17, revised): no button, hold anywhere on the stage (hint กดค้างไว้เพื่อเขย่า).** The
   cylinder shakes wildly and spins under a simple gravity model; the longer the hold, the more it spins, and the
   sticks dance like entropy. Nothing is chosen while holding. Letting go after about 0.7 s fires the draw; the stick
   with the server's number shoots out. A shorter release does nothing. Payment was confirmed in step 2, before the
   shake. Revised again (owner): the cylinder follows the finger or mouse while held, so the reader performs the
   shake; physics reacts to the real motion (and device motion where allowed). The mascot never shakes; on the
   result it just appears, after the stick's number rolls and lands on N. Built: the cylinder moves with the finger
   relative to the press point, leans into the drag and lags at the top; sticks feel gravity minus the cylinder's
   acceleration; a still or keyboard hold gives a slow-growing jitter; dragging past the stage keeps the hold (pointer
   capture). The reveal rolls 1 to 28 for about 0.9 s and lands on N. iOS motion permission is asked from the
   เขย่าเซียมซี button click, never during the hold. No-WebGL fallback: an SVG cylinder with the same model.
   Earlier version, superseded: A 3D bamboo cylinder with sticks, drawn with `three`.
   The reader presses and holds: the cylinder tilts and shakes harder the longer they hold, and the sticks rattle.
   Letting go early settles it back with nothing charged or drawn. After about 1.5 s of holding, the draw request
   fires and one stick slides out, showing the ใบ number the server returned, then the ใบ opens. Device motion needs an
   iOS permission prompt, so it waits for a later step.
4. **ใบ.** The mascot holding a scroll (`mascot/oracle-scroll`), then the ใบ number and tier, the name, the caption in
   italics and the text in short lines. Buttons: แชร์ and เก็บไว้. The draw is already saved; เก็บไว้ just closes.
5. **Again.** Reopening shows the latest ใบ, a button to draw again (9 มู, a fresh `drawKey` per shake) and a list of past draws.

## Existing assets to use (checked in horo-fe/public/assets/art)

| Moment | Asset | Why |
| --- | --- | --- |
| Ask / think of the matter | `loader/heart-pray-loop` (still: `heart-pray-still`) | the mascot praying, already animated |
| Shake (until a cylinder exists) | `loader/heart-pray-loop` speeding up, with `streak/spark-dots` and `streak/spark-sparkle4` | no new art needed |
| ใบ reveal | `mascot/oracle-scroll` | the mascot holding a rolled paper with a star: reads as a ใบเซียมซี |
| ดีมาก reveal accent | `streak/burst`, `mascot/oracle-jump` or `oracle-star` | celebration already in the set |
| ร้าย reveal accent | `mascot/oracle-thinking` or `oracle-shy` | gentle, never scary (not `startled` or `deflated`) |
| Empty history / entry card | `object/scroll-quill`, `object/lantern` | the paper and lamp of a temple visit |
| Share card background | `streak/night-sky` | the deep-sky backdrop the share cards already suit |
| Price chip | `shop/mu-crystal` via `CurrencyImage` | the มู coin as elsewhere |

Missing: a cylinder with sticks (กระบอกเซียมซี) for the shake. **Owner: make it now or later?** It would be one
asset-maker sheet in the mascot's style: the cylinder alone, the mascot shaking it, and one stick jumping out. The plan
works without it and swaps it in when it exists.

## Design

**Chosen: the 28 ใบ live in code, and each draw is one row in a new table, charged with the existing wallet spend in the
same transaction.** This beat keeping ใบ in the database with a horo-admin editor: the set is fixed, the owner edits
copy in the repo, and an editor would add a page and a write API for text that changes rarely. It also beat storing the
draw only in the ledger, because a ledger row has no place for the ใบ number and history would have to parse refIds.

ADR-lite: content = server-only constant in horo-be `src/lib/siamsi-slips.ts`; types only in `lib/shared/types/siamsi.ts`;
state = `siamsi_draws`; money = `wallet.spendAmountWithin`. Content stays server-side so the 28 texts are not readable
in the client bundle before paying, and a copy edit is one horo-be deploy instead of two submodule bumps. Revisit if the
owner wants to swap ใบ without a deploy (then a table behind horo-admin, as feedback sets did).

Layout follows streak, not `src/systems/`: systems are reading products with a horo-fe registry (`src/lib/systems.ts`)
that would put เซียมซี in the header tabs. Streak (`src/routes/streak.ts` + `src/lib/streak.ts`) is the nearest
feature: wallet credits or spends on a Bangkok-day rhythm.

### Backend (horo-be)

- **Content:** `src/lib/siamsi-slips.ts`: `SIAMSI_SLIPS: { no, tier: 'great' | 'good' | 'middle' | 'bad', name,
  caption, lines: string[] }[]`, 28 entries copied from the copy draft. Responses carry only the ใบ the reader drew.
- **Types:** `lib/shared/types/siamsi.ts` (`SiamsiState`, `SiamsiDraw`, `SiamsiSlip`), then `bun run sync:types`.
- **Day:** `getTodayBangkokString` from `lib/shared/utils/date`, injected as `today` the way `streakRoutes` does, so
  tests can pin the day.
- **Table** `siamsi_draws`: `id`, `user_id`, `draw_key` (client UUID), `draw_date` (Bangkok YYYY-MM-DD, display), `slip_no`, `ledger_id`, `created_at`.
  Unique `(user_id, draw_key)`. Additive, so `drizzle-kit push` applies it at deploy.
- **Price:** `PRODUCT_PRICES.siamsi_draw = 9`, added to `SpendableProductId`. The spend's refId is `siamsi:<draw_date>`.
  The existing unique spend index then also prevents a second charge on the same day.
- **Flag:** `siamsi`, audience `reader`, category `extras`, **defaultEnabled false**. Routes use `requireFeature('siamsi')`.
- **Routes** (`src/routes/siamsi.ts`, rules in `src/lib/siamsi.ts`, mounted beside streak):
  - `GET /api/siamsi` → `{ enabled, price, balance, date, latest: Draw | null, history: Draw[], nextCursor }` (last 30).
  - `POST /api/siamsi/draw { expectedPrice, drawKey }` → one transaction: lock the wallet, return the draw for this
    `drawKey` (a client UUID per shake) if it exists (a retry or a second tab costs nothing), otherwise pick `slip_no` with `crypto.randomInt(1, 29)`, spend 9,
    insert the draw. Returns `{ draw, balance, charged }`. 402 on a short balance, 409 `price_changed`.
- **Wallet history:** the spend row reads "เซียมซี ใบที่ N".
- **Refunds:** none by code. Admin refunds use the existing `refund-spend`. A refund is per draw (ref_id `siamsi:<drawKey>`), keeps the draw in history and never blocks new draws.
- **Analytics:** `siamsi_opened` (surface), `siamsi_drawn` (tier, never the text), `siamsi_shared` (platform). These
  are aggregate events like the others.

### Frontend (horo-fe)

- `src/features/siamsi/`: `use-siamsi.ts` (state and draw), `siamsi-sheet.tsx` (ask, shake, ใบ),
  `siamsi-slip.tsx` (the ใบ card), `siamsi-history.tsx`.
- **Entry points (owner to confirm):**
  1. A card on the daily page.
  2. The feedback letter's thank-you: "+9 มู เสี่ยงเซียมซีได้ 1 ครั้ง".
  3. Later: the โบนัส goal row once the balance reaches 9.

  A route of its own (`/dashboard/siamsi`) is optional; a sheet over the daily page is enough for the first release.
- **Share:** a new `kind: 'siamsi'` in `src/lib/share-card/cards.ts`, drawn on canvas like `today` and `monthly`.
  It shows the name, caption, tier and the สายมู wordmark. The full text stays in the app, so sharing is the hook.
- **3D cylinder:** `src/features/siamsi/siamsi-cylinder.tsx`, plain `three` (new dependency, no react-three wrapper),
  loaded with a dynamic import only when the sheet opens, so no other page pays for it. Geometry made in code (a
  cylinder with a wood-tone material, about 20 thin sticks with rounded tops, a red band), no model files. Pixel ratio
  capped at 2, renderer disposed on close, render loop stopped while idle. Hold = pointer down on the canvas or a
  button under it (keyboard: hold Space/Enter).
- **Fallbacks:** no WebGL → the praying mascot with the same hold-to-shake button and a 2D shake. Reduced motion →
  no shaking; a hold fills a ring, then the ใบ fades in.
- **Overlays:** the daily page already queues the streak claim sheet, the daily gift and the envelope. The เซียมซี sheet
  registers with the overlay queue (`useRegisteredDialog`), like `SpendConfirmSheet`, and never opens by itself.
- **Feedback thank-you line** shows only while the flag is on.

## Build steps (each mergeable and revertable)

| # | Step | Test |
| --- | --- | --- |
| 1 | Server content `siamsi-slips.ts`, shared types + sync, content test: 28 ใบ, tiers 7/7/7/7, numbers 1 to 28 unique, no emoji, dash, middle dot, quote mark or digit in the text, each ใบ 150 to 250 characters | unit (`bun test`) |
| 2 | Flag `siamsi` (off), price, table, `/api/siamsi` GET + draw | integration on the `horo_test` DB: unlimited draws (a new drawKey charges, the same drawKey is free), short balance 402, flag off 503, refund never blocks a new draw, two parallel draws with one drawKey charge once, a failed spend leaves no draw row, draws at 23:59 and 00:00 Bangkok get different `draw_date`s |
| 3 | Frontend sheet: ask → confirm → shake → ใบ, today's ใบ, history, with the assets above | component tests like `streak-claim.test.tsx`; local preview at 375 px, light and dark |
| 4 | Share card `siamsi` | `share-card.test.ts` case + a rendered PNG checked by eye |
| 5 | Entry points + analytics events + feedback thank-you line | unit for events; preview check |
| 6 | three.js cylinder with hold-to-shake, replacing the step 3 placeholder | component test for hold/release logic (timers, not WebGL); preview on a phone-size viewport; frame rate and memory after opening and closing the sheet five times |

Ship order: steps 1 and 2 on horo-be (flag off, invisible), then 3 to 5 on horo-fe. Turn the flag on in horo-admin for
the owner's account first, then everyone.

**Rollback:** flag off hides it everywhere and stops charging. Draws and spends stay in the database. The table is
additive, so removing it later is a manual destructive step (see the project's CLAUDE.md).

## Checks before turning it on

- `bun test` and `bun run type-check` in horo-be and horo-fe; the horo-be build runs the tests (Railway).
  Tests run against `horo_test` with `REDIS_URL=` set to local Redis (`.env.local` points at prod Redis); nothing
  touches live services.
- `bun run sync:types --check` passes.
- Local stack (horo-be-dev-localdb, local Redis), horo-fe against it: draw from the real UI with the seeded dev user; spend row and draw row match; second
  tap the same day costs nothing; wallet history shows "เซียมซี ใบที่ N".
- Probe the new route on Railway after deploy to prove the new image is live.

## Tracking (from the decision log)

| Metric | Baseline | Target | Review |
| --- | --- | --- | --- |
| Readers with a first spend of any kind / active readers | read before launch | up | 4 weeks after release |
| Draws per active reader per week | 0 | 1 or more | 4 weeks after release |
| Ticket exchanges paid partly with earned มู | read before launch | not down | 4 weeks after release |

## Open questions for the owner

1. Cylinder: decided, three.js with hold to shake (owner 2026-11-17).
2. Entry points: daily page card and feedback thank-you line for the first release?
3. Must the reader open today's ดวงวันนี้ before drawing, as check-in requires? Recommended: no.
4. History: decided, keep every draw, paged (`GET /api/siamsi/history`); each draw is also a row in the wallet
   transaction history labelled เซียมซี ใบที่ N (owner 2026-11-17).
5. ใบ 26 caption: ความคิดถึง (missing someone) or ความคิด (thought)?
