# ==============================================================================
# Multi-Stage Dockerfile for Trilho (Next.js & Node.js 24)
# Optimized for GCP Cloud Run, AWS AppRunner/ECS, Azure Container Apps & Local
# ==============================================================================

# STAGE 1: Dependencies Stage
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json ./
RUN npm ci

# STAGE 2: Builder Stage
FROM node:24-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure public directory exists for runner COPY instruction
RUN mkdir -p public

# Environment variables for build time
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

RUN npm run build

# STAGE 3: Final Runtime Stage (Security Hardened & Non-Root)
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Create non-root user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets and standalone Next.js server build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE ${PORT}

CMD ["node", "server.js"]
