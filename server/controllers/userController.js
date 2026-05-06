const User = require("../models/User");
const { normalizePhoneInput, isValidPhoneNormalized } = require("../utils/phone");

function normalizeWishlistIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))];
}

function normalizeSavedCartItems(value) {
  if (!Array.isArray(value)) return [];
  const bucket = new Map();
  for (const item of value) {
    const productId = Number(item?.productId);
    const quantity = Number(item?.quantity);
    if (!Number.isInteger(productId) || productId <= 0) continue;
    if (!Number.isInteger(quantity) || quantity <= 0) continue;
    bucket.set(productId, (bucket.get(productId) || 0) + quantity);
  }
  return Array.from(bucket.entries()).map(([productId, quantity]) => ({ productId, quantity }));
}

function addressIdentityKey(item) {
  return [
    String(item?.name || "").trim().toLowerCase(),
    String(item?.address || "").trim().toLowerCase(),
    String(item?.ward || "").trim().toLowerCase(),
    String(item?.city || "").trim().toLowerCase(),
    String(item?.district || item?.zipCode || "").trim().toLowerCase(),
    String(item?.country || "").trim().toLowerCase(),
  ].join("|");
}

function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    hasUsablePassword: user.hasUsablePassword !== false,
    isAdmin: user.isAdmin,
    phone: user.phone || "",
    defaultShippingAddress: {
      name: user.defaultShippingAddress?.name || "",
      address: user.defaultShippingAddress?.address || "",
      city: user.defaultShippingAddress?.city || "",
      district: user.defaultShippingAddress?.district || "",
      zipCode: user.defaultShippingAddress?.zipCode || "",
      country: user.defaultShippingAddress?.country || "",
      ward: user.defaultShippingAddress?.ward || "",
    },
    shippingAddresses: Array.isArray(user.shippingAddresses)
      ? user.shippingAddresses.map((item) => ({
          id: item._id.toString(),
          label: item.label || "Home",
          name: item.name || "",
          address: item.address || "",
          city: item.city || "",
          district: item.district || "",
          zipCode: item.zipCode || "",
          country: item.country || "",
          ward: item.ward || "",
          isDefault: Boolean(item.isDefault),
        }))
      : [],
    savedPaymentMethods: Array.isArray(user.savedPaymentMethods)
      ? user.savedPaymentMethods.map((item) => ({
          id: item._id.toString(),
          label: item.label || "Card",
          cardName: item.cardName || "",
          brand: item.brand || "Card",
          last4: item.last4 || "",
          expiryDate: item.expiryDate || "",
          isDefault: Boolean(item.isDefault),
        }))
      : [],
    wishlistIds: normalizeWishlistIds(user.wishlistIds),
    savedCartItems: normalizeSavedCartItems(user.savedCartItems),
    loyaltyPoints: Math.max(0, Math.floor(Number(user.loyaltyPoints) || 0)),
  };
}

function userProfile(req, res) {
  return res.json({
    message: "User profile",
    user: req.user,
  });
}

