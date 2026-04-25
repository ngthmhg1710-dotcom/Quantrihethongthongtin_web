const Product = require("../models/Product");
const Category = require("../models/Category");

function validateProductPayload(payload, isPartial = false) {
  const errors = [];
  const has = (key) => Object.prototype.hasOwnProperty.call(payload, key);

  if (!isPartial || has("name")) {
    const name = String(payload.name || "").trim();
    if (!name) errors.push("Product name is required");
    if (name.length > 120) errors.push("Product name is too long");
  }

  if (!isPartial || has("category")) {
    const category = String(payload.category || "").trim();
    if (!category) errors.push("Category is required");
  }

  if (!isPartial || has("description")) {
    const description = String(payload.description || "").trim();
    if (!description) errors.push("Description is required");
    if (description.length < 20) errors.push("Description must be at least 20 characters");
  }

  if (!isPartial || has("price")) {
    const price = Number(payload.price);
    if (!Number.isFinite(price) || price < 0) errors.push("Price must be a non-negative number");
  }

  if (!isPartial || has("stock")) {
    const stock = Number(payload.stock);
    if (!Number.isInteger(stock) || stock < 0) errors.push("Stock must be an integer greater than or equal to 0");
  }

  if (!isPartial || has("image")) {
    const image = String(payload.image || "").trim();
    const isDataImage = image.startsWith("data:image/");
    const isHttpImage = /^https?:\/\//i.test(image);
    if (!image || (!isDataImage && !isHttpImage)) {
      errors.push("Image must be a valid URL or uploaded image data");
    }
  }

  return errors;
}

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
    const validationErrors = validateProductPayload(req.body, false);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors[0], errors: validationErrors });
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
    const validationErrors = validateProductPayload(updates, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors[0], errors: validationErrors });
    }
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
