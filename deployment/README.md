# Railway Deployment Guide

This guide explains how to deploy the Horo monorepo to Railway with independent deployments for frontend (web) and backend (api).

## Architecture Overview

The deployment setup consists of:
- **Web Service** (`/apps/web`): Next.js frontend application
- **API Service** (`/apps/api`): Elysia backend application
- **Database**: PostgreSQL database managed by Railway
- **Independent Deployments**: Each service deploys only when its relevant files change

## Prerequisites

1. Railway CLI installed: `npm install -g @railway/cli`
2. Railway account: https://railway.app
3. Project cloned locally

## Initial Setup

### 1. Create Railway Project

```bash
# Login to Railway
railway login

# Create a new project
railway init
```

### 2. Add PostgreSQL Database

In Railway dashboard:
1. Click "New" → "Database" → "PostgreSQL"
2. Railway will automatically provision a PostgreSQL instance
3. Note the connection string (available in Variables tab)

### 3. Create Services

You need to create three services in Railway:

#### Service 1: API (Backend)

```bash
# From project root
cd apps/api

# Link to Railway project
railway link

# Create API service
railway up --service api
```

Configuration:
- **Root Directory**: `/apps/api`
- **Builder**: Dockerfile
- **Dockerfile Path**: `Dockerfile`
- **Start Command**: `bun run start`

#### Service 2: Web (Frontend)

```bash
# From project root
cd apps/web

# Link to Railway project
railway link

# Create Web service
railway up --service web
```

Configuration:
- **Root Directory**: `/apps/web`
- **Builder**: Dockerfile
- **Dockerfile Path**: `Dockerfile`
- **Start Command**: `bun run start`

## Environment Variables

### API Service (`/apps/api`)

Required environment variables:

```bash
# Database
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Frontend URL (for CORS)
FRONTEND_URL=https://your-web-service.railway.app

# Better Auth
BETTER_AUTH_SECRET=<generate-random-secret>
BETTER_AUTH_URL=https://your-api-service.railway.app

# Google AI (if using)
GOOGLE_AI_API_KEY=<your-google-ai-key>

# Server
PORT=3000
NODE_ENV=production
```

### Web Service (`/apps/web`)

Required environment variables:

```bash
# API URL
NEXT_PUBLIC_API_URL=https://your-api-service.railway.app

# Better Auth
BETTER_AUTH_URL=https://your-api-service.railway.app
BETTER_AUTH_SECRET=<same-as-api-service>

# Server
PORT=3000
NODE_ENV=production
```

### Setting Environment Variables

In Railway dashboard:
1. Go to your service
2. Click "Variables" tab
3. Add each environment variable
4. Click "Deploy" to apply changes

Or via CLI:

```bash
# For API service
railway variables set DATABASE_URL="${{Postgres.DATABASE_URL}}" --service api
railway variables set FRONTEND_URL="https://your-web.railway.app" --service api

# For Web service
railway variables set NEXT_PUBLIC_API_URL="https://your-api.railway.app" --service web
```

## Database Migrations

### Running Migrations

There are two ways to run migrations:

#### Option 1: Using Railway One-off Job (Recommended)

1. In Railway dashboard, create a new service called "migrate"
2. Configure it:
   - **Root Directory**: `/deployment`
   - **Builder**: Dockerfile
   - **Dockerfile Path**: `Dockerfile.migrate`
   - **Service Type**: One-off Job
3. Set environment variable:
   - `DATABASE_URL=${{Postgres.DATABASE_URL}}`
4. Trigger the job manually when needed

#### Option 2: Using Local Script

```bash
# Set DATABASE_URL from Railway
export DATABASE_URL="your-railway-db-url"

# Run migration
./deployment/scripts/migrate.sh
```

### Generating New Migrations

When you make schema changes:

