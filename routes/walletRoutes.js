// routes/walletRoutes.js
const express = require("express");
const router = express.Router();
const {
  getWallet,
  createDeposit,
  confirmDeposit,
  createWithdraw,
  approveWithdraw,
} = require("../controllers/walletController");
const { protect } = require("../middleware/authMiddleware");

// User wallet routes
router.get("/", protect, getWallet);
router.post("/deposit", protect, createDeposit);
router.post("/withdraw", protect, createWithdraw);

// Admin/test manual routes
router.patch("/confirm/:id", confirmDeposit);
router.patch("/approve/:id", approveWithdraw);

module.exports = router;
