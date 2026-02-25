# Horo - Thai Fortune Telling App

A mobile-first fortune-telling application combining Chinese Astrology (Bazi) and Thai Astrology, built for the Thai market.

## Tech Stack

- **Monorepo**: Turborepo
- **Runtime**: Bun
- **Frontend**: Next.js 16 (App Router, React Server Components)
- **Backend**: Elysia (Bun-native)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better Auth (OAuth 2.0 with Google & Twitter)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (customized)
- **Animations**: Framer Motion
- **AI**: Google Gemini 2.5 Flash

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
- Google OAuth 2.0 credentials
- Twitter OAuth 2.0 credentials
- Google Gemini API key

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
# - DATABASE_URL=postgresql://user:password@localhost:5432/horo
# - OAUTH_BASE_URL=http://localhost:3001
# - GOOGLE_CLIENT_ID=your-google-client-id
# - GOOGLE_CLIENT_SECRET=your-google-client-secret
# - TWITTER_CLIENT_ID=your-twitter-client-id
# - TWITTER_CLIENT_SECRET=your-twitter-client-secret
# - GEMINI_API_KEY=your-gemini-api-key
# - FRONTEND_URL=http://localhost:3000
```

#### Frontend (`apps/web/.env`):

```bash
cd apps/web
cp .env.example .env
# Edit .env:
# - NEXT_PUBLIC_API_URL=http://localhost:3001
```

**See `BETTER_AUTH_SETUP.md` for detailed OAuth setup instructions.**

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

**Better Auth** with OAuth 2.0 (Google & Twitter)

- Server-side authentication via Better Auth
- Direct integration with Drizzle ORM
- Automatic session management
- OAuth flows handled by Better Auth middleware
- Session stored in httpOnly cookies
- No manual JWT management needed

### Flow:

1. User clicks "Sign in with Google/X" on frontend
2. Frontend calls `signIn.social({ provider: 'google', callbackURL: '/dashboard' })`
3. Better Auth redirects to OAuth provider
4. User authenticates with provider
5. Provider redirects to `/api/auth/callback/google`
6. Better Auth creates session and user in database
7. Session stored in httpOnly cookie
8. Redirects to dashboard

### Key Features:

- ✅ Automatic database table creation (user, session, account, verification)
- ✅ Built-in session refresh
- ✅ Type-safe React hooks (`useSession`, `signIn`, `signOut`)
- ✅ No external auth service needed
- ✅ Fully customizable

See `BETTER_AUTH_SETUP.md` for detailed setup instructions.

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

### Auth (Better Auth - Auto-generated)
- `POST /api/auth/sign-in/social` - Initiate OAuth flow
- `GET /api/auth/callback/google` - Google OAuth callback
- `GET /api/auth/callback/twitter` - Twitter OAuth callback
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session

### Fortune
- `POST /fortune/teaser` - Generate teaser result (pre-auth)
- `POST /fortune/profile` - Save birth profile
- `GET /fortune/daily` - Get daily reading
- `GET /fortune/chart` - Get full Bazi chart
- `POST /fortune/compatibility` - Calculate compatibility

### Invites (Viral Feature)
- `POST /invite/create` - Create compatibility invite link
- `GET /invite/:token` - Get invite details
- `POST /invite/:token/use` - Accept invite and calculate compatibility

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

### Recommended: Railway (All Services)

Deploy frontend, backend, and database to Railway for a unified platform.

**Quick Start:**
1. See `RAILWAY_DEPLOYMENT.md` - Comprehensive deployment guide
2. See `RAILWAY_CHECKLIST.md` - Step-by-step checklist
3. See `RAILWAY_AUTO_MIGRATE.md` - Auto-migration details

**Features:**
- ✅ Auto-migrations on every deploy
- ✅ Private networking between services
- ✅ Automatic HTTPS and domains
- ✅ Built-in monitoring and logs
- ✅ ~$11-12/month (after $5 free credit)

**Quick Deploy:**
```bash
# 1. Create Railway project
# 2. Deploy PostgreSQL
# 3. Deploy API service (uses railway.toml)
# 4. Deploy Web service (uses apps/web/railway.json)
# 5. Configure environment variables
# 6. Done!
```

### Alternative: Vercel + Railway

Deploy frontend to Vercel and backend to Railway:
- See `DEPLOYMENT.md` for detailed instructions
- Frontend on Vercel (free tier)
- Backend + Database on Railway (~$5-10/month)

### Manual Deployment

**Frontend:**
```bash
cd apps/web
bun run build
bun run start  # Runs on port 3000
```

**Backend:**
```bash
cd apps/api
bun run build
bun run start  # Runs on port 3001
```

**Database Migrations:**
```bash
cd packages/db
bun run db:push  # Push schema changes
```

### Environment Variables (Production)

Ensure these are set:
- `NODE_ENV=production`
- CORS configured for production frontend URL
- OAuth redirect URIs match production URLs
- Database URL uses SSL connection
- All secrets are secure

## Contributing

1. Follow existing code patterns
2. Keep functions small and focused
3. Write descriptive variable names
4. Comment WHY, not WHAT
5. Test astrology calculations thoroughly

## License

Proprietary - All rights reserved
