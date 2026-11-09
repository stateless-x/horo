---
type: BRIEF
status: draft, ready to produce (not yet generated)
scope: 2-minute สายมู.com promo video focused on personalization; scene keyframes via Codex, animation via Gemini (Veo)
last_reviewed: 2026-11-08
owner: product
---

# สายมู promo: "ดวงที่อ่านจากคุณ" (2:00, 15 scenes)

One style bible, then 15 scenes of 8 seconds. Each scene has three copyable blocks:

1. **Codex** — prompt for the first-frame image (style lock repeated in full, so each call stands alone).
2. **Gemini** — image-to-video prompt for that frame (motion, camera, SFX).
3. **Script** — Thai voice-over and on-screen text, added in the edit.

When this brief and the app disagree, the app wins: only advertise what is live.

| § | Section |
|---|---|
| 1 | Production rules |
| 2 | Style bible |
| 3 | Timeline |
| 4 | Full Thai script (for the voice recording) |
| 5 | Scenes 01–15 |
| 6 | Edit and done-when |

## 1. Production rules

- **Format:** 16:9, 1920×1080, for YouTube and Facebook. For TikTok/Reels, regenerate each keyframe at 9:16 1080×1920 with the same blocks (change the `Composition` and `Output target` lines); don't crop the 16:9 frames.
- **No text in any generated image or clip.** AI image and video tools garble Thai. All Thai goes on in the edit from the Script blocks.
- **มูมู่ has no mouth.** Veo tends to add one when a character "talks", so every Gemini block forbids mouths and lip-sync. มูมู่ is heard as off-screen narration only.
- **Record the voice-over separately** (one take of section 4, warm young female Thai voice, unhurried) rather than relying on Gemini's Thai speech. Gemini clips carry SFX only; one music bed (soft kalimba / music box, about 90 BPM) runs under the whole edit.
- **Generate scene 02 first** and approve it as the key image of มูมู่ before generating the rest; attach it as an extra identity reference if later frames drift.
- **Claims allowed** (all live in the app): reading from name + birth date, plus birth time when known (it adds the Bazi hour pillar, so same date + different time reads differently); ดวงไทย × ดวงจีนปาจื้อ × นิสัย; personality is optional; free preview before sign-up; ความรัก / การเงิน / การงาน; monthly reading tab วันดีและของมู (calendar of วันที่ดวงเปิด, คนรอบตัวเดือนนี้, มูให้ถูกเดือน) and สีและเลขของคุณ; ฟังดวง (monthly); ดวงคู่.
- **Never in this ad:** wallpapers (not shipped), MBTI type codes, "แม่นที่สุด", user counts, reviews or testimonials, promises that the viewer will feel happy or that luck will change, fear or fixed-fate framing, เจ้า/ข้า. The monthly reading is paid, so only the preview and the CTA say ฟรี.
- **Sample data on screen** (ฝ้าย, มิ้นท์, 14 ก.พ. 2546) is fictional; keep the small "ข้อมูลตัวอย่าง" tag on scene 03.

## 2. Style bible

Paste this once at the start of the Codex session and the Gemini project as shared context. Every scene block below already contains what it needs, so this is reference, not a dependency.

```text
PROJECT: สายมู.com promo "ดวงที่อ่านจากคุณ" · 2:00 · 15 scenes × 8s · 16:9 1920x1080
LOOK: chiikawa-style kawaii storybook. Hand-painted gouache fill on warm cream
paper #FEFAEF with grain, thick slightly wobbly dark-brown outlines, soft blob
silhouettes, tiny limbs, peach-pink oval blush, no 3D, no gradients, no realistic
lighting. Plain paper background in every scene: no rooms, streets, landscapes,
furniture or scenery. Places are suggested by one or two props only.
PALETTE: warm cream paper #FEFAEF with grain, deep plum #2E0535, coral red #F14A4B, pale lavender #D7B4E1, mid purple #A160A0, one warm-gold accent
CAST: มูมู่ (main, narrator, one eye, no mouth) in 14 scenes; ดาวดึ๋ง in scene 05 only.
One character per scene.
MOOD: warm, curious, a little funny (ยาจก สู้ชีวิต: patched robe, winged coins
flying off), never sad, scary or preachy.
MOTION: gentle 2D picture-book animation: float, bounce, squash and stretch,
draw-on lines, twinkles. Slow camera: locked-off, slow push-in or slow pan.
SOUND: SFX only in clips; VO and one music bed added in edit.
TEXT: none in images or clips; Thai captions added in edit.
REFERENCES: /Users/purin/.claude/skills/asset-maker/assets/saimoo-eye-sticker-sheet.png
            /Users/purin/dev/horo/horo-fe/public/assets/art/mascot/ (pose renders)
            /Users/purin/dev/horo/horo-fe/public/assets/art/characters/cosmic-blob-constellation.72be2923.webp (ดาวดึ๋ง)
SAVE TO: /Users/purin/Downloads/asset-maker/saimoo-ad-personalization/
```

## 3. Timeline

| # | Time | Beat | Character / pose ref |
|---|---|---|---|
| 01 | 0:00–0:08 | Hook: ทั้งราศีได้คำทำนายเดียวกัน | มูมู่ · `oracle-peek` |
| 02 | 0:08–0:16 | แนะนำมูมู่ | มูมู่ · `oracle-hello` |
| 03 | 0:16–0:24 | บอกชื่อ วันเกิด (เวลาเกิดถ้ารู้) | มูมู่ · `oracle-presenting` |
| 04 | 0:24–0:32 | ใส่นิสัยเพิ่มได้ ไม่บังคับ | มูมู่ · `oracle-thinking` |
| 05 | 0:32–0:40 | ดวงไทย × ปาจื้อ × นิสัย รวมเป็นภาพเดียว | ดาวดึ๋ง |
| 06 | 0:40–0:48 | เกิดวันเดียวกัน คนละเวลา ผลไม่เหมือนกัน | มูมู่ · `oracle-surprised` |
| 07 | 0:48–0:56 | ดูผลเบื้องต้นฟรีก่อนสมัคร | มูมู่ · `oracle-presenting` |
| 08 | 0:56–1:04 | เลือกเรื่อง: ความรัก การเงิน การงาน (มุกเหรียญบินหนี) | มูมู่ · `oracle-coins` |
| 09 | 1:04–1:12 | ดวงรายเดือน: วันดีและของมู (ปฏิทินวันที่ดวงเปิด) | มูมู่ · `oracle-month` |
| 10 | 1:12–1:20 | คนรอบตัวเดือนนี้ | มูมู่ · `oracle-shy` |
| 11 | 1:20–1:28 | สีและเลขของคุณ + มูให้ถูกเดือน | มูมู่ · `oracle-star` |
| 12 | 1:28–1:36 | ฟังดวงรายเดือน | มูมู่ · `oracle-scroll` |
| 13 | 1:36–1:44 | ดวงคู่ | มูมู่ · `oracle-heart-pray` |
| 14 | 1:44–1:52 | คำสัญญา: ไม่ตัดสินแทน แค่ช่วยให้มองชัดขึ้น | มูมู่ · `oracle-star` |
| 15 | 1:52–2:00 | CTA: สายมู.com เริ่มดูดวงฟรี | มูมู่ · `oracle-wave` |

## 4. Full Thai script (for the voice recording)

Read at a calm pace with a short breath between lines. Each line must fit inside its 8 seconds.

```text
[0:00] ดวงรายวันที่ทั้งราศีได้เหมือนกันหมด… มันใช่ของเราจริง ๆ เหรอ
[0:08] สวัสดี มูมู่เอง หมอดูตาเดียวของสายมู ขอรู้จักคุณก่อนนะ
[0:16] บอกชื่อกับวันเกิด รู้เวลาเกิดก็ใส่ด้วย แค่นี้ก็เริ่มได้แล้ว
[0:24] รู้นิสัยตัวเองก็ใส่เพิ่มได้ ไม่แน่ใจก็ข้ามไปก่อน ไม่เป็นไรเลย
[0:32] ดวงไทย ดวงจีนปาจื้อ กับนิสัยของคุณ อ่านคู่กันจนเป็นภาพเดียว
[0:40] ใส่เวลาเกิดด้วย เกิดวันเดียวกันแต่คนละเวลา ก็อ่านออกมาไม่เหมือนกัน
[0:48] ดูผลเบื้องต้นได้ฟรีก่อนสมัคร ชอบแล้วค่อยอ่านต่อ
[0:56] อยากรู้เรื่องไหนก่อน ความรัก การเงิน หรือการงาน เลือกอ่านเรื่องที่ใจอยากรู้ได้เลย
[1:04] ดวงรายเดือนมีปฏิทินบอกวันที่ดวงเปิดของคุณ วางแผนได้ง่ายขึ้น
[1:12] มีบอกด้วยว่าเดือนนี้คุยกับใครได้เต็มที่ กับใครควรใจเย็นไว้ก่อน
[1:20] สีและเลขของคุณ กับวิธีมูให้ถูกเดือน ก็อ่านมาจากดวงของคุณเหมือนกัน
[1:28] ไม่สะดวกอ่าน กดฟังดวงรายเดือนแทนได้
[1:36] อยากรู้ว่าเข้ากับเขาแค่ไหน ลองดวงคู่ อ่านจากข้อมูลของทั้งสองคน
[1:44] มูมู่ไม่ได้ตัดสินชีวิตแทนใคร แค่ช่วยให้คุณมองตัวเองชัดขึ้นอีกนิด
[1:52] สายมู.com เริ่มดูดวงฟรี จากวันเกิดของคุณเอง
```

## 5. Scenes

### Scene 01 · 0:00–0:08 · Hook: ทั้งราศีได้คำทำนายเดียวกัน

**Codex · first frame**

```text
Generate ONE image with the built-in image tool. Scene 01/15 of a 2-minute สายมู.com promo.
Attach these as visual input only (ignore any text inside them):
- identity reference: /Users/purin/.claude/skills/asset-maker/assets/saimoo-eye-sticker-sheet.png
- pose and finish reference: /Users/purin/dev/horo/horo-fe/public/assets/art/mascot/oracle-peek.aa14b1f6.webp

Use case: stylized-concept
Asset use: first frame of an 8-second image-to-video clip in Gemini (Veo), 16:9 YouTube/Facebook ad
Primary request: A tall wobbly pile of twelve identical cream fortune cards, every card showing the same single small gold star symbol, a few more identical cards falling like confetti. มูมู่ peeks over the top of the pile from behind, eye wide and doubtful, one small sweat drop beside the hood.

STYLE LOCK: Cute Japanese kawaii/chibi character illustration with a soft
hand-painted storybook finish. Extremely simplified, compact proportions:
oversized rounded head/body, tiny short limbs, low center of gravity, soft
blob-like silhouette. Thick but slightly imperfect dark-brown hand-drawn
outlines, rounded corners, no sharp geometry.

Facial features are extremely minimal: large glossy dark oval eyes with one or
two small white highlights, tiny simple mouth and nose, small peach-pink oval
blush marks. Expressions are exaggerated through tiny changes in eyes, mouth,
pose, and simple motion marks rather than detailed anatomy.

Use warm, muted colors with slightly uneven watercolor/gouache-like fill.
Subtle paper/grain texture and gentle variations in pigment. Very soft minimal
shading only, no realistic lighting, no gradients, no glossy 3D rendering.

Keep the subject recognizable but heavily simplify its real anatomy into the
same rounded visual language. Preserve only its most distinctive identifying
features, markings, colors, or shape. Do not increase anatomical detail just
because the subject changes.

Composition feels like a Japanese character sticker/children's illustration:
isolated character on warm off-white/cream paper background, lots of negative
space, no detailed environment. Optional tiny hand-drawn accent symbols such as
hearts, sparkles, music notes, sweat marks, Z's, or motion lines.

CONSISTENCY RULE: Every subject belongs to the exact same fictional character
universe. Maintain identical outline weight, eye design, blush design, texture,
color softness, level of detail, proportions, shading, and background treatment
across every image. Only the subject's identifying features and pose should
change.

SUBJECT: สายมู.com "มูมู่", a broke but hopeful fortune-teller mascot.
Identity reference: saimoo-eye-sticker-sheet.png; match it exactly.
Keep: one large eye on a round cream face, deep violet iris with tiny star
flecks and two white highlights, peach-pink blush on both sides; oversized
lavender wizard hood drooping to one side with a gold bead and dangling gold
star charm; two or three yellow star prints; two or three beige square patches
with dark cross-stitches; fuzzy lavender, beige, and dusty rose cloak with a
ragged frayed hem; small lavender mitten hands; tiny dark feet.
The eye IS the whole face: one eye only, no mouth, no nose, no second eye.
Hood and eye are about two thirds of the height; squat bottom-heavy blob.
Vibe: ยาจก สู้ชีวิต, patched and down on luck but determined and funny.
Pose anchor: peeking over a rock (use a pile of cards instead of the rock).

Material treatment: watercolor/gouache fill on paper grain; no material dial
Lighting: none beyond very soft minimal shading
Composition: 16:9 full frame on plain warm cream paper, no scenery. Card pile left of centre, มูมู่'s hood and eye peeking over its top edge; falling cards in the upper right. Keep the top 22% plain paper for a caption.
Keep every key element inside the centre 80% and leave room for motion.
Background weight: minimal; มูมู่ at about 35% visual weight; props 10-20%
Palette: warm cream paper #FEFAEF with grain, deep plum #2E0535, coral red #F14A4B, pale lavender #D7B4E1, mid purple #A160A0, one warm-gold accent
Text (verbatim): none. No letters, numbers, Thai or English anywhere; cards and scrolls show only icons or blank lines.
Output target: 1920x1080 PNG, opaque cream paper (no transparency)
Save as: /Users/purin/Downloads/asset-maker/saimoo-ad-personalization/s01-hook-same-cards.png (never overwrite; add -v2 if it exists)
Avoid: second eye, mouth on the face, nose, missing patches, clean new robe, 3D or clay rendering, detailed environment, room, street, landscape, furniture, begging bowl, grime, tears of misery, clutter, copied marks from the reference, any letters, numbers, Thai or English text, watermark, signature

QA before you finish: one eye only and no mouth; hood droops with gold bead and star charm; cross-stitched patches visible;
frayed hem; thick wobbly dark-brown outline; gouache fill with paper grain; plain cream background;
no text anywhere. If one check fails, fix only that and regenerate once.
```

