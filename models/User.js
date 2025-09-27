const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true }, // Email is optional and unique if provided
    passwordHash: { type: String }, // make optional for OTP-first registration
    otp: String,
    otpExpires: Date,
    isVerified: { type: Boolean, default: false },

    role: { type: String, enum: ["user"], default: "user" }, // Only "user" for regular users

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
