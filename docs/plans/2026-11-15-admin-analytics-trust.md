# Plan: horo-admin numbers you can trust, and a faster admin

Status: wave 1 and wave 2 built, merged to `horo-admin` `main` and pushed on 2026-11-15 (`a8ba955..623a30d`; branch `admin-analytics-trust` kept locally). Wave 3 waits on four owner decisions, listed below.
Roles: Fable planned and accepted; Opus 5.5 (high) audited all 18 pages and wrote the implementer briefs; Sonnet 5.5 (medium) built each increment.
When code and this doc disagree, code wins.

## The question that started it

"Does /audience get real-time stats?" No. Every admin page sets `dynamic = 'force-dynamic'` and reads the production database once per page load. Nothing polls or streams. Before this work the pages also showed no time, so a tab left open looked current.

Decision: label and refresh on demand, no polling.

| Option | Cost here | Verdict |
| --- | --- | --- |
| "ข้อมูล ณ HH:MM น." stamp plus a reload button | none | chosen |
| Auto-refresh while the tab is visible | reruns every query on the page through a pool of 5 connections on the product's own database; `/engagement` runs about 100 | rejected |
| SSE or LISTEN/NOTIFY | holds a pool slot; NOTIFY needs triggers, which are writes to `public.*` | rejected |

## What the audit found

- `/audience` counted profile rows, the overview counted distinct users, both under "กรอกวันเกิดแล้ว". `birth_profiles.user_id` has a non-unique index and horo-be's `/update-profile` path can still create a second row.
- The overview's "ตอนนี้โตขึ้นไหม" box said sign-ups were "more than before" whenever the sample was small, even when they fell.
- "กลับมาหลัง 1 สัปดาห์" on the overview meant days 7 to 13; "สัปดาห์ 1" on `/retention` means days 1 to 7.
- `/retention` claimed the selected range in its heading; five of six blocks are all-time. Unfinished cohorts showed 0%.
- `/acquisition` showed rates on two or three sign-ups, and a "กรอกวันเกิดแล้ว" column that equals sign-ups by construction (the channel is recorded when a birth date is first saved).
- `/engagement` summed unique people across buttons and called it "คน".
- No `error.tsx` or `loading.tsx`: one failed query took the whole page down.
- Six different definitions of "active" across pages (not fixed yet, see D1).
- Nothing excludes the team's own product accounts, with tens of payers (not fixed yet, see D2).

## Built (7 code commits plus one `DESIGN.md` commit, `623a30d`)

| # | Commit | What changed | Key files |
| --- | --- | --- | --- |
| 1 | `c3a9f47` | `/audience` and `/acquisition` count people; provider card counts each person once under their first sign-up channel; profile KPI shows coverage of all sign-ups | `src/lib/stats/shared.ts` (`onePerUserProfiles`), `audience.ts`, `audience-model.ts`, `acquisition.ts` |
| 2 | `3732aeb` | Overview sentences follow the data and show both counts; tile renamed "กลับมาวันที่ 7 ถึง 13 หลังสมัคร" | `src/lib/stats/owner-model.ts`, `(dashboard)/page.tsx` |
| 3 | `268b78d` | As-of stamp and โหลดใหม่ on every page heading; error screen with digest only; loading state | `src/components/ui.tsx` (`PageHeading`), `RefreshButton.tsx`, `(dashboard)/error.tsx`, `loading.tsx` |
| 4 | `9a1deed` | `/engagement`, `/segments`, `/narration` use the same one-profile-per-user row | `engagement.ts`, `segments.ts`, `narration.ts` |
| 5 | `53c4028` | Unfinished cohorts read "N คน · ยังไม่ครบ"; `/retention` names which blocks follow the range; access check | `math.ts` (`buildCohorts(users, activity, today)`), `CohortTable.tsx`, `retention/page.tsx` |
| 6 | `1fe0263` | `formatCountOf`: a percentage only when the base reaches 30; shared `SmallSample` | `src/lib/format.ts`, `ui.tsx`, `acquisition/page.tsx`, `engagement/page.tsx` |
| 7 | `f1cc75d` | Recent sign-ups and the `/shop` support tables link to `/shop/activity?user=<id>`; `/segments` access check | `RecentUsers.tsx`, `shop/page.tsx`, `segments/page.tsx` |