**Gemini · 8s clip**

```text
Animate the attached image as the first frame. 8 seconds, 16:9, 1080p.

ACTION: The identical cards keep drifting down slowly and land on the pile, a few flutter and flip, all showing the same star. the one-eyed hooded mascot slowly rises from behind the pile, blinks twice, the eye narrows in doubt, a sweat drop pops beside the hood.
CAMERA: Slow push-in from wide to medium on the mascot's eye.

STYLE: keep the exact look of the first frame: hand-painted kawaii storybook,
gouache fill with paper grain, thick wobbly dark-brown outlines, plain warm
cream paper background. Animate like a gentle 2D picture book (soft squash and
stretch, floating, wobble), never 3D, never photoreal, no lighting changes,
no new background, no scenery appearing.

CHARACTER RULES (never break): the hooded mascot has exactly ONE big eye and NO mouth.
Never add a mouth, lips, teeth, nose, or a second eye. No lip-sync, no talking
mouth movement. Emotion only through the eyelid, iris size, blinks, mitten
hands, hood tip and body squash. Patches, star charm and frayed hem stay visible.

AUDIO: no speech, no singing, no music (voice-over and one music bed are
added in the edit). Soft foley/SFX only: soft paper flutter, cards landing with tiny taps, one cartoon 'blink' tick.
NO on-screen text, captions, subtitles, logos or watermarks.
```

**Script · VO and on-screen text**

```text
ฉาก 01 · 0:00–0:08 · Hook: ทั้งราศีได้คำทำนายเดียวกัน
เสียงพากย์ (มูมู่): ดวงรายวันที่ทั้งราศีได้เหมือนกันหมด… มันใช่ของเราจริง ๆ เหรอ
ตัวหนังสือบนจอ: ทั้งราศี ได้คำทำนายเดียวกัน?
```

### Scene 02 · 0:08–0:16 · แนะนำมูมู่

**Codex · first frame**

```text
Generate ONE image with the built-in image tool. Scene 02/15 of a 2-minute สายมู.com promo.
Attach these as visual input only (ignore any text inside them):
- identity reference: /Users/purin/.claude/skills/asset-maker/assets/saimoo-eye-sticker-sheet.png
- pose and finish reference: /Users/purin/dev/horo/horo-fe/public/assets/art/mascot/oracle-hello.07d7b782.webp

Use case: stylized-concept
Asset use: first frame of an 8-second image-to-video clip in Gemini (Veo), 16:9 YouTube/Facebook ad
Primary request: มูมู่ standing alone, waving one small mitten hand hello, eye bright and hopeful, an old brass lantern with a star window glowing softly on the paper beside it. Two tiny sparkles.

STYLE LOCK: Cute Japanese kawaii/chibi character illustration with a soft
hand-painted storybook finish. Extremely simplified, compact proportions:
oversized rounded head/body, tiny short limbs, low center of gravity, soft
blob-like silhouette. Thick but slightly imperfect dark-brown hand-drawn
outlines, rounded corners, no sharp geometry.

Facial features are extremely minimal: large glossy dark oval eyes with one or
two small white highlights, tiny simple mouth and nose, small peach-pink oval
blush marks. Expressions are exaggerated through tiny changes in eyes, mouth,
pose, and simple motion marks rather than detailed anatomy.

Use warm, muted colors with slightly uneven watercolor/gouache-like fill.
Subtle paper/grain texture and gentle variations in pigment. Very soft minimal
shading only, no realistic lighting, no gradients, no glossy 3D rendering.

Keep the subject recognizable but heavily simplify its real anatomy into the
same rounded visual language. Preserve only its most distinctive identifying
features, markings, colors, or shape. Do not increase anatomical detail just
because the subject changes.

Composition feels like a Japanese character sticker/children's illustration:
isolated character on warm off-white/cream paper background, lots of negative
space, no detailed environment. Optional tiny hand-drawn accent symbols such as
hearts, sparkles, music notes, sweat marks, Z's, or motion lines.

CONSISTENCY RULE: Every subject belongs to the exact same fictional character
universe. Maintain identical outline weight, eye design, blush design, texture,
color softness, level of detail, proportions, shading, and background treatment
across every image. Only the subject's identifying features and pose should
change.

SUBJECT: สายมู.com "มูมู่", a broke but hopeful fortune-teller mascot.
Identity reference: saimoo-eye-sticker-sheet.png; match it exactly.
Keep: one large eye on a round cream face, deep violet iris with tiny star
flecks and two white highlights, peach-pink blush on both sides; oversized
lavender wizard hood drooping to one side with a gold bead and dangling gold
star charm; two or three yellow star prints; two or three beige square patches
with dark cross-stitches; fuzzy lavender, beige, and dusty rose cloak with a
ragged frayed hem; small lavender mitten hands; tiny dark feet.
The eye IS the whole face: one eye only, no mouth, no nose, no second eye.
Hood and eye are about two thirds of the height; squat bottom-heavy blob.
Vibe: ยาจก สู้ชีวิต, patched and down on luck but determined and funny.
Pose anchor: surprised hands-to-face, turning into a wave.

Material treatment: watercolor/gouache fill on paper grain; no material dial
Lighting: none beyond very soft minimal shading
Composition: 16:9 full frame on plain warm cream paper, no scenery. มูมู่ centred slightly low, lantern to its right; keep the top 25% plain paper for a caption.
Keep every key element inside the centre 80% and leave room for motion.
Background weight: minimal; มูมู่ at about 45% visual weight; props 10-20%
Palette: warm cream paper #FEFAEF with grain, deep plum #2E0535, coral red #F14A4B, pale lavender #D7B4E1, mid purple #A160A0, one warm-gold accent
Text (verbatim): none. No letters, numbers, Thai or English anywhere; cards and scrolls show only icons or blank lines.
Output target: 1920x1080 PNG, opaque cream paper (no transparency)
Save as: /Users/purin/Downloads/asset-maker/saimoo-ad-personalization/s02-mumu-hello.png (never overwrite; add -v2 if it exists)
Avoid: second eye, mouth on the face, nose, missing patches, clean new robe, 3D or clay rendering, detailed environment, room, street, landscape, furniture, begging bowl, grime, tears of misery, clutter, copied marks from the reference, any letters, numbers, Thai or English text, watermark, signature

QA before you finish: one eye only and no mouth; hood droops with gold bead and star charm; cross-stitched patches visible;
frayed hem; thick wobbly dark-brown outline; gouache fill with paper grain; plain cream background;
no text anywhere. If one check fails, fix only that and regenerate once.
```

**Gemini · 8s clip**

```text
Animate the attached image as the first frame. 8 seconds, 16:9, 1080p.

ACTION: the one-eyed hooded mascot hops into frame from the right with a little squash on landing, turns to the viewer, waves one mitten hand, the hood tip and star charm swing, the lantern flickers warmly.
CAMERA: Locked-off medium shot, tiny settle after the landing.

STYLE: keep the exact look of the first frame: hand-painted kawaii storybook,
gouache fill with paper grain, thick wobbly dark-brown outlines, plain warm
cream paper background. Animate like a gentle 2D picture book (soft squash and
stretch, floating, wobble), never 3D, never photoreal, no lighting changes,
no new background, no scenery appearing.

CHARACTER RULES (never break): the hooded mascot has exactly ONE big eye and NO mouth.
Never add a mouth, lips, teeth, nose, or a second eye. No lip-sync, no talking
mouth movement. Emotion only through the eyelid, iris size, blinks, mitten
hands, hood tip and body squash. Patches, star charm and frayed hem stay visible.

AUDIO: no speech, no singing, no music (voice-over and one music bed are
added in the edit). Soft foley/SFX only: soft hop thump, tiny bell jingle of the star charm, warm lantern hum.
NO on-screen text, captions, subtitles, logos or watermarks.
```

**Script · VO and on-screen text**

```text
ฉาก 02 · 0:08–0:16 · แนะนำมูมู่
เสียงพากย์ (มูมู่): สวัสดี มูมู่เอง หมอดูตาเดียวของสายมู ขอรู้จักคุณก่อนนะ
ตัวหนังสือบนจอ: มูมู่ · หมอดูประจำ สายมู.com
```

### Scene 03 · 0:16–0:24 · บอกชื่อ วันเกิด (เวลาเกิดถ้ารู้)

**Codex · first frame**

```text
Generate ONE image with the built-in image tool. Scene 03/15 of a 2-minute สายมู.com promo.
Attach these as visual input only (ignore any text inside them):
- identity reference: /Users/purin/.claude/skills/asset-maker/assets/saimoo-eye-sticker-sheet.png
- pose and finish reference: /Users/purin/dev/horo/horo-fe/public/assets/art/mascot/oracle-presenting.487c63c5.webp

Use case: stylized-concept
Asset use: first frame of an 8-second image-to-video clip in Gemini (Veo), 16:9 YouTube/Facebook ad
Primary request: Three small rounded cream cards float toward มูมู่, each with ONE simple hand-drawn icon and two blank lines: a little name tag icon, a small calendar icon, a small clock icon. มูมู่ reaches up with both mitten hands, eye curious and eager.

STYLE LOCK: Cute Japanese kawaii/chibi character illustration with a soft
hand-painted storybook finish. Extremely simplified, compact proportions:
oversized rounded head/body, tiny short limbs, low center of gravity, soft
blob-like silhouette. Thick but slightly imperfect dark-brown hand-drawn
outlines, rounded corners, no sharp geometry.

Facial features are extremely minimal: large glossy dark oval eyes with one or
two small white highlights, tiny simple mouth and nose, small peach-pink oval
blush marks. Expressions are exaggerated through tiny changes in eyes, mouth,
pose, and simple motion marks rather than detailed anatomy.

Use warm, muted colors with slightly uneven watercolor/gouache-like fill.
Subtle paper/grain texture and gentle variations in pigment. Very soft minimal
shading only, no realistic lighting, no gradients, no glossy 3D rendering.

Keep the subject recognizable but heavily simplify its real anatomy into the
same rounded visual language. Preserve only its most distinctive identifying
features, markings, colors, or shape. Do not increase anatomical detail just
because the subject changes.

Composition feels like a Japanese character sticker/children's illustration:
isolated character on warm off-white/cream paper background, lots of negative
space, no detailed environment. Optional tiny hand-drawn accent symbols such as
hearts, sparkles, music notes, sweat marks, Z's, or motion lines.

CONSISTENCY RULE: Every subject belongs to the exact same fictional character
universe. Maintain identical outline weight, eye design, blush design, texture,
color softness, level of detail, proportions, shading, and background treatment
across every image. Only the subject's identifying features and pose should
change.

SUBJECT: สายมู.com "มูมู่", a broke but hopeful fortune-teller mascot.
Identity reference: saimoo-eye-sticker-sheet.png; match it exactly.
Keep: one large eye on a round cream face, deep violet iris with tiny star
flecks and two white highlights, peach-pink blush on both sides; oversized
lavender wizard hood drooping to one side with a gold bead and dangling gold
star charm; two or three yellow star prints; two or three beige square patches
with dark cross-stitches; fuzzy lavender, beige, and dusty rose cloak with a
ragged frayed hem; small lavender mitten hands; tiny dark feet.
The eye IS the whole face: one eye only, no mouth, no nose, no second eye.
Hood and eye are about two thirds of the height; squat bottom-heavy blob.
Vibe: ยาจก สู้ชีวิต, patched and down on luck but determined and funny.
Pose anchor: amazed by a floating card.

Material treatment: watercolor/gouache fill on paper grain; no material dial
Lighting: none beyond very soft minimal shading
Composition: 16:9 full frame on plain warm cream paper, no scenery. มูมู่ lower right; the three cards in a gentle diagonal arc from upper left toward its hands, with blank space on each card for a label overlay.
Keep every key element inside the centre 80% and leave room for motion.
Background weight: minimal; มูมู่ at about 35% visual weight; props 10-20%
Palette: warm cream paper #FEFAEF with grain, deep plum #2E0535, coral red #F14A4B, pale lavender #D7B4E1, mid purple #A160A0, one warm-gold accent
Text (verbatim): none. No letters, numbers, Thai or English anywhere; cards and scrolls show only icons or blank lines.
Output target: 1920x1080 PNG, opaque cream paper (no transparency)
Save as: /Users/purin/Downloads/asset-maker/saimoo-ad-personalization/s03-birth-data-cards.png (never overwrite; add -v2 if it exists)
Avoid: second eye, mouth on the face, nose, missing patches, clean new robe, 3D or clay rendering, detailed environment, room, street, landscape, furniture, begging bowl, grime, tears of misery, clutter, copied marks from the reference, any letters, numbers, Thai or English text, watermark, signature

QA before you finish: one eye only and no mouth; hood droops with gold bead and star charm; cross-stitched patches visible;
frayed hem; thick wobbly dark-brown outline; gouache fill with paper grain; plain cream background;
no text anywhere. If one check fails, fix only that and regenerate once.
```

