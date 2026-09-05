---
title: Deterministic Category Scores (daily and chart, 0 to 100)
status: shipped
created: 2026-09-05
updated: 2026-09-05
scope: horo-be (scoring), horo-fe (display)
authority: when this document and the code disagree, the code wins
---

# Deterministic Category Scores

Every score the product shows is computed in code from the astrology inputs and
narrated by the LLM. The model never chooses a number. All scores are integers on
0 to 100.

| Surface | Scorer | Range in practice | Route overwrite |
|---|---|---|---|
| Daily (career, love, finance, health, overall) | `horo-be/lib/astrology/daily-scores.ts` | 22 to 89 | `src/systems/fortune/routes.ts` replaces `categories[k].score` and `overallScore` after generation |
| Chart (six life areas) | `horo-be/lib/astrology/chart-scores.ts` | roughly 39 to 92 | `applyChartScores` in the same route |
| Compatibility | `horo-be/lib/astrology/compatibility.ts` | 52 to 81 observed | LLM output schema has no score field |

Compatibility has its own record: `horo-be/docs/compatibility-scoring.md`. This
document covers daily and chart.

## Problem (resolved 2026-09-05)

Daily category scores used to be produced by the LLM under prose rules. The rules
allowed an all-`2` reading on a challenging day (3 of 637 stored rows were uniform),
and the number drifted between regenerations of the same day because it was a
sampled token, not a derived fact. The chart's six-area scores had the same defect.

Both scales were also 1 to 5. The frontend divided by 5 to fake a percentage, so a
bar could only ever read 20, 40, 60, 80 or 100, and any consumer reading the raw
value saw a single digit.

## Daily formula

```
categoryScore(category) = clamp(1..100, round(
    BASE[favorability]
  + ELEMENT_AFFINITY[category][relationship]
  + BRANCH_MODIFIER[category][clashType]
))
```

| Term | Values |
|---|---|
| `BASE[favorability]` | very_favorable 78, favorable 64, neutral 58, challenging 38 |
| `ELEMENT_AFFINITY` | 0 or +11 per (category, relationship); see the table in the source |
| `BRANCH_MODIFIER` | 0 or -16; `year` clash hits career and finance, `day` clash hits love and health |

`overallScore` is the rounded mean of the four, held inside a band per favorability
so a challenging day cannot display like a good one: very_favorable 75 to 100,
favorable 58 to 78, neutral 50 to 70, challenging 1 to 45.

Inputs are already computed at the call site (`elementHarmony.relationship`,
`elementHarmony.favorability`, `branchClash.clashType`). No new astrology.

### Why the four categories differ

Each category maps to an element and to a life domain that a clash touches
differently, so one favorability no longer moves all four in lockstep:

| Category | Element | Clash sensitivity |
|---|---|---|
| career | metal (decisiveness, structure) | `year` clash (social, standing) |
| love | water (flow, connection) | `day` clash (personal, emotional) |
| finance | earth (accumulation, stability) | `year` clash |
| health | wood (vitality, growth) | `day` clash |

Invariant, verified in tests: for every relationship, career differs from finance
and love differs from health, so the four are never all equal.

## Chart formula

`calculateChartCategoryScores(profile, pillars, interactions)` scores five life
areas from three signals: the Wu Xing relation between the user's primary element
and the area's element (the dominant term, 46 to 84), the governing pillar's stem
and branch elements (up to +7), and chart-wide pillar-interaction pressure
(averaged, roughly -4 to +3). `life_overview` is the mean of the other five.
Chart scores are birth-derived and stable for life; month-to-month movement lives
in `recommendations.monthlyHighlights`, not in the score.

## Required properties

1. Deterministic: same inputs always yield the same scores.
2. Never uniform across the four daily categories.
3. Bounded: every score is an integer in 1 to 100.
4. Spread: a year of dates shows real variance, not a cluster.
5. Favorability-consistent: very_favorable scores above challenging for the same user, and the overall bands never overlap across that divide.

## Wiring (done)

1. `buildTodayPrompt` and `buildStructuredChartPrompt` inject the computed values as
   fixed facts. The prompts (`src/lib/prompts/md/today.md`, `chart.md`) tell the
   model to narrate them and forbid choosing them; `chart.md` also asks the tone of
   each reading to match its score.
2. After generation the route overwrites the model's scores with the computed ones.
   The prompt is guidance; the overwrite is the guarantee.
3. `FAVORABILITY_RULES` was removed with its only consumer.

## Contract change and legacy rows

The payload shape changed from 1 to 5 to 0 to 100. The frontend reads the value as a
percentage directly (`clampScore` on the today page; the chart energy bars render
the raw value; the readings tab buckets 0 to 100 into five Thai labels).

Rows written under the old scale are upgraded on read, not migrated:
`normalizeLegacyDailyScore` and `normalizeLegacyChartScore` map any value at or
below 5 to `value / 5 * 100`. That is safe in both directions because the new
scorers never emit a value that low (daily floor 22, chart floor 46 before
modifiers). Daily rows age out the next day; chart rows regenerate at the Bangkok
month boundary. No DB schema change, no `db:push`.

## Verification

- `cd horo-be && bun test tests/daily-scores.test.ts` (13 tests) and
  `bun test tests/chart-scores.test.ts` (11 tests). Full suite: 98 pass.
- Production spot check on 2026-09-05: the first daily reading generated after the
  deploy stored `overall 44, categories 38/38/49/49`; the first chart stored
  `72/41/59/91/90/79`; all 505 compatibility rows sit in 52 to 81.

## Still on a 5-point scale

`recommendations.monthlyHighlights[].rating` (`lib/shared/types/astrology.ts`,
`rating: min(1).max(5)`) is chosen by the model and rendered as five dots on the
chart page. It is internally consistent but not 0 to 100, and converting it needs a
deterministic monthly scorer that does not exist yet. Open decision.
