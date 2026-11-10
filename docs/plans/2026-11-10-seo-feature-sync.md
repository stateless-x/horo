---
type: PLAN
status: Phase 1 and Decision 1 (option A) shipped 2026-11-10 (horo-fe b12c5d2); Phases 2 and 3 built 2026-11-10, see §Outcome
scope: bring every public SEO surface of สายมู.com up to date with the features live today, and stop the reading list from drifting again
last_reviewed: 2026-11-10
owner: frontend (horo-fe)
---

# SEO feature sync (2026-11-10)

## The problem in one line

**ดวงการเรียน is live in production but no public page names it.** On 2026-11-10, `GET https://api-horo.up.railway.app/api/features`
returned `exam: true`. Meanwhile prod `/llms.txt`, `/ai`, the homepage and its FAQ JSON-LD list four readings (ดวงวันนี้,
ดวงประจำเดือน, พื้นดวง, ดวงคู่). An assistant asked "สายมูดูดวงสอบได้ไหม" today would say no.

Why it drifted: the architecture in `horo-fe/docs/geo-llm-reference.md` is sound (two registries feed `/ai`, `/llms.txt`,
the sitemap, the footer and `/learn`). But at least six surfaces still type the reading list by hand, so a launch that adds a
`READINGS` entry still leaves them stale.

## What is live vs what the public pages say

| Feature | Prod state (2026-11-10) | Public surfaces today | Action |
| --- | --- | --- | --- |
| ดวงวันนี้, ดวงประจำเดือน, พื้นดวง, ดวงคู่ | live | listed everywhere | keep |
| **ดวงการเรียน** (ดวงช่วงสอบ, ตั๋วดวงสอบ) | **live** (`exam` flag on) | **absent everywhere** | Phase 1 |
| ฟังดวง เบต้า (voice on the current paid month) | live, flag-gated, labelled "might not work" | absent | owner choice (§Decision 1) |
| Shop, มู, tickets | live | described via `FREE_ANSWER` | derive, see Phase 1 |
| Daily check-in bonus, ค่าครู tip card | live | absent | leave out: perks, not readings; no search demand |
| ไพ่ทาโรต์ | planned | shown as planned | keep |
| ปฏิทินไทย, topic hubs, MBTI pages | live, public | in sitemap (123 URLs) | keep; hub review is §Phase 3 |

## Phase 1: catch up and make the reading list single-source (horo-fe only, small)

### 1a. Registry: `src/lib/knowledge-base.ts`

**New `READINGS` entry**, placed after `compatibility`. No `href`: it is behind login and `/dashboard` is disallowed.

```ts
{
  id: 'exam',
  name: 'ดวงการเรียน',
  requiresLogin: true,
  status: 'live',
  description: 'ดวงช่วงสอบของสนามที่คุณเลือก เช่น TGAT/TPAT A-Level สอบราชการ หรือครูผู้ช่วย บอกดวงวันสอบ ดวงผลสอบ สีกับของเสริมดวง เวลาออกจากบ้าน และคนที่ช่วยหนุนตามปีนักษัตร',
  access: 'ดูสรุปฟรี ฉบับเต็มใช้ตั๋วดวงสอบ',
  inputs: 'สนามสอบกับวันสอบภายใน 7 วัน ยังไม่แน่ใจวันก็เลือกได้ ข้อมูลเกิดใช้ที่บันทึกไว้',
},
```

Name choice: the tab says ดวงการเรียน because that is the searched phrase ("ดูดวง การเรียน" has 267 Pantip threads [M],
`~/product-decisions/horo/2026-11-09-feature-study.md`). ดวงช่วงสอบ appears in the Q&A below, so both phrasings are on the page.

**New boundary**, appended to `BOUNDARIES` and as an English line in `ENGLISH_REFERENCE` "What Saimu will not do". This is
the exam canon (`horo-be/docs/exam-reading.md` rule one), and a stated limit is what gets a source cited.

- TH: `สายมูไม่ฟันธงว่าสอบติดหรือสอบตก ไม่บอกโอกาสเป็นเปอร์เซ็นต์ ไม่เดาคะแนน และไม่สัญญาว่าขอพรแล้วจะติด`
- EN: `No pass or fail verdicts for exams, no odds or percentages, no predicted scores, and no promise that a prayer gets anyone in.`

**New Q&A** in `QA_PAIRS`, shaped like the top real ask ("จะติดไหม", 17 of 32 coded threads [I]):

