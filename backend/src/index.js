require("dotenv").config();

const { createApp } = require("./app");
const { migrate } = require("./database/migrate");

const PORT = process.env.PORT || 3000;

async function start() {
  await migrate();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
