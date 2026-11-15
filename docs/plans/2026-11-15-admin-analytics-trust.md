# Plan: horo-admin numbers you can trust, and a faster admin

Status (2026-11-15): everything below is deployed (`horo-admin` `main` at `17e2b0a`, `horo-be` `master` at `adca11b` plus a docs commit). Waves 1 and 2 and the team-account filter (D2) went first (`9071f31`). One "active" definition (D1) and the sidebar order (D3) were merged to `main` and pushed the same day (`ff1db78`, `0a09eb9`). D4 is dropped for now.
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
- Six different definitions of "active" across pages (fixed by D1, see "One active definition").
- Nothing excluded the team's own product accounts, with tens of payers (fixed by D2, see "Team accounts").

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

## Owner decisions

| ID | Decision | If yes | Files |
| --- | --- | --- | --- |
| D1 | One definition of "active" everywhere | **Approved, built and pushed 2026-11-15** (`0a09eb9`). See "One active definition" below | `shared.ts`, `active-model.ts`, plus the modules listed there |
| D2 | Leave the team's own product accounts out of the numbers | **Approved, built and deployed 2026-11-15** (`9071f31`). See "Team accounts" below | `shared.ts`, `team-model.ts`, `TeamNote.tsx`, plus the modules listed there |
| D3 | Sidebar order: promote การใช้งาน and กิจกรรมในร้าน, move ผู้ใช้ to รายงานเพิ่มเติม | **Approved, built and pushed 2026-11-15** (`ff1db78`). Main list: ภาพรวม, การใช้งาน, การกลับมา, ร้านค้า, แจกตั๋วและมู, กิจกรรมในร้าน, อีเมล | `src/lib/nav.ts` |
| D4 | "สมัครใน 30 วันล่าสุด" beside all-time on `/audience` | **Dropped 2026-11-15**: most cells would sit under 30 people, and `/acquisition` already shows who arrives by channel. Reopen when a paid campaign runs | `audience.ts`, `audience/page.tsx` |

## Team accounts (D2, deployed, 4 commits `c3b755b..9071f31`)

