# Horo Project - Claude Instructions

## Database Management with Drizzle ORM

### Schema-Push Workflow

This project uses `drizzle-kit push` for database schema management. Push reads TypeScript schema files and applies changes directly to the database — no migration files needed.

### Developer Workflow

1. Edit schema files in `horo-be/lib/db/schema/`
2. (Optional) Test locally: `bun run db:push` against local database
3. Commit and push to git
4. Railway automatically runs `drizzle-kit push` at deploy startup

No `db:generate` step. No migration SQL files to manage.

### CRITICAL: Destructive Changes

`drizzle-kit push` runs **without** `--force` in production. This means:
- **Additive changes** (new table, new column, new index): Applied automatically
- **Destructive changes** (DROP COLUMN, DROP TABLE, type changes): Will prompt, hang in non-interactive Railway, get killed by timeout, and NOT apply

For destructive changes:
1. Apply the destructive SQL manually on the production database first
2. Then push the schema change that matches the new state
3. Or: temporarily add `--force` to deploy command for ONE deploy, then revert immediately

### Commands Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `db:push` | Sync schema to database | Development and production |
| `db:studio` | Open Drizzle Studio GUI | Inspect database |
| `db:generate` | Create migration SQL files | Not used in normal workflow |
| `db:migrate` | Apply migration files | Not used in normal workflow |

### What NOT to Do

- **NEVER** add `--force` permanently to the deploy command
- **NEVER** manually edit the production database without updating schema files to match
- **NEVER** remove columns/tables from schema without handling data first

### What TO Do

- **ALWAYS** edit `lib/db/schema/*.ts` as the source of truth
- **ALWAYS** test schema changes locally before pushing
- **ALWAYS** check Railway deploy logs to confirm push succeeded
- **ALWAYS** handle destructive changes manually before deploying

### Railway Configuration

`drizzle-kit push` runs at container startup via:
- `railway.toml` startCommand: `bunx drizzle-kit push & exec bun dist/index.js`
- Dockerfile CMD: `bunx drizzle-kit push & exec bun dist/index.js`

Push runs in the background (`&`) because drizzle-kit hangs after completion due to an unclosed DB pool. The server starts immediately without waiting for push to exit.

### Troubleshooting

**Schema changes not appearing in database after deploy**
- Check Railway deploy logs for drizzle-kit output
- If push output shows "prompting for confirmation", you have a destructive change — handle manually

**Push fails with connection error**
- Verify `DATABASE_URL` is set in Railway environment variables
- Check if database is reachable from Railway network

**Need to do a destructive change**
1. Backup affected data
2. Run destructive SQL manually on production
3. Update schema files to match new state
4. Deploy — push will see no diff (already in sync)

## General Guidelines

- Check `/docs` if they exist in each repo for additional context
- Use `/lib` or `/utils` for shared, reusable functions
- When unsure, ask the user for confirmation
- Verify integration between frontend (horo-fe) and backend (horo-be) after changes

## Project-Specific Notes

### horo-be (Backend)
- Using Elysia.js framework
- PostgreSQL database on Railway
- Better-auth for authentication
- Redis for caching
- All database operations via Drizzle ORM

### horo-fe (Frontend)
- Integration with horo-be API
- Check API endpoints work after backend changes
