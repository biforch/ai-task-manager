const express = require("express");

const app = express();

const PORT = 3000;


app.use(express.json());


const taskRoutes = require("./routes/tasks");

app.use("/api/tasks", taskRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "AI Task Manager API running"
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});