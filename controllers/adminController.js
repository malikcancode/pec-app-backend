const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register Admin
const registerAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const adminExists = await Admin.findOne({ username });
    if (adminExists) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const admin = new Admin({
      username,
      password,
    });

    await admin.save();

    const token = generateToken(admin._id);

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: {
        _id: admin._id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Login
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ error: "Admin does not exist" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = generateToken(admin._id);

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        _id: admin._id,
        username: admin.username,
        // email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json({
      _id: admin._id,
      username: admin.username,
      role: admin.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// --- Get all users (No role-based validation) ---
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password field
    res.json({ users });
  } catch (err) {
    console.error("Get all users error:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// --- Delete user by ID ---
const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params; // Get user ID from the URL parameter

    // Use findByIdAndDelete to remove the user
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getAllUsers,
  deleteUserById, // Add the deleteUserById function here
};
