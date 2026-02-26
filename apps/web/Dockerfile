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

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN bun run build

# Production stage
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Do NOT set PORT here - Railway injects it at runtime

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built Next.js application
# Standalone mode creates the full monorepo structure in .next/standalone
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Debug: List files to verify structure (remove this after debugging)
RUN ls -la /app && ls -la /app/apps/web/

USER nextjs

EXPOSE 3000

# Health check - use PORT from environment (increased start-period for cold starts)
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD bun run -e 'fetch(`http://localhost:${process.env.PORT || 3000}`).then(r => r.ok ? process.exit(0) : process.exit(1))'

# Start the Next.js application
# In standalone mode, server.js is at apps/web/server.js (maintains monorepo structure)
# Use Bun to run Node.js server (Bun can execute Node.js code)
CMD ["sh", "-c", "echo '=== Starting Next.js Server ===' && echo 'PORT: '${PORT:-3000} && echo 'NODE_ENV: '${NODE_ENV} && echo 'Checking if server.js exists...' && ls -la apps/web/server.js && echo 'Starting server...' && bun apps/web/server.js"]
