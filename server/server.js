const app = require("./app");
const env = require("./config/env");
const { connectDatabase, seedProductsIfNeeded } = require("./config/database");

async function startServer() {
  try {
    await connectDatabase(env.mongoUri);
    await seedProductsIfNeeded();

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
