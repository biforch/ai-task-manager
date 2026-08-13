const path = require("path");

const SRC_ROOT = path.join(__dirname, "../../src");

const MODULES_TO_RESET = [
  path.join(SRC_ROOT, "database/db.js"),
  path.join(SRC_ROOT, "database/migrate.js"),
  path.join(SRC_ROOT, "app.js"),
  path.join(SRC_ROOT, "controllers/aiController.js"),
  path.join(SRC_ROOT, "controllers/goalController.js"),
  path.join(SRC_ROOT, "services/goalStats.js"),
  path.join(SRC_ROOT, "controllers/taskController.js"),
  path.join(SRC_ROOT, "routes/tasks.js"),
  path.join(SRC_ROOT, "routes/goals.js"),
  path.join(SRC_ROOT, "routes/ai.js")
];

function clearModuleCache() {
  for (const modulePath of MODULES_TO_RESET) {
    delete require.cache[modulePath];
  }
}

async function setupTestApp() {
  process.env.DATABASE_PATH = ":memory:";
  clearModuleCache();

  const { migrate } = require("../../src/database/migrate");
  await migrate();

  const { createApp } = require("../../src/app");
  const db = require("../../src/database/db");

  return {
    app: createApp(),
    db
  };
}

const validPlan = {
  goalTitle: "React Learning Plan",
  tasks: [
    {
      title: "Learn JSX",
      description: "Study JSX basics",
      priority: "high",
      estimatedMinutes: 60
    }
  ]
};

module.exports = {
  setupTestApp,
  validPlan
};