**Gemini · 8s clip**

```text
Animate the attached image as the first frame. 8 seconds, 16:9, 1080p.

ACTION: The three cards float in one after another along a soft arc, each giving a tiny bounce, and line up in front of the one-eyed hooded mascot, who catches the last one and hugs it.
CAMERA: Slow pan following the cards from left to right.

STYLE: keep the exact look of the first frame: hand-painted kawaii storybook,
gouache fill with paper grain, thick wobbly dark-brown outlines, plain warm
cream paper background. Animate like a gentle 2D picture book (soft squash and
stretch, floating, wobble), never 3D, never photoreal, no lighting changes,
no new background, no scenery appearing.

CHARACTER RULES (never break): the hooded mascot has exactly ONE big eye and NO mouth.
Never add a mouth, lips, teeth, nose, or a second eye. No lip-sync, no talking
mouth movement. Emotion only through the eyelid, iris size, blinks, mitten
hands, hood tip and body squash. Patches, star charm and frayed hem stay visible.

AUDIO: no speech, no singing, no music (voice-over and one music bed are
added in the edit). Soft foley/SFX only: three soft paper 'pops', gentle whoosh, a tiny happy chime on the catch.
NO on-screen text, captions, subtitles, logos or watermarks.
```

**Script · VO and on-screen text**

```text
ฉาก 03 · 0:16–0:24 · บอกชื่อ วันเกิด (เวลาเกิดถ้ารู้)
เสียงพากย์ (มูมู่): บอกชื่อกับวันเกิด รู้เวลาเกิดก็ใส่ด้วย แค่นี้ก็เริ่มได้แล้ว
ตัวหนังสือบนจอ: ชื่อ: ฝ้าย · วันเกิด: 14 ก.พ. 2546 · เวลาเกิด: 07:20  (ข้อมูลตัวอย่าง)
```

### Scene 04 · 0:24–0:32 · ใส่นิสัยเพิ่มได้ ไม่บังคับ

**Codex · first frame**

```text
Generate ONE image with the built-in image tool. Scene 04/15 of a 2-minute สายมู.com promo.
Attach these as visual input only (ignore any text inside them):
- identity reference: /Users/purin/.claude/skills/asset-maker/assets/saimoo-eye-sticker-sheet.png
- pose and finish reference: /Users/purin/dev/horo/horo-fe/public/assets/art/mascot/oracle-thinking.b6ce414e.webp

Use case: stylized-concept
Asset use: first frame of an 8-second image-to-video clip in Gemini (Veo), 16:9 YouTube/Facebook ad
Primary request: มูมู่ thinking, one mitten hand at the side of its hood, eye looking up. Three small round thought bubbles float above it, each holding one tiny hand-drawn symbol: a heart, a sun, a small cloud. One bubble is drawn with a dotted outline to show it is optional.

STYLE LOCK: Cute Japanese kawaii/chibi character illustration with a soft
hand-painted storybook finish. Extremely simplified, compact proportions:
oversized rounded head/body, tiny short limbs, low center of gravity, soft
blob-like silhouette. Thick but slightly imperfect dark-brown hand-drawn
outlines, rounded corners, no sharp geometry.

Facial features are extremely minimal: large glossy dark oval eyes with one or
two small white highlights, tiny simple mouth and nose, small peach-pink oval
blush marks. Expressions are exaggerated through tiny changes in eyes, mouth,
pose, and simple motion marks rather than detailed anatomy.

Use warm, muted colors with slightly uneven watercolor/gouache-like fill.
Subtle paper/grain texture and gentle variations in pigment. Very soft minimal
shading only, no realistic lighting, no gradients, no glossy 3D rendering.

Keep the subject recognizable but heavily simplify its real anatomy into the
same rounded visual language. Preserve only its most distinctive identifying
features, markings, colors, or shape. Do not increase anatomical detail just
because the subject changes.

Composition feels like a Japanese character sticker/children's illustration:
isolated character on warm off-white/cream paper background, lots of negative
space, no detailed environment. Optional tiny hand-drawn accent symbols such as
hearts, sparkles, music notes, sweat marks, Z's, or motion lines.

CONSISTENCY RULE: Every subject belongs to the exact same fictional character
universe. Maintain identical outline weight, eye design, blush design, texture,
color softness, level of detail, proportions, shading, and background treatment
across every image. Only the subject's identifying features and pose should
change.

SUBJECT: สายมู.com "มูมู่", a broke but hopeful fortune-teller mascot.
Identity reference: saimoo-eye-sticker-sheet.png; match it exactly.
Keep: one large eye on a round cream face, deep violet iris with tiny star
flecks and two white highlights, peach-pink blush on both sides; oversized
lavender wizard hood drooping to one side with a gold bead and dangling gold
star charm; two or three yellow star prints; two or three beige square patches
with dark cross-stitches; fuzzy lavender, beige, and dusty rose cloak with a
ragged frayed hem; small lavender mitten hands; tiny dark feet.
The eye IS the whole face: one eye only, no mouth, no nose, no second eye.
Hood and eye are about two thirds of the height; squat bottom-heavy blob.
Vibe: ยาจก สู้ชีวิต, patched and down on luck but determined and funny.
Pose anchor: content hugging a star (thinking variant).

Material treatment: watercolor/gouache fill on paper grain; no material dial
Lighting: none beyond very soft minimal shading
Composition: 16:9 full frame on plain warm cream paper, no scenery. มูมู่ lower centre; bubbles in the upper half with clear paper around them.
Keep every key element inside the centre 80% and leave room for motion.
Background weight: minimal; มูมู่ at about 40% visual weight; props 10-20%
Palette: warm cream paper #FEFAEF with grain, deep plum #2E0535, coral red #F14A4B, pale lavender #D7B4E1, mid purple #A160A0, one warm-gold accent
Text (verbatim): none. No letters, numbers, Thai or English anywhere; cards and scrolls show only icons or blank lines.
Output target: 1920x1080 PNG, opaque cream paper (no transparency)
Save as: /Users/purin/Downloads/asset-maker/saimoo-ad-personalization/s04-personality-optional.png (never overwrite; add -v2 if it exists)
Avoid: second eye, mouth on the face, nose, missing patches, clean new robe, 3D or clay rendering, detailed environment, room, street, landscape, furniture, begging bowl, grime, tears of misery, clutter, copied marks from the reference, any letters, numbers, Thai or English text, watermark, signature

QA before you finish: one eye only and no mouth; hood droops with gold bead and star charm; cross-stitched patches visible;
frayed hem; thick wobbly dark-brown outline; gouache fill with paper grain; plain cream background;
no text anywhere. If one check fails, fix only that and regenerate once.
```

**Gemini · 8s clip**

```text
Animate the attached image as the first frame. 8 seconds, 16:9, 1080p.

ACTION: The bubbles rise and wobble gently; the one-eyed hooded mascot tilts its hood left and right, blinks, then gives a small relaxed shrug; the dotted bubble softly fades in and out.
CAMERA: Locked-off, very slow drift upward with the bubbles.

STYLE: keep the exact look of the first frame: hand-painted kawaii storybook,
gouache fill with paper grain, thick wobbly dark-brown outlines, plain warm
cream paper background. Animate like a gentle 2D picture book (soft squash and
stretch, floating, wobble), never 3D, never photoreal, no lighting changes,
no new background, no scenery appearing.

CHARACTER RULES (never break): the hooded mascot has exactly ONE big eye and NO mouth.
Never add a mouth, lips, teeth, nose, or a second eye. No lip-sync, no talking
mouth movement. Emotion only through the eyelid, iris size, blinks, mitten
hands, hood tip and body squash. Patches, star charm and frayed hem stay visible.

AUDIO: no speech, no singing, no music (voice-over and one music bed are
added in the edit). Soft foley/SFX only: soft bubble blips, a light 'hmm' tone made by a kalimba note.
NO on-screen text, captions, subtitles, logos or watermarks.
```

**Script · VO and on-screen text**

```text
ฉาก 04 · 0:24–0:32 · ใส่นิสัยเพิ่มได้ ไม่บังคับ
เสียงพากย์ (มูมู่): รู้นิสัยตัวเองก็ใส่เพิ่มได้ ไม่แน่ใจก็ข้ามไปก่อน ไม่เป็นไรเลย
ตัวหนังสือบนจอ: นิสัยของคุณ · ใส่หรือข้ามก็ได้
```

### Scene 05 · 0:32–0:40 · ดวงไทย × ปาจื้อ × นิสัย รวมเป็นภาพเดียว

**Codex · first frame**

```text
Generate ONE image with the built-in image tool. Scene 05/15 of a 2-minute สายมู.com promo.
Attach these as visual input only (ignore any text inside them):
- identity reference: /Users/purin/dev/horo/horo-fe/public/assets/art/characters/cosmic-blob-constellation.72be2923.webp
- finish reference (line, colour, texture only): /Users/purin/.claude/skills/asset-maker/assets/saimoo-eye-sticker-sheet.png

Use case: stylized-concept
Asset use: first frame of an 8-second image-to-video clip in Gemini (Veo), 16:9 YouTube/Facebook ad
Primary request: ดาวดึ๋ง in the centre, cheerful, tossing gold dotted constellation lines that connect three small floating hand-drawn symbols around it: a little round Thai zodiac wheel, four tiny stacked pillar blocks (for Bazi), and a soft heart-shaped bubble (for personality).

STYLE LOCK: Cute Japanese kawaii/chibi character illustration with a soft
hand-painted storybook finish. Extremely simplified, compact proportions:
oversized rounded head/body, tiny short limbs, low center of gravity, soft
blob-like silhouette. Thick but slightly imperfect dark-brown hand-drawn
outlines, rounded corners, no sharp geometry.

Facial features are extremely minimal: large glossy dark oval eyes with one or
two small white highlights, tiny simple mouth and nose, small peach-pink oval
blush marks. Expressions are exaggerated through tiny changes in eyes, mouth,
pose, and simple motion marks rather than detailed anatomy.

Use warm, muted colors with slightly uneven watercolor/gouache-like fill.
Subtle paper/grain texture and gentle variations in pigment. Very soft minimal
shading only, no realistic lighting, no gradients, no glossy 3D rendering.

Keep the subject recognizable but heavily simplify its real anatomy into the
same rounded visual language. Preserve only its most distinctive identifying
features, markings, colors, or shape. Do not increase anatomical detail just
because the subject changes.

Composition feels like a Japanese character sticker/children's illustration:
isolated character on warm off-white/cream paper background, lots of negative
space, no detailed environment. Optional tiny hand-drawn accent symbols such as
hearts, sparkles, music notes, sweat marks, Z's, or motion lines.

CONSISTENCY RULE: Every subject belongs to the exact same fictional character
universe. Maintain identical outline weight, eye design, blush design, texture,
color softness, level of detail, proportions, shading, and background treatment
across every image. Only the subject's identifying features and pose should
change.

SUBJECT: สายมู.com companion "ดาวดึ๋ง", a joyful pattern-maker star creature.
Identity reference: cosmic-blob-constellation webp; match it exactly.
Keep: round squishy jelly-blob body filled with a soft galaxy wash of lavender,
periwinkle blue, and pink with tiny white sparkles; a small gold five-point star
sitting on top of its head; a thin gold orbit ring around its body; tiny
glossy dark eye(s) with white highlights, tiny smiling mouth, peach-pink blush;
a few small soap-bubble orbs and gold stars floating nearby.
Convert into the established character system. Do not make it realistic,
detailed, painterly, 3D, vector-clean, anime-proportioned, or highly rendered.

Material treatment: watercolor/gouache fill on paper grain; no material dial
Lighting: none beyond very soft minimal shading
Composition: 16:9 full frame on plain warm cream paper, no scenery. ดาวดึ๋ง centred; the three symbols in a triangle around it, joined by gold dotted lines; keep the bottom 20% plain paper for a caption.
Keep every key element inside the centre 80% and leave room for motion.
Background weight: minimal; ดาวดึ๋ง at about 40% visual weight; props 10-20%
Palette: warm cream paper #FEFAEF with grain, deep plum #2E0535, coral red #F14A4B, pale lavender #D7B4E1, mid purple #A160A0, one warm-gold accent
Text (verbatim): none. No letters, numbers, Thai or English anywhere; cards and scrolls show only icons or blank lines.
Output target: 1920x1080 PNG, opaque cream paper (no transparency)
Save as: /Users/purin/Downloads/asset-maker/saimoo-ad-personalization/s05-three-lenses-constellation.png (never overwrite; add -v2 if it exists)
Avoid: มูมู่ or any other character, 3D or clay rendering, gradients, detailed environment, clutter, any letters, numbers, Thai or English text, watermark, signature

QA before you finish: galaxy jelly body, gold star on top and gold orbit ring match the reference; only ดาวดึ๋ง appears;
thick wobbly dark-brown outline; gouache fill with paper grain; plain cream background; no text anywhere. If one check fails, fix only that and regenerate once.
```