- Q: `สายมูดูดวงสอบติดได้ไหม`
- A: `สายมูมีดวงการเรียน อ่านดวงช่วงสอบจากวันเกิดของคุณกับวันสอบที่เลือก บอกดวงวันสอบ สีกับของเสริมดวง และคนที่ช่วยหนุน แต่ไม่ฟันธงว่าติดหรือไม่ติด ไม่บอกโอกาสเป็นเปอร์เซ็นต์ และไม่เดาคะแนน ดูสรุปได้ฟรี ฉบับเต็มใช้ตั๋วดวงสอบ`

**Bump** `REFERENCE_VERIFIED` and `REFERENCE_VERIFIED_TH` (both forms) on the day it ships.

### 1b. Single source for the reading list (the real fix)

Add two fields to `Reading` and derive every hand-typed list from them:

- `ticket?: string`: present means "summary free, full version with this ticket" (ตั๋วดวงเดือน, ตั๋วรู้ใจ, ตั๋วดวงสอบ).
  Absent on a live member reading means fully free.
- `englishName: string`: for the English block (`daily reading`, `monthly reading in six life areas`, `exam reading`, …).

Plus one helper next to the registry: `thaiList(names)` returns `A B C และD` (Thai lists join with spaces and a final และ,
never commas).

| Surface (file) | Today | After |
| --- | --- | --- |
| `FREE_ANSWER` (`knowledge-base.ts`) | hand-lists monthly and ดวงคู่ as paid | built from `MEMBER_READINGS` split by `ticket` |
| `QUICK_FACTS` ค่าบริการ (`knowledge-base.ts`) | same hand list | same derivation |
| Q&A "สายมูมีดวงอะไรให้อ่านบ้าง" (`knowledge-base.ts`) | four names typed | `thaiList(MEMBER_READINGS.map(r => r.name))` |
| `ENGLISH_REFERENCE` "Free:" / "Free summary, paid full version:" lines | typed | from `englishName` and `ticket` |
| Homepage FAQ, 2 answers (`components/seo/seo-sections.tsx`) | four names typed, also in FAQPage JSON-LD | `thaiList(...)` |
| `FinalCta` (`components/landing/landing-narrative.tsx`) | four readings typed | either `thaiList(...)` or reword to not enumerate |
| `metadata.keywords` (`app/layout.tsx`) | no exam terms | add `ดูดวงการเรียน`, `ดวงสอบ`, `ดูดวงสอบติด` (low value, Google ignores it; kept for consistency) |

Already registry-driven, so they update for free: `/ai` readings table, `/llms.txt` "ดวงที่ต้องเข้าสู่ระบบ", the homepage
"สมัครแล้วอ่านอะไรได้บ้าง" cards (`MEMBER_READINGS`).

**Drift test** (new, e.g. `src/lib/reading-coverage.test.ts`): for every live `READINGS` entry, assert its name appears in
`FREE_ANSWER` (when it requires login), in the homepage FAQ answers, in `ENGLISH_REFERENCE` text, and in the `/llms.txt` body.
The next launch then fails the build until every surface knows about it. That is the "adding a reading = one entry" guarantee.

### 1c. Docs

- `horo-fe/docs/geo-llm-reference.md`: add "Launching a reading" next to the tarot example: add one `READINGS` entry with
  `ticket` and `englishName`, add a boundary or Q&A if the reading has its own canon, then bump `REFERENCE_VERIFIED`.
  The drift test names anything missed.
- `horo-be/docs/exam-reading.md` front matter still says "uncommitted and undeployed … off by default". Correct the status line
  to "live in prod since <date>, behind `exam`".

### 1d. Verify (against build output, not a dev server)

```bash
cd horo-fe && npm run build
grep -c 'ดวงการเรียน' .next/server/app/ai.html .next/server/app/index.html
curl -s localhost:3000/llms.txt | grep 'ดวงการเรียน'   # after `npm start`
```

After deploy: `curl -s https://xn--y3cbx6azb.com/llms.txt | grep ดวงการเรียน`, and the FAQPage JSON-LD on `/` and `/ai` in
Google's Rich Results Test.

## Decision 1: ฟังดวง เบต้า on public pages (owner)

The voice is free to anyone who opened the current month, flag-gated, and labelled "อาจเล่นไม่ขึ้น". A public claim can
go false overnight if the flag is turned off.

