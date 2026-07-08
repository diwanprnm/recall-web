# ── Recall Web Dockerfile ────────────────────────────────────
# Next.js frontend
# Multi-stage: builder compiles, runtime serves via standalone output

FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source (including .env.local used during build)
COPY . .

# Build standalone output
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────
FROM node:20-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Copy built output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Non-root user
RUN groupadd -r recall && useradd -r recall -g recall \
    && chown -R recall:recall /app
USER recall

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -fsS http://localhost:3000/ || exit 1

CMD ["node", "server.js"]