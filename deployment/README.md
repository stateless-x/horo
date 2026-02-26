# 🚨 Critical Deployment Files - DO NOT DELETE

This folder contains **essential files** required for Railway deployment.

## ⚠️ WARNING

**DO NOT delete or modify files in this folder unless you know exactly what you're doing!**

Deleting these files will break your Railway deployment.

---

## Files in This Folder

### `migrate-and-start.js` ⚡ **CRITICAL**

**Purpose:** Runs database migrations and starts the API server

**Used by:**
- Railway deployment (via `bun run migrate:deploy`)
- Called automatically on every API deployment

**What it does:**
1. Runs `bun run --filter=@horo/db db:push` - Migrates database schema
2. Runs `bun run --filter=@horo/api start` - Starts Elysia API server

**If you delete this:**
- ❌ Railway deployment will fail
- ❌ Database migrations won't run
- ❌ API server won't start
- ❌ Your app will be broken in production

---

## How It's Used

### In `package.json`:
```json
{
  "scripts": {
    "migrate:deploy": "node deployment/migrate-and-start.js"
  }
}
```

### In `apps/api/railway.toml`:
```toml
[deploy]
startCommand = "cd ../.. && bun run migrate:deploy"
```

### Deployment Flow:
```
Railway starts
  ↓
Runs: bun run migrate:deploy
  ↓
Executes: node deployment/migrate-and-start.js
  ↓
1. Migrates database (db:push)
2. Starts API server
  ↓
✅ Deployment complete
```

---

## When You Can Modify

### ✅ Safe to Modify:
- Adding logging/debug statements
- Changing migration strategy (e.g., from `db:push` to `db:migrate`)
- Adding health checks before starting server
- Adding pre-deployment hooks

### ❌ NEVER:
- Delete this file
- Change the file name without updating `package.json`
- Remove the migration step (unless you migrate manually)
- Remove the server start step

---

## Testing Changes

If you modify `migrate-and-start.js`, test locally first:

```bash
# From project root
bun run migrate:deploy
```

This simulates exactly what Railway runs in production.

---

## Troubleshooting

### "migrate:deploy" command not found
- Check that `package.json` has the correct path: `"migrate:deploy": "node deployment/migrate-and-start.js"`

### Migration fails
- Check `DATABASE_URL` environment variable is set
- Check database is accessible
- Check schema in `packages/db/src/schema/` is valid

### Server won't start
- Check build completed successfully
- Check port isn't hardcoded (use `process.env.PORT`)
- Check environment variables are set

---

## Additional Notes

This folder is intentionally kept separate from `scripts/` to prevent accidental deletion of critical deployment files.

**If you accidentally delete this folder:**
1. Restore from git: `git checkout deployment/`
2. Or recreate the file from backup/documentation
3. Commit and redeploy

---

## Summary

✅ **This folder is essential for deployment**
⚠️ **Do not delete or modify without understanding the impact**
📚 **See `RAILWAY_DEPLOYMENT.md` for full deployment documentation**
