const mongoose = require("mongoose");

const shippingAddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home", trim: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    refreshToken: { type: String, default: null },
    phone: { type: String, default: "", trim: true },
    defaultShippingAddress: {
      name: { type: String, default: "", trim: true },
      address: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      zipCode: { type: String, default: "", trim: true },
      country: { type: String, default: "", trim: true },
    },
    shippingAddresses: { type: [shippingAddressSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