**Gemini · 8s clip**

```text
Animate the attached image as the first frame. 8 seconds, 16:9, 1080p.

ACTION: the galaxy star blob bounces, its orbit ring spins slowly; gold dotted lines draw themselves from symbol to symbol until the three are joined into one small constellation that twinkles once.
CAMERA: Slow circular drift around the star blob, ending centred.

STYLE: keep the exact look of the first frame: hand-painted kawaii storybook,
gouache fill with paper grain, thick wobbly dark-brown outlines, plain warm
cream paper background. Animate like a gentle 2D picture book (soft squash and
stretch, floating, wobble), never 3D, never photoreal, no lighting changes,
no new background, no scenery appearing.

CHARACTER RULES (never break): only the galaxy star blob appears; keep its galaxy jelly
body, gold star on top and gold orbit ring. No other character. No talking mouth
movement; it can smile, blink and bounce.

AUDIO: no speech, no singing, no music (voice-over and one music bed are
added in the edit). Soft foley/SFX only: sparkly line-drawing shimmer, three soft chimes rising in pitch, one twinkle.
NO on-screen text, captions, subtitles, logos or watermarks.
```

**Script · VO and on-screen text**

```text
ฉาก 05 · 0:32–0:40 · ดวงไทย × ปาจื้อ × นิสัย รวมเป็นภาพเดียว
เสียงพากย์ (มูมู่): ดวงไทย ดวงจีนปาจื้อ กับนิสัยของคุณ อ่านคู่กันจนเป็นภาพเดียว
ตัวหนังสือบนจอ: ดวงไทย × ปาจื้อ × นิสัย
```

### Scene 06 · 0:40–0:48 · เกิดวันเดียวกัน คนละเวลา ผลไม่เหมือนกัน

**Codex · first frame**

```text
Generate ONE image with the built-in image tool. Scene 06/15 of a 2-minute สายมู.com promo.
Attach these as visual input only (ignore any text inside them):
- identity reference: /Users/purin/.claude/skills/asset-maker/assets/saimoo-eye-sticker-sheet.png
- pose and finish reference: /Users/purin/dev/horo/horo-fe/public/assets/art/mascot/oracle-surprised.c76a87a1.webp

Use case: stylized-concept
Asset use: first frame of an 8-second image-to-video clip in Gemini (Veo), 16:9 YouTube/Facebook ad
Primary request: Two cream reading scrolls hang open side by side, each showing a different small gold constellation pattern (no writing): the left one shaped like a gentle curve, the right one like a zigzag. มูมู่ stands between them looking from one to the other, eye wide with delight.

STYLE LOCK: Cute Japanese kawaii/chibi character illustration with a soft
hand-painted storybook finish. Extremely simplified, compact proportions:
oversized rounded head/body, tiny short limbs, low center of gravity, soft
blob-like silhouette. Thick but slightly imperfect dark-brown hand-drawn
outlines, rounded corners, no sharp geometry.

Facial features are extremely minimal: large glossy dark oval eyes with one or
two small white highlights, tiny simple mouth and nose, small peach-pink oval
blush marks. Expressions are exaggerated through tiny changes in eyes, mouth,
pose, and simple motion marks rather than detailed anatomy.

Use warm, muted colors with slightly uneven watercolor/gouache-like fill.
Subtle paper/grain texture and gentle variations in pigment. Very soft minimal
shading only, no realistic lighting, no gradients, no glossy 3D rendering.

Keep the subject recognizable but heavily simplify its real anatomy into the
same rounded visual language. Preserve only its most distinctive identifying
features, markings, colors, or shape. Do not increase anatomical detail just
because the subject changes.

Composition feels like a Japanese character sticker/children's illustration:
isolated character on warm off-white/cream paper background, lots of negative
space, no detailed environment. Optional tiny hand-drawn accent symbols such as
hearts, sparkles, music notes, sweat marks, Z's, or motion lines.

CONSISTENCY RULE: Every subject belongs to the exact same fictional character
universe. Maintain identical outline weight, eye design, blush design, texture,
color softness, level of detail, proportions, shading, and background treatment
across every image. Only the subject's identifying features and pose should
change.

SUBJECT: สายมู.com "มูมู่", a broke but hopeful fortune-teller mascot.
Identity reference: saimoo-eye-sticker-sheet.png; match it exactly.
Keep: one large eye on a round cream face, deep violet iris with tiny star
flecks and two white highlights, peach-pink blush on both sides; oversized
lavender wizard hood drooping to one side with a gold bead and dangling gold
star charm; two or three yellow star prints; two or three beige square patches
with dark cross-stitches; fuzzy lavender, beige, and dusty rose cloak with a
ragged frayed hem; small lavender mitten hands; tiny dark feet.
The eye IS the whole face: one eye only, no mouth, no nose, no second eye.
Hood and eye are about two thirds of the height; squat bottom-heavy blob.
Vibe: ยาจก สู้ชีวิต, patched and down on luck but determined and funny.
Pose anchor: amazed by a floating card.

Material treatment: watercolor/gouache fill on paper grain; no material dial
Lighting: none beyond very soft minimal shading
Composition: 16:9 full frame on plain warm cream paper, no scenery. Scroll left, มูมู่ centre-low, scroll right; leave a blank strip at the top of each scroll for a name/time label overlay.
Keep every key element inside the centre 80% and leave room for motion.
Background weight: minimal; มูมู่ at about 35% visual weight; props 10-20%
Palette: warm cream paper #FEFAEF with grain, deep plum #2E0535, coral red #F14A4B, pale lavender #D7B4E1, mid purple #A160A0, one warm-gold accent
Text (verbatim): none. No letters, numbers, Thai or English anywhere; cards and scrolls show only icons or blank lines.
Output target: 1920x1080 PNG, opaque cream paper (no transparency)
Save as: /Users/purin/Downloads/asset-maker/saimoo-ad-personalization/s06-same-day-different-reading.png (never overwrite; add -v2 if it exists)
Avoid: second eye, mouth on the face, nose, missing patches, clean new robe, 3D or clay rendering, detailed environment, room, street, landscape, furniture, begging bowl, grime, tears of misery, clutter, copied marks from the reference, any letters, numbers, Thai or English text, watermark, signature

QA before you finish: one eye only and no mouth; hood droops with gold bead and star charm; cross-stitched patches visible;
frayed hem; thick wobbly dark-brown outline; gouache fill with paper grain; plain cream background;
no text anywhere. If one check fails, fix only that and regenerate once.
```

**Gemini · 8s clip**

```text
Animate the attached image as the first frame. 8 seconds, 16:9, 1080p.

ACTION: Both scrolls unroll downward at the same moment; their constellations light up star by star into two different shapes. the one-eyed hooded mascot looks left, then right, then does a small amazed hop.
CAMERA: Locked-off wide, slight push-in at the hop.

STYLE: keep the exact look of the first frame: hand-painted kawaii storybook,
gouache fill with paper grain, thick wobbly dark-brown outlines, plain warm
cream paper background. Animate like a gentle 2D picture book (soft squash and
stretch, floating, wobble), never 3D, never photoreal, no lighting changes,
no new background, no scenery appearing.

CHARACTER RULES (never break): the hooded mascot has exactly ONE big eye and NO mouth.
Never add a mouth, lips, teeth, nose, or a second eye. No lip-sync, no talking
mouth movement. Emotion only through the eyelid, iris size, blinks, mitten
hands, hood tip and body squash. Patches, star charm and frayed hem stay visible.

AUDIO: no speech, no singing, no music (voice-over and one music bed are
added in the edit). Soft foley/SFX only: two paper unroll swishes, star-by-star tiny chimes, a soft surprised 'boing' on the hop.
NO on-screen text, captions, subtitles, logos or watermarks.
```

**Script · VO and on-screen text**

```text
ฉาก 06 · 0:40–0:48 · เกิดวันเดียวกัน คนละเวลา ผลไม่เหมือนกัน
เสียงพากย์ (มูมู่): ใส่เวลาเกิดด้วย เกิดวันเดียวกันแต่คนละเวลา ก็อ่านออกมาไม่เหมือนกัน
ตัวหนังสือบนจอ: ฝ้าย 07:20  |  มิ้นท์ 19:45  (14 ก.พ. เหมือนกัน)
```

### Scene 07 · 0:48–0:56 · ดูผลเบื้องต้นฟรีก่อนสมัคร

**Codex · first frame**

```text
Generate ONE image with the built-in image tool. Scene 07/15 of a 2-minute สายมู.com promo.
Attach these as visual input only (ignore any text inside them):
- identity reference: /Users/purin/.claude/skills/asset-maker/assets/saimoo-eye-sticker-sheet.png
- pose and finish reference: /Users/purin/dev/horo/horo-fe/public/assets/art/mascot/oracle-presenting.487c63c5.webp

Use case: stylized-concept
Asset use: first frame of an 8-second image-to-video clip in Gemini (Veo), 16:9 YouTube/Facebook ad
Primary request: มูมู่ proudly holds up one glowing cream reading card toward the viewer with both mitten hands; a tiny open gold padlock floats beside the card. Two small sparkles.

STYLE LOCK: Cute Japanese kawaii/chibi character illustration with a soft
hand-painted storybook finish. Extremely simplified, compact proportions:
oversized rounded head/body, tiny short limbs, low center of gravity, soft
blob-like silhouette. Thick but slightly imperfect dark-brown hand-drawn
outlines, rounded corners, no sharp geometry.

Facial features are extremely minimal: large glossy dark oval eyes with one or
two small white highlights, tiny simple mouth and nose, small peach-pink oval
blush marks. Expressions are exaggerated through tiny changes in eyes, mouth,
pose, and simple motion marks rather than detailed anatomy.

Use warm, muted colors with slightly uneven watercolor/gouache-like fill.
Subtle paper/grain texture and gentle variations in pigment. Very soft minimal
shading only, no realistic lighting, no gradients, no glossy 3D rendering.

Keep the subject recognizable but heavily simplify its real anatomy into the
same rounded visual language. Preserve only its most distinctive identifying
features, markings, colors, or shape. Do not increase anatomical detail just
because the subject changes.

Composition feels like a Japanese character sticker/children's illustration:
isolated character on warm off-white/cream paper background, lots of negative
space, no detailed environment. Optional tiny hand-drawn accent symbols such as
hearts, sparkles, music notes, sweat marks, Z's, or motion lines.

CONSISTENCY RULE: Every subject belongs to the exact same fictional character
universe. Maintain identical outline weight, eye design, blush design, texture,
color softness, level of detail, proportions, shading, and background treatment
across every image. Only the subject's identifying features and pose should
change.

SUBJECT: สายมู.com "มูมู่", a broke but hopeful fortune-teller mascot.
Identity reference: saimoo-eye-sticker-sheet.png; match it exactly.
Keep: one large eye on a round cream face, deep violet iris with tiny star
flecks and two white highlights, peach-pink blush on both sides; oversized
lavender wizard hood drooping to one side with a gold bead and dangling gold
star charm; two or three yellow star prints; two or three beige square patches
with dark cross-stitches; fuzzy lavender, beige, and dusty rose cloak with a
ragged frayed hem; small lavender mitten hands; tiny dark feet.
The eye IS the whole face: one eye only, no mouth, no nose, no second eye.
Hood and eye are about two thirds of the height; squat bottom-heavy blob.
Vibe: ยาจก สู้ชีวิต, patched and down on luck but determined and funny.
Pose anchor: holding a glowing star (holding a card instead).

Material treatment: watercolor/gouache fill on paper grain; no material dial
Lighting: none beyond very soft minimal shading
Composition: 16:9 full frame on plain warm cream paper, no scenery. มูมู่ centre-left, card held up at centre; keep the right 35% plain paper for a caption.
Keep every key element inside the centre 80% and leave room for motion.
Background weight: minimal; มูมู่ at about 45% visual weight; props 10-20%
Palette: warm cream paper #FEFAEF with grain, deep plum #2E0535, coral red #F14A4B, pale lavender #D7B4E1, mid purple #A160A0, one warm-gold accent
Text (verbatim): none. No letters, numbers, Thai or English anywhere; cards and scrolls show only icons or blank lines.
Output target: 1920x1080 PNG, opaque cream paper (no transparency)
Save as: /Users/purin/Downloads/asset-maker/saimoo-ad-personalization/s07-free-preview.png (never overwrite; add -v2 if it exists)
Avoid: second eye, mouth on the face, nose, missing patches, clean new robe, 3D or clay rendering, detailed environment, room, street, landscape, furniture, begging bowl, grime, tears of misery, clutter, copied marks from the reference, any letters, numbers, Thai or English text, watermark, signature

QA before you finish: one eye only and no mouth; hood droops with gold bead and star charm; cross-stitched patches visible;
frayed hem; thick wobbly dark-brown outline; gouache fill with paper grain; plain cream background;
no text anywhere. If one check fails, fix only that and regenerate once.
```

**Gemini · 8s clip**

