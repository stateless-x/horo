---
type: HANDOFF
status: active
scope: horo-fe-ui-refinement
last_reviewed: 2026-09-04
owner: product
supersedes: []
superseded_by: null
---

# Claude UI Implementation Handoff

## Role

You are the frontend implementation worker. Codex is the orchestrator and owns requirements, product decisions, visual direction, backend/schema sequencing, review, and final verification.

## Objective

Implement the Phase 1 immediate UI fixes and Phase 2 result-surface work from `docs/ui-content-refinement-plan.md` in `horo-fe`, without changing backend contracts or inventing new product scope.

## Working directory

`/Users/purin/dev/horo/horo-fe`

## Current context

- The repository already has concurrent/pre-existing edits; preserve them.
- The chart already uses a three-tab shell and a redesigned summary. Treat it as an existing implementation to refine, not rebuild.
- Daily v2 and compatibility v2 backend writers now exist locally. UI changes must remain tolerant of legacy stored rows and missing v2 fields.
- Existing clay category assets live under `public/assets/clay/categories/`.
- Canonical visual rules are in `DESIGN.md`.

## Scope

1. Add frontend legacy-tolerant display fallbacks needed for the planned `hookLine` and optional removed fields, without changing the backend schema.
2. Rework ดวงวันนี้ into the hero, category disclosure, and ทำ / เลี่ยง hierarchy in the canonical plan.
3. Refine the existing chart summary so shortened text has an explicit nearby `อ่านต่อ` action.
4. Integrate existing clay category assets through one shared category map.
5. Fix light-theme contrast, raw English astrology values, disabled CTA clarity, and emoji-as-interface-icon issues on touched result surfaces.
6. Move or restructure result-page ad slots so they do not interrupt the primary value/action unit; preserve required advertising behavior.
7. Split compatibility form/loading/result/history into focused components while retaining the legacy markdown result until the v2 backend contract lands.
8. Verify responsive behavior and image loading at the acceptance widths.

## Compatibility v2 contract now available

The generated shared type is `src/lib-packages/shared/types/reading.ts`. Compatibility detail/create/public-share responses now add:

```ts
contentVersion?: number;
structuredContent?: {
  contentVersion: 2;
  scoreExplanation: string;
  verdict: string;
  chemistry: string;
  caution: string;
  advice: string;
} | null;
```

- Render the structured result cards when `structuredContent` is non-null.
- Otherwise render the existing `analysis` markdown unchanged.
- Never pass a v2 JSON `analysis` string to `MarkdownRenderer`.
- Keep score and identity fields at the response top level; do not duplicate them inside prose cards.
- Deploy the tolerant frontend before enabling the backend writer.

## Likely files

- `src/app/dashboard/today/page.tsx`
- `src/app/dashboard/compatibility/page.tsx`
- `src/app/compatibility/[token]/page.tsx`
- `src/app/dashboard/fortune/page.tsx`
- `src/features/fortune/chart/fortune-overview-section.tsx`
- `src/features/fortune/chart/fortune-readings-section.tsx`
- `src/features/fortune/hooks/use-daily-fortune.ts`
- shared category/design configuration discovered from existing code

## Assets

Use existing files in `public/assets/clay/categories/`. Do not generate, redraw, or replace Codex-owned clay masters. Keep Lucide icons for functional controls.

## Constraints

- Codex owns backend and shared-contract changes. Do not edit `horo-be`.
- Do not make new fields required until Codex confirms the backend writer rollout.
- Do not remove legacy markdown compatibility rendering.
- Do not expand scope into a rebrand, navigation rewrite, authentication, or onboarding.
- Preserve unrelated and pre-existing changes.
- Follow `DESIGN.md`, including semantic tokens, 44px targets, purple/pink/element color roles, and no emoji UI chrome.
- Do not commit or push.
- Ask Codex for a decision if a material requirement is ambiguous.

## Acceptance criteria

- Existing legacy daily, chart, compatibility history, and public share results render without exceptions.
- Today’s first viewport communicates date, score, theme/takeaway, element, and lucky attributes with a clear next action.
- Chart summary exposes `อ่านต่อ` adjacent to shortened content.
- Existing category clay assets render with intrinsic dimensions, responsive `sizes`, and no layout shift.
- Compatibility’s incomplete form communicates why submission is unavailable.
- Primary content is uninterrupted by an ad slot.
- Touched pages work at 320, 375, 768, 1024, and 1440px.
- Light-theme contrast and focus states pass the repository checks and the Impeccable detector for touched files.

## Verify

1. Run the repository’s frontend typecheck and lint scripts.
2. Run relevant tests for touched features.
3. Run `node /Users/purin/skills/impeccable/scripts/detect.mjs --json` against the dashboard scope.
4. Exercise authenticated today, chart, and compatibility flows plus a public compatibility share URL.
5. Capture responsive screenshots at the acceptance widths.

## Return to Codex

- Changed files and the reason for each.
- Verification commands and complete results.
- Before/after screenshots for the touched surfaces.
- Assumptions, blockers, or remaining riskไ้s.
- Do not report the work complete until legacy payloads have been exercised.
