# Ezra Task Manager

A full-stack to-do task management application with a .NET Core API and React frontend, built as a production-ready MVP.

## Quick Start

### Prerequisites
- [.NET SDK 10+](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)

### Backend

```bash
cd backend/EzraTaskManager.Api
dotnet run --launch-profile http
# API available at http://localhost:5076
# Swagger UI at http://localhost:5076/swagger
```

The SQLite database (`tasks.db`) is created automatically on first run.

### Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

### Running Tests

```bash
# Backend (12 tests)
cd backend/EzraTaskManager.Tests
dotnet test

# Frontend (40 tests)
cd frontend
npm test
```

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
├── components/      ← React UI components (TaskCard, TaskForm, FilterBar, EditTaskDialog)
├── hooks/           ← useTasks — state management and API orchestration
├── services/        ← taskApi — HTTP client wrapping all API calls
└── types/           ← TypeScript interfaces mirroring backend DTOs
```

### Why this layered approach

The backend follows the **Controller → Service → Repository** pattern:

- **Controllers** handle HTTP concerns only (status codes, routing, model validation). No business logic.
- **Services** own all business rules (defaulting new tasks to "Todo" status, trimming input, mapping entities to DTOs). This is the layer tests focus on.
- **Repositories** abstract EF Core behind an interface so the service layer can be unit-tested with mocks instead of a real database.

This is a deliberate choice for testability and separation of concerns. In a larger app, the repository interface also allows swapping the data layer (e.g., moving from SQLite to PostgreSQL) without changing any business logic.

The frontend mirrors this thinking: `taskApi.ts` centralizes all HTTP calls, `useTasks.ts` manages state and exposes mutation functions, and components are purely presentational where possible.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks` | List tasks (supports `?status=`, `?priority=`, `?search=`) |
| GET | `/api/tasks/{id}` | Get a single task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/{id}` | Full update (title, description, priority, status, due date) |
| PATCH | `/api/tasks/{id}/status` | Quick status toggle |
| DELETE | `/api/tasks/{id}` | Delete a task |

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

**No authentication.** A real production app needs auth, but it would dominate the codebase and obscure the architectural decisions this assessment is evaluating. Noted as a future requirement.

**No pagination.** `GET /api/tasks` returns all tasks. For an MVP with a single user, this is fine. At scale, this endpoint would need cursor-based pagination and the frontend would need infinite scroll or page controls.

**Enums stored as integers.** Status and priority are stored as int columns in SQLite and serialized as strings in API responses. This avoids string comparison overhead in the database while keeping the API human-readable.

**Global error middleware instead of per-controller try/catch.** Centralizes error handling and ensures every unhandled exception returns a consistent `{ "error": "..." }` JSON response. In production, this would integrate with a structured logging service (Serilog, Application Insights).

**Single CSS file instead of CSS modules or a component library.** For an app this size, plain CSS with BEM-style naming is simpler and more transparent than adding a build-time CSS solution. At scale, CSS modules or Tailwind would prevent class name collisions.

**Frontend status filtering is client-side after the kanban refactor.** The kanban board groups tasks by status visually, so the status filter dropdown was removed. Search and priority filtering still go through the API to avoid fetching unnecessary data.

## Security Considerations

- **Input validation**: Backend uses DataAnnotations (`[Required]`, `[MaxLength]`) to reject malformed input at the API boundary.
- **SQL injection**: EF Core parameterizes all queries, including the `LIKE` search pattern.
- **CORS**: Restricted to `http://localhost:5173` (the dev server). In production, this would be locked to the deployed frontend domain.
- **Error masking**: The global error middleware returns a generic error message to clients — stack traces and internal details are logged server-side only.

## What I Would Add Next

1. **Authentication and authorization** — JWT or cookie-based auth, per-user task ownership
2. **Pagination** — cursor-based API pagination + infinite scroll on the frontend
3. **Drag-and-drop** — reorder tasks within columns and drag between status columns
4. **Optimistic updates** — update the UI immediately and roll back on API failure
5. **Database migrations** — replace `EnsureCreated()` with EF Core migrations for safe schema evolution
6. **Structured logging** — Serilog with Application Insights or similar for production observability
7. **CI/CD** — GitHub Actions pipeline for build, test, and deployment
8. **Rate limiting** — protect the API from abuse
