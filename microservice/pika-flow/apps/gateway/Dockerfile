# Multi-stage build for Pika-Flow Gateway Service

# Stage 1: Builder - Install dependencies and build
FROM docker.io/node:lts-alpine AS builder

WORKDIR /workspace

# Enable pnpm
RUN corepack enable

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/gateway/package.json ./apps/gateway/

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code and config files
COPY tsconfig.base.json nx.json ./
COPY apps/gateway ./apps/gateway
COPY libs ./libs

# Build the application using Nx
RUN pnpm exec nx build gateway --prod

# Stage 2: Runtime - Production image
FROM docker.io/node:lts-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/gateway/package.json ./apps/gateway/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder /workspace/apps/gateway/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
