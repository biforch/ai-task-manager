const db = require("../database/db");
const {
  validateManualTaskCreate,
  normalizeManualTaskCreate,
  validateTaskUpdate
} = require("../validators/taskValidator");

function logDatabaseError(action, err) {
  console.error(`Database error while ${action}:`, err.message);
}

function respondDatabaseError(res, action) {
  return res.status(500).json({
    error: `Failed to ${action}`,
    code: "DATABASE_ERROR"
  });
}

// GET ALL TASKS
const getTasks = (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) {
      logDatabaseError("fetch tasks", err);
      return respondDatabaseError(res, "fetch tasks");
    }

    res.json(rows);
  });
};

// CREATE TASK
const createTask = (req, res) => {
  const validationError = validateManualTaskCreate(req.body);

  if (validationError) {
    return res.status(400).json({
      error: validationError,
      code: "VALIDATION_ERROR"
    });
  }

  const task = normalizeManualTaskCreate(req.body);

  db.run(
    `
    INSERT INTO tasks
    (goal_id, title, description, status, priority, estimated_minutes)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      task.goal_id,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.estimated_minutes
    ],
    function onInsert(err) {
      if (err) {
        if (err.message && err.message.includes("FOREIGN KEY constraint failed")) {
          return res.status(400).json({
            error: "Invalid goal_id",
            code: "VALIDATION_ERROR"
          });
        }

        logDatabaseError("create task", err);
        return respondDatabaseError(res, "create task");
      }

      db.get("SELECT * FROM tasks WHERE id = ?", [this.lastID], (selectErr, row) => {
        if (selectErr) {
          logDatabaseError("create task", selectErr);
          return respondDatabaseError(res, "create task");
        }

        res.status(201).json(row);
      });
    }
  );
};

// UPDATE TASK STATUS
const updateTask = (req, res) => {
  const { id } = req.params;
  const validationError = validateTaskUpdate(req.body);

  if (validationError) {
    return res.status(400).json({
      error: validationError,
      code: "VALIDATION_ERROR"
    });
  }

  const { status } = req.body;

  db.run(
    `
    UPDATE tasks
    SET
      status=?,
      updated_at=CURRENT_TIMESTAMP
    WHERE id=?
    `,
    [status, id],
    function onUpdate(err) {
      if (err) {
        logDatabaseError("update task", err);
        return respondDatabaseError(res, "update task");
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: "Task not found",
          code: "NOT_FOUND"
        });
      }

      db.get("SELECT * FROM tasks WHERE id=?", [id], (selectErr, row) => {
        if (selectErr) {
          logDatabaseError("update task", selectErr);
          return respondDatabaseError(res, "update task");
        }

        res.json(row);
      });
    }
  );
};

// DELETE TASK
const deleteTask = (req, res) => {
  const { id } = req.params;

  db.run(
    `
    DELETE FROM tasks
    WHERE id=?
    `,
    [id],
    function onDelete(err) {
      if (err) {
        logDatabaseError("delete task", err);
        return respondDatabaseError(res, "delete task");
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: "Task not found",
          code: "NOT_FOUND"
        });
      }

      res.json({
        message: "Task deleted"
      });
    }
  );
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