- **A (recommended): one clause, nothing more.** Append to the monthly `READINGS.description`:
  `ถ้าเปิดฉบับเต็มของเดือนนี้แล้ว กดฟังเป็นเสียงอ่านได้ด้วย (ยังอยู่ในช่วงทดลอง)`. EN line: `Members who open the
  current month's full reading can also listen to it read aloud (beta).` No Q&A, keyword or hub. Removing it is one line.
- **B: leave it off public pages** until it leaves beta.

## Phase 2 (proposal): an exam-luck topic hub

Pantip shows search demand ("ดูดวง การเรียน" 267, "สอบติด" 54, "คณะ" 30 threads [M]), and pre-exam มู is a content genre
("สถานที่ขอพรสอบติด", exam คาถา). No hub owns this query shape today. `/mutelu` covers มู in general, and
`/thai-astrology` owns the สีประจำวัน table.

Before building, answer three questions:

1. **Cannibalisation test** (`geo-llm-reference.md`): can `/mutelu` win "มูสอบติด" / "ขอพรสอบติด" if it gets one more section?
   If yes, deepen `/mutelu` instead and skip the hub.
2. **Don't give away the ticket.** `horo-be/src/systems/exam/exam-calendar.ts` computes the personal kit (colours, numbers,
   direction, leave window) deterministically. The hub may explain *the kinds of* things Thai readers do before an exam, with
   sources, but never publish a lookup that reproduces the paid kit.
3. **Canon on a public page:** no promise from a prayer, no pass/fail, no study coaching (owner 2026-11-09). Each ไหว้ขอพร
   or คาถา claim needs a real source; the trend sites from the study (TikTok, Lemon8) are not citable sources.

If all three pass: one `TOPIC_PAGES` entry, `status: 'live'`, an English slug in the house pattern (candidates `/exam-luck`,
`/duang-sop`; the owner picks), and its CTA goes to `/onboarding` then the ดวงการเรียน tab. Copy is written then, with
`seo-writer` + `thai-ux-writer`, with title and meta lengths counted by tool.

## Phase 3 (housekeeping): hub freshness

`LAST_VERIFIED` (hubs and MBTI pages) is still `2026-09-08`. Review the four hubs against today's product, especially each
"สายมูใช้…อย่างไร" section and the online CTA notes. Bump it only after that review: a date claiming freshness the content
doesn't have is worse than an old one.

## Copy rules that applied to every string above

- Always คุณ.
- Never name MBTI, a type or a code in reading descriptions. The public `/mbti` hub is its own, separate decision.
- No dashes or middle dots in Thai prose.
- Lists join with spaces and a final และ.
- Hopeful, never certain.
- No coaching words (อ่านหนังสือ, เตรียมตัว).
- Name the ticket, never a price: prices are admin-edited rows.

## Outcome (2026-11-10)

**Phase 2: built as `/study-fortune`.**
- **Why it ships:** the cannibalisation test passed. `/mutelu` explains the term and its culture, so one more section there could not win the head term "ดูดวงการเรียน".
- **What the page holds:**
  - what a study reading looks at;
  - who Thai readers pray to before exams, with four sources: Thai Wikipedia on พระพิฆเนศ, Thairath on the Erawan Brahma, Post Today on พระประจำวันเกิด, and Wikipedia on Wenchang;
  - what colour to wear, linking to `/thai-astrology` instead of publishing the paid kit;
  - "ดูดวงบอกได้ไหมว่าจะสอบติด", answered with the boundary;
  - how สายมู reads it, using a table built from the product's own `EXAM_KIND_LABELS_TH`.
- **Slug:** `/study-fortune`, following the house's English slugs; the searched phrase is in the title, H1 and keywords.
- **Links:** `/thai-astrology` and `/mutelu` now link to it.

**Phase 3: all four hubs and the 16 type pages reviewed against the product.**
- **One stale claim fixed:** four lines said every reading uses your personality type. Since 2026-11-09, a reading uses it only when you gave one.
- **Pages corrected:** the `/thai-astrology` body and its English brief, `/mutelu`, and the `/mbti` and `/mbti/<type>` calls to action.
- **Checked and still true:** everything else, including the free-reading claims, the boundaries and the sources.
- **Dates:** `LAST_VERIFIED` is now 2026-11-10. The `/learn` reading description now names ดวงการเรียน.

