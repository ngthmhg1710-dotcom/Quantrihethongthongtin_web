const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");

async function getUsers(req, res) {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 }).lean();
    const formatted = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    }));

    return res.json({
      message: "Admin users list",
      users: formatted,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
}

async function getCategories(req, res) {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch categories" });
  }
}

async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }
    const exists = await Category.findOne({ name: String(name).trim() }).lean();
    if (exists) {
      return res.status(409).json({ message: "Category already exists" });
    }
    const category = await Category.create({
      name: String(name).trim(),
      description: description ? String(description).trim() : "",
    });
    return res.status(201).json({ message: "Category created", category });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create category" });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      id,
      { ...(name ? { name: String(name).trim() } : {}), ...(description !== undefined ? { description: String(description) } : {}) },
      { returnDocument: "after" }
    ).lean();
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.json({ message: "Category updated", category });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update category" });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const category = await Category.findById(id).lean();
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const inUse = await Product.countDocuments({ category: category.name });
    if (inUse > 0) {
      return res.status(400).json({ message: "Cannot delete category in use by products" });
    }
    await Category.findByIdAndDelete(id);
    return res.json({ message: "Category deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete category" });
  }
}

async function getDashboardSummary(req, res) {
  try {
    const [totalProducts, totalCategories, totalOrders, orders] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      Order.find().sort({ createdAt: -1 }).lean(),
    ]);
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

    const monthlyMap = new Map();
    orders.forEach((order) => {
      const d = new Date(order.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const label = d.toLocaleString("en-US", { month: "short" });
      const prev = monthlyMap.get(key) || { month: label, revenue: 0, orders: 0 };
      prev.revenue += Number(order.total || 0);
      prev.orders += 1;
      monthlyMap.set(key, prev);
    });
    const monthlyStats = [...monthlyMap.values()].slice(-6);

    return res.json({
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCategories,
        averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
      },
      monthlyStats,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
}

module.exports = {
  getUsers,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getDashboardSummary,
};
