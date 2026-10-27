# Plan: reveal card lines (LLM) and reveal analytics, for horo-be, horo-fe and horo-admin

Planner: Opus (read-only). Implementer: Sonnet, one work package (WP) at a time. Auditor: Opus.
Monorepo root: /Users/purin/dev/horo. Every path below is under it.

Sources read for this plan:
- Both decision docs: 2026-10-27-feature-card-lines.md, and 2026-10-26-feature-card-reveal.md (marked superseded, but it is still the only definition of the four events).
- Memory notes: dev testing flow, deploy checks, voice, prod migration state.
- Both CLAUDE.md files.
- horo-be:
  - the monthly generation, validators, repair specs and regeneration;
  - `src/lib/llm.ts` and `src/lib/llm-usage.ts`;
  - the compatibility unlock pipeline;
  - the analytics types, event mapper and route;
  - the feature flags;
  - the schema;
  - `scripts/monthly-sample.ts`.
- horo-fe: the reveal builders and components, the page mounts, the analytics hook, DESIGN.md.
- horo-admin: BeliefsCard and the stats modules.

---

## 1. Goal and non-goals

**Goal A, card lines.** When a reader unlocks a monthly report or a ดวงคู่ result, the server writes 3 reveal cards from the saved unlocked report. It uses one small background model call that never blocks or fails the unlock.

Each card has:
- a two-line fortune verse (a style only);
- one plain line of meaning.

The three cards per feature:

| Feature | Card 1 | Card 2 | Card 3 |
| --- | --- | --- | --- |
| Monthly | `theme`: the month's theme | `strongest`: the strongest area | `caution`: one thing to be careful about |
| ดวงคู่ | `pull`: what pulls you together | `gentle`: what to handle gently | `next`: one next step |

How the cards are assembled:
- **Code** decides titles, art and which area each card is about.
- **The model** writes only the verse lines and the meaning.
- When lines are missing, invalid or late, the reveal silently uses today's summary-derived cards (`buildMonthlyRevealCards`, `buildCompatibilityRevealCards`).

**Goal B, reveal analytics.**
- Four client events, aggregate per Bangkok day: `reveal_shown`, `reveal_started`, `reveal_card_opened {index}`, `reveal_completed {skipped}`.
- They cover features `monthly` and `compatibility`.
- `reveal_started` also carries which deck source was used.
- A horo-admin funnel card shows:
  - shown → started → card 1..n → reached last → completed;
  - the skip rate;
  - the card-lines fallback rate;
  - the server-side generation status and cost.

Targets:

| Metric | Target |
| --- | --- |
| Completion (reached last card ÷ started) | 70% or more |
| Skip rate | under 30% |
| Fallback rate | under 5% |
| Cost per unlock | about ฿0.02 to 0.05 |
| Added unlock latency | 0 s |

**Non-goals:**
- No เซียมซี feature: no numbered lots, no draws, no randomness.
- No scratch-for-reward work.
- No change to the report prompts, report validators or report payloads.
- No re-generation on read.
- No per-person analytics or admin views of individuals.
- No change to the flip or swipe rework itself.
- No new lines for reports that were regenerated or unlocked before release; they fall back.

---

## 2. Architecture and exact data flow

### 2.1 Key decisions

1. **"From the saved report" plus "never blocking" means the call starts right after the paid save commits.** It runs in the background, from the exact JSON string that was saved.
   - It cannot run truly in parallel with the detail generation, because its input is that detail.
   - The unlock HTTP response is not delayed.
   - The reveal intro (pick 3 cards, or the deck intro after the rework) is the natural wait. The frontend fetches the lines when the reveal mounts, polls while they are pending, and freezes the deck when the cards are dealt.
   - Late lines mean the fallback deck. Nothing swaps mid-deck.
   - The sampling (section 8) measures lines latency against time-to-deck. That measurement decides whether the 5% target is reachable (owner question 1).

2. **Storage is a side table, not a column on the report rows.** This is the "safest equivalent" the brief allows.
   - Railway runs `bunx drizzle-kit push &` in parallel with the server, and production has schema drift, so push can stall on a prompt and apply nothing.
   - Drizzle's `db.select().from(monthlyReports)` / `.from(compatibility)` names every schema column. A new column that push has not yet applied would make the unlock, history, compat GET and the public share route return 500. That is an outage, not a fallback.
   - With a side table, a lagging push only makes the new feature fall back.
   - The side table also avoids stale lines in the compat Redis row cache (`compatCacheKey`, 24 h), and it holds cost and status for the admin.

3. **The frontend reads lines from a dedicated, owner-only endpoint, never inside a report payload.**
   - Report responses stay byte-for-byte as today, so the leak surface does not grow.
   - The endpoint can answer `pending` while the call is still running.

4. **Kill switch: a DB feature flag `reveal_card_lines`.** It has no parent, is off until the admin turns it on, and is listed automatically in horo-admin flags. It gates generation only; the read endpoint always answers. The decision doc's "above 10%: drop the call" rule becomes one flag flip.

5. **Lines are tied to the exact saved report.**
   - Each lines row stores `source_hash` = sha256 of the exact stored text (`monthly_reports.structured_reading` or `compatibility.analysis`).
   - Reads compare it with the current row. A mismatch answers `none`, which covers owner regeneration, legacy conversion and any rewrite.
   - The result write is conditional on the same hash, so a slow call can never land on a newer report.

### 2.2 New and changed files (horo-be)

| File | What | Pure? |
| --- | --- | --- |
| `/Users/purin/dev/horo/horo-be/lib/db/schema/reveal.ts` (new; export from `lib/db/schema/index.ts`) | table `reveal_card_lines` (section 4) | n/a |
| `/Users/purin/dev/horo/horo-be/lib/shared/types/reveal.ts` (new; export from `lib/shared/index.ts`) | `REVEAL_FEATURES`, slot lists, `RevealCardLine`, `RevealCardLinesResponse`, `REVEAL_CARD_SOURCES` | yes |
| `/Users/purin/dev/horo/horo-be/src/systems/reveal/card-lines-digest.ts` (new) | `monthlyCardDigest(report: StructuredChartResponse, readerName)` and `compatibilityCardDigest(content: CompatibilityV4Content, names, relationshipType)`. Each returns a `CardDigest` with prompt facts, slot bindings, allowed areas, elements and names to mask. Returns `null` when the report shape cannot carry lines. | yes |
| `/Users/purin/dev/horo/horo-be/src/systems/reveal/card-lines-validate.ts` (new) | `CardLinesSchema` (zod), `checkCardLines(raw, digest)` → `MonthlyCheck<CardLines>`, `cardLinesRepairSpec(digest)` → `FieldRepairSpec<CardLines>` | yes |
| `/Users/purin/dev/horo/horo-be/src/lib/prompts/md/card-lines.md` (new) plus `buildCardLinesPrompt(digest)` and `CARD_LINES_SYSTEM_PROMPT` in `/Users/purin/dev/horo/horo-be/src/lib/prompts.ts` | the prompt (section 3) | yes |
| `/Users/purin/dev/horo/horo-be/src/systems/reveal/card-lines.ts` (new) | `generateCardLines(digest, opts)`: `generateWithFieldRepair` with label `Card lines`; returns `{ value, calls, rounds, leftover, prompt }`; no DB | no DB |
| `/Users/purin/dev/horo/horo-be/src/systems/reveal/card-lines-store.ts` (new) | `startRevealCardLines(input)`, `runCardLinesJob` (internal), `readRevealCardLines(feature, reportId, currentText, digest)` | DB |
| `/Users/purin/dev/horo/horo-be/src/systems/reveal/routes.ts` (new; mount next to `fortuneRoutes` and `compatibilityRoutes` where `src/index.ts` mounts them) | `GET /api/fortune/monthly/card-lines/:yearMonth`, `GET /api/fortune/compatibility/:id/card-lines` | DB |
| `/Users/purin/dev/horo/horo-be/src/systems/fortune/routes.ts` | in `POST /monthly/unlock`: build `const detailJson = JSON.stringify(detail)` once, use it in the update, and after `attempt.record({ outcome: 'saved' … })` call `await startRevealCardLines(...)` only when `outcome.state === 'opened'` | |
| `/Users/purin/dev/horo/horo-be/src/systems/compatibility/reading.ts` | `unlockReading` gains an optional arg `cardLines?: typeof startRevealCardLines` (default the real one); after `saved.ok`, call it with `saved.row.analysis`. This covers the route and the paid one-flow order path (`order-fulfilment.ts` → `unlockForUser`). | |
| `/Users/purin/dev/horo/horo-be/src/lib/llm.ts` | `generateWithFieldRepair` options gain `maxRepairRounds?: number` (default `MAX_REPAIR_ROUNDS`, so behaviour is unchanged when absent). Lines use 1. | |
| `/Users/purin/dev/horo/horo-be/src/lib/feature-flags.ts` | add the `reveal_card_lines` flag (label and description in Thai; off by default) | |
| `/Users/purin/dev/horo/horo-be/lib/shared/types/analytics.ts`, `src/lib/analytics-events.ts`, `src/routes/analytics.ts` | the four events (section 6) | |
| `/Users/purin/dev/horo/horo-be/scripts/card-lines-sample.ts` (new) | the sampling harness (section 8) | no DB |

