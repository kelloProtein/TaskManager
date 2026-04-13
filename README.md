# Ezra Task Manager

A full-stack to-do task management application with a .NET Core API and React frontend, built as a production-ready MVP.

## Quick Start

### Prerequisites
- [.NET SDK 10+](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)

### Start everything

```bash
make install   # first time only — installs frontend dependencies
make dev       # starts backend + frontend concurrently
```

- API: `http://localhost:5076` — Swagger UI at `/swagger`
- App: `http://localhost:5173`

The SQLite database (`tasks.db`) is created automatically on first run. Press `Ctrl+C` to stop both servers.

**Demo credentials:** `demo` / `Password123!`

<details>
<summary>Manual start (without make)</summary>

```bash
# Terminal 1 — backend
cd backend/EzraTaskManager.Api
dotnet run --launch-profile http

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```
</details>

### Running Tests

```bash
# Backend (16 tests)
cd backend/EzraTaskManager.Tests
dotnet test

# Frontend (46 tests)
cd frontend
npm test
```

## Features

- **Task CRUD** — create, view, edit, and delete tasks via a Kanban board UI
- **Kanban columns** — tasks organized into Todo, In Progress, and Done lanes
- **Status cycling** — click a task's status badge to advance it through the workflow
- **Priority levels** — Low, Medium, and High priority with color-coded badges
- **Due date tracking** — optional due dates with overdue highlighting in red
- **Search and filter** — filter by priority or keyword across title and description
- **JWT authentication** — all API endpoints protected; login required to access the app
- **Swagger UI** — interactive API explorer with Bearer token auth support
- **Responsive layout** — works on desktop, tablet, and mobile
- **Global error handling** — consistent `{ "error": "..." }` JSON responses across all endpoints
- **Input validation** — enforced on both the frontend (required fields) and backend (DataAnnotations)

## Architecture

```
backend/EzraTaskManager.Api/
├── Controllers/     ← Thin HTTP layer — routes requests, returns responses
├── Services/        ← Business logic — validation, mapping, orchestration
├── Repositories/    ← Data access — EF Core queries, persistence
├── Models/          ← EF Core entities and enums
├── DTOs/            ← API request/response shapes (never expose entities)
├── Data/            ← DbContext configuration
└── Middleware/      ← Global error handling

frontend/src/
├── components/      ← React UI components (TaskCard, TaskForm, FilterBar, EditTaskDialog, LoginForm)
├── hooks/           ← useTasks, useAuth — state management and API orchestration
├── services/        ← taskApi, authApi — HTTP clients wrapping all API calls
└── types/           ← TypeScript interfaces mirroring backend DTOs
```

### Why this layered approach

The backend follows the **Controller → Service → Repository** pattern:

- **Controllers** handle HTTP concerns only (status codes, routing, model validation). No business logic.
- **Services** own all business rules (defaulting new tasks to "Todo" status, trimming input, mapping entities to DTOs). This is the layer tests focus on.
- **Repositories** abstract EF Core behind an interface so the service layer can be unit-tested with mocks instead of a real database.

This is a deliberate choice for testability and separation of concerns. In a larger app, the repository interface also allows swapping the data layer (e.g., moving from SQLite to PostgreSQL) without changing any business logic.

The frontend mirrors this thinking: `taskApi.ts` and `authApi.ts` centralize all HTTP calls, `useTasks.ts` and `useAuth.ts` manage state, and components are purely presentational where possible.

## Authentication

All `/api/tasks` endpoints require a valid JWT bearer token. To authenticate:

1. `POST /api/auth/login` with `{ "username": "demo", "password": "Password123!" }`
2. Copy the `token` from the response
3. Include it in subsequent requests as `Authorization: Bearer <token>`

Tokens expire after 60 minutes. In Swagger UI, click **Authorize** and paste the token to test protected endpoints.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Authenticate and receive a JWT token |
| GET | `/api/tasks` | ✓ | List tasks (supports `?status=`, `?priority=`, `?search=`) |
| GET | `/api/tasks/{id}` | ✓ | Get a single task |
| POST | `/api/tasks` | ✓ | Create a task |
| PUT | `/api/tasks/{id}` | ✓ | Full update (title, description, priority, status, due date) |
| PATCH | `/api/tasks/{id}/status` | ✓ | Quick status toggle |
| DELETE | `/api/tasks/{id}` | ✓ | Delete a task |

## Data Model

