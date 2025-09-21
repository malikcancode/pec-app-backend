import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    releaseDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", purchaseSchema);
