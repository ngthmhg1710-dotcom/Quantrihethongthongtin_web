#!/usr/bin/env node
/**
 * PM2: phục vụ client/dist qua serve.
 * Ưu tiên serve đã cài trong client/node_modules; nếu chưa có thì gọi npx (tránh lỗi "Script not found" trên EC2).
 */
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "..");
const clientDir = path.join(root, "client");
const serveMain = path.join(clientDir, "node_modules", "serve", "build", "main.js");
const serveArgs = ["-s", "dist", "-l", "tcp://0.0.0.0:5173", "-n", "-L"];

function forwardExit(child) {
  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code == null ? 1 : code);
  });
}

if (!fs.existsSync(path.join(clientDir, "dist"))) {
  console.error("[pm2-serve-frontend] Thiếu client/dist. Chạy: cd client && npm run build");
  process.exit(1);
}

if (fs.existsSync(serveMain)) {
  forwardExit(
    spawn(process.execPath, [serveMain, ...serveArgs], {
      cwd: clientDir,
      stdio: "inherit",
    })
  );
} else {
  console.warn("[pm2-serve-frontend] Chưa có serve trong node_modules, dùng npx serve@14.2.4 …");
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  forwardExit(
    spawn(npx, ["--yes", "serve@14.2.4", ...serveArgs], {
      cwd: clientDir,
      stdio: "inherit",
      shell: process.platform === "win32",
    })
  );
}
