const Product = require("../models/Product");
const Category = require("../models/Category");

async function getProducts(req, res) {
  try {
    const products = await Product.find().sort({ id: 1 }).lean();
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch products" });
  }
}

async function getProductById(req, res) {
  try {
    const id = Number(req.params.id);
    const product = await Product.findOne({ id }).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch product" });
  }
}

async function createProduct(req, res) {
  try {
    const { name, price, stock, image, category, description, ingredients, skinTypes, featured, step } = req.body;
    if (!name || !image || !category || !description) {
      return res.status(400).json({ message: "Missing required product fields" });
    }

    const maxProduct = await Product.findOne().sort({ id: -1 }).lean();
    const nextId = (maxProduct?.id || 0) + 1;
    const normalizedCategory = String(category).trim();

    await Category.findOneAndUpdate(
      { name: normalizedCategory },
      { $setOnInsert: { name: normalizedCategory, description: "" } },
      { upsert: true }
    );

    const product = await Product.create({
      id: nextId,
      name: String(name).trim(),
      price: Number(price || 0),
      stock: Number(stock || 0),
      image: String(image).trim(),
      category: normalizedCategory,
      description: String(description).trim(),
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      skinTypes: Array.isArray(skinTypes) ? skinTypes : ["all"],
      rating: 0,
      reviews: [],
      featured: Boolean(featured),
      step: step ? Number(step) : undefined,
    });

    return res.status(201).json({ message: "Product created", product });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create product" });
  }
}

async function updateProduct(req, res) {
  try {
    const id = Number(req.params.id);
    const updates = { ...req.body };
    if (updates.category) {
      const normalizedCategory = String(updates.category).trim();
      updates.category = normalizedCategory;
      await Category.findOneAndUpdate(
        { name: normalizedCategory },
        { $setOnInsert: { name: normalizedCategory, description: "" } },
        { upsert: true }
      );
    }

    const product = await Product.findOneAndUpdate({ id }, updates, {
      returnDocument: "after",
    }).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json({ message: "Product updated", product });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update product" });
  }
}

async function deleteProduct(req, res) {
  try {
    const id = Number(req.params.id);
    const deleted = await Product.findOneAndDelete({ id }).lean();
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json({ message: "Product deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete product" });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
