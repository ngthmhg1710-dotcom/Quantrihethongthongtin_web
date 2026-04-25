const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
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
  me,
  refresh,
  logout,
};
