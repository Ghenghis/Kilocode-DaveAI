# Kilo Code Web Application Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
COPY packages/app/package.json ./packages/app/
COPY packages/kilo-ui/package.json ./packages/kilo-ui/
COPY packages/kilo-i18n/package.json ./packages/kilo-i18n/
COPY packages/kilo-telemetry/package.json ./packages/kilo-telemetry/

# Install bun
RUN npm install -g bun@1.3.10

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY packages/app/src ./packages/app/src/
COPY packages/app/public ./packages/app/public/
COPY packages/kilo-ui/src ./packages/kilo-ui/src/
COPY packages/kilo-i18n/src ./packages/kilo-i18n/src/
COPY packages/kilo-telemetry/src ./packages/kilo-telemetry/src/

# Build the application
RUN bun run --cwd packages/app build

# Production stage
FROM nginx:alpine AS production

# Copy built application
COPY --from=base /app/packages/app/dist /usr/share/nginx/html/

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Set environment
ENV NODE_ENV=production
ENV KILO_WEB_VERSION=7.1.9

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Labels
LABEL org.opencontainers.image.title="Kilo Code Web Application"
LABEL org.opencontainers.image.description="Web interface for Kilo Code AI development platform"
LABEL org.opencontainers.image.version="7.1.9"
LABEL org.opencontainers.image.vendor="Kilo Code"
LABEL org.opencontainers.image.licenses="MIT"

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
