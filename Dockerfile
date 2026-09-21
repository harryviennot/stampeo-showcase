# syntax=docker/dockerfile:1

FROM oven/bun:1.3.5 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Build the application
# Node, not Bun: `next build` fails under the Bun runtime, which cannot load
# Next 16's turbopack CommonJS runtime chunks.
# Debian-based to match the glibc node_modules produced by the deps stage.
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_COOKIE_DOMAIN
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SHOWCASE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
# Meta pixel (STA-319). Not a secret — it ships in the client bundle. Leave
# UNSET to disable the pixel entirely: the loader no-ops and never contacts
# connect.facebook.net. Setting it is NOT sufficient to make the tag fire; the
# visitor's marketing consent (lib/consent.ts) and a trackable route
# (lib/consent-routes.ts) are also required. Production value: 1088158323750710
# Documented here rather than in .env.example, which is gitignored.
ARG NEXT_PUBLIC_META_PIXEL_ID
# GA4 measurement id (STA-318). Not a secret — it ships in the client bundle.
# Leave UNSET to disable Google Analytics entirely: the loader no-ops and never
# contacts googletagmanager.com. Setting it is NOT sufficient to make the tag
# fire; the visitor's ANALYTICS consent (lib/consent.ts) and a trackable route
# (lib/consent-routes.ts) are also required. Production value: G-ZFZ6JLPFXN
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_COOKIE_DOMAIN=$NEXT_PUBLIC_COOKIE_DOMAIN
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_SHOWCASE_URL=$NEXT_PUBLIC_SHOWCASE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY
ENV NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST
ENV NEXT_PUBLIC_META_PIXEL_ID=$NEXT_PUBLIC_META_PIXEL_ID
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_TELEMETRY_DISABLED=1

RUN ./node_modules/.bin/next build

# Production image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