### 2.3 Monthly flow

1. `POST /api/fortune/monthly/unlock` → single flight `monthly_detail` → `generateMonthlyDetail` → `detailJson = JSON.stringify(detail)`.
2. A transaction takes the advisory lock, consumes the ticket, and runs `update monthly_reports set structured_reading = detailJson, source = 'paid'`.
3. After commit: `attempt.record({ outcome: 'saved' })`.
4. Then `await startRevealCardLines({ feature: 'monthly', userId, reportId: current.id, savedText: detailJson })`.
5. Then the flight returns `{ state: 'opened', used }`. The response is unchanged.

### 2.4 Compatibility flow

1. `unlockReading` → flight run → `generateCompatibilityV4Detail` → `saveDetailPaid(id, JSON.stringify(unlocked), charge)`.
2. If `saved.ok`: `await cardLines({ feature: 'compatibility', userId, reportId: id, savedText: saved.row.analysis, partnerName: current.partnerName, relationshipType })`.
3. Then return `readingResponse(saved.row)`. The response is unchanged.

### 2.5 `startRevealCardLines(input)`

It never throws, and it awaits only cheap work.
1. `readFlags()`. When `reveal_card_lines` is off, or the flag read fails, log once and return `{ done: Promise.resolve() }`. This fails closed.
2. Compute `hash = sha256(savedText)`.
3. Upsert into `reveal_card_lines` with `(feature, report_id, user_id, source_hash = hash, status = 'pending', lines = null, timestamps)`, `ON CONFLICT (feature, report_id) DO UPDATE`.
   - Wrap it in try/catch and log `[CardLines] storage` with the error class.
   - On failure, return without generating (no orphan cost).
   - This is NOT inside the payment transaction, so a missing table can never fail a paid unlock.
4. `const done = meterLlmUsage(newLlmUsage(), () => runCardLinesJob(...)).catch(logOnce)`, without awaiting it.
   - The job runs in its own meter. AsyncLocalStorage would otherwise add its tokens to the unlock's meter: `unlock_attempts` for compat, and the detail `MonthlyAttempt` for monthly.
   - Return `{ done }` so tests can await it.

### 2.6 `runCardLinesJob`

1. Parse `savedText`, the saved report itself:
   - monthly: `StructuredChartResponse`;
   - compat: `parseCompatibilityContent` → `shapeCompatibilityView(content, 'full')`.
   It never reads the chart again. The digest is built in code.
   - For monthly, the reader name comes from the `user` table. It is used only for masking and never goes into the prompt.
   - For compat, the names are `content.inputs.reader.name` and `partnerName`, also used only for masking and bans.
2. If the digest is null (legacy shape, a monthly report without `scoreScope: 'monthly-v1'`, or a missing chapter), write `failed` with class `shape` and stop.
3. `generateCardLines` under an overall deadline of `CARD_LINES_BUDGET.overallMs`, using `Promise.race` with a timer. On timeout the row becomes `failed` / `timeout`; any later result is discarded by the conditional write.
4. Write the result with `UPDATE … SET status, lines, model, calls, tokens, duration_ms, leftover_count, failure_class, updated_at WHERE feature = $1 AND report_id = $2 AND source_hash = $3 AND status = 'pending'`.
5. Log one line: `[CardLines] feature=… report=… outcome=ready|failed class=… ms=… calls=… in=… out=… cacheHit=… leftover=…`.
6. Failure classes reuse `classifyMonthlyFailure` (validation, json, truncated, timeout, http, rate_limit, unknown), plus `shape` and `storage`.

Budget (constants in `card-lines.ts`):
```
CARD_LINES_BUDGET = { maxTokens: 900, repairMaxTokens: 600, timeoutMs: 20_000, temperature: 0.7,
                      maxRepairRounds: 1, overallMs: 60_000, pendingStaleMs: 120_000 }
```

### 2.7 Read endpoints (in `src/systems/reveal/routes.ts`)

Both endpoints:
- require a session (401 otherwise);
- set `Cache-Control: no-store`;
- never generate.

`GET /api/fortune/monthly/card-lines/:yearMonth`:
- Validate the yearMonth pattern (400 otherwise).
- Load the session user's `monthly_reports` row for that month.
- Answer 404 unless `source === 'paid'`. A locked, legacy_free, missing or foreign row is a 404.
- Then call `readRevealCardLines('monthly', row.id, row.structured_reading, digest)`.

`GET /api/fortune/compatibility/:id/card-lines`:
- Load the row where `id`, `profile_a_id = the session user's profile` and `content_version = 4`, straight from the DB, not the Redis cache.
- Answer 404 unless the row is unlocked (`parseCompatibilityContent(row).detail !== null`).
- Then read the lines. Apply `spaceLatinNames` to the strings, as `readingResponse` does. Names are banned in lines anyway, so this is a no-op guard.

`readRevealCardLines` answers:

| Lines row | Answer |
| --- | --- |
| no row | `{ status: 'none' }` |
| `source_hash` ≠ sha256(current text) | `{ status: 'none' }` (report rewritten) |
| `pending`, `updated_at` within `pendingStaleMs` | `{ status: 'pending' }` |
| `pending`, older than `pendingStaleMs` (process died, e.g. a deploy restart) | `{ status: 'failed' }`; never regenerates |
| `failed` | `{ status: 'failed' }` |
| `ready`, stored lines pass the hard checks of `checkCardLines` against a digest rebuilt from the current report (defence in depth, pure, cheap) | `{ status: 'ready', feature, cards }` |
| `ready`, stored lines fail those checks | `{ status: 'failed' }`, logged |

