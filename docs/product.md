# Product

## Project Name

AI Task Manager — AI 目标拆解任务管理器

---

## Project Goal

Build a task management application where users describe a goal in natural language, preview AI-generated tasks, and save them only after confirmation.

The project also practices an AI-assisted software development workflow:

- Product planning
- Architecture design
- Coding
- Testing
- Code review
- Git management

---

## Target Users

Personal users who want to turn a high-level goal into actionable tasks.

---

## Core Problem

Users need a simple way to:

1. Record and track tasks manually
2. Use AI to break down a goal into structured tasks
3. Review the AI draft before anything is persisted

---

## Current Stage

**MVP implemented** for manual task management and the AI goal planning loop.

---

## Implemented Features

### Manual Task Management

Users can:

- Create tasks manually
- View task list
- Update task status
- Delete tasks

Manual tasks have `goal_id = null`.

### AI Goal Planning Loop

Users can:

1. Enter a natural-language goal
2. Request a draft plan via `POST /api/ai/plan`
3. Preview `goalTitle` and generated tasks in the UI
4. Confirm save via `POST /api/goals`

Saving creates:

- one row in `goals`
- multiple related rows in `tasks` with `goal_id` set

The old endpoint `POST /api/ai/generate` is deprecated and returns `410 Gone`.

### Goal List and Progress

Users can:

- View all saved goals with task counts and completion percentage
- Open a goal to see its description and related tasks
- Update task status from goal detail; progress refreshes automatically
- Return to the full task list (includes manual tasks with `goal_id = null`)

Completion percentage is computed on the backend:

- `0%` when a goal has zero tasks
- otherwise `Math.round(doneCount / taskCount * 100)`

---

## Data Model

### Goal

| Field | Description |
|---|---|
| id | Unique identifier |
| title | Goal title |
| description | Optional original user input or notes |
| status | Default `active` |
| created_at | Creation time |
| updated_at | Last update time |

### Task

| Field | Description |
|---|---|
| id | Unique identifier |
| goal_id | Related goal; null for manual tasks |
| title | Task name |
| description | Task details |
| status | Todo / Doing / Done |
| priority | low / medium / high (optional) |
| estimated_minutes | Estimated duration (optional) |
| created_at | Creation time |
| updated_at | Last update time |

---

## API Summary

| Endpoint | Purpose |
|---|---|
| `GET /api/goals` | List goals with task stats and completion percentage |
| `GET /api/goals/:id` | Get one goal, its tasks, and the same stats object |
| `POST /api/ai/plan` | Generate validated draft only |
| `POST /api/goals` | Save confirmed goal + tasks in one transaction |
| `POST /api/ai/generate` | Deprecated |

---

## Not Implemented Yet

The following are **not** completed and should not be documented as shipped features:

- Goal edit or delete
- Task content editing beyond status changes
- User accounts / authentication
- AI Memory or multi-step agent orchestration
- Search, categories, deadlines, pagination, or advanced progress analytics

---

## Future Features

Possible improvements:

- Goal editing and deletion
- Task editing and reordering
- User accounts
- Task categories and search
- Deadline suggestions
- Progress analysis

---

## Development Principles

- Keep implementation simple
- Avoid unnecessary dependencies
- Build incrementally
- Validate each change
- Maintain clean Git history