Rules these commits set for later work:
- Join or count profiles by user through `onePerUserProfiles(sql)`. Joins by profile id (`p.id = r.profile_id`) keep `public.birth_profiles`.
- The stamp lives in `PageHeading`, never in the layout or `Shell`: the App Router does not re-render a shared layout on navigation, so a stamp there would freeze.
- A rate on fewer than 30 people is shown as a count (`formatCountOf`, `SmallSample`).

## Verified

Run from `horo-admin`:

```
bun run type-check                                           # clean
DATABASE_URL=postgres://x@127.0.0.1:1/none bun test          # 454 pass, 8 skip, 0 fail (was 410)
DATABASE_URL=postgres://x@127.0.0.1:1/none bun run build     # compiled, all routes dynamic
```

The changed queries in `audience`, `acquisition`, `segments`, `narration`, `engagement` and `retention` (cohorts) were also run on the local `horo_dev` database through a throwaway test with a real client (deleted afterwards). Postgres accepted all of them.

Not verified:
- No page was seen in a browser. The admin has no dev login, so the first visual pass is the owner's.
- Nothing ran against production. How many duplicate profile rows exist there is unmeasured: `SELECT COUNT(*) - COUNT(DISTINCT user_id) FROM birth_profiles`.
- The stamp updating after โหลดใหม่ rests on reading Next 15.5's router code, not on a run.

## Owner decisions that gate wave 3

| ID | Decision | If yes | Files |
| --- | --- | --- | --- |
| D1 | One definition of "active" everywhere: reader-caused events plus `surface_views`, no server-recorded sales events | DAU, WAU, MAU and cohort lines shift once; each card states its definition | `shared.ts`, `retention.ts`, `segments.ts`, new `retention.test.ts` |
| D2 | Leave the team's own product accounts out of the numbers | Pages show "ไม่นับบัญชีทีมงาน N บัญชี"; matched by email against `admin."user"` | `shared.ts`, `owner.ts`, `overview.ts`, `audience.ts`, `shop/stats.ts` |
| D3 | Sidebar order: promote การใช้งาน and กิจกรรมในร้าน, move ผู้ใช้ to รายงานเพิ่มเติม | `nav.ts` + `nav.test.ts` only | `src/lib/nav.ts` |
| D4 | "สมัครใน 30 วันล่าสุด" beside all-time on `/audience` | A second set of breakdowns for recent sign-ups | `audience.ts`, `audience/page.tsx` |

Not blocked, queued after those:
- Overview window that ends yesterday, so 30 complete days are compared with 30 complete days (`owner.ts`, `math.ts`). Today's copy says the window includes the unfinished day.
- A lean `getSurfaceOpens` so the overview stops running all of `/engagement`'s queries to read three fields.
- `/email` compares a naive `sent_at` with bare `NOW()` (`campaign-outcomes.ts`); the result depends on the database session timezone.

## Elsewhere

- horo-be: `/update-profile` selects then inserts with no lock (`src/systems/fortune/routes.ts`, the second `insert(birthProfiles)`), so duplicate profiles can still appear. A unique index on `birth_profiles.user_id` is the real fix, after the existing duplicates are merged.
- Stale docs in `horo-admin`, not fixed here: `docs/CODEMAP.md` says the streak gift columns are in `PENDING_DEPLOY_COLUMNS` (the code lists only `wallet_ledger.funding`); `docs/architecture.md` lists three tested SQL modules (there are more).

## Rejected

- Polling, SSE, LISTEN: see the table above.
- A TTL cache or `unstable_cache`: it would make the stamp lie, and load is not a problem at this size.
- New charts or a BI tool before the numbers are right.
- One range control for every page: each window means something different, so they are labelled instead.

## After the deploy

Open `/audience`, `/`, `/retention`, `/acquisition` and `/shop` once each for the visual pass: the heading should show `ข้อมูล ณ HH:MM น.` with โหลดใหม่, and "กรอกวันเกิดแล้ว" on `/audience` should equal the overview's.
