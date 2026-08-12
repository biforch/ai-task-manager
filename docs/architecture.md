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

- Provide user interface
- Display task list
- Create tasks
- Update tasks
- Delete tasks
- Communicate with backend API



## Backend

Technology:

- Node.js
- Express


Responsibilities:

- Provide REST API
- Handle business logic
- Validate requests
- Manage task operations
- Communicate with database



## Database

Technology:

- SQLite


Responsibilities:

- Store task data
- Provide persistent storage
- Support CRUD operations



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


## Task Entity

The main data entity is Task.


Database table:

```
tasks
```


Fields:


| Field | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| title | TEXT | Task title |
| description | TEXT | Task description |
| status | TEXT | Current task status |
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

Create a new task.



## Update Task


Method:

```
PUT /api/tasks/:id
```


Description:

Update an existing task.



## Delete Task


Method:

```
DELETE /api/tasks/:id
```


Description:

Delete a task.



# 7. Application Flow


The basic application flow:


```
User
 |
 |
Frontend Interface
 |
 |
API Request
 |
 |
Backend Service
 |
 |
Database
 |
 |
API Response
 |
 |
Frontend Update
```


# 8. Development Principles


The project follows these principles:


- Keep architecture simple
- Build MVP first
- Avoid unnecessary dependencies
- Separate frontend and backend responsibilities
- Make small incremental changes
- Maintain clean Git history
- Test changes before integration
- Prefer maintainable solutions over quick hacks