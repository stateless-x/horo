# Free BaZi and paid monthly depth

Status: the corrected teaser-first/ticket-triggered-detail flow is built and verified locally. Current-month entry saves only a personalized LLM teaser; a valid pass generates the full reading and atomically saves it with one pass use. Failure preserves the pass and teaser. Free BaZi, historical reading, the 149 มู Shop pass, and initial admin activity reporting are built locally. Production migration, live content quality/cost review, linked analytics funnels, refund reconciliation, and a paid pilot remain open. The monthly sales flag remains off by default.
Date / last checked: 2026-10-22 (Asia/Bangkok).
Owner: product owner; production rollout and analytics owners to be assigned.
Product: สายมู / horo. Mode: monetize + UX/UI shape.
Location: `docs/monthly-fortune-bazi-monetization-plan.md` is the canonical implementation plan.
Authority: current code wins for shipped behavior; owner decisions below govern the proposal.

## Implementation status (2026-10-21)

| Slice | Status | Evidence |
| --- | --- | --- |
| Free BaZi entry | Built locally: authenticated `/api/fortune/bazi`, `/dashboard/bazi`, monthly/settings links, first-party `bazi_open` and CTA events | Backend and frontend type checks passed. BaZi begins with a plain-language free summary and reuses saved pillar interpretations when present; a new reader without a saved chart still gets deterministic content only. Content parity for new readers remains a launch gate. |
| Current-month guidance | Built locally: new generation prompt asks for one selected-month highlight; validation rejects multiple highlights; monthly recommendations UI displays only the first highlight and uses month wording | Focused chart-period and frontend guidance tests passed. Old stored narratives may still contain future-month fields until migration, but the API trims cached responses to the first selected-month highlight and the UI shows only that highlight. |
| Legacy report conversion | Built locally; database integration pending | Migration 0015 captures the current cached free report. With `monthly_lock` on, opening that month or a saved older month regenerates the new LLM teaser, replaces the old free report atomically, and follows the normal ticket unlock. History lists such months as unopened. A failed regeneration leaves the stored row intact for retry. The conversion test is written but skipped without a local test database. Production has not been touched. |
| Shop pass and monthly unlock | Correct generation order built and local database tests passed | `monthly_pass_1` is a 149 มู Shop offer granting one nonexpiring `monthly_unlock` credit. `/api/fortune/monthly/unlock` generates detail only after checking ownership and ticket balance; it saves detail and consumes the pass in one transaction. Tests cover purchase, one-report use, preview secrecy, history reread, failed generation without ticket use and isolation. Real bank return, month-end timing and refund/report correction remain unverified. |
| Preview and premium quality | Standalone LLM teaser and revised UI built; live content review pending | `GET /chart` saves a focus, explanation, first step, six hooks and three reader questions without generating full prose. The full model call starts on valid-ticket unlock. The local page now presents free value and selectable questions leading to the 149 มู door; desktop and phone were inspected. Live local samples exposed unsupported week/event claims, English leakage and overly specific finance questions, so generation now supplies a mid-month pillar reference, constrains question framing and rejects several unsupported patterns. This remains a limited guard, not a full content-quality proof. Existing old locked rows use the earlier short preview until regenerated. Keep production `monthly_lock` off pending reader review and cost measurement. |
| In-house admin funnels | Partial | BaZi/history and initial monthly events are instrumented. Engagement shows monthly pass purchases/uses, BaZi activity and compatibility unlock outcomes as independent totals. Correlated funnels, funding attribution and reconciliation are not built. |

## Implementation status (2026-10-23, orchestrated review)

Orchestrator: Fable (main session) reviewed every slice's diff and artifacts directly, re-ran the named checks, and drove the local pilot in the browser. Workers: Opus 5.5 subagents, one per slice, with disjoint file ownership.

| Slice | Verdict | Evidence |
| --- | --- | --- |
| Paid monthly contract (`horo-be` 422fb18, merged 5a315c9) | Accepted with follow-up | `generateMonthlyDetail` no longer reuses the whole-chart prompt: `prompts/md/monthly-detail.md` + `monthly-detail-validate.ts` + field-level repair (`llm.ts generateWithFieldRepair`, max 2 small repair calls) + `monthly_generation_attempts` rows. Two six-profile real-model runs (`deepseek-chat`): 12/12 teasers and 11/12 details saved, mean detail wall time 33 to 36 s, one detail call ≈ 6.0k prompt / 3.3k completion tokens, with repairs 8.4 to 13.2k / 2.9 to 4.4k. First-answer pass is low (1/12 details) so reliability rests on repair; the 1-in-12 failure returns 502 with the ticket intact and is logged. Residual leaks the patterns miss: mild "มีคนเปิดรับฟังคุณ"-style phrases. Human read of final-3/p4 and final-5/p3: each area adds mechanism, a concrete situation, a decision rule and an observable sign beyond its free hook; element statements match the computed month and self elements. |
| Teaser correctness | Accepted | Same element line and checks added to the teaser (`monthly-teaser-validate.ts`): month/self element consistency, week and part-of-month timing, sleep claims, invented events. Previously a teaser named the wrong month element. |
| Free BaZi narrative (`horo-be` 8132825, `horo-fe` 203f6aa) | Accepted | `bazi_narratives` per profile version; GET /bazi generates once (single-flight, chart rate limit), degrades to deterministic content with a retry status on failure; validator rejects timing, job/partner assumptions, health, non-Thai, the reader's name and element statements that contradict the day master. Samples: 1 call ≈ 4.1k/1.9k tokens, 18 to 22 s; with correction 28 to 32 s. Local pilot: first open rendered a coherent ตัวตน / งานและความสัมพันธ์ / แผนผัง narrative in about 35 s. |
| Admin linked funnels (`horo-admin` d04d89e) | Accepted | `monthly-funnel.ts`: linked monthly funnel by user and report month, cash-backed (order) vs existing-balance purchases, refunds, generation quality and estimated cost (rates shown), reconciliation rows (purchases = grants, spends = purchases, uses = paid reports, orphans, refund rows), BaZi reach, compatibility paid funnel. Absent tables show "ยังไม่ได้เริ่มเก็บข้อมูล". Verified with an opt-in local-Postgres query test in four states; no prose or birth columns read. The owner does the visual pass (no admin dev login). |
| Schema (`horo-be` 3754454) | Accepted | Migration 0016 adds `monthly_generation_attempts` and `bazi_narratives`; snapshot chain brought current. |
| Frontend tests (`horo-fe` 8a4920d) | Accepted | Order-dependent failures fixed (`screen` bound to a stale happy-dom body); suite 361 pass. |
| Local pilot (fake payment provider, local DB, flag on) | Passed | Legacy free October report converted to the new teaser on entry (1 repair round, 14 s); offer → mini shop → ฿149 top-up → ticket purchased in the same flow (+149 / −149 ledger rows, one grant); explicit month confirmation; unlock saved the paid report in 31 s with one `monthly_unlock` use and one attempt row carrying tokens, duration and the use id; a second unlock answers `already_open`; history lists the month as เปิดแล้ว and rereads without a charge; Shop shows the ticket card; mobile layout holds. Real PromptPay return, real receipts and refunds were not exercised locally. |

Checks re-run by the orchestrator after integration: horo-be `tsc` and `bun test` (633 pass), database suites (`monthly-unlock`, `shop`, `bazi-narrative-route`: 40 pass); horo-fe `tsc`, `bun test` (361 pass), `next build`; horo-admin `tsc`, `bun test` (226 pass), `next build`, local-DB query test (4 pass).

### Production migration (prepared, rehearsed, not applied)

Read-only check on 2026-10-23 matched the 2026-10-22 audit (13 tracker rows ending at 0012; no `monthly_reports`; 402 `chart_narratives`; 26 linked Google+X users). The rehearsal on a restored backup found one more hazard: the tracker's id sequence sits behind its hand-inserted rows 9 to 12, so any insert collides. `horo-be/scripts/release/2026-10-monthly/apply.sql` realigns the sequence, applies 0015 + 0016 and records 0014 to 0016; `verify.sql` and `rollback.sql` were exercised (apply → verify → rollback → re-apply; 402 legacy months backfilled across 2026-04 to 2026-10; a second apply fails on its precondition). `db:migrate` must never run on production: the history does not rebuild the push-built schema. Migration 0013 is deliberately not recorded; applying it would split 26 accounts (24 last seen before July, 2 active in October, 1 live session, 7 with chart narratives, 0 purchases). Runbook: `horo-be/scripts/ensure-migrations.md`.

