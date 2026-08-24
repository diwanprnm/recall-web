# ── Recall Web Dockerfile ────────────────────────────────────
# Next.js frontend
# Multi-stage: builder compiles, runtime serves via standalone output

FROM node:20-slim AS builder

WORKDIR /app

# Build-time args for NEXT_PUBLIC_* env vars (passed from docker-compose)
ARG NEXT_PUBLIC_API_URL

# Expose build args as env so Next.js inlines them at build time
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# 1. Install dependencies dulu (layer cache stabil — hanya berubah kalau package*.json berubah)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# 2. Copy source code lalu build (tidak merusak cache layer npm ci)
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────
FROM node:20-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001 \
    HOSTNAME="0.0.0.0"

# Copy built output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Non-root user
RUN groupadd -r recall && useradd -r recall -g recall \
    && chown -R recall:recall /app
USER recall

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/', r => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

CMD ["node", "server.js"]

