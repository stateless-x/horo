---
title: Deterministic Daily Category Scores
status: in-progress
created: 2026-09-05
scope: horo-be
---

# Deterministic Daily Category Scores

## Problem

Daily category scores (career/love/finance/health, 1-5) are produced by the LLM under
prose rules in `src/lib/prompts/md/today.md:41-46`. Two rules interact badly:

- line 44 forbids only uniform **3**s
- `FAVORABILITY_RULES.challenging` (`src/lib/prompts/today.ts:39`) steers to **2-3**

So an all-**2**s reading is rule-legal. Three such rows exist in production (of 637).
Scores also drift between regenerations of the same day — the number is a sampled token,
not a derived fact.

## Approach

Mirror `lib/astrology/compatibility.ts:86-125`: compute the number in code, let the model
narrate it. Same pattern, same file conventions.

New module: `lib/astrology/daily-scores.ts`

```
categoryScore(category) = clamp(1..5, round(
    BASE[favorability]
  + ELEMENT_AFFINITY[category][relationship]
  + BRANCH_MODIFIER[category][clashType]
))
```

Inputs are already computed and already in scope at the call site — no new astrology:
- `elementHarmony.relationship` (`producing | produced_by | controlling | controlled_by | same | neutral`)
- `elementHarmony.favorability` (`very_favorable | favorable | neutral | challenging`)
- `branchClash.hasClash` + `clashType` (`year` | `day`)
- `todayPillar.element` (today's element, for the category-element affinity)

### Why the four categories differ

Each category maps to an element and to a life domain that a clash touches differently.
This is what breaks the flattening — a single favorability no longer moves all four in lockstep:

| Category | Element | Clash sensitivity |
|---|---|---|
| career | metal (decisiveness, structure) | `year` clash (social/standing) |
| love | water (flow, connection) | `day` clash (personal/emotional) — strongest |
| finance | earth (accumulation, stability) | `year` clash |
| health | wood (vitality, growth) | `day` clash |

`checkBranchClash` already distinguishes `year` (family/social) from `day` (personal/
emotional) with exactly this reading — see its Thai warning strings at `daily.ts:271-289`.

### Required properties

1. **Deterministic** — same (birthDate, date) always yields the same four scores.
2. **Never uniform** — the four scores must not be all-equal. Verify across a wide sweep.
3. **Bounded** — every score in 1..5, integer.
4. **Spread** — across a year of dates the scores must show real variance, not cluster.
5. **Favorability-consistent** — a `very_favorable` day must not score below a
   `challenging` day for the same user.

## Wiring

1. `buildTodayPrompt` injects the four computed scores as fixed facts. Replace the
   score-*rules* (today.md:41-46 favorabilityRule + the "no uniform 3s" line) with the
   score *values*, and instruct the model to narrate them, not choose them.
2. After `generateEnhancedDailyReading` returns, **overwrite**
   `categories[k].score` with the computed value. The prompt is guidance; the overwrite is
   the guarantee. `overallScore` likewise becomes the rounded mean of the four.
3. `FAVORABILITY_RULES` becomes unused once its only consumer is replaced — remove it
   (this is an orphan created by our own change, so removing it is in scope).

## Constraints

- `horo-be` only. No DB schema change, no `db:push`. Production DB read-only.
- Payload shape is unchanged — `categories[k].score` still an integer 1-5. This is NOT a
  contract change, so no frontend change and no `contentVersion` bump.
- Existing 59+4 tests must keep passing.
- Surgical: touch `lib/astrology/daily-scores.ts` (new), `src/lib/prompts/today.ts`,
  `src/lib/prompts/md/today.md`, `src/systems/fortune/routes.ts` (overwrite step), plus a
  new test file. Nothing else.
