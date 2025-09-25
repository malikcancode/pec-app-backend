const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true },
    passwordHash: { type: String }, // make optional for OTP-first registration
    otp: String,
    otpExpires: Date,
    isVerified: { type: Boolean, default: false },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    walletBalance: { type: Number, default: 0 },

    referralCode: { type: String, unique: true },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    accountLevel: { type: Number, default: 1 }, // 1-10
    totalDeposit: { type: Number, default: 0 },

    team: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
