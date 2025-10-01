const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    idType: { type: String, required: true },
    idNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    idFront: { type: String, required: true }, // Cloudinary URL
    idBack: { type: String, required: true }, // Cloudinary URL
  },
  { timestamps: true }
);

module.exports = mongoose.model("KYC", kycSchema);
