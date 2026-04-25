const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/healthRoutes");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", productRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", adminRoutes);

module.exports = app;
