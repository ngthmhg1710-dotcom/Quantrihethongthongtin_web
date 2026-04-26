const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const env = require("../config/env");

const googleOAuthClient = new OAuth2Client();

function sanitizeUser(user) {
  const shippingAddresses = Array.isArray(user.shippingAddresses)
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
    : [];
  const defaultAddressFromBook = shippingAddresses.find((address) => address.isDefault) || shippingAddresses[0];
  const savedPaymentMethods = Array.isArray(user.savedPaymentMethods)
    ? user.savedPaymentMethods.map((method) => ({
        id: method._id?.toString?.() || "",
        label: method.label || "Card",
        cardName: method.cardName || "",
        brand: method.brand || "Card",
        last4: method.last4 || "",
        expiryDate: method.expiryDate || "",
        isDefault: Boolean(method.isDefault),
      }))
    : [];
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    phone: user.phone || "",
    defaultShippingAddress: {
      name: defaultAddressFromBook?.name || user.defaultShippingAddress?.name || "",
      address: defaultAddressFromBook?.address || user.defaultShippingAddress?.address || "",
      city: defaultAddressFromBook?.city || user.defaultShippingAddress?.city || "",
      zipCode: defaultAddressFromBook?.zipCode || user.defaultShippingAddress?.zipCode || "",
      country: defaultAddressFromBook?.country || user.defaultShippingAddress?.country || "",
    },
    shippingAddresses,
    savedPaymentMethods,
  };
}

function signToken(user) {
  return jwt.sign({ userId: user._id.toString(), isAdmin: user.isAdmin }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function signRefreshToken(user) {
  return jwt.sign({ userId: user._id.toString() }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });
}

async function buildAuthResponse(user) {
  const token = signToken(user);
  const refreshToken = signRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: sanitizeUser(user),
    token,
    refreshToken,
  };
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isAdmin: false,
    });

    const authPayload = await buildAuthResponse(createdUser);
    return res.status(201).json({
      message: "Registered successfully",
      ...authPayload,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const authPayload = await buildAuthResponse(user);
    return res.json({
      message: "Login successful",
      ...authPayload,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login" });
  }
}

async function loginWithGoogle(req, res) {
  try {
    if (!env.googleClientId) {
      return res.status(503).json({ message: "Google OAuth is not configured on server" });
    }

    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Google ID token is required" });
    }

    const ticket = await googleOAuthClient.verifyIdToken({
      idToken,
      audience: env.googleClientId,
    });

    const payload = ticket.getPayload();
    const email = String(payload?.email || "").toLowerCase().trim();
    const name = String(payload?.name || "").trim() || "Google User";

    if (!email) {
      return res.status(400).json({ message: "Unable to get email from Google account" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10),
        isAdmin: false,
      });
    } else if (!user.name?.trim()) {
      user.name = name;
      await user.save();
    }

    const authPayload = await buildAuthResponse(user);
    return res.json({
      message: "Google login successful",
      ...authPayload,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Google login failed",
      detail: error instanceof Error ? error.message : undefined,
    });
  }
}

function me(req, res) {
  return res.json({
    message: "Token valid",
    user: req.user,
  });
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const authPayload = await buildAuthResponse(user);
    return res.json({
      message: "Token refreshed",
      ...authPayload,
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}

async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to logout" });
  }
}

module.exports = {
  register,
  login,
  loginWithGoogle,
  me,
  refresh,
  logout,
};
