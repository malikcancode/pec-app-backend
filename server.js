const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");
const walletRoutes = require("./routes/walletRoutes");
const authRoutes = require("./routes/authRoutes");
const mongoose = require("mongoose");

// ✅ connect to MongoDB Atlas (serverless-safe)
connectDB();

const app = express();

// ✅ CORS setup (local + vercel frontend)
app.use(
  cors({
    origin: ["http://localhost:5173", "https://pec-app-frontend.vercel.app/"],
    credentials: true,
  })
);

app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);

app.get("/api/test-db", (req, res) => {
  const state = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  res.json({
    connected: state === 1,
    state,
    host: mongoose.connection.host,
    db: mongoose.connection.name,
  });
});

// ✅ Local dev mode only
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}

// ✅ Export app for Vercel serverless
module.exports = app;
