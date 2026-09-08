---
type: PLAN
status: active
scope: horo-admin-analytics-dashboard
last_reviewed: 2026-09-07
owner: product
supersedes: []
superseded_by: null
---

# horo-admin: internal analytics dashboard

Plan and architecture decision for the admin dashboard that replaces the
static `stats.html` + `stats-data.json` pipeline. Code lives in the separate
repo `horo-admin` (sibling of `horo-fe` and `horo-be`). When this doc and the
code disagree, the code wins; update this doc.

## Goal

Answer, per page and per category and split by MBTI, what users open and
whether they come back, from a login-protected web app instead of a hand-pasted
HTML file. Audience: the product owner (super admin) and later a small number
of admins.

## Decision (ADR-lite)

**Chosen: separate Next.js repo, own Better Auth email/password login, same
Postgres database, admin tables isolated in a Postgres schema named `admin`,
product data read with read-only SQL.**

Options considered:

| Option | Tradeoff | Verdict |
|---|---|---|
| A. Admin routes inside horo-be + horo-admin as a pure frontend | One place owns the schema and queries, but admin users would live in the consumer `user` table and email/password sign-in would have to be enabled on the public auth server | Rejected: mixes admin identities into the product auth surface |
| B. Separate repo, own auth tables in the same DB under schema `admin`, raw SQL for stats | No new infrastructure, no auth changes in horo-be; the analytics queries duplicate table knowledge, but they are aggregates over stable table names | **Chosen** |
| C. Separate repo with its own Postgres for admin auth, read-only connection to the product DB | Strongest isolation, but a second database to provision, pay for, and keep credentials for, for four small tables | Deferred; revisit if more than a handful of admins exist |

Why the `admin` schema matters: horo-be applies its schema with `drizzle-kit
push` at every deploy, and drizzle-kit only diffs the `public` schema by
default. Tables in `admin.*` are invisible to that push, so they can neither be
dropped by it nor make it hang on a destructive prompt. For the same reason
horo-admin has **no `drizzle-kit push` at all**: its four auth tables come from
one checked-in SQL file (`db/migrations/0001_admin_auth.sql`) applied
idempotently by the seed script.

## Constraints

- Sign-up is disabled (`disableSignUp: true`). Accounts are created only by
  `bun scripts/seed-admin.ts` with `ADMIN_EMAIL` and `ADMIN_PASSWORD` in env.
  First account: `askpurin@pm.me`, role `super_admin`.
- `DATABASE_URL` is the production database. All product reads are `SELECT`
  only; a dedicated read-only Postgres role is a follow-up, not a blocker.
- Never send birth data, names, or generated prose to any third party; the
  dashboard is first-party only.
- UI addresses the admin as คุณ (not the oracle voice). Light theme, tokens
  from `horo-fe/DESIGN.md` light column.

## Data sources

| Question | Table(s) |
|---|---|
| Totals, funnel, signups timeline | `user`, `birth_profiles`, `chart_narratives`, `daily_readings`, `compatibility` |
| Audience (gender, MBTI, birth year, day of week, time period) | `birth_profiles`, `account` |
| Page opens, category opens, tab opens, shares, compatibility by type | `product_events` (new data) unioned with `surface_views` (first deploy only) |
| CTA clicks between surfaces | `product_events` where `event = 'cta_clicked'`, `detail` = the cta id |
| MBTI split of any engagement metric | join `birth_profiles.user_id` |
| Retention (DAU/WAU/MAU, cohorts, repeat daily readers, hourly heatmap) | `product_events`, `surface_views`, `daily_readings` |

Event vocabulary is owned by `horo-be/lib/shared/types/analytics.ts`
(`surface_viewed`, `category_opened`, `tab_opened`, `cta_clicked`,
`compatibility_checked`, `reading_shared`, plus the compatibility lifecycle).
Add an event there first; the dashboard consumes it.

`cta_clicked` is the one event that answers "did the invitation work", so it is
read differently from the rest. Its `detail` holds a cta id from the closed
`TRACKED_CTAS` list, named `<from>_<to>`, and it is **not deduped** — every
click is a row. So:

- clicks = `COUNT(*)`, people = `COUNT(DISTINCT user_id)`; the dashboard shows
  both, because one reader clicking a band five times is a different fact from
  five readers clicking it once.
- the number that matters is the ratio against the source surface's opens in
  the same range: `cta_clicked{cta:'today_monthly_chart'}` distinct users over
  `surface_viewed{surface:'today'}` distinct users is the click-through rate of
  the monthly-reading band, and the reason that band exists.

## Pages (v1)

1. `/login`: email + password.
2. `/` ภาพรวม: KPI tiles, signups line, funnel, surface opens by day.
3. `/audience` ผู้ใช้: gender, MBTI, temperament, generation, birth day of
   week, birth time period, provider × gender.
4. `/engagement` การใช้งาน: surface opens, category opens by page, fortune
   tabs, CTA clicks with their click-through rate against the source surface,
   shares, compatibility by relationship type, MBTI split control.
5. `/retention` การกลับมา: DAU/WAU/MAU, daily-reading repeat rate, weekly
   cohorts, hourly heatmap.

All pages accept `?range=7d|30d|90d|all` (default 30d) where a window applies.

## Build increments

Each step ships on its own and can be reverted alone.

1. Scaffold, auth tables SQL, Better Auth, login page, seed script → verify:
   `bun run build` with no `DATABASE_URL`; seed run by the owner creates the
   super admin.
2. Stats layer + Overview page → verify: page renders against production
   with real totals matching `stats-data.json` within the day's drift.
3. Audience page.
4. Engagement page → verify: empty states render while `product_events` is
   empty; numbers appear after the first tracked opens.
5. Retention page.
6. Railway deploy: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.

## Done when

- `askpurin@pm.me` can log in and see all four pages against production.
- Every number on the Overview page reconciles with
  `horo-be/scripts/fetch-stats.ts` output for the same day.
- `stats.html` is marked superseded in the root README.

## Follow-ups

- Surface `cta_clicked` on `/engagement`: a table of cta id x (clicks, unique
  users, CTR vs the source surface's opens in range), plus the three ids in
  `TRACKED_CTAS` labelled in Thai. Until that ships the events are recorded but
  invisible — the engagement queries read the compatibility and category event
  sets only.

- Read-only Postgres role for the dashboard's `DATABASE_URL`.
- Admin management page (invite, role change) once a second admin is needed.
- Retire `surface_views` once `product_events` has more than a month of data.
