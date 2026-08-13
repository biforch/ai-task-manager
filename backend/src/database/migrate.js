const db = require("./db");

function all(sql, params = []) {
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

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve({
        lastID: this.lastID,
        changes: this.changes
      });
    });
  });
}

function isIgnorableMigrationError(error) {
  const message = error.message.toLowerCase();

  return (
    message.includes("duplicate column name") ||
    message.includes("already exists")
  );
}

async function tableExists(tableName) {
  const rows = await all(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
    [tableName]
  );

  return rows.length > 0;
}

async function columnExists(tableName, columnName) {
  const rows = await all(`PRAGMA table_info(${tableName})`);
  return rows.some((row) => row.name === columnName);
}

async function runMigration(sql) {
  try {
    await run(sql);
  } catch (error) {
    if (isIgnorableMigrationError(error)) {
      return;
    }

    throw error;
  }
}

async function addColumnIfMissing(tableName, columnName, definition) {
  const exists = await columnExists(tableName, columnName);

  if (exists) {
    return;
  }

  await runMigration(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`);
}

async function migrate() {
  await runMigration(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const tasksExists = await tableExists("tasks");

  if (!tasksExists) {
    await runMigration(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goal_id INTEGER REFERENCES goals(id),
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'todo',
        priority TEXT,
        estimated_minutes INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  await addColumnIfMissing("tasks", "goal_id", "goal_id INTEGER REFERENCES goals(id)");
  await addColumnIfMissing("tasks", "priority", "priority TEXT");
  await addColumnIfMissing(
    "tasks",
    "estimated_minutes",
    "estimated_minutes INTEGER"
  );
}

module.exports = {
  migrate
};
