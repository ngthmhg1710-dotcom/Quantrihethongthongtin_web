const Product = require("../models/Product");
const Category = require("../models/Category");

function toProductResponse(product) {
  const categoryName =
    product?.category && typeof product.category === "object"
      ? product.category.name
      : typeof product?.category === "string"
        ? product.category
        : "General";
  return {
    ...product,
    category: categoryName,
  };
}

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
    const products = await Product.find().populate("category", "name").sort({ id: 1 }).lean();
    return res.json(products.map(toProductResponse));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
}

async function getProductById(req, res) {
  try {
    const id = Number(req.params.id);
    const product = await Product.findOne({ id }).populate("category", "name").lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(toProductResponse(product));
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

    const categoryDoc = await Category.findOneAndUpdate(
      { name: normalizedCategory },
      { $setOnInsert: { name: normalizedCategory, description: "" } },
      { upsert: true, returnDocument: "after" }
    );

    const product = await Product.create({
      id: nextId,
      name: String(name).trim(),
      price: Number(price || 0),
      stock: Number(stock || 0),
      image: String(image).trim(),
      category: categoryDoc._id,
      description: String(description).trim(),
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      skinTypes: Array.isArray(skinTypes) ? skinTypes : ["all"],
      rating: 0,
      reviews: [],
      featured: Boolean(featured),
      step: step ? Number(step) : undefined,
    });

    const populated = await Product.findOne({ id: product.id }).populate("category", "name").lean();
    return res.status(201).json({ message: "Product created", product: toProductResponse(populated) });
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
      const categoryDoc = await Category.findOneAndUpdate(
        { name: normalizedCategory },
        { $setOnInsert: { name: normalizedCategory, description: "" } },
        { upsert: true, returnDocument: "after" }
      );
      updates.category = categoryDoc._id;
    }

    const product = await Product.findOneAndUpdate({ id }, updates, {
      returnDocument: "after",
    })
      .populate("category", "name")
      .lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json({ message: "Product updated", product: toProductResponse(product) });
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

async function addProductReview(req, res) {
  try {
    const id = Number(req.params.id);
    const { rating, comment } = req.body;

    const parsedRating = Number(rating);
    const normalizedComment = String(comment || "").trim();
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: "Rating must be an integer from 1 to 5" });
    }
    if (!normalizedComment || normalizedComment.length < 5) {
      return res.status(400).json({ message: "Comment must be at least 5 characters" });
    }

    const product = await Product.findOne({ id }).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviewerName = String(req.user?.name || "User").trim() || "User";
    const dateString = new Date().toISOString().split("T")[0];
    const safeReviews = Array.isArray(product.reviews)
      ? product.reviews
          .filter((review) => review && typeof review === "object" && review.user)
          .map((review) => {
            const parsedRating = Number(review.rating);
            return {
              id: Number.isFinite(Number(review.id)) ? Number(review.id) : 0,
              user: String(review.user || "").trim(),
              rating: Number.isFinite(parsedRating) ? parsedRating : 0,
              comment: String(review.comment || "").trim(),
              date: String(review.date || "").trim() || dateString,
            };
          })
          .filter(
            (review) =>
              review.user.length > 0 &&
              review.comment.length > 0 &&
              Number.isFinite(review.rating) &&
              review.rating >= 1 &&
              review.rating <= 5
          )
      : [];
    const nextReviewId = safeReviews.reduce((max, review) => Math.max(max, Number(review.id || 0)), 0) + 1;

    // Allow the same account to submit multiple reviews over time.
    safeReviews.push({
      id: nextReviewId,
      user: reviewerName,
      rating: parsedRating,
      comment: normalizedComment,
      date: dateString,
    });

    const totalRating = safeReviews.reduce((sum, review) => sum + review.rating, 0);
    const nextRating = safeReviews.length > 0 ? totalRating / safeReviews.length : 0;

    const updatedProduct = await Product.findOneAndUpdate(
      { id },
      { reviews: safeReviews, rating: nextRating },
      { new: true, runValidators: false }
    ).populate("category", "name").lean();

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(201).json({ message: "Review saved", product: toProductResponse(updatedProduct) });
  } catch (error) {
    console.error("addProductReview error:", error);
    return res.status(500).json({
      message: "Failed to add review",
      detail: error instanceof Error ? error.message : undefined,
    });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
};