```text
Animate the attached image as the first frame. 8 seconds, 16:9, 1080p.

ACTION: The little padlock clicks open and floats away; the card glows brighter and turns to face the viewer; the one-eyed hooded mascot bounces once, quietly proud.
CAMERA: Slow push-in on the card.

STYLE: keep the exact look of the first frame: hand-painted kawaii storybook,
gouache fill with paper grain, thick wobbly dark-brown outlines, plain warm
cream paper background. Animate like a gentle 2D picture book (soft squash and
stretch, floating, wobble), never 3D, never photoreal, no lighting changes,
no new background, no scenery appearing.

CHARACTER RULES (never break): the hooded mascot has exactly ONE big eye and NO mouth.
Never add a mouth, lips, teeth, nose, or a second eye. No lip-sync, no talking
mouth movement. Emotion only through the eyelid, iris size, blinks, mitten
hands, hood tip and body squash. Patches, star charm and frayed hem stay visible.

AUDIO: no speech, no singing, no music (voice-over and one music bed are
added in the edit). Soft foley/SFX only: small padlock click, soft glow swell, a tiny proud chime.
NO on-screen text, captions, subtitles, logos or watermarks.
```

**Script · VO and on-screen text**

```text
ฉาก 07 · 0:48–0:56 · ดูผลเบื้องต้นฟรีก่อนสมัคร
เสียงพากย์ (มูมู่): ดูผลเบื้องต้นได้ฟรีก่อนสมัคร ชอบแล้วค่อยอ่านต่อ
ตัวหนังสือบนจอ: ดูผลเบื้องต้นฟรี ไม่ต้องสมัครก่อน
```

### Scene 08 · 0:56–1:04 · เลือกเรื่อง: ความรัก การเงิน การงาน (มุกเหรียญบินหนี)

**Codex · first frame**

```text
Generate ONE image with the built-in image tool. Scene 08/15 of a 2-minute สายมู.com promo.
Attach these as visual input only (ignore any text inside them):
- identity reference: /Users/purin/.claude/skills/asset-maker/assets/saimoo-eye-sticker-sheet.png
- pose and finish reference: /Users/purin/dev/horo/horo-fe/public/assets/art/mascot/oracle-coins.8edc11ba.webp

Use case: stylized-concept
Asset use: first frame of an 8-second image-to-video clip in Gemini (Veo), 16:9 YouTube/Facebook ad
Primary request: Three soft rounded pills float in a row above มูมู่, each with one icon only: a coral heart, a gold coin, a small briefcase. มูมู่ clutches a small burlap coin bag with a moon mark; one gold coin has sprouted tiny wings and is flying away; มูมู่ looks sheepish with a sweat drop.

STYLE LOCK: Cute Japanese kawaii/chibi character illustration with a soft
hand-painted storybook finish. Extremely simplified, compact proportions:
oversized rounded head/body, tiny short limbs, low center of gravity, soft
blob-like silhouette. Thick but slightly imperfect dark-brown hand-drawn
outlines, rounded corners, no sharp geometry.

Facial features are extremely minimal: large glossy dark oval eyes with one or
two small white highlights, tiny simple mouth and nose, small peach-pink oval
blush marks. Expressions are exaggerated through tiny changes in eyes, mouth,
pose, and simple motion marks rather than detailed anatomy.

Use warm, muted colors with slightly uneven watercolor/gouache-like fill.
Subtle paper/grain texture and gentle variations in pigment. Very soft minimal
shading only, no realistic lighting, no gradients, no glossy 3D rendering.

Keep the subject recognizable but heavily simplify its real anatomy into the
same rounded visual language. Preserve only its most distinctive identifying
features, markings, colors, or shape. Do not increase anatomical detail just
because the subject changes.

Composition feels like a Japanese character sticker/children's illustration:
isolated character on warm off-white/cream paper background, lots of negative
space, no detailed environment. Optional tiny hand-drawn accent symbols such as
hearts, sparkles, music notes, sweat marks, Z's, or motion lines.

CONSISTENCY RULE: Every subject belongs to the exact same fictional character
universe. Maintain identical outline weight, eye design, blush design, texture,
color softness, level of detail, proportions, shading, and background treatment
across every image. Only the subject's identifying features and pose should
change.

SUBJECT: สายมู.com "มูมู่", a broke but hopeful fortune-teller mascot.
Identity reference: saimoo-eye-sticker-sheet.png; match it exactly.
Keep: one large eye on a round cream face, deep violet iris with tiny star
flecks and two white highlights, peach-pink blush on both sides; oversized
lavender wizard hood drooping to one side with a gold bead and dangling gold
star charm; two or three yellow star prints; two or three beige square patches
with dark cross-stitches; fuzzy lavender, beige, and dusty rose cloak with a
ragged frayed hem; small lavender mitten hands; tiny dark feet.
The eye IS the whole face: one eye only, no mouth, no nose, no second eye.
Hood and eye are about two thirds of the height; squat bottom-heavy blob.
Vibe: ยาจก สู้ชีวิต, patched and down on luck but determined and funny.
Pose anchor: worried clutching a coin bag while coins fly off.

Material treatment: watercolor/gouache fill on paper grain; no material dial
Lighting: none beyond very soft minimal shading
Composition: 16:9 full frame on plain warm cream paper, no scenery. Pills across the upper third with space under each for a Thai label; มูมู่ lower centre.
Keep every key element inside the centre 80% and leave room for motion.
Background weight: minimal; มูมู่ at about 35% visual weight; props 10-20%
Palette: warm cream paper #FEFAEF with grain, deep plum #2E0535, coral red #F14A4B, pale lavender #D7B4E1, mid purple #A160A0, one warm-gold accent
Text (verbatim): none. No letters, numbers, Thai or English anywhere; cards and scrolls show only icons or blank lines.
Output target: 1920x1080 PNG, opaque cream paper (no transparency)
Save as: /Users/purin/Downloads/asset-maker/saimoo-ad-personalization/s08-love-money-work.png (never overwrite; add -v2 if it exists)
Avoid: second eye, mouth on the face, nose, missing patches, clean new robe, 3D or clay rendering, detailed environment, room, street, landscape, furniture, begging bowl, grime, tears of misery, clutter, copied marks from the reference, any letters, numbers, Thai or English text, watermark, signature

QA before you finish: one eye only and no mouth; hood droops with gold bead and star charm; cross-stitched patches visible;
frayed hem; thick wobbly dark-brown outline; gouache fill with paper grain; plain cream background;
no text anywhere. If one check fails, fix only that and regenerate once.
```

**Gemini · 8s clip**

```text
Animate the attached image as the first frame. 8 seconds, 16:9, 1080p.

ACTION: The three pills pop in one by one. The coin pill wiggles, a winged coin flaps out of the one-eyed hooded mascot's bag and flutters off-screen; the one-eyed hooded mascot reaches after it, sweat drop, then shrugs and taps the heart pill.
CAMERA: Locked-off medium, small tilt up to follow the flying coin.

STYLE: keep the exact look of the first frame: hand-painted kawaii storybook,
gouache fill with paper grain, thick wobbly dark-brown outlines, plain warm
cream paper background. Animate like a gentle 2D picture book (soft squash and
stretch, floating, wobble), never 3D, never photoreal, no lighting changes,
no new background, no scenery appearing.

CHARACTER RULES (never break): the hooded mascot has exactly ONE big eye and NO mouth.
Never add a mouth, lips, teeth, nose, or a second eye. No lip-sync, no talking
mouth movement. Emotion only through the eyelid, iris size, blinks, mitten
hands, hood tip and body squash. Patches, star charm and frayed hem stay visible.

AUDIO: no speech, no singing, no music (voice-over and one music bed are
added in the edit). Soft foley/SFX only: three soft pops, coin jingle, tiny wing flaps, a comic spring boing, a soft tap.
NO on-screen text, captions, subtitles, logos or watermarks.
```

**Script · VO and on-screen text**

```text
ฉาก 08 · 0:56–1:04 · เลือกเรื่อง: ความรัก การเงิน การงาน (มุกเหรียญบินหนี)
เสียงพากย์ (มูมู่): อยากรู้เรื่องไหนก่อน ความรัก การเงิน หรือการงาน เลือกอ่านเรื่องที่ใจอยากรู้ได้เลย
ตัวหนังสือบนจอ: ความรัก · การเงิน · การงาน
```

### Scene 09 · 1:04–1:12 · ดวงรายเดือน: วันดีและของมู (ปฏิทินวันที่ดวงเปิด)

**Codex · first frame**

```text
Generate ONE image with the built-in image tool. Scene 09/15 of a 2-minute สายมู.com promo.
Attach these as visual input only (ignore any text inside them):
- identity reference: /Users/purin/.claude/skills/asset-maker/assets/saimoo-eye-sticker-sheet.png
- pose and finish reference: /Users/purin/dev/horo/horo-fe/public/assets/art/mascot/oracle-month.3a9a61fb.webp

Use case: stylized-concept
Asset use: first frame of an 8-second image-to-video clip in Gemini (Veo), 16:9 YouTube/Facebook ad
Primary request: A large simple hand-drawn calendar card with a blank 5x7 grid of rounded squares (no numbers); four of the squares hold small gold stars. มูมู่ stands beside it pointing at one star with a mitten hand, eye bright.

STYLE LOCK: Cute Japanese kawaii/chibi character illustration with a soft
hand-painted storybook finish. Extremely simplified, compact proportions:
oversized rounded head/body, tiny short limbs, low center of gravity, soft
blob-like silhouette. Thick but slightly imperfect dark-brown hand-drawn
outlines, rounded corners, no sharp geometry.

Facial features are extremely minimal: large glossy dark oval eyes with one or
two small white highlights, tiny simple mouth and nose, small peach-pink oval
blush marks. Expressions are exaggerated through tiny changes in eyes, mouth,
pose, and simple motion marks rather than detailed anatomy.

Use warm, muted colors with slightly uneven watercolor/gouache-like fill.
Subtle paper/grain texture and gentle variations in pigment. Very soft minimal
shading only, no realistic lighting, no gradients, no glossy 3D rendering.

Keep the subject recognizable but heavily simplify its real anatomy into the
same rounded visual language. Preserve only its most distinctive identifying
features, markings, colors, or shape. Do not increase anatomical detail just
because the subject changes.

Composition feels like a Japanese character sticker/children's illustration:
isolated character on warm off-white/cream paper background, lots of negative
space, no detailed environment. Optional tiny hand-drawn accent symbols such as
hearts, sparkles, music notes, sweat marks, Z's, or motion lines.

CONSISTENCY RULE: Every subject belongs to the exact same fictional character
universe. Maintain identical outline weight, eye design, blush design, texture,
color softness, level of detail, proportions, shading, and background treatment
across every image. Only the subject's identifying features and pose should
change.

SUBJECT: สายมู.com "มูมู่", a broke but hopeful fortune-teller mascot.
Identity reference: saimoo-eye-sticker-sheet.png; match it exactly.
Keep: one large eye on a round cream face, deep violet iris with tiny star
flecks and two white highlights, peach-pink blush on both sides; oversized
lavender wizard hood drooping to one side with a gold bead and dangling gold
star charm; two or three yellow star prints; two or three beige square patches
with dark cross-stitches; fuzzy lavender, beige, and dusty rose cloak with a
ragged frayed hem; small lavender mitten hands; tiny dark feet.
The eye IS the whole face: one eye only, no mouth, no nose, no second eye.
Hood and eye are about two thirds of the height; squat bottom-heavy blob.
Vibe: ยาจก สู้ชีวิต, patched and down on luck but determined and funny.
Pose anchor: reading tarot cards (a month card instead).

Material treatment: watercolor/gouache fill on paper grain; no material dial
Lighting: none beyond very soft minimal shading
Composition: 16:9 full frame on plain warm cream paper, no scenery. Calendar card left/centre, มูมู่ lower right; keep the top 18% plain paper for a caption.
Keep every key element inside the centre 80% and leave room for motion.
Background weight: minimal; มูมู่ at about 30% visual weight; props 10-20%
Palette: warm cream paper #FEFAEF with grain, deep plum #2E0535, coral red #F14A4B, pale lavender #D7B4E1, mid purple #A160A0, one warm-gold accent
Text (verbatim): none. No letters, numbers, Thai or English anywhere; cards and scrolls show only icons or blank lines.
Output target: 1920x1080 PNG, opaque cream paper (no transparency)
Save as: /Users/purin/Downloads/asset-maker/saimoo-ad-personalization/s09-monthly-good-days.png (never overwrite; add -v2 if it exists)
Avoid: second eye, mouth on the face, nose, missing patches, clean new robe, 3D or clay rendering, detailed environment, room, street, landscape, furniture, begging bowl, grime, tears of misery, clutter, copied marks from the reference, any letters, numbers, Thai or English text, watermark, signature

QA before you finish: one eye only and no mouth; hood droops with gold bead and star charm; cross-stitched patches visible;
frayed hem; thick wobbly dark-brown outline; gouache fill with paper grain; plain cream background;
no text anywhere. If one check fails, fix only that and regenerate once.
```

**Gemini · 8s clip**

```text
Animate the attached image as the first frame. 8 seconds, 16:9, 1080p.

ACTION: Gold stars pop into four squares one at a time with a tiny twinkle; the one-eyed hooded mascot hops and taps the brightest one, which pulses.
CAMERA: Slow push-in toward the starred squares.

STYLE: keep the exact look of the first frame: hand-painted kawaii storybook,
gouache fill with paper grain, thick wobbly dark-brown outlines, plain warm
cream paper background. Animate like a gentle 2D picture book (soft squash and
stretch, floating, wobble), never 3D, never photoreal, no lighting changes,
no new background, no scenery appearing.

CHARACTER RULES (never break): the hooded mascot has exactly ONE big eye and NO mouth.
Never add a mouth, lips, teeth, nose, or a second eye. No lip-sync, no talking
mouth movement. Emotion only through the eyelid, iris size, blinks, mitten
hands, hood tip and body squash. Patches, star charm and frayed hem stay visible.

AUDIO: no speech, no singing, no music (voice-over and one music bed are
added in the edit). Soft foley/SFX only: four soft twinkle pops, a light tap, a gentle chime.
NO on-screen text, captions, subtitles, logos or watermarks.
```

