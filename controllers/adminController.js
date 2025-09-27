const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

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

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
};