| Field | Type | Notes |
|-------|------|-------|
| Id | int | Auto-increment PK |
| Title | string(200) | Required |
| Description | string(2000) | Optional |
| Status | enum | Todo, InProgress, Done |
| Priority | enum | Low, Medium, High |
| DueDate | DateTime? | Optional |
| CreatedAt | DateTime | Set on creation (UTC) |
| UpdatedAt | DateTime | Updated on every write (UTC) |

## Trade-offs and Assumptions

**SQLite over in-memory database.** EF Core's in-memory provider doesn't support transactions or relational constraints. SQLite gives us a real database with zero setup — data persists across server restarts, which is important for a realistic MVP demo.

**No pagination.** `GET /api/tasks` returns all tasks. For an MVP with a single user, this is fine. At scale, this endpoint would need cursor-based pagination and the frontend would need infinite scroll or page controls.

**Enums stored as integers.** Status and priority are stored as int columns in SQLite and serialized as strings in API responses. This avoids string comparison overhead in the database while keeping the API human-readable.

**Global error middleware instead of per-controller try/catch.** Centralizes error handling and ensures every unhandled exception returns a consistent `{ "error": "..." }` JSON response. In production, this would integrate with a structured logging service (Serilog, Application Insights).

**Single CSS file instead of CSS modules or a component library.** For an app this size, plain CSS with BEM-style naming is simpler and more transparent than adding a build-time CSS solution. At scale, CSS modules or Tailwind would prevent class name collisions.

**Frontend status filtering is client-side after the kanban refactor.** The kanban board groups tasks by status visually, so the status filter dropdown was removed. Search and priority filtering still go through the API to avoid fetching unnecessary data.

### Authentication Trade-offs

**Hardcoded credentials.** A production app would store users in a database with bcrypt or Argon2-hashed passwords. Hardcoded credentials keep the scope focused on demonstrating the JWT mechanism itself without building a user management system.

**No refresh tokens.** The access token expires after 60 minutes with no renewal path. Production would use a short-lived access token paired with a long-lived refresh token stored in an HttpOnly cookie. On expiry, the app silently exchanges the refresh token for a new access token.

**localStorage for token storage.** Storing the JWT in `localStorage` is vulnerable to XSS. A more secure approach is an HttpOnly cookie (immune to JavaScript access), which requires CSRF protection in exchange. For a demo with no untrusted user content, `localStorage` is acceptable and simpler to reason about.

**No user-scoped task data.** All authenticated users share the same task list. In production, `TaskItem` would have a `UserId` foreign key and all queries would filter by the authenticated user's `sub` claim.

**No rate limiting on the login endpoint.** Production would add rate limiting (e.g., ASP.NET Core's built-in rate limiter) to prevent brute-force attacks against the credentials.

**JWT signing key in appsettings.json.** The development key is committed to source control, which is acceptable for a demo. Production would load the key from environment variables, `dotnet user-secrets`, or a secrets manager like Azure Key Vault.

## Security Considerations

- **JWT authentication** — all task endpoints require a valid bearer token; tokens are signed with HMAC-SHA256
- **Token validation** — issuer, audience, lifetime, and signing key are all validated on every request
- **Constant-time credential comparison** — `CryptographicOperations.FixedTimeEquals` prevents timing attacks during login
- **Generic error messages** — the login endpoint returns "Invalid username or password" regardless of which field was wrong, preventing username enumeration
- **Auth failure logging** — failed login attempts are logged at Warning level; JWT validation failures are also logged for operational visibility
- **Input validation** — backend uses DataAnnotations (`[Required]`, `[MaxLength]`) to reject malformed input at the API boundary
- **SQL injection** — EF Core parameterizes all queries, including the `LIKE` search pattern
- **CORS** — restricted to `http://localhost:5173` (the dev server); production would lock this to the deployed frontend domain
- **Error masking** — the global error middleware returns generic messages to clients; stack traces are logged server-side only

## What I Would Add Next

1. **User management system** — user registration, profile updates, account deletion, and role-based access control (admin vs. regular user)
2. **Task assignment** — assign tasks to specific users, filter by assignee, per-user task views scoped by the authenticated user's claims
3. **Refresh tokens** — short-lived access tokens paired with long-lived HttpOnly refresh cookies for seamless session renewal
4. **Pagination** — cursor-based API pagination + infinite scroll on the frontend
5. **Drag-and-drop** — reorder tasks within columns and drag between status columns
6. **Optimistic updates** — update the UI immediately and roll back on API failure
7. **Database migrations** — replace `EnsureCreated()` with EF Core migrations for safe schema evolution
8. **Structured logging** — Serilog with Application Insights or similar for production observability
9. **CI/CD** — GitHub Actions pipeline for build, test, and deployment
10. **Rate limiting** — protect the login endpoint and API from abuse
