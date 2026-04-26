const app = require("./app");
const env = require("./config/env");
const { connectDatabase, migrateProductCategoriesIfNeeded, seedProductsIfNeeded, seedUsersIfNeeded } = require("./config/database");

async function startServer() {
  try {
    await connectDatabase(env.mongoUri);
    await migrateProductCategoriesIfNeeded();
    await seedProductsIfNeeded();
    await seedUsersIfNeeded();

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
