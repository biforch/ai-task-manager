const db = require("../database/db");
const {
  validateGoalRequest,
  normalizeGoalRequest
} = require("../ai/planValidator");
const {
  fetchAllGoalsWithStats,
  fetchGoalWithStatsById,
  fetchTasksByGoalId,
  parseGoalId
} = require("../services/goalStats");

function logDatabaseError(action, err) {
  console.error(`Database error while ${action}:`, err.message);
}

function respondDatabaseError(res, action) {
  return res.status(500).json({
    error: `Failed to ${action}`,
    code: "DATABASE_ERROR"
  });
}

function saveGoalWithTasks(payload) {
  return new Promise((resolve, reject) => {
    let settled = false;

    function finishResolve(value) {
      if (settled) {
        return;
      }

      settled = true;
      resolve(value);
    }

    function finishReject(error) {
      if (settled) {
        return;
      }

      settled = true;
      reject(error);
    }

    function rollbackAndReject(error) {
      if (settled) {
        return;
      }

      db.run("ROLLBACK", () => {
        finishReject(error);
      });
    }

    db.serialize(() => {
      let goalId;
      const savedTasks = [];

      db.run("BEGIN TRANSACTION", (beginErr) => {
        if (beginErr) {
          finishReject(beginErr);
          return;
        }

        db.run(
          `
          INSERT INTO goals (title, description, status)
          VALUES (?, ?, 'active')
          `,
          [payload.goalTitle, payload.goalDescription],
          function onGoalInsert(err) {
            if (err) {
              rollbackAndReject(err);
              return;
            }

            goalId = this.lastID;
            insertTask(0);
          }
        );
      });

      function insertTask(index) {
        if (index >= payload.tasks.length) {
          db.get("SELECT * FROM goals WHERE id = ?", [goalId], (goalErr, goal) => {
            if (goalErr) {
              rollbackAndReject(goalErr);
              return;
            }

            db.run("COMMIT", (commitErr) => {
              if (commitErr) {
                rollbackAndReject(commitErr);
                return;
              }

              finishResolve({
                goal,
                tasks: savedTasks
              });
            });
          });
          return;
        }

        const task = payload.tasks[index];

        db.run(
          `
          INSERT INTO tasks
          (goal_id, title, description, status, priority, estimated_minutes)
          VALUES (?, ?, ?, 'todo', ?, ?)
          `,
          [
            goalId,
            task.title,
            task.description,
            task.priority,
            task.estimatedMinutes
          ],
          function onTaskInsert(err) {
            if (err) {
              rollbackAndReject(err);
              return;
            }

            db.get("SELECT * FROM tasks WHERE id = ?", [this.lastID], (getErr, row) => {
              if (getErr) {
                rollbackAndReject(getErr);
                return;
              }

              savedTasks.push(row);
              insertTask(index + 1);
            });
          }
        );
      }
    });
  });
}

const getGoals = async (req, res) => {
  try {
    const goals = await fetchAllGoalsWithStats();
    return res.json(goals);
  } catch (error) {
    logDatabaseError("fetch goals", error);
    return respondDatabaseError(res, "fetch goals");
  }
};

const getGoalById = async (req, res) => {
  const goalId = parseGoalId(req.params.id);

  if (!goalId) {
    return res.status(400).json({
      error: "Invalid goal id",
      code: "VALIDATION_ERROR"
    });
  }

  try {
    const goal = await fetchGoalWithStatsById(goalId);

    if (!goal) {
      return res.status(404).json({
        error: "Goal not found",
        code: "NOT_FOUND"
      });
    }

    const tasks = await fetchTasksByGoalId(goalId);

    return res.json({
      goal,
      tasks
    });
  } catch (error) {
    logDatabaseError("fetch goal", error);
    return respondDatabaseError(res, "fetch goal");
  }
};

const createGoal = async (req, res) => {
  const validationError = validateGoalRequest(req.body);

  if (validationError) {
    return res.status(400).json({
      error: validationError,
      code: "VALIDATION_ERROR"
    });
  }

  const payload = normalizeGoalRequest(req.body);

  try {
    const result = await saveGoalWithTasks(payload);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to save goal and tasks",
      code: "DATABASE_ERROR"
    });
  }
};

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  saveGoalWithTasks
};
