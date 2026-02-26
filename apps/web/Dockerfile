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
ENV PORT=3000

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built Next.js application
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD bun run -e 'fetch("http://localhost:3000").then(r => r.ok ? process.exit(0) : process.exit(1))'

# Start the Next.js application
CMD ["bun", "run", "server.js"]
