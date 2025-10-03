// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: null },
  passwordHash: { type: String },
  otp: { type: String },
  otpExpires: { type: Date },
  referralCode: { type: String },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  accountLevel: { type: Number, default: 1 },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  profileImage: { type: String, default: null },
  balance: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", userSchema);
