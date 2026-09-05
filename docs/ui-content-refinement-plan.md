---
type: PLAN
status: active
scope: product-retention-content-ui
last_reviewed: 2026-09-04
owner: product
supersedes: []
superseded_by: null
---

# สายมู Product, Content, and UI Refinement Plan

## Executive decision

Keep the current Modern Diviner's Room design system and clay visual language. The product problem is not onboarding and is not solved by a broad rebrand. The priority is to deliver useful personal value sooner, make daily readings meaningfully fresh, repair trust in ดวงคู่, and give users a clear reason to return.

The implementation sequence is:

1. Make the system measurable and backward-compatible.
2. Fix compatibility scoring and remove wasted generation.
3. Rework ดวงวันนี้ and ดวงคู่ as the primary repeat-use surfaces.
4. Generate deeper chart content only when users request it.
5. Add opt-in re-engagement after the product proves recurring value.

Canonical design rules remain in `horo-fe/DESIGN.md`. This plan owns product priorities, content contracts, rollout order, and acceptance criteria. Code and tests describe current behavior; a mismatch with this plan is a defect or an explicit decision to record, not permission to silently change the requirement.

## Corrected evidence baseline

| Finding | Product implication |
|---|---|
| 1,969 users / 1,929 profiles; 86% female; 73% age 18–29 | Design mobile-first for the observed audience without inferring behavior from gender or personality type. |
| INFP + INFJ are 40% of known types, but engagement is broadly similar across MBTI types | MBTI may personalize content; it must not drive separate UX or unsupported persona claims. |
| The Mar-15 viral cohort arrived before chart and daily launched on Apr 13 | Do not use blended 17% chart conversion as the product baseline. |
| Eligible organic profiles generate charts at 43.5% and daily readings at 26.5% | Chart discovery is acceptable; daily activation and retention remain weak. |
| Only 21% of daily users ever return for a second reading | Daily freshness and a return trigger are the central retention problem. |
| 83% of daily users start on signup day; only 9 began on days 1–7 | Activation is same-day-or-never; re-engagement must happen after first value, not through more onboarding. |
| Daily usage peaks around 10:00 and 18:00 Bangkok time; Monday is strongest | Test an opt-in Monday outlook and a 09:30–10:00 daily delivery window. Treat the exact uplift as provisional until recalculated. |
| All 504 compatibility rows score exactly 75 | Compatibility scoring is a hardcoded product defect and a trust blocker. |
| 39% of compatibility users checked at least two people; คนคุย is the largest type | Lead the compatibility proposition with คนคุย and preserve comparison/share behavior. |
| Usage is declining after launch waves | Treat the approximate monthly decline as directional until acquisition, cohort retention, and seasonality are separated. |

## Product experience model

Every generated result should follow the same four-level model:

1. **Instant identity:** deterministic element, pillars, birth star, or relationship inputs appear immediately.
2. **One clear takeaway:** a short, emotionally useful hook and one action.
3. **Optional depth:** categories and explanations open on demand with explicit labels.
4. **Return promise:** show what may change tomorrow or next week, then offer an opt-in reminder.

Do not automatically generate or show every possible paragraph. Progressive disclosure is limited to two reading levels: summary and detail.

## Phase 0 — safety, baseline, and measurement

### Payload versioning

- Add `contentVersion` to new daily, chart, and compatibility payloads.
- Frontend readers must accept legacy and current payloads before backend writers change.
- Add explicit adapters:
  - daily v1 derives a fallback hook from the first sentence of `overallReading`;
  - chart v1 tolerates fields removed from v2;
  - compatibility v1 renders stored markdown, while v2 renders structured cards.
- Do not backfill or overwrite historical readings as part of rollout.
- Deploy order: tolerant frontend reader → versioned backend writer → monitor → later remove obsolete assumptions.

### Analytics event contract

Instrument these events with `contentVersion`, surface, cached/generated status, and anonymous profile/user identifiers where permitted:

- `reading_viewed`
- `reading_generation_started`
- `reading_first_value_visible`
- `reading_generation_succeeded`
- `reading_generation_failed`
- `reading_detail_opened`
- `reading_shared`
- `reading_feedback_submitted`
- `reminder_opt_in_viewed`
- `reminder_opted_in`

Record server-side generation duration, model, input/output tokens, retry count, validation failure, and estimated cost. Never send birth data, names, or generated prose in analytics properties.

### Baseline definitions

- Chart activation: eligible profile → generation started → successful result.
- Daily activation: eligible profile → first daily result.
- Retention: D1, D7, and D30 return cohorts in the Asia/Bangkok timezone.
- Consumption: summary viewed → detail opened → share/feedback.
- Performance: p50/p95 time to deterministic value and time to generated summary.
- Quality: repeated-theme rate over seven days and negative-feedback rate.

## Phase 1 — trust, speed, and generation waste

### Compatibility score

