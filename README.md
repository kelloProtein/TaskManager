## Task Manager

A full-stack to-do task management application with a .NET Core API and React frontend, built as a production-ready MVP.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 10 |
| Database | EF Core + SQLite |
| Frontend | React + TypeScript (Vite) |

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

**Demo credentials:** `demo` / `Password123!`

The SQLite database (`tasks.db`) is created automatically on first run. Press `Ctrl+C` to stop both servers.

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

## MVP Features

- Task CRUD with a Kanban board (Todo / In Progress / Done)
- Status cycling, priority levels (Low/Medium/High), and optional due dates with overdue highlighting
- Search and filter by keyword and priority
- JWT authentication — login required, all task endpoints protected
- Input validation on both frontend and backend
- Swagger UI with Bearer token support for API testing
- Responsive layout
- React error boundary — unexpected errors show a message rather than a blank screen

## What I Would Add Next

1. **User management** — Add/Update/Delete User, database-backed users with bcrypt/Argon2 password hashing, per-user task ownership via a `UserId` FK, and role-based access control. The hardcoded demo user was a scoping decision to keep the focus on the JWT mechanism itself.
2. **Project field** — Add a `Project` field to each task so users can organize and scope tasks by project.
3. **Filter by Project** — Add filtering controls to the UI so users can view tasks scoped to a specific project.
4. **User-configurable columns** — Allow users to customize the board columns to align with their development lifecycles (e.g., Backlog / Ready / Dev / Testing / Review / Done) instead of the fixed Todo / In Progress / Done layout.
5. **Refresh tokens** — the current 60-minute access token has no renewal path, so users lose their session during long work sessions with no recovery. A short-lived access token paired with a long-lived HttpOnly refresh cookie would fix this.
6. **Pagination** — `GET /api/tasks` currently returns all tasks unbounded. At scale this needs cursor-based pagination on the API and infinite scroll or virtual scrolling on the frontend.
7. **Database migrations** — replace `EnsureCreated()` with EF Core migrations so schema changes can be applied incrementally without data loss.
8. **Rate limiting** — protect the login endpoint from brute-force attempts and the task API from abuse.

## Design Decisions

**Kanban board layout.** The spec says "to-do task management" which could be a flat list. I chose a Kanban board (Todo / In Progress / Done columns) because status is the primary dimension users care about when scanning their tasks, and the column layout makes drag-and-drop a natural future enhancement. The "New Task" form lives in its own column so creating and viewing happen in the same viewport without modal interruption.

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
├── components/      ← React UI components
├── hooks/           ← useTasks, useAuth — state management and API orchestration
├── services/        ← taskApi, authApi — HTTP clients wrapping all API calls
└── types/           ← TypeScript interfaces mirroring backend DTOs
```

The backend follows the **Controller → Service → Repository** pattern. Controllers handle HTTP concerns only — no business logic. Services own all business rules and are what the tests target. Repositories abstract EF Core behind an interface so services can be tested with mocks without touching a real database.

The frontend mirrors this: `taskApi.ts` and `authApi.ts` centralize all HTTP calls, `useTasks` and `useAuth` manage state, and components stay presentational.

## Testing Approach

**Backend (16 tests):** Tests target the service layer — the layer that owns business logic. `TaskServiceTests` mocks `ITaskRepository` to verify behavior like "status is always Todo on creation" and "title whitespace is trimmed" without touching a database. `AuthServiceTests` verifies token generation and credential rejection against a real JWT parser. Controllers are thin enough that testing them separately would just re-test ASP.NET routing.

**Frontend (46 tests):** Tests are organized by layer. `taskApi.test.ts` verifies the HTTP client sends the right method/path/payload by mocking axios. `useTasks.test.tsx` and `useAuth.test.tsx` verify state management (optimistic list updates, error handling, filter-triggered refetches) by mocking the API layer. Component tests (`TaskCard`, `TaskForm`, `EditTaskDialog`, `FilterBar`, `LoginForm`) use Testing Library to verify rendering and user interactions from the user's perspective — clicking, typing, selecting.

The goal was to test *behavior that could break* — business rules, state transitions, and user interactions — not implementation details or framework wiring.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Authenticate and receive a JWT token |
| GET | `/api/tasks` | ✓ | List tasks (supports `?status=`, `?priority=`, `?search=`) |
| GET | `/api/tasks/{id}` | ✓ | Get a single task |
| POST | `/api/tasks` | ✓ | Create a task |
| PUT | `/api/tasks/{id}` | ✓ | Full update |
| PATCH | `/api/tasks/{id}/status` | ✓ | Quick status toggle |
| DELETE | `/api/tasks/{id}` | ✓ | Delete a task |

To test in Swagger: call `/api/auth/login`, copy the token, click **Authorize**, and paste it.

## Scalability

The current design is intentionally simple for a single-user MVP, but the architecture doesn't create scaling problems:

- **Data layer is swappable.** The repository pattern means moving from SQLite to PostgreSQL is a one-line change in `Program.cs` — no business logic changes required.
- **Service layer is stateless.** No in-memory state between requests, so the API can scale horizontally behind a load balancer without session-stickiness concerns.
- **The main bottleneck is `GET /api/tasks`.** It returns all tasks in one query with no limit. At scale this needs cursor-based pagination on the API and virtual scrolling or infinite scroll on the frontend.
- **Auth scales as-is.** JWT is stateless — the server validates the token on each request without a session store, so there's nothing to synchronize across instances.

## Trade-offs and Assumptions

**SQLite over in-memory database.** EF Core's in-memory provider doesn't support transactions or relational constraints. SQLite gives a real database with zero setup and data that persists across restarts.

**No pagination.** `GET /api/tasks` returns all tasks. For a single-user MVP this is fine. At scale this needs cursor-based pagination on the API and infinite scroll on the frontend.

**Global error middleware instead of per-controller try/catch.** Every unhandled exception returns a consistent `{ "error": "..." }` shape. In production this would feed into a structured logging service like Serilog or Application Insights.

**Hardcoded credentials.** Production would store users in a database with bcrypt or Argon2-hashed passwords. Hardcoded credentials kept the scope on the JWT mechanism itself.

**No refresh tokens.** The access token expires after 60 minutes with no renewal path. Production would pair a short-lived access token with a long-lived refresh token in an HttpOnly cookie.

**localStorage for token storage.** Vulnerable to XSS. The safer alternative is an HttpOnly cookie, which trades XSS immunity for needing CSRF protection. For a demo with no user-generated content, localStorage is acceptable.

**No user-scoped task data.** All authenticated users share the same task list. In production, `TaskItem` would carry a `UserId` FK and all queries would filter by the authenticated user's `sub` claim.

**Delete uses `window.confirm()`.** A native browser dialog is simple and accessible, but a custom inline confirmation (e.g., undo toast) would feel more polished. Good enough for an MVP.

**JWT signing key committed to source control.** Acceptable for a demo. Production would use environment variables or a secrets manager.

## Security

- **JWT with full token validation** — issuer, audience, lifetime, and signing key all validated on every request (HMAC-SHA256)
- **Constant-time credential comparison** — SHA256 hashes both sides before `FixedTimeEquals` so comparison time is independent of input length
- **Username enumeration prevention** — login returns the same generic error whether the username or password was wrong
- **Failed login logging** — bad attempts log at Warning level; JWT validation failures also logged, both without exposing credentials

