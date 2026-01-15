# syntax=docker/dockerfile:1

# ========================================
# Base image with Node.js (Debian-slim for Prisma compatibility)
# ========================================
FROM node:22-slim AS base

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# ========================================
# Build the application
# ========================================
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables (placeholders for build)
ENV NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=placeholder
ENV VAPID_PRIVATE_KEY=placeholder
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder

# Generate Prisma client again (in case schema changed)
RUN npx prisma generate

# Build the application
RUN npm run build

# ========================================
# Production image
# ========================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy startup script
COPY start.sh ./start.sh
RUN chmod +x start.sh

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run migrations and start the application
CMD ["./start.sh"]