### 2.8 Frontend flow (after the rework; section 7, WP-G)

1. The reveal mounts only when the localStorage key says the reveal has not been shown yet.
2. It calls `GET …/card-lines` (timeout 5 s) and polls every 1.5 s while the answer is `pending`, for at most 60 s, and stops once the deck is dealt.
3. At deal time, a pure `chooseRevealDeck(state, fallbackCards, linesToCards)` returns `{ cards, source }`:

| State at deal time | Deck | Source |
| --- | --- | --- |
| `ready` | lines deck | `lines` |
| `pending` | fallback | `late` |
| `failed` | fallback | `failed` |
| `none` | fallback | `none` |
| fetch error, timeout or 404 | fallback | `error` |

- The deck never changes after deal.
- No error UI and no spinner at any point.

---

## 3. Prompt design, validator rules and the fallback matrix

### 3.1 Digest (built in code, small, from the saved report only)

The digest keeps prompt tokens, and so cost and latency, low.

**Monthly digest:**
- the month name in Thai and B.E.;
- theme facts:
  - `teaserFocus`;
  - `monthlyHighlights[0].note` and `.description`;
  - the first paragraph of `life_overview.reading`, cut at a sentence boundary under about 500 characters.
- the strongest area. It is computed exactly like horo-fe `rankAreas`: drop `life_overview`, stable sort by score descending, take index 0. The digest carries its key, its Thai label, its `hook` and the first paragraph of its `reading`.
- the caution area: the last item of that ranking. The digest carries its key, its label, `warnings[0]`, `monthlyHighlights[0].warning` and `life_overview.warnings[0]`.
- the two elements in Thai (self and month).

The monthly digest never contains scores, lucky colours, lucky numbers, the lucky day, dates or the reader's name.

**ดวงคู่ digest**, from `shapeCompatibilityView(content, 'full')`:
- the relationship type in Thai;
- `archetype.name` and `.tagline`;
- the `attraction` chapter's `summary` and `move`;
- the strongest dimension (highest score; ties keep array order): `label` and `overview.dimensionLines[key]`;
- the weakest dimension: `label` and its line;
- the `friction` chapter's `summary` plus `scenarios[0]` (`scenario` and `repair`);
- the `future` chapter's `nextStep.step` (without its month) and `move`;
- the two people's day-master elements in Thai.

The compat digest never contains scores, MBTI, `inputs`, palace data, calendar months or the plan days.

**Slot binding.** Code attaches an area key to each slot, and the API returns it so the FE takes titles and art from it:

| Slot | Bound area |
| --- | --- |
| monthly `theme` | none |
| monthly `strongest` | the strongest area key |
| monthly `caution` | the caution area key |
| compat `pull` | the strongest dimension key |
| compat `gentle` | the weakest dimension key |
| compat `next` | none |

### 3.2 Prompt rules

These rules go in `card-lines.md`, written as rules in words with no example sentences.

- **System prompt:** `CARD_LINES_SYSTEM_PROMPT` = `system-structured.md` plus a short voice block inside `card-lines.md`.
  - Do not append `voice.md`. It contains example sentences, and it forbids poetry and imagery, which would contradict the verse.
  - The แม่หมอ rules are restated in words: read the sign first, then warn about people only as visible behaviour in the form ระวังคนที่… or ถ้ามีคน…, then advise; fortune phrases in moderation; no fixed fate; plain everyday Thai that a 20-year-old and a 50-year-old both get on one read; no translationese.
- **Task:** write exactly three cards for the named slots, returned as JSON `{"<slot>": {"verse": [line1, line2], "meaning": "..."}, …}`.
  - The slot order and the facts for each slot come from the digest.
  - Each card must agree with its slot's facts and must not add new claims.
- **Verse:** two short lines with the rhythm of a Thai fortune saying.
  - Each line is a few everyday words; sound echo (สัมผัส) between the lines is welcome.
  - No archaic words (เจ้า, ข้า, ท่าน) and no ornate vocabulary.
  - Any image used must be a common Thai saying, and the meaning line must state what it means plainly.
  - The verse reads the sign; on the caution or gentle card it stays gentle, never frightening.
  - The two lines must differ.
- **Meaning:** one plain sentence saying what the verse means for this reader.
  - On the strongest or pull card: how to use the momentum.
  - On the caution or gentle card: one protective step, or one visible-behaviour warning.
  - On the next card: one small step.
- **Bans:**
  - numbers of any kind, and number words for amounts;
  - colours, days of the week, dates, weeks, parts of the month, other months or the year;
  - scores, percentages, money amounts, promises of gain;
  - symptoms;
  - names of either person;
  - MBTI or any personality framework;
  - lot, draw or card words (เซียมซี, ใบที่, เลขที่, เสี่ยงทาย, จับฉลาก, ไพ่);
  - the paid copy or the ticket;
  - another person's thoughts, feelings, intentions or future actions;
  - fixed fate;
  - emoji, dashes, middle dots, quotation marks.
  - Area names: only the slot's own bound area may be named, and the theme card may name only the two bound areas. Element names: only the two given elements.
- At most one fortune phrase per card. The three cards open differently. Do not copy wording from the digest.
- Code guard: a unit test asserts `card-lines.md` contains no quotation marks (`"`, `“`, `”`) and no `ตัวอย่าง`/`เช่น`. The md describes the form and never shows a sentence.

### 3.3 Validator rules (`checkCardLines`)

Error strings use the existing path-prefixed format (`theme.verse[0]: …`) so `getField`, `setField` and `errorPath` from `monthly-fields.ts` work unchanged.

**Hard rules.** After the repair round these are fatal, and the lines are not saved:
1. **Shape:** exactly the feature's three slots. Each has `verse` as an array of exactly 2 strings and `meaning` as a string. Unknown keys are dropped.
2. **Lengths** in UTF-16 units, as the existing checks count. Use the format `N characters, needs A to B` so it qualifies for the extra round.

   | Field | Length |
   | --- | --- |
   | each verse line | 10 to 42 |
   | meaning | 30 to 140 |

   The two verse lines must not be identical after whitespace is squashed.
3. **No digits at all:** `[0-9๐-๙]`. No `%`, `เปอร์เซ็นต์` or `คะแนน`. This is stricter than "numbers not in the report", which would almost never fire because the digest carries none.
4. **No colours:** `สี` followed by a colour word (แดง, เขียว, ฟ้า, ขาว, ดำ, ทอง, เงิน, ม่วง, ชมพู, ส้ม, เหลือง, น้ำเงิน, เทา, น้ำตาล, ครีม). No day names: `วัน(จันทร์|อังคาร|พุธ|พฤหัส|ศุกร์|เสาร์|อาทิตย์)`.
5. **Areas.**
   - Monthly: the formal labels ความรัก, การงาน, การเรียน, การเงิน, สุขภาพ, ครอบครัว, plus `ด้าน`+label.
   - ดวงคู่: the four `dimensions[].label` strings from the report.
   - A card may name only its bound area. The theme card may name the strongest or the caution area. `next` may name none.
   - This binding is the real "no area name that is not in the report" check, because every monthly report names all six areas.
6. **Elements:**
   - monthly: `elementErrors(path, text, { selfElement, monthElement })`;
   - compat: `foreignElementWords(text, [readerElement, partnerElement])`.
7. **Script and names:**
   - `foreignLetters(text)` with no name exemption, because names are banned.
   - Neither the reader's nor the partner's name, nor the `maskName` forms, may appear.