- Replace the hardcoded `75` placeholder in `horo-be/lib/astrology/compatibility.ts` with a deterministic, tested score based on documented element and branch relationships.
- Define score bands and explanations before exposing the value.
- Add invariant and fixture tests: score range 0–100, symmetry where intended, varied fixtures produce a non-constant distribution, and identical inputs are deterministic.
- Existing rows remain labelled legacy; do not present them as newly calculated scores.

### Daily content v2

Target approximately 1,300 Thai characters:

- `hookLine`: one sentence suitable for the hero/share card.
- `overallReading`: maximum three sentences.
- Four categories: maximum two sentences plus one action tip each.
- `warnings`: one or two items.
- `dos` and `donts`: two items each, merged into one ทำ / เลี่ยง UI section.
- Keep lucky numbers, color, direction, and time.
- Remove unused `suggestions` from the prompt, validator, type, and new payload.

Use sentence and character envelopes rather than Thai word counts. Log over-budget fields. Retry only for structurally invalid output; avoid expensive whole-response retries for a small length overrun.

### Daily anti-repetition v1

1. Calculate today's astrological signals first.
2. Choose a `focusKey` from the strongest eligible current signal.
3. Load the previous seven readings' `themeKey`, `focusKey`, hook, and action tags.
4. Penalize recently used eligible focuses without overriding the real signal.
5. Generate with explicit novelty constraints.
6. Compare hook/theme against recent output using normalized phrase overlap.
7. Retry once with the next eligible focus if similarity exceeds the defined threshold.
8. If the signal genuinely continues, say so explicitly instead of fabricating novelty.

Persist novelty metadata with the reading. Start with structured tags and phrase overlap; add semantic embeddings only if measured false negatives justify the cost.

### Daily category-score diversity (RESOLVED 2026-09-05)

Resolved by option 1 below: scores are computed in `horo-be/lib/astrology/daily-scores.ts` on a 0 to 100 scale and overwritten after generation. See `docs/deterministic-category-scores.md`. The text below is kept as the record of the defect.

Observed in production: a reading whose four category scores were all `2`. Verified not a parsing bug — `horo-be/src/lib/llm.ts` applies no score defaults or clamps, so stored scores are exactly what the model returned.

- Frequency: 3 of 637 stored readings all-time are uniform across `career`/`love`/`finance`/`health`; all three are all-`2` on challenging days.
- Cause: `src/lib/prompts/md/today.md` forbids only uniform `3`s (`ห้ามให้ทุกหมวดได้ 3 เหมือนกัน`), while `FAVORABILITY_RULES.challenging` in `src/lib/prompts/today.ts` steers scores to 2–3. All-`2` satisfies both rules literally.
- v2 does not resolve it: the same challenging day produced `[2,2,2,3]`.

Fix options, preferred order:

1. Derive each category score deterministically from per-category element/branch relations — the approach already proven in `horo-be/lib/astrology/compatibility.ts` — and pass fixed scores into the prompt for the model to narrate. Also removes score drift between regenerations.
2. Interim: tighten the prompt rule to require at least two distinct values across the four categories, and forbid a single-category deviation.

### Chart content v2

- Six personality traits.
- Life overview: approximately 180 Thai words; other areas approximately 120–150, but enforce sentence/character telemetry rather than relying on tokenized Thai word counts.
- Two tips and one warning per category.
- Three monthly highlights; remove optional advice/warning subfields from new output.
- Stop generating or transporting `pillarInteractions` where no UI consumes it.
- Treat `lifeAreaDetail` as deterministic payload cleanup, not an LLM saving.

### Immediate interface fixes

- Localize raw values such as `Purple` and `saturday` into Thai.
- Move ads after the primary value and action unit; reserve dimensions to avoid layout shift.
- Fix light-theme contrast, disabled CTA clarity, and token violations.
- Reuse existing clay category assets; keep Lucide for functional chrome.

## Phase 2 — primary result surfaces

### ดวงวันนี้: 30-second ritual

- Hero contains date, purple score treatment, theme, hook, daily element clay asset, and four lucky chips.
- Hero is the canonical share composition.
- Four responsive category cards use the shared clay category map; tip is visible and detail opens on tap.
- One responsive implementation replaces separate mobile/desktop content trees.
- One ทำ / เลี่ยง card contains two items per side.
- Show low-effort feedback after the primary action.
- After value is delivered, tease tomorrow's changing signal and offer an optional reminder.

### ดวงคู่: situationship and comparison loop

- Lead relationship selection and copy with คนคุย while retaining all six types.
- Split form, loading, result, and history into focused components.
- Compatibility v2 contains: score, score explanation, one-line verdict, เคมี, จุดที่ต้องระวัง, and คำแนะนำ; each prose section is no more than three sentences.
- Public share and authenticated views support legacy markdown and v2 structured results.
- Clarify disabled form states and field-level errors instead of presenting a washed-out unexplained button.
- Put history and “check another person” after the first result to support comparison.

