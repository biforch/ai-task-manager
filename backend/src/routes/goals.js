const express = require("express");

const router = express.Router();
const {
  createGoal,
  getGoals,
  getGoalById
} = require("../controllers/goalController");

router.get("/", getGoals);
router.get("/:id", getGoalById);
router.post("/", createGoal);

module.exports = router;
