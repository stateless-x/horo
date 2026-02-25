# Horo - Quick Start Guide

## 📁 Project Overview

Complete fortune-telling app with 52 TypeScript files across:
- ✅ 4 shared packages (shared, astrology, db, ui)
- ✅ 2 applications (web, api)
- ✅ 8-step onboarding flow
- ✅ 3 dashboard screens
- ✅ Server-side auth with Supabase
- ✅ Tailwind CSS 4 dark theme
- ✅ All dependencies installed

## 🚀 Development Setup (5 minutes)

### 1. Environment Variables

**Backend** (`apps/api/.env`):
```bash
PORT=3001
NODE_ENV=development

DATABASE_URL=postgresql://user:password@localhost:5432/horo
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-random-32-char-secret
ANTHROPIC_API_KEY=sk-ant-your-key
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`apps/web/.env`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Database Setup

```bash
# From project root
cd packages/db
bun run db:generate  # Generate migrations
bun run db:push      # Push to database
```

### 3. Run Development

```bash
# From project root
bun dev

# Opens:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:3001
```

## 📂 File Structure

```
horo/
├── apps/
│   ├── web/                           # Next.js 16 Frontend
│   │   ├── src/app/                   # App Router pages
│   │   │   ├── page.tsx               # → Onboarding flow
│   │   │   ├── dashboard/page.tsx     # → Daily horoscope
│   │   │   ├── dashboard/chart/       # → Full Bazi chart
│   │   │   └── dashboard/compatibility/ # → Compatibility
│   │   ├── src/components/onboarding/ # 8 onboarding steps
│   │   ├── src/stores/                # Zustand stores
│   │   └── src/lib/                   # API client, TanStack Query
│   │
│   └── api/                           # Elysia Backend
│       ├── src/routes/auth.ts         # OAuth flow (server-side)
│       ├── src/routes/fortune.ts      # Fortune endpoints
│       └── src/lib/                   # Supabase, DB, Claude
│
├── packages/
│   ├── shared/                        # Types, constants, utils
│   │   ├── src/types/                 # Zod schemas
│   │   ├── src/constants/             # Colors, Thai time
│   │   └── src/utils/                 # Date helpers
│   │
│   ├── astrology/                     # 🚧 PLACEHOLDER - Need implementation
│   │   ├── src/bazi.ts                # Bazi calculator (stub)
│   │   ├── src/thai.ts                # Thai astrology (stub)
│   │   └── src/compatibility.ts       # Compatibility (stub)
│   │
│   ├── db/                            # Drizzle ORM
│   │   ├── src/schema/                # Database tables
│   │   └── drizzle.config.ts          # Migration config
│   │
│   └── ui/                            # Shared components
│       └── src/components/            # Button, Card, Input, OracleText
│
├── public/
│   └── horo.webm                      # Welcome video animation
│
├── README.md                          # Full documentation
├── SETUP.md                           # Implementation details
└── QUICKSTART.md                      # This file
```

## 🎯 Key Features Implemented

### Onboarding Flow (8 Steps)
1. ✅ Welcome video animation (horo.webm)
2. ✅ Name input with auto-focus
3. ✅ Buddhist Era date picker (custom, NOT native)
4. ✅ Gender selection (male/female cards)
5. ✅ Thai time period selector (12 periods)
6. ✅ **Teaser result** - AI fortune BEFORE auth
7. ✅ Auth prompt (Google/X OAuth or skip)
8. ✅ Redirect to dashboard

### Dashboard Screens
- ✅ **Daily Horoscope** - Fortune, lucky numbers, element energy
- ✅ **Full Chart** - Four Pillars, 10-year cycles
- ✅ **Compatibility** - Partner analysis, score, strengths/challenges

### Security
- ✅ Server-side auth only (Supabase service_role NEVER on client)
- ✅ httpOnly session cookies
- ✅ OAuth handled entirely by backend
- ✅ JWT secret for cookie signing

### Design System
- ✅ Dark purple theme (Void Black #0A0A0F)
- ✅ Thai fonts (Noto Sans Thai, Prompt, Sarabun)
- ✅ Film grain overlay CSS
- ✅ Framer Motion animations
- ✅ Mobile-first responsive

## 🚧 What Needs Implementation

### CRITICAL: Astrology Calculations
All functions in `packages/astrology/` are stubs returning mock data.

**Need to implement:**
1. **Bazi (四柱命理)**
   - Solar-lunar calendar conversion
   - Stem-branch (干支) calculation
   - Day Master (日主) determination
   - Five elements analysis
   - 大運 (10-year cycles)

2. **Thai Astrology**
   - Day-of-week attributes (partial done)
   - Life rhythm analysis
   - Auspicious period calculation

3. **Compatibility**
   - Element interaction rules (生克制化)
   - Branch relationships (六合, 三合, 六冲)
   - Scoring algorithm

### Features to Add
- Shareable card generation (server-side rendering)
- Guest user local storage → auth migration
- Daily reading cron job (midnight Bangkok time)
- Compatibility invite flow (viral feature)
- Profile screen with visual fortune card

## 🔧 Common Commands

```bash
# Install dependencies
bun install

# Type check all packages
bun run type-check

# Build for production
bun run build

# Run database studio
cd packages/db && bun run db:studio

# Run specific app only
bun --filter @horo/web dev    # Frontend
bun --filter @horo/api dev    # Backend
```

## 🐛 Troubleshooting

### "Database connection failed"
- Check DATABASE_URL in apps/api/.env
- Ensure PostgreSQL is running
- Run migrations: `cd packages/db && bun run db:push`

### "Supabase auth error"
- Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
- Configure OAuth providers in Supabase dashboard
- Set redirect URLs: `http://localhost:3000/auth/callback`

### "Claude API error"
- Verify ANTHROPIC_API_KEY is valid
- Check API limits at console.anthropic.com

### TypeScript errors
- Run `bun install` to ensure all deps installed
- Delete .next and dist folders, rebuild
- Check tsconfig.json paths are correct

## 📞 Next Steps

1. **Setup environment variables** (see section 1)
2. **Create database and run migrations**
3. **Start dev servers** (`bun dev`)
4. **Test onboarding flow** at http://localhost:3000
5. **Implement astrology calculations** (see SETUP.md)

## 📚 Documentation

- **README.md** - Full technical documentation
- **SETUP.md** - Detailed implementation notes
- **QUICKSTART.md** - This quick reference

## 🎨 Design Specs

**Colors:**
- #0A0A0F - Void Black (background)
- #6B21A8 - Royal Purple (buttons)
- #A855F7 - Amethyst (hover)
- #F5F5F5 - Ghost White (text)

**Fonts:**
- Noto Sans Thai (body)
- Prompt (headings)
- Sarabun 200 (oracle voice)

**Mobile-first:**
- Design at 375px
- Touch targets ≥ 44px
- No hover-only interactions

---

Built with ❤️ following the product brief exactly.
Ready for astrology calculation implementation!
