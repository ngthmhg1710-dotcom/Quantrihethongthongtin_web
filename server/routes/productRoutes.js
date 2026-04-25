const express = require("express");
const { getProducts, getProductById, addProductReview } = require("../controllers/productController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.post("/products/:id/reviews", protect, addProductReview);

module.exports = router;
