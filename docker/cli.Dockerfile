# Kilo Code CLI Dockerfile
FROM oven/bun:1.3.10-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
COPY packages/opencode/package.json ./packages/opencode/
COPY packages/kilo-telemetry/package.json ./packages/kilo-telemetry/
COPY packages/kilo-gateway/package.json ./packages/kilo-gateway/
COPY packages/kilo-i18n/package.json ./packages/kilo-i18n/
COPY packages/plugin/package.json ./packages/plugin/
COPY packages/util/package.json ./packages/util/
COPY packages/kilo-ui/package.json ./packages/kilo-ui/
COPY packages/sdk/js/package.json ./packages/sdk/js/

RUN bun install --frozen-lockfile --production

# Copy source code
COPY packages/opencode/src ./packages/opencode/src/
COPY packages/kilo-telemetry/src ./packages/kilo-telemetry/src/
COPY packages/kilo-gateway/src ./packages/kilo-gateway/src/
COPY packages/kilo-i18n/src ./packages/kilo-i18n/src/
COPY packages/plugin/src ./packages/plugin/src/
COPY packages/util/src ./packages/util/src/
COPY packages/kilo-ui/src ./packages/kilo-ui/src/
COPY packages/sdk/js/src ./packages/sdk/js/src/

# Build the application
RUN bun run --cwd packages/opencode build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install bun
RUN npm install -g bun@1.3.10

# Copy built application
COPY --from=base /app/packages/opencode/dist ./dist/
COPY --from=base /app/node_modules ./node_modules/

# Create CLI entry point
RUN echo '#!/usr/bin/env node' > /usr/local/bin/kilo && \
    echo 'require("/app/dist/cli.js")' >> /usr/local/bin/kilo && \
    chmod +x /usr/local/bin/kilo

# Set environment
ENV NODE_ENV=production
ENV KILO_CLI_VERSION=7.1.9

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD kilo --version || exit 1

# Labels
LABEL org.opencontainers.image.title="Kilo Code CLI"
LABEL org.opencontainers.image.description="AI-powered development CLI with enterprise features"
LABEL org.opencontainers.image.version="7.1.9"
LABEL org.opencontainers.image.vendor="Kilo Code"
LABEL org.opencontainers.image.licenses="MIT"

# Expose port (if needed for web interface)
EXPOSE 3000

# Default command
CMD ["kilo", "--help"]
