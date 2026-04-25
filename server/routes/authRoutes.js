const express = require("express");
const { register, login, loginWithGoogle, me, refresh, logout } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/google", loginWithGoogle);
router.get("/auth/me", protect, me);
router.post("/auth/refresh", refresh);
router.post("/auth/logout", logout);

module.exports = router;
