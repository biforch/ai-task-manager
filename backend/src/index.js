const express = require("express");

const cors = require("cors");

const app = express();

const PORT = 3000;


app.use(express.json());
app.use(cors());


const taskRoutes = require("./routes/tasks");

app.use("/api/tasks", taskRoutes);

const aiRoutes=require("./routes/ai");

app.use("/api/ai", aiRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "AI Task Manager API running"
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});