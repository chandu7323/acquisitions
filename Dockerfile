# Multi-stage Dockerfile for Node.js Acquisitions App

# Stage 1: Dependencies
FROM node:22-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Development
FROM node:22-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S acquisitions -u 1001

# Change ownership
RUN chown -R acquisitions:nodejs /app
USER acquisitions

# Expose port
EXPOSE 3000

# Development command
CMD ["npm", "run", "dev"]

# Stage 3: Production Build
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies for build
RUN npm ci

# Copy source code
COPY . .

# Stage 4: Production
FROM node:22-alpine AS production

WORKDIR /app

# Copy production dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code from build stage
COPY --from=build /app/src ./src
COPY --from=build /app/package.json ./

# Copy drizzle migrations and config
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/drizzle.config.js ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S acquisitions -u 1001

# Create logs directory
RUN mkdir -p logs && chown -R acquisitions:nodejs /app

ENV NODE_ENV=production
ENV PORT=3000

USER acquisitions

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