### Deploy record (2026-10-23 evening, Asia/Bangkok)

Order as it actually happened: root `main` e1efb5b → horo-fe `master` 3827ee3 (Vercel) → horo-be `master` 905a466 (Railway; its startup push created the three tables, so the push-first variant `apply-after-push.sql` ran next: 402 legacy months backfilled, tracker 16, only 0013 unrecorded) → horo-be `master` 51ec4ef (DeepSeek V4 support; live log confirms `model=deepseek-flash thinking=disabled` and a public teaser generated). `DEEPSEEK_MODEL=deepseek-flash` is set on the Railway `api` service. Model decision: the owner chose the current DeepSeek model; `deepseek-chat` is a legacy alias no longer on DeepSeek's price list. On flash the monthly contract measured 12/12 teasers and 12/12 paid details saved across two six-profile runs (mean detail 31.5 s) after the repair-engine changes in 51ec4ef; cost per generation is about half of the chat figures. `monthly_lock` remains off.

### Open before enabling sales

1. Owner go for `apply.sql` on production (backup `~/horo-backups/horo-prod-20261023-124421.dump` exists; take a fresh one right before applying).
2. Owner decision on migration 0013 (independent of this release).
3. Deploy horo-be first and prove it live, then horo-fe, then horo-admin; keep `monthly_lock` off.
   Then convert all old free reports up front with `horo-be/scripts/convert-legacy-monthly.ts` (owner decision 2026-10-23: keep the new teaser only; measured on the production copy at about ฿0.08 per row and about 30 minutes for 402 rows, each conversion logged as a teaser attempt). A few days after the flag is on, `cleanup-legacy-chart-cache.sql` removes the old whole-chart cache.
4. Owner pilot with a real PromptPay top-up: receipt, ticket, unlock, reread, refund of an unused ticket, then switch `monthly_lock` on in horo-admin.
5. Follow-ups logged, not blocking: raise the detail first-answer rate (code-switching is the main cause); residual "มีคน…" phrasing; the mini-shop dialog hides the balance/shortfall line for the monthly ticket (the pack sheet still shows it); `check-migrations.js` reports historical rows as missing because their timestamps predate the regenerated journal.

## Decision

**Keep BaZi free on its own page. Auto-generate a partial personalized monthly LLM teaser; sell a 149 มู ตั๋วดวงเดือน in the Shop, then generate and unlock the selected month's full detail with one pass [Owner decisions, 2026-10-20 and 2026-10-21].** The pass follows compatibility's teaser-first/detail-on-unlock model, never expires, and is distinct from ตั๋วรู้ใจ. An opened month stays readable from history without regeneration or another pass. A failed full generation must not use a pass. No automatic renewal. The report covers that month only, with no year-ahead or multi-month highlights. The earlier direct-spend proposal, 29 มู price and price ladder are superseded; willingness to pay at 149 มู remains unmeasured.

The owner clarified that monthly and BaZi already exist together and are free, then set the monthly unlock price to 149 มู and required past-month history. BaZi stays free. The new monthly offer uses a free preview and a paid full reading. On 2026-10-22 the owner chose to regenerate old saved free monthly readings as new teasers and apply the normal ticket unlock, rather than grandfather the former full text. “Extract BaZi” means separate navigation, content ownership, and caching.

The distinction users should understand:

| Surface | User question | Access | Reason to return |
| --- | --- | --- | --- |
| พื้นดวงของฉัน · ปาจื้อ | “ฉันมีแนวโน้มแบบไหน และเพราะอะไร?” | Free, including existing chart detail | Revisit self-understanding; correct birth information |
| ดวงเดือนนี้ | “เดือนนี้ภาพรวมเป็นอย่างไร?” | Free preview | A new calendar month |
| ดวงเดือนนี้ฉบับเต็ม | “เรื่องนี้เกี่ยวกับฉันอย่างไร และมีอะไรที่ลองทำได้?” | 1 ตั๋วดวงเดือน per named month; 1 pass costs 149 มู in the Shop; rereading is free | New month, new grounded interpretation |
| ดวงคู่ | “ความสัมพันธ์นี้เป็นอย่างไร?” | Existing compatibility model unchanged | A different relationship/context |

BaZi provides a coherent interpretation framework; it does not establish that the product can know everything about a person or predict outcomes reliably. Sell relevance, clarity, and useful reflection. More words and more chart symbols alone do not justify payment.

**Reading guide:** content boundary → page design → purchase rules → engine/data requirements → validation and rollout.

## Evidence and what remains unknown

Sources below were inspected locally on 2026-10-20. `[C]` means verified code/configuration, not measured commercial demand. `[M]` is a fresh measured business metric, `[I]` an inference from measured data, `[A]` an assumed proposal, and `[?]` a gap. Counts in implementation requirements are design constraints, not research findings.

| Finding | Evidence / consequence |
| --- | --- |
| Monthly already exists and contains BaZi | [C] `horo-fe/src/app/dashboard/fortune/monthly/page.tsx`; tabs are สรุป, ดวง 6 ด้าน, แผนผังชีวิต in `fortune-tab-bar.tsx`. Use this as the migration source. |
| Full chart mixes permanent and time-based content | [C] `horo-be/src/systems/fortune/routes.ts`, `GET /chart`; combines pillars, elements, birth star, category readings, recommendations and month label. |
| Month rollover deletes the old chart narrative | [C] Same route deletes `chartNarratives` and regenerates. This storage cannot own purchased history. |
| Category scores do not change monthly | [C] `horo-be/lib/astrology/chart-scores.ts` explicitly describes stable lifetime scores. Do not relabel them as monthly changes. |
| BaZi date calculation uses approximate fixed boundaries | [C] `horo-be/lib/astrology/bazi.ts` uses a fixed spring-start date and `SOLAR_TERM_BOUNDARIES`; unknown birth hour omits the hour pillar. Exact timing claims need additional validation. |
| Compatibility is a useful interaction reference | [C] `src/systems/compatibility/unlock.ts`: owner checks, single-flight generation, atomic save/charge, attempt logging; generation failure uses no ticket. |
| Compatibility now consumes feature credits | [C] `src/lib/catalog.ts`, `src/lib/feature-credits.ts`: มู buys ตั๋วรู้ใจ; this is not a ready-made arbitrary monthly-entitlement system. |
| Shop pass is implemented locally | [C] `src/lib/catalog.ts` seeds `monthly_pass_1` at 149 มู and grants `monthly_unlock`; `src/lib/feature-credits.ts` consumes that feature only. The older `src/lib/pricing.ts` placeholder now says 149 but is not the Shop offer authority. Local database integration covers automatic teaser caching, teaser secrecy, full-on-ticket generation and failure without pass use. |
| Wallet economics matter | [C] Same file: smallest top-up ฿49 for 49 มู; largest pack ฿999 for 1,200 มู; rewards also give มู. Unlocks can occur without new cash revenue. |
| Demand, conversion and costs | [?] No fresh production or analytics query performed. Current payers, exposed-user conversion, payment-method revenue, failures/refunds, repurchase, cost per generated report, and support themes are unknown. |

Existing product context (`horo-fe/PRODUCT.md`) identifies Thai Gen-Z women and Thai mobile web as the audience. Initial test segment [A]: returning signed-in readers with a birth profile who have read the current monthly report; split existing cash payers, reward-only users, and nonspenders. Do not generalize results to all visitors.

### Previous decision follow-up

Read `/Users/purin/product-decisions/horo/CURRENT.md`, which points to the wallpaper decision dated 2026-10-11. Its tracking rows are retained as historical context, not remeasured evidence:

| Previous tracking row | Previous target | Current status |
| --- | --- | --- |
| Distinct wallpaper buyers | At least 15 in 30 days [A, prior brief] | [?] Needs purchase aggregate; review was 2026-11-10 |
| Earned versus topped-up spending | Observe share | [?] Needs funding attribution |
| Designs per buyer | At least 1.8 [A, prior brief] | [?] Needs purchase aggregate |
| Check-in users reaching day 8 | Improve against prelaunch | [?] Needs cohort export |
| Downloads per owner | At least 1 [A, prior brief] | [?] Needs download events |

Do not reuse the old active-user count or payer count as today's baseline. This plan does not cancel the wallpaper review.

## Content boundary: free BaZi, monthly preview and paid full reading

### Free BaZi: a useful destination, not a technical appendix

Proposed canonical route: `/dashboard/bazi`, matching the authenticated route structure. The owner's `/bazi` shorthand can be an alias if short routes are introduced deliberately; do not create a parallel unprotected data route. The inspected monthly route is `/dashboard/fortune/monthly`.

Page name: **พื้นดวงของฉัน**. Subtitle: “รู้จักตัวเองผ่านปาจื้อ”. Organize around what people want to understand:

- **ฉันเป็นคนแบบไหน:** a short synthesis, strengths, recurring tensions, and what helps restore balance.
- **งานแบบไหนเข้ากับฉัน:** working preferences and environments, without asserting a fixed occupation or guaranteed success.
- **ฉันเป็นอย่างไรในความสัมพันธ์:** communication needs and common friction, without inventing relationship status.
- **ทำไมถึงอ่านแบบนี้:** expandable elements, pillars and their interpretation. Technical detail stays available and free.
- **ข้อมูลที่ใช้:** birth date, known/unknown birth time, and a clear edit action. Explain limitations beside affected content.

Reuse `ElementProfileSection`, `FourPillarsSection`, and their existing disclosure/detail components. Inventory each field before moving it. `BirthStarSection` is Thai astrology: keep it free, label it as Thai astrology, and link to it from this page rather than presenting it as BaZi. Split `RecommendationsSection`: stable advice belongs with the natal profile; only selected-month guidance remains monthly. Remove future-month and entire-year highlights from new outputs, UI and share payloads; do not move them into the free BaZi page.

Do not automatically promise new free sections that require unsupported calculations. Existing content moves first; proposed new plain-language synthesis is a separate quality task with examples reviewed before launch.

### Monthly preview and legacy access

New monthly reports first generate and save a useful, personalized LLM teaser with a free summary and specific category previews. A valid ticket then triggers generation of the full narratives, explanations and practical suggestions for that saved month; only successful persistence uses the ticket. Clearly announce this change before the first paid confirmation. Backfill a saved old free report so it can be identified, then replace it with the new teaser on first access after the lock is enabled. The old full text is no longer displayed; a ticket opens the newly generated full reading. If teaser generation fails, retain the saved row and let the reader retry. Do not promise recovery of older months already deleted by the existing backend. New reports must not generate year-ahead highlights.

Replace the current “แผนผังชีวิต” tab with a clear link to the free BaZi destination after migration. Keep old anchors/deep links working where they exist. Stable natal scores should move to the natal context or be explicitly labelled “แนวโน้มจากพื้นดวง”; do not imply their values measure this month's prospects.

### Paid monthly depth: a different answer format

One unlock covers all premium topics for that month. No pay-per-category wall and no paid BaZi prerequisite.

| Question | Additional paid value | Quality requirement |
| --- | --- | --- |
| “เดือนนี้ควรให้ความสำคัญกับอะไร?” | A prioritized interpretation connecting natal patterns to verified month context | Explain why this month differs; not a recycled natal description |
| “งานหรือการเรียนมีอะไรที่ควรลอง?” | A concrete situation, a tension to notice, and an optional next step | Avoid assuming employment, promotion or exam dates |
| “ความสัมพันธ์ควรคุยกันแบบไหน?” | Communication scenarios and example phrasing | Relationship-neutral by default; no claims about another person's thoughts |
| “เรื่องเงินควรระวังนิสัยอะไร?” | Spending/planning reflection linked to the reading | No investment calls or promised windfalls |
| “จะดูแลตัวเองและอยู่กับคนใกล้ตัวอย่างไร?” | Energy, rest and family-boundary reflection | No diagnosis, danger prediction or fabricated family events |
| “อ่านแล้วเอาไปใช้อย่างไร?” | A small saved checklist of actions chosen from the report | Useful even if the user does not open technical chart detail |

Each premium section follows: **what the reading suggests → why it relates to this profile/month → recognizable situation → a small optional action**. Show the evidence explanation in plain Thai, with technical details expandable. Do not use raw model reasoning as “evidence”.

No year-ahead highlights, list of upcoming months, or annual forecast in this product. No precise lucky dates, weekly forecasts, ten-year luck cycles, or “best day to resign” in the first release unless a validated calculation explicitly supports them within the purchased month. A reflection checklist can be sequenced by the user without pretending its timing was calculated.

Before charging, compare the previous free report and proposed 149 มู report for the same profile/month side by side. The new report must earn its price through specific, grounded answers and useful depth, not just longer prose. The owner-approved preview/full split also applies to converted old reports after the announced cutover.

## UX/UI plan

Direction: extend the existing light-first purple storybook identity in `horo-fe/DESIGN.md` and semantic tokens in `src/app/globals.css`. Use the existing SectionSwitcher, disclosures, Thai typography, art registry and wallet purchase conventions. Reading is the primary mode; payment is a short task within it.

Asset decision (2026-10-21): no additional generated image is required for this slice. The Shop card and pass sheet reuse the existing mascot scroll illustration, while the BaZi page uses existing element art. Review those placements in the local `/monthly-preview` sample before commissioning any new pass illustration.

### Monthly page composition

```text
ดวงเดือนนี้                         [เดือนที่อ่าน ▾]
ตุลาคม 2569 จากข้อมูลเกิดของคุณ

[Free monthly preview, immediately readable]
[สรุป] [ดวงแต่ละด้าน]
[Specific category previews]

ดวงเดือนนี้ฉบับเต็ม
สิ่งที่อ่านเพิ่มได้ + one real sample answer
[ตั๋วดวงเดือน 1 ใบ · ซื้อในร้าน 149 มู]
[ใช้ตั๋วเปิดดวงเดือนนี้] หรือ [ซื้อตั๋วในร้าน]
ตั๋วไม่หมดอายุ เปิดแล้วกลับมาอ่านเดือนนี้ได้ ไม่ใช้ตั๋วซ้ำ

[พื้นดวงของฉัน อ่านฟรี →]     [ดูเดือนที่ผ่านมา →]
```

The sample is explicitly illustrative if it is not personalized. Never show fabricated personalized text or a blurred full report already delivered to the browser. Put the offer after a useful, complete free preview. Use one clear offer block; avoid six repeated locks. Compatibility cross-promotion stays secondary to the page's own job.

After unlock, replace the offer with “เปิดแล้ว” and a link into the deeper sections. Keep free and deeper content visually distinguishable by headings, not separate competing dashboards. A compact topic navigator helps long reads; desktop can use a side contents list, while mobile uses the shared switcher or anchor row.

### BaZi page composition

```text
พื้นดวงของฉัน                      [แก้ไขข้อมูลเกิด]
รู้จักตัวเองผ่านปาจื้อ อ่านฟรี
[Personal summary + primary element illustration]
[ตัวตน] [งานและความสัมพันธ์] [อ่านแผนผัง]
[Plain-language interpretation, then expandable chart]
[เดือนนี้มีอะไรต่างออกไป? ดูดวงเดือนนี้ →]
```

One modest illustration introduces the reading; chart symbols do not dominate the first screen. No paid lock icons on BaZi. Retain a visible explanation when birth time is unknown: “ยังไม่ทราบเวลาเกิด จึงอ่านได้จากข้อมูลวันเกิดที่มี”. Never silently fill an invented hour.

### Payment and state behavior

| State | User sees / action |
| --- | --- |
| Has a pass | Show pass count and named month; confirm that one pass opens this month and that rereads are free. |
| No pass | Open the `monthly_pass` Shop offer, one pass for 149 มู. If balance is short, Shop shows the shortfall and top-up choices. From zero, the existing ฿149 top-up gives 149 มู [C arithmetic]. |
| Returning from top-up | Resume the same Shop offer and quoted price. Once the pass is delivered, ask to use it on the selected month; never silently switch months or consume a pass without explicit month confirmation. |
| Price changed | Show the new price and ask for fresh confirmation before spending. |
| Generating | Explain that the report is being prepared; disable duplicate confirmation; let the user leave and resume. No fake completion percentage. |
| Failure before successful delivery | No pass use. Retry the unlock; a successful pass purchase stays in the account. |
| Already unlocked | “อ่านอีกครั้ง” with no price or additional charge. |
| Month changed | New month stays locked; old purchased month remains readable. No automatic deduction and no expiry countdown. |
| Missing birth time | Allow qualified reading with unavailable hour-based claims omitted. Prompt for the time gently, never block the free experience. |
| Edited birth data | Preserve old reports with their input snapshot. Offer one corrected regeneration per owned month [A policy]; repeated edits route to support. No silent rewrite or new charge. |
| Refund | Unused pass purchase can follow the Shop's existing reversal policy. A consumed pass/report correction needs a separate documented support policy; never revoke a purchased report silently. Cash-top-up refunds are separate. |

