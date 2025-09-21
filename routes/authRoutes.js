const express = require("express");
const router = express.Router();
const {
  sendOtpHandler,
  registerWithOtp,
  loginWithOtp,
  getMe,
} = require("../controllers/authController"); // adjust path
const { protect } = require("../middleware/authMiddleware");

// --- Routes ---
router.post("/send-otp", sendOtpHandler);
router.post("/register", registerWithOtp);
router.post("/login", loginWithOtp);
router.get("/me", protect, getMe);

module.exports = router;