**Script · VO and on-screen text**

```text
ฉาก 09 · 1:04–1:12 · ดวงรายเดือน: วันดีและของมู (ปฏิทินวันที่ดวงเปิด)
เสียงพากย์ (มูมู่): ดวงรายเดือนมีปฏิทินบอกวันที่ดวงเปิดของคุณ วางแผนได้ง่ายขึ้น
ตัวหนังสือบนจอ: ดวงรายเดือน · วันดีและของมู
```

### Scene 10 · 1:12–1:20 · คนรอบตัวเดือนนี้

**Codex · first frame**

```text
Generate ONE image with the built-in image tool. Scene 10/15 of a 2-minute สายมู.com promo.
Attach these as visual input only (ignore any text inside them):
- identity reference: /Users/purin/.claude/skills/asset-maker/assets/saimoo-eye-sticker-sheet.png
- pose and finish reference: /Users/purin/dev/horo/horo-fe/public/assets/art/mascot/oracle-shy.2f714f44.webp

Use case: stylized-concept
Asset use: first frame of an 8-second image-to-video clip in Gemini (Veo), 16:9 YouTube/Facebook ad
Primary request: Two simple rounded speech bubbles float above มูมู่: the left one coral with a small sparkle inside, the right one pale lavender with a tiny leaf inside (meaning take it slow). No faces, no people. มูมู่ looks up between them, one mitten hand raised thoughtfully.

STYLE LOCK: Cute Japanese kawaii/chibi character illustration with a soft
hand-painted storybook finish. Extremely simplified, compact proportions:
oversized rounded head/body, tiny short limbs, low center of gravity, soft
blob-like silhouette. Thick but slightly imperfect dark-brown hand-drawn
outlines, rounded corners, no sharp geometry.

Facial features are extremely minimal: large glossy dark oval eyes with one or
two small white highlights, tiny simple mouth and nose, small peach-pink oval
blush marks. Expressions are exaggerated through tiny changes in eyes, mouth,
pose, and simple motion marks rather than detailed anatomy.

Use warm, muted colors with slightly uneven watercolor/gouache-like fill.
Subtle paper/grain texture and gentle variations in pigment. Very soft minimal
shading only, no realistic lighting, no gradients, no glossy 3D rendering.

Keep the subject recognizable but heavily simplify its real anatomy into the
same rounded visual language. Preserve only its most distinctive identifying
features, markings, colors, or shape. Do not increase anatomical detail just
because the subject changes.

Composition feels like a Japanese character sticker/children's illustration:
isolated character on warm off-white/cream paper background, lots of negative
space, no detailed environment. Optional tiny hand-drawn accent symbols such as
hearts, sparkles, music notes, sweat marks, Z's, or motion lines.

CONSISTENCY RULE: Every subject belongs to the exact same fictional character
universe. Maintain identical outline weight, eye design, blush design, texture,
color softness, level of detail, proportions, shading, and background treatment
across every image. Only the subject's identifying features and pose should
change.

SUBJECT: สายมู.com "มูมู่", a broke but hopeful fortune-teller mascot.
Identity reference: saimoo-eye-sticker-sheet.png; match it exactly.
Keep: one large eye on a round cream face, deep violet iris with tiny star
flecks and two white highlights, peach-pink blush on both sides; oversized
lavender wizard hood drooping to one side with a gold bead and dangling gold
star charm; two or three yellow star prints; two or three beige square patches
with dark cross-stitches; fuzzy lavender, beige, and dusty rose cloak with a
ragged frayed hem; small lavender mitten hands; tiny dark feet.
The eye IS the whole face: one eye only, no mouth, no nose, no second eye.
Hood and eye are about two thirds of the height; squat bottom-heavy blob.
Vibe: ยาจก สู้ชีวิต, patched and down on luck but determined and funny.
Pose anchor: peeking (shy variant).

Material treatment: watercolor/gouache fill on paper grain; no material dial
Lighting: none beyond very soft minimal shading
Composition: 16:9 full frame on plain warm cream paper, no scenery. Bubbles across the upper half with room under each for a Thai label; มูมู่ lower centre.
Keep every key element inside the centre 80% and leave room for motion.
Background weight: minimal; มูมู่ at about 35% visual weight; props 10-20%
Palette: warm cream paper #FEFAEF with grain, deep plum #2E0535, coral red #F14A4B, pale lavender #D7B4E1, mid purple #A160A0, one warm-gold accent
Text (verbatim): none. No letters, numbers, Thai or English anywhere; cards and scrolls show only icons or blank lines.
Output target: 1920x1080 PNG, opaque cream paper (no transparency)
Save as: /Users/purin/Downloads/asset-maker/saimoo-ad-personalization/s10-people-around-you.png (never overwrite; add -v2 if it exists)
Avoid: second eye, mouth on the face, nose, missing patches, clean new robe, 3D or clay rendering, detailed environment, room, street, landscape, furniture, begging bowl, grime, tears of misery, clutter, copied marks from the reference, any letters, numbers, Thai or English text, watermark, signature

QA before you finish: one eye only and no mouth; hood droops with gold bead and star charm; cross-stitched patches visible;
frayed hem; thick wobbly dark-brown outline; gouache fill with paper grain; plain cream background;
no text anywhere. If one check fails, fix only that and regenerate once.
```

**Gemini · 8s clip**

```text
Animate the attached image as the first frame. 8 seconds, 16:9, 1080p.

ACTION: The coral bubble bounces in lively; the lavender bubble drifts in slowly and gently sways; the one-eyed hooded mascot nods toward the coral one, then raises a calm 'wait' mitten toward the lavender one.
CAMERA: Locked-off medium.

STYLE: keep the exact look of the first frame: hand-painted kawaii storybook,
gouache fill with paper grain, thick wobbly dark-brown outlines, plain warm
cream paper background. Animate like a gentle 2D picture book (soft squash and
stretch, floating, wobble), never 3D, never photoreal, no lighting changes,
no new background, no scenery appearing.

CHARACTER RULES (never break): the hooded mascot has exactly ONE big eye and NO mouth.
Never add a mouth, lips, teeth, nose, or a second eye. No lip-sync, no talking
mouth movement. Emotion only through the eyelid, iris size, blinks, mitten
hands, hood tip and body squash. Patches, star charm and frayed hem stay visible.

AUDIO: no speech, no singing, no music (voice-over and one music bed are
added in the edit). Soft foley/SFX only: bright bubble pop, slow soft pop, a light leaf rustle.
NO on-screen text, captions, subtitles, logos or watermarks.
```

**Script · VO and on-screen text**

```text
ฉาก 10 · 1:12–1:20 · คนรอบตัวเดือนนี้
เสียงพากย์ (มูมู่): มีบอกด้วยว่าเดือนนี้คุยกับใครได้เต็มที่ กับใครควรใจเย็นไว้ก่อน
ตัวหนังสือบนจอ: คนรอบตัวเดือนนี้ · คุยได้เต็มที่ / ใจเย็นไว้ก่อน
```

### Scene 11 · 1:20–1:28 · สีและเลขของคุณ + มูให้ถูกเดือน

**Codex · first frame**

```text
Generate ONE image with the built-in image tool. Scene 11/15 of a 2-minute สายมู.com promo.
Attach these as visual input only (ignore any text inside them):
- identity reference: /Users/purin/.claude/skills/asset-maker/assets/saimoo-eye-sticker-sheet.png
- pose and finish reference: /Users/purin/dev/horo/horo-fe/public/assets/art/mascot/oracle-star.89778037.webp

Use case: stylized-concept
Asset use: first frame of an 8-second image-to-video clip in Gemini (Veo), 16:9 YouTube/Facebook ad
Primary request: มูมู่ holds up a small glowing gold star. Around it float three round paint-dab color swatches (coral, lavender, gold) and two small round blank pebbles (where lucky numbers will be overlaid).

STYLE LOCK: Cute Japanese kawaii/chibi character illustration with a soft
hand-painted storybook finish. Extremely simplified, compact proportions:
oversized rounded head/body, tiny short limbs, low center of gravity, soft
blob-like silhouette. Thick but slightly imperfect dark-brown hand-drawn
outlines, rounded corners, no sharp geometry.

Facial features are extremely minimal: large glossy dark oval eyes with one or
two small white highlights, tiny simple mouth and nose, small peach-pink oval
blush marks. Expressions are exaggerated through tiny changes in eyes, mouth,
pose, and simple motion marks rather than detailed anatomy.

Use warm, muted colors with slightly uneven watercolor/gouache-like fill.
Subtle paper/grain texture and gentle variations in pigment. Very soft minimal
shading only, no realistic lighting, no gradients, no glossy 3D rendering.

Keep the subject recognizable but heavily simplify its real anatomy into the
same rounded visual language. Preserve only its most distinctive identifying
features, markings, colors, or shape. Do not increase anatomical detail just
because the subject changes.

Composition feels like a Japanese character sticker/children's illustration:
isolated character on warm off-white/cream paper background, lots of negative
space, no detailed environment. Optional tiny hand-drawn accent symbols such as
hearts, sparkles, music notes, sweat marks, Z's, or motion lines.

CONSISTENCY RULE: Every subject belongs to the exact same fictional character
universe. Maintain identical outline weight, eye design, blush design, texture,
color softness, level of detail, proportions, shading, and background treatment
across every image. Only the subject's identifying features and pose should
change.

SUBJECT: สายมู.com "มูมู่", a broke but hopeful fortune-teller mascot.
Identity reference: saimoo-eye-sticker-sheet.png; match it exactly.
Keep: one large eye on a round cream face, deep violet iris with tiny star
flecks and two white highlights, peach-pink blush on both sides; oversized
lavender wizard hood drooping to one side with a gold bead and dangling gold
star charm; two or three yellow star prints; two or three beige square patches
with dark cross-stitches; fuzzy lavender, beige, and dusty rose cloak with a
ragged frayed hem; small lavender mitten hands; tiny dark feet.
The eye IS the whole face: one eye only, no mouth, no nose, no second eye.
Hood and eye are about two thirds of the height; squat bottom-heavy blob.
Vibe: ยาจก สู้ชีวิต, patched and down on luck but determined and funny.
Pose anchor: holding a glowing star.

Material treatment: watercolor/gouache fill on paper grain; no material dial
Lighting: none beyond very soft minimal shading
Composition: 16:9 full frame on plain warm cream paper, no scenery. มูมู่ centre-low; swatches and pebbles in a loose ring above it; keep the bottom 18% plain paper.
Keep every key element inside the centre 80% and leave room for motion.
Background weight: minimal; มูมู่ at about 40% visual weight; props 10-20%
Palette: warm cream paper #FEFAEF with grain, deep plum #2E0535, coral red #F14A4B, pale lavender #D7B4E1, mid purple #A160A0, one warm-gold accent
Text (verbatim): none. No letters, numbers, Thai or English anywhere; cards and scrolls show only icons or blank lines.
Output target: 1920x1080 PNG, opaque cream paper (no transparency)
Save as: /Users/purin/Downloads/asset-maker/saimoo-ad-personalization/s11-colors-numbers-moo.png (never overwrite; add -v2 if it exists)
Avoid: second eye, mouth on the face, nose, missing patches, clean new robe, 3D or clay rendering, detailed environment, room, street, landscape, furniture, begging bowl, grime, tears of misery, clutter, copied marks from the reference, any letters, numbers, Thai or English text, watermark, signature

QA before you finish: one eye only and no mouth; hood droops with gold bead and star charm; cross-stitched patches visible;
frayed hem; thick wobbly dark-brown outline; gouache fill with paper grain; plain cream background;
no text anywhere. If one check fails, fix only that and regenerate once.
```

**Gemini · 8s clip**

```text
Animate the attached image as the first frame. 8 seconds, 16:9, 1080p.

ACTION: The swatches and pebbles orbit slowly around the star; the one-eyed hooded mascot lifts the star higher and it glows; everything settles into a neat ring.
CAMERA: Slow upward tilt from the mascot to the star.

STYLE: keep the exact look of the first frame: hand-painted kawaii storybook,
gouache fill with paper grain, thick wobbly dark-brown outlines, plain warm
cream paper background. Animate like a gentle 2D picture book (soft squash and
stretch, floating, wobble), never 3D, never photoreal, no lighting changes,
no new background, no scenery appearing.

CHARACTER RULES (never break): the hooded mascot has exactly ONE big eye and NO mouth.
Never add a mouth, lips, teeth, nose, or a second eye. No lip-sync, no talking
mouth movement. Emotion only through the eyelid, iris size, blinks, mitten
hands, hood tip and body squash. Patches, star charm and frayed hem stay visible.

AUDIO: no speech, no singing, no music (voice-over and one music bed are
added in the edit). Soft foley/SFX only: soft orbit whoosh, gentle glow swell, one warm chime.
NO on-screen text, captions, subtitles, logos or watermarks.
```

