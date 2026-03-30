# Kilo Code Desktop Application Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
COPY packages/desktop/package.json ./packages/desktop/
COPY packages/kilo-ui/package.json ./packages/kilo-ui/
COPY packages/kilo-i18n/package.json ./packages/kilo-i18n/

# Install bun
RUN npm install -g bun@1.3.10

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY packages/desktop/src ./packages/desktop/src/
COPY packages/kilo-ui/src ./packages/kilo-ui/src/
COPY packages/kilo-i18n/src ./packages/kilo-i18n/src/

# Build the application
RUN bun run --cwd packages/desktop build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install bun
RUN npm install -g bun@1.3.10

# Copy built application
COPY --from=base /app/packages/desktop/dist ./dist/
COPY --from=base /app/node_modules ./node_modules/

# Set environment
ENV NODE_ENV=production
ENV KILO_DESKTOP_VERSION=7.1.9

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/index.js --version || exit 1

# Labels
LABEL org.opencontainers.image.title="Kilo Code Desktop Application"
LABEL org.opencontainers.image.description="Desktop application for Kilo Code AI development platform"
LABEL org.opencontainers.image.version="7.1.9"
LABEL org.opencontainers.image.vendor="Kilo Code"
LABEL org.opencontainers.image.licenses="MIT"

# Default command
CMD ["node", "dist/index.js"]