8. **Reused rule sets:**
   - every entry of `FORBIDDEN` from `monthly-detail-validate.ts`: dates, weeks, parts of the month, other months or the year, symptoms, another person's thoughts or future actions, others' help as fact, banned generic advice, money, ฉบับเต็ม/ตั๋ว/ปลดล็อก, fixed fate, dash or middle dot, emoji;
   - compat only: `guessesPartnerView(text, partnerName)` and the same with the word อีกฝ่าย;
   - `personalityFrameworkJargon(text)` and `wrongGenderWords` where a gender is known.
9. **Lot and draw words:** `เซียมซี|ใบที่|เลขที่|เสี่ยงทาย|เขย่า|ติ้ว|จับฉลาก|ไพ่|เลขเด็ด|ลุ้น`. Also no quotation marks.
10. **Copy from the report:** `sharedRun(line, digestText, 16)` gives `the words "…" are copied from the report`. It is hard but repairable.

**Soft rules.** These are repaired once and accepted if they remain:
- More than one hit of `FORTUNE_PHRASE_RE` in a card: `<slot>.meaning: fortune phrases: N, at most 1`. This matches `isSoftStyleError`'s `/: fortune phrases: /`.
- Two meanings or two first verse lines opening with the same first 6 squashed characters: `<slot>.meaning: opens with a template shared with <other>`. This matches `/: opens (?:like areas\.|with a template)/`.

Do not edit `isSoftStyleError`; the wording above matches it as is.

**Repair spec:**
- `brief` = the slot facts, the bans and the elements;
- `constraint(path)` gives per-field rules in Thai words;
- `reference(path)` gives the digest text for that slot, so the repair does not copy it;
- `maxRepairRounds: 1`, plus the existing third-round rule for length, script, copy and soft errors.

### 3.4 Fallback matrix

| Case | Server | Endpoint | FE deck | Event `cards` | Counts as fallback? |
| --- | --- | --- | --- | --- | --- |
| Flag off | no row | `none` | summary cards | `none` | no |
| Report unlocked before release, or opened on another device later | no row | `none` | summary | `none` | no |
| Paid report regenerated (hash changed) | stale row | `none` | summary | `none` | no |
| Legacy monthly shape or bad compat content | `failed`/`shape` | `failed` | summary | `failed` | yes |
| Still generating at deal time | `pending` | `pending` | summary (frozen) | `late` | yes |
| Validator hard failure after repair | `failed`/`validation` | `failed` | summary | `failed` | yes |
| Model timeout, HTTP or rate limit | `failed`/class | `failed` | summary | `failed` | yes |
| Pending older than 120 s (restart) | `pending` (stale) | `failed` | summary | `failed` | yes |
| Stored lines fail the re-check on read | `ready` | `failed` | summary | `failed` | yes |
| Pending insert failed (table missing) | no row | `none` | summary | `none` | no; it shows in the admin as "table missing" |
| Endpoint 5xx, timeout or offline | n/a | error | summary | `error` | yes |
| Locked report | lines never generated | 404 | reveal not shown | n/a | n/a |
| Unlock itself fails (502) | job never starts | n/a | n/a | n/a | n/a |
| Ready | `ready` | `ready` + cards | lines deck (code titles and art, model verse and meaning) | `lines` | no |

Additional cases:
- **Locked payload:** no report response ever carries lines. The lines endpoint answers 404 for locked rows (leak tests in WP-C).
- **Paid ดวงคู่ unlocked by a paid order (webhook):** the same `unlockReading` path, so lines are generated, and the reader usually opens the result later, when they are `ready`.
- **History page:** the same endpoint keyed by yearMonth. It works for any paid month and answers `none` for months unlocked before release.
- **Regeneration paths** (`monthly-regenerate.ts`) are untouched:
  - paid rows skipped because the profile was updated keep their text, so their lines stay valid (hash unchanged);
  - rewritten paid rows change hash, so their lines answer `none`;
  - locked rows never have lines.
  - Regen does not call the lines job (owner question 3).

---

## 4. Schema change (additive), Railway push safety and rollback

New table in `/Users/purin/dev/horo/horo-be/lib/db/schema/reveal.ts`:

```
reveal_card_lines
  id               uuid pk default random
  user_id          text not null references user.id ON DELETE CASCADE   -- personal text goes with the account
  feature          varchar(16) not null      -- 'monthly' | 'compatibility'
  report_id        uuid not null             -- monthly_reports.id or compatibility.id (no FK: two parents)
  source_hash      varchar(64) not null      -- sha256 hex of the stored report text the lines were written from
  status           varchar(8) not null       -- 'pending' | 'ready' | 'failed'
  lines            jsonb                     -- { v: 1, cards: RevealCardLine[] } when ready, else null
  failure_class    varchar(32)
  model            text
  calls            integer not null default 0
  prompt_tokens    integer
  completion_tokens integer
  cache_hit_tokens integer
  duration_ms      integer
  leftover_count   integer not null default 0  -- soft problems accepted
  created_at       timestamp not null default now()
  updated_at       timestamp not null default now()
  unique index reveal_card_lines_feature_report_idx (feature, report_id)
  index reveal_card_lines_created_idx (created_at)
```

**Why not the attempt tables:**
- `monthly_generation_attempts.kind` is `varchar(8)`, and `MonthlyAttempt.record` swallows insert errors, so a longer kind would be lost silently.
- `unlock_attempts` has no kind column. Extra rows would inflate the admin unlock funnel's `attempted` and `unlocked` counts.
- Cost and time therefore live in this table plus the `[CardLines]` log line. The admin card reads it.

**Migration safety:**
- This is one CREATE TABLE plus two indexes: no drop, rename or type change.
- Railway's background `drizzle-kit push` applies it if push is not blocked by other drift. If it is blocked:
  - the pending upsert fails and is logged as `[CardLines] storage`;
  - the read endpoint 500s and the FE treats that as `error`;
  - the admin card shows "table not present";
  - unlocks keep working.
- No report-table select ever references the new table.
- Before the release, the engineer runs push against the local `horo_test` DB and confirms that the push output shows only `CREATE TABLE "reveal_card_lines"` and its indexes for this change.
- After deploy, the owner checks the admin card's "table present" state. A prod read needs the owner's explicit OK; the agent never queries prod on its own.
- Never use `--force` in deploy, and never run `db:migrate` on prod.

**Rollback:**
1. Turn the `reveal_card_lines` flag off in horo-admin. This takes effect immediately, with no deploy, and stops all generation and cost. The FE falls back automatically (`none`).
2. If the code must go: revert the horo-be commits and redeploy.
   - The table stays. It is harmless, additive and unreferenced.
   - The FE then gets 404 from the lines route and falls back, so the FE needs no simultaneous rollback.
3. Dropping the table is never required. If the owner wants it gone later, take a backup and apply manual SQL, following the CLAUDE.md destructive-change rule.

---

## 5. Shared types and API shape

`/Users/purin/dev/horo/horo-be/lib/shared/types/reveal.ts`:

```ts
export const REVEAL_FEATURES = ['monthly', 'compatibility'] as const;
export type RevealFeature = (typeof REVEAL_FEATURES)[number];
export const MONTHLY_REVEAL_SLOTS = ['theme', 'strongest', 'caution'] as const;
export const COMPATIBILITY_REVEAL_SLOTS = ['pull', 'gentle', 'next'] as const;
export type RevealSlot = (typeof MONTHLY_REVEAL_SLOTS)[number] | (typeof COMPATIBILITY_REVEAL_SLOTS)[number];

export interface RevealCardLine {
  slot: RevealSlot;
  verse: [string, string];
  meaning: string;
  /** Code-bound area of this slot: a FortuneCategoryKey (monthly) or a V4 dimension key (ดวงคู่); absent for theme/next. */
  area?: string;
}

export type RevealCardLinesResponse =
  | { status: 'ready'; feature: RevealFeature; cards: RevealCardLine[] }   // always 3, in slot order
  | { status: 'pending' }
  | { status: 'failed' }
  | { status: 'none' };

/** How the reveal deck was chosen at deal time (sent on reveal_started). */
export const REVEAL_CARD_SOURCES = ['lines', 'late', 'failed', 'none', 'error'] as const;
export type RevealCardSource = (typeof REVEAL_CARD_SOURCES)[number];
```

- Export the file from `lib/shared/index.ts`.
- `bun run sync:types` copies the whole `lib/shared/types` directory into `horo-fe/src/lib-packages/shared/types`. It writes into horo-fe, so it runs only in WP-G, after the rework is committed.
- horo-admin has no type sync, so WP-F copies the literal names with a comment pointing at this file, as `beliefs-model.ts` does.

API:
- `GET /api/fortune/monthly/card-lines/:yearMonth` and `GET /api/fortune/compatibility/:id/card-lines` return `RevealCardLinesResponse`.
- Other statuses: 401 without a session, 400 for a bad month, 404 for missing, foreign or locked.
- Report endpoints are unchanged.

---

## 6. Analytics: events, dedupe, validation, admin card

Event definitions follow the 2026-10-26 brief, which is the only place they are defined. All are signed-in product events in `product_events`, carrying no ids, text or names.

| Event | Fires when | Body | Row mapping (`surface`, `category`, `detail`, `props`) | dedupKey |
| --- | --- | --- | --- | --- |
| `reveal_shown` | the reveal screen (card backs or picker) mounts for a report not yet revealed on this device | `{ feature }` | `surface = feature`, others null | `feature` |
| `reveal_started` | the deck is dealt: first flip after the rework (ดวงคู่: when the stack appears after the 3 picks). This is the moment the deck source is frozen. | `{ feature, cards: RevealCardSource, deckSize: 1..6 }` | `surface = feature`, `category = cards`, `detail = String(deckSize)` | `feature` |
| `reveal_card_opened` | card *i*'s face becomes visible for the first time (1-based, as in the brief) | `{ feature, index: 1..6, deckSize: 1..6 }` with `index ≤ deckSize` | `surface = feature`, `detail = String(index)`, `props = { deckSize }` | `${feature}:${index}` |
| `reveal_completed` | the reader leaves the reveal into the report | `{ feature, skipped: boolean }` | `surface = feature`, `category = skipped ? 'skipped' : 'finished'` | `feature` |

Event rules:
- `skipped = true` only when the reader used a skip control before the last card's face was shown.
- If the rework ships no skip control on a surface, monthly today has none, so `skipped` is always false there. The admin shows the skip rate per feature with a note that it is 0 by construction. The rework brief asks for a "ข้ามไปอ่านฉบับเต็ม" link on every card.
- All four events share the same granularity: one per user × feature × Bangkok day, and card_opened also per index. Counting rows therefore counts reader-days and keeps the rates consistent.
- A second reveal of the same feature on the same day by the same reader is not counted again. This is documented in the type's JSDoc.

Backend changes:
- `lib/shared/types/analytics.ts`:
  - add the four names to `TRACKED_EVENT_NAMES`;
  - add the union members to `TrackedEvent`;
  - add the cases to `dedupKeyFor`. The switch has no default, so the compiler forces all four.
- `src/lib/analytics-events.ts`, `buildProductEventRow` re-validates:
  - `assertMember(REVEAL_FEATURES)` and `assertMember(REVEAL_CARD_SOURCES)`;
  - integers 1..6 with `index ≤ deckSize`;
  - `typeof skipped === 'boolean'`.
- `src/routes/analytics.ts` body union adds four `t.Object`s:
  - `feature: t.Union([t.Literal('monthly'), t.Literal('compatibility')])`;
  - `cards`: a union of the five literals;
  - `index`/`deckSize`: `t.Integer({ minimum: 1, maximum: 6 })`;
  - `skipped: t.Boolean()`.

**Server-side fallback and generation counter:** the `reveal_card_lines` status counts by feature and Bangkok day of `created_at`. This is the truth of generation, independent of the client.

**Admin card** (horo-admin, Engagement page, after `BeliefsSection`), built like BeliefsCard:
- `/Users/purin/dev/horo/horo-admin/src/lib/stats/reveal.ts` (server-only, `getSql`):
  - `getRevealStats(range)` returns null sections when a table is missing (`to_regclass`, as `beliefs.ts` does);
  - it uses aggregate SQL only: `COUNT(*)` grouped by feature, event, category and detail over `product_events` for the four events within `view_date` range;
  - for "reached last", it filters `event = 'reveal_card_opened' AND detail = props->>'deckSize'`;
  - it also reads `reveal_card_lines`: counts by feature, status and failure_class in range; AVG prompt/completion/cache tokens and calls for `ready`; p50 and p95 `duration_ms`.
- `/Users/purin/dev/horo/horo-admin/src/lib/stats/reveal-model.ts` (pure): builds the per-feature funnel rows and rates.

  | Rate | Formula |
  | --- | --- |
  | start | started ÷ shown |
  | completion | reached last ÷ started |
  | skip | skipped ÷ completed |
  | fallback at reveal | (late + failed + error) ÷ (started − none) |
  | generation failure | failed ÷ (ready + failed) |

  Each rate carries its target and a pass/fail flag. Divide-by-zero gives null and shows "ยังไม่มีข้อมูล".
- `/Users/purin/dev/horo/horo-admin/src/app/(dashboard)/engagement/RevealFunnelCard.tsx`:
  - one `Card` per feature with a `DataTable`;
  - the funnel rows are shown, started, card 1, card 2, card 3, reached last, completed and skipped;
  - the rates and targets sit in the footer;
  - a second table holds deck sources and generation statuses with cost.
  - Thai labels throughout. No export, no user list.
- Wire it in `/Users/purin/dev/horo/horo-admin/src/app/(dashboard)/engagement/page.tsx` with the page's `range`.

---

## 7. Work packages

Freeze rule: another engineer is finishing the flip/swipe reveal rework and the paper-letter survey.

**Do not touch until that rework is committed in horo-fe** (`git -C horo-fe log` shows it and `git -C horo-fe status` is clean for these paths):
- `horo-fe/src/features/cards/*` (`reveal-card.tsx` and its test)
- `horo-fe/src/features/fortune/monthly/monthly-mystery-card.tsx`
- `horo-fe/src/features/fortune/monthly/monthly-reveal-cards.ts`
- `horo-fe/src/features/compatibility/compatibility-card-ritual.tsx`
- `horo-fe/src/features/compatibility/compatibility-reveal-cards.ts`
- `horo-fe/src/features/compatibility/compatibility-result.tsx`
- `horo-fe/src/app/dashboard/fortune/monthly/page.tsx`
- `horo-fe/src/app/dashboard/fortune/monthly/history/[yearMonth]/page.tsx`
- `horo-fe/src/app/compatibility-card-preview/` (untracked, theirs)
- `horo-fe/src/features/beliefs/*`
- `horo-fe/DESIGN.md`
- **and `bun run sync:types`**, which writes into `horo-fe/src/lib-packages/shared`.

