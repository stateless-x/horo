# Horo - Thai Fortune Telling App

A mobile-first fortune-telling application combining Chinese Astrology (Bazi) and Thai Astrology, built for the Thai market.

## Tech Stack

- **Monorepo**: Turborepo
- **Runtime**: Bun
- **Frontend**: Next.js 16 (App Router, React Server Components)
- **Backend**: Elysia
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Supabase (server-side only)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (customized)
- **Animations**: Framer Motion
- **AI**: Claude API (Anthropic)

## Project Structure

```
horo/
├── apps/
│   ├── web/          # Next.js 16 frontend
│   └── api/          # Elysia backend
├── packages/
│   ├── db/           # Drizzle schema, migrations
│   ├── astrology/    # Bazi + Thai astrology calculators (pure TypeScript)
│   ├── ui/           # Shared UI components
│   └── shared/       # Types, constants, Zod schemas
├── package.json
└── turbo.json
```

## Prerequisites

- Bun >= 1.1.38
- PostgreSQL database
- Supabase project
- Anthropic API key

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Setup Environment Variables

#### Backend API (`apps/api/.env`):

```bash
cd apps/api
cp .env.example .env
# Edit .env with your credentials:
# - DATABASE_URL
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - JWT_SECRET
# - ANTHROPIC_API_KEY
# - FRONTEND_URL
```

#### Frontend (`apps/web/.env`):

```bash
cd apps/web
cp .env.example .env
# Edit .env:
# - NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Setup Database

```bash
# Generate migrations
cd packages/db
bun run db:generate

# Push schema to database
bun run db:push

# Optional: Open Drizzle Studio
bun run db:studio
```

### 4. Run Development Servers

From the root directory:

```bash
# Run all apps in dev mode
bun dev

# Or run individually:
bun --filter @horo/web dev    # Frontend on port 3000
bun --filter @horo/api dev    # Backend on port 3001
```

## Application Flow

### Onboarding (8 Steps)

1. **Welcome Animation** - Full-screen video with mystical eye animation
2. **Name Input** - User enters their name
3. **Birth Date** - Custom Buddhist Era date picker (day/month/year wheels)
4. **Gender** - Male/Female selection (needed for Bazi calculation)
5. **Birth Time** - Thai time period selector (12 periods) or "don't know"
6. **Teaser Result** - IMMEDIATE AI-generated fortune preview (BEFORE auth)
7. **Auth Prompt** - Google/X OAuth or skip as guest
8. **Dashboard** - Main app

### Main Screens

- **Daily Horoscope** - Today's fortune, lucky numbers/colors, element energy
- **Full Chart** - Complete Bazi Four Pillars, 10-year luck cycles, deep reading
- **Compatibility** - Relationship compatibility analysis (viral feature)
- **Profile** - Visual fortune card (shareable)

## Authentication Architecture

**CRITICAL SECURITY**: All auth is server-side only via Elysia

- Supabase `service_role` key NEVER exposed to client
- OAuth flows handled entirely by backend
- Session stored in httpOnly cookie
- Access tokens never in localStorage or client JavaScript

### Flow:

1. Client calls `GET /auth/login?provider=google`
2. Elysia generates OAuth URL with Supabase
3. User authenticates with provider
4. Provider redirects to `/auth/callback?code=xxx`
5. Elysia exchanges code for session
6. Session stored in httpOnly cookie
7. Redirect to dashboard

## Design System

### Colors

- `#0A0A0F` - Void Black (primary background)
- `#0F0A1A` - Deep Night (cards)
- `#1A0A2E` - Dark Purple (secondary backgrounds)
- `#6B21A8` - Royal Purple (primary accent, buttons)
- `#A855F7` - Amethyst (hover states)
- `#F5F5F5` - Ghost White (primary text)
- `#A1A1AA` - Ash Gray (secondary text)

### Typography

- Thai body: Noto Sans Thai
- Thai headings: Prompt
- English: Space Grotesk
- Oracle voice: Sarabun (weight 200)
- Mono: JetBrains Mono

### Vibe

- Dark mode ONLY
- Mysterious, sacred, slightly unsettling
- "Entering a temple at midnight"
- Film grain overlay on all screens
- NO emojis, NO cartoons, NO rounded/bubbly UI
- Thai language first, uses "เจ้า" (thou) for narrator voice

## Astrology Calculation Engines

### Current Status: PLACEHOLDER/STUB

The packages in `packages/astrology/` are currently placeholder implementations that return mock data.

**TODO**: Implement full calculation algorithms:

- **Bazi (Four Pillars)**:
  - Solar-lunar calendar conversion
  - Stem-branch calculation
  - Day Master (日主) determination
  - Element strength analysis
  - 10-year luck cycles (大運)

- **Thai Astrology**:
  - Day-of-week characteristics
  - Buddha position mapping
  - Life rhythm analysis
  - Lucky attributes

- **Compatibility**:
  - Element interaction (生克制化)
  - Branch relationships (六合, 三合, 六冲, etc.)
  - Compatibility scoring

## API Endpoints

### Auth
- `GET /auth/login?provider={google|x}` - Initiate OAuth
- `GET /auth/callback?code={code}` - OAuth callback
- `POST /auth/logout` - Clear session
- `GET /auth/me` - Get current user

### Fortune
- `POST /fortune/teaser` - Generate teaser result (pre-auth)
- `POST /fortune/profile` - Save birth profile
- `GET /fortune/daily` - Get daily reading

## Development Notes

### Mobile-First

- Design at 375px first
- Touch targets minimum 44px
- No hover-only interactions

### Performance Targets

- < 3s first meaningful paint on 4G
- Welcome video optimized (H.265/VP9)

### Testing

Astrology calculation engines must have unit tests once implemented.

## Deployment

### Frontend (Next.js)

Deploy to Vercel or any Node.js hosting:

```bash
cd apps/web
bun run build
bun run start
```

### Backend (Elysia)

Deploy to any Bun-compatible hosting:

```bash
cd apps/api
bun run build
bun run start
```

### Environment Variables

Ensure all production environment variables are set:
- Use strong JWT secrets
- Set `NODE_ENV=production`
- Configure CORS for production frontend URL
- Enable Secure cookies

## Contributing

1. Follow existing code patterns
2. Keep functions small and focused
3. Write descriptive variable names
4. Comment WHY, not WHAT
5. Test astrology calculations thoroughly

## License

Proprietary - All rights reserved
