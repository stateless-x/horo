# Multi-stage build for Web service (Next.js)
FROM oven/bun:1.1.38-slim AS base

WORKDIR /app

# Install dependencies stage
FROM base AS deps

# Copy workspace configuration
COPY package.json bun.lock ./
COPY turbo.json ./

# Copy all workspace packages
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Install dependencies (including workspace dependencies)
RUN bun install --frozen-lockfile

# Build stage
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/web ./apps/web
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/bun.lock ./bun.lock
COPY --from=deps /app/turbo.json ./turbo.json

# Build the Web application
WORKDIR /app/apps/web
RUN bun run build

# Production stage - Use Node.js 20 for Next.js runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user (alpine uses addgroup/adduser)
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs

# Copy Next.js standalone output
# Next.js standalone preserves monorepo structure
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Set environment to production
ENV NODE_ENV=production
# Do NOT set PORT here - Railway injects it at runtime

EXPOSE 3000

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Start the Next.js standalone server
# Standalone preserves monorepo path structure
CMD ["node", "apps/web/server.js"]
