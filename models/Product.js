const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: String,
    price: Number,
    benefitPercentage: Number, // e.g., 10%
    durationHours: Number, // 24-72
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
