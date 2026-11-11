---
type: PLAN
status: on hold. Owner, later on 2026-11-11: keep the free preview as it is; only the gain/risk headings and the paid prompt framing changed
scope: the free part of every reading that needs an unlock (ดวงเดือน first, then ดวงคู่; ดวงการเรียน frame only)
last_reviewed: 2026-11-11
owner: product
---

# Free part that makes people want the rest

> **On hold (owner, later on 2026-11-11):** "Keep it as is". The free preview keeps its current fields and its advice;
> the diagnosis-only trim below is not being built. What shipped instead, uncommitted at the time of writing: the
> owner's two headings on the locked page, each area's second layer and the guide chapter, and paid-prompt framing
> (each warning names the bump and the way through; tips build on what the month supports, which the model follows only
> part of the time). Decisions 1, 3 and 4 below are paused, not reversed; decision 2 (the headings) is in force.

Owner ask (2026-11-11): the locked page should give enough to read and want more, not so much that there is no reason
to pay. Show the future they want to see, and the risk they can still get ahead of: "ตั้งรับให้ทัน เปลี่ยนร้ายให้เป็นดี",
"เสริมดวงที่ดีอยู่แล้วให้ทวีคูณ". This applies to every reading behind an unlock.

## The conflict to settle first

Two owner rules disagree, and the prompt follows the older one.

| Date | Rule | Where |
| --- | --- | --- |
| 2026-10-20/22 | The new monthly teaser must be "useful" on its own, because readers who used to get the whole month free were moved onto a teaser | `docs/monthly-fortune-bazi-monetization-plan.md` §126; prompt `horo-be/src/systems/fortune/monthly-generation.ts:74-81` ("คนอ่านต้องได้คำอ่านที่มีประโยชน์จริง แม้ไม่เปิดฉบับเต็ม", overview must say "วิธีใช้เดือนนี้ให้ดีขึ้นโดยไม่ต้องซื้อตั๋ว") |
| 2026-10-24 | "The free page is the diagnosis, the paid page the prescription: nothing on the locked page gives advice away" | horo-fe `DESIGN.md`, Monthly page structure |

This plan proposes the 10-24 rule wins: free says what and roughly when, paid says how and exactly when.

## What the locked page gives away today (measured 2026-11-11)

| Paid feature | Free text (Thai characters) | Gives away the how? |
| --- | --- | --- |
| ดวงเดือน | about 3,600, about a quarter of the paid report (overview 2 paragraphs, why, focus, opportunity, caution, 6 area lines) | Yes. The opportunity names the action ("หยิบรายจ่ายย้อนหลัง… ตัดหรือลดอย่างน้อยหนึ่งอย่าง"), the caution names the fix, the overview's second paragraph is a plan, and each area line carries a tip. |
| ดวงคู่ | about 1,140 (verdict, insight, the full why, reflection question, locked hints) | Partly. The "why" explains the whole mechanism. |
| ดวงการเรียน | about 430 (badge line, outlook line, one overview paragraph) | No. Diagnosis only, per the exam canon. |

Funnel, prod totals 2026-10-06 to 2026-11-11 (read-only, owner OK in chat; owner/test accounts not removed):
free monthly reads 30 (12 readers Oct, 18 Nov), readers who saw an offer about 23, unlock requested 5 readers, paid
monthly readers up to 5 [M]. Free read to unlock request is about 1 in 6. With 5 payers nothing here can be proven;
see §Measure.

## The psychology, and the lines we do not cross

Five mechanisms, each with the guard that keeps it inside the Product Promise ("understand first", "never promise to
make anyone happy", no fear hooks, DESIGN.md วันชง rules, the exam rule "never a fail").

Headings on the locked page and in D: "เสริมดวงที่ดีอยู่แล้วให้ทวีคูณ" (gain) and "ตั้งตัวรับมือให้ทัน เปลี่ยนร้ายให้เป็นดี"
(risk), owner's wording (§Decisions 2).

1. **Information gap (curiosity).** People pay to close a gap that feels specific and personal, not one that is vague.
   Free names the area, the kind of situation and roughly when ("ช่วงกลางเดือน"); paid names the dates and the how.
   Guard: the free text is still a true, complete reading of what it says. It is shorter, not a cliffhanger.
2. **Two-sided stakes (gain and loss).** A gain to amplify and a bump to get ahead of move people more than either alone,
   and avoiding a loss weighs more than an equal gain. Free: one "ดวงดีที่ควรใช้" and one "เรื่องที่ต้องตั้งรับ".
   Guard: every risk line ends with "มีทางรับมือ" (agency and hope), no catastrophe, no fixed fate, never red, never
   "ถ้าไม่ซื้อจะ…". A free reader must leave calmer, not scared.
3. **Self-relevance.** Readers trust what is visibly about them. Lead with their own chart facts (ปีนักษัตร, ธาตุ, วันเกิด)
   that the page already computes. Guard: no generic praise anyone would accept as true (already in the prompts).
4. **Open loops closed on purpose.** Every loop the free page opens (the two stakes, each locked row) must be answered
   by name on the paid page, first thing. Layout D already mirrors the locked rows; the two stakes become its first two
   rows. Guard: no loop the paid page cannot close (the locked rows are built from counts the server has).
5. **The ask at the peak.** The ticket sits right under the open loops, not after a wall of text. Guard: no fake
   scarcity, no countdown that is not a real sale.

What carries the open loop: the **UI** (row titles, counts, the two stake headings), never the model's text. The model's
free text stays a clean diagnosis with no selling, no "ฉบับเต็มจะ…", no ticket or price (rules already in the prompts),
and no copyable example sentences in the prompt (house rule for prompts).

## Free vs paid, per feature

### ดวงเดือน (first, largest gap)

| Part | Free (locked page) | Paid (opened page, layout D) |
| --- | --- | --- |
| Cover | the month in one line, from the reader's own chart (keeps `focus`, capped shorter) | one-row cover |
| ดวงดีที่ควรใช้ (gain) | the strongest area and the kind of opening, roughly when (early/mid/late month, computed from the calendar, never guessed by the model) | the dates, what to do, the kit that goes with it |
| เรื่องที่ต้องตั้งรับ (risk) | the weakest area and the kind of situation (a person or moment, outward, as today), ending in "มีทางรับมือ" | the how, the people to be patient with, the วันชง days and remedy |
| 6 areas | the one-sentence `sign` only, no advice | the area reading (hook, paragraphs, tips, warnings) |
| Locked rows | counts (as today) | answered rows (as built in D) |
| Overview (2 paragraphs) | removed from free | moves to paid as the ภาพรวมชีวิต reading |
| why | removed from free | part of the paid ภาพรวม |

Target size: the free text fits about one phone screen of reading, about 700 to 900 Thai characters including the six
signs (today about 3,600). The rows and ticket follow directly.

### ดวงคู่ (second)

Keep the verdict, the insight and the reflection question (the question is already a good open loop). Move the full
"why" behind the unlock and keep one sentence of it. Recast the locked hints into the same two stakes: what makes this
pair go further, and the thing that could pull them apart, with "มีทางรับมือ".

### ดวงการเรียน (frame only)

Already diagnosis-only. Only make sure the locked rows read as the two stakes (ของเสริมดวงวันสอบ as the gain; a
"จุดที่ต้องรอบคอบ" row as the risk, never a fail). No prompt change unless the owner wants it.

## What has to change together (or the paid page breaks)

1. **Hooks are shared.** The paid report stores the teaser's per-area hook (`fortuneReadings[].hook`, 80 to 320
   characters) and layout D opens each area with it. If the teaser stops writing hooks, or writes them without advice,
   `monthly-detail.md` must write its own area opening in the same release.
