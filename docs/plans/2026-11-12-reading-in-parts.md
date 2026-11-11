---
type: PLAN
status: decided 2026-11-12, not built (§Decisions)
scope: every reading behind an unlock (pilot: ดวงเดือน "ภาพรวมเดือนนี้ของคุณ"; then the six areas; then ดวงคู่)
last_reviewed: 2026-11-12
owner: product
---

# One reading, opened in parts

Owner idea (2026-11-11): write each section as one text in parts. A locked reader gets part 1 only, from one model
call, ending in "…". Unlocking appends parts 2 and 3 to the same text. The same code pattern serves ดวงคู่ and every
other unlock, each feature with its own prompt, and a section can grow to more parts later.

## Why this is better than today

Today the free teaser and the paid report are two separate texts. The paid prompt is told to cover the same ground
without repeating the free one (`monthly-detail.md`, "ห้ามแนะนำทางเลือกที่ข้อความนำเสนอไปแล้ว", "ไม่ยกวลีจาก ข้อความนำ"),
and a validator rejects paid text that shares wording with the free text. That rule is the main reason about half of
paid generations fail after repair (finding of the generation-failure session, 2026-11-12: "hook/overview copies that
repair can't fix"). A continuation removes the conflict instead of fighting it: part 2 is asked to carry on from part 1,
which is what the reader sees anyway, not to say the same things differently.

It also makes the paywall moment honest and simple: the reader sees the start of their own reading, then "…", then the
ticket. Nothing is written twice, and the paid page is the same text, longer.

## The structure

**Section**: one text the reader reads top to bottom (the month overview, one area, the ดวงคู่ overview).
**Part**: a slice of a section. Part 1 is free; the rest unlock. Default 3 parts; each feature sets its own count.

```
ReadingSection {
  id: 'overview' | 'love' | ...          // stable per feature
  title: string                          // from the feature's own copy, not the model
  parts: string[]                        // generated so far, in order
  totalParts: number                     // planned count (default 3)
}
Report.sections: ReadingSection[]        // inside the stored report JSON: additive, no table change
Report.unlockedParts: number             // 1 while locked; totalParts once the ticket is used
```

Backend (horo-be), one shared engine plus one spec per feature:

```
PartSpec {                               // per feature: monthly, compatibility, exam, ...
  feature: string
  sections(report): SectionPlan[]        // ids, titles, totalParts, what facts each section reads
  prompt(sectionsSoFar, fromPart, toPart): string   // the feature's own prompt file, never shared text
  validate(newParts, sectionsSoFar): string[]       // the feature's rules + shared continuity checks
}
generateParts(spec, report, fromPart, toPart)       // one model call for all sections' parts in that range,
                                                    // using generateWithFieldRepair; appends, never rewrites
```

- **Locked**: `generateParts(spec, report, 1, 1)` at teaser time: one call writes part 1 of every section.
- **Unlock**: `generateParts(spec, report, 2, totalParts)`: one call, with every part 1 in its context, told to
  continue each section. A failure keeps part 1 and the ticket, as today.
- **Later parts** (a future part 4, a mid-month update): the same call with a new range. Nothing already shown is
  rewritten.
- **Shared continuity checks**: a part may not restate the previous part (the existing 6-character-window overlap check,
  turned around: it now guards against repeating, not against "copying the free text"); the first sentence of part N
  must read as a continuation (no re-introducing the section, no section name opener).

Frontend (horo-fe), one component:

```
<PartedSection section unlockedParts onUnlock?>
  renders parts[0..unlockedParts) as one text;
  if more parts are locked: a soft fade on the last lines, "…", and one quiet row into the existing ticket door
```

The existing page structure stays: layout D's chapters, cards and reader keep their places; a section's text inside them
becomes a `PartedSection`.

## Pilot, smallest useful step

1. ดวงเดือน "ภาพรวมเดือนนี้ของคุณ" only: part 1 replaces today's free overview (one paragraph instead of two); parts 2
   and 3 replace the paid `summary.reading` and the ภาพรวมชีวิต reading, written as its continuation.
2. Then each of the six areas: part 1 = today's free hook, parts 2 and 3 = the paid reading as its continuation (this is
   where most copy failures happen today).
3. Then ดวงคู่ (teaser cover summary → paid overview), each with its own prompt and part count.

Old stored reports keep their current shape; the renderer falls back to today's fields when `sections` is absent.
Prompts reach only readings generated after a backend deploy, so ship before a month boundary.

## Measure

The save rate of paid generations (the failure session's harness, 12+ runs before and after) is the first number: the
continuation should remove the copy failures. Then unlock requests per free reader, read directionally (5 payers).

## Decisions (owner, 2026-11-12)

1. **Part 1 ends on a complete sentence**, with a soft fade, "…" and the unlock row. Never cut mid-sentence.
2. **Parts per section are set per feature**, default 3.
3. **Pilot: the month overview first** ("ภาพรวมเดือนนี้ของคุณ"), then the six areas, then ดวงคู่.
4. **Unlocking opens every remaining part after part 1** with the one ticket. No per-part unlocks.

Note: the owner said on 2026-11-11 to keep the free preview as it is; this plan changes the free overview's length (part
1 is one paragraph), so it is the owner's new direction, recorded here.

FRESH (new): F 2 (indexed in docs/README.md) · R 2 (built on the current code and the failure session's finding; not
prototyped) · E 2 · S 3 (decisions recorded) · H 2 (names files and functions; the engine is proposed). Total 11/15 (B).
