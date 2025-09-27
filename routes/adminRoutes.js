const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
} = require("../controllers/adminController");
const { admin, adminProtect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register Admin
router.post("/register", registerAdmin);

// Login Admin
router.post("/login", loginAdmin);

router.get("/admin-profile", adminProtect, admin, getAdminProfile);

module.exports = router;
