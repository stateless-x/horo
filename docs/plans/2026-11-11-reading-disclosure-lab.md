---
type: PLAN
status: D shipped 2026-11-11
scope: horo-fe opened readings (pilot: ดวงเดือน)
last_reviewed: 2026-11-11
owner: product
---

# Long readings without the wall of text: layout lab

Status: the owner picked **D** on 2026-11-11 with one rule added: the opened page builds on what the reader saw while
locked and never repeats it. D is built into the real pages (`/dashboard/fortune/monthly` and the history page). See it at `http://localhost:3000/dashboard/fortune/monthly/history/2026-10`
(dev login first, horo-be-dev-localdb on :3001). The A/B/C/D lab route was deleted once D was picked. The built
structure is recorded in horo-fe `DESIGN.md`, "Monthly page structure", "Opened page".

Owner decisions this round (2026-11-11): hide and reorder only, no shorter generation; ดวงเดือน is the pilot;
ฟังดวง stays as decided on 2026-11-10 (only this month's paid ดวงเดือน). The lab shows a dashed stand-in where the
player would sit because October is a past month; no audio is requested.

## The problem, measured

| Measure (375 px phone) | Value | Tag |
| --- | --- | --- |
| Opened ดวงเดือน, every area closed | 11 screens, 19 headings | [M] local, Oct report |
| Each area opened | +1.9 screens; all six open is about 22 screens | [M] |
| Thai characters in the report | about 14,000 (six areas about 1,100 each: hook, 4 paragraphs, 3 tips, 2 warnings) | [M] |
| Opened ดวงคู่ | 6.9 screens, 25 headings | [M] |
| Opened ดวงการเรียน | 5.1 screens | [M] |
| Same ดวงเดือน in layout A / B (first view) | 2.3 / 3.6 screens; C is one page at a time | [M] |

The text is not the only problem: the order is. The most useful parts (when, what to try) sit after the long overview,
at screen 8 or later.

## Does each feature match what readers come for

Prod totals, read-only, owner OK in chat 2026-11-11. Window 2026-10-06 (payments live) to 2026-11-11, 79 active
readers. Owner or test accounts are not filtered out [?], and the paid counts are tiny, so these are signals, not proof.

| Reading | Who uses it [M] | What they come for | Fits? | Next |
| --- | --- | --- | --- | --- |
| ดวงวันนี้ | 77 readers viewed; area opens: love 39 readers, health 27, money 27, career 25 | a quick daily check | Yes: short, and the areas already open one at a time | leave as is |
| ดวงเดือน (free) | 30 free reads (18 readers Nov, 12 Oct); locked rows tapped: วันชง 6 readers, good days 3 | "what is this month like, and when" | Mostly: the วันชง row is the strongest pull | keep the วันชง and calendar rows near the top |
| ดวงเดือน (paid) | up to 5 readers opened a paid month (3 in Oct, 2 in Nov, maybe the same people); the overview's "อ่านเพิ่มเติม" opened by 3 readers; calendar, kit, people, chong each seen by 2 to 3 readers. Area opens on the full six-area list (love 26 readers, career 21, family 21, money 19, health 18) also count readers from before the paywall, so the paid share is [?] | single areas and dates | Partly: the page leads with the long overview, which almost nobody opens | this lab |
| ดวงคู่ | 34 readers viewed; 59 checks, talking stage first (14 readers) | "should I keep talking to this person" | Yes on the question; the report is 25 headings long | second pilot, same system |
| พื้นดวง | 8 readers viewed, 7 opened | knowing yourself, once | Low pull, length is fine (3.9 screens) | no change |
| ดวงการเรียน | 1 reader (live since 2026-11-09) | exam-day hope | Too early to tell | measure after TCAS push |
| ฟังดวง | 1 reader played the monthly overview through, with seeks and two speed changes; 15 spend prompts, 2 confirmed | not reading long text | Interest exists, the sample is one person | no change (owner) |

## The disclosure system (any layout)

Every reading already comes in four layers. The system is a rule for which layer shows where.

| Layer | What it is | Shown |
| --- | --- | --- |
| 0 | the month in one line: score, เดือนชง/ปัง, best and weakest area | always, first screen |
| 1 | one sentence per area (`sign`), one line per extra (วันเด่น 3 วัน, วันชง 4 วัน) | first or second screen |
| 2 | the reading itself (hook and paragraphs) | one tap, one area at a time |
| 3 | ลองเริ่มจากตรงนี้ / เรื่องที่ควรระวัง, the full calendar, the remedy | inside layer 2, or one more tap |

Rules: nothing paid is more than two taps away; every closed thing says what is inside it (a count or its first
line, never just "อ่านเพิ่มเติม"); one long thing open at a time on a phone; a wider screen shows two layers side by
side instead of making the column longer; nothing is ticked or tracked as done (DESIGN.md).

## The three layouts

**A. สรุปก่อน แล้วเลือกอ่านทีละบท.** A short brief (best/weakest area, your next best day, the วันชง count, the listen
entry), then five chapters, each with the one thing it will tell you. A phone shows the brief or one chapter, with a
chip bar to jump and "อ่านต่อ" to the next chapter. iPad: the chapters in two columns. Desktop: the brief and chapter
list in a left rail, the chapter on the right.
Good: the closest to today's tabs, so the cheapest to ship, and it fits every reading (ดวงคู่ already has a section
switcher). Long overview moves to the last chapter, where the data says it belongs. Risk: one more tap before any
area; still a long chapter for the six areas.

