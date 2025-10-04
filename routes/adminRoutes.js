const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getAllUsers,
  deleteUserById,
  verifyOrRejectKYC,
} = require("../controllers/adminController");
const { admin, adminProtect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register Admin
router.post("/register", registerAdmin);

// Login Admin
router.post("/login", loginAdmin);

router.get("/users", adminProtect, admin, getAllUsers);

router.put("/verify/:id", adminProtect, admin, verifyOrRejectKYC);

router.get("/admin-profile", adminProtect, admin, getAdminProfile);
router.delete("/users/:id", adminProtect, deleteUserById); // DELETE route to delete a user

module.exports = router;
