# Railway Deployment Setup - Summary

## What Was Created

This Railway deployment setup enables independent deployments of your monorepo services with proper separation of concerns.

### Configuration Files Created

#### API Service (`/apps/api/`)
- **Dockerfile** - Multi-stage Docker build for production API deployment
- **railway.toml** - Railway configuration with watch paths for independent deployment
- **.dockerignore** - Optimizes Docker build by excluding unnecessary files

#### Web Service (`/apps/web/`)
- **Dockerfile** - Multi-stage Docker build for Next.js standalone deployment
- **railway.toml** - Railway configuration with watch paths for independent deployment
- **.dockerignore** - Optimizes Docker build by excluding unnecessary files

#### Deployment Scripts (`/deployment/`)
- **scripts/migrate.sh** - Execute database migrations
- **scripts/generate-migration.sh** - Generate new migrations locally
- **scripts/test-docker-build.sh** - Test Docker builds locally before deploying
- **Dockerfile.migrate** - Docker image for running migrations as Railway job
- **railway-migrate.toml** - Railway config for migration one-off job

#### Documentation (`/deployment/`)
- **README.md** - Comprehensive deployment guide with troubleshooting
- **QUICKSTART.md** - Quick reference for common tasks
- **DEPLOYMENT_SUMMARY.md** - This file
- **.env.railway.template** - Environment variables template
- **railway-template.json** - Base Railway configuration template

#### Modified Files
- **apps/web/next.config.ts** - Added `output: 'standalone'` for Docker deployment
- **apps/api/src/index.ts** - Added `/health` endpoint for Railway health checks
- **packages/db/package.json** - Added `db:migrate` script

---

## How the Deployment Structure Works

### Independent Deployments

Each service monitors specific paths for changes:

#### API Service Deploys When:
- `apps/api/**` changes
- `packages/db/**` changes (database schema)
- `packages/shared/**` changes (shared types/utils)
- `packages/astrology/**` changes (business logic)

#### Web Service Deploys When:
- `apps/web/**` changes
- `packages/ui/**` changes (UI components)
- `packages/shared/**` changes (shared types/utils)

**Result**: Updating the API doesn't trigger a Web rebuild, and vice versa. Only relevant services redeploy when their dependencies change.

### Service Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Railway Project                    │
├──────────────┬──────────────┬──────────────┬────────┤
│  PostgreSQL  │  API Service │  Web Service │ Migrate│
│   Database   │   (Backend)  │  (Frontend)  │  Job   │
├──────────────┼──────────────┼──────────────┼────────┤
│ Managed by   │ Port: 3000   │ Port: 3000   │ One-off│
│ Railway      │ Elysia + Bun │ Next.js      │ Job    │
│              │              │              │        │
│ Automatic    │ Health: /    │ Health: /    │ Manual │
│ backups      │ health       │              │ trigger│
└──────────────┴──────────────┴──────────────┴────────┘
```

### Build Process

Both services use multi-stage Docker builds:

1. **Base Stage**: Sets up Bun runtime
2. **Dependencies Stage**: Installs all workspace dependencies
3. **Builder Stage**: Compiles/builds the application
4. **Runner Stage**: Minimal production image with only runtime assets

**Benefits**:
- Smaller final images (only production dependencies)
- Faster deployments (cached layers)
- Secure (no build tools in production)

### Database Management

- **Schema**: Defined in `/packages/db/src/schema/`
- **Migrations**: Stored in `/packages/db/drizzle/`
- **Execution**: Run via Railway one-off job or local script

**Only the API service** connects to the database for runtime operations. The Web service communicates with the API via REST endpoints.

---

## How to Run Migrations Independently

### Option 1: Railway One-Off Job (Production)

1. Create a migration service in Railway:
   - Service name: `migrate`
   - Root directory: `/deployment`
   - Dockerfile: `Dockerfile.migrate`
   - Type: One-off Job

2. Set environment:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

3. Trigger manually when needed from Railway dashboard

### Option 2: Local Script (Development/Manual)

```bash
# Set database URL
export DATABASE_URL="your-railway-postgres-url"