```bash
# 1. Update schema in packages/db/src/schema/*.ts

# 2. Generate migration locally
export DATABASE_URL="your-local-or-railway-db-url"
./deployment/scripts/generate-migration.sh

# 3. Commit the new migration files
git add packages/db/drizzle/
git commit -m "Add new migration"

# 4. Push to trigger deployment
git push

# 5. Run migration (use one of the methods above)
```

## Deployment Workflow

### Independent Deployments

The services are configured to deploy independently based on file changes:

#### API Service Triggers
Changes to these paths trigger API deployment:
- `apps/api/**`
- `packages/db/**`
- `packages/shared/**`
- `packages/astrology/**`

#### Web Service Triggers
Changes to these paths trigger Web deployment:
- `apps/web/**`
- `packages/ui/**`
- `packages/shared/**`

### Deploying Changes

1. **Make changes** to your code
2. **Commit and push** to your repository
3. **Railway automatically deploys** only the affected services
4. **Run migrations** if schema changed (see above)

### Manual Deployment

Force a deployment via CLI:

```bash
# Deploy API
cd apps/api
railway up --service api

# Deploy Web
cd apps/web
railway up --service web
```

## Monitoring and Logs

### View Logs

```bash
# API logs
railway logs --service api

# Web logs
railway logs --service web

# Database logs
railway logs --service postgres
```

### Health Checks

Both services include health check endpoints:

- **API**: `https://your-api-service.railway.app/health`
- **Web**: `https://your-web-service.railway.app/`

Railway automatically monitors these endpoints and restarts services if unhealthy.

## Troubleshooting

### Build Failures

1. Check Railway logs: `railway logs --service <service-name>`
2. Verify Dockerfile paths are correct
3. Ensure all dependencies are in package.json
4. Check environment variables are set

### Database Connection Issues

1. Verify `DATABASE_URL` is set correctly
2. Check database is running in Railway dashboard
3. Ensure API service has access to database
4. Test connection: `railway connect postgres`

### Migration Issues

1. Check migration files exist in `packages/db/drizzle/`
2. Verify `DATABASE_URL` is set for migration job
3. Check migration logs in Railway dashboard
4. Manual check: `railway connect postgres` then check schema

### CORS Issues

1. Verify `FRONTEND_URL` in API matches your web service URL
2. Check `NEXT_PUBLIC_API_URL` in Web points to API service
3. Ensure both URLs use `https://` (not `http://`)
4. Check Railway service URLs in dashboard

## File Structure

```
horo/
├── apps/
│   ├── api/
│   │   ├── Dockerfile              # API production build
│   │   ├── railway.toml            # Railway config for API
│   │   └── src/
│   └── web/
│       ├── Dockerfile              # Web production build
│       ├── railway.toml            # Railway config for Web
│       └── src/
├── deployment/
│   ├── Dockerfile.migrate          # Migration job Dockerfile
│   ├── railway-migrate.toml        # Migration job config
│   ├── scripts/
│   │   ├── migrate.sh              # Run migrations
│   │   └── generate-migration.sh   # Generate new migrations
│   └── README.md                   # This file
└── packages/
    └── db/
        ├── drizzle/                # Migration files
        └── src/schema/             # Database schema
```

## Best Practices

1. **Always run migrations** after schema changes
2. **Test locally first** before deploying to production
3. **Use Railway variables** for sensitive data (never commit secrets)
4. **Monitor logs** after deployment to catch issues early
5. **Keep migrations in version control** (commit drizzle/ folder)
6. **Use independent deployments** to avoid unnecessary rebuilds
7. **Set up health checks** to ensure services stay online

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railpack Documentation](https://railpack.com)
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations)
- [Next.js Standalone Output](https://nextjs.org/docs/pages/api-reference/next-config-js/output)

## Support

If you encounter issues:
1. Check Railway dashboard for service status
2. Review logs: `railway logs --service <name>`
3. Verify environment variables are set correctly
4. Check this README for troubleshooting steps
