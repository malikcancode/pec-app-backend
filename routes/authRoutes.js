const express = require("express");
const {
  sendOtpHandler,
  registerWithOtp,
  loginWithOtp,
  registerWithUsername,
  loginWithUsername,
  getMe,
} = require("../controllers/authController");

const router = express.Router();

// OTP-based routes
router.post("/send-otp", sendOtpHandler); // Send OTP to email
router.post("/register-otp", registerWithOtp); // Register using OTP
router.post("/login-otp", loginWithOtp); // Login using OTP

// Username/Password-based routes
router.post("/register-username", registerWithUsername); // Register with username
router.post("/login-username", loginWithUsername); // Login with username

// Profile route (after authentication)
router.get("/me", getMe);

module.exports = router;
