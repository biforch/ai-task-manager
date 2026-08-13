# Architecture

## 1. System Overview

AI Task Manager is a full-stack task management application.

The application uses a separated frontend and backend architecture.

The system contains three main components:

1. Frontend
2. Backend API
3. Database


## 2. System Architecture

```
User
 |
 |
Frontend (React)
 |
 |
HTTP API
 |
 |
Backend (Node.js + Express)
 |
 |
Database (SQLite)
```


## 3. Technology Stack


## Frontend

Technology:

- React
- Vite
- JavaScript


Responsibilities:

- Provide a Goal-first workspace (Dashboard, full-screen AI create flow, Inbox)
- Preview AI-generated goal plans with an explicit unsaved draft banner
- Confirm save before persisting AI drafts, then open the saved goal detail
- Manage goal tasks with Todo / Doing / Done states and confirmed deletion
- Deep-link goal detail via `?goalId=<id>`
- Communicate with backend API


## Backend

Technology:

- Node.js
- Express
- OpenRouter via OpenAI SDK


Responsibilities:

- Provide REST API
- Validate client input and AI output
- Generate AI drafts without writing to the database
- Save confirmed goals and tasks in SQLite transactions
- Query goal list/detail with shared completion stats
- Manage task operations
- Communicate with database


## Database

Technology:

- SQLite


Responsibilities:

- Store goals and tasks
- Provide persistent storage
- Support CRUD operations
- Enforce foreign key integrity when enabled


Startup behavior:

- On server start, `backend/src/index.js` runs idempotent `migrate.js`
- Existing databases are upgraded safely; repeated starts do not fail on existing tables or columns


Connection settings:

- Each SQLite connection enables `PRAGMA foreign_keys = ON`
- Invalid `goal_id` references are rejected instead of creating orphan tasks


# 4. Project Structure

The expected project structure:

```
ai-task-manager

├── frontend
│   ├── src
│   ├── package.json
│   └── vite.config.js
│
├── backend
│   ├── src
│   │   ├── ai
│   │   ├── controllers
│   │   ├── database
│   │   ├── routes
│   │   ├── services
│   │   └── validators
│   ├── tests
│   ├── package.json
│   └── database
│
├── docs
│   ├── product.md
│   ├── architecture.md
│   ├── tasks.md
│   └── ai-workflow.md
│
├── README.md
├── AGENTS.md
└── CLAUDE.md
```


# 5. Data Model


## Goal Entity

Database table:

```
goals
```

Fields:

| Field | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| title | TEXT | Goal title |
| description | TEXT | Optional user/goal description |
| status | TEXT | Goal status (default `active`) |
| created_at | DATETIME | Creation time |
| updated_at | DATETIME | Last update time |


## Task Entity

Database table:

```
tasks
```

Fields:

| Field | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| goal_id | INTEGER | Optional foreign key to goals |
| title | TEXT | Task title |
| description | TEXT | Task description |
| status | TEXT | Current task status |
| priority | TEXT | Optional: low / medium / high |
| estimated_minutes | INTEGER | Optional estimated duration |
| created_at | DATETIME | Creation time |
| updated_at | DATETIME | Last update time |


# 6. API Design

The backend provides REST API endpoints.


## Get Tasks

Method:

```
GET /api/tasks
```

Description:

Retrieve all tasks.


## Create Task

Method:

```
POST /api/tasks
```

Description:

Create a new task manually. Optional fields: `goal_id`, `priority`, `estimated_minutes`.

Manual create requests are validated by `backend/src/validators/taskValidator.js` before any database write.


## AI Plan Draft

Method:

```
POST /api/ai/plan
```

Description:

Generate and validate a goal/task draft from natural language.

Behavior:

- Calls OpenRouter through `llmService.js`
- Validates LLM output against the plan JSON contract
- Does not write to the database
- Returns `502 AI_INVALID_RESPONSE` when the model output is unusable
- Returns `502 AI_SERVICE_ERROR` when the upstream LLM call fails


## Save Confirmed Goal

Method:

```
POST /api/goals
```

Description:

Save a user-confirmed goal and its related tasks in one SQLite transaction.

Behavior:

- Re-validates the full request body on the server; client drafts are not trusted
- Uses a single database connection and transaction for goal insert plus all task inserts
- Rolls back entirely if any task insert fails


## Get Goals

Method:

```
GET /api/goals
```

Description:

Return all goals with aggregated task statistics.

Response fields on each goal include:

- `taskCount`, `todoCount`, `doingCount`, `doneCount`
- `completedPercentage` computed on the server (`0` when `taskCount === 0`)


## Get Goal Detail

Method:

```
GET /api/goals/:id
```

Description:

Return one goal, its related tasks, and the same stats object used by the list endpoint.

Behavior:

