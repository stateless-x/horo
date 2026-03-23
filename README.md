# Horo (สายมู.com)

Thai-Bazi fortune-telling web app combining traditional Thai astrology with Chinese Bazi calculations. 1,000+ users.

This repo is the central navigator. Each service has its own repository and deployment pipeline.

## Services

| Repo | What it does | Stack |
|---|---|---|
| [horo-fe](https://github.com/stateless-x/horo-fe) | Web app. User-facing fortune-telling product. | Next.js · React · Tailwind · Framer Motion |
| [horo-be](https://github.com/stateless-x/horo-be) | API. Bazi calculations, fortune data, auth. | Elysia · Drizzle · Better Auth · Gemini AI |

## How the system fits together

```
Web App  ──API──▶  Backend  ──▶  PostgreSQL
                           ──▶  Gemini AI (fortune generation)
```

## Running locally

Start backend first, then the frontend.

Each repo's README has its own quickstart instructions.

## Stack

Bun · Next.js · Elysia · PostgreSQL · Drizzle ORM · Better Auth · Google Gemini
