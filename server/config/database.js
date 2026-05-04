const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");
const seedProducts = require("../data/seedProducts");

async function connectDatabase(mongoUri) {
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
}

async function seedProductsIfNeeded() {
  const existingProducts = await Product.find({}, { id: 1 }).lean();
  const existingIds = new Set(existingProducts.map((product) => product.id));
  const missingProducts = seedProducts.filter((product) => !existingIds.has(product.id));

  if (missingProducts.length > 0) {
    const categoryCache = new Map();
    const mapped = [];
    for (const product of missingProducts) {
      const categoryName = String(product.category || "General").trim() || "General";
      let categoryId = categoryCache.get(categoryName);
      if (!categoryId) {
        const categoryDoc = await Category.findOneAndUpdate(
          { name: categoryName },
          { $setOnInsert: { name: categoryName, description: "" } },
          { upsert: true, returnDocument: "after" }
        );
        categoryId = categoryDoc._id;
        categoryCache.set(categoryName, categoryId);
      }
      mapped.push({ ...product, category: categoryId });
    }
    await Product.insertMany(mapped);
    console.log(`Seeded ${missingProducts.length} products`);
  }

  // Đồng bộ dữ liệu catalog từ seed (tên, mô tả, giá, loại da, …) cho sản phẩm đã có — kèm đường ảnh khi deploy
  try {
    const categoryCache = new Map();
    for (const product of seedProducts) {
      const categoryName = String(product.category || "General").trim() || "General";
      let categoryId = categoryCache.get(categoryName);
      if (!categoryId) {
        const categoryDoc = await Category.findOneAndUpdate(
          { name: categoryName },
          { $setOnInsert: { name: categoryName, description: "" } },
          { upsert: true, returnDocument: "after" }
        );
        categoryId = categoryDoc._id;
        categoryCache.set(categoryName, categoryId);
      }

      const setDoc = {
        name: product.name,
        price: product.price,
        image: product.image,
        category: categoryId,
        description: product.description,
        ingredients: product.ingredients,
        skinTypes: product.skinTypes,
        rating: product.rating,
        reviews: product.reviews || [],
        featured: Boolean(product.featured),
        step: product.step,
      };
      if (product.stock !== undefined) setDoc.stock = product.stock;

      await Product.updateOne({ id: product.id }, { $set: setDoc }, { upsert: false });
    }
  } catch (err) {
    console.error("Product seed sync failed:", err);
  }
}

async function migrateProductCategoriesIfNeeded() {
  const productsWithStringCategory = await Product.find({ category: { $type: "string" } }).lean();
  if (productsWithStringCategory.length === 0) return;

  const categoryCache = new Map();
  for (const product of productsWithStringCategory) {
    const categoryName = String(product.category || "General").trim() || "General";
    let categoryId = categoryCache.get(categoryName);
    if (!categoryId) {
      const categoryDoc = await Category.findOneAndUpdate(
        { name: categoryName },
        { $setOnInsert: { name: categoryName, description: "" } },
        { upsert: true, returnDocument: "after" }
      );
      categoryId = categoryDoc._id;
      categoryCache.set(categoryName, categoryId);
    }
    await Product.updateOne({ _id: product._id }, { $set: { category: categoryId } });
  }
  console.log(`Migrated ${productsWithStringCategory.length} products to category refs`);
}

async function seedUsersIfNeeded() {
  const defaultUsers = [
    {
      name: "Admin",
      email: "jwtadmin@example.com",
      password: "abc12345",
      isAdmin: true,
    },
    {
      name: "User",
      email: "ngthmhg1710@gmail.com",
      password: "123456",
      isAdmin: false,
    },
  ];

  for (const seedUser of defaultUsers) {
    const normalizedEmail = seedUser.email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) continue;

    const hashedPassword = await bcrypt.hash(seedUser.password, 10);
    await User.create({
      name: seedUser.name,
      email: normalizedEmail,
      password: hashedPassword,
      isAdmin: seedUser.isAdmin,
    });
    console.log(`Seeded user ${normalizedEmail}`);
  }
}

module.exports = {
  connectDatabase,
  migrateProductCategoriesIfNeeded,
  seedProductsIfNeeded,
  seedUsersIfNeeded,
};