async function updateUserProfile(req, res) {
  try {
    const { name, phone, defaultShippingAddress, shippingAddresses, savedPaymentMethods } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (typeof name === "string") {
      const normalizedName = name.trim();
      if (normalizedName.length < 2) {
        return res.status(400).json({ message: "Name must be at least 2 characters" });
      }
      user.name = normalizedName;
    }

    if (typeof phone === "string") {
      const normalizedPhone = normalizePhoneInput(phone);
      if (normalizedPhone && !isValidPhoneNormalized(normalizedPhone)) {
        return res.status(400).json({ message: "Phone number format is invalid" });
      }
      user.phone = normalizedPhone;
    }

    if (defaultShippingAddress && typeof defaultShippingAddress === "object") {
      const nextAddress = {
        name: String(defaultShippingAddress.name || "").trim(),
        address: String(defaultShippingAddress.address || "").trim(),
        city: String(defaultShippingAddress.city || "").trim(),
        district: String(defaultShippingAddress.district || "").trim(),
        zipCode: "",
        country: String(defaultShippingAddress.country || "").trim(),
        ward: String(defaultShippingAddress.ward || "").trim(),
      };

      const addressParts = [nextAddress.name, nextAddress.address, nextAddress.city, nextAddress.district, nextAddress.country];
      const hasAnyAddressField = addressParts.some(Boolean);
      const hasAllAddressFields = addressParts.every(Boolean);
      if (hasAnyAddressField && !hasAllAddressFields) {
        return res.status(400).json({ message: "Please fill all shipping address fields" });
      }
      user.defaultShippingAddress = nextAddress;
    }

    if (Array.isArray(shippingAddresses)) {
      const normalizedAddresses = shippingAddresses.map((item, index) => {
        const rawDistrict = String(item?.district || "").trim();
        const rawZip = String(item?.zipCode || "").trim();
        const district = rawDistrict || rawZip;
        return {
          label: String(item?.label || `Address ${index + 1}`).trim() || `Address ${index + 1}`,
          name: String(item?.name || "").trim(),
          address: String(item?.address || "").trim(),
          city: String(item?.city || "").trim(),
          district,
          zipCode: "",
          country: String(item?.country || "").trim(),
          ward: String(item?.ward || "").trim(),
          isDefault: Boolean(item?.isDefault),
        };
      });
      const dedupedAddresses = [];
      const dedupeIndexByKey = new Map();
      normalizedAddresses.forEach((item) => {
        const key = addressIdentityKey(item);
        const existingIndex = dedupeIndexByKey.get(key);
        if (existingIndex == null) {
          dedupeIndexByKey.set(key, dedupedAddresses.length);
          dedupedAddresses.push(item);
          return;
        }
        if (item.isDefault) {
          dedupedAddresses[existingIndex] = { ...dedupedAddresses[existingIndex], isDefault: true };
        }
      });

      const invalidAddress = dedupedAddresses.find(
        (item) => !item.name || !item.address || !item.city || !item.district || !item.country
      );
      if (invalidAddress) {
        return res.status(400).json({
          message:
            "Mỗi địa chỉ đã lưu cần đủ: họ tên, địa chỉ, thành phố, quận/huyện, quốc gia. Kiểm tra quận/huyện (chọn trong danh sách, không để trống).",
        });
      }

      if (dedupedAddresses.length > 0) {
        const hasDefault = dedupedAddresses.some((item) => item.isDefault);
        if (!hasDefault) dedupedAddresses[0].isDefault = true;
        let markedDefault = false;
        user.shippingAddresses = dedupedAddresses.map((item) => {
          if (!markedDefault && item.isDefault) {
            markedDefault = true;
            return item;
          }
          return { ...item, isDefault: false };
        });
        const chosenDefault = user.shippingAddresses.find((item) => item.isDefault);
        if (chosenDefault) {
          user.defaultShippingAddress = {
            name: chosenDefault.name,
            address: chosenDefault.address,
            city: chosenDefault.city,
            district: chosenDefault.district,
            zipCode: "",
            country: chosenDefault.country,
            ward: chosenDefault.ward || "",
          };
        }
      } else {
        user.shippingAddresses = [];
      }
    }

    if (Array.isArray(savedPaymentMethods)) {
      const normalizedMethods = savedPaymentMethods.map((item, index) => ({
        label: String(item?.label || `Card ${index + 1}`).trim() || `Card ${index + 1}`,
        cardName: String(item?.cardName || "").trim(),
        brand: String(item?.brand || "Card").trim() || "Card",
        last4: String(item?.last4 || "").trim(),
        expiryDate: String(item?.expiryDate || "").trim(),
        isDefault: Boolean(item?.isDefault),
      }));

      const invalidMethod = normalizedMethods.find(
        (item) =>
          !item.cardName ||
          !/^\d{4}$/.test(item.last4) ||
          !/^(0[1-9]|1[0-2])\/\d{2}$/.test(item.expiryDate)
      );
      if (invalidMethod) {
        return res.status(400).json({ message: "Each saved payment method must have valid card data" });
      }

      if (normalizedMethods.length > 0) {
        const hasDefault = normalizedMethods.some((item) => item.isDefault);
        if (!hasDefault) normalizedMethods[0].isDefault = true;
        let markedDefault = false;
        user.savedPaymentMethods = normalizedMethods.map((item) => {
          if (!markedDefault && item.isDefault) {
            markedDefault = true;
            return item;
          }
          return { ...item, isDefault: false };
        });
      } else {
        user.savedPaymentMethods = [];
      }
    }

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile" });
  }
}

async function getWishlist(req, res) {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ wishlistIds: normalizeWishlistIds(user.wishlistIds) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get wishlist" });
  }
}

async function updateWishlist(req, res) {
  try {
    const normalizedWishlistIds = normalizeWishlistIds(req.body?.wishlistIds);
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.wishlistIds = normalizedWishlistIds;
    await user.save();
    return res.json({
      message: "Wishlist updated successfully",
      wishlistIds: normalizedWishlistIds,
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update wishlist" });
  }
}

async function getCart(req, res) {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ savedCartItems: normalizeSavedCartItems(user.savedCartItems) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get cart" });
  }
}

async function updateCart(req, res) {
  try {
    const normalizedSavedCartItems = normalizeSavedCartItems(req.body?.savedCartItems);
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.savedCartItems = normalizedSavedCartItems;
    await user.save();
    return res.json({
      message: "Cart updated successfully",
      savedCartItems: normalizedSavedCartItems,
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update cart" });
  }
}

module.exports = {
  userProfile,
  updateUserProfile,
  getWishlist,
  updateWishlist,
  getCart,
  updateCart,
};
