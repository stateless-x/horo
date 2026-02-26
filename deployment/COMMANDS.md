# Railway Deployment - Command Reference

## Setup Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link project to Railway
railway link

# Open Railway dashboard
railway open
```

## Service Deployment

```bash
# Deploy API service
cd apps/api
railway up --service api

# Deploy Web service
cd apps/web
railway up --service web

# View service status
railway status
```

## Environment Variables

```bash
# List all variables for a service
railway variables --service api
railway variables --service web

# Set a variable
railway variables set KEY=value --service api

# Set multiple variables
railway variables set \
  DATABASE_URL=postgres://... \
  PORT=3000 \
  --service api

# Remove a variable
railway variables delete KEY --service api
```

## Logs and Monitoring

```bash
# View live logs
railway logs --service api
railway logs --service web

# Follow logs (tail -f)
railway logs --service api --follow

# Filter logs
railway logs --service api | grep ERROR
```

## Database Operations

```bash
# Connect to Railway Postgres
railway connect postgres

# Run SQL query
railway run psql -c "SELECT * FROM users;"

# Export database URL
railway variables get DATABASE_URL --service api
```

## Migration Commands

```bash
# Generate new migration (local)
cd /Users/purin/dev/horo
export DATABASE_URL="<your-db-url>"
./deployment/scripts/generate-migration.sh

# Run migrations (local)
./deployment/scripts/migrate.sh

# Run migrations (Railway job)
# → Go to Railway dashboard
# → Find "migrate" service
# → Click "Run Job"
```

## Testing and Development

```bash
# Test Docker build locally
./deployment/scripts/test-docker-build.sh api
./deployment/scripts/test-docker-build.sh web
./deployment/scripts/test-docker-build.sh migrate

# Run API container locally
docker run -p 3000:3000 --env-file apps/api/.env.local horo-api:test

# Run Web container locally
docker run -p 3000:3000 --env-file apps/web/.env.local horo-web:test
```

## Git Workflow

```bash
# Deploy API only
git add apps/api/
git commit -m "Update API"
git push
# → Railway auto-deploys API

# Deploy Web only
git add apps/web/
git commit -m "Update Web"
git push
# → Railway auto-deploys Web

# Deploy both (shared change)
git add packages/shared/
git commit -m "Update shared types"
git push
# → Railway auto-deploys both API and Web
```

## Health Checks

```bash
# Check API health
curl https://your-api-service.railway.app/health

# Check Web health
curl https://your-web-service.railway.app/

# Check API info
curl https://your-api-service.railway.app/
```

## Useful Railway CLI Commands

```bash
# List all services
railway service list

# Switch between services
railway service

# View service domains
railway domain

# Restart a service
railway restart --service api

# Delete a service
railway service delete

# View project info
railway info

# Run command in Railway environment
railway run npm test

# Shell into service environment
railway shell
```

## Quick Troubleshooting

```bash
# Check service status
railway status

# View recent deployments
railway deployment list

# View deployment logs
railway logs --deployment <deployment-id>

# Rollback to previous deployment
railway rollback <deployment-id>

# Check environment variables
railway variables --service api
railway variables --service web

# Test database connection
railway connect postgres
# Then: \dt to list tables
```

## Environment Variable Patterns

```bash
# Reference another service variable
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Reference service URL
API_URL=${{api.RAILWAY_PUBLIC_DOMAIN}}

# Set service-specific variable
railway variables set NODE_ENV=production --service api

# Copy variable between services
API_SECRET=$(railway variables get BETTER_AUTH_SECRET --service api)
railway variables set BETTER_AUTH_SECRET=$API_SECRET --service web
```

## Migration Workflow

```bash
# 1. Update schema
vim packages/db/src/schema/users.ts

# 2. Generate migration
export DATABASE_URL="<railway-db-url>"
./deployment/scripts/generate-migration.sh

# 3. Commit migration
git add packages/db/drizzle/
git commit -m "Add user email column"

# 4. Push (triggers API deployment)
git push

# 5. Run migration
./deployment/scripts/migrate.sh
# OR trigger Railway migration job
```

## Docker Commands

```bash
# Build API image
cd /Users/purin/dev/horo/apps/api
docker build -t horo-api:test -f Dockerfile ../..

# Build Web image
cd /Users/purin/dev/horo/apps/web
docker build -t horo-web:test -f Dockerfile ../..

# Build Migration image
cd /Users/purin/dev/horo/deployment
docker build -t horo-migrate:test -f Dockerfile.migrate ..

# Run container with env file
docker run -p 3000:3000 --env-file .env.local horo-api:test

# Run container with env vars
docker run -p 3000:3000 \
  -e DATABASE_URL="postgres://..." \
  -e PORT=3000 \
  horo-api:test

# Shell into container
docker run -it --entrypoint /bin/bash horo-api:test

# View container logs
docker logs <container-id>

# Clean up
docker system prune -a
```

## Monitoring Commands

```bash
# View service metrics
railway metrics --service api

# Check build time
railway deployment list --service api

# Monitor deployment
railway logs --service api --follow --deployment <id>

# Check service health
watch -n 5 'curl -s https://your-api.railway.app/health | jq'
```

## Emergency Commands

```bash
# Immediate restart
railway restart --service api

# Rollback to previous version
railway deployment list --service api
railway rollback <previous-deployment-id>

# Scale service (if needed)
railway scale --service api --replicas 2

# View crash logs
railway logs --service api --deployment <crashed-id>

# Force redeploy
railway up --service api --force
```

## Documentation Shortcuts

```bash
# View main guide
cat /Users/purin/dev/horo/deployment/README.md

# View quick reference
cat /Users/purin/dev/horo/deployment/QUICKSTART.md

# View deployment summary
cat /Users/purin/dev/horo/deployment/DEPLOYMENT_SUMMARY.md

# View this command reference
cat /Users/purin/dev/horo/deployment/COMMANDS.md

# View environment template
cat /Users/purin/dev/horo/deployment/.env.railway.template
```

---

## Pro Tips

1. **Always check logs first**: `railway logs --service <name>`
2. **Test builds locally**: Use `test-docker-build.sh` before pushing
3. **Keep migrations in sync**: Commit and run migrations immediately
4. **Monitor deployments**: Watch logs during deployment with `--follow`
5. **Use environment references**: `${{ServiceName.VARIABLE}}` for cross-service refs
6. **Check health endpoints**: Verify services are healthy after deployment
7. **Document environment changes**: Update `.env.railway.template` when adding vars
8. **Use Railway dashboard**: Some operations are easier in the web UI
9. **Enable notifications**: Get alerts for failed deployments
10. **Keep Railway CLI updated**: `npm update -g @railway/cli`

---

For detailed explanations, see:
- Full guide: `/deployment/README.md`
- Quick start: `/deployment/QUICKSTART.md`
- Summary: `/deployment/DEPLOYMENT_SUMMARY.md`