Choose a calendar month in Bangkok time as the product, not a rolling thirty-day pass. Show the full month before purchase. A saved unopened past-month teaser remains in history and may be opened with one ticket; old owned months remain readable without a ticket. No new past-month teaser is generated on demand, and no future-month previews or year-highlight navigation belong in this release.

### Thai voice authority and copy specification

Use thai-ux-writer in **content + UI** modes for natural Thai editing. The shipped program prompts take precedence over the skill's generic brand defaults. In particular, do not add emojis or an invented “พี่สาว” narrator, and do not assume feelings the reader has not expressed.

Verified authority chain (2026-10-20): `horo-be/src/lib/prompts.ts` composes `SYSTEM_PROMPT` from `prompts/md/system.md` plus `voice.md`; compatibility generation uses the LLM functions in `src/lib/llm.ts` with that system prompt. Structured output has `system-structured.md` plus the same shared voice. Read the applicable chain before implementation; preserve it rather than creating a competing monthly persona.

Adapt editorial behavior from `compatibility-v4-rules.md`, `compatibility-v4-tasks-write.md`, and `compatibility-v4-sections.md`:

- Lead with the actual answer, then the reason and a recognizable everyday situation. Narrate in plain Thai like a thoughtful friend; no mystical roleplay, dramatic prophecy or formal report language.
- Address the reader as คุณ only when needed; never insert their profile name into narrative. Drop repeated pronouns. Do not invent another person's thoughts, a job, relationship status or an emotional confession.
- Tie every paragraph to this profile and the selected month. If changing the person or month leaves the paragraph equally valid, rewrite it. Explain relevant astrology naturally; no raw chart inventory, AI/model terminology or “ตามระบบจีน” narration.
- Give each section its own question and insight. The cover answers what stands out; the detail adds why and a situation; the action adds something the reader can choose to try. Do not repeat the same point with synonyms. One main idea appears at most twice across the report; one astrology term per paragraph is the shared voice ceiling.
- Actions are invitations: ลอง, เลือก, ถ้าพร้อม. No compulsory homework, fear, guaranteed outcomes or generic advice that fits everyone. At most one อาจ per paragraph and one soft particle per sentence; no particles in buttons.
- No emojis, middle-dot separators or dash punctuation in reader-facing prose. Machine keys and ISO dates keep their required format. Do not copy compatibility's partner slots, scores, three-month calendar or future-month recommendations into monthly content.
- Keep summary, explanation and action distinct, as compatibility does. Monthly chapter length follows useful content, not mechanically copied compatibility word quotas. Use short mobile paragraphs and review the full assembled report for repetition.

Copy below is proposed UI text, not a new system prompt. Repeated labels have a recommended choice and an alternative; implement one consistently. Meaning notes determine wording. No raw variable or support code appears alone.

| Placement / meaning | Recommended | Alternative for frequently seen copy | Check |
| --- | --- | --- | --- |
| Full report heading: identify what is sold | ดวงเดือนนี้ฉบับเต็ม | อ่านดวงเดือนนี้แบบละเอียด | Plain subject; T3/T8 avoided |
| Unlock button when a pass exists | ใช้ตั๋ว 1 ใบ เปิดดวงเดือนนี้ | เปิดดวงเดือนนี้ | Action + object; no particles |
| Offer button without a pass | ซื้อตั๋วดวงเดือนในร้าน | ดูตั๋วดวงเดือน | Shop destination is explicit |
| Offer subline | ตั๋วใบละ 149 มู ไม่มีวันหมดอายุ เปิดแล้วอ่านเดือนนั้นได้อีก | — | Pass purchase and use are separate steps |
| Owned report: reread without spending | อ่านอีกครั้ง | อ่านดวงที่เปิดไว้ | Same action in report and history |
| History link: find owned months | ดูเดือนที่ผ่านมา | ดูดวงย้อนหลัง | Short, familiar wording |
| Empty history: no owned report yet | ยังไม่มีดวงเดือนที่เปิดไว้ เลือกอ่านเดือนนี้ได้เลย | — | One explanation and a link to current month |
| Insufficient balance in Shop | มี {balance} มู ขาดอีก {shortfall} มู | — | Values supplied by server; never hardcoded |
| Generation: explain the wait | กำลังเตรียมคำอ่านเดือนนี้ กลับมาอ่านต่อได้ | — | Only use once resume is implemented |
| Failure before pass use: reassure and recover | ยังเปิดดวงไม่ได้ ตั๋วยังอยู่ ลองอีกครั้งนะ | — | Render only when no use committed |
| New month: previous purchase is still available | ดวงเดือนใหม่มาแล้ว เดือนที่เปิดไว้ยังอ่านย้อนหลังได้ | — | No implied renewal or loss of access |

Template rendering checks (Thai names, Latin names and long profile names must **not** enter these lines): “ใช้ตั๋ว 1 ใบ เปิดดวงเดือนมกราคม 2570”, “ใช้ตั๋ว 1 ใบ เปิดดวงเดือนพฤษภาคม 2570”, “ใช้ตั๋ว 1 ใบ เปิดดวงเดือนพฤศจิกายน 2570”. Shop balance cases: “มี 0 มู ขาดอีก 149 มู”, “มี 12 มู ขาดอีก 137 มู”, “มี 148 มู ขาดอีก 1 มู”. Never show a negative shortfall.

Editorial test: review against T1–T14 and the skill's young/adult reader checks. Long explanatory lines are body copy, not single-line buttons. Read monthly samples beside current compatibility samples and reject changes in narrator, factual certainty or pressure. This is a copy specification; application prompts and locale strings are not edited in this planning task.

### Past-month history is part of the purchase

Provide a visible “ดูเดือนที่ผ่านมา” entry from the monthly header and from every opened report. Proposed route: `/dashboard/fortune/monthly/history`; a report deep link carries a stable report ID or explicit `YYYY-MM`, never an implicit current month.

- List saved reports newest first, with Thai month/year and opened/unopened status. Show a year filter once needed; it filters stored reports and must not resemble an annual forecast.
- Opening an old report loads its saved content and birth-data snapshot. Do not regenerate using today's date, replace it with the current month, hide it after rollover, or charge again.
- Persist old free rows at cutover as conversion inputs where they still exist. Unavailable older months get an honest explanation; never fabricate a previously saved history.
- Browser refresh, direct links and returning from checkout preserve the selected month. If a purchase starts before midnight at month end and finishes afterward, fulfil the explicitly confirmed month at the quoted 149 มู once.
- Show loading, empty history and recoverable error states. A refunded/revoked entitlement has a clear status and support action, not a misleading “read” button. Keep failed attempts out of the owned-report list.
- Read access survives a disabled sales flag, logout/login, cache eviction and content-version upgrades. Keep purchased snapshots stable; supported corrections create revisions under the same entitlement.


Accessibility acceptance: retain legible Thai body text and line spacing; left-align paragraphs; minimum 44px touch targets; keyboard-operable tabs/dialogs; visible focus; announcement of loading, success and error; restore focus after sheets; respect reduced motion; sticky controls must not cover the text or mobile safe area. Verify narrow mobile and desktop, both themes, long names and long Thai headings.

## Purchase model and economics

**Selected test model:** buy a ตั๋วดวงเดือน in the Shop for 149 มู, then consume one pass to open one month's persistent report. This follows compatibility's credit model. The pass itself does not expire; the report month does not expire after opening.

Implementation choice: `monthly_pass` / `monthly_pass_1` are Shop catalog rows, and purchase grants `monthly_unlock` feature credit. `featureCredits.consumeWithin` uses one credit for the monthly report ID in the same transaction that persists successfully generated full detail and changes its source from `locked` to `paid`. No direct 149 มู debit occurs at report unlock; the Shop purchase debits มู. The current teaser-first path passed the earlier local database tests; the newer legacy-conversion tests still need a local PostgreSQL run. `compat_unlock` credits cannot open a monthly report.

