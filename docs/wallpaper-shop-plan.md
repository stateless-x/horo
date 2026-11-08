---
type: PLAN
status: in progress 2026-10-11. horo-be increments 1–2 (buy/claim/own, streamed download, admin CRUD routes) built and reviewed in worktree horo-be-wallpaper (branch feat/wallpaper-shop, uncommitted). horo-admin screen in progress (worktree horo-admin-wallpaper). B0 (Bunny) and horo-fe not started. Originals are streamed by horo-be from a private storage zone with no pull zone; §3's signed-URL design is superseded.
scope: Wallpapers sold for มู (or free) in the Shop, uploaded and replaced from horo-admin, originals protected on Bunny
last_reviewed: 2026-10-10
owner: product
extends: docs/shop-catalog-plan.md (same catalog, new product type)
---

# Wallpaper shop

Wallpapers are a new Shop category inside the existing catalog
([shop-catalog-plan.md](shop-catalog-plan.md)), not a separate system. One purchase gets one wallpaper. Some
wallpapers are free. horo-admin uploads them and can swap the image at any time.

When this doc and the code disagree, the code wins; fix this doc in the same commit.

| § | Section |
|---|---|
| 1 | What "can't download" can and can't mean |
| 2 | Owner decisions so far |
| 3 | Storage: Bunny |
| 4 | Data model |
| 5 | Flows: upload, replace, buy, claim free, download |
| 6 | API contract |
| 7 | Frontend anti-save layer |
| 8 | Build plan |
| 9 | Open questions |

---

## 1. What "can't download" can and can't mean

**Blocking right-click and inspect is only a deterrent.** Anything the browser shows can be saved, through
devtools, the network tab, "save page", or a phone screenshot. No website can stop that. Devtools detection is
unreliable, breaks for real users, and is skipped here.

The protection that works is: **the full-resolution original never reaches anyone who doesn't own it.**

| Who | What they get |
|---|---|
| Visitor, or a reader who hasn't bought it | A **preview** only: about 720 px on the long side, JPEG quality around 70, with a large semi-transparent **สายมู.com** watermark baked into the pixels in the centre. A screenshot of the preview is a watermarked, low-res image, which is worth nothing |
| Owner (bought it, or claimed a free one) | The clean original, through a **signed Bunny URL that expires in 5 minutes**, issued only after horo-be checks ownership |

The browser deterrents in §7 go on top of that: they stop the casual right-click → "Save image".

## 2. Owner decisions so far (2026-10-10)

| # | Decision |
|---|---|
| W1 | One purchase gets one wallpaper. No bundles |
| W2 | Some wallpapers are free (price 0). They still need sign-in to claim, so the original stays gated |
| W3 | The preview has a large semi-transparent **สายมู.com** watermark in the middle |
| W4 | Digital wallpapers may be sold for มู. The "merch never in มู" rule covers physical goods only |
| W5 | Wallpapers sit behind a horo-admin feature flag `shop_wallpapers`, **default off** |
| W6 | Storage is **Bunny** (the owner already has an account) |

## 3. Storage: Bunny

horo-be has no persistent disk on Railway, so files can't live there. 3–10 MB images in Postgres would bloat the
database and its backups. Bunny is a good fit: Storage Zones for files, Pull Zones (CDN) in front, and **Token
Authentication** on a Pull Zone gives expiring signed URLs.

**Make new zones; don't reuse an existing one.** Separate zones mean a misconfigured CDN or a leaked key on another
project can't expose the originals, and the reverse.

