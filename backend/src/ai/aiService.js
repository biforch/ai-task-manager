const { buildPrompt } = require("./prompt");
const { askAI } = require("./llmService");
const { parseAndValidatePlan } = require("./planValidator");

async function generatePlan(goal) {
  const prompt = buildPrompt(goal);
  const raw = await askAI(prompt);
  const result = parseAndValidatePlan(raw);

  if (!result.ok) {
    const error = new Error(result.error);
    error.code = "AI_INVALID_RESPONSE";
    throw error;
  }

  return result.plan;
}

module.exports = {
  generatePlan
};
