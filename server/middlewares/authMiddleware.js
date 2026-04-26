const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: token missing" });
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.userId).lean();

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      phone: user.phone || "",
      defaultShippingAddress: {
        name: user.defaultShippingAddress?.name || "",
        address: user.defaultShippingAddress?.address || "",
        city: user.defaultShippingAddress?.city || "",
        zipCode: user.defaultShippingAddress?.zipCode || "",
        country: user.defaultShippingAddress?.country || "",
      },
      shippingAddresses: Array.isArray(user.shippingAddresses)
        ? user.shippingAddresses.map((address) => ({
            id: address._id?.toString?.() || "",
            label: address.label || "Home",
            name: address.name || "",
            address: address.address || "",
            city: address.city || "",
            zipCode: address.zipCode || "",
            country: address.country || "",
            isDefault: Boolean(address.isDefault),
          }))
        : [],
      savedPaymentMethods: Array.isArray(user.savedPaymentMethods)
        ? user.savedPaymentMethods.map((method) => ({
            id: method._id?.toString?.() || "",
            label: method.label || "Card",
            cardName: method.cardName || "",
            brand: method.brand || "Card",
            last4: method.last4 || "",
            expiryDate: method.expiryDate || "",
            isDefault: Boolean(method.isDefault),
          }))
        : [],
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Forbidden: admin access required" });
  }
  return next();
}

module.exports = {
  protect,
  requireAdmin,
};
