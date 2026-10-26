# ChatGPT image prompts: beliefs picker cards and survey letter (2026-10-26)

Pictures for the "คุณนับถืออะไรบ้าง" sheet (horo-fe `src/features/beliefs/`). Every card already works without its picture: it shows a soft lilac square with a small glyph. A picture appears as soon as its file is in the right folder. No code change is needed.

## How to use this file with ChatGPT

1. Open a new ChatGPT chat with image generation.
2. Attach the same three reference images to every request: the moon ticket, the heart ticket, and one mascot picture (the same set as `docs/chatgpt-image-prompts-monthly.md`). They set the style.
3. Paste the INSTRUCTION below once, as the first message.
4. Then send the images one at a time: paste one SUBJECT, then the STYLE block right after it, in the same message.
5. Check each image against the checklist at the bottom. If it is wrong, reply with the fix sentence in the same chat.
6. Save each image under the filename in its heading (`<id>.png`) and follow "From PNG to the file the site reads".

## INSTRUCTION (paste once, first)

```text
You are my illustrator for a Thai astrology website. I will send you one subject at a time. For every image: use the attached reference images as the exact style guide (same outline, same palette). Output exactly one square PNG, 1024 x 1024 pixels, on a perfectly flat solid background color #F2EFFE with no gradient, no shadow on the background and no scenery, because I cut the background out afterwards. Never add text, letters, numbers, logos, a mascot or a human face. Sacred figures are drawn only as small stylized statues or symbols, respectfully, never as a real person, never a photo of a real monk, never a caricature. Wait for my next subject.
```

## STYLE block (paste after every SUBJECT)

```text
Square icon illustration, exactly 1024 x 1024 pixels, for a Thai astrology website. Background: one perfectly flat solid color #F2EFFE, no gradient, no vignette, no shadow on the background, no scenery, so it can be cut out cleanly. Match the attached references exactly in style: soft purple and gold palette (#6B21A8, #A855F7, #E9D5FF, warm gold), the same wobbly dark-brown outline, hand-drawn storybook line, flat soft shading, no photorealism, no neon. One object only, centered, filling about 70 percent of the width, with at least 120 px of clean margin on every side, because it is shown small (about 100 px) inside a rounded square. Calm and respectful. No text, no letters, no numbers, no logos, no mascot, no human face.
```

## SUBJECTS: step 2, tab พระ (`พระและครูบาอาจารย์`)

### `luang_por_sothon.png` (หลวงพ่อโสธร)
```text
Subject: a small golden seated Buddha statue in meditation posture, simple rounded shape, on a lotus base, with a soft halo. A stylized statue, no facial detail beyond a calm closed-eye curve.
```
### `luang_por_rai_khing.png` (หลวงพ่อวัดไร่ขิง)
```text
Subject: a small golden seated Buddha statue, hands in the earth-touching gesture, on a tall tiered base, a small temple roof tip behind it. Stylized statue only.
```
### `luang_por_tan_jai.png` (หลวงพ่อทันใจ)
```text
Subject: a small golden seated Buddha statue on a simple pedestal with a tiny white-and-gold garland (พวงมาลัย) draped on the base and two small sparkles. Stylized statue only.
```
### `phra_phuttha_chinnarat.png` (พระพุทธชินราช)
```text
Subject: a small golden seated Buddha statue in front of an ornate golden flame-shaped arch frame (the arch is the recognizable part), simple and tidy. Stylized statue only.
```
### `birth_day_buddha.png` (พระประจำวันเกิด)
```text
Subject: seven tiny golden Buddha statues in a gentle arc, each on a small base colored for a weekday (red, yellow, pink, green, orange, sky blue, purple). Exactly seven, all the same size. Stylized statues only.
```
### `rue_si.png` (พระฤๅษี)
```text
Subject: a stylized hermit's tall pointed crown hat (ชฎาฤๅษี) in tiger-stripe pattern resting on a small cushion, with a short wooden staff leaning beside it. No person.
```

## SUBJECTS: tab เทพจีน

### `guan_yin.png` (เจ้าแม่กวนอิม)
```text
Subject: a small white porcelain vase with a willow branch and a soft halo behind it, standing on a lotus. The vase and willow are the symbol; no figure.
```
### `chai_sing_ia.png` (ไฉ่ซิ้งเอี้ย)
```text
Subject: a small golden ingot (หยวนเป่า boat-shaped ingot) on a red cushion with three gold coins and a tiny red ribbon. No figure.
```
### `guan_gong.png` (เทพเจ้ากวนอู)
```text
Subject: a stylized Chinese crescent-blade halberd (guandao) standing upright with a red tassel, beside a small green cloth flag with no writing. No figure.
```
### `tai_sui.png` (ไท้ส่วยเอี้ย)
```text
Subject: a small red-and-gold Chinese paper talisman scroll hanging from a gold cord with a tassel, the scroll blank (no characters), with a soft protective glow. No figure, no writing.
```
### `moon_worship.png` (ไหว้พระจันทร์)
```text
Subject: a full pale-gold moon above a small low table with two round mooncakes and a tiny teapot. Calm night feeling, still on the flat background.
```

