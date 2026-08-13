const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const aiService = require("../src/ai/aiService");
const { setupTestApp, validPlan } = require("./helpers/setup");

test("POST /api/ai/plan returns validated plan", async () => {
  const { app } = await setupTestApp();
  const originalGeneratePlan = aiService.generatePlan;

  aiService.generatePlan = async () => validPlan;

  try {
    const response = await request(app)
      .post("/api/ai/plan")
      .send({ goal: "Learn React in 30 days" })
      .expect(200);

    assert.equal(response.body.goalTitle, validPlan.goalTitle);
    assert.equal(response.body.tasks.length, 1);
    assert.equal(response.body.tasks[0].priority, "high");
  } finally {
    aiService.generatePlan = originalGeneratePlan;
  }
});

test("POST /api/ai/plan rejects invalid LLM output", async () => {
  const { app } = await setupTestApp();
  const originalGeneratePlan = aiService.generatePlan;

  aiService.generatePlan = async () => {
    const error = new Error(
      "Invalid AI plan: tasks[0].priority must be one of low, medium, high"
    );
    error.code = "AI_INVALID_RESPONSE";
    throw error;
  };

  try {
    const response = await request(app)
      .post("/api/ai/plan")
      .send({ goal: "Learn React in 30 days" })
      .expect(502);

    assert.equal(response.body.code, "AI_INVALID_RESPONSE");
    assert.match(response.body.error, /Invalid AI plan/);
  } finally {
    aiService.generatePlan = originalGeneratePlan;
  }
});

test("POST /api/ai/plan rejects estimatedMinutes outside 1-480", async () => {
  const { app } = await setupTestApp();
  const originalGeneratePlan = aiService.generatePlan;

  aiService.generatePlan = async () => {
    const error = new Error(
      "Invalid AI plan: tasks[2].estimatedMinutes must be between 1 and 480"
    );
    error.code = "AI_INVALID_RESPONSE";
    throw error;
  };

  try {
    const response = await request(app)
      .post("/api/ai/plan")
      .send({ goal: "Improve sleep habits" })
      .expect(502);

    assert.equal(response.body.code, "AI_INVALID_RESPONSE");
    assert.match(
      response.body.error,
      /estimatedMinutes must be between 1 and 480/
    );
  } finally {
    aiService.generatePlan = originalGeneratePlan;
  }
});

test("POST /api/ai/plan requires goal", async () => {
  const { app } = await setupTestApp();

  const response = await request(app)
    .post("/api/ai/plan")
    .send({})
    .expect(400);

  assert.equal(response.body.code, "VALIDATION_ERROR");
  assert.equal(response.body.error, "Goal is required");
});

test("POST /api/ai/generate returns 410 Gone", async () => {
  const { app } = await setupTestApp();

  const response = await request(app)
    .post("/api/ai/generate")
    .send({ goal: "deprecated path" })
    .expect(410);

  assert.equal(response.body.code, "DEPRECATED");
  assert.match(response.body.error, /POST \/api\/ai\/plan/);
});
