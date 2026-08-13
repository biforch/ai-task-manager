const db = require("../database/db");

const GOAL_STATS_SELECT = `
  SELECT
    g.id,
    g.title,
    g.description,
    g.status,
    g.created_at,
    g.updated_at,
    COUNT(t.id) AS taskCount,
    SUM(CASE WHEN t.status = 'todo' THEN 1 ELSE 0 END) AS todoCount,
    SUM(CASE WHEN t.status = 'doing' THEN 1 ELSE 0 END) AS doingCount,
    SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS doneCount
  FROM goals g
  LEFT JOIN tasks t ON t.goal_id = g.id
`;

function buildGoalWithStats(row) {
  const taskCount = row.taskCount || 0;
  const todoCount = row.todoCount || 0;
  const doingCount = row.doingCount || 0;
  const doneCount = row.doneCount || 0;
  const completedPercentage =
    taskCount === 0 ? 0 : Math.round((doneCount / taskCount) * 100);

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    taskCount,
    todoCount,
    doingCount,
    doneCount,
    completedPercentage
  };
}

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

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row);
    });
  });
}

async function fetchAllGoalsWithStats() {
  const rows = await all(
    `
    ${GOAL_STATS_SELECT}
    GROUP BY g.id
    ORDER BY g.created_at DESC
    `
  );

  return rows.map(buildGoalWithStats);
}

async function fetchGoalWithStatsById(goalId) {
  const row = await get(
    `
    ${GOAL_STATS_SELECT}
    WHERE g.id = ?
    GROUP BY g.id
    `,
    [goalId]
  );

  if (!row) {
    return null;
  }

  return buildGoalWithStats(row);
}

async function fetchTasksByGoalId(goalId) {
  return all(
    `
    SELECT *
    FROM tasks
    WHERE goal_id = ?
    ORDER BY id ASC
    `,
    [goalId]
  );
}

function parseGoalId(idParam) {
  const goalId = Number(idParam);

  if (!Number.isInteger(goalId) || goalId <= 0) {
    return null;
  }

  return goalId;
}

module.exports = {
  buildGoalWithStats,
  fetchAllGoalsWithStats,
  fetchGoalWithStatsById,
  fetchTasksByGoalId,
  parseGoalId
};
