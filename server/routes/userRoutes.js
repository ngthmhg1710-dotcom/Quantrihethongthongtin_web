const express = require("express");
const {
  userProfile,
  updateUserProfile,
  getWishlist,
  updateWishlist,
  getCart,
  updateCart,
} = require("../controllers/userController");
const { createOrder, getMyOrders } = require("../controllers/orderController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/user/profile", protect, userProfile);
router.patch("/user/profile", protect, updateUserProfile);
router.get("/user/wishlist", protect, getWishlist);
router.put("/user/wishlist", protect, updateWishlist);
router.get("/user/cart", protect, getCart);
router.put("/user/cart", protect, updateCart);
router.get("/user/orders", protect, getMyOrders);
router.post("/user/orders", protect, createOrder);

module.exports = router;
