const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const { setupTestApp, validPlan } = require("./helpers/setup");

async function createGoalWithFourTasks(app) {
  const response = await request(app)
    .post("/api/goals")
    .send({
      goalTitle: "Progress Test Goal",
      goalDescription: "Track completion stats",
      tasks: [
        { title: "Task A", description: "A", priority: "high", estimatedMinutes: 30 },
        { title: "Task B", description: "B", priority: "medium", estimatedMinutes: 30 },
        { title: "Task C", description: "C", priority: "low", estimatedMinutes: 30 },
        { title: "Task D", description: "D", priority: "low", estimatedMinutes: 30 }
      ]
    })
    .expect(201);

  return response.body;
}

async function setTaskStatus(app, taskId, status) {
  await request(app)
    .put(`/api/tasks/${taskId}`)
    .send({ status })
    .expect(200);
}

test("GET /api/goals returns empty array when no goals exist", async () => {
  const { app } = await setupTestApp();

  const response = await request(app).get("/api/goals").expect(200);

  assert.deepEqual(response.body, []);
});

test("GET /api/goals returns stats with 25% when 2 todo, 1 doing, 1 done", async () => {
  const { app } = await setupTestApp();
  const created = await createGoalWithFourTasks(app);
  const [taskA, taskB, taskC] = created.tasks;

  await setTaskStatus(app, taskA.id, "done");
  await setTaskStatus(app, taskB.id, "doing");

  const response = await request(app).get("/api/goals").expect(200);

  assert.equal(response.body.length, 1);

  const goal = response.body[0];

  assert.equal(goal.taskCount, 4);
  assert.equal(goal.todoCount, 2);
  assert.equal(goal.doingCount, 1);
  assert.equal(goal.doneCount, 1);
  assert.equal(goal.completedPercentage, 25);
});

test("GET /api/goals/:id returns goal, tasks, and matching stats", async () => {
  const { app } = await setupTestApp();
  const created = await createGoalWithFourTasks(app);
  const [taskA] = created.tasks;

  await setTaskStatus(app, taskA.id, "done");

  const response = await request(app)
    .get(`/api/goals/${created.goal.id}`)
    .expect(200);

  assert.equal(response.body.goal.id, created.goal.id);
  assert.equal(response.body.goal.taskCount, 4);
  assert.equal(response.body.goal.doneCount, 1);
  assert.equal(response.body.goal.completedPercentage, 25);
  assert.equal(response.body.tasks.length, 4);
  assert.equal(response.body.tasks[0].goal_id, created.goal.id);
});

test("GET /api/goals/:id returns 404 when goal is missing", async () => {
  const { app } = await setupTestApp();

  const response = await request(app).get("/api/goals/999").expect(404);

  assert.equal(response.body.code, "NOT_FOUND");
  assert.equal(response.body.error, "Goal not found");
});

test("GET /api/goals/:id returns 400 for invalid goal id", async () => {
  const { app } = await setupTestApp();

  const response = await request(app).get("/api/goals/not-a-number").expect(400);

  assert.equal(response.body.code, "VALIDATION_ERROR");
  assert.equal(response.body.error, "Invalid goal id");
});

test("GET /api/goals returns 0% completed when goal has zero tasks", async () => {
  const { app, db } = await setupTestApp();

  await new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO goals (title, description, status)
      VALUES (?, ?, 'active')
      `,
      ["Empty Goal", "No tasks yet"],
      (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      }
    );
  });

  const response = await request(app).get("/api/goals").expect(200);

  assert.equal(response.body.length, 1);
  assert.equal(response.body[0].taskCount, 0);
  assert.equal(response.body[0].completedPercentage, 0);
});

test("GET /api/goals does not expose raw SQLite errors", async () => {
  const { app, db } = await setupTestApp();
  const originalAll = db.all.bind(db);

  db.all = function failingAll(sql, ...args) {
    if (typeof sql === "string" && sql.includes("FROM goals")) {
      const callback = args[args.length - 1];

      if (typeof callback === "function") {
        callback(new Error("SQLITE_CORRUPT: database disk image is malformed"));
      }

      return;
    }

    return originalAll(sql, ...args);
  };

  try {
    const response = await request(app).get("/api/goals").expect(500);

    assert.equal(response.body.code, "DATABASE_ERROR");
    assert.equal(response.body.error, "Failed to fetch goals");
    assert.equal(response.body.message, undefined);
  } finally {
    db.all = originalAll;
  }
});

test.after(() => {
  const db = require("../src/database/db");
  db.close();
});
