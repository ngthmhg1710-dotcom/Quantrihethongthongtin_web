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
      cwd: path.join(root, "client"),
      script: path.join(root, "client/node_modules/serve/build/main.js"),
      interpreter: "node",
      args: ["-s", "dist", "-l", "tcp://0.0.0.0:5173", "-n", "-L"],
      instances: 1,
      autorestart: true,
      max_restarts: 25,
      min_uptime: "5s",
      exp_backoff_restart_delay: 200,
    },
  ],
};
