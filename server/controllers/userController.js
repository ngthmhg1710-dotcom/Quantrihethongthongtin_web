const User = require("../models/User");

function userProfile(req, res) {
  return res.json({
    message: "User profile",
    user: req.user,
  });
}

async function updateUserProfile(req, res) {
  try {
    const { name, phone, defaultShippingAddress, shippingAddresses } = req.body;
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
      const normalizedPhone = phone.trim();
      if (normalizedPhone && !/^[0-9+\-() ]{8,20}$/.test(normalizedPhone)) {
        return res.status(400).json({ message: "Phone number format is invalid" });
      }
      user.phone = normalizedPhone;
    }

    if (defaultShippingAddress && typeof defaultShippingAddress === "object") {
      const nextAddress = {
        name: String(defaultShippingAddress.name || "").trim(),
        address: String(defaultShippingAddress.address || "").trim(),
        city: String(defaultShippingAddress.city || "").trim(),
        zipCode: String(defaultShippingAddress.zipCode || "").trim(),
        country: String(defaultShippingAddress.country || "").trim(),
      };

      const hasAnyAddressField = Object.values(nextAddress).some(Boolean);
      const hasAllAddressFields = Object.values(nextAddress).every(Boolean);
      if (hasAnyAddressField && !hasAllAddressFields) {
        return res.status(400).json({ message: "Please fill all shipping address fields" });
      }
      user.defaultShippingAddress = nextAddress;
    }

    if (Array.isArray(shippingAddresses)) {
      const normalizedAddresses = shippingAddresses.map((item, index) => ({
        label: String(item?.label || `Address ${index + 1}`).trim() || `Address ${index + 1}`,
        name: String(item?.name || "").trim(),
        address: String(item?.address || "").trim(),
        city: String(item?.city || "").trim(),
        zipCode: String(item?.zipCode || "").trim(),
        country: String(item?.country || "").trim(),
        isDefault: Boolean(item?.isDefault),
      }));

      const invalidAddress = normalizedAddresses.find(
        (item) => !item.name || !item.address || !item.city || !item.zipCode || !item.country
      );
      if (invalidAddress) {
        return res.status(400).json({ message: "Each saved address must have full information" });
      }

      if (normalizedAddresses.length > 0) {
        const hasDefault = normalizedAddresses.some((item) => item.isDefault);
        if (!hasDefault) normalizedAddresses[0].isDefault = true;
        let markedDefault = false;
        user.shippingAddresses = normalizedAddresses.map((item) => {
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
            zipCode: chosenDefault.zipCode,
            country: chosenDefault.country,
          };
        }
      } else {
        user.shippingAddresses = [];
      }
    }

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user: {
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
          ? user.shippingAddresses.map((item) => ({
              id: item._id.toString(),
              label: item.label || "Home",
              name: item.name || "",
              address: item.address || "",
              city: item.city || "",
              zipCode: item.zipCode || "",
              country: item.country || "",
              isDefault: Boolean(item.isDefault),
            }))
          : [],
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile" });
  }
}

module.exports = {
  userProfile,
  updateUserProfile,
};
