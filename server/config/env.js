const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../client/.env") });

function isPlaceholderGoogleClientId(value) {
  return typeof value === "string" && value.includes("your_google_oauth_client_id");
}

const rawServerGoogleClientId = process.env.GOOGLE_CLIENT_ID || "";
const normalizedServerGoogleClientId = isPlaceholderGoogleClientId(rawServerGoogleClientId)
  ? ""
  : rawServerGoogleClientId;

const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/modern_b2c_ecommerce",
  jwtSecret: process.env.JWT_SECRET || "change_this_access_secret_in_production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "change_this_refresh_secret_in_production",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  googleClientId: normalizedServerGoogleClientId || process.env.VITE_GOOGLE_CLIENT_ID || "",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: String(process.env.SMTP_PASS || "").replace(/\s+/g, ""),
  newsletterFromEmail: process.env.NEWSLETTER_FROM_EMAIL || "",
  newsletterReplyTo: process.env.NEWSLETTER_REPLY_TO || "",
  contactReceiverEmail: process.env.CONTACT_RECEIVER_EMAIL || "",
};

module.exports = env;
