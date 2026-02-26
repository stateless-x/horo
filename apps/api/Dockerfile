# Multi-stage build for API service
FROM oven/bun:1.1.38-slim AS base

WORKDIR /app

# Install dependencies stage
FROM base AS deps

# Copy workspace configuration
COPY package.json bun.lock ./
COPY turbo.json ./

# Copy all workspace packages
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install dependencies (including workspace dependencies)
RUN bun install --frozen-lockfile

# Build stage
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/api ./apps/api
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/bun.lock ./bun.lock
COPY --from=deps /app/turbo.json ./turbo.json

# Build the API
WORKDIR /app/apps/api
RUN bun run build

# Production stage
FROM base AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json

# Copy necessary workspace packages (runtime dependencies)
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules

# Set environment to production
ENV NODE_ENV=production
# Do NOT set PORT here - Railway injects it at runtime

EXPOSE 3000

# Health check - use PORT from environment
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD bun run -e 'fetch(`http://localhost:${process.env.PORT || 3000}/health`).then(r => r.ok ? process.exit(0) : process.exit(1))'

# Start the application
CMD ["bun", "run", "dist/index.js"]
