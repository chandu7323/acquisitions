# Docker Setup for Acquisitions API

This guide explains how to run the Acquisitions API with Docker using different configurations for development and production environments.

## Overview

The application supports two distinct deployment modes:

- **Development**: Uses Neon Local (PostgreSQL proxy) running in Docker
- **Production**: Connects to Neon Cloud Database (serverless PostgreSQL)

## Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+
- Git

## Quick Start

### Development Environment (Neon Local)

1. **Clone and navigate to the project**:
   ```bash
   git clone <your-repo-url>
   cd acquisitions
   ```

2. **Start development environment**:
   ```bash
   npm run docker:dev
   ```
   
   This command:
   - Builds the app with development target
   - Starts Neon Local PostgreSQL proxy
   - Runs database migrations
   - Starts the app with hot reloading
   
3. **Access the application**:
   - API: http://localhost:3000
   - Health check: http://localhost:3000/health
   - API docs: http://localhost:3000/api

4. **Stop development environment**:
   ```bash
   npm run docker:dev:down
   ```

### Production Environment (Neon Cloud)

1. **Configure environment variables**:
   ```bash
   # Create production environment file
   cp .env.production .env.prod.local
   
   # Edit with your actual values
   export DATABASE_URL=postgres://neon:npg@neon-local:5432/acquisitions?sslmode=require
   export JWT_SECRET="your-secure-jwt-secret"
   export ARCJET_KEY=ajkey_01kksby45hf78tnhpzyhnqqp23
   ```

2. **Start production environment**:
   ```bash
   npm run docker:prod
   ```

3. **Stop production environment**:
   ```bash
   npm run docker:prod:down
   ```

## Environment Configuration

### Development (.env.development)

```env
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Neon Local Proxy Requirements
# Get these from your Neon project settings
NEON_API_KEY=<your_neon_api_key>
NEON_PROJECT_ID=<your_neon_project_id>

# Database Configuration - Points to the Docker service name
DATABASE_URL=postgres://neon:npg@neon-local:5432/acquisitions?sslmode=disable

# JWT Configuration
JWT_SECRET=dev-jwt-secret-change-in-production-12345
# Arcjet Configuration
ARCJET_KEY=ajkey_01kksby45hf78tnhpzyhnqqp23
```

### Production (.env.production)

```env
# Server Configuration
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Database Configuration - Neon Cloud
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require

# JWT Configuration
JWT_SECRET=your-production-jwt-secret-very-long-and-secure

# Arcjet Configuration
ARCJET_KEY=your-production-arcjet-key
```

## Docker Architecture

### Multi-Stage Dockerfile

The `Dockerfile` uses multi-stage builds with four stages:

1. **dependencies**: Production dependencies only
2. **development**: All dependencies + development tools
3. **build**: Build stage for production
4. **production**: Optimized production image

### Development Setup (docker-compose.dev.yml)

```yaml
services:
  neon-local:    # PostgreSQL proxy for local development
  app:           # Application with hot reloading
  migrate:       # Database migration service
```

**Features**:
- Neon Local PostgreSQL proxy
- Hot reloading with volume mounts
- Automatic migrations
- Development logging
- Health checks

### Production Setup (docker-compose.prod.yml)

```yaml
services:
  app:           # Optimized production app
  migrate:       # Production migrations
  nginx:         # Reverse proxy (optional)
```

**Features**:
- Connects to Neon Cloud Database
- Optimized production build
- Resource limits
- Log rotation
- Optional nginx reverse proxy

## Available Commands

### NPM Scripts

```bash
# Development
npm run dev                 # Local development (no Docker)
npm run docker:dev          # Docker development environment
npm run docker:dev:down     # Stop development environment

# Production
npm run start              # Local production start
npm run docker:prod        # Docker production environment
npm run docker:prod:down   # Stop production environment

# Database
npm run db:generate        # Generate migrations
npm run db:migrate         # Run migrations
npm run db:studio          # Open Drizzle Studio

# Docker Build
npm run docker:build       # Build development image
npm run docker:build:prod  # Build production image
```

### Direct Docker Commands

```bash
# Development
docker-compose -f docker-compose.dev.yml up --build
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose -f docker-compose.prod.yml up --build -d
docker-compose -f docker-compose.prod.yml down

# Build specific targets
docker build --target development -t acquisitions:dev .
docker build --target production -t acquisitions:prod .
```

## Database Setup

### Development with Neon Local

Neon Local automatically:
- Creates a PostgreSQL database
- Sets up user credentials
- Handles connection pooling
- Provides branch-like functionality for development

### Production with Neon Cloud

1. **Create Neon Database**:
   - Sign up at https://neon.tech
   - Create a new project
   - Copy the connection string

2. **Configure Environment**:
   ```bash
   export DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
   ```

3. **Run Migrations**:
   ```bash
   docker-compose -f docker-compose.prod.yml run migrate
   ```

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Database Connection Issues**:
   ```bash
   # Check Neon Local logs
   docker-compose -f docker-compose.dev.yml logs neon-local
   
   # Test database connection
   docker-compose -f docker-compose.dev.yml exec neon-local pg_isready -U neondb_owner
   ```

3. **Migration Issues**:
   ```bash
   # Run migrations manually
   docker-compose -f docker-compose.dev.yml run migrate
   
   # Reset database (development only)
   docker-compose -f docker-compose.dev.yml down -v
   docker-compose -f docker-compose.dev.yml up --build
   ```

### Logs and Debugging

```bash
# View application logs
docker-compose -f docker-compose.dev.yml logs app

# View all logs
docker-compose -f docker-compose.dev.yml logs

# Follow logs in real-time
docker-compose -f docker-compose.dev.yml logs -f app
```

## Security Considerations

### Development
- Uses weak passwords (acceptable for local development)
- Debug logging enabled
- No SSL/TLS required

### Production
- Strong JWT secrets required
- Production Arcjet keys
- SSL/TLS connections to Neon Cloud
- Resource limits enforced
- Log rotation configured

## Deployment

### Local Production Testing

```bash
# Set production environment variables
export DATABASE_URL="your-neon-cloud-url"
export JWT_SECRET="your-secure-secret"
export ARCJET_KEY="your-production-key"

# Start production stack
npm run docker:prod
```

### Cloud Deployment

The production Docker Compose can be used with:
- Docker Swarm
- Kubernetes (with kompose conversion)
- Cloud services (AWS ECS, Google Cloud Run, Azure Container Instances)

Example for AWS ECS task definition generation:
```bash
# Convert docker-compose to ECS format
ecs-cli compose --file docker-compose.prod.yml convert
```

## Monitoring and Health Checks

### Health Endpoints

- **Application**: `GET /health`
- **API Status**: `GET /api`
- **Root**: `GET /`

### Docker Health Checks

Both development and production configurations include:
- Application health checks
- Database connection verification
- Automatic restart policies

### Logs

Logs are written to:
- **Console**: Structured JSON logs via Winston
- **Files**: `./logs/` directory (mounted as volume)
- **Docker**: Standard Docker logging drivers

## Performance Optimization

### Production Optimizations

- Multi-stage builds reduce image size
- Node.js production mode
- Resource limits prevent memory leaks
- Log rotation prevents disk space issues
- Health checks enable automatic recovery

### Development Optimizations

- Volume mounts for hot reloading
- Development dependencies included
- Debug logging for troubleshooting
- Quick restart on file changes