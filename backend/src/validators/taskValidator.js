const { LIMITS } = require("../ai/planValidator");

const VALID_PRIORITIES = ["low", "medium", "high"];
const VALID_STATUSES = ["todo", "doing", "done"];

function validateOptionalDescription(description) {
  if (description === undefined || description === null) {
    return null;
  }

  if (typeof description !== "string") {
    return "description must be a string when provided";
  }

  if (description.length > LIMITS.TASK_DESCRIPTION_MAX) {
    return `description must be at most ${LIMITS.TASK_DESCRIPTION_MAX} characters`;
  }

  return null;
}

function validateOptionalPriority(priority) {
  if (priority === undefined || priority === null) {
    return null;
  }

  if (typeof priority !== "string" || !VALID_PRIORITIES.includes(priority)) {
    return "priority must be one of low, medium, high when provided";
  }

  return null;
}

function validateOptionalEstimatedMinutes(estimatedMinutes) {
  if (estimatedMinutes === undefined || estimatedMinutes === null) {
    return null;
  }

  if (
    typeof estimatedMinutes !== "number" ||
    !Number.isFinite(estimatedMinutes) ||
    !Number.isInteger(estimatedMinutes)
  ) {
    return "estimated_minutes must be an integer when provided";
  }

  if (
    estimatedMinutes < LIMITS.ESTIMATED_MINUTES_MIN ||
    estimatedMinutes > LIMITS.ESTIMATED_MINUTES_MAX
  ) {
    return `estimated_minutes must be between ${LIMITS.ESTIMATED_MINUTES_MIN} and ${LIMITS.ESTIMATED_MINUTES_MAX} when provided`;
  }

  return null;
}

function validateOptionalGoalId(goalId) {
  if (goalId === undefined || goalId === null) {
    return null;
  }

  if (typeof goalId !== "number" || !Number.isInteger(goalId) || goalId <= 0) {
    return "goal_id must be a positive integer when provided";
  }

  return null;
}

function validateManualTaskCreate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be an object";
  }

  if (typeof body.title !== "string" || !body.title.trim()) {
    return "title is required";
  }

  if (body.title.trim().length > LIMITS.TASK_TITLE_MAX) {
    return `title must be at most ${LIMITS.TASK_TITLE_MAX} characters`;
  }

  const descriptionError = validateOptionalDescription(body.description);

  if (descriptionError) {
    return descriptionError;
  }

  if (body.status !== undefined && body.status !== null) {
    if (typeof body.status !== "string" || !VALID_STATUSES.includes(body.status)) {
      return "status must be one of todo, doing, done when provided";
    }
  }

  const priorityError = validateOptionalPriority(body.priority);

  if (priorityError) {
    return priorityError;
  }

  const estimatedMinutesError = validateOptionalEstimatedMinutes(
    body.estimated_minutes
  );

  if (estimatedMinutesError) {
    return estimatedMinutesError;
  }

  const goalIdError = validateOptionalGoalId(body.goal_id);

  if (goalIdError) {
    return goalIdError;
  }

  return null;
}

function normalizeManualTaskCreate(body) {
  return {
    title: body.title.trim(),
    description:
      typeof body.description === "string" ? body.description : null,
    status: body.status || "todo",
    goal_id: body.goal_id ?? null,
    priority: body.priority ?? null,
    estimated_minutes: body.estimated_minutes ?? null
  };
}

function validateTaskUpdate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be an object";
  }

  if (typeof body.status !== "string" || !VALID_STATUSES.includes(body.status)) {
    return "status must be one of todo, doing, done";
  }

  return null;
}

module.exports = {
  validateManualTaskCreate,
  normalizeManualTaskCreate,
  validateTaskUpdate,
  VALID_STATUSES
};
