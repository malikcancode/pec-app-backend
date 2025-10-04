const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    phone: String,
    email: String,
    idType: String,
    idNumber: String,
    idFront: String,
    idBack: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KYC", kycSchema);