## SUBJECTS: tab เทพฮินดู

### `ganesha.png` (พระพิฆเนศ)
```text
Subject: a small stylized golden elephant-headed statue in a seated pose on a lotus, simple rounded shapes, with a tiny round sweet (โมทกะ) on a plate in front. A statue, kept simple and respectful.
```
### `lakshmi.png` (พระแม่ลักษมี)
```text
Subject: a large pink lotus in full bloom with a few gold coins falling softly into it. No figure.
```
### `uma.png` (พระแม่อุมาเทวี)
```text
Subject: a small golden trident (ตรีศูล) standing in front of a red-and-gold marigold garland circle. No figure.
```
### `phra_phrom.png` (พระพรหม)
```text
Subject: a small golden four-sided shrine pavilion (ศาลพระพรหม style) with a pointed roof, a garland of yellow marigolds at its base, and two tiny wooden elephant figurines beside it. No figure inside the shrine, only soft light.
```
### `phra_trimurti.png` (พระตรีมูรติ)
```text
Subject: a small golden shrine with a heart-shaped soft red glow inside, nine red roses tied in a bundle at its base, and three tiny red candles. No figure, only the glow. Romantic but calm.
```

## SUBJECTS: tab ผู้คุ้มครอง

### `naga.png` (พญานาค)
```text
Subject: a stylized green-and-gold serpent naga coiled around a small lotus, head raised gently, friendly, ornamental Thai scales. Cute and respectful, not scary.
```
### `wessuwan.png` (ท้าวเวสสุวรรณ)
```text
Subject: a stylized giant's ceremonial club (กระบอง) standing upright with a small gold crown resting beside it on a cushion. No figure.
```
### `ta_khai.png` (ตาไข่ / ไอ้ไข่)
```text
Subject: a small wooden fighting rooster figurine next to a tiny red bottle of red soda with a straw, on a small wooden base. No child figure.
```
### `phra_rahu.png` (พระราหู)
```text
Subject: a stylized dark navy crescent moon being gently held by a soft black-and-gold cloud shaped like a curl, with a few tiny stars. Mysterious but gentle, no monster face.
```

## SUBJECTS: tab เครื่องราง

### `mae_nang_kwak.png` (แม่นางกวัก)
```text
Subject: a small red-and-gold beckoning hand charm (a raised cupped hand, as on a lucky shop charm) on a red cushion with two gold coins. Only the hand, no figure.
```
### `kuman_thong.png` (กุมารทอง)
```text
Subject: a small golden topknot hairpin and a tiny red bottle of red soda with a straw on a little gold tray, with a soft warm glow. No child figure.
```

## SUBJECTS: step 3, ของมูที่สนใจ

### `wearable.png` (เครื่องราง เครื่องประดับ)
```text
Subject: a bracelet of round gemstone beads in purple, rose and gold, with one small gold amulet charm hanging from it.
```
### `worship.png` (ชุดไหว้ ของถวาย)
```text
Subject: a small offering tray with a white-and-gold garland, three incense sticks in a tiny holder and one lit candle.
```
### `home_desk.png` (ของแต่งบ้าน แต่งโต๊ะ)
```text
Subject: a tiny desk corner: a small potted plant, a little gold lucky cat figurine and a mini desk calendar with no numbers.
```
### `digital.png` (วอลเปเปอร์ มงคล)
```text
Subject: a smartphone standing upright showing a soft purple-and-gold lucky pattern wallpaper (stars and a lotus), no text on the screen.
```
### `cards_tools.png` (ไพ่ดูดวง)
```text
Subject: three tarot-style cards fanned out face down, purple backs with a gold star and moon pattern, no text.
```
### `scent_beauty.png` (น้ำหอม บิวตี้มงคล)
```text
Subject: a small round perfume bottle in lilac glass with a gold cap next to a gold lipstick, one tiny sparkle.
```
### `lucky_color_wear.png` (เสื้อผ้าสีมงคล)
```text
Subject: a small folded T-shirt stack in three colors (purple, pink, gold) tied with a ribbon.
```
### `lucky_number.png` (เบอร์มงคล)
```text
Subject: a SIM card and a small gold four-leaf clover charm next to it, with a few tiny sparkles. No digits anywhere.
```