- Invalid id returns `400 VALIDATION_ERROR`
- Missing goal returns `404 NOT_FOUND`
- Database failures return generic `500 DATABASE_ERROR` without SQLite details

Implementation note:

- List and detail share `backend/src/services/goalStats.js` for SQL aggregation and stats construction


## Deprecated AI Generate

Method:

```
POST /api/ai/generate
```

Description:

Deprecated legacy endpoint.

Behavior:

- Returns `410 Gone`
- Response directs clients to use `POST /api/ai/plan` and `POST /api/goals` instead


## Update Task

Method:

```
PUT /api/tasks/:id
```

Description:

Update an existing task status.


## Delete Task

Method:

```
DELETE /api/tasks/:id
```

Description:

Delete a task.


# 7. Validation and Error Handling


## Input Validation Layers

| Layer | File | Purpose |
|---|---|---|
| AI plan draft input | `planValidator.js` | Validate user goal text and AI JSON output |
| Confirmed goal save | `planValidator.js` | Re-validate goal/task payload before transaction |
| Manual task create/update | `taskValidator.js` | Validate manual task fields and status values |


Shared limits include task title max 200 chars, description max 2000 chars, optional priority values `low|medium|high`, optional `estimated_minutes` between 1 and 480, and optional positive integer `goal_id`.

AI prompt guidance in `backend/src/ai/prompt.js` further clarifies that `estimatedMinutes` means one-time active effort per task, not sleep/waiting/multi-day duration, and repeats the 1–480 integer requirement in the JSON contract.


## LLM Call Settings

Implemented in `backend/src/ai/llmService.js`:

| Setting | Value | Reason |
|---|---|---|
| timeout | 30 seconds | Prevent hung upstream requests |
| max_tokens | 1200 | Enough for up to 10 structured tasks while limiting cost and latency |

The service also validates `response.choices[0].message.content` and rejects empty or malformed upstream payloads with safe server-side errors.


## Error Response Principles

- Client validation failures return `400` with `VALIDATION_ERROR`
- Invalid or empty LLM upstream payloads return `502` with `AI_SERVICE_ERROR`
- LLM text that fails JSON contract validation returns `502` with `AI_INVALID_RESPONSE`
- Database failures return generic `500` messages with `DATABASE_ERROR`
- Missing tasks return `404` with `NOT_FOUND`
- Missing goals return `404` with `NOT_FOUND`
- Deprecated generate endpoint returns `410` with `DEPRECATED`

Rules:

- Do not return raw SQLite messages, SQL fragments, file paths, API keys, or Authorization headers to clients
- Server-side logs may record error names/messages for diagnosis, but must not log secrets
- Frontend maps `AI_INVALID_RESPONSE` from `POST /api/ai/plan` to a friendly Chinese retry message instead of exposing validator field paths


# 8. Application Flow

## Manual Task Flow

```
User
 |
 |
Frontend Task Form
 |
 |
POST /api/tasks
 |
 |
taskValidator
 |
 |
SQLite
```


## AI Goal Planning Flow

```
User Goal Input
 |
 |
POST /api/ai/plan
 |
 |
llmService -> planValidator
 |
 |
Frontend Preview
 |
 |
User Confirm
 |
 |
POST /api/goals
 |
 |
planValidator -> SQLite transaction
 |
 |
Task List Refresh
```


## Goal-first Workspace Flow

```
Goal Dashboard (GET /api/goals)
 |
 +--> New Goal (full-screen AI flow)
 |      |
 |      POST /api/ai/plan -> draft preview ("not saved")
 |      |
 |      Confirm Save -> POST /api/goals -> open Goal Detail (?goalId=)
 |
 +--> Goal Detail (?goalId=)
 |      |
 |      GET /api/goals/:id
 |      POST /api/tasks (goal_id set)
 |      PUT /api/tasks/:id (todo | doing | done)
 |      DELETE /api/tasks/:id (confirmed)
 |
 +--> Inbox
        GET /api/tasks -> filter goal_id = null
```

URL behavior:

- Entering Goal Detail sets `?goalId=<id>`
- Dashboard / Inbox / Create Goal clear `goalId`
- App bootstrap reads `goalId`; missing goal returns to Dashboard with an error message


## Goal List and Detail Flow

```
Goal List (GET /api/goals)
 |
 |
User selects goal
 |
 |
Goal Detail (GET /api/goals/:id)
 |
 |
Task status update (PUT /api/tasks/:id)
 |
 |
Refresh goal detail stats + goal list + all-task list (refreshKey)
```


# 9. Development Principles

The project follows these principles:

- Keep architecture simple
- Build MVP first
- Avoid unnecessary dependencies
- Separate frontend and backend responsibilities
- Make small incremental changes
- Maintain clean Git history
- Test changes before integration
- Prefer maintainable solutions over quick hacks
