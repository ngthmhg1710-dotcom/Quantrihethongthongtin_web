const express = require("express");
const { userProfile } = require("../controllers/userController");
const { createOrder, getMyOrders } = require("../controllers/orderController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/user/profile", protect, userProfile);
router.get("/user/orders", protect, getMyOrders);
router.post("/user/orders", protect, createOrder);

module.exports = router;