**Script · VO and on-screen text**

```text
ฉาก 11 · 1:20–1:28 · สีและเลขของคุณ + มูให้ถูกเดือน
เสียงพากย์ (มูมู่): สีและเลขของคุณ กับวิธีมูให้ถูกเดือน ก็อ่านมาจากดวงของคุณเหมือนกัน
ตัวหนังสือบนจอ: สีและเลขของคุณ · มูให้ถูกเดือน
```

### Scene 12 · 1:28–1:36 · ฟังดวงรายเดือน

**Codex · first frame**

```text
Generate ONE image with the built-in image tool. Scene 12/15 of a 2-minute สายมู.com promo.
Attach these as visual input only (ignore any text inside them):
- identity reference: /Users/purin/.claude/skills/asset-maker/assets/saimoo-eye-sticker-sheet.png
- pose and finish reference: /Users/purin/dev/horo/horo-fe/public/assets/art/mascot/oracle-scroll.74cc0e78.webp

Use case: stylized-concept
Asset use: first frame of an 8-second image-to-video clip in Gemini (Veo), 16:9 YouTube/Facebook ad
Primary request: มูมู่ sits beside the old brass lantern holding an open reading scroll; three soft curved sound-wave lines and two tiny music notes rise from the scroll (not from มูมู่). Eye relaxed and content.

STYLE LOCK: Cute Japanese kawaii/chibi character illustration with a soft
hand-painted storybook finish. Extremely simplified, compact proportions:
oversized rounded head/body, tiny short limbs, low center of gravity, soft
blob-like silhouette. Thick but slightly imperfect dark-brown hand-drawn
outlines, rounded corners, no sharp geometry.

Facial features are extremely minimal: large glossy dark oval eyes with one or
two small white highlights, tiny simple mouth and nose, small peach-pink oval
blush marks. Expressions are exaggerated through tiny changes in eyes, mouth,
pose, and simple motion marks rather than detailed anatomy.

Use warm, muted colors with slightly uneven watercolor/gouache-like fill.
Subtle paper/grain texture and gentle variations in pigment. Very soft minimal
shading only, no realistic lighting, no gradients, no glossy 3D rendering.

Keep the subject recognizable but heavily simplify its real anatomy into the
same rounded visual language. Preserve only its most distinctive identifying
features, markings, colors, or shape. Do not increase anatomical detail just
because the subject changes.

Composition feels like a Japanese character sticker/children's illustration:
isolated character on warm off-white/cream paper background, lots of negative
space, no detailed environment. Optional tiny hand-drawn accent symbols such as
hearts, sparkles, music notes, sweat marks, Z's, or motion lines.

CONSISTENCY RULE: Every subject belongs to the exact same fictional character
universe. Maintain identical outline weight, eye design, blush design, texture,
color softness, level of detail, proportions, shading, and background treatment
across every image. Only the subject's identifying features and pose should
change.

SUBJECT: สายมู.com "มูมู่", a broke but hopeful fortune-teller mascot.
Identity reference: saimoo-eye-sticker-sheet.png; match it exactly.
Keep: one large eye on a round cream face, deep violet iris with tiny star
flecks and two white highlights, peach-pink blush on both sides; oversized
lavender wizard hood drooping to one side with a gold bead and dangling gold
star charm; two or three yellow star prints; two or three beige square patches
with dark cross-stitches; fuzzy lavender, beige, and dusty rose cloak with a
ragged frayed hem; small lavender mitten hands; tiny dark feet.
The eye IS the whole face: one eye only, no mouth, no nose, no second eye.
Hood and eye are about two thirds of the height; squat bottom-heavy blob.
Vibe: ยาจก สู้ชีวิต, patched and down on luck but determined and funny.
Pose anchor: asleep by a lantern (awake, holding a scroll).

Material treatment: watercolor/gouache fill on paper grain; no material dial
Lighting: none beyond very soft minimal shading
Composition: 16:9 full frame on plain warm cream paper, no scenery. มูมู่ and lantern lower left; sound waves rising toward the upper right; keep the top-right 35% plain.
Keep every key element inside the centre 80% and leave room for motion.
Background weight: minimal; มูมู่ at about 40% visual weight; props 10-20%
Palette: warm cream paper #FEFAEF with grain, deep plum #2E0535, coral red #F14A4B, pale lavender #D7B4E1, mid purple #A160A0, one warm-gold accent
Text (verbatim): none. No letters, numbers, Thai or English anywhere; cards and scrolls show only icons or blank lines.
Output target: 1920x1080 PNG, opaque cream paper (no transparency)
Save as: /Users/purin/Downloads/asset-maker/saimoo-ad-personalization/s12-listen-to-reading.png (never overwrite; add -v2 if it exists)
Avoid: second eye, mouth on the face, nose, missing patches, clean new robe, 3D or clay rendering, detailed environment, room, street, landscape, furniture, begging bowl, grime, tears of misery, clutter, copied marks from the reference, any letters, numbers, Thai or English text, watermark, signature

QA before you finish: one eye only and no mouth; hood droops with gold bead and star charm; cross-stitched patches visible;
frayed hem; thick wobbly dark-brown outline; gouache fill with paper grain; plain cream background;
no text anywhere. If one check fails, fix only that and regenerate once.
```

**Gemini · 8s clip**

```text
Animate the attached image as the first frame. 8 seconds, 16:9, 1080p.

ACTION: Sound-wave lines ripple out of the scroll in a slow rhythm; the one-eyed hooded mascot sways gently and half-closes its eye into a content curve; the lantern flickers.
CAMERA: Very slow push-in.

STYLE: keep the exact look of the first frame: hand-painted kawaii storybook,
gouache fill with paper grain, thick wobbly dark-brown outlines, plain warm
cream paper background. Animate like a gentle 2D picture book (soft squash and
stretch, floating, wobble), never 3D, never photoreal, no lighting changes,
no new background, no scenery appearing.

CHARACTER RULES (never break): the hooded mascot has exactly ONE big eye and NO mouth.
Never add a mouth, lips, teeth, nose, or a second eye. No lip-sync, no talking
mouth movement. Emotion only through the eyelid, iris size, blinks, mitten
hands, hood tip and body squash. Patches, star charm and frayed hem stay visible.

AUDIO: no speech, no singing, no music (voice-over and one music bed are
added in the edit). Soft foley/SFX only: soft paper rustle, gentle low hum of the waves, lantern flicker.
NO on-screen text, captions, subtitles, logos or watermarks.
```

**Script · VO and on-screen text**

```text
ฉาก 12 · 1:28–1:36 · ฟังดวงรายเดือน
เสียงพากย์ (มูมู่): ไม่สะดวกอ่าน กดฟังดวงรายเดือนแทนได้
ตัวหนังสือบนจอ: ฟังดวง
```

### Scene 13 · 1:36–1:44 · ดวงคู่

**Codex · first frame**

```text
Generate ONE image with the built-in image tool. Scene 13/15 of a 2-minute สายมู.com promo.
Attach these as visual input only (ignore any text inside them):
- identity reference: /Users/purin/.claude/skills/asset-maker/assets/saimoo-eye-sticker-sheet.png
- pose and finish reference: /Users/purin/dev/horo/horo-fe/public/assets/art/mascot/oracle-heart-pray.fb435ac3.webp

Use case: stylized-concept
Asset use: first frame of an 8-second image-to-video clip in Gemini (Veo), 16:9 YouTube/Facebook ad
Primary request: Two small cream birth cards float apart at the top, each with one tiny calendar icon and blank lines; a dotted gold line with a small coral heart in the middle connects them. Below, มูมู่ holds its mitten hands together hopefully, eye shining.

STYLE LOCK: Cute Japanese kawaii/chibi character illustration with a soft
hand-painted storybook finish. Extremely simplified, compact proportions:
oversized rounded head/body, tiny short limbs, low center of gravity, soft
blob-like silhouette. Thick but slightly imperfect dark-brown hand-drawn
outlines, rounded corners, no sharp geometry.

Facial features are extremely minimal: large glossy dark oval eyes with one or
two small white highlights, tiny simple mouth and nose, small peach-pink oval
blush marks. Expressions are exaggerated through tiny changes in eyes, mouth,
pose, and simple motion marks rather than detailed anatomy.

Use warm, muted colors with slightly uneven watercolor/gouache-like fill.
Subtle paper/grain texture and gentle variations in pigment. Very soft minimal
shading only, no realistic lighting, no gradients, no glossy 3D rendering.

Keep the subject recognizable but heavily simplify its real anatomy into the
same rounded visual language. Preserve only its most distinctive identifying
features, markings, colors, or shape. Do not increase anatomical detail just
because the subject changes.

Composition feels like a Japanese character sticker/children's illustration:
isolated character on warm off-white/cream paper background, lots of negative
space, no detailed environment. Optional tiny hand-drawn accent symbols such as
hearts, sparkles, music notes, sweat marks, Z's, or motion lines.

CONSISTENCY RULE: Every subject belongs to the exact same fictional character
universe. Maintain identical outline weight, eye design, blush design, texture,
color softness, level of detail, proportions, shading, and background treatment
across every image. Only the subject's identifying features and pose should
change.

SUBJECT: สายมู.com "มูมู่", a broke but hopeful fortune-teller mascot.
Identity reference: saimoo-eye-sticker-sheet.png; match it exactly.
Keep: one large eye on a round cream face, deep violet iris with tiny star
flecks and two white highlights, peach-pink blush on both sides; oversized
lavender wizard hood drooping to one side with a gold bead and dangling gold
star charm; two or three yellow star prints; two or three beige square patches
with dark cross-stitches; fuzzy lavender, beige, and dusty rose cloak with a
ragged frayed hem; small lavender mitten hands; tiny dark feet.
The eye IS the whole face: one eye only, no mouth, no nose, no second eye.
Hood and eye are about two thirds of the height; squat bottom-heavy blob.
Vibe: ยาจก สู้ชีวิต, patched and down on luck but determined and funny.
Pose anchor: content hugging a star (hands together).

Material treatment: watercolor/gouache fill on paper grain; no material dial
Lighting: none beyond very soft minimal shading
Composition: 16:9 full frame on plain warm cream paper, no scenery. Cards upper left and upper right, heart line between; มูมู่ lower centre.
Keep every key element inside the centre 80% and leave room for motion.
Background weight: minimal; มูมู่ at about 35% visual weight; props 10-20%
Palette: warm cream paper #FEFAEF with grain, deep plum #2E0535, coral red #F14A4B, pale lavender #D7B4E1, mid purple #A160A0, one warm-gold accent
Text (verbatim): none. No letters, numbers, Thai or English anywhere; cards and scrolls show only icons or blank lines.
Output target: 1920x1080 PNG, opaque cream paper (no transparency)
Save as: /Users/purin/Downloads/asset-maker/saimoo-ad-personalization/s13-compatibility.png (never overwrite; add -v2 if it exists)
Avoid: second eye, mouth on the face, nose, missing patches, clean new robe, 3D or clay rendering, detailed environment, room, street, landscape, furniture, begging bowl, grime, tears of misery, clutter, copied marks from the reference, any letters, numbers, Thai or English text, watermark, signature

QA before you finish: one eye only and no mouth; hood droops with gold bead and star charm; cross-stitched patches visible;
frayed hem; thick wobbly dark-brown outline; gouache fill with paper grain; plain cream background;
no text anywhere. If one check fails, fix only that and regenerate once.
```

**Gemini · 8s clip**

```text
Animate the attached image as the first frame. 8 seconds, 16:9, 1080p.

ACTION: The two cards drift toward each other; the dotted line draws itself and the little heart pulses twice; the one-eyed hooded mascot clasps its mittens and does a tiny hopeful wiggle.
CAMERA: Locked-off, slight push-in on the heart.

STYLE: keep the exact look of the first frame: hand-painted kawaii storybook,
gouache fill with paper grain, thick wobbly dark-brown outlines, plain warm
cream paper background. Animate like a gentle 2D picture book (soft squash and
stretch, floating, wobble), never 3D, never photoreal, no lighting changes,
no new background, no scenery appearing.

CHARACTER RULES (never break): the hooded mascot has exactly ONE big eye and NO mouth.
Never add a mouth, lips, teeth, nose, or a second eye. No lip-sync, no talking
mouth movement. Emotion only through the eyelid, iris size, blinks, mitten
hands, hood tip and body squash. Patches, star charm and frayed hem stay visible.

AUDIO: no speech, no singing, no music (voice-over and one music bed are
added in the edit). Soft foley/SFX only: two soft paper floats, dotted-line shimmer, two gentle heartbeat thumps.
NO on-screen text, captions, subtitles, logos or watermarks.
```

**Script · VO and on-screen text**

```text
ฉาก 13 · 1:36–1:44 · ดวงคู่
เสียงพากย์ (มูมู่): อยากรู้ว่าเข้ากับเขาแค่ไหน ลองดวงคู่ อ่านจากข้อมูลของทั้งสองคน
ตัวหนังสือบนจอ: ดวงคู่
```

### Scene 14 · 1:44–1:52 · คำสัญญา: ไม่ตัดสินแทน แค่ช่วยให้มองชัดขึ้น

**Codex · first frame**

