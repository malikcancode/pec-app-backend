const express = require("express");
const router = express.Router();
const {
  sendOtpHandler,
  registerWithOtp,
  loginWithOtp,
  registerWithUsername,
  loginWithUsername,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// OTP flow
router.post("/send-otp", sendOtpHandler);
router.post("/register", registerWithOtp);
router.post("/login", loginWithOtp);

// Username/password flow
router.post("/register-username", registerWithUsername);
router.post("/login-username", loginWithUsername);

// Profile
router.get("/me", protect, getMe);

module.exports = router;
