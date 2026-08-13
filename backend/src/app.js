require("dotenv").config();

const express = require("express");
const cors = require("cors");

const taskRoutes = require("./routes/tasks");
const aiRoutes = require("./routes/ai");
const goalRoutes = require("./routes/goals");

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use("/api/tasks", taskRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/goals", goalRoutes);

  app.get("/", (req, res) => {
    res.json({
      message: "AI Task Manager API running"
    });
  });

  return app;
}

module.exports = {
  createApp
};
