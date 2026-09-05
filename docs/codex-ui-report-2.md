---
title: UI Report 2 — Repeated Guidance Blocks and Voice Drift
status: open
author: Claude
date: 2026-09-05
scope: horo-fe
owner: Codex
---

# UI Report 2 — Repeated Guidance Blocks and Voice Drift

## Origin

User feedback, verbatim:

> "is ลองทำแบบนี้, เก็บไว้ในใจ today / fortune ทำสิ่งนี้ก่อน, ระวังเรื่องนี้ / สิ่งที่ช่วยคุณ, สิ่งที่ต้องระวัง...
> is these static it always look the same result? should it be more dynamic. should it be in this
> format for ux. i find it difficult to read and enjoy experience"

The answer to the literal question is yes: every one of those strings is hardcoded UI chrome.
None varies by day, user, category, or reading content. But the labels are a symptom — the
actual defect is that the same good/bad two-column block is rendered up to **eight times on a
single page**, in four different vocabularies.

## Finding 1 — The same block, four vocabularies, eight repetitions (primary)

One structural pattern (green-positive column / orange-negative column, icon + heading + bulleted
list) is implemented four separate times with four different label pairs:

| Surface | Positive label | Negative label | File |
|---|---|---|---|
| ดวงวันนี้ | ลองทำแบบนี้ | เก็บไว้ในใจ | `src/app/dashboard/today/page.tsx:290,306` |
| ดวงชะตา — overview | ทำสิ่งนี้ก่อน | ระวังเรื่องนี้ | `src/features/fortune/chart/fortune-overview-section.tsx:85,94` |
| ดวงชะตา — per category | สิ่งที่ช่วยคุณ | สิ่งที่ควรระวัง | `src/features/fortune/chart/fortune-readings-section.tsx:102,112` |
| ดวงคู่ | ลองทำแบบนี้ | — | `src/features/compatibility/compatibility-reading.tsx:14` |

The chart page is the worst case. `fortune-readings-section.tsx:46` maps over
`fortuneReadings`, and `FORTUNE_CATEGORY_CONFIG` defines **6 categories** (life_overview, love,
career, finance, health, family). A user who expands all six sees the
สิ่งที่ช่วยคุณ / สิ่งที่ควรระวัง pair **6 times**, directly beneath the
ทำสิ่งนี้ก่อน / ระวังเรื่องนี้ pair from the overview section — **14 near-identical
green/orange headers on one scroll**.

Two distinct costs:

1. **Banner blindness.** Past roughly the third repetition the heading stops carrying
   information and readers skip it, which also causes them to skip the content beneath it.
2. **Vocabulary churn.** Three different label pairs for one concept means the user re-learns
   the mapping on every surface instead of recognising a familiar pattern.