## SURVEY LETTER (the card on the locked monthly page)

`letter-closed.png` is DONE (owner art: cream envelope, lilac wax seal with a gold star, dark-brown outline, tilted about -10deg). Only the optional open version is left. If it exists, the card cross-fades from closed to open while it opens; without it the card works as it is.

### `letter-open.png` (optional, 1111 x 868 or larger, same 1.28 : 1 shape)
```text
Subject: the SAME envelope as the attached closed-envelope picture (attach it as a 4th reference): cream paper, lilac wax seal with a gold star, the same dark-brown outline, but now LEVEL (not tilted), the top flap opened upward, and a plain cream letter paper sticking out of it about one third of its height, with three faint lines and no writing. Keep exactly the same size and the same position on the canvas as the closed one so they line up. Background perfectly flat #F2EFFE. Landscape canvas with the same proportions as the closed picture (1.28 : 1), not square.
```

## Checklist when each image comes back

- No text, letters, digits or real faces anywhere. If there are, reply: `redo with no text, no digits and no face, only the object`.
- Background is truly flat #F2EFFE. If not, reply: `redo with a perfectly flat #F2EFFE background, no gradient, no shadow under the object`.
- Sacred figures are a small stylized statue or a symbol, calm and respectful.
- `birth_day_buddha.png`: exactly 7 statues.
- One object group, centered, at least 120 px margin; it must still read at 100 px.
- `letter-open.png`: lines up with the closed envelope when the two are laid on top of each other.

## From PNG to the file the site reads

Same tools as the monthly art (the sticker-sheet-slicer skill cuts out the #F2EFFE background; `assets/sticker-sheets/<date>-<name>/` keeps each batch). For this set:

1. Put the PNGs in `horo-fe/assets/sticker-sheets/2026-10-26-beliefs/` (keep the originals there).
2. Cut out the background of each one with the slicer as a one-cell sheet:
   `python3 ~/skills/skills/sticker-sheet-slicer/scripts/slice_sheet.py horo-fe/assets/sticker-sheets/2026-10-26-beliefs/<id>.png --grid 1x1 --names <id> --auto --out /tmp/beliefs-cut/<id>`
   Read `report.json` (`qa.pass` must be true); the transparent master is `/tmp/beliefs-cut/<id>/png/<id>.png`.
3. Make the 256 x 256 WebP the cards read:
   `magick /tmp/beliefs-cut/<id>/png/<id>.png -trim -resize 232x232 -gravity center -background none -extent 256x256 PNG32:/tmp/<id>-256.png && cwebp -q 90 -alpha_q 100 /tmp/<id>-256.png -o horo-fe/public/assets/beliefs/<id>.webp`
4. Open the sheet locally: the picture replaces the placeholder. Commit the WebP files.

Do NOT run `bun run build:art` for these: it deletes and rebuilds `public/assets/art/`. The card pictures live in `public/assets/beliefs/` on purpose so they survive it.

The survey letter is different: the owner's `letter-closed.webp` (640 x 500) sits in `horo-fe/public/assets/survey/`, with its master in `horo-fe/assets/art/survey/letter-closed.png`. For the optional open one: cut the background the same way, then `magick <cut>.png -resize 640x500 -gravity center -background none -extent 640x500 PNG32:/tmp/letter-open.png && cwebp -q 90 -alpha_q 100 /tmp/letter-open.png -o horo-fe/public/assets/survey/letter-open.webp`, and keep the master as `horo-fe/assets/art/survey/letter-open.png`. Caution: the next `bun run build:art` will replace the plain `letter-*.webp` files with hashed ones; when that happens, switch `SURVEY_LETTER` in `horo-fe/src/lib/art/index.ts` to `art('survey/letter-closed')` and `art('survey/letter-open')`.

## Where each image is used

| Files | Folder | Used for |
|---|---|---|
| step 2 `<id>.webp` (22 files, ids above) | `horo-fe/public/assets/beliefs/` | picture cards in the five tabs of step 2, 256 x 256, transparent |
| step 3 `<id>.webp` (8 files) | `horo-fe/public/assets/beliefs/` | picture cards of ของมูที่สนใจ, 256 x 256, transparent |
| `letter-closed.webp` (done), `letter-open.webp` (optional) | `horo-fe/public/assets/survey/` | the envelope on the locked monthly page's survey card, 640 x 500, transparent |

Step 1 (religions) stays as text chips on purpose: religious symbols for every faith (and none for Islam) are easy to get wrong, and five short words read fine.