| Candidate | Usage fit | Existing rail fit | Recurrence | Contribution | Ops | Trust | Scored subtotal |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Shop pass, one per month opened | 2 [A] | 2 [A, existing Shop credit rail] | 1 [A, voluntary repurchase] | Unscored [?] | 1 [A] | 2 [A, explicit pass use] | 8/10 [A] |
| Auto-renewing monthly subscription | 1 [A] | Unscored [?] | 2 [A, contractual] | Unscored [?] | 0 [A, new billing operations] | Unscored [?] | 3/6 [A] |
| Multi-month prepaid bundle | 1 [A] | 2 [A] | 1 [A] | Unscored [?] | 1 [A] | 1 [A, commitment before proof] | 6/10 [A] |

Scores use the skill's qualitative scale and assumptions, not customer evidence; unequal evidence coverage makes totals non-comparable. The unlock is the cheapest useful test and matches the owner's มู requirement. Defer subscriptions and bundles until repeat paid demand is observed.

**Contractual recurring revenue: ฿0 by design.** Monthly repurchase can create repeat sales, but it is not subscription MRR. Report cash top-ups separately from มู spent; do not count both as revenue.

Economics model: `contribution = cash-backed value allocated to consumed มู − allocated gateway fee − generation/retry cost − hosting share − support/refund allowance − applicable tax allocation`. Reward-funded consumption has no immediate cash proceeds; track its service cost separately.

