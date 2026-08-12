require("dotenv").config();

const express = require("express");
const cors = require("cors");

const taskRoutes = require("./routes/tasks");
const aiRoutes = require("./routes/ai");

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "AI Task Manager API running"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});