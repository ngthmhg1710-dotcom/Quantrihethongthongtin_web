const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Product = require("../models/Product");
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
    await Product.insertMany(missingProducts);
    console.log(`Seeded ${missingProducts.length} products`);
  }
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
  seedProductsIfNeeded,
  seedUsersIfNeeded,
};
