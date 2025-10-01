const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");
const walletRoutes = require("./routes/walletRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes"); // Import admin routes
const kycRoutes = require("./routes/kycRoutes"); // Import admin routes

const app = express();

connectDB();

// ✅ CORS setup for local dev + deployed frontend
const allowedOrigins = [
  "http://localhost:5173", // Local development frontend
  "https://pec-app-frontend.vercel.app", // Deployed frontend
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow the allowed origins only
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true"); // Allow credentials like cookies or authorization headers
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS"); // Allowed methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization"); // Allowed headers

  // ✅ Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // Respond with 200 OK to the preflight request
  }

  next(); // Continue processing the actual request
});

// ✅ Body parser
app.use(express.json());

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); // Add admin routes here
app.use("/api/wallet", walletRoutes);
app.use("/api/products", productRoutes); // Add product routes here
app.use("/api/kyc", kycRoutes);

// ✅ Local dev mode only
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}

// ✅ Export app for Vercel serverless
module.exports = app;
