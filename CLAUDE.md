# EzraTaskManager — Claude Context

## What This Is
A take-home assessment: full-stack todo task management app.
- Backend: ASP.NET Core 10 Web API
- Database: EF Core + SQLite
- Frontend: React + TypeScript (Vite)

## Project Structure
```
EzraTaskManager/
├── backend/
│   └── EzraTaskManager.Api/     ← ASP.NET Core Web API
│       ├── Controllers/
│       ├── Services/
│       ├── Repositories/
│       ├── Models/               ← EF Core entities
│       ├── DTOs/                 ← API request/response shapes
│       ├── Data/                 ← DbContext + migrations
│       ├── Middleware/           ← Global error handling
│       └── Program.cs
├── frontend/                     ← Vite React + TypeScript SPA
│   └── src/
│       ├── components/
│       ├── services/             ← All API calls (taskApi.ts)
│       ├── types/                ← TypeScript interfaces
│       └── hooks/                ← Custom React hooks
├── CLAUDE.md                     ← This file
└── README.md
```

## Architecture Decisions
- **Repository pattern**: ITaskRepository / TaskRepository — abstracts EF Core, makes it swappable
- **Service layer**: ITaskService / TaskService — owns all business logic, controllers stay thin
- **DTOs only on API surface**: EF Core entities never exposed directly to frontend
- **Global error middleware**: consistent JSON error responses across all endpoints
- **SQLite**: chosen over in-memory so data persists across server restarts (better MVP story)
- **CORS**: configured to allow frontend dev server (localhost:5173)

## Data Model
Task entity fields: Id, Title, Description, Status (enum), Priority (enum), DueDate?, CreatedAt, UpdatedAt

## API Endpoints
```
GET    /api/tasks              list all (supports ?status=&priority=&search=)
GET    /api/tasks/{id}         get one
POST   /api/tasks              create
PUT    /api/tasks/{id}         full update
PATCH  /api/tasks/{id}/status  quick status toggle
DELETE /api/tasks/{id}         delete
```

## Dev Commands
```bash
# Backend (from /backend/EzraTaskManager.Api)
dotnet run                    # starts on https://localhost:7000, Swagger at /swagger

# Frontend (from /frontend)
npm run dev                   # starts on http://localhost:5173
```

## Feature Status
- ✅ Phase 0 — Scaffold
- ✅ Phase 1 — Backend CRUD
- ✅ Phase 2 — Frontend Core (list + create + delete + tests)
- ⬜ Phase 3 — Full UI + Polish
- ⬜ Phase 4 — README + GitHub

## Conventions
- Backend: PascalCase (C# standard)
- Frontend: camelCase variables, PascalCase components
- API responses: camelCase JSON (configured via JsonSerializerOptions)
- Error responses: `{ "error": "message" }` shape
