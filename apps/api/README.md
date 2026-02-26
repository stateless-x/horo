# Horo API

Elysia backend providing authentication and fortune-telling services.

## Features

### Endpoints

**Authentication (Better Auth):**
- `GET/POST /api/auth/**` - OAuth flow, session management
- Google OAuth (server-side only)
- httpOnly session cookies

**Fortune:**
- `POST /api/fortune/teaser` - Generate fortune preview (pre-auth)
- `GET /api/fortune/daily` - Daily horoscope (authenticated)
- `GET /api/fortune/chart` - Full Bazi chart (authenticated)
- `POST /api/fortune/compatibility` - Partner compatibility (authenticated)

**User:**
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update profile

## Tech Stack

- Elysia (web framework)
- Better Auth (authentication)
- PostgreSQL + Drizzle ORM
- Google Generative AI (fortune generation)
- @horo/astrology (Bazi and Thai calculations)

## Local Development

```bash
# From project root
bun dev

# Or run only API
bun --filter @horo/api dev
```

Access at http://localhost:3001

## Environment Variables

Create `apps/api/.env`:

```bash
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/horo

# Better Auth
BETTER_AUTH_SECRET=random-secret-min-32-chars
BETTER_AUTH_URL=http://localhost:3001

# Google OAuth
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Google AI
GOOGLE_AI_API_KEY=your-google-ai-api-key

# CORS
FRONTEND_URL=http://localhost:3000
```

For production, update URLs to Railway domains.

## Project Structure

```
apps/api/
├── src/
│   ├── index.ts              # Elysia app setup
│   ├── routes/
│   │   ├── auth.ts           # Better Auth routes
│   │   ├── fortune.ts        # Fortune endpoints
│   │   └── user.ts           # User endpoints
│   ├── lib/
│   │   ├── auth.ts           # Better Auth config
│   │   ├── db.ts             # Database connection
│   │   └── ai.ts             # Google AI client
│   └── middleware/
│       └── auth.ts           # Auth middleware
└── package.json
```

## Key Dependencies

- `@horo/db` - Database schema and client
- `@horo/shared` - Shared types and utilities
- `@horo/astrology` - Bazi and Thai astrology calculations
- `elysia` - Web framework
- `@elysiajs/cors` - CORS support
- `@elysiajs/cookie` - Cookie handling
- `better-auth` - Authentication
- `@google/generative-ai` - AI fortune generation