**These can proceed now, independently:** WP-A, B, C, D, E, F, all in horo-be and horo-admin.

### Test recipes

Backend tests use a local database and empty Redis, never `horo-be/.env.local`'s production URLs.

```
cd /Users/purin/dev/horo/horo-be
PW=$(docker exec local-postgres printenv POSTGRES_PASSWORD)
LOCAL="postgresql://dev:$PW@localhost:5432/horo_test"
# schema onto the local test DB (push --force hangs after finishing: background it, kill after ~25 s)
REDIS_URL= DATABASE_URL="$LOCAL" bunx drizzle-kit push --force & sleep 25; kill %1
# DB-backed tests
REDIS_URL= DATABASE_URL="$LOCAL" WALLET_TEST_DATABASE_URL="$LOCAL" bun test <files>
# full suite as Railway's Docker build sees it (DB tests skip)
REDIS_URL= DATABASE_URL=postgresql://none:none@localhost:1/none WALLET_TEST_DATABASE_URL= bun test
bun run type-check
```

Rules for every backend test run:
- Before any run, echo the host part of `$LOCAL` and confirm it is `localhost`.
- New DB tests guard with `isLocalDatabaseUrl` (as `monthly-unlock.test.ts` does) and skip without `WALLET_TEST_DATABASE_URL`.
- Tests must not depend on file order or on being first to touch a memoized singleton. Railway runs all files in one process, alphabetically, on bun 1.1.38.
- `WALLET_TEST_DATABASE_URL` tests empty `feature_flags`. Re-enable local flags afterwards if the dev stack needs them.

### WP-A: storage, shared types, flag (horo-be). Depends on nothing.

Steps:
1. Add `lib/db/schema/reveal.ts` and export it from `lib/db/schema/index.ts`.
2. Add `lib/shared/types/reveal.ts` and export it from `lib/shared/index.ts`.
3. Add the `reveal_card_lines` flag to `src/lib/feature-flags.ts` (no parent; Thai label and description that say it is the kill switch).
4. Do NOT run sync:types.

Acceptance:
- type-check passes;
- local push shows only the new table and indexes for this change;
- the existing feature-flag tests pass. Update any test that pins the flag list.

Tests:
- `tests/reveal-schema.test.ts`: the table's columns exist on the local DB after push.
- The existing `tests/*flag*` files.

### WP-B: digest, validator, repair spec, prompt (horo-be, all pure). Depends on WP-A types.

Steps:
1. Write `card-lines-digest.ts`, `card-lines-validate.ts` and `card-lines.md`.
2. Add `buildCardLinesPrompt` and `CARD_LINES_SYSTEM_PROMPT` in `src/lib/prompts.ts`.
3. Add the `maxRepairRounds` option in `src/lib/llm.ts`.

Acceptance, each item a unit test in `tests/reveal-card-lines-validate.test.ts`, `tests/reveal-card-lines-digest.test.ts` and `tests/reveal-card-lines-prompt.test.ts`:
- every hard rule in 3.3 rejects with the path-prefixed message;
- soft messages satisfy `isSoftStyleError`, and hard ones do not;
- length errors satisfy the `N characters, needs A to B` format;
- the slot binding matches `rankAreas` semantics, ties included;
- monthly digests contain no digits; compat digests contain no MBTI, scores or `inputs`;
- the digest returns null for a legacy shape;
- `card-lines.md` has no quotation marks, `ตัวอย่าง` or `เช่น`;
- the rendered prompt contains every slot's facts and no colours or numbers;
- `generateWithFieldRepair` without the new option behaves exactly as before. Extend `tests/monthly-field-repair.test.ts`: default stays 2 rounds, and `maxRepairRounds: 1` stops after one plus the third-round rule.

Tests: `REDIS_URL= DATABASE_URL=postgresql://none:none@localhost:1/none bun test tests/reveal-card-lines-*.test.ts tests/monthly-field-repair.test.ts` and `bun run type-check`.

### WP-C: generation, store, endpoints, unlock hooks, leak tests (horo-be). Depends on A and B.

Steps:
1. Write `card-lines.ts`, `card-lines-store.ts` and `src/systems/reveal/routes.ts`, and mount the routes.
2. Hook the monthly unlock (only `opened`, after commit, reusing `detailJson`).
3. Hook `unlockReading` (after `saved.ok`, injectable `cardLines`).

Tests: `tests/reveal-card-lines-store.test.ts` (DB), `tests/reveal-card-lines-routes.test.ts` (DB), and extensions to `tests/monthly-unlock.test.ts` and `tests/compatibility*.test.ts`.

1. The flag off gives no row and no generator call.
2. The flag on gives a `pending` row with the right hash, then a stubbed generator gives `ready`; await `done`.
3. A generator throw gives `failed` with its class. A timeout gives `failed`/`timeout`. A late result after the hash changed writes nothing.
4. `pending` older than 120 s reads as `failed`. A hash mismatch reads as `none`. A ready row that fails the re-check reads as `failed`.
5. The endpoints:
   - 401 without a session;
   - 404 for a locked monthly row, a legacy_free row, another user's month, another user's compat id, a locked compat row, and a `content_version` other than 4;
   - 400 for a bad month.
6. **Leak tests:** seed a lines row whose verse contains a unique marker for a locked monthly report and for a locked compat report. Then `JSON.stringify` the responses of every route below and assert the marker is absent:
   - `GET /api/fortune/monthly/history/:yearMonth`, both locked and paid;
   - the current monthly chart route;
   - `GET /api/fortune/compatibility/:id`, both locked and unlocked;
   - `GET /api/fortune/compatibility/share/:token`;
   - `GET /api/fortune/compatibility/history`;
   - `POST …/unlock`.
7. **Unlock resilience:** make the lines starter throw, or the insert into `reveal_card_lines` throw. The monthly unlock still returns `{ state: 'opened' }`; the compat unlock still returns 200 and charges once.
8. **Meter isolation:** a stub generator calls `addLlmUsage('m', { prompt_tokens: 999 })`. The `unlock_attempts` row and the detail `monthly_generation_attempts` row do not include those 999 tokens, and the lines row does.
9. Exactly one lines job per unlock under concurrent unlock taps (single flight).

Every unlock test stubs `startRevealCardLines` (or passes `cardLines`) and awaits `done`. No test may reach DeepSeek. No promise may outlive its test's DB teardown.

Acceptance:
- all of the above pass on the local DB;
- the full Docker-like suite passes;
- type-check passes.

### WP-D: sampling run and quality gate. Depends on B and C's `generateCardLines`; no DB; can run before WP-G.

Do it as in section 8. Deliverables in a scratch output directory, not committed:
- `summary.json`
- `review.csv`
- the scores

Acceptance: the gates in section 8 pass, or the owner decides on the failures.

### WP-E: analytics vocabulary and route (horo-be). Independent; can run in parallel with A to D.

Implement section 6 in `lib/shared/types/analytics.ts`, `src/lib/analytics-events.ts` and `src/routes/analytics.ts`.

