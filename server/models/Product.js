const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    user: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    date: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    image: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: { type: [String], default: [] },
    skinTypes: { type: [String], default: ["all"] },
    rating: { type: Number, default: 0 },
    reviews: { type: [reviewSchema], default: [] },
    featured: { type: Boolean, default: false },
    step: { type: Number },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Product", productSchema);
