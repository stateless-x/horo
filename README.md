# Horo (สายมู.com)

A Thai fortune-telling web app. It reads a birth date through two traditions at
once: Chinese Bazi (the four pillars) and Thai astrology, then writes the
reading in Thai. Over 1,000 people have used it.

This repository is the navigator. It holds no application code of its own.
The three services below are separate repositories, tracked here as submodules
so one clone brings the whole system at versions known to work together.

## The three repositories

| Repo | What it does | Stack |
|---|---|---|
| [horo-fe](https://github.com/stateless-x/horo-fe) | The web app people use. Onboarding, daily readings, birth chart, compatibility. | Next.js 15 · React 19 · Tailwind v4 · Framer Motion |
| [horo-be](https://github.com/stateless-x/horo-be) | The API. Astrology maths, reading generation, auth, analytics. | Elysia · Drizzle · Postgres · Better Auth · DeepSeek |
| [horo-admin](https://github.com/stateless-x/horo-admin) | Private analytics dashboard. Reads the product database, never writes to it. | Next.js 15 · postgres.js · Recharts |

## How it fits together

```
horo-fe  ──HTTP──▶  horo-be  ──▶  PostgreSQL  ◀──read only──  horo-admin
                            ──▶  DeepSeek (writes the readings)
                            ──▶  Redis (rate limits, cache)
```

horo-be owns every database write and every call to the language model. The
frontend never talks to Postgres or DeepSeek directly. horo-admin connects to
the same database but only reads: its own logins live in a separate `admin`
schema so an admin account can never appear as a product user.

## Cloning

The default branch of this repository is not the one you want. `master` holds an
older, unrelated project. The monorepo lives on `main`:

```bash
git clone --branch main --recurse-submodules https://github.com/stateless-x/horo.git
```

If you already cloned without submodules, fill them in:

```bash
git submodule update --init --recursive
```

Each submodule needs its own `.env.local`, and none of them are in git. Copy the
`.env.example` in each repo and fill it in. Then `bun install` in each.

## Running locally

Start the backend first: the frontend calls it on load and will show its error
state without it.

```bash
cd horo-be && bun run dev     # port 3001
cd horo-fe && bun run dev     # port 3000
cd horo-admin && bun run dev  # port 3002
```

Each repository's README covers its own setup in more detail.

## Working across repositories

A change that spans the API and the app touches two repositories, so it lands in
three commits: the submodule commits first, then a commit here that moves the
pointers. Push the submodules before pushing this repo, or you publish a pointer
to a commit nobody else can fetch.

Shared types live in `horo-be/lib/shared/types` and are copied into the frontend
by `bun run sync:types` in horo-be. Edit them in horo-be and sync; editing the
copy in horo-fe means the next sync overwrites your work.

## Deployment

Railway deploys each service on push to its default branch. horo-be runs
`drizzle-kit push` at startup, so a new table or column reaches production as
part of the deploy. Destructive changes do not: push runs without `--force` and
will hang waiting for a confirmation that never comes. Apply those to the
database by hand first, then deploy the matching schema.

## Documentation

`docs/` holds the plans and decisions behind the product: the content and
retention plan, the compatibility scoring record, and the admin dashboard
architecture. Repository specific documentation lives in `horo-fe/docs/` and
`horo-be/docs/`.
