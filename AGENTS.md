# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

Node.js/Express REST API using ES Modules (`"type": "module"`). Uses Drizzle ORM with a Neon (serverless PostgreSQL) database, Zod for request validation, JWT for auth tokens stored in HTTP-only cookies, and Winston for structured logging.

## Environment

Requires a `.env` file with:

- `DATABASE_URL` — Neon PostgreSQL connection string
- `JWT_SECRET` — secret for signing JWTs
- `PORT` — (optional, defaults to `3000`)
- `NODE_ENV` — controls secure cookie flag and console logging (`production` disables console transport)
- `LOG_LEVEL` — (optional, defaults to `info`)

## Commands

```bash
# Start dev server with file watching (no separate build step)
npm run dev

# Lint / autofix
npm run lint
npm run lint:fix

# Format
npm run format
npm run format:check

# Database — run after changing any model in src/models/
npm run db:generate   # generate a new migration file in drizzle/
npm run db:migrate    # apply pending migrations to the database
npm run db:studio     # open Drizzle Studio UI
```

There is no test script defined yet (ESLint config has Jest globals stubbed out for a future `tests/` directory).

## Architecture

**Entry point flow:** `src/index.js` → loads `.env`, then `src/server.js` → starts the Express app from `src/app.js` on `PORT`.

**Layer structure** (each layer only imports from layers below it):

- `src/routes/` — mounts controllers on Express routers; imported in `app.js`
- `src/controllers/` — validates request body with Zod schemas, calls a service, signs a JWT, sets cookie, returns response
- `src/services/` — business logic; interacts with the database via Drizzle
- `src/models/` — Drizzle table definitions (schema source of truth for `db:generate`)
- `src/validations/` — Zod schemas shared between controllers and (future) middleware
- `src/utils/` — stateless helpers: `jwt.js` (sign/verify), `cookies.js` (set/clear/get with consistent options), `format.js` (Zod error formatting)
- `src/config/` — singletons: `database.js` (Drizzle+Neon client exported as `db`), `logger.js` (Winston instance)

**Path aliases** (defined in `package.json` `"imports"`): Use `#config/*`, `#controllers/*`, `#middleware/*`, `#models/*`, `#routes/*`, `#services/*`, `#utils/*`, `#validations/*` instead of relative paths when importing across layers.

**Auth flow:** `POST /api/auth/sign-up` → controller validates with `signupSchema` → `createUser` service hashes password (bcrypt, 10 rounds) and inserts into `users` table → JWT signed with `{id, email, role}`, expiry `1d` → token set as `httpOnly` cookie (15-min `maxAge` in cookie options, note this conflicts with the 1d JWT expiry).

**Logging:** Winston writes JSON to `logs/error.log` (errors only) and `logs/combined.log` (all levels). Console transport is added when `NODE_ENV !== 'production'`. Morgan HTTP access logs are piped through `logger.info`.

## Code Style

ESLint enforces: 2-space indent, single quotes, semicolons, `prefer-const`, `no-var`, `object-shorthand`, `prefer-arrow-callback`. Unused vars prefixed with `_` are allowed. Run `npm run lint:fix` before committing.
