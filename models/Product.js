const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Gadgets",
        "Electronics",
        "Shoes",
        "Shirts",
        "Books",
        "Home Decores",
        "Health & Wellness",
      ],
    },
    image: { type: String }, // Path to the image (can be URL or local file path)
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
