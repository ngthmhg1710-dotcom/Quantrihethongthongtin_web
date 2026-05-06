const mongoose = require("mongoose");

const shippingAddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home", trim: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, default: "", trim: true },
    zipCode: { type: String, default: "", trim: true },
    country: { type: String, required: true, trim: true },
    /** Phường / xã (tách khỏi dòng địa chỉ chi tiết) */
    ward: { type: String, default: "", trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const savedPaymentMethodSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Card", trim: true },
    cardName: { type: String, required: true, trim: true },
    brand: { type: String, default: "Card", trim: true },
    last4: { type: String, required: true, trim: true },
    expiryDate: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const savedCartItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    hasUsablePassword: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    refreshToken: { type: String, default: null },
    phone: { type: String, default: "", trim: true },
    defaultShippingAddress: {
      name: { type: String, default: "", trim: true },
      address: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      district: { type: String, default: "", trim: true },
      zipCode: { type: String, default: "", trim: true },
      country: { type: String, default: "", trim: true },
      ward: { type: String, default: "", trim: true },
    },
    shippingAddresses: { type: [shippingAddressSchema], default: [] },
    savedPaymentMethods: { type: [savedPaymentMethodSchema], default: [] },
    wishlistIds: { type: [Number], default: [] },
    savedCartItems: { type: [savedCartItemSchema], default: [] },
    /** Điểm tích lũy (cộng tự động sau mỗi đơn hàng thành công) */
    loyaltyPoints: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
