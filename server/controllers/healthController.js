const mongoose = require("mongoose");

function getHealth(req, res) {
  return res.json({
    message: "Server is running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
}

module.exports = {
  getHealth,
};
