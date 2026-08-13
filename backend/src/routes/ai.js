const express = require("express");

const router = express.Router();
const { planGoal } = require("../controllers/aiController");

router.post("/plan", planGoal);

router.post("/generate", (req, res) => {
  res.status(410).json({
    error: "This endpoint is deprecated. Use POST /api/ai/plan and POST /api/goals instead.",
    code: "DEPRECATED"
  });
});

module.exports = router;
