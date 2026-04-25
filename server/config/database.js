const mongoose = require("mongoose");
const Product = require("../models/Product");
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
    await Product.insertMany(missingProducts);
    console.log(`Seeded ${missingProducts.length} products`);
  }
}

module.exports = {
  connectDatabase,
  seedProductsIfNeeded,
};
