const app = require("./app");
const env = require("./config/env");
const { connectDatabase, migrateProductCategoriesIfNeeded, seedProductsIfNeeded, seedUsersIfNeeded } = require("./config/database");

async function startServer() {
  try {
    await connectDatabase(env.mongoUri);
    await migrateProductCategoriesIfNeeded();
    await seedProductsIfNeeded();
    await seedUsersIfNeeded();
  } catch (error) {
    console.error("Database connection or seeding failed:", error.message);
  }

  // Always start the server so Nginx doesn't return 502 Bad Gateway
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

startServer();
