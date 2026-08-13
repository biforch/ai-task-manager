const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const { setupTestApp } = require("./helpers/setup");

const SRC_ROOT = path.join(__dirname, "../src");

function resetDbModules() {
  delete require.cache[path.join(SRC_ROOT, "database/db.js")];
  delete require.cache[path.join(SRC_ROOT, "database/migrate.js")];
}

function closeDbIfOpen() {
  const dbModulePath = path.join(SRC_ROOT, "database/db.js");

  if (!require.cache[dbModulePath]) {
    return;
  }

  const db = require("../src/database/db");
  db.close();
  delete require.cache[dbModulePath];
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows);
    });
  });
}

test("migrate is idempotent", async () => {
  const { db } = await setupTestApp();
  const { migrate } = require("../src/database/migrate");

  await assert.doesNotReject(async () => {
    await migrate();
    await migrate();
  });

  const columns = await all(db, "PRAGMA table_info(tasks)");

  assert.ok(columns.some((row) => row.name === "goal_id"));
  assert.ok(columns.some((row) => row.name === "priority"));
  assert.ok(columns.some((row) => row.name === "estimated_minutes"));
});

test("migrate upgrades legacy tasks table and preserves data", async () => {
  closeDbIfOpen();
  resetDbModules();

  process.env.DATABASE_PATH = ":memory:";

  const db = require("../src/database/db");

  await run(
    db,
    `
    CREATE TABLE tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'todo',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    `
  );

  await run(
    db,
    `
    INSERT INTO tasks (title, description, status)
    VALUES (?, ?, ?)
    `,
    ["Legacy task", "Keep me", "todo"]
  );

  const { migrate } = require("../src/database/migrate");
  await migrate();

  const columns = await all(db, "PRAGMA table_info(tasks)");
  const columnNames = columns.map((row) => row.name);

  assert.ok(columnNames.includes("goal_id"));
  assert.ok(columnNames.includes("priority"));
  assert.ok(columnNames.includes("estimated_minutes"));

  const tasks = await all(db, "SELECT * FROM tasks ORDER BY id");
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].title, "Legacy task");
  assert.equal(tasks[0].description, "Keep me");
  assert.equal(tasks[0].status, "todo");

  await assert.doesNotReject(async () => {
    await migrate();
  });
});

test.afterEach(() => {
  closeDbIfOpen();
  resetDbModules();
});