Note these pull in opposite directions: unifying the vocabulary (fixing #2) makes the
repetition (#1) *more* visible, so the two must be solved together — a shared component plus a
reduction in how often it renders, not a find-and-replace.

## Finding 2 — Documented voice violation (คุณ inside the reading experience)

`DESIGN.md:293` states plainly:

> **Don't** use the oracle voice (เจ้า/ข้า, Sarabun) on marketing chrome, or คุณ inside the reading experience.

`DESIGN.md:192-195` (The Two Voices Rule) is the governing section. These authenticated
in-app surfaces currently violate it:

| File:line | String |
|---|---|
| `fortune-readings-section.tsx:102` | สิ่งที่ช่วย**คุณ** |
| `fortune-readings-section.tsx:42` | อ่านภาพรวมก่อน แล้วเลือกเปิดเฉพาะเรื่องที่**คุณ**สนใจ |
| `fortune-overview-section.tsx:103` | ตัวช่วยเล็ก ๆ ของ**คุณ** |
| `fortune-result-header.tsx:31` | คำทำนายของ**คุณ**พร้อมแล้ว |
| `fortune-result-header.tsx:60` | พลังหลักของ**คุณ** |
| `dashboard/fortune/page.tsx:130` | ดวงของ**คุณ**จะอัปเดตใหม่ได้… |
| `dashboard/fortune/page.tsx:175` | **คุณ**แก้ไขข้อมูลบ่อยเกินไป… |
| `dashboard/fortune/page.tsx:270` | เจาะลึกเมื่อ**คุณ**พร้อม |

Excluded deliberately: `dashboard/settings/page.tsx:203,382` (ชื่อของคุณ). Settings is
account chrome, not the reading experience — arguably correct as-is. **Codex should rule on
where the reading-experience boundary sits**; the two `dashboard/fortune/page.tsx` error/rate-limit
strings (130, 175) are the genuinely ambiguous ones, since system messaging may reasonably sit
outside the oracle voice.

## Finding 3 — "Should it be more dynamic?"

Recommend **yes, but deterministically — not via the LLM.**

Varying the labels per category from a fixed, code-owned set (e.g. การงาน → "จังหวะที่ใช่ /
จังหวะที่ควรรอ"; ความรัก → "เปิดใจกับสิ่งนี้ / อย่าเพิ่งรีบ") breaks the sameness at zero token
cost and with no new failure mode.

**Explicitly advise against LLM-authored section headers.** This session removed exactly that
class of problem from the daily category scores (see `docs/deterministic-category-scores.md`):
model-chosen values drifted between regenerations of the same day and could collapse to a
degenerate uniform state. Section headings are navigational furniture — they should be stable
so users learn them. Making them generated re-imports drift, adds tokens, and expands the
validation surface, in exchange for novelty the user did not ask for.

## Finding 4 — Unresolved product question (blocks direction)

The user's report contains two goals that pull against each other:

- *"difficult to read"* → wants **less** prose, more structure, faster skim
- *"enjoy experience"* → wants **more** voice, less grid, more warmth

The current design is already heavily optimised for skim (Phase 1 consolidated the daily hero
and merged ทำ/เลี่ยง precisely for this). If the complaint is now that it reads as mechanical,
pushing further toward structure will make it worse.

**Codex should decide which goal wins before implementation begins.** Claude did not choose,
because it is a product-direction call, not a code correctness one. Recommended framing: keep
ดวงวันนี้ optimised for skim (it is a daily glance) and let ดวงชะตา lean into voice (it is
read once, in depth).

## Suggested direction (Codex owns the final call)

Ordered by confidence:

1. **Extract one shared `GuidanceColumns` component.** Four implementations of one pattern is
   the root cause. One component, one vocabulary, per-surface label overrides.
2. **Collapse tips/warnings by default on the chart page.** Show only `category.reading` when a
   category expands, with tips/warnings behind a second, lighter disclosure. This removes the
   14-header problem without changing a single string, and is the highest
   impact-to-risk action available.
3. **Fix the voice violations** in Finding 2 after ruling on the boundary.
4. **Per-category label variation** (Finding 3) only after 1 and 2 land — it is polish, and it
   is only legible once the repetition is gone.

## Constraints carried forward

- `horo-fe` only. Backend and shared contracts remain Codex-owned; no payload shape change is
  needed or implied by any item here.
- Follow `DESIGN.md`: semantic tokens only, 44px touch targets, no emoji as UI chrome, Romance
  Pink reserved for love/romance, element colours as data payloads only.
- Preserve legacy markdown rendering for pre-v2 rows.
- Do not regress the Phase 1 accessibility work: dialog semantics and focus trap on the
  donation modal, `aria-expanded`/`aria-controls` on category toggles.

## State at time of writing

All prior work is committed and pushed — nothing is sitting in a dirty tree.

| Repo | Commit |
|---|---|
| `horo-fe` | `34a7223` |
| `horo-be` | `4d999ec` |
| `horo` (parent) | `f312c4b` |

Frontend was pushed before the backend so the tolerant reader deployed first. No UI change from
this report has been started.