Illustrative lower cash-pack ratio [C]: `999 / 1200 = ฿0.8325 per มู`. Stripe lists a PromptPay fee of **1.65% [A for this account]**; verify actual settlements and any additional fees/taxes before launch ([published rate](https://stripe.com/en-th/pricing), checked 2026-10-20).

| Owner-set price | Allocated cash at that pack ratio [C arithmetic] | After illustrative gateway fee, before all other costs [A] |
| --- | --- | --- |
| 149 มู | ฿124.04 | ฿122.00 |

At the matching ฿149 / 149 มู pack, allocated cash is ฿149 and the same illustrative fee leaves ฿146.54 before other costs. This is not net profit; free rewards and bonus-funded spending change the cash mix.

Cost per report is [?], so net contribution is unscored. Instrument model tokens, retries, generation duration, cache hits and support cost. A positive balance of earned มู is not proof of viable pricing. Reject nonpositive contribution; if measured contribution is below 30% of allocated cash value [A operating threshold], reduce cost or return to the owner with evidence before expanding. Do not silently lower the owner-set 149 มู price. Do not expire existing wallet balances or raise free-reward costs to force payment.

### Market context and validation gaps

Existing product rails: มู balance, PromptPay top-up, Thai mobile web [C]. Actual method mix, willingness to auto-bill, arrival channels and support channel preference are [?]. Show Thai price/receipt, wallet history and a support/refund path [A]. No B2B pricing or tax claims are needed for this consumer plan; verify actual tax allocation with the existing finance setup.

Adjacent scan, 2026-10-20: [myhora](https://myhora.com/common/about-us.aspx) explicitly offers free online readings; [Horoworld](https://www.horoworld.com/) combines public readings and personal consultations; [ดวง Live](https://www.duanglive.com/about-us.php) describes coin payment and refunds for consultation problems. Current paid package prices/rail details for comparable automated monthly reports were not verified [?]. These are alternatives to discuss in interviews, not evidence that our segment uses them or will pay our price. The scan supports testing added personal usefulness rather than charging merely for astrology data [A inference].

## Engine and storage requirements

The target is extraction plus a useful new paid layer. The local implementation now stores a standalone LLM teaser when `monthly_lock` is on, and generates the full chart only after ticket availability is checked. Old free reports convert to the new teaser on access. Premium depth, preview usefulness, content cost and operational recovery still need live review before enabling sales.

1. **Natal facts:** separate a stable BaZi payload keyed by profile birth-data version and calculation version. Keep it free; separate Thai astrology provenance. Changing the month must not regenerate permanent facts.
2. **Monthly facts:** explicitly compute selected-period context and its interaction with the natal chart before generation. Validate the calendar convention, solar-term boundaries and supported birth-time precision against trusted fixtures. A Gregorian month can span solar-term periods; describe the chosen aggregation instead of equating their boundaries.
3. **Narrative layers:** the first monthly entry auto-generates only a structured LLM teaser, with a meaningful personal focus, reason and useful first step. The full detail is a separate LLM generation from the saved teaser, validated monthly facts and immutable input snapshot after ticket availability is checked. Reject absent-hour claims, wrong month, unsupported timing and contradictions between teaser and detail. The LLM explains supplied facts; it must not invent a transit engine.
4. **Owned reports:** use a dedicated report record keyed to owner, stable profile identity and selected `YYYY-MM`; store birth-data snapshot, calculation/content versions, free teaser, nullable premium document, entitlement reference and creation time. Content/model version changes must not create another billable purchase. Corrected paid reports are revisions under the original entitlement. Convert old free rows to the new teaser once; never replace an already paid report.
5. **Atomic fulfilment:** the Shop buys a pass through its existing idempotent catalog purchase, wallet spend and feature-credit grant transaction. On unlock, verify owner, selected month and available ticket, then single-flight generate the full detail outside a database transaction. In one transaction, recheck report state, persist the premium document, consume one `monthly_unlock` credit for that report ID and mark it paid. A generation or persistence failure uses no pass. Concurrent taps and purchase callbacks join or reread the same result; an already-open month causes no model call or ticket use.
6. **Recovery:** persist enough attempt/job state to resume after a closed tab or worker crash. Handle duplicate webhooks and confirmation retries idempotently. A failed detail generation cannot consume a pass; a successful top-up and pass purchase remain available even if report generation later fails. Top-up, pass purchase, detail generation and pass use remain distinct records. Record teaser and detail model cost separately.
7. **Access:** strip paid content server-side from locked responses. Owner authorization applies to report, history and download/share endpoints. Cache keys include owner/profile/month/access scope; never cache one user's unlocked payload for another.
8. **Migration:** snapshot existing free readings before changing expiration behavior so they can be converted on access. Keep the existing free endpoint working during extraction; add separate natal/monthly contracts. Purchased reports must never pass through the old month-rollover deletion path. Remove `recommendations.monthlyHighlights` future-month generation instructions from the new monthly contract and renderer, rather than hiding an annual forecast only with CSS. Validate every period-bearing field against the purchased month. Turning the sales flag off must preserve owned reading access.

Do not market the premium as precise timing until the monthly engine quality gate passes. If the engine is not ready, launch only the free BaZi extraction and the uncharged concept test.

## Validation, priority and rollout

Problem hypothesis [A]: returning readers want a clearer answer about their own month than the current mixed chart provides. Priority: extract free BaZi for clarity, prove premium differentiation, then add paid fulfilment. Experience hypothesis [A]: useful free answer → understandable additional value → predictable มู spend → saved report → voluntary return next month.

User-love scorecard: compatibility and the proposed monthly depth are both **unscored** for retention lift, repeat use, unprompted mentions, removal disappointment and willingness to pay. Code existence is not evidence of love. Obtain current events and interviews before calling either “loved” or “used”.

Priority formula from product-owner: `reach × pain × confidence ÷ effort`. Reach and pain are [?], so arithmetic and numeric ranking are deliberately unscored. The proposed sequence follows dependency and reversibility; it is not a fabricated ROI ranking.

### Validation before billing

- Interview five existing monthly readers [A research design], including cash payers and reward-only users. Ask what they read last month, what question remained unanswered, what they did next, what they already pay for, and how they paid. Show free and premium sample content only after hearing their problem.
- Require at least three of five to describe a shared unmet need with an existing paid alternative or workaround [A gate]. Record counts, exact language, and contrary feedback. If not, narrow the segment or rework the offer.
- Test a clearly labelled upcoming feature with the owner-set 149 มู price; end at “ลงชื่อสนใจ ยังไม่หักมู”. No fake payment, no pretending a report is ready. Capture exact price exposure and intent.
- Run for fourteen days [A] or the planned sample. Under one hundred exposed activated users, report counts only. With one hundred to three hundred, five paid pilot purchases or 3% expressed intent is directional evidence [A gates], not proof of scale. Fewer than five conversions: report counts, not a success-rate headline.
- Validate the offer at 149 มู; there is no approved price experiment. At low traffic, report counts and interview evidence rather than claiming a stable conversion rate. For sufficient samples, report a suitable binomial interval. A price change requires a new owner decision.
- A paid pilot requires reviewed deliverable content, measured positive contribution, real fulfilment and receipts. Intent-only success justifies a pilot, not a full monetization rollout. Rework once after failure; stop this offer for this segment after a second failed test [A rule].

### Delivery increments and acceptance

| Increment | Scope / likely files | Done when |
| --- | --- | --- |
| Free content extraction | `horo-fe/src/app/dashboard/fortune/monthly/page.tsx`, new `src/app/dashboard/bazi/page.tsx`, chart components, relevant navigation; backend fortune route and shared astrology types | BaZi remains free; old saved monthly rows convert to new teasers; monthly preview/full access is explicit; no invented hour; no mislabeled Thai astrology; stable facts do not change on month rollover. |
| Premium content prototype | `horo-be/lib/astrology/`, `src/lib/prompts/`, sample fixtures | Same profile across different months produces supported differences; value versus the old free report passes review; tone matches compatibility; no annual or future-month highlights, invented feelings or unsupported precision. |
| Paid pilot infrastructure | Backend schema/migration, wallet/catalog/shared types, new monthly report service; frontend wallet flow and report history | Double tap, retry, duplicate webhook, crash, insufficient balance, failed save and failed generation cannot double-charge or lose a delivered report. |
| Rollout and observation | New monthly-sales flag, analytics, admin support visibility | Sales can stop independently of read access; receipts/refunds work; cash-funded and reward-funded use are distinguished; thresholds below are reviewed. |

Path boundaries: `horo-be` owns calculations, persistence, auth and payments; `horo-fe` owns customer UI; `horo-admin` owns report-support metrics and the monthly, BaZi and compatibility analytics views specified below. Generated frontend shared types follow the backend source. Do not edit the `*-wallpaper` worktrees for this feature. No unrelated auth, reward-economy, compatibility-price or visual-system redesign.

Required verification when implemented: focused calculation fixtures near date boundaries and unknown birth hour; authorization/cache isolation; wallet transaction and idempotency integration tests; history/rollover/profile-correction tests, including month-end checkout and current-month-only output validation; mobile/desktop keyboard and screen-reader checks; backend/frontend required type checks and builds. The local slices ran focused BaZi, chart-period, analytics, navigation, guidance and history-label tests plus backend/frontend type checks and a frontend production build. A disposable PostgreSQL run verified migration 0015's backfill and monthly purchase/unlock/authorization; real payment return and production migration remain required before launch.

## In-house analytics: monthly, BaZi and compatibility

Required delivery scope, not a later integration. Extend the existing first-party pipeline and `horo-admin`; no third-party tracker is needed. Instrumentation and admin views must ship with the features so the owner can see discovery, paid conversion, repeat use, history use and failure causes.

### Existing foundation, verified 2026-10-20

- `horo-fe/src/lib/analytics.ts`: authenticated `trackEvent` / `useTrackEvent` posts to `/api/analytics/event`, with client deduplication and nonblocking error handling.
- `horo-be/lib/shared/types/analytics.ts`: event vocabulary and dedup rules; `src/routes/analytics.ts` separately validates allowed bodies; `src/lib/analytics-events.ts` maps events into `lib/db/schema/analytics.ts` / `product_events`. Update all layers together and regenerate frontend shared types.
- `horo-be/src/lib/server-events.ts`: records committed top-ups, catalog purchases, ticket consumption, fulfilment failures and refunds. Monetary truth comes from orders, purchases and ledger records, not event counts.
- `horo-admin/src/lib/stats/engagement.ts`, `compatibility-analytics.ts`, and `src/app/(dashboard)/engagement/page.tsx`: existing usage reporting. Compatibility lifecycle counts are explicitly independent event totals, not an ordered session funnel. Preserve them as historical activity metrics.
- Compatibility already emits `surface_viewed`, `relationship_selected`, `calculation_started`, `calculation_failed`, `compatibility_checked`, `result_opened`, `guidance_opened` and `compatibility_share_initiated`. `unlock_attempts` already records unlock outcomes, duration and token use. Reuse these sources rather than creating a second set of successful-purchase counters.

### Event contract

The earlier tracking list below is implemented through this contract. Names in the “proposed” rows are new vocabulary, not already-supported API calls. Server derives identity from the session; reject arbitrary names and extra fields. Generic surface events measure daily reach; content-open events measure a particular reading. They must never be summed as if they were the same metric.

| Feature / events | Exact trigger and required dimensions | Source and dedup |
| --- | --- | --- |
| Monthly `surface_viewed` | New surface `monthly`; route successfully renders. Preserve old `fortune` rows under a visible legacy label. | Client; once per user/surface/Bangkok day. Do not dual-emit old and new surface events. |
| Proposed `monthly_free_read` | Selected-month preview successfully renders, not just route mount. | Client; once per user/month/report revision/day. Label “preview opened”, not “finished reading”. |
| Proposed `monthly_detail_offer_view` | Price and unlock action are at least half visible for one continuous second while the tab is visible [A measurement convention]. Include month, offer ID/version and displayed 149 มู. | Client; once per user/month/offer version/day. |
| Proposed `monthly_detail_intent` | User taps the paid offer; before the pilot is live, this is interest only. Include flow ID and `stage=concept|live`. | Client; action ID dedup; never count as payment. |
| Proposed server-side monthly unlock attempts and failures | Client currently emits `monthly_unlock_requested` and bounded `monthly_unlock_failed`; server accepts an explicit `yearMonth` and uses a pass atomically. Add durable server attempts with attempt ID, report month, bounded failure class and retry lineage. | Server target: once per attempt/event globally. Existing top-up events remain separate. Client events alone cannot prove purchase or use. |
| Proposed `monthly_detail_unlocked`, `monthly_detail_refunded` | Entitlement/report/spend commit, or an actual committed reversal. Include entitlement, purchase and reversal references as appropriate. | Server; dedup by entitlement or reversal ID globally. An already-owned read is not another unlock. |
| Proposed `monthly_detail_read` | Owned report content renders. Include report ID/revision, selected month and origin `fresh|history|direct`. | Client; once per user/report/revision/day/origin. Count readers separately from paid purchases. |
| Proposed `monthly_history_opened` | History successfully renders, including empty state; include `empty|populated`. | Client; once per user/day/state. History click alone is not a successful reread. |
| BaZi `surface_viewed`, proposed `bazi_open` | New surface `bazi`; `bazi_open` follows successful free content render. | Client; daily reach and daily successful content opens reported separately. |
| BaZi `tab_opened`, `category_opened`, `cta_clicked` extensions | Allowlisted BaZi section/disclosure keys; outgoing `bazi_monthly`, `monthly_bazi`, `bazi_compatibility` CTAs. | Client; once per user/section or CTA/day. No chart data in payload. |
| Existing compatibility lifecycle events | Retain names and relationship-type dimensions. Add flow/attempt/report correlation to new records; `result_opened` retains `fresh|cache|history` origin. | Existing historical dedup semantics retained; new action IDs suppress transport retries without suppressing distinct calculations. |
| Proposed `compatibility_offer_viewed`, `compatibility_unlock_requested` | First visible locked offer with actual offer terms; server unlock attempt respectively. Capture report ID, flow/attempt ID, relationship type, quoted offer and entitlement source. | Impression per user/report/offer/day; attempt globally by attempt ID. |
| Compatibility committed unlock/failure | Use `unlock_attempts` joined to ticket use, catalog purchase and ledger; existing `ticket_consumed` is an action signal, not proof of fresh cash. | Server/database authority. `already_open` is excluded from new unlocks; preserve `unlocked|failed|refused` outcomes. |
| Compatibility reread, guidance, share | Extend existing `result_opened` / `guidance_opened` / share events with report context. History origin identifies rereads. | Existing events; do not duplicate them with monthly events. A share channel selection/native handoff does not prove delivery to another person. |

Common new fields where applicable: schema version, stable event/action ID, flow ID, attempt ID, report ID, entitlement/purchase/order ID, selected month, offer version, price in มู, origin and bounded outcome/failure class. Derive funding classification server-side. Use nullable fields with event-specific required validation; verify report ownership before accepting its reference.

The current `product_events` columns do **not** store all these dimensions. Plan an additive migration with typed correlation columns and a bounded validated properties payload, plus indexes for date/feature/report and immutable event IDs. Do not cram JSON or concatenated identifiers into `detail`. Legacy rows remain readable with missing dimensions marked “ก่อนเริ่มเก็บข้อมูลนี้”; they cannot be retroactively converted into a linked funnel.

### Reliable collection and attribution

- Existing server event dedup includes Bangkok day, so the same transaction replayed on another day can produce another event row. For new commerce events, enforce transaction-global idempotency; aggregate existing commerce from distinct immutable business IDs and authoritative tables, never raw event row count.
- Financial fulfilment must survive analytics failure. Commit a durable analytics outbox entry with the business transaction, then publish/retry asynchronously; alternatively reconcile from authoritative records with a documented watermark. A lost post-commit event cannot turn a successful purchase into an error or cause another charge.
- Preserve flow/selected-month context through top-up and return navigation. Attribute a conversion to a preceding eligible offer exposure for the same user, feature and report/month within seven days [A reporting window]. Report unattributed conversions separately. Historical events without correlation stay activity totals.
- Top-up cash is wallet revenue, not automatically feature revenue. Show explicitly linked checkout cash separately from allocated value of consumed มู, existing balance use and earned/bonus funding. Where wallet provenance cannot support exact allocation, label the share unknown or use a disclosed estimate; never invent a precise paid/reward split.
- Use Bangkok dates for all reporting windows, with stored timestamps for ordering. Distinguish purchase month, report month and activity date. A November visit to an October report is an October-report reread occurring in November, not a November purchase.
- No birth dates/times, names, partner details, generated prose or unrestricted error messages in analytics. Aggregate views are the default. Existing admin-only individual activity remains access-controlled; do not add exports of personal reading contents. Analytics is best-effort in the browser and must not block reading or purchase.

### Admin feature views

Extend the existing Engagement area with **ดวงเดือนนี้ / พื้นดวง / ดวงคู่** views and shared date/cohort filters. Keep labels plain Thai and display metric definitions beside ambiguous figures.

| View | Required panels |
| --- | --- |
| ดวงเดือนนี้ | Preview readers → price exposed → unlock requested → unlock succeeded → full report opened. Show counts and eligible conversion rates, 149 มู spend, authoritative refunds, generation failure classes/latency/cost, history visitors/rereaders, and next-month repurchase. |
| พื้นดวง | Unique visitors, successful reads, most-opened sections, return readers, and navigation to monthly/compatibility. Free BaZi has no invented paid-conversion denominator. |
| ดวงคู่ | Existing activity and relationship breakdown plus correlated calculation and paid-unlock funnels. Show locked-offer reach, purchase/ticket-source split, successful unlocks, refusals/failures, already-open accesses, history rereads, guidance opens and share intents. |
| Shared commercial summary | Cash top-ups, มู spent, cash-backed allocated consumption where measurable, reward/free-ticket use, refunds and measured service costs as separate columns. Compare feature performance without pretending 149 มู monthly equals a compatibility ticket's cash price. |

All panels distinguish unique users from attempts and reports; denominators and date eligibility are explicit. Reading opens are not comprehension/completion. Do not call observational revenue movement “incremental lift” without an appropriate experiment. Next-month repurchase counts month M buyers with an opportunity to buy M+1, not all historical buyers. Compatibility repeat use counts new comparisons separately from rereading an owned report.

Add “ยังไม่มีข้อมูล” for an instrumented empty period and “ยังไม่ได้เริ่มเก็บข้อมูล” for unavailable instrumentation; neither becomes a false zero conversion. Show data-through time and last reconciliation status. Use feature/relationship/source filters only when those dimensions are actually present; include an unknown bucket.

### Analytics delivery gate

Own: backend analytics schema, vocabulary, runtime validation, mapper, event publisher/outbox and relevant feature emitters; frontend tracking calls; admin Engagement queries/models/UI. Reuse the existing test files for analytics and compatibility reporting; add focused monthly/BaZi fixtures. This expands the earlier admin scope to include all three feature views.

Acceptance scenarios before enabling monthly sales:

1. A known test journey reconciles from preview → 149 มู confirmation → one committed spend → one owned report → read → next-day history reread. The reread produces no purchase or revenue.
2. Duplicate clicks, webhook retries across Bangkok midnight and outbox replay count the business transaction once. Browser rerenders do not inflate price exposure; distinct compatibility calculations remain distinct.
3. Failed generation, insufficient balance, refund, free compatibility ticket and existing paid-ticket use produce the correct separate totals. Analytics downtime does not break delivery and reconciliation restores missing records.
4. Month-end checkout retains the confirmed month; history filters and next-month repurchase use the correct report month and eligible cohort.
5. Locked/client requests cannot forge a successful purchase, another user's report reference or raw prose in analytics. Legacy `fortune` and compatibility rows remain readable without being represented as newly correlated funnels.
6. Admin aggregates reconcile with orders, wallet ledger, entitlements and `unlock_attempts` over the same window; no join duplicates multiply amounts. Show all three feature views in empty, partial/legacy and populated states.


### Tracking and decision dates

All baselines below are [?]; establish them from the in-house instrumentation contract above and approved historical exports. Proposed monthly/BaZi events: `monthly_free_read`, `bazi_open`, `monthly_detail_offer_view`, `monthly_detail_intent`, `monthly_detail_unlock_requested`, `monthly_detail_unlocked`, `monthly_detail_failed`, `monthly_detail_read`, `monthly_detail_refunded`. Capture selected month, price, offer version, outcome and entitlement/order references. Keep birth data and reading text out of analytics.

| Metric | Definition / target [A] | Review and rule |
| --- | --- | --- |
| Offer conversion | Unique successful unlockers / unique eligible users who saw the actual price; separate intent from purchases | Fourteen days after pilot starts; apply sample rules above. Weak intent → rework value before lowering price. |
| Cash associated with the feature | Paid top-up receipts explicitly linked to the feature flow, separately from มู consumption and reward-only unlocks; observational, not causal lift | Weekly in first month; reward-only activity is retention evidence, not revenue validation. |
| Contribution | Allocated cash-backed value minus measured costs, including failed generations | Before paid launch and weekly; nonpositive → stop expansion. |
| Failure/refund | Failed unlock attempts / attempts; refunded entitlements / successful unlocks | Weekly; any duplicate charge or missing paid report → pause sales immediately and reconcile. Target zero such incidents. |
| Content usefulness | Readers who can name a specific new insight or action / interviewed premium readers | Pilot review; target at least three of five [A]. Repetition of free content → revise before scaling. |
| Next-month repurchase | Buyers of month M who buy M+1 / buyers eligible after M+1 becomes available | Review after the next month; provisional target 20% [A], interpret only with adequate cohort size. Low repeat → investigate value, not auto-renewal. |
| Retention | W1 active days 7–13; W4 active days 28–34 after signup, eligible cohorts; proposed active event `monthly_free_read` or `bazi_open` or a reading-open event | Compare payer/free and whole/activated cohorts separately; descriptive, not causal. Paid users retaining worse prompts content review. |
| Existing free experience | Monthly free reading completion/return versus prelaunch cohort | Any clear deterioration triggers a navigation/paywall placement review. |

First planning review: **2026-11-03**, to review interviews and samples, not assumed launch results. Commercial review dates are relative to the actual pilot start; if nothing has launched by that date, record “not started”. Preserve the existing wallpaper review on 2026-11-10.

## Pre-mortem and unresolved choices

- **Nobody buys:** the current free version already answers the need, or the premium is longer but not more useful. Response: sample comparison and a no-charge intent test before payment engineering.
- **Revenue does not grow:** check-in มู funds most unlocks, while readers do not see enough additional value to spend 149 มู. Response: segment funding, show the actual cash requirement, and judge contribution and associated cash receipts separately.
- **Existing users feel charged for a free feature:** an old full monthly report becomes a new teaser requiring a ticket for detail. This is an explicit owner decision. Announce the change before the first paid confirmation, keep BaZi free, and verify the new teaser gives standalone value rather than merely hiding the old reading.
- **Support doubles:** month ownership, missing birth time, top-up versus unlock, or corrected profiles are unclear. Response: exact month label, input snapshot, receipt, idempotent retry and explicit correction policy.
- **Monthly content feels arbitrary:** permanent scores were reused or the prompt invented timing. Response: validated period inputs are a paid-launch prerequisite.

Open for review: whether new plain-language free BaZi synthesis ships with extraction or follows it; final premium examples reviewed against the current compatibility prompt chain; proposed correction allowance; actual cost and funding attribution; pilot start/owner. Recommended defaults are recorded above so planning can proceed, but none is a measured customer preference.

Next action: review a freshly generated teaser and ticket-opened detail beside compatibility with target readers, measure both model calls, finish linked analytics/recovery and schedule the ordered production migration before deploying the backend. The monthly flag stays off until those gates pass.

Audit findings (2026-10-21): the response fails closed if its entitlement row is missing, and an unopened report remains reachable from history after month rollover. The checkout stores a validated monthly return path locally for QR recovery; the offer waits for the pass balance to load and will not invite a second purchase immediately after a completed purchase fails to unlock. Monthly score labels say they are natal tendencies, not scores for the selected month. The corrected monthly route integration passed 4/4 against disposable PostgreSQL, including automatic partial generation, cache reuse, ticket-only detail, failure without pass use and ownership isolation. The Shop suite passed 25/25, including a new guard that refuses monthly offers other than one ticket for 149 มู. Backend/frontend/admin type checks, focused chart and frontend tests, lint (four pre-existing warnings) and the frontend production build passed. Disposable PostgreSQL previously verified both an empty migration and a synthetic pre-existing free report backfill. Remaining release blockers are production migration scheduling, new-reader free BaZi parity, live premium examples reviewed against compatibility, a measured preview-quality/cost check, correlated first-party funnels and refund/reconciliation behavior. **Deployment order is a hard blocker:** `horo-be/Dockerfile` runs `drizzle-kit push` in the background; that does not execute migration 0015's data backfill and can race the first API request. Apply and verify the ordered migration before deploying this backend code, following `horo-be/scripts/ensure-migrations.md`. Do not switch on `monthly_lock` until those are resolved.

Audit update (2026-10-22): 33 Shop/monthly integration tests passed against disposable PostgreSQL. They now cover exactly one 149 มู debit per idempotent purchase, one ticket use and one saved full report under simultaneous unlock requests, failure without ticket use, owner-only history, rollover to the next month while the previous paid report remains readable, conversion of legacy free reports to the new teaser, and refusal of a refund after a purchased ticket was used. Backend/frontend type checks and the focused Shop UI tests also passed. These are local invariants, not evidence of production reconciliation or reader demand. The monthly sales flag remains off pending the production migration, real generated-content/cost review, and linked funnel verification.

Production preflight (2026-10-22, read-only): `monthly_reports` is absent while `chart_narratives` has 402 rows. The production `drizzle.__drizzle_migrations` tracker has 13 records but does not match the 16 checked-in journal entries, including migration 0015; `bun scripts/check-migrations.js` exits nonzero. **Do not run `db:migrate` blindly or push the backend/other dependent apps to auto-deploy branches.** First reconcile the tracker against actual schema and prior data effects, take a database backup, apply and verify the 0015 backfill in order, then re-run the production preflight before deploying code. Release-candidate commits were pushed to `codex/monthly-fortune` in the parent, backend, frontend and admin repositories; production branches and the sales flag were not changed.

Additional release audit (2026-10-22): Migration 0013's provider split has not run in production. Read-only counts show 26 users with both Google and X linked, one active session among them, seven linked profiles with saved chart narratives, and no tied earliest-provider timestamps. Applying 0013 would split those accounts, keep existing profile/history with the earliest provider, and revoke affected sessions. The migration fixtures pass, but this is a user-visible identity/data-ownership change. A verified backup, tracker reconciliation, migration rehearsal against a restored production snapshot, and an account-impact review are required before a live migration. Migration 0014's schema is present but its tracker row is absent, so replaying the journal as-is could collide with existing tables.

Real-model content gate (2026-10-22): Synthetic-profile local runs used the configured `deepseek-chat` API and a disposable database. One successful run used one teaser call (3,525 prompt / 1,151 completion tokens) and one full call (7,011 prompt / 4,334 completion tokens); other runs needed retries or failed the teaser's overly narrow length/timing checks. The teaser limits were made tolerant of a full useful overview and six longer hooks without rejecting ordinary weekly advice, and the prompt now asks more directly for conditional, practical guidance. **Do not interpret schema-valid text as paid-quality proof.** In human review, paid chapters often paraphrased the free hooks, one chapter contradicted the computed month element, and some samples invented health symptoms or other people's intentions. An experimental second model pass and a trial with `deepseek-v4-pro` did not resolve this consistently, so neither was retained in the release candidate. The provider's [current pricing table](https://api-docs.deepseek.com/quick_start/pricing/) does not list the deployed `deepseek-chat` alias; token counts alone are not a verified unit-cost calculation. Keep `monthly_lock` off until a dedicated monthly full-reading contract passes multiple birth profiles, matches the saved teaser and computed elements, adds useful detail in all six areas, and has measured delivered cost and latency. No production wallet or ticket was touched by these synthetic runs.

Pricing decision (2026-10-22): keep the one nonexpiring ticket at 149 มู for the first measured pilot. Do not add a predictable second-half or last-week 50%-off offer yet. Half price would be about 75 มู per ticket, while the current generic ticket can be saved for any later month; this creates a repeatable way to buy the same entitlement cheaply. A true next-month-only offer would require a separate month-bound entitlement and explicit eligibility/expiry rules. Review cash-funded conversion, next-month repurchase, contribution and feedback after the pilot; if the regular-price value is established but repurchase is weak, test a bounded next-month reminder against a separately approved, one-per-reader month-bound offer. Do not treat this planning option as an approved Shop price or sales promise.

## Documentation health

FRESH before → after (2026-10-21 implementation update): **F2→3 · R1→3 · E2→2 · S3→3 · H2→2 = 10/15 (B) → 13/15 (A)**. Named edits: F gained a one-line `docs/README.md` index entry; R replaced stale full-before-ticket claims with spot-checked teaser-first code and current test results, and marked remaining launch gates. E, S and H are unchanged: the plan stays long, and production/quality evidence and final operational ownership remain open.

FRESH before → after (2026-10-22 legacy conversion decision and release audit): **F3→3 · R1→2 · E2→2 · S2→2 · H2→2 = 10/15 (B) → 11/15 (B)**. R improved because the legacy-access policy, history status, migration purpose, outdated reveal-only test claim and release risk now match the owner’s teaser-and-ticket decision and the local routes. At that review the new database integration tests had not run against local PostgreSQL and production behavior had not been checked. F remains indexed; E remains bulky despite the summary; S remains a combined plan/status document; H still has open rollout owners and gates.

FRESH before → after (2026-10-22 money/history verification and pricing decision): **F3→3 · R2→3 · E2→2 · S2→2 · H2→2 = 11/15 (B) → 12/15 (B)**. R gains the named PostgreSQL purchase/unlock/history/refund tests and clearly distinguishes local passes from production evidence. E and S remain at 2 because this canonical plan is lengthy and mixes durable decisions with status. H remains at 2 because migration and live content/cost/analytics gates remain open.

FRESH before → after (2026-10-22 production preflight): **F3→3 · R3→3 · E2→2 · S2→2 · H2→2 = 12/15 (B) → 12/15 (B)**. Named edit: the release section now records the actual production table absence, 402-row source size and tracker mismatch, with a no-blind-migration gate. The score does not rise because the mismatch still needs a verified repair and live content/cost evidence remains open.

FRESH before → after (2026-10-22 real-model and identity audit): **F3→3 · R3→3 · E2→2 · S2→2 · H2→2 = 12/15 (B) → 12/15 (B)**. Named edits: the release section now names the 26-account identity impact and 0014 tracker drift, records measured model tokens and observed content failures, and keeps the monthly sales flag behind explicit content and migration gates. The score stays B because these findings expose unresolved production and reader-quality work rather than close it.

- F2: descriptive filename and headings; no index entry added because the docs index already has unrelated local edits.
- R3: dated implementation status, owner correction recorded, code claims sampled against named sources, and remaining work explicitly separated from locally built behavior.
- E2: detailed but independently retrievable sections; pricing/validation detail makes it longer than a lean implementation brief.
- S3: one canonical feature plan; references existing product, design and wallet authorities instead of replacing them.
- H2: paths, scope, failure states and acceptance gates are concrete; engine fixtures, cost measurements, sample content and delivery ownership remain unresolved before implementation.

FRESH before → after (2026-10-23 orchestrated integration and pilot): **F3→3 · R3→3 · E2→2 · S2→2 · H2→3 = 12/15 (B) → 13/15 (A)**. Named edits: the new implementation-status block records verdicts with commit ids, measured tokens and latency, the local pilot evidence, and the rehearsed migration with its sequence hazard; H rises because the remaining gates are now owner decisions with prepared scripts rather than unfinished work. E and S stay at 2: the plan is long and still mixes decisions with status.