# Run migrations
./deployment/scripts/migrate.sh
```

### Migration Workflow

```
┌──────────────────────────────────────────────────┐
│  1. Update Schema                                 │
│     packages/db/src/schema/*.ts                   │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│  2. Generate Migration                            │
│     ./deployment/scripts/generate-migration.sh    │
│     Creates SQL in packages/db/drizzle/           │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│  3. Commit Migration                              │
│     git add packages/db/drizzle/                  │
│     git commit -m "Add migration"                 │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│  4. Push to Repository                            │
│     git push                                      │
│     (API auto-deploys if db package changed)      │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│  5. Run Migration                                 │
│     Railway Job OR ./scripts/migrate.sh           │
└──────────────────────────────────────────────────┘
```

---

## How to Deploy Each Service Independently

### Automatic Deployment (Recommended)

Railway automatically deploys when you push changes:

```bash
# Deploy API only
git add apps/api/
git commit -m "Update API endpoint"
git push
# → API redeploys, Web untouched

# Deploy Web only
git add apps/web/
git commit -m "Update UI component"
git push
# → Web redeploys, API untouched

# Deploy both (shared dependency changed)
git add packages/shared/
git commit -m "Update shared types"
git push
# → Both redeploy (both depend on shared)
```

### Manual Deployment

Force a deployment via Railway CLI:

```bash
# API
cd apps/api
railway up --service api

# Web
cd apps/web
railway up --service web
```

### Testing Builds Locally

Before pushing, test builds work:

```bash
# Test API build
./deployment/scripts/test-docker-build.sh api

# Test Web build
./deployment/scripts/test-docker-build.sh web

# Test migration build
./deployment/scripts/test-docker-build.sh migrate
```

---

## Important Considerations

### 1. Watch Paths Configuration

The `railway.toml` watch paths ensure independent deployments. **Do not remove these** or you'll lose deployment isolation.

### 2. Environment Variables

Critical variables required:

**API Service**:
- `DATABASE_URL` - Links to Postgres service
- `FRONTEND_URL` - Must match Web service URL (for CORS)
- `BETTER_AUTH_SECRET` - Must match Web service

**Web Service**:
- `NEXT_PUBLIC_API_URL` - Must match API service URL
- `BETTER_AUTH_SECRET` - Must match API service

**Both**:
- Must use `https://` URLs in production
- Update URLs after Railway generates service domains

### 3. Database Access

- Only API service should have `DATABASE_URL`
- Web service accesses data through API endpoints
- Never expose database directly to frontend

### 4. Health Checks

Railway monitors these endpoints:
- API: `https://your-api.railway.app/health`
- Web: `https://your-web.railway.app/`

If health checks fail, Railway restarts the service.

### 5. Monorepo Context

Dockerfiles build from **project root** context to access all workspace packages. The `COPY` commands in Dockerfiles copy from root, not service directory.

### 6. Standalone Output

Next.js is configured with `output: 'standalone'` which:
- Creates self-contained build in `.next/standalone/`
- Includes only necessary dependencies
- Reduces image size significantly
- Required for efficient Docker deployment

---

## Next Steps

1. **Set up Railway project**
   - Create project at https://railway.app
   - Add PostgreSQL database
   - Note database connection string

2. **Create services**
   - API service pointing to `/apps/api`
   - Web service pointing to `/apps/web`
   - Migration job pointing to `/deployment`

3. **Configure environment variables**
   - Use `/deployment/.env.railway.template` as reference
   - Set all required variables in Railway dashboard
   - Link services using `${{ServiceName.VARIABLE}}` syntax

4. **Deploy**
   - Push code to repository
   - Railway auto-deploys services
   - Run migration job to initialize database

5. **Verify**
   - Check health endpoints
   - Test API endpoints
   - Access Web application
   - Monitor logs

6. **Set up CI/CD** (Optional)
   - Railway auto-deploys from Git by default
   - Add GitHub Actions for tests before deploy
   - Configure staging environments

---

## Troubleshooting Resources

- **Full documentation**: `/deployment/README.md`
- **Quick reference**: `/deployment/QUICKSTART.md`
- **Environment template**: `/deployment/.env.railway.template`
- **Railway docs**: https://docs.railway.app
- **Railpack docs**: https://railpack.com

---

## File Structure

```
horo/
├── apps/
│   ├── api/
│   │   ├── .dockerignore          ← Optimizes API Docker build
│   │   ├── Dockerfile             ← API production build
│   │   ├── railway.toml           ← API Railway config
│   │   └── src/
│   │       └── index.ts           ← Added /health endpoint
│   └── web/
│       ├── .dockerignore          ← Optimizes Web Docker build
│       ├── Dockerfile             ← Web production build
│       ├── railway.toml           ← Web Railway config
│       └── next.config.ts         ← Added standalone output
├── deployment/
│   ├── .env.railway.template      ← Environment variables template
│   ├── Dockerfile.migrate         ← Migration job Docker build
│   ├── railway-migrate.toml       ← Migration job config
│   ├── railway-template.json      ← Base Railway config
│   ├── README.md                  ← Full deployment guide
│   ├── QUICKSTART.md              ← Quick reference
│   ├── DEPLOYMENT_SUMMARY.md      ← This file
│   └── scripts/
│       ├── migrate.sh             ← Run migrations
│       ├── generate-migration.sh  ← Create new migrations
│       └── test-docker-build.sh   ← Test builds locally
└── packages/
    └── db/
        ├── drizzle/               ← Migration SQL files
        ├── src/schema/            ← Database schema definitions
        └── package.json           ← Added db:migrate script
```

---

## Summary

You now have a complete Railway deployment setup with:

✅ **Independent deployments** - Services deploy only when their code changes
✅ **Isolated database management** - Only API accesses database
✅ **Migration support** - Run migrations independently via job or script
✅ **Production-ready Dockerfiles** - Multi-stage builds with health checks
✅ **Complete documentation** - Guides for setup, deployment, and troubleshooting
✅ **Development tools** - Scripts to test builds locally
✅ **Clean organization** - All deployment files in `/deployment` folder

The setup follows Railway best practices and provides a scalable foundation for your monorepo.