2. **The free overview.** D's collapsed "อ่านภาพรวมฉบับย่อที่เห็นก่อนเปิดอีกครั้ง" and the reveal-card fallback read
   `monthlyPreview.overview`. If the overview moves to paid, the toggle goes and the paid ภาพรวม carries it.
3. **Shape readers.** `monthly-teaser-validate.ts`, `monthly-repair-specs.ts`, `monthly-legacy.ts`, the narration
   routes, the shared `LockedMonthlyResponse` type and `monthly-unlock.tsx` all read today's fields.
4. **Stored teasers never regenerate.** November teasers keep the long shape, so the locked page and D must render both
   shapes (old: overview, opportunity, caution; new: gain, risk).
5. **Timing.** Teasers are written at the Bangkok month boundary. To get a clean December cohort, horo-be and horo-fe
   must be live before **2026-12-01**. Railway's Docker build runs `bun test` and silently keeps the old image on a
   failure, so prove the deploy with a probe (memory: backend deploy checks).
6. **Cost.** The free teaser runs for every reader, the detail only for payers. A shorter teaser costs less per free
   reader; the detail grows a little (it absorbs the overview and its own hooks).

## Build steps (after the decisions)

1. horo-be: new teaser contract (focus, gain, risk, six signs; computed timing bucket for gain), validator and repair
   spec, the detail prompt gains the overview and the area openings; types in `lib/shared`; tests; old shape still
   parses.
2. horo-fe: locked page shows the two stakes under the cover, then signs, rows, ticket; D adds the two stakes as its
   first two answered rows; both pages render old and new shapes; tests.
3. Thai copy pass on headings and rows (thai-ux-writer), then a real-model run on six profiles (DeepSeek, local) to read
   the free text against the guards.
4. Ship before 2026-12-01; probe the backend deploy.
5. ดวงคู่ in a second change, same rules.

## Measure

Baseline (above, [M]): free read to unlock request about 1 in 6 (5 of about 30). Review **2026-12-31** with one
read-only prod query (owner OK per run): December free readers, offer viewers, unlock requests, payers, and
`monthly_preview_category_opened` per area. Keep if the request rate holds or rises and no complaint mentions fear or
"เนื้อหาน้อยลง"; roll the teaser prompt back if requests fall below 1 in 10 with at least 30 free readers. With this few
readers, the read is directional only; five reader interviews would tell more than the numbers.

## Decisions (owner, 2026-11-11)

1. **Diagnosis only wins** for every reading behind an unlock. The 2026-10-24 rule overrides the 2026-10-22 "useful
   without buying" teaser rule. Free says what and roughly when; paid says how and exactly when.
2. **Headings are the owner's wording:** gain "เสริมดวงที่ดีอยู่แล้วให้ทวีคูณ", risk "ตั้งตัวรับมือให้ทัน
   เปลี่ยนร้ายให้เป็นดี". Both promise an outcome, which the Product Promise otherwise rules out; the owner chose them
   knowing that. The exception covers these two UI headings only: the model's text keeps every no-promise, no-fear and
   no-fixed-fate rule, and the risk lines still end in "มีทางรับมือ". ดวงการเรียน keeps its own canon (never a fail,
   no promise from a prayer) and does not take the risk heading.
3. **No free sample tip.** The free page stays advice-free.
4. **The full overview moves to paid** (follows from 1): the free page keeps the one-line cover; D's collapsed
   "อ่านภาพรวมฉบับย่อ…" stays only for months whose stored teaser still has the old overview.

FRESH (new): F 2 (indexed in docs/README.md) · R 3 (measured from the local API and the prompt source the same day; prod
totals from one owner-approved read) · E 2 · S 3 (decisions recorded) · H 2 (names files, fields and the deadline).
Total 12/15 (B).