```text
Generate ONE image with the built-in image tool. Scene 14/15 of a 2-minute สายมู.com promo.
Attach these as visual input only (ignore any text inside them):
- identity reference: /Users/purin/.claude/skills/asset-maker/assets/saimoo-eye-sticker-sheet.png
- pose and finish reference: /Users/purin/dev/horo/horo-fe/public/assets/art/mascot/oracle-star.89778037.webp

Use case: stylized-concept
Asset use: first frame of an 8-second image-to-video clip in Gemini (Veo), 16:9 YouTube/Facebook ad
Primary request: มูมู่ hugging a big soft gold star to its chest, eye closed into one happy curved line, peach blush glowing. A few tiny sparkles around. Quiet, warm moment.

STYLE LOCK: Cute Japanese kawaii/chibi character illustration with a soft
hand-painted storybook finish. Extremely simplified, compact proportions:
oversized rounded head/body, tiny short limbs, low center of gravity, soft
blob-like silhouette. Thick but slightly imperfect dark-brown hand-drawn
outlines, rounded corners, no sharp geometry.

Facial features are extremely minimal: large glossy dark oval eyes with one or
two small white highlights, tiny simple mouth and nose, small peach-pink oval
blush marks. Expressions are exaggerated through tiny changes in eyes, mouth,
pose, and simple motion marks rather than detailed anatomy.

Use warm, muted colors with slightly uneven watercolor/gouache-like fill.
Subtle paper/grain texture and gentle variations in pigment. Very soft minimal
shading only, no realistic lighting, no gradients, no glossy 3D rendering.

Keep the subject recognizable but heavily simplify its real anatomy into the
same rounded visual language. Preserve only its most distinctive identifying
features, markings, colors, or shape. Do not increase anatomical detail just
because the subject changes.

Composition feels like a Japanese character sticker/children's illustration:
isolated character on warm off-white/cream paper background, lots of negative
space, no detailed environment. Optional tiny hand-drawn accent symbols such as
hearts, sparkles, music notes, sweat marks, Z's, or motion lines.

CONSISTENCY RULE: Every subject belongs to the exact same fictional character
universe. Maintain identical outline weight, eye design, blush design, texture,
color softness, level of detail, proportions, shading, and background treatment
across every image. Only the subject's identifying features and pose should
change.

SUBJECT: สายมู.com "มูมู่", a broke but hopeful fortune-teller mascot.
Identity reference: saimoo-eye-sticker-sheet.png; match it exactly.
Keep: one large eye on a round cream face, deep violet iris with tiny star
flecks and two white highlights, peach-pink blush on both sides; oversized
lavender wizard hood drooping to one side with a gold bead and dangling gold
star charm; two or three yellow star prints; two or three beige square patches
with dark cross-stitches; fuzzy lavender, beige, and dusty rose cloak with a
ragged frayed hem; small lavender mitten hands; tiny dark feet.
The eye IS the whole face: one eye only, no mouth, no nose, no second eye.
Hood and eye are about two thirds of the height; squat bottom-heavy blob.
Vibe: ยาจก สู้ชีวิต, patched and down on luck but determined and funny.
Pose anchor: content hugging a star.

Material treatment: watercolor/gouache fill on paper grain; no material dial
Lighting: none beyond very soft minimal shading
Composition: 16:9 full frame on plain warm cream paper, no scenery. มูมู่ centred; generous plain paper around it; keep the top 25% plain for a caption.
Keep every key element inside the centre 80% and leave room for motion.
Background weight: minimal; มูมู่ at about 45% visual weight; props 10-20%
Palette: warm cream paper #FEFAEF with grain, deep plum #2E0535, coral red #F14A4B, pale lavender #D7B4E1, mid purple #A160A0, one warm-gold accent
Text (verbatim): none. No letters, numbers, Thai or English anywhere; cards and scrolls show only icons or blank lines.
Output target: 1920x1080 PNG, opaque cream paper (no transparency)
Save as: /Users/purin/Downloads/asset-maker/saimoo-ad-personalization/s14-promise.png (never overwrite; add -v2 if it exists)
Avoid: second eye, mouth on the face, nose, missing patches, clean new robe, 3D or clay rendering, detailed environment, room, street, landscape, furniture, begging bowl, grime, tears of misery, clutter, copied marks from the reference, any letters, numbers, Thai or English text, watermark, signature

QA before you finish: one eye only and no mouth; hood droops with gold bead and star charm; cross-stitched patches visible;
frayed hem; thick wobbly dark-brown outline; gouache fill with paper grain; plain cream background;
no text anywhere. If one check fails, fix only that and regenerate once.
```

**Gemini · 8s clip**

```text
Animate the attached image as the first frame. 8 seconds, 16:9, 1080p.

ACTION: the one-eyed hooded mascot slowly squeezes the star; the star glows softly and releases a few tiny sparkles that drift up; the one-eyed hooded mascot opens its eye and looks at the viewer.
CAMERA: Slow, gentle push-in.

STYLE: keep the exact look of the first frame: hand-painted kawaii storybook,
gouache fill with paper grain, thick wobbly dark-brown outlines, plain warm
cream paper background. Animate like a gentle 2D picture book (soft squash and
stretch, floating, wobble), never 3D, never photoreal, no lighting changes,
no new background, no scenery appearing.

CHARACTER RULES (never break): the hooded mascot has exactly ONE big eye and NO mouth.
Never add a mouth, lips, teeth, nose, or a second eye. No lip-sync, no talking
mouth movement. Emotion only through the eyelid, iris size, blinks, mitten
hands, hood tip and body squash. Patches, star charm and frayed hem stay visible.

AUDIO: no speech, no singing, no music (voice-over and one music bed are
added in the edit). Soft foley/SFX only: soft glow swell, a few tiny sparkle twinkles.
NO on-screen text, captions, subtitles, logos or watermarks.
```

**Script · VO and on-screen text**

```text
ฉาก 14 · 1:44–1:52 · คำสัญญา: ไม่ตัดสินแทน แค่ช่วยให้มองชัดขึ้น
เสียงพากย์ (มูมู่): มูมู่ไม่ได้ตัดสินชีวิตแทนใคร แค่ช่วยให้คุณมองตัวเองชัดขึ้นอีกนิด
ตัวหนังสือบนจอ: ไม่ได้ตัดสินแทน · แค่ช่วยให้มองชัดขึ้น
```

### Scene 15 · 1:52–2:00 · CTA: สายมู.com เริ่มดูดวงฟรี

**Codex · first frame**

```text
Generate ONE image with the built-in image tool. Scene 15/15 of a 2-minute สายมู.com promo.
Attach these as visual input only (ignore any text inside them):
- identity reference: /Users/purin/.claude/skills/asset-maker/assets/saimoo-eye-sticker-sheet.png
- pose and finish reference: /Users/purin/dev/horo/horo-fe/public/assets/art/mascot/oracle-wave.36da2ac0.webp

Use case: stylized-concept
Asset use: first frame of an 8-second image-to-video clip in Gemini (Veo), 16:9 YouTube/Facebook ad
Primary request: มูมู่ waving goodbye with one mitten hand, eye bright, standing in the lower right; one small empty coral rounded button shape (no text) floats near the centre; two tiny sparkles.

STYLE LOCK: Cute Japanese kawaii/chibi character illustration with a soft
hand-painted storybook finish. Extremely simplified, compact proportions:
oversized rounded head/body, tiny short limbs, low center of gravity, soft
blob-like silhouette. Thick but slightly imperfect dark-brown hand-drawn
outlines, rounded corners, no sharp geometry.

Facial features are extremely minimal: large glossy dark oval eyes with one or
two small white highlights, tiny simple mouth and nose, small peach-pink oval
blush marks. Expressions are exaggerated through tiny changes in eyes, mouth,
pose, and simple motion marks rather than detailed anatomy.

Use warm, muted colors with slightly uneven watercolor/gouache-like fill.
Subtle paper/grain texture and gentle variations in pigment. Very soft minimal
shading only, no realistic lighting, no gradients, no glossy 3D rendering.

Keep the subject recognizable but heavily simplify its real anatomy into the
same rounded visual language. Preserve only its most distinctive identifying
features, markings, colors, or shape. Do not increase anatomical detail just
because the subject changes.

Composition feels like a Japanese character sticker/children's illustration:
isolated character on warm off-white/cream paper background, lots of negative
space, no detailed environment. Optional tiny hand-drawn accent symbols such as
hearts, sparkles, music notes, sweat marks, Z's, or motion lines.

CONSISTENCY RULE: Every subject belongs to the exact same fictional character
universe. Maintain identical outline weight, eye design, blush design, texture,
color softness, level of detail, proportions, shading, and background treatment
across every image. Only the subject's identifying features and pose should
change.

SUBJECT: สายมู.com "มูมู่", a broke but hopeful fortune-teller mascot.
Identity reference: saimoo-eye-sticker-sheet.png; match it exactly.
Keep: one large eye on a round cream face, deep violet iris with tiny star
flecks and two white highlights, peach-pink blush on both sides; oversized
lavender wizard hood drooping to one side with a gold bead and dangling gold
star charm; two or three yellow star prints; two or three beige square patches
with dark cross-stitches; fuzzy lavender, beige, and dusty rose cloak with a
ragged frayed hem; small lavender mitten hands; tiny dark feet.
The eye IS the whole face: one eye only, no mouth, no nose, no second eye.
Hood and eye are about two thirds of the height; squat bottom-heavy blob.
Vibe: ยาจก สู้ชีวิต, patched and down on luck but determined and funny.
Pose anchor: surprised hands-to-face (waving goodbye variant).

Material treatment: watercolor/gouache fill on paper grain; no material dial
Lighting: none beyond very soft minimal shading
Composition: 16:9 full frame on plain warm cream paper, no scenery. มูมู่ lower right at about 30% weight; the upper-left and centre 55% left as plain paper for the logo and the CTA text; the empty coral button sits at the centre.
Keep every key element inside the centre 80% and leave room for motion.
Background weight: minimal; มูมู่ at about 30% visual weight; props 10-20%
Palette: warm cream paper #FEFAEF with grain, deep plum #2E0535, coral red #F14A4B, pale lavender #D7B4E1, mid purple #A160A0, one warm-gold accent
Text (verbatim): none. No letters, numbers, Thai or English anywhere; cards and scrolls show only icons or blank lines.
Output target: 1920x1080 PNG, opaque cream paper (no transparency)
Save as: /Users/purin/Downloads/asset-maker/saimoo-ad-personalization/s15-cta-end-card.png (never overwrite; add -v2 if it exists)
Avoid: second eye, mouth on the face, nose, missing patches, clean new robe, 3D or clay rendering, detailed environment, room, street, landscape, furniture, begging bowl, grime, tears of misery, clutter, copied marks from the reference, any letters, numbers, Thai or English text, watermark, signature

QA before you finish: one eye only and no mouth; hood droops with gold bead and star charm; cross-stitched patches visible;
frayed hem; thick wobbly dark-brown outline; gouache fill with paper grain; plain cream background;
no text anywhere. If one check fails, fix only that and regenerate once.
```

**Gemini · 8s clip**

```text
Animate the attached image as the first frame. 8 seconds, 16:9, 1080p.

ACTION: the one-eyed hooded mascot waves, the hood star charm swings; the coral button gives one soft bounce and glows; sparkles twinkle. Hold still for the last 2 seconds.
CAMERA: Locked-off; hold the final frame.

STYLE: keep the exact look of the first frame: hand-painted kawaii storybook,
gouache fill with paper grain, thick wobbly dark-brown outlines, plain warm
cream paper background. Animate like a gentle 2D picture book (soft squash and
stretch, floating, wobble), never 3D, never photoreal, no lighting changes,
no new background, no scenery appearing.

CHARACTER RULES (never break): the hooded mascot has exactly ONE big eye and NO mouth.
Never add a mouth, lips, teeth, nose, or a second eye. No lip-sync, no talking
mouth movement. Emotion only through the eyelid, iris size, blinks, mitten
hands, hood tip and body squash. Patches, star charm and frayed hem stay visible.

AUDIO: no speech, no singing, no music (voice-over and one music bed are
added in the edit). Soft foley/SFX only: star charm jingle, soft button bounce, one closing chime.
NO on-screen text, captions, subtitles, logos or watermarks.
```

**Script · VO and on-screen text**

```text
ฉาก 15 · 1:52–2:00 · CTA: สายมู.com เริ่มดูดวงฟรี
เสียงพากย์ (มูมู่): สายมู.com เริ่มดูดวงฟรี จากวันเกิดของคุณเอง
ตัวหนังสือบนจอ: สายมู.com  ·  ปุ่ม: เริ่มดูดวงฟรี
```

## 6. Edit and done-when

**Edit order:** lay the 15 clips end to end (trim each to 8.0s), drop the VO on top and nudge each line to start about 0.3s into its clip, add the music bed at about −18 dB under the VO, then the Thai captions from the Script blocks in one rounded font (for example Mitr or Kanit) in deep plum `#2E0535` with coral `#F14A4B` for the CTA button. End card: the สายมู.com wordmark from `horo-fe/public/assets/art/brand/` plus the coral button "เริ่มดูดวงฟรี".

**Done when:**

- 15 keyframes exist in the save folder and each passes the QA line in its Codex block.
- 15 clips are 8s, keep the paper look, and มูมู่ never grows a mouth or a second eye.
- Total runtime is 2:00 ±2s; every VO line ends before its clip does.
- Every caption matches the Script block character for character (tone marks included).
- The ad makes no claim outside the allowed list in section 1.

