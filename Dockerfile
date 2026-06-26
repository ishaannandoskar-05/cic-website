# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile  — CIC Portal API (Express / Node.js)
#
# Build & run via docker-compose:
#   docker-compose up -d
#
# Or standalone:
#   docker build -t cic-api .
#   docker run -p 5000:5000 --env-file backend/.env cic-api
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine AS base

# Install dumb-init for proper signal handling in containers
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# ── Install dependencies ──────────────────────────────────────────────────────
# Copy package files first to leverage Docker layer caching
COPY backend/package*.json ./

RUN npm ci --omit=dev

# ── Copy application source ───────────────────────────────────────────────────
COPY backend/ .

# ── Create uploads directory ──────────────────────────────────────────────────
RUN mkdir -p public/uploads

# ── Security: run as non-root user ───────────────────────────────────────────
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# ── Expose port ───────────────────────────────────────────────────────────────
EXPOSE 5000

# ── Healthcheck ───────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/ || exit 1

# ── Start ─────────────────────────────────────────────────────────────────────
CMD ["dumb-init", "node", "server.js"]
