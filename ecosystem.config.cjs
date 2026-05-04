/**
 * PM2 process list for production (EC2).
 * Chạy từ thư mục gốc repo: pm2 start ecosystem.config.cjs
 */
const path = require("path");

const root = __dirname;

module.exports = {
  apps: [
    {
      name: "ecommerce-api",
      cwd: path.join(root, "server"),
      script: "index.js",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      max_restarts: 25,
      min_uptime: "5s",
      exp_backoff_restart_delay: 200,
    },
    {
      name: "ecommerce-frontend",
      cwd: root,
      script: path.join(root, "scripts/pm2-serve-frontend.cjs"),
      interpreter: "node",
      instances: 1,
      autorestart: true,
      max_restarts: 25,
      min_uptime: "5s",
      exp_backoff_restart_delay: 200,
    },
  ],
};
