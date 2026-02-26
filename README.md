# Horo

Thai-Bazi fortune-telling app combining traditional Thai astrology with Chinese Bazi (四柱命理) calculations.

## Tech Stack

**Monorepo:** Bun + Turbo

**Frontend (apps/web):**
- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- Framer Motion
- Zustand + TanStack Query

**Backend (apps/api):**
- Elysia
- Better Auth (server-side only)
- PostgreSQL + Drizzle ORM
- Google Generative AI

## Quick Start

### Prerequisites
- Bun 1.1.38+
- PostgreSQL database
- Google AI API key

### Installation

```bash
# Clone and install
bun install

# Setup environment variables (see Environment Variables below)
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env

# Run database migrations
cd packages/db
bun run db:push

# Start development servers
cd ../..
bun dev
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

### Environment Variables

**apps/api/.env:**
```bash
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/horo
BETTER_AUTH_SECRET=your-random-secret
BETTER_AUTH_URL=http://localhost:3001
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
GOOGLE_AI_API_KEY=your-google-ai-key
FRONTEND_URL=http://localhost:3000
```

**apps/web/.env:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
BETTER_AUTH_URL=http://localhost:3001
```

## Project Structure

```
horo/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Elysia backend
├── packages/
│   ├── shared/           # Shared types, constants, utils
│   ├── astrology/        # Bazi and Thai astrology calculations
│   ├── db/               # Drizzle ORM schema and migrations
│   └── ui/               # Shared React components
└── deployment/           # Railway deployment docs
```

See [apps/web/README.md](/apps/web/README.md) and [apps/api/README.md](/apps/api/README.md) for service-specific documentation.

## Features

### User Flow
1. 8-step onboarding (name, birth date, gender, Thai birth time, teaser fortune, auth, dashboard)
2. AI-generated fortune teaser before authentication
3. Google OAuth via Better Auth
4. Three dashboard screens: daily horoscope, full chart, compatibility analysis

### Astrology Calculations
- Thai astrology: Day-of-week attributes, life rhythm analysis
- Bazi (四柱命理): Four Pillars, Day Master, Five Elements, 10-year cycles
- Compatibility scoring based on element interactions

### Security
- Server-side auth only (Better Auth)
- httpOnly session cookies
- No OAuth credentials on client
- PostgreSQL for user data and fortune history

## Development Commands

```bash
# Run all services
bun dev

# Type check all packages
bun run type-check

# Build for production
bun run build

# Database commands
bun run db:generate    # Generate migrations
bun run db:push        # Push schema changes
bun run db:studio      # Open Drizzle Studio

# Run specific service
bun --filter @horo/web dev
bun --filter @horo/api dev
```

## Deployment

See [deployment/README.md](/deployment/README.md) for detailed Railway deployment instructions.

**Summary:**
- Deployed on Railway
- Separate services for web, api, PostgreSQL
- Environment variables configured per service
- Automatic deployments from Git

## Documentation

- [QUICKSTART.md](/QUICKSTART.md) - Quick reference guide with file structure
- [BETTER_AUTH_SETUP.md](/BETTER_AUTH_SETUP.md) - Authentication setup details
- [deployment/README.md](/deployment/README.md) - Deployment guide
- [apps/web/README.md](/apps/web/README.md) - Frontend documentation
- [apps/api/README.md](/apps/api/README.md) - Backend documentation

## Design System

**Colors:**
- Background: #0A0A0F (Void Black)
- Primary: #6B21A8 (Royal Purple)
- Hover: #A855F7 (Amethyst)
- Text: #F5F5F5 (Ghost White)

**Typography:**
- Body: Noto Sans Thai
- Headings: Prompt
- Oracle text: Sarabun 200

**Approach:** Mobile-first, dark theme, film grain overlay, Framer Motion animations