| Bunny resource | Name (suggested) | Setting |
|---|---|---|
| Storage Zone | `horo-wallpapers` | Region close to Thailand (Singapore). Holds `originals/` and `previews/` |
| Pull Zone A | `horo-wp-preview` | Origin `horo-wallpapers`. **No token auth.** Serves `previews/` only (set an edge rule to block any path outside `/previews/`) |
| Pull Zone B | `horo-wp-original` | Origin `horo-wallpapers`. **Advanced Token Authentication ON** (HMAC-SHA256, `HS256-` tokens; Basic/MD5 is deprecated and `src/lib/bunny.ts` doesn't sign for it). Serves `originals/`. Never linked from a page; URLs are signed per download |

Env vars on horo-be (Railway) only. horo-fe and horo-admin never see them:

```
BUNNY_STORAGE_ZONE=horo-wallpapers
BUNNY_STORAGE_HOST=sg.storage.bunnycdn.com     # matches the zone's region
BUNNY_STORAGE_KEY=<storage zone password>        # write access to the files
BUNNY_PREVIEW_HOST=horo-wp-preview.b-cdn.net
BUNNY_ORIGINAL_HOST=horo-wp-original.b-cdn.net
BUNNY_ORIGINAL_TOKEN_KEY=<pull zone B token key> # signs download URLs
```

**File names are unguessable.** Every upload is stored as `originals/<uuid>.<ext>` and `previews/<uuid>.jpg`,
with a new uuid per version. Even if token auth were switched off by mistake, nobody can list or guess an original.

## 4. Data model (horo-be `lib/db/schema/shop.ts`)

All additive, so `drizzle-kit push` applies it without prompting.

```
lib/shared/types/shop.ts
  SHOP_CATEGORIES  += { id: 'wallpaper', name: 'วอลเปเปอร์' }
  PRODUCT_TYPES    += 'digital_download'

catalog_products  (existing)
  + current_asset_id uuid null fk → catalog_assets.id   (required to publish a digital_download)

catalog_assets          -- insert-only; one row per uploaded version
  id uuid pk
  product_id text fk
  original_path text     'originals/<uuid>.png'
  preview_path text      'previews/<uuid>.jpg'
  width int, height int, bytes int, mime varchar(32)
  sha256 text            spots a duplicate upload
  actor_*, created_at

catalog_ownerships      -- insert-only; "this reader owns this product"
  id uuid pk
  user_id, product_id
  purchase_id uuid fk → catalog_purchases.id
  created_at
  unique (user_id, product_id)          -- the guarantee against buying twice

catalog_downloads       -- insert-only; one row per signed URL issued (abuse visibility, stats)
  id uuid pk, user_id, product_id, asset_id, created_at
```

Why ownership is its own table: `catalog_purchases` is unique on `(user_id, idempotency_key)`. A second tap with a
new key would buy the same wallpaper twice. `unique (user_id, product_id)` makes that impossible, and the purchase
transaction checks it first so the reader sees "you already own this" instead of a constraint error.

**Replacing an image never changes what was sold.** A replacement adds a new `catalog_assets` row and moves
`current_asset_id`. Owners download the current version. Old files stay in Bunny (insert-only), so a bad upload can
be rolled back by pointing `current_asset_id` at the previous row.

## 5. Flows

**Upload / replace (horo-admin → horo-be → Bunny)**

1. Admin opens a wallpaper product in horo-admin Shop and drops an image (PNG/JPEG/WebP, max 20 MB, at least
   1080 px on the short side).
2. The horo-admin **server** forwards it to `POST /internal/shop/products/:id/assets`, with the actor from its own
   session (plan trap W6: the form never supplies the actor).
3. horo-be checks the type and size, reads the dimensions, and builds the preview with `sharp`: resize to 720 px,
   composite the watermark, JPEG q70, strip metadata.
4. horo-be uploads both files to Bunny (Storage API `PUT`), then inserts the `catalog_assets` row and moves
   `current_asset_id` in one transaction. If Bunny fails, nothing is written to the DB.
5. horo-admin shows the new preview. The old version stays listed with a "use this version" button.

**Watermark.** A pre-rendered transparent PNG of **สายมู.com** (white, about 35% opacity, a soft dark shadow so
it reads on light and dark wallpapers), sized to about 60% of the preview width and composited in the centre. It
uses a PNG rather than SVG text because the slim Docker image has no Thai font, and SVG text would render as boxes.
The PNG is committed in horo-be `assets/watermark.png`.

**Buy (paid)**: the existing `catalog.purchase()`, unchanged in shape. The new `digital_download` handler inserts
the `catalog_ownerships` row inside the same transaction, so ownership commits with the spend or not at all. If
the reader already owns the product, the purchase throws `AlreadyOwned` before any spend.

**Claim (free)**: `price_moo = 0`. `wallet.spendAmountWithin` refuses a price of 0 (`src/lib/wallet.ts:234`), and
that is the right rule. Free claims take a branch in `purchase()` that writes the purchase row and the ownership
with **no ledger row**. Free claims are still capped at one per reader per wallpaper by the unique index.

**Download**: `GET /api/shop/wallpapers/:productId/download`, signed-in only.
1. Check that a `catalog_ownerships` row exists. If not, return 403.
2. Rate limit with Redis: 20 per reader per hour.
3. Insert a `catalog_downloads` row.
4. Return a Bunny token-signed URL for `originals/<current>` with a 5-minute expiry. Pull Zone B gets an edge
   rule that adds `Content-Disposition: attachment`, so desktop browsers save the file instead of opening it
   (verify in B0 that the edge rule and token auth work together).

The frontend opens that URL; the file saves to the phone. On iOS Safari, "attachment" opens the image full-screen and
the reader long-presses → "Save to Photos". The page explains that in one line.

## 6. API contract (additions)

| Route | Who | Returns |
|---|---|---|
| `GET /api/shop` | anyone | No new route. The wallpaper category is returned only when `shop_wallpapers` is on. A wallpaper `ShopProduct` gains `previewUrl` (Pull Zone A), `owned: boolean` (when signed in), `width`, `height`. eTicket keeps `imageKey` |
| `POST /api/shop/purchase` | signed in | Existing route. New refusal `already_owned` (409) |
| `GET /api/shop/wallpapers/:productId/download` | owner | `{ url, expiresAt }` |
| `GET /api/wallet/wallpapers` | signed in | The reader's owned wallpapers with `previewUrl`, for the "my wallpapers" tab |
| `POST /internal/shop/products/:id/assets` | horo-admin server | Upload a version (multipart) |
| `POST /internal/shop/products/:id/current-asset` | horo-admin server | `{ assetId }`: roll back to an older version |
| `GET /internal/shop/products/:id/assets` | horo-admin server | Version list with previews |

## 7. Frontend (horo-fe)

**No new page.** `/dashboard/shop` already renders one tab per category from `GET /api/shop`
(`src/app/dashboard/shop/page.tsx`, the `role="tablist"` block). The tab bar appears by itself once there is more
than one category, so adding `{ id: 'wallpaper', name: 'วอลเปเปอร์' }` to `SHOP_CATEGORIES` gives the
**ตั๋ว | วอลเปเปอร์** tabs. Category order follows `SHOP_CATEGORIES`, and products within a tab follow
`catalog_products.sort` (set in horo-admin).

What changes in the page:
- `ProductCard` branches on `product.type === 'digital_download'`: a portrait preview card with a price, or
  **ฟรี**, or **มีแล้ว** when `owned`. The ticket card stays as is.
- The grid uses 2 columns on mobile and 3–4 on desktop for the wallpaper tab only. Tickets keep their current layout.
- Choosing a wallpaper opens the existing product sheet (`openProduct`) with the preview, then buy, claim or
  download.

### Anti-save layer

These are deterrents for the preview. The real guard is §1.

- Draw the preview as a CSS `background-image` on a div, not an `<img>`, so "Save image as…" doesn't appear.
- Put a transparent overlay div on top, so right-click and long-press hit the overlay rather than the picture.
- `onContextMenu={e => e.preventDefault()}` on the wallpaper card and sheet only, never on the whole site, so normal
  copy and paste elsewhere still works.
- `draggable={false}`, `user-select: none`, and `-webkit-touch-callout: none` (blocks the iOS long-press menu).
- No keyboard blocking (F12 / Ctrl+Shift+I). It doesn't stop anyone, and it breaks accessibility.

## 8. Build plan

Follow the order: each step can be merged on its own.

| Step | Repo | Work | Done when |
|---|---|---|---|
| B0 | owner | Create the Bunny Storage Zone and both Pull Zones (§3), turn on **Advanced** token auth for B, and put the env vars in Railway **before** turning on `shop_wallpapers` (with the flag on and `BUNNY_PREVIEW_HOST` missing, `GET /api/shop` fails loudly) | `curl` on a test file in `originals/` without a token returns 403 |
| B1 | horo-be | Types, schema (§4), the `shop_wallpapers` flag (default off), `src/lib/bunny.ts` (upload, sign URL) with tests for the signing | `bun test` green; push applies with no prompt |
| B2 | horo-be | Asset upload + preview + watermark, the internal routes. Prove `sharp` installs and runs in the `oven/bun:1.1.38-slim` image | A Docker build runs the preview test |
| B3 | horo-be | `digital_download` handler, `AlreadyOwned`, the free-claim branch, the download route, rate limit | Tests: buy twice → one ownership, one spend; free claim → no ledger row; non-owner download → 403 |
| B4 | horo-admin | Wallpaper product form, upload, version list and rollback, the flag in สวิตช์ฟีเจอร์ | type-check, test, build pass |
| B5 | horo-fe | Wallpaper card + tab grid in the existing Shop page, preview in the existing product sheet with the §7 anti-save layer, buy/claim, "my wallpapers" in the wallet, download button | Browser test on the lock-on stack: buy, download, re-download; a non-owner sees only the preview |
| B6 | all | Turn the flag on in prod after the first wallpapers are published | A probe of the download route returns 403 for a non-owner in prod |

## 9. Open questions

| # | Question | Default if unanswered |
|---|---|---|
| Q1 | Re-download: unlimited for owners, within the rate limit? | Yes, unlimited |
| Q2 | Original format: keep exactly what was uploaded, or always convert to PNG/JPEG? | Keep the upload as is |
| Q3 | One file per wallpaper, or phone + desktop sizes as two files in one product? | One file (phone) |
| Q4 | Can an admin take a wallpaper back (refund มู, remove ownership)? | Not in v1: `refundPurchase` refuses a digital_download with 409 `not_refundable`. Support adjusts มู by hand if needed |

## 10. First drop: มูมู่ collection (draft 2026-10-11)

All four feature มูมู่ (the hooded one-eyed mascot). Every one is 9 มู, a single offer (`quantity 1`, no bonus).
Product ids use the prefix `wp_mumu_`, `sort` follows the table order. Copy follows the voice rules: plain
contemporary Thai, cute and understanding, no promise of luck or happiness.

| sort | id | name_th | description_th | offer id | price |
|---|---|---|---|---|---|
| 1 | `wp_mumu_nubdao` | มูมู่ นับดาว | มูมู่ลอยอยู่บนก้อนเมฆ นับดาวไปทีละดวง เหมาะกับคืนที่อยากให้ใจช้าลงหน่อย | `wp_mumu_nubdao_1` | 9 มู |
| 2 | `wp_mumu_namchok` | มูมู่ นำโชค | มูมู่กอดลูกแก้วไว้ท่ามกลางคริสตัลสีม่วง เป็นกำลังใจเล็ก ๆ ทุกครั้งที่เปิดจอ | `wp_mumu_namchok_1` | 9 มู |
| 3 | `wp_mumu_duchai` | มูมู่ ดูใจ | มูมู่นั่งเปิดไพ่ในห้องอุ่น ๆ สำหรับวันที่อยากถามใจตัวเองดี ๆ สักครั้ง | `wp_mumu_duchai_1` | 9 มู |
| 4 | `wp_mumu_sati` | มูมู่ สติ | มูมู่โผล่มาเตือนเบา ๆ ว่า "สติ" หยิบมือถือทีไร ได้หายใจลึก ๆ ก่อนหนึ่งที | `wp_mumu_sati_1` | 9 มู |

**Source files:** the copies received in chat are 852–941 px wide, below a modern phone screen (1170×2532 or
larger). Get the originals from ChatGPT's download button, and upscale to about 1290×2796 before upload, so a
buyer paying 9 มู doesn't get a soft image.

**Not modelled yet:** a "มูมู่" tag. Products have no tag field; the name prefix carries the collection for now.
Add a `collection` column only if a second collection arrives.
