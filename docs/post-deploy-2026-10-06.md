---
type: OPERATIONS
status: active
scope: one-off steps after deploying the 1.0.0 / monetization-prep branches
last_reviewed: 2026-10-06
verified: horo-be route live in production 2026-10-06 (400 on the probe)
owner: product
---

# After deploying 1.0.0

Run in this order. Steps 1–2 are checks; step 3 is the only command that
writes to production, and it asks for an exact row count first.

## 1. Deploy order

1. **horo-be** first. Its startup `drizzle-kit push` creates `sponsor_daily`
   (additive, applies on its own). Check the Railway log for `Changes applied`,
   then prove the new route is live:

   ```bash
   curl -s -w "\nHTTP %{http_code}\n" -X POST https://api.xn--y3cbx6azb.com/api/analytics/sponsor -H 'content-type: application/json' -d '{"sponsor":"acme","surface":"today","action":"view"}'
   ```

   (`api.xn--y3cbx6azb.com` is api.สายมู.com.) `400` means the new code is live (unknown sponsor rejected). `404` means the
   old image is still serving: the Railway build silently keeps it when a test
   fails.
2. **horo-fe** (Vercel), then **horo-admin** (Railway).

## 2. Light mode — nothing to run

The theme lives only in each browser (localStorage), so there is no database
row to update. `ThemeResetOnce` (horo-fe `src/lib/theme-reset.ts`) switches
every browser to light on its first visit after the horo-fe deploy, once;
afterwards the visitor's own choice sticks. To run another reset later, bump
`RESET_VERSION` there.

## 3. Compatibility score backfill

New readings get the new overall score (the rounded mean of the four bars) as
soon as horo-be is deployed. This re-scores the readings made in the day before
the change (owner, 2026-10-05), from the bars already stored in each reading.
It also drops each changed reading's Redis copy so readers see the new number.

Run from `horo-be`; `.env.local` supplies the production `DATABASE_URL` and
`REDIS_URL`. `REDIS_URL` must be Railway's public URL: an internal
`*.railway.internal` host does not resolve from a laptop, and the cache clear
would then fail after the scores are written.

The window runs from 2026-10-04 00:00 Bangkok (a day before the decision) to
now; anything made after the deploy already has the new score and is skipped.

```bash
cd horo-be
HOURS=$(( ( $(date +%s) - $(date -j -f "%Y-%m-%d %H:%M %z" "2026-10-04 00:00 +0700" +%s) ) / 3600 + 1 ))
bun scripts/backfill-compat-overall.ts --hours $HOURS
```

That is a dry run: it lists each reading whose score changes (`old -> new`)
and ends with `Dry run. To write, re-run with --confirm <n>`. Read the list,
then write with that exact number:

```bash
bun scripts/backfill-compat-overall.ts --hours $HOURS --confirm <n>
```

If a reading arrived between the two runs, the count no longer matches and it
stops without writing; run the dry run again. `Nothing to change.` means every
reading in the window already carries the new score.