#### Optional partner MBTI (implemented 2026-09-05, two open follow-ups)

The compatibility form accepts an optional partner MBTI (`ไม่ระบุ` default, empty fully supported). Invalid non-empty codes return 400. The value is threaded into the prompt as a conditional block and blended into the analysis; it is **not persisted** and affects fresh generations only.

- **Cache interaction:** a cached result for the same partner birth date and relationship type is returned unchanged, so adding an MBTI to an already-checked person shows the previous reading. Decide between UI copy explaining this and an explicit regenerate path; do not silently widen the unique index without a migration decision.
- **Untested validation:** the MBTI validation in `horo-be/src/systems/compatibility/routes.ts` has no unit test because the route module imports `db` at load time, which requires a live `DATABASE_URL`. Extract the validation helper when that file is next touched.

### ดวงชะตา: preserve value, defer depth

- Keep the existing สรุป / อ่าน 6 ด้าน / ที่มาของดวง shell.
- Make summary the default and shareable centerpiece.
- Place an explicit `อ่านต่อ` beside the shortened overview; never rely on an unexplained ellipsis.
- Use clay category assets and score treatments in the six-area accordion.
- Render deterministic element, pillars, and birth star before narrative generation completes.

### Voice and visual rules

- UI instructions use `คุณ`; oracle prose may use `เจ้า`.
- Purple is the default semantic accent. Pink is reserved for romance; element colors represent actual element data only.
- Clay imagery communicates meaning. Navigation, close, share, chevrons, and other controls remain conventional icons.
- No emoji as interface icons.
- Preserve minimum 44px touch targets and responsive behavior from 320px mobile widths upward.

## Phase 3 — on-demand depth and re-engagement

- Generate a useful summary first.
- Generate expensive detailed chart content only after the user requests it; do not automatically spend a second full LLM call in the background.
- Test Monday weekly outlook and daily reminder opt-ins at 09:30–10:00 Bangkok time.
- Treat the dormant Mar-15 cohort as a separate reactivation campaign and exclude it from normal product conversion baselines.
- Test personalized share cards before wallpapers; ship wallpapers only if sharing or saves demonstrate demand.

## Asset plan

Use existing `horo-fe/public/assets/clay/categories/*.webp` throughout daily and chart surfaces. Consolidate category metadata into one shared map containing key, Thai label, asset path, and functional fallback.

Commission only after layout slots are stable:

1. Six relationship types.
2. Lucky number, color, direction, and time.
3. Score glyph.
4. Do and avoid markers.

Assets must follow `horo-fe/DESIGN.md`: matte soft 3D clay, soft single-source lighting, transparent WebP, responsive intrinsic sizing, and no decorative image that competes with the reading.

## Acceptance criteria

### Reliability

- Legacy daily, chart, compatibility history, and public compatibility links still render.
- New payloads carry a known content version and pass runtime validation.
- Compatibility scores are deterministic, non-constant, explained, and covered by tests.

### Product and content

- New daily readings are at most 1,500 Thai characters at p95.
- New chart narrative content is at most 8,000 Thai characters at p95.
- Repeated daily hooks/themes remain below the agreed seven-day similarity threshold.
- No generated field is paid for without a visible product consumer.

### UX and performance

- Deterministic value appears before the LLM result.
- All primary paths work at 320, 375, 768, 1024, and 1440px.
- Dashboard has no serious automated contrast or accessibility findings.
- Ads do not interrupt the primary value/action unit and do not introduce material layout shift.
- Images use correct intrinsic dimensions, responsive `sizes`, lazy loading below the fold, and modern optimized formats.

### Measurement

- D1/D7/D30 retention is reported by eligible acquisition cohort.
- Generation success, latency, token use, and cost are visible by content version.
- Phase 2 is evaluated against a pre-release cohort baseline, not the blended historical population.

## Ownership and coordination

- Claude UI worker: `horo-fe` surface implementation only, following `docs/claude-ui-handoff.md`.
- Codex orchestrator: product decisions, `horo-be`, payload/version strategy, instrumentation contract, asset direction, review, and final verification.
- Preserve existing changes. Do not commit or push without explicit user authorization.
- One writer per repository area at a time; coordinate shared-type changes explicitly before editing generated/synchronized copies.

## Verification commands

Use the package scripts defined by each repository. At minimum:

- backend typecheck and tests, including compatibility scoring fixtures;
- frontend typecheck, lint, and relevant component tests;
- `node /Users/purin/skills/impeccable/scripts/detect.mjs --json` scoped to dashboard UI;
- manual authenticated checks for new and legacy daily, chart, compatibility history, and public share flows;
- responsive visual checks at the acceptance widths;
- inspect actual generated payload lengths and repetition telemetry, not prompt instructions alone.
