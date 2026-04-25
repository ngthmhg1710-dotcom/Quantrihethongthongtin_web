const express = require("express");
const {
  getUsers,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getDashboardSummary,
} = require("../controllers/adminController");
const { getAllOrders, updateOrderStatus } = require("../controllers/orderController");
const { createProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const { protect, requireAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/admin/users", protect, requireAdmin, getUsers);
router.get("/admin/orders", protect, requireAdmin, getAllOrders);
router.patch("/admin/orders/:id/status", protect, requireAdmin, updateOrderStatus);
router.get("/admin/dashboard", protect, requireAdmin, getDashboardSummary);
router.get("/admin/categories", protect, requireAdmin, getCategories);
router.post("/admin/categories", protect, requireAdmin, createCategory);
router.patch("/admin/categories/:id", protect, requireAdmin, updateCategory);
router.delete("/admin/categories/:id", protect, requireAdmin, deleteCategory);
router.post("/admin/products", protect, requireAdmin, createProduct);
router.patch("/admin/products/:id", protect, requireAdmin, updateProduct);
router.delete("/admin/products/:id", protect, requireAdmin, deleteProduct);

module.exports = router;
