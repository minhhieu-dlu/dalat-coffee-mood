FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund && npm cache clean --force

FROM base AS builder

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build && npm cache clean --force

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/app-path-routes-manifest.json ./.next/app-path-routes-manifest.json
COPY --from=builder /app/.next/routes-manifest.json ./.next/routes-manifest.json
COPY --from=builder /app/.next/build-manifest.json ./.next/build-manifest.json
COPY --from=builder /app/.next/prerender-manifest.json ./.next/prerender-manifest.json
COPY --from=builder /app/.next/server/app-paths-manifest.json ./.next/server/app-paths-manifest.json

EXPOSE 3000

CMD ["node", "server.js"]