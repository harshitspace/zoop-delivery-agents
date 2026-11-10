# Delivery Agent Management System

A full-stack web application for managing delivery agents with full CRUD operations, server-side search and pagination, Redis caching, and cookie-based authentication.

**Live demo:** https://zoop.harshitspace.in
**API base:** https://api.zoop.harshitspace.in

- Frontend: Next.js (App Router, JavaScript) — deployed on Vercel
- Backend: Node.js + Express (JavaScript, ESM) — deployed on Render
- Database: MySQL (Aiven, managed)
- Cache: Redis (Render Key Value in production, Memurai/Redis locally)

---

## Table of contents

- [Tech stack and decisions](#tech-stack-and-decisions)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Database setup and migrations](#database-setup-and-migrations)
- [Running locally](#running-locally)
- [API reference](#api-reference)
- [Authentication](#authentication)
- [Redis caching strategy](#redis-caching-strategy)
- [Testing the CRUD flows](#testing-the-crud-flows)
- [Deployment](#deployment)

---

## Tech stack and decisions

**Database — MySQL (InnoDB).** The data is a structured, relational record with clear fields and uniqueness constraints (email, phone). A relational database is the natural fit, and MySQL with the InnoDB engine gives ACID transactions, row-level locking, and foreign-key support. Uniqueness is enforced at the database level so integrity holds even under concurrent writes.

**Raw SQL, no ORM.** Queries are written by hand with the `mysql2` driver using parameterized placeholders (`?`), which keeps the data layer explicit and safe from SQL injection. Schema changes are applied through hand-written `.sql` migration files so the exact DDL is versioned and reviewable.

**Layered-but-lean structure.** Routes delegate to controllers; a thin model file holds all SQL. For a single resource, dedicated service/repository layers would be indirection without payoff, so the SQL lives in one readable model file instead.

**Validation — Zod.** Request bodies and query parameters are validated with Zod schemas applied through a small reusable middleware.

**No Docker locally.** For a single service with local MySQL and Redis, Docker adds operational weight without benefit. Render builds the backend from source.

---

## Project structure

```
zoop-assignment/
├── backend/
│   ├── src/
│   │   ├── config/ (implicit via env)
│   │   ├── controllers/     agent + auth request handlers
│   │   ├── db/              pool, redis client, SSL helper, migration runner + .sql
│   │   ├── middlewares/     validation, auth, error handling
│   │   ├── models/          raw SQL data-access
│   │   ├── routes/          agent + auth routers
│   │   ├── utils/           ApiError, ApiResponse, asyncHandler, cache helpers
│   │   ├── validators/      Zod schemas
│   │   ├── constants.js
│   │   ├── app.js           express app wiring
│   │   └── server.js        startup + graceful shutdown
│   ├── .env.sample
│   └── package.json
└── frontend/
    ├── app/                 App Router pages (list, new, [id], [id]/edit, login)
    ├── components/          AgentForm, Header, AuthProvider, Skeleton
    ├── lib/api.js           API client
    └── package.json
```

---

## Prerequisites

- Node.js 20+ (tested on 22)
- MySQL 8.x (local) or a managed MySQL
- Redis (local): on Windows use Memurai, or Redis via WSL/Docker

---

## Environment variables

### Backend (`backend/.env`)

Copy `backend/.env.sample` to `backend/.env` and fill in values. No secrets are committed.

| Variable | Description | Example (local) |
|---|---|---|
| `PORT` | Server port (Render injects its own) | `8000` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | *(your password)* |
| `DB_NAME` | Database name | `delivery_agents` |
| `DB_SSL` | `true` for managed MySQL that requires SSL | `false` |
| `DB_CA_PATH` | Path to a CA cert file (local, for Aiven) | `./certs/aiven-ca.pem` |
| `DB_CA_CERT` | Inline CA cert PEM (prod, where no file exists) | *(PEM contents)* |
| `REDIS_URL` | Redis connection URL | `redis://127.0.0.1:6379` |
| `CACHE_TTL_SECONDS` | Cache TTL in seconds | `60` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |
| `JWT_SECRET` | Secret for signing JWTs | *(long random string)* |
| `ADMIN_USERNAME` | Login username | `admin` |
| `ADMIN_PASSWORD` | Login password | `admin123` |
| `COOKIE_SECURE` | `true` in production (HTTPS-only cookie) | `false` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Example (local) |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL | `http://localhost:8000` |

> Local note: use `localhost` (not `127.0.0.1`) for the API base so the auth cookie is treated as same-site over HTTP during local development.

---

## Database setup and migrations

Migrations are plain `.sql` files in `backend/src/db/migrations/`, applied in filename order by a small runner.

```bash
cd backend
npm install
npm run migrate
```

The runner creates the database if it does not exist, then applies each migration. The `agents` table:

| Column | Type | Notes |
|---|---|---|
| `id` | `INT AUTO_INCREMENT PRIMARY KEY` | surrogate key |
| `full_name` | `VARCHAR` NOT NULL | |
| `phone` | `VARCHAR` NOT NULL UNIQUE | stored as 10 digits; `+91` shown in UI |
| `email` | `VARCHAR` NOT NULL UNIQUE | |
| `service_area` | `VARCHAR` NOT NULL | |
| `status` | `ENUM('active','inactive')` DEFAULT `active` | |
| `created_at` | `TIMESTAMP` DEFAULT `CURRENT_TIMESTAMP` | |
| `updated_at` | `TIMESTAMP` ... `ON UPDATE CURRENT_TIMESTAMP` | auto-maintained |

Duplicate email/phone inserts are rejected by the unique constraints and surfaced as HTTP `409`.

---

## Running locally

Two terminals.

**Backend**
```bash
cd backend
npm install
npm run migrate   # one-time (and whenever migrations change)
npm run dev       # http://localhost:8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
```

Make sure Redis is running locally (`redis-cli ping` → `PONG`).

---

## API reference

Base path: `/api/agents`. Routes use explicit action names.

| Method | Route | Auth | Description | Success |
|---|---|---|---|---|
| POST | `/api/agents/createAgent` | required | Create an agent | `201` |
| GET | `/api/agents/getAgents` | required | List agents (search, filter, pagination) | `200` |
| GET | `/api/agents/getAgent/:id` | required | Get one agent | `200` |
| PUT | `/api/agents/updateAgent/:id` | required | Update an agent | `200` |
| DELETE | `/api/agents/deleteAgent/:id` | required | Delete an agent | `200` |

**List query parameters** (`GET /api/agents/getAgents`):

| Param | Type | Default | Description |
|---|---|---|---|
| `search` | string | — | matches full_name, phone, email, or service_area |
| `status` | `active`\|`inactive` | — | exact status filter |
| `page` | int ≥ 1 | `1` | page number |
| `limit` | int 1–100 | `10` | page size |

List response shape:
```json
{
  "statusCode": 200,
  "data": {
    "agents": [ /* ... */ ],
    "pagination": { "page": 1, "limit": 10, "total": 20, "totalPages": 2 }
  },
  "message": "Agents fetched successfully",
  "success": true
}
```

**Auth routes** (`/api/auth`):

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Log in with `{ username, password }`; sets httpOnly cookie |
| POST | `/api/auth/logout` | Clear the auth cookie |
| GET | `/api/auth/me` | Returns `{ authenticated, username }` |

**Status codes:** `201` create, `200` read/update/delete, `400` validation, `401` unauthenticated, `404` not found, `409` duplicate email/phone, `500` server error. Errors return `{ statusCode, success, message, details }`.

---

## Authentication

Write operations (create, update, delete) require authentication, and read operations (list, get one) are also protected — every agent route requires a valid session. The flow:

1. `POST /api/auth/login` with credentials from `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
2. On success the server signs a JWT and sets it in an **httpOnly cookie** (not readable by JavaScript, reducing XSS risk).
3. Protected routes verify the cookie via middleware.
4. In production the cookie is `Secure` + `SameSite=None` (set `COOKIE_SECURE=true`) so it works across the frontend and API subdomains over HTTPS.

All agent routes (including reads) require authentication.

**Test credentials** (demo): `admin` / `admin123`. The login page has a "Use test credentials" option to reveal and autofill them.

---

## Redis caching strategy

Pattern: **cache-aside**. The database is the source of truth; the cache is an optimization that the app can lose without breaking.

**What is cached:** only the default agent list view — page 1, default page size, no search, no status filter — under the key `agents:default`. Single-agent reads are cached under `agents:<id>`.

- Filtered, searched, or non-default pages are **not** cached. This keeps cache keys from multiplying across every query combination and keeps invalidation simple.

**Read path** (via a `getOrSetCache` helper): check Redis → on hit return it → on miss query MySQL, store with a TTL, return.

**Invalidation on writes:**
- Create → delete `agents:default`
- Update → delete `agents:<id>` and `agents:default`
- Delete → delete `agents:<id>` and `agents:default`

**TTL:** `CACHE_TTL_SECONDS` (default 60s) as a safety net so data self-heals even if an invalidation is ever missed.

**Resilience:** all cache operations are wrapped so a Redis failure logs and falls through to MySQL — a cache error is treated as a cache miss.

---

## Testing the CRUD flows

Manual testing with the running backend (login first to get the cookie). Using `curl` with a cookie jar:

```bash
# Login (stores cookie in cookies.txt)
curl -c cookies.txt -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Create (uses cookie)
curl -b cookies.txt -X POST http://localhost:8000/api/agents/createAgent \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test Agent","phone":"9876543210","email":"test@example.com","service_area":"Pune","status":"active"}'

# List (search + pagination)
curl -b cookies.txt "http://localhost:8000/api/agents/getAgents?search=test&page=1&limit=10"

# Get one
curl -b cookies.txt http://localhost:8000/api/agents/getAgent/1

# Update
curl -b cookies.txt -X PUT http://localhost:8000/api/agents/updateAgent/1 \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test Agent","phone":"9876543210","email":"test@example.com","service_area":"Mumbai","status":"inactive"}'

# Delete
curl -b cookies.txt -X DELETE http://localhost:8000/api/agents/deleteAgent/1
```

Expected: create `201`, duplicate email/phone `409`, validation error `400`, missing id `404`, unauthenticated write `401`.

Or test through the UI at `http://localhost:3000` after logging in.

---

## Deployment

The app is deployed with the backend on **Render** and the frontend on **Vercel**, both from this single repository (monorepo with `backend/` and `frontend/` subdirectories).

### Managed services
- **MySQL:** Aiven (free tier, SSL required). The backend provides the CA via `DB_CA_CERT` (inline PEM) so TLS verification stays enabled.
- **Redis:** Render Key Value (internal URL).

### Backend (Render Web Service)
- Root Directory: `backend`
- Build: `npm install`
- Start: `npm start`
- Environment variables: all backend variables above, with `DB_SSL=true`, `DB_CA_CERT` set to the Aiven CA PEM, `REDIS_URL` set to the Render Key Value internal URL, `CORS_ORIGIN=https://zoop.harshitspace.in`, and `COOKIE_SECURE=true`.
- Custom domain: `api.zoop.harshitspace.in`.

Run migrations once against the managed DB before first use (locally, with the production DB env vars and `DB_SSL=true`, `DB_CA_PATH` pointing at the downloaded Aiven CA file):
```bash
cd backend
npm run migrate
```

### Frontend (Vercel)
- Root Directory: `frontend`
- Environment variable: `NEXT_PUBLIC_API_BASE_URL=https://api.zoop.harshitspace.in`
- Custom domain: `zoop.harshitspace.in`.

### DNS
- `CNAME zoop` → Vercel target
- `CNAME api.zoop` → Render service hostname

Both platforms issue TLS certificates automatically once DNS resolves.
