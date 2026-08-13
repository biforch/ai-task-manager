const test = require("node:test");
const assert = require("node:assert/strict");

const { parseAndValidatePlan, LIMITS } = require("../src/ai/planValidator");

test("parseAndValidatePlan accepts valid JSON", () => {
  const raw = JSON.stringify({
    goalTitle: "React Learning Plan",
    tasks: [
      {
        title: "Learn JSX",
        description: "Study JSX basics",
        priority: "high",
        estimatedMinutes: 60
      }
    ]
  });

  const result = parseAndValidatePlan(raw);

  assert.equal(result.ok, true);
  assert.equal(result.plan.goalTitle, "React Learning Plan");
  assert.equal(result.plan.tasks.length, 1);
});

test("parseAndValidatePlan rejects invalid priority", () => {
  const raw = JSON.stringify({
    goalTitle: "React Learning Plan",
    tasks: [
      {
        title: "Learn JSX",
        description: "Study JSX basics",
        priority: "urgent",
        estimatedMinutes: 60
      }
    ]
  });

  const result = parseAndValidatePlan(raw);

  assert.equal(result.ok, false);
  assert.match(result.error, /priority must be one of low, medium, high/);
});

test("parseAndValidatePlan rejects non-JSON output", () => {
  const result = parseAndValidatePlan("not json");

  assert.equal(result.ok, false);
  assert.match(result.error, /not valid JSON/);
});

test("parseAndValidatePlan rejects too many tasks", () => {
  const tasks = Array.from({ length: LIMITS.TASK_COUNT_MAX + 1 }, (_, index) => ({
    title: `Task ${index + 1}`,
    description: "Do work",
    priority: "medium",
    estimatedMinutes: 30
  }));

  const result = parseAndValidatePlan(
    JSON.stringify({
      goalTitle: "Overloaded plan",
      tasks
    })
  );

  assert.equal(result.ok, false);
  assert.match(result.error, /must contain between/);
});

test("parseAndValidatePlan rejects estimatedMinutes outside 1-480", () => {
  const raw = JSON.stringify({
    goalTitle: "Sleep better",
    tasks: [
      {
        title: "Sleep 8 hours tonight",
        description: "Get a full night of sleep",
        priority: "high",
        estimatedMinutes: 481
      }
    ]
  });

  const result = parseAndValidatePlan(raw);

  assert.equal(result.ok, false);
  assert.match(result.error, /estimatedMinutes must be between 1 and 480/);
});
