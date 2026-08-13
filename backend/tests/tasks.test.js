const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const { setupTestApp } = require("./helpers/setup");

test("POST /api/tasks rejects non-existent goal_id", async () => {
  const { app, db } = await setupTestApp();

  const response = await request(app)
    .post("/api/tasks")
    .send({
      title: "Orphan task attempt",
      description: "Should not be saved",
      status: "todo",
      goal_id: 99999
    })
    .expect(400);

  assert.equal(response.body.code, "VALIDATION_ERROR");
  assert.equal(response.body.error, "Invalid goal_id");
  assert.doesNotMatch(response.body.error, /FOREIGN KEY/i);
  assert.doesNotMatch(response.body.error, /SQL/i);

  const taskCount = await new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) AS count FROM tasks", (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row.count);
    });
  });

  assert.equal(taskCount, 0);
});

test("POST /api/tasks rejects missing title", async () => {
  const { app } = await setupTestApp();

  const response = await request(app)
    .post("/api/tasks")
    .send({
      description: "No title provided"
    })
    .expect(400);

  assert.equal(response.body.code, "VALIDATION_ERROR");
  assert.equal(response.body.error, "title is required");
});

test("POST /api/tasks rejects invalid priority", async () => {
  const { app } = await setupTestApp();

  const response = await request(app)
    .post("/api/tasks")
    .send({
      title: "Bad priority task",
      priority: "urgent"
    })
    .expect(400);

  assert.equal(response.body.code, "VALIDATION_ERROR");
  assert.match(response.body.error, /priority must be one of low, medium, high/);
});

test("POST /api/tasks rejects invalid estimated_minutes", async () => {
  const { app } = await setupTestApp();

  const response = await request(app)
    .post("/api/tasks")
    .send({
      title: "Bad estimate task",
      estimated_minutes: 0
    })
    .expect(400);

  assert.equal(response.body.code, "VALIDATION_ERROR");
  assert.match(response.body.error, /estimated_minutes must be between/);
});

test("POST /api/tasks accepts minimal valid request", async () => {
  const { app } = await setupTestApp();

  const response = await request(app)
    .post("/api/tasks")
    .send({
      title: "Minimal task"
    })
    .expect(201);

  assert.equal(response.body.title, "Minimal task");
  assert.equal(response.body.status, "todo");
  assert.equal(response.body.goal_id, null);
  assert.equal(response.body.priority, null);
  assert.equal(response.body.estimated_minutes, null);
});

test("PUT /api/tasks/:id rejects invalid status", async () => {
  const { app } = await setupTestApp();

  const created = await request(app)
    .post("/api/tasks")
    .send({
      title: "Task to update"
    })
    .expect(201);

  const response = await request(app)
    .put(`/api/tasks/${created.body.id}`)
    .send({
      status: "archived"
    })
    .expect(400);

  assert.equal(response.body.code, "VALIDATION_ERROR");
  assert.match(response.body.error, /status must be one of todo, doing, done/);
});

test("GET /api/tasks hides internal database error details", async () => {
  const { app, db } = await setupTestApp();
  const originalAll = db.all.bind(db);

  db.all = function patchedAll(sql, params, callback) {
    callback(new Error('SQLITE_ERROR: near "FROM": syntax error at tasks.db'));
  };

  try {
    const response = await request(app).get("/api/tasks").expect(500);

    assert.equal(response.body.code, "DATABASE_ERROR");
    assert.equal(response.body.error, "Failed to fetch tasks");
    assert.doesNotMatch(JSON.stringify(response.body), /SQLITE/i);
    assert.doesNotMatch(JSON.stringify(response.body), /tasks\.db/i);
  } finally {
    db.all = originalAll;
  }
});

test.after(() => {
  const db = require("../src/database/db");
  db.close();
});
