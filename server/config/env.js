const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../client/.env") });
dotenv.config({ path: path.resolve(__dirname, "../../client/.env.development") });

const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/modern_b2c_ecommerce",
  jwtSecret: process.env.JWT_SECRET || "change_this_access_secret_in_production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "change_this_refresh_secret_in_production",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  googleClientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "",
};

module.exports = env;
