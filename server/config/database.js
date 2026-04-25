const mongoose = require("mongoose");
const Product = require("../models/Product");
const seedProducts = require("../data/seedProducts");

async function connectDatabase(mongoUri) {
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
}

async function seedProductsIfNeeded() {
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany(seedProducts);
    console.log("Seeded initial products");
  }
}

module.exports = {
  connectDatabase,
  seedProductsIfNeeded,
};