Tests:
- `tests/analytics-events.test.ts`: mapping, dedupKeys, rejection of `index > deckSize`, of 0 and 7, of an unknown feature or source, and of a non-boolean `skipped`.
- `tests/analytics-route.test.ts`, or a new `tests/analytics-reveal-route.test.ts` modelled on `analytics-beliefs-route.test.ts`: 200 and recorded; a second identical `reveal_shown` the same day gives `recorded: false`; 400 or 422 for a bad body.

Acceptance: those tests and the full suite pass, with the DB recipe for route tests.

### WP-F: admin funnel card (horo-admin). Depends on E (names) and A (table), but needs neither deployed.

Write `src/lib/stats/reveal.ts`, `reveal-model.ts`, `RevealFunnelCard.tsx`, and the page wiring.

Tests:
- `reveal-model.test.ts`: rates, null on zero, targets, and fallback excluding `none`.
- `reveal.test.ts`, with the fake-sql pattern from `beliefs.test.ts`: null when tables are missing; every query aggregate (no `user_id` selected, no LIMIT or OFFSET); maps rows.
- `RevealFunnelCard.test.tsx`, as `BeliefsCard.test.tsx`.

Commands:

```
cd /Users/purin/dev/horo/horo-admin && bun test src/lib/stats/reveal*.test.ts "src/app/(dashboard)/engagement/RevealFunnelCard.test.tsx" && bun run type-check
```

There is no dev login on :3002, and production reads need the owner's OK.

### WP-G: frontend (horo-fe). Starts only after the rework is committed. Depends on A, C and E being merged in horo-be.

Steps:
1. Run `cd horo-be && bun run sync:types`.
2. Add `horo-fe/src/features/cards/reveal-card-lines.ts` (new, pure):
   - `chooseRevealDeck(state, fallback, toCards)`;
   - `monthlyLineCards(lines, report)`, which takes titles and art from the slot and area: theme uses the existing title and cover art; strongest uses `FORTUNE_CATEGORY_CONFIG[area]`; caution uses an owner-approved title and that area's art;
   - `compatibilityLineCards(lines, relationshipType, content)`: titles as today, plus a gentle title, and art from `relationshipReportVisuals`;
   - a shape guard that treats anything malformed as `failed`.
3. Add `horo-fe/src/features/cards/use-reveal-card-lines.ts` (new): react-query fetch and polling as in 2.8.
4. Add a `verse?: [string, string]` prop to `RevealCardFront`, rendered as two short lines above the body, in the rework's style.
5. Make both reveal components:
   - take `fallbackCards`, plus a `linesUrl` or `feature` + key;
   - freeze the deck at deal;
   - emit the four events through `useTrackEvent`, each once per mount.
6. Update the three mounts.
7. Update DESIGN.md with a short "Reveal card lines" section, and give it a FRESH score per the docs rule.

Tests (`bun test`):
- `chooseRevealDeck` for every row of the 3.4 matrix;
- the deck never changes after deal when the lines arrive late;
- the events fire once, with correct `index`/`deckSize`/`skipped`/`cards`;
- `reveal_completed` is not sent twice on remount;
- no fetch at all when localStorage already says revealed.

Commands:

```
cd /Users/purin/dev/horo/horo-fe && bun test src/features/cards src/features/fortune/monthly src/features/compatibility && bun run type-check && bun run lint
```

Never run `next build` while a dev server runs, and never run two `next dev` servers.

Browser check: the local stack `horo-be-shop-fake-3021` + `horo-fe-shop-fake-3010` with the flag on in local `feature_flags`, the dev login, and the monthly and compat unlock via fake pay. Check the ready, late (stub a slow generator) and failed paths on mobile width, plus reduced motion.

### WP-H: release. Depends on all of the above.

1. Push horo-be (`git push origin HEAD:master`).
2. Prove it is live: unauthenticated `GET https://api-horo.up.railway.app/api/fortune/monthly/card-lines/2026-10` gives 401 when live and 404 on the old build. Do not infer "deployed" from the push.
3. The owner checks the admin card's "table present" state. Then the owner turns on the flag `reveal_card_lines` (the flag is off in the deploy).
4. Push horo-fe and horo-admin only after step 2.
5. Two weeks later: review completion, skip, fallback and cost against the targets (decision-doc rules).

---

## 8. Sampling procedure (real model, never writes to production)

Script: `/Users/purin/dev/horo/horo-be/scripts/card-lines-sample.ts`. Copy the guard pattern from `scripts/monthly-sample.ts`:
- refuse to run unless `DATABASE_URL=postgresql://none:none@localhost:1/none`;
- `delete process.env.REDIS_URL`;
- require `DEEPSEEK_API_KEY` set explicitly;
- import nothing that opens a DB at import time;
- write only to `--out DIR` (use the session scratchpad or `~/horo-samples/`, never the repo).

Run:

```
cd /Users/purin/dev/horo/horo-be
DATABASE_URL=postgresql://none:none@localhost:1/none REDIS_URL= \
DEEPSEEK_API_KEY=$(grep '^DEEPSEEK_API_KEY=' .env.local | cut -d= -f2-) DEEPSEEK_MODEL=deepseek-flash \
bun scripts/card-lines-sample.ts --out <dir> --feature monthly|compatibility --count 20 [--inputs <dir>] \
  [--price-in <฿ per 1M input>] [--price-out <฿ per 1M output>] [--price-cache <฿ per 1M cache hit>]
```

Inputs, 20 distinct reports per feature, so each of the 6 card kinds gets 20 samples:
- **Monthly:** 20 synthetic profiles, saved under `<out>/inputs/` and reused by `--inputs`.
  - Start from the six in `monthly-sample.ts` and add 14 more covering all five day-master elements, both genders, birth hour unknown, MBTI on and off, and Thai and Latin names.
  - Months: the current month and the next.
  - Each report is generated by `generateMonthlyTeaser` → `generateMonthlyDetail` → `mapMonthlyDetail` with the `readerName` option, so there is no DB.
  - Existing `*.detail.json` files from a previous `monthly-sample.ts` run may be reused through `mapped`.
- **ดวงคู่:** 20 synthetic pairs: romantic 5, talking 3, friend 4, coworker 3, boss 2, family 3. Mix Thai and Latin names and partner MBTI on and off. Each is generated with `generateCompatibilityV4Stored({ withDetail: true })` and saved.
- For each report: build the digest, call `generateCardLines` once inside its own meter, and record per sample:
  - wall ms;
  - calls, tokens and cost (from the CLI prices; no prices hard-coded);
  - rounds and leftover;
  - the hard failure, if any;
  - the final lines.
- Also record each report's own generation time, to estimate time-to-deck.

Automatic checks in `summary.json`:
- hard-fail rate after repair;
- soft-accepted rate;
- p50 and p95 lines latency;
- mean and p95 baht per unlock;
- **cross-sample repetition**: any verse line or meaning opening of 12 or more squashed characters that appears in 3 or more of the 20 samples. This indicates template copying.

Human scoring sheet `review.csv`: one row per card (120 rows per feature), with the digest facts beside the lines. Six criteria, each scored 0, 1 or 2:

| # | Criterion | 2 means |
| --- | --- | --- |
| 1 | Faithful | agrees with the report; talks about its bound area; adds no claims |
| 2 | Verse | two real short lines with rhythm; plain words; specific to this report, would not fit any reader |
| 3 | Meaning | understood on one read; concrete; one clear use, protection or step |
| 4 | Voice | แม่หมอที่ห่วงใย order; at most one fortune phrase; warm, not scary; no translationese |
| 5 | Safety | no hidden intent, fixed fate, health, money or time claims. Any 0 here is a stop. |
| 6 | Freshness | not copied from the report, not a stock line repeated across samples |

