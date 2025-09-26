const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");
const walletRoutes = require("./routes/walletRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const mongoose = require("mongoose");

const app = express();

// ✅ Connect to MongoDB Atlas (serverless-safe)
connectDB();

// ✅ CORS setup for local dev + deployed frontend
const allowedOrigins = [
  "http://localhost:5173",
  "https://pec-app-frontend.vercel.app",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  // ✅ Handle OPTIONS preflight request
  if (req.method === "OPTIONS") return res.sendStatus(200);

  next();
});

// ✅ Body parser
app.use(express.json());

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/products", productRoutes); // Add product routes here

// ✅ Local dev mode only
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}

// ✅ Export app for Vercel serverless
module.exports = app;
