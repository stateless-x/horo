---
type: HANDOFF
status: active
scope: horo-fe-ui-correction-round-1
last_reviewed: 2026-09-04
owner: product
supersedes: []
superseded_by: null
---

# Claude UI Correction Round 1

Codex reviewed the actual implementation. Typecheck passes, the Impeccable detector reports zero findings, and the clay/localization foundations are accepted. Fix only the concrete issues below. Codex remains the orchestrator; do not change backend contracts, commit, or push.

## 1. Complete the Today information hierarchy

Location: `src/app/dashboard/today/page.tsx`

- The plan requires one screenshot-ready hero card containing date, score, theme, hook, daily element, and four lucky attributes. The lucky attributes are still a separate section below the reading. Move them into the hero composition without duplicating them elsewhere.
- The page still renders separate mobile carousel and desktop grid implementations. Replace them with one semantic category list/grid whose layout changes responsively through CSS. Preserve single-open disclosure behavior.
- Merge `warnings` into the เลี่ยง side. For legacy rows with more items, show the first two in the primary card and provide one explicit disclosure for remaining items; do not leave a separate red warning section.
- Add `aria-expanded` and stable `aria-controls`/panel IDs to category disclosure buttons.
- Preserve the explicit overall-reading `อ่านต่อ` behavior and the existing legacy hook adapter.

## 2. Remove the hardcoded romance hex

Location: `src/app/dashboard/today/page.tsx:44`

`#EC4899` violates `DESIGN.md`'s no-component-hex rule. Use conditional Tailwind classes for love (`fill-pink-500`, `stroke-pink-500`, theme-legible text/border equivalents) and semantic accent classes for the other categories. Do not introduce a new one-off CSS variable only for this component.

## 3. Correct the compatibility helper copy

Location: `src/app/dashboard/compatibility/page.tsx`

The date selects are pre-populated and the CTA is disabled only when the name is empty. Change the helper to accurately say that the user should enter the person's name, or change the form so the date must be explicitly selected. Prefer the smaller copy correction in this round.

## 4. Stop the donation modal from interrupting core use

Locations: `src/components/ads/donation-modal.tsx`, Today and compatibility call sites

- `AutoDonationModal` currently opens after 1.5 seconds on every eligible page view and ignores its existing storage key. This interrupts reading and was observed repeatedly during testing.
- Do not auto-open it on the compatibility form. If used on a result surface, show it only after primary value is visible, no earlier than 10 seconds, and at most once per seven days using a timestamp in local storage.
- Respect the existing permanent-dismiss value if present.
- Give the modal `role="dialog"`, `aria-modal="true"`, a labelled heading, initial focus, focus containment, and focus restoration. Make the close target at least 44×44px.
- Because this file is already being corrected, replace the decorative emoji used as interface icons and remove the hardcoded `#FF5E5B`/hover/shadow variants. Use the existing icon set and approved semantic/design tokens.
- Preserve the explicit footer/support entry point regardless of auto-display eligibility.

## 5. Harden small adapters

Locations: `src/features/fortune/hooks/use-daily-fortune.ts`, `src/lib/thai-localize.ts`

- Ensure the legacy hook fallback never exceeds 100 characters, including Thai text with no spaces; trim at a sensible boundary and add an ellipsis when truncated.
- The color-localizer comment claims support for `และ`, but implementation only splits commas. Either support both or correct the comment and add focused tests.
- Add day mappings for `wednesday_day` and `wednesday_night`, which are valid shared-schema values.

## Acceptance criteria

- Today uses one responsive category implementation and one consolidated hero.
- There is no separate warning card.
- No hardcoded color hex remains in touched Today code.
- No emoji-as-icon or one-off color hex remains in the corrected donation modal.
- Donation never appears on the compatibility form and cannot auto-open more than once in seven days.
- Keyboard users can enter, close, and leave the donation dialog without losing focus.
- Legacy daily hooks are 100 characters or fewer.
- `bun run type-check` passes.
- Focused adapter/modal tests pass.
- Run the Impeccable detector once over all corrected files and return its complete result.
- Return changed files, test/check output, and responsive screenshots at 320 and 1440px. Preserve unrelated changes.
