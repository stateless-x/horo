# Horo Web

Next.js frontend for the Horo fortune-telling application.

## Features

### Onboarding Flow (8 Steps)
1. Welcome animation (video intro)
2. Name input
3. Buddhist Era date picker (custom UI)
4. Gender selection
5. Thai birth time period (12 periods)
6. AI-generated fortune teaser
7. Authentication prompt (Google OAuth or skip)
8. Redirect to dashboard

### Dashboard
- Daily horoscope with lucky numbers and element energy
- Full Bazi chart with Four Pillars and 10-year cycles
- Compatibility analysis with partner

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- Framer Motion (animations)
- Zustand (global state)
- TanStack Query (server state)
- Better Auth (client integration)

## Local Development

```bash
# From project root
bun dev

# Or run only web
bun --filter @horo/web dev
```

Access at http://localhost:3000

## Environment Variables

Create `apps/web/.env`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
BETTER_AUTH_URL=http://localhost:3001
```

For production:
```bash
NEXT_PUBLIC_API_URL=https://your-api.railway.app
BETTER_AUTH_URL=https://your-api.railway.app
```

## Project Structure

```
apps/web/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Onboarding flow
│   │   ├── dashboard/            # Dashboard pages
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── onboarding/           # 8 onboarding step components
│   │   └── dashboard/            # Dashboard components
│   ├── stores/                   # Zustand stores
│   ├── lib/
│   │   ├── api-client.ts         # API utilities
│   │   └── query-client.ts       # TanStack Query setup
│   └── styles/
│       └── globals.css           # Tailwind + custom styles
└── public/                       # Static assets
```

## Key Dependencies

- `@horo/shared` - Shared types and utilities
- `@horo/ui` - Reusable UI components
- `@tanstack/react-query` - Server state management
- `better-auth` - Authentication client
- `zustand` - Client state management
- `framer-motion` - Animations
