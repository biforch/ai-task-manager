const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const { setupTestApp, validPlan } = require("./helpers/setup");

test("POST /api/goals saves goal and tasks in one transaction", async () => {
  const { app } = await setupTestApp();

  const response = await request(app)
    .post("/api/goals")
    .send({
      goalTitle: validPlan.goalTitle,
      goalDescription: "Learn React this week",
      tasks: validPlan.tasks
    })
    .expect(201);

  assert.equal(response.body.goal.title, validPlan.goalTitle);
  assert.equal(response.body.goal.description, "Learn React this week");
  assert.equal(response.body.tasks.length, 1);
  assert.equal(response.body.tasks[0].goal_id, response.body.goal.id);
  assert.equal(response.body.tasks[0].priority, "high");
  assert.equal(response.body.tasks[0].estimated_minutes, 60);
});

test("POST /api/goals rejects invalid payload", async () => {
  const { app } = await setupTestApp();

  const response = await request(app)
    .post("/api/goals")
    .send({
      tasks: validPlan.tasks
    })
    .expect(400);

  assert.equal(response.body.code, "VALIDATION_ERROR");
  assert.match(response.body.error, /goalTitle is required/);
});

test("POST /api/goals re-validates tampered draft", async () => {
  const { app } = await setupTestApp();

  const response = await request(app)
    .post("/api/goals")
    .send({
      goalTitle: validPlan.goalTitle,
      tasks: [
        {
          ...validPlan.tasks[0],
          priority: "urgent"
        }
      ]
    })
    .expect(400);

  assert.equal(response.body.code, "VALIDATION_ERROR");
  assert.match(response.body.error, /priority must be one of low, medium, high/);
});

test("POST /api/goals returns database error when save fails", async () => {
  const { app, db } = await setupTestApp();
  const originalRun = db.run.bind(db);

  db.run = function runWithFailure(sql, ...args) {
    if (typeof sql === "string" && sql.includes("INSERT INTO tasks")) {
      const callback = args[args.length - 1];

      if (typeof callback === "function") {
        callback.call(this, new Error("forced database failure"));
      }

      return;
    }

    return originalRun(sql, ...args);
  };

  try {
    const response = await request(app)
      .post("/api/goals")
      .send({
        goalTitle: validPlan.goalTitle,
        tasks: validPlan.tasks
      })
      .expect(500);

    assert.equal(response.body.code, "DATABASE_ERROR");
    assert.equal(response.body.error, "Failed to save goal and tasks");

    const goalCount = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) AS count FROM goals", (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(row.count);
      });
    });

    assert.equal(goalCount, 0);
  } finally {
    db.run = originalRun;
  }
});

test("POST /api/goals does not read from database after COMMIT", async () => {
  const { app, db } = await setupTestApp();
  const originalRun = db.run.bind(db);
  const originalGet = db.get.bind(db);
  let commitCompleted = false;

  db.run = function patchedRun(sql, ...args) {
    const callback = typeof args[args.length - 1] === "function" ? args.pop() : null;

    if (typeof sql === "string" && sql.trim() === "COMMIT") {
      return originalRun.call(this, sql, ...args, function onCommit(...runArgs) {
        commitCompleted = true;

        if (callback) {
          callback.apply(this, runArgs);
        }
      });
    }

    if (callback) {
      args.push(callback);
    }

    return originalRun.call(this, sql, ...args);
  };

  db.get = function patchedGet(...args) {
    if (commitCompleted) {
      throw new Error("db.get called after COMMIT");
    }

    return originalGet.apply(this, args);
  };

  try {
    const response = await request(app)
      .post("/api/goals")
      .send({
        goalTitle: validPlan.goalTitle,
        goalDescription: "Learn React this week",
        tasks: validPlan.tasks
      })
      .expect(201);

    assert.equal(response.body.goal.title, validPlan.goalTitle);
    assert.equal(response.body.tasks.length, 1);
  } finally {
    db.run = originalRun;
    db.get = originalGet;
  }
});

test("manual POST /api/tasks still works without goal_id", async () => {
  const { app } = await setupTestApp();

  const response = await request(app)
    .post("/api/tasks")
    .send({
      title: "Manual task",
      description: "Created manually",
      status: "todo"
    })
    .expect(201);

  assert.equal(response.body.title, "Manual task");
  assert.equal(response.body.goal_id, null);
});

test.after(() => {
  const db = require("../src/database/db");
  db.close();
});
