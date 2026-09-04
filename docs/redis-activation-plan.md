---
title: Redis Activation Plan
status: implemented-and-verified (uncommitted)
owner: Claude (implementation delegated to Sonnet agent)
created: 2026-09-05
scope: horo-be only
---

# Redis Activation Plan

## Problem

`getRedisClient()` in `horo-be/src/lib/redis.ts:16-20` memoizes with the wrong sentinel:

```ts
let redis: Redis | null = null;
if (redis !== undefined) return redis;   // null !== undefined → always true
```

`redis` is initialized to `null`, so the guard short-circuits on the first call and the
`new Redis(redisUrl)` block below is unreachable. Every caller receives `null`.

Verified in production (read-only): `DBSIZE 0`, `keyspace_hits 0`, `uptime_in_days 58`.
`REDIS_URL` is correctly configured in both `.env.local` and Railway — the code never reads it.

### Consequences today
| Feature | Intended | Actual |
|---|---|---|
| Rate limiting | Distributed via Redis | In-memory `Map`; wiped on every deploy/hot-reload |
| `getCachedProfile` (1h) | Cache hit | DB query every request |
| chart + compat `cache()` (24h) | Cache hit | DB query every request |
| `invalidateCache()` | Deletes keys | No-op |

## Blast radius — why the one-character fix is NOT sufficient

`cache()` round-trips values through `JSON.stringify`/`JSON.parse`, which converts
Drizzle `timestamp()` columns from `Date` to `string`. Fixing the guard alone activates
three confirmed `TypeError` crashes on the cache-hit path (all reproduced locally):

1. `src/systems/compatibility/routes.ts:453` — `cached.createdAt.toISOString()`
2. `src/systems/fortune/routes.ts:774` — `profile.birthDate.toLocaleDateString('th-TH')`
3. `calculateThaiAstrology(profile.birthDate)` → `date.getUTCDay is not a function`

Item 3 **throws** rather than silently computing a wrong horoscope — verified. A crash is
recoverable; a silently mis-parsed birth date would not have been.

**Not affected** (verified): the chart month-boundary staleness guard at
`fortune/routes.ts:625-643` reads `updatedAt` *inside* the fetcher, so it only runs on a
cache miss. `partnerBirthDate` and `daily_readings.date` are Drizzle `date()` columns —
already strings, already expected as strings.

## Design decision: revive at the `cache()` boundary

Fix serialization once inside `cache()` rather than patching each call site, so every
current and future consumer is covered.

Use a `JSON.parse` reviver matching full ISO-8601 datetimes only:

```
/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/
```

Verified to have no false positives against real payload shapes:

| Value | Revived? | Correct |
|---|---|---|
| `1995-06-15T00:00:00.000Z` (timestamp col) | yes | ✅ |
| `1995-06-15` (`date()` col) | no | ✅ |
| `2026-09-05` (daily reading date) | no | ✅ |
| `วันนี้น้ำท่วมไฟ` (Thai reading text) | no | ✅ |
| `a1b2c3d4` (share token) | no | ✅ |

## Steps

1. **Fix the guard** in `src/lib/redis.ts` so the connection block is reachable.
   → verify: a unit test asserts `getRedisClient()` returns non-null when `REDIS_URL`
     is set, and memoizes (second call returns the same instance, no reconnect).

2. **Add the date reviver to `cache()`** in `src/lib/redis.ts`.
   → verify: unit test round-trips an object with a `Date` field and asserts the result
     `instanceof Date` and equal to the original; asserts `'1995-06-15'` and Thai text
     survive as strings.

3. **Regression tests for the three crash sites.**
   → verify: `bun test` passes; tests fail if the reviver is removed.

4. **Integration check against real Redis** (Claude, not the agent).
   → verify: with `REDIS_URL` set, hit each cached path twice; second call is a cache
     hit, returns 200, and `DBSIZE > 0`.

5. **Verify `/debug` rate-limit reset works against Redis** (`src/index.ts:106`).
   → verify: consume a limit, confirm the `ratelimit:*` key exists, call the endpoint,
     confirm the key is gone and the limit is released.

## Constraints

- `horo-be` only. Do not touch `horo-fe`.
- **No DB schema changes, no `db:push`** — `DATABASE_URL` points at production.
- Any production DB access is **read-only**.
- **Do not commit or push.** Leave changes in the working tree.
- Do not run `next build` (a frontend dev server may be running).
- Preserve all unrelated working-tree changes (Phase 1/2 UI work is uncommitted).
- Surgical: every changed line must trace to this defect. Do not refactor adjacent code.
- Do not "fix" `isRedisAvailable()` being dead code — note it, leave it.

## Out of scope

- `isRedisAvailable()` dead code (report only)
- `cache()`'s catch-and-continue degradation pattern (flagged separately for the user)
- Rotating the leaked `REDIS_URL` credential (user action, Railway dashboard)

## Implementation result (verified 2026-09-05)

Implemented by a Sonnet agent against this plan; reviewed and independently verified by Claude.

**Changed:** `src/lib/redis.ts` only (+21/-3) — guard now uses a separate `redisInitialized`
boolean sentinel, and `cache()` parses with an exported `reviveDates` reviver.
**Added:** `tests/redis-cache.test.ts` (4 tests).

The boolean sentinel was chosen over `Redis | null | undefined` because the latter would
narrow `redis` to `Redis | undefined` inside `isRedisAvailable()` and introduce a new type
error in a function that is explicitly out of scope. `isRedisAvailable()` and `closeRedis()`
are byte-identical.

### Verification performed

Unit — `bun test`: **63 pass / 0 fail** (59 baseline + 4 new). `bunx tsc --noEmit` output
byte-identical to the pre-change baseline (81 pre-existing unrelated `HTTPHeaders` errors in
`fortune/routes.ts`, unchanged).

Step 4 — integration against live Redis, forcing a real cache hit (fetcher throws if called):

| Check | Result |
|---|---|
| Cache hit confirmed (fetcher did not run) | ✅ |
| `birthDate` / `createdAt` `instanceof Date` | ✅ |
| Crash site 1 — `createdAt.toISOString()` | ✅ `2026-09-04T18:45:02.112Z` |
| Crash site 2 — `birthDate.toLocaleDateString('th-TH')` | ✅ `15 มิถุนายน 2538` |
| Crash site 3 — `calculateThaiAstrology(birthDate)` | ✅ `thursday / ดวงพฤหัสบดี` |
| Cached astrology result identical to fresh | ✅ byte-identical |
| `invalidateCache()` forces a refetch | ✅ |

Step 5 — distributed rate limiting: enforced at 5/hour (6th request rejected), key persists
with TTL 3600s, `decrementRateLimit()` refund works, `/debug` reset deletes the key and
releases the limit. **Concurrency:** 10 simultaneous requests against a 5/hour limit admitted
exactly 5 and rejected 5 — the Lua `incr`+`expire` script is atomic under load.

All test keys removed; production `DBSIZE` returned to 0. Nothing committed or pushed.

### Behavior change on deploy

Rate limits become **durable**. The `bun --hot` reload reset trick no longer works; use the
`/debug` reset endpoint (`src/index.ts:106`), which is now verified to work against Redis.
