// models/WalletTransaction.js
const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["deposit", "withdraw"], required: true },
    method: {
      type: String,
      enum: ["Bank Transfer", "Easypaisa", "JazzCash", "Bkash", "Nagad", "UPI"],
      required: true,
    },
    accountName: { type: String }, // ✅ added
    accountNumber: { type: String }, // ✅ added
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
