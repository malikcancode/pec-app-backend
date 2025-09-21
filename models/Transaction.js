const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["deposit", "withdraw"], required: true },
    amount: { type: Number, required: true },
    // method: { type: String, enum: ["USDT", "BankManual"], required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    referenceId: { type: String }, // txn hash or bank slip id
    walletAddress: { type: String }, // for withdrawals
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