Scoring: Opus (the auditor) scores all rows. The owner spot-checks two cards per kind (12 cards), and the owner's score wins where they differ.

Gates to enable the flag in production:
- hard-fail rate ≤ 5% per feature;
- mean score ≥ 9/12 for every card kind, and no Safety 0 anywhere;
- cross-sample repetition in at most 2 of 20 for any line;
- mean cost ≤ ฿0.05 per unlock;
- p50 lines latency ≤ 8 s and p95 ≤ 15 s. If p95 is above the measured intro time (time from unlock response to deal, measured once by hand in the local stack for each feature), the owner decides (Q1) before release.

When a gate fails:
- adjust `card-lines.md` rules (words only, never examples) or the validator;
- re-run on the same `--inputs`;
- compare against the previous `summary.json`.

---

## 9. Risks, pre-mortem, auditor checklist

Pre-mortem: what made it fail?
1. **Lines are usually late.** The reveal intro is shorter than the call, so the fallback rate exceeds 5%.
   - Measured in section 8 and in the admin's `late` share.
   - Mitigations, in order: shrink the digest; lower `maxTokens`; owner-approved hold of up to N s (Q1); in the worst case, the owner may accept generating from the teaser in parallel with the detail. That breaks "from the saved report" and is an owner call.
2. **A new column breaks report reads during a stalled push.** Avoided by the side table. The auditor verifies no report-table schema change.
3. **Background-call side effects:**
   - tokens leak into the unlock meters;
   - an unhandled rejection;
   - writes after a regenerate;
   - tests leave pending promises that hit DeepSeek or a closed DB and silently fail the Railway build.
   All are covered by the own meter, `.catch`, the hash-guarded write, and stubbed and awaited tests.
4. **The model copies the rules into stock lines, or reuses one verse for everyone.** The prompt has no examples, the validator applies the copy check against the digest, and the sampling checks repetition across samples.
5. **The verse breaks voice rules,** for example archaic words, imagery that needs interpretation, or lot language. These are prompt rules in words plus validator bans, and the sampling rubric covers them. `voice.md` is not appended, deliberately, because it forbids verse and contains examples.
6. **The fallback metric is polluted** by reports from before the release. `none` is excluded from the rate, and the server status table is the cross-check.
7. **Freeze-list collision** with the rework: WP-G is gated, and `sync:types` is gated.
8. **The skip rate is meaningless** if the rework has no skip control. This is documented and shown as "0 by construction".
9. **Privacy:** lines are personal text, so the table cascades on user delete, the endpoint is owner-only, and there are no ids in events.

Auditor checklist (Opus). Tick each with evidence (file and line, or a test name):
- [ ] **Leak:** report responses (monthly history and chart, compat GET, unlock, history, share) are byte-identical in shape to before. The lines endpoint gives 404 for locked, legacy, foreign and non-v4 rows. The marker-string leak tests exist and pass.
- [ ] **Fallback:** every row of 3.4 is covered by a BE or FE test. The FE never swaps the deck after deal. There is no error UI. No path generates on read.
- [ ] **Unlock safety:** the lines starter is outside the payment transaction, never throws, and is called only after commit (monthly only on `opened`). A test proves the unlock succeeds and charges once when the lines code or table fails.
- [ ] **Meter isolation:** lines tokens are absent from `unlock_attempts` and `monthly_generation_attempts`. The test exists.
- [ ] **Cost:** `reveal_card_lines` stores the model, calls, tokens and ms. The sampling mean is ≤ ฿0.05 with the owner's price inputs. `maxRepairRounds: 1` and the overall 60 s cap are applied.
- [ ] **Voice and prompt:** `card-lines.md` contains no example sentences or quotes (the test exists). `voice.md` is not appended. The rules in 3.2 are present in words. Each hard rule in 3.3 has a failing-case test. Soft rules match `isSoftStyleError` unchanged.
- [ ] **Facts data-driven:** no digits, colours, days, dates, scores or names can pass. Each card's area binding comes from code (rankAreas-equivalent). Titles and art come from code.
- [ ] **Destructive-change check:** the schema diff is one CREATE TABLE plus indexes. There are no edits to existing tables' columns. The local push output was captured. No `--force` in the deploy config. No `db:migrate`.
- [ ] **No prod writes:** every test command uses local `DATABASE_URL` and `WALLET_TEST_DATABASE_URL` plus `REDIS_URL=`. The sample script has the dummy-DB guard and deletes `REDIS_URL`. No script or test reads `.env.local`'s `DATABASE_URL`. No prod query ran without the owner's OK.
- [ ] **Tests:**
  - the full backend suite passes in Docker-like mode (DB tests skipped) and with the local DB;
  - new tests do not depend on file order or singletons;
  - horo-fe and horo-admin pass test and type-check, and horo-fe passes lint.
- [ ] **Analytics:**
  - all four events validated in the shared types, the mapper and the route;
  - dedupKeys consistent;
  - admin SQL aggregate-only (test);
  - fallback rate excludes `none`.
- [ ] **Freeze list honoured:** the horo-fe diff in WP-A to F is empty, and `sync:types` ran only in WP-G.
- [ ] **Release:** horo-be live-probed before the FE push; the flag is off at deploy.

---

## 10. Open questions for the owner (five)

1. **Late lines.** If the measured p95 lines time is longer than the reveal intro, is a short hold acceptable before the cards are dealt? For example a "สับไพ่" moment of at most N seconds, used only while the lines are pending. Or should it stay strictly zero wait, accepting the fallback?
   - Default: zero wait.
2. **Monthly deck.** With lines, the monthly reveal becomes theme, strongest area and caution. The lucky colour and number card leaves the reveal; the kit stays in the report.
   - Keep 3 cards (the default), or add the data-only lucky card as a 4th?
   - Also: what title should the caution card carry?
3. **Owner-regenerated paid reports** fall back to the summary cards (no new lines). Should the regeneration job also write new lines (about ฿0.05 each)?
   - Default: no.
4. **The "above 10%: drop the call" rule.** Should it use the reveal-time fallback rate (late + failed + error, excluding reports from before the release; the default), or the server generation-failure rate? Both will be shown.
5. **Sampling spend and review.** About 40 full synthetic reports plus 40 lines calls costs about ฿40 to 50 of model use. Is that OK? And will you spot-check the 12 cards (two per kind) before the flag goes on?

---

### Critical Files for Implementation
- /Users/purin/dev/horo/horo-be/src/systems/fortune/routes.ts
- /Users/purin/dev/horo/horo-be/src/systems/compatibility/reading.ts
- /Users/purin/dev/horo/horo-be/src/systems/fortune/monthly-detail-validate.ts
- /Users/purin/dev/horo/horo-be/src/lib/llm.ts
- /Users/purin/dev/horo/horo-be/lib/shared/types/analytics.ts

FRESH (new plan, 2026-10-27): F 2 (descriptive dated path, but not yet listed in the docs index) · R 2 (grounded in the
three repositories and implemented tests; the production flag-on path, real-model sample and owner card review remain
open) · E 1 (the 853-line implementation plan is intentionally exhaustive and expensive to scan) · S 2 (one canonical
plan, with the shorter backend runtime spec in `horo-be/docs/card-lines.md`) · H 3 (work packages, gates, failure handling,
release order and an auditor checklist are explicit). Total 10/15 (C).
