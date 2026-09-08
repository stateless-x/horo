# Horo (สายมู.com)

Give it your birth date. It reads that date through two traditions at once,
Chinese Bazi and Thai astrology, and writes back a reading in Thai: your
element, your four pillars, what today holds, how you match with someone else.
Over a thousand people have used it.

This repository is a navigator. It contains no application code. The three
services below live in their own repositories and are tracked here as
submodules, so one clone brings the whole system at versions known to work
together.

## The three repositories

| Repo | What it does | Stack |
|---|---|---|
| [horo-fe](https://github.com/stateless-x/horo-fe) | The web app people use. Onboarding, daily readings, birth chart, compatibility. | Next.js 15 · React 19 · Tailwind v4 · Framer Motion |
| [horo-be](https://github.com/stateless-x/horo-be) | The API. Astrology maths, reading generation, auth, analytics. | Elysia · Drizzle · Postgres · Better Auth · DeepSeek |
| [horo-admin](https://github.com/stateless-x/horo-admin) | Private analytics dashboard. Reads the product database, never writes to it. | Next.js 15 · postgres.js · Recharts |

```
horo-fe  ──HTTP──▶  horo-be  ──▶  PostgreSQL  ◀──read only──  horo-admin
                            ──▶  DeepSeek (writes the readings)
                            ──▶  Redis (rate limits, cache)
```

One rule explains that diagram: horo-be owns every database write and every
model call. The frontend holds no connection string and no API key. horo-admin
shares the database but only reads from it, and keeps its own logins in a
separate `admin` schema so an admin can never be counted as a customer.

## Start here

```bash
git clone --recurse-submodules https://github.com/stateless-x/horo.git
```

Already cloned without submodules? `git submodule update --init --recursive`.

Then let `scripts/` do the rest. It checks each submodule is populated, copies
`.env.example` to `.env.local` where one is missing, installs when
`node_modules` is absent, and starts each server on its own port.

```bash
./scripts/dev.sh          # backend :3001 + frontend :3000
./scripts/dev.sh all      # the above plus admin :3002
./scripts/dev.sh admin    # one service on its own
./scripts/restart.sh      # stop, then start again
./scripts/stop.sh         # stop everything
```

The first run copies the `.env.example` files and stops. No secrets are in git,
so fill in `DATABASE_URL` and the API keys, then run it again.

Servers run in the background with logs under `.dev/logs/<service>.log`;
`./scripts/dev.sh -f` starts them and follows the output. Ordering is handled —
the frontend calls the backend on load and shows an error state without it.

To run one in the foreground instead:

```bash
cd horo-be    && bun run dev            # 3001
cd horo-fe    && bun run dev            # 3000
cd horo-admin && bun run dev -- -p 3002 # 3002, or it collides with horo-fe
```

## Two things that will bite you

**Submodule pushes come first.** A change spanning the app and the API lands in
three commits: one in each submodule, then one here moving the pointers. Push
the submodules before pushing this repository, or you publish a pointer to a
commit nobody else can fetch.

**Shared types have one home.** They live in `horo-be/lib/shared/types` and
reach the frontend through `bun run sync:types`, run from horo-be. The copy in
horo-fe is generated. Edit it and your work disappears at the next sync.

## Deployment

Railway deploys each service when you push to its default branch. horo-be runs
`drizzle-kit push` as it starts, so a new table or column arrives with the
deploy and needs no migration file.

Destructive changes are the exception, and they fail quietly. Push runs without
`--force`, so a dropped column or a changed type waits for a confirmation that
never comes in a deploy. Apply those to the database by hand first, then ship a
schema that already matches.

## The `master` branch is dead

This repository still carries a `master` branch holding the original Turbo
monorepo, the version of this product that existed before it was split into
separate repositories in February 2026. It shares no history with `main` and
nothing deploys from it. It is kept only as a record. Ignore it.

## Documentation

`docs/` holds the reasoning behind the product rather than instructions for it:
the content and retention plan, the record of how compatibility scoring was
fixed, and the architecture decision for the admin dashboard. Start with
`docs/README.md`, which indexes them. Service specific notes live in
`horo-fe/docs/` and `horo-be/docs/`.
