const VALID_PRIORITIES = ["low", "medium", "high"];

const LIMITS = {
  GOAL_INPUT_MAX: 2000,
  GOAL_TITLE_MAX: 200,
  GOAL_DESCRIPTION_MAX: 2000,
  TASK_TITLE_MAX: 200,
  TASK_DESCRIPTION_MAX: 2000,
  TASK_COUNT_MIN: 1,
  TASK_COUNT_MAX: 10,
  ESTIMATED_MINUTES_MIN: 1,
  ESTIMATED_MINUTES_MAX: 480
};

function stripMarkdownJson(raw) {
  let text = raw.trim();

  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "");
    text = text.replace(/\s*```$/, "");
  }

  return text.trim();
}

function validateGoalInput(goal) {
  if (typeof goal !== "string" || !goal.trim()) {
    return "Goal is required";
  }

  if (goal.trim().length > LIMITS.GOAL_INPUT_MAX) {
    return `Goal must be at most ${LIMITS.GOAL_INPUT_MAX} characters`;
  }

  return null;
}

function validateTask(task, index) {
  const prefix = `tasks[${index}]`;

  if (!task || typeof task !== "object" || Array.isArray(task)) {
    return `${prefix} must be an object`;
  }

  if (typeof task.title !== "string" || !task.title.trim()) {
    return `${prefix}.title must be a non-empty string`;
  }

  if (task.title.trim().length > LIMITS.TASK_TITLE_MAX) {
    return `${prefix}.title must be at most ${LIMITS.TASK_TITLE_MAX} characters`;
  }

  if (typeof task.description !== "string") {
    return `${prefix}.description must be a string`;
  }

  if (task.description.length > LIMITS.TASK_DESCRIPTION_MAX) {
    return `${prefix}.description must be at most ${LIMITS.TASK_DESCRIPTION_MAX} characters`;
  }

  if (!VALID_PRIORITIES.includes(task.priority)) {
    return `${prefix}.priority must be one of low, medium, high`;
  }

  if (
    typeof task.estimatedMinutes !== "number" ||
    !Number.isFinite(task.estimatedMinutes) ||
    !Number.isInteger(task.estimatedMinutes)
  ) {
    return `${prefix}.estimatedMinutes must be an integer`;
  }

  if (
    task.estimatedMinutes < LIMITS.ESTIMATED_MINUTES_MIN ||
    task.estimatedMinutes > LIMITS.ESTIMATED_MINUTES_MAX
  ) {
    return `${prefix}.estimatedMinutes must be between ${LIMITS.ESTIMATED_MINUTES_MIN} and ${LIMITS.ESTIMATED_MINUTES_MAX}`;
  }

  return null;
}

function validatePlanObject(plan) {
  if (!plan || typeof plan !== "object" || Array.isArray(plan)) {
    return "Plan must be an object";
  }

  if (typeof plan.goalTitle !== "string" || !plan.goalTitle.trim()) {
    return "goalTitle must be a non-empty string";
  }

  if (plan.goalTitle.trim().length > LIMITS.GOAL_TITLE_MAX) {
    return `goalTitle must be at most ${LIMITS.GOAL_TITLE_MAX} characters`;
  }

  if (!Array.isArray(plan.tasks)) {
    return "tasks must be an array";
  }

  if (
    plan.tasks.length < LIMITS.TASK_COUNT_MIN ||
    plan.tasks.length > LIMITS.TASK_COUNT_MAX
  ) {
    return `tasks must contain between ${LIMITS.TASK_COUNT_MIN} and ${LIMITS.TASK_COUNT_MAX} items`;
  }

  for (let index = 0; index < plan.tasks.length; index += 1) {
    const taskError = validateTask(plan.tasks[index], index);

    if (taskError) {
      return taskError;
    }
  }

  return null;
}

function normalizePlan(plan) {
  return {
    goalTitle: plan.goalTitle.trim(),
    tasks: plan.tasks.map((task) => ({
      title: task.title.trim(),
      description: task.description.trim(),
      priority: task.priority,
      estimatedMinutes: task.estimatedMinutes
    }))
  };
}

function parseAndValidatePlan(raw) {
  const cleaned = stripMarkdownJson(raw);

  let parsed;

  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    return {
      ok: false,
      error: "Invalid AI plan: response is not valid JSON"
    };
  }

  const validationError = validatePlanObject(parsed);

  if (validationError) {
    return {
      ok: false,
      error: `Invalid AI plan: ${validationError}`
    };
  }

  return {
    ok: true,
    plan: normalizePlan(parsed)
  };
}

function validateGoalRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be an object";
  }

  if (typeof body.goalTitle !== "string" || !body.goalTitle.trim()) {
    return "goalTitle is required";
  }

  if (
    body.goalDescription !== undefined &&
    body.goalDescription !== null &&
    typeof body.goalDescription !== "string"
  ) {
    return "goalDescription must be a string when provided";
  }

  if (
    typeof body.goalDescription === "string" &&
    body.goalDescription.length > LIMITS.GOAL_DESCRIPTION_MAX
  ) {
    return `goalDescription must be at most ${LIMITS.GOAL_DESCRIPTION_MAX} characters`;
  }

  const planError = validatePlanObject({
    goalTitle: body.goalTitle,
    tasks: body.tasks
  });

  if (planError) {
    return planError;
  }

  return null;
}

function normalizeGoalRequest(body) {
  return {
    goalTitle: body.goalTitle.trim(),
    goalDescription:
      typeof body.goalDescription === "string" && body.goalDescription.trim()
        ? body.goalDescription.trim()
        : null,
    tasks: body.tasks.map((task) => ({
      title: task.title.trim(),
      description: task.description.trim(),
      priority: task.priority,
      estimatedMinutes: task.estimatedMinutes
    }))
  };
}

module.exports = {
  LIMITS,
  parseAndValidatePlan,
  validateGoalInput,
  validateGoalRequest,
  normalizeGoalRequest,
  validatePlanObject
};
