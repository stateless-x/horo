---
type: HANDOFF
status: historical
scope: documentation hygiene after the 2026-10-05 art/CDN change
last_reviewed: 2026-10-05
owner: product
---

# Doc hygiene — 2026-10-05

About 45 docs triaged across `docs/`, `horo-fe`, `horo-be` and `horo-admin`. Runtime prompt files
(`horo-be/src/lib/prompts/md/*`) and campaign content were excluded as data, not docs. Evidence was gathered by
targeted grep, git and live headers, not by full reads. Nothing was deleted.

## Open items — resolved by the owner, 2026-10-05

- Host: frontend on Vercel; horo-be, Postgres, Redis and horo-admin on Railway. `horo-fe/DEPLOYMENT.md`, both READMEs rewritten.
- `ui-content-refinement-plan.md`: historical; the codebase is the authority.
- `codex-ui-report-2.md`: closed.

Original findings:

```
Document: horo-fe/README.md:101 · horo-fe/DEPLOYMENT.md · README.md:80
Type: OPERATIONS | Status: conflicts with production | Confidence: HIGH
Evidence: docs say the frontend deploys on Railway; https://xn--y3cbx6azb.com answers `server: Vercel`,
  `x-vercel-id: sin1::…`, `x-vercel-cache: HIT`; horo-fe also ships `railway.toml` and `@vercel/analytics`
Action: REVIEW_REQUIRED — confirm which host builds the frontend, then rewrite DEPLOYMENT.md for it
```

```
Document: docs/ui-content-refinement-plan.md
Type: PLAN | Status: partly superseded | Confidence: MEDIUM
Evidence: art guidance (§ lines 17, 159–224) names deleted public/assets/clay paths and the retired clay rule;
  the index called it "canonical active" but its 2026-09-04 scope has not been re-verified
Action: REVIEW_REQUIRED — banner added; owner to say whether the rest is still the active plan or historical
```

```
Document: docs/codex-ui-report-2.md
Type: HANDOFF | Status: open since 2026-09-05 | Confidence: LOW
Evidence: ดวงคู่ parts self-marked superseded 2026-09-30; the remaining findings were not re-checked
Action: REVIEW_REQUIRED — close or re-scope; added type/last_reviewed metadata
```

## Changed

```
Document: docs/README.md
Type: REFERENCE | Status: stale entries, bloated | Confidence: HIGH
Evidence: two shipped handoffs listed as current; 80 of 101 lines were a FRESH score changelog
Action: UPDATE — statuses corrected, missing docs indexed (codex report, redis plan, image decision, routes
  decision), changelog moved to docs/fresh-score-log.md (content kept)
```

```
Document: docs/claude-ui-handoff.md · docs/claude-ui-correction-1.md
Type: HANDOFF | Status: shipped | Confidence: HIGH
Evidence: shared category map exists (horo-fe/src/lib/fortune-category-config.ts); Today has one category list
  with aria-controls, no carousel; clay asset paths they cite were deleted 2026-10-05
Action: MARK_SUPERSEDED → status historical with a dated banner
```

```
Document: docs/redis-activation-plan.md
Type: PLAN | Status: shipped | Confidence: HIGH
Evidence: "implemented (uncommitted)" is stale — horo-be/src/lib/redis.ts and generation-singleflight.ts are tracked
Action: MARK_SUPERSEDED → historical; ARCHIVE candidate once nobody needs the reasoning
```

```
Document: docs/monetization-tickets.md · horo-fe/docs/ux-visual-audit-plan.md
Type: PLAN | Status: wording stale | Confidence: HIGH
Evidence: "clay assets/art" in live guidance after the 2026-10-05 art change
Action: UPDATE — wording now points at the art registry / storybook style (5 lines)
```

```
Document: horo-fe/DEPLOYMENT.md · horo-fe/docs/decisions/static-assets-cdn.md
Type: OPERATIONS · DECISION | Status: incomplete metadata | Confidence: HIGH
Action: UPDATE — host-neutral note that `.env.production` sets the image CDN; frontmatter added to the decision
```

## Kept as is

- `horo-be/docs/{wallet,shop,feature-flags,compatibility-*}.md`: reviewed 2026-09-30 to 10-04 and untouched by this change. Not re-verified here.
- The three `CODEMAP.md` files (scoped to auth and routing, dated; nothing in them contradicts the art change).
- Docs without frontmatter (`horo-fe/docs/adding-*`, `copy-review`, `geo-llm-reference`, `learn-content-review`, `horo-be/docs/{architecture,shared-types,campaign-email}`, `horo-admin/docs/*`, the READMEs): add metadata on the next real review. Stamping `last_reviewed` without verifying would make the field lie.
