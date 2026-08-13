const aiService = require("../ai/aiService");
const { validateGoalInput } = require("../ai/planValidator");

const planGoal = async (req, res) => {
  const { goal } = req.body;
  const validationError = validateGoalInput(goal);

  if (validationError) {
    return res.status(400).json({
      error: validationError,
      code: "VALIDATION_ERROR"
    });
  }

  try {
    const plan = await aiService.generatePlan(goal.trim());
    return res.json(plan);
  } catch (error) {
    if (error.code === "AI_INVALID_RESPONSE") {
      return res.status(502).json({
        error: error.message,
        code: "AI_INVALID_RESPONSE"
      });
    }

    return res.status(502).json({
      error: "AI service unavailable",
      code: "AI_SERVICE_ERROR"
    });
  }
};

module.exports = {
  planGoal
};
