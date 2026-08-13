# AI Task Manager — Project Status

Last updated: 2026-08-13

## Summary

The project has a working MVP for manual task management, the **AI goal planning loop**, and **goal list/detail views with completion progress**:

1. User enters a goal
2. Backend calls OpenRouter and returns a validated draft (`POST /api/ai/plan`)
3. Frontend shows a preview
4. User confirms before anything is saved (`POST /api/goals`)
5. User can browse goals, open goal detail, and see backend-computed completion percentage

Current automated test status: **backend 36 tests passed, 0 failed**.

## Completed

### Phase 1 — Project Setup

- [x] Create frontend project with React + Vite
- [x] Create backend project with Node.js + Express
- [x] Configure project structure
- [x] Configure development scripts

### Phase 2 — Backend Development

- [x] Initialize backend package
- [x] Install Express
- [x] Create backend entry point
- [x] Configure API server
- [x] Install SQLite dependency
- [x] Create database connection
- [x] Create tasks table
- [x] Create database initialization script
- [x] Implement GET /api/tasks
- [x] Implement POST /api/tasks
- [x] Implement PUT /api/tasks/:id
- [x] Implement DELETE /api/tasks/:id
- [x] Add goals table and task migration columns
- [x] Add idempotent migrate.js
- [x] Enable SQLite `foreign_keys`
- [x] Implement POST /api/ai/plan
- [x] Implement POST /api/goals with transaction save
- [x] Implement GET /api/goals with shared stats query
- [x] Implement GET /api/goals/:id with tasks and same stats
- [x] Deprecate POST /api/ai/generate (410 Gone)
- [x] Add manual task input validation (`taskValidator.js`)
- [x] Sanitize task and goal GET database error responses

### Phase 3 — Frontend Development

- [x] Initialize React application
- [x] Configure frontend structure
- [x] Create main application layout
- [x] Create task list component
- [x] Create task creation form
- [x] Add task status update
- [x] Add task deletion
- [x] Connect frontend with backend API
- [x] Handle loading state
- [x] Handle error state
- [x] AI goal input, preview, and confirm save flow
- [x] Goal list with completion progress
- [x] Goal detail with related tasks and refreshKey-based refresh

### Phase 4 — Testing

- [x] Backend API tests for AI plan and goals save
- [x] Backend GET goals tests (empty list, stats, detail, 404, invalid id, zero tasks, DB sanitization)
- [x] Backend validation tests for invalid AI output
- [x] Backend database failure / rollback test
- [x] Migration idempotency and legacy schema upgrade tests
- [x] Manual task validation and invalid goal_id tests
- [x] Task update status validation test
- [x] Database error sanitization test
- [x] LLM service unit tests (timeout, max_tokens, empty response, SDK failure wrapping)
- [ ] Frontend UI component tests
- [ ] End-to-end tests
- [ ] Exhaustive task CRUD endpoint coverage

### Phase 5 — Code Quality

- [x] Improve documentation for current feature set
- [x] Run backend test suite (36 passed)
- [ ] Final dependency review
- [ ] Full manual QA checklist

## Reliability Notes

### LLM Layer

- OpenRouter is called through the existing OpenAI SDK integration
- Server-side timeout: **30 seconds**
- `max_tokens`: **1200**
- Empty choices, missing message, null/blank content, and SDK failures are converted to safe upstream errors
- Raw provider error text is not returned to clients

### Manual Task Validation

- Manual `POST /api/tasks` validates title, optional description, priority, estimated minutes, and goal_id
- Manual `PUT /api/tasks/:id` validates status values (`todo`, `doing`, `done`)
- Invalid client input returns `400 VALIDATION_ERROR`

### Goal Stats

- `GET /api/goals` and `GET /api/goals/:id` share `backend/src/services/goalStats.js`
- `completedPercentage` is computed on the server only
- Zero-task goals return `0%`
- Goal id parameters are validated and bound with parameterized SQL

### Error Handling

- Task and goal database failures return generic client messages with `DATABASE_ERROR`
- Missing tasks return `404 NOT_FOUND`
- Missing goals return `404 NOT_FOUND`
- SQLite/SQL/internal paths are not exposed in API responses

## Not Started / Future

- [ ] User authentication
- [ ] Task categories
- [ ] Search / pagination / filtering
- [ ] Goal edit or delete
- [ ] Task content editing beyond status changes
- [ ] Frontend automated tests
- [ ] End-to-end tests
- [ ] Idempotency-Key support
- [ ] SQLite WAL / busy_timeout tuning
- [ ] Memory system or complex agent orchestration
- [ ] Production deployment

## API Notes

| Endpoint | Purpose |
|---|---|
| `GET /api/goals` | List goals with task stats and completion percentage |
| `GET /api/goals/:id` | Get one goal, its tasks, and the same stats object |
| `POST /api/ai/plan` | Generate validated draft only |
| `POST /api/goals` | Save confirmed goal + tasks in one transaction |
| `POST /api/ai/generate` | Deprecated — returns `410 Gone` |

## Validation Limits

- Goal input: max 2000 chars
- Goal title: max 200 chars
- Goal description: max 2000 chars
- Task title: max 200 chars
- Task description: max 2000 chars
- Task count: 1–10
- Estimated minutes per task: 1–480

## Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Client request invalid |
| `NOT_FOUND` | 404 | Task or goal not found |
| `AI_INVALID_RESPONSE` | 502 | LLM output failed server validation |
| `AI_SERVICE_ERROR` | 502 | Upstream AI call failed or returned unusable payload |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `DEPRECATED` | 410 | Old generate endpoint |