Rule: a product account is a team account when `lower(email)` or `lower("providerEmail")` equals the email of an `admin."user"` row (`teamUserIds` in `src/lib/stats/shared.ts`; horo-be's narration self-reset uses the same match). No table, no env var.

What is filtered, by family, so the same named number never differs between pages:

| Family | Filtered? | Where |
| --- | --- | --- |
| Sign-ups, user base, profiles, milestones, first result, 7 to 13 day return, DAU/WAU/MAU | yes | `overview.ts`, `owner.ts`, `retention.ts` (`getActiveUsers` only), `audience.ts`, `acquisition.ts` |
| Stripe revenue, payers, cash per payer | yes, and each baht total prints the team's share (`teamMoneyText`), so shown + team = Stripe | `owner.ts`, `shop/stats.ts` (`getTopups`), `shop/pricing.ts` (`getPayerStats`), `streak.ts` (`getEconomy`) |
| Tickets, มู, purchases per offer, funnels, cohorts, repeat, heatmap, surfaces, recent users | no (about 51 queries) | everything else, including all of `monthly-funnel.ts` |

How a reader tells: filtered blocks carry "ไม่นับบัญชีทีมงาน"; every page with a filtered number shows `TeamNote` under its heading with the count matched, or a plain sentence when none matched. Use `notTeamUser(sql, sql\`col\`)` (NOT EXISTS, so a NULL user id is kept) and `isTeamUser` for the disclosure.

Verified: type-check clean, 483 pass, 8 skip, build compiled. On a throwaway local database with admin tables and one admin email matching the dev user (different letter case), the overview, `/shop` and `/streak` each showed ฿398 from 2 payers with the team's ฿593 from 1 person beside it, equal to a direct SQL count. Not verified: no page seen in a browser; how many accounts match in production is unknown until the note is read there.

Cannot catch: an X account that shared no email, a team member who uses another address in the app, a team member with no admin login. Phase 2 is a hand-managed list (`admin.team_accounts`, UNIONed inside `teamUserIds`, edited from an admin page). It needs a hand-applied migration on production, so it waits for the owner.

## One active definition (D1, commit `0a09eb9`)

Rule: a person is active on a Bangkok day when they did something themselves that day: a `product_events` row that is not in `SERVER_RECORDED_EVENTS`, a `surface_views` row, or a `daily_readings` row. Payment confirmations, refunds and ticket use never count.

Why daily readings are in: horo-be creates one only when the reader opens the app (`src/systems/fortune/routes.ts`), and it is the only activity record from before page-view tracking began on 2026-09-07. Without it every older cohort would show nobody returning.

Two fragments in `src/lib/stats/shared.ts` are the only source: `anyActivitySource(sql, start, withEvents)` (days) and `anyActivityInstants(sql, withEvents)` (moments, for "after the email was sent"). Pages show the rule through `ACTIVE_DAY_NOTE` (`active-model.ts`).

| Number | Before | Now |
| --- | --- | --- |
| DAU, WAU, MAU (`getActiveUsers`) | every event, server-recorded included, plus surface views | the rule |
| Cohort return (`getCohorts`) | every event plus readings, no surface views | the rule |
| Segment reach and "คนที่ใช้งานจริง" (`segments.ts`) | every event, no surface views, no readings | the rule |
| Email return within 7 days (`campaign-outcomes.ts`) | every event plus surface views | the rule, by timestamp |
| Overview range count, recent users' active days | reader events plus surface views | the rule (gains readings) |
| 7 to 13 day return (`owner.ts`), streak "did anything else" | already the rule, built privately | same result, shared fragment |

Not changed on purpose: the hour heatmap counts events, not people; `/engagement` and the monthly funnel count specific events.

Verified: type-check clean, 498 pass, 8 skip, build compiled. On a throwaway local database seeded with four people (two with only a server-recorded event, one with only a reading, one with only a surface view), the modules matched a hand-written SQL count: daily users 0, 1, 1 on the three days; the cohort showed 2 of 4 returned in week 1 with week 2 unfinished; email return 2 of 4 (the old rule would have said 3); the server-only people show 0 active days. Not verified: no page seen in a browser; how far the production lines move is unknown until deploy.

## Latest purchases for support (commit `17e2b0a`, deployed 2026-11-15)

Owner ask, 2026-11-15: see who bought most recently, to help them when something goes wrong. `/shop/activity` with nothing searched now lists the 30 newest top-up orders (every status) and catalog purchases from everyone: time, who, item, amount, status, each linking to that person's timeline (`src/lib/shop/recent-purchases.ts`, `recent-purchases-model.ts`, shared `src/components/SupportTable.tsx`). Team accounts are shown and marked ทีมงาน: it is a support list, not a metric. Open fulfilment failures are not in it; `/shop` "ต้องดูแล" already lists those.

Verified: type-check clean, 509 pass, 8 skip, build compiled; on a throwaway local database the 30 rows came back newest first, matched a direct SQL ordering, and the admin's own account carried the team mark. Not verified: no page seen in a browser.

## Visual refresh (commits `fb1735d` and `d16d12d`, pushed 2026-11-15)

Owner, 2026-11-15: the admin is "boring, monotonous, too few colour", hierarchy is weak, the nav is unrefined; an icon library is allowed. A refinement, not a rebrand: same purple, fonts, copy, data and routes.

- Sidebar: dark aubergine, all 17 pages visible in three groups (the two nested folds are gone), one lucide icon per page, account at the bottom.
- Colour with a job: an area badge on every page heading (people purple, behaviour teal, money orange, messaging blue, system slate), status chips, a filled `lead` tile and a teal `contrast` tile.
- Hierarchy: one `lead` tile per page, a rule after each section heading, cards without shadow, range pickers as segmented controls so purple means the active page, the lead tile or an action.
- Rules are in `horo-admin/DESIGN.md` (Navigation, Hierarchy, Icons).

Verified by looking, for the first time: a local preview with a throwaway SSL Postgres, about 700 made-up users and a test login (launch config `horo-admin-preview-3012` in `.claude/launch.json`). Checked the overview, usage, returning, shop, shop activity, audience, streak, email and flags pages at 1440px and the overview and menu at 375px; type-check clean, 516 pass, 8 skip; Docker image built on bun 1.1.38. No Thai phrase changed (diff checked). Also opened after the fixes: acquisition, narration, segments and the ticket page. Not verified: charts after the second round of fixes (the preview pane was hidden and charts do not draw in a hidden page; chart files were not touched), four pages not opened (sponsors, catalog, sales, payment keys), and real production data.

## Duplicate profiles in production (measured 2026-11-15)

Read-only count with the owner's OK: 2,018 profile rows, 2,018 users, 0 duplicates. Nothing to merge. The horo-be fix (per-user lock on both save paths plus a unique index) shipped as `adca11b` the same day; a read-only check after the deploy showed `birth_profiles_user_id_unique_idx` in place and the plain index gone. Runbook and counts are in `horo-be/scripts/release/2026-11-birth-profile-unique/README.md`. A person's Google and X accounts are separate users on purpose and are not duplicates.

Not blocked, queued:
- Overview window that ends yesterday, so 30 complete days are compared with 30 complete days (`owner.ts`, `math.ts`). Today's copy says the window includes the unfinished day.
- A lean `getSurfaceOpens` so the overview stops running all of `/engagement`'s queries to read three fields.
- `/email` compares a naive `sent_at` with bare `NOW()` (`campaign-outcomes.ts`); the result depends on the database session timezone.

## Elsewhere

- horo-admin's build downloads Anuphan and Noto Sans Thai from Google Fonts (`src/app/layout.tsx`, `next/font/google`). On 2026-11-15 one build of `17e2b0a` failed there: Google returned a font link without a file extension and Next 15.5.29's loader crashed (`loader.js:122`). A rebuild of the same commit passed. Fixed in `18fd2be` (pushed 2026-11-15): both fonts now come from `@fontsource-variable/*` packages. Verified by building the Docker image locally with Google Fonts unreachable (bun 1.1.38 accepted the lockfile, Next compiled) and loading `/login` from that image: headings resolved to Anuphan Variable, body to Noto Sans Thai Variable, all font files from the app's own origin.

- horo-be: `/update-profile` used to select then insert with no lock. Fixed in `adca11b` (see "Duplicate profiles in production").
- Stale docs in `horo-admin`, not fixed here: `docs/CODEMAP.md` says the streak gift columns are in `PENDING_DEPLOY_COLUMNS` (the code lists only `wallet_ledger.funding`); `docs/architecture.md` lists three tested SQL modules (there are more).

## Rejected

- Polling, SSE, LISTEN: see the table above.
- A TTL cache or `unstable_cache`: it would make the stamp lie, and load is not a problem at this size.
- New charts or a BI tool before the numbers are right.
- One range control for every page: each window means something different, so they are labelled instead.

## After the deploy

Open `/audience`, `/`, `/retention`, `/acquisition` and `/shop` once each for the visual pass: the heading should show `ข้อมูล ณ HH:MM น.` with โหลดใหม่, and "กรอกวันเกิดแล้ว" on `/audience` should equal the overview's. The overview's team note says how many accounts were left out; zero means the hand-managed list is next.

For D1 and D3: the sidebar's main list starts ภาพรวม, การใช้งาน, การกลับมา; the active-user chart may start earlier than before (readings reach back past 2026-09-07) and its recent days may drop slightly (server-recorded events no longer count).
