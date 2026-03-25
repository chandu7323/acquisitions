# Acquisitions API

A modern, scalable, and secure RESTful API built with Node.js, Express, and Drizzle ORM. Designed for serverless PostgreSQL (Neon) and cloud-native deployments using Docker and Kubernetes.

## 🚀 Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Drizzle ORM
- **Security:** Arcjet, JWT, Bcrypt, Helmet
- **Validation:** Zod
- **Testing:** Jest, Supertest
- **DevOps:** Docker, Docker Compose, Kubernetes

## 📁 Project Structure

The project uses subpath imports for clean module resolution (e.g., `#controllers/userController.js`).

```text
├── k8s/                  # Kubernetes manifests (Deployments, Jobs, Services)
├── scripts/              # Helper shell scripts
├── src/
│   ├── config/           # App configuration and logger
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middlewares (Auth, Arcjet, Error handling)
│   ├── models/           # Drizzle database schemas
│   ├── routes/           # API route definitions
│   ├── services/         # Core business logic
│   ├── utils/            # Helper utilities (JWT, etc.)
│   └── validations/      # Zod validation schemas
├── drizzle.config.js     # Drizzle ORM configuration
├── Dockerfile            # Multi-stage Dockerfile
└── docker-compose.*.yml  # Docker Compose configurations for Dev/Prod
```

## 🛠️ Prerequisites

- Node.js (v18+ recommended)
- Docker & Docker Compose
- Kubernetes cluster (e.g., Minikube, Docker Desktop K8s) & `kubectl`
- A Neon Database Account

## 💻 Local Development

### 1. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgres://neon:npg@neon-local:5432/acquisitions?sslmode=disable"
JWT_SECRET="dev-jwt-secret-change-in-production-12345"
ARCJET_KEY="your-arcjet-key"
```

### 2. Standard Development (Node.js)
Install dependencies and start the watcher:
```bash
npm install
npm run dev
```

### 3. Docker Development
Run the full local stack (App + Neon Local DB + Migrations) using Docker Compose:
```bash
npm run docker:dev
```
Stop the environment:
```bash
npm run docker:dev:down
```

## 🗄️ Database Management

This project uses Drizzle ORM. Manage the database with the following scripts:

```bash
# Generate SQL migration files based on schema changes
npm run db:generate

# Execute migrations against the database
npm run db:migrate

# Launch Drizzle Studio to view and edit data locally
npm run db:studio
```

## 🐳 Production Deployment

### Docker (Standalone)
1. **Build the production image:**
   ```bash
   docker build --target production -t acquisitions-api:latest .
   ```
2. **Run the container:**
   ```bash
   docker run -p 3000:3000 --env-file .env.production -d acquisitions-api:latest
   ```

### Docker Compose
1. Copy `.env.production` to `.env.prod.local` and add real credentials.
2. Start the production stack:
   ```bash
   npm run docker:prod
   # Alternatively: docker compose -f docker-compose.prod.yml up --build -d
   ```

### Kubernetes
The project includes a complete set of manifests in the `/k8s` directory.

1. **Build and push the image:**
   ```bash
   docker build --target production -t <your-dockerhub-username>/acquisitions:latest .
   docker push <your-dockerhub-username>/acquisitions:latest
   ```
2. **Update Secrets:**
   Edit `k8s/secrets.yaml` with your actual Neon Cloud `DATABASE_URL`, `JWT_SECRET`, and `ARCJET_KEY`.
3. **Deploy to Cluster:**
   ```bash
   # Apply secrets
   kubectl apply -f k8s/secrets.yaml
   
   # Run database migrations
   kubectl apply -f k8s/migration-job.yaml
   
   # Deploy the API and Service
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   ```
4. **Verify Deployment:**
   ```bash
   # Watch pods until they are in the Running (1/1) state
   kubectl get pods -w
   
   # View the live application logs
   kubectl logs -f -l app=acquisitions-api
   
   # Forward traffic to test the API locally
   kubectl port-forward svc/acquisitions-service 3000:80
   ```

## 🧪 Testing
Run the Jest test suite:
```bash
npm test
```

## 📝 Code Quality
```bash
npm run lint        # Check for ESLint errors
npm run format      # Format code with Prettier
```