**B. การ์ดทีละด้าน.** The page is an index: the six areas as cards with their sign, the extras as small tiles. A tap
opens the reader: a bottom sheet on phone and iPad, a panel beside the list on desktop. Inside an area, "ดวงบอกอะไร"
and "ลองทำและระวัง" are two layers, never both at once, and "ด้านถัดไป" walks the areas.
Good: the first screen is only short sentences, and it matches how readers behave (one area, love first). Desktop
master-detail reads well. Risk: long reading inside a sheet on a phone; the calendar is cramped in a sheet; a sheet
is a modal, which the craft rules accept only for focused reading like this.

**C. อ่านทีละหน้า.** The report as a short book: cover page, one page per area (sign, hook and the first paragraph, then
"อ่านต่ออีก N ย่อหน้า"), วันเด่น, kit, ทำ/เลี่ยง. The buttons and arrow keys turn (checked); swipe is built but not yet tried on a real touch phone; สารบัญ jumps. iPad: one wide
page. Desktop: two pages side by side.
Good: the calmest, most "storybook" feel, and the natural partner for listening. Risk: slowest way back to one
thing mid-month (the calendar is page 8); "3 จาก 10" is close to the progress marker DESIGN.md bans (shown as
position only, never saved); it should replace the 3-card flip deck, not follow it, or the page has two decks in a row.

**D. A + B (recommended).** Layout A, but the six-area chapter is B's cards and two-layer reader instead of the long
accordion. Built so the pick can be tried, not only read about.

## Recommendation

D: A as the system for all readings, with B's two-layer area reader inside the six-area chapter (ดวงบอกอะไร / ลองทำ
และระวัง, and ด้านถัดไป). A matches what readers do (on ดวงวันนี้ they open one area at a time, love first; on the locked month the วันชง row
is the most tapped; the overview's long version is almost never opened) with the
smallest change to today's tabs; B's inner split is the part that actually shortens each area. C is worth keeping for
a future "listen and turn pages" mode, not as the default.

## No repeats from the locked page (owner, 2026-11-11)

| Seen while locked | Opened page |
| --- | --- |
| full cover with the focus line | one-row cover, no focus line; the reveal deck's first card now opens with paid text |
| the free overview | collapsed under ภาพรวมชีวิต, "อ่านภาพรวมฉบับย่อที่เห็นก่อนเปิดอีกครั้ง" |
| จังหวะที่น่าใช้ / จุดที่ควรระวัง | not shown again |
| one sign per area | the area card's line, the only place it shows; the reader starts at the paid hook |
| "ในฉบับเต็มมีอะไรเพิ่ม" rows, counts only | the same rows as "ในฉบับเต็มของคุณ", each answered (days, years, colours) and opening its chapter |

## Before shipping

1. Owner checks the built page (browser pane, or a phone through a Vercel preview branch; ask first).
2. Shipped 2026-11-11 on the owner's "commit and push". The old tab components (`FortuneTabBar`, `FortuneOverviewSection`,
   `FortuneEnergySection`, `FortuneReadingsSection`, `FortuneGuidance`, `MonthlyOverviewDetail`, `MonthlyOverviewInsights`,
   `MonthlyDetailsInsights`) and their helpers were removed in the same change.
3. The current-month opened page could not be seen locally (the dev user's November is locked); it shares the
   component with the history page, which was checked.
4. Then ดวงคู่ with the same system.

FRESH (new): F 2 (indexed in docs/README.md) · R 3 (written from the running lab and a prod read the same day) · E 2
(tables carry the detail; the options are prose) · S 2 (draft, the pick is open) · H 2 (names files and the URL; the
event names are from the code). Total 11/15 (B).
