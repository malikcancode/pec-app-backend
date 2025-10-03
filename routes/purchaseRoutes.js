const express = require("express");
const {
  buyProduct,
  getMyPurchases,
  getAllPurchases,
  claimProfit,
} = require("../controllers/purchaseController");
const { adminProtect, protect } = require("../middleware/authMiddleware");

const router = express.Router();

// User buys a product
router.post("/buy", protect, buyProduct);

// User fetch own purchases
router.get("/my", protect, getMyPurchases);

// Admin fetch all purchases
router.get("/all", adminProtect, getAllPurchases);
router.post("/claim-profit", protect, claimProfit);

module.exports = router;
