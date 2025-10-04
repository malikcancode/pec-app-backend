const KYC = require("../models/KYC");
const cloudinary = require("../middleware/cloudinary"); // ✅ import cloudinary

// Upload helper for buffers → Cloudinary
const uploadToCloudinary = async (file, folder) => {
  return await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    { folder }
  );
};

exports.createKYC = async (req, res) => {
  try {
    const userId = req.user?._id; // comes from `protect` middleware
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { name, address, phone, idType, idNumber } = req.body;

    // Check for existing pending KYC for this user
    const existingKYC = await KYC.findOne({ user: userId, status: "pending" });
    if (existingKYC) {
      return res
        .status(400)
        .json({ error: "You already have a KYC pending review." });
    }

    let idFrontUrl = null;
    let idBackUrl = null;

    if (req.files?.idFront) {
      const result = await uploadToCloudinary(req.files.idFront[0], "kyc");
      idFrontUrl = result.secure_url;
    }

    if (req.files?.idBack) {
      const result = await uploadToCloudinary(req.files.idBack[0], "kyc");
      idBackUrl = result.secure_url;
    }

    const newKYC = new KYC({
      user: userId, // assign user here
      name,
      address,
      phone,
      idType,
      idNumber,
      idFront: idFrontUrl,
      idBack: idBackUrl,
      status: "pending",
    });

    await newKYC.save();
    res.status(201).json(newKYC);
  } catch (err) {
    console.error("Error creating KYC:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get all KYC
exports.getAllKYC = async (req, res) => {
  try {
    const kycs = await KYC.find().sort({ createdAt: -1 });
    res.json(kycs);
  } catch (err) {
    console.error("Error fetching KYCs:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get KYC by ID
exports.getKYCById = async (req, res) => {
  try {
    const kyc = await KYC.findById(req.params.id);
    if (!kyc) return res.status(404).json({ error: "KYC not found" });
    res.json(kyc);
  } catch (err) {
    console.error("Error fetching KYC:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get Current User's KYC (by token)
exports.getMyKYC = async (req, res) => {
  try {
    const myKYC = await KYC.findOne({ user: req.user._id });

    if (!myKYC) return res.status(404).json({ message: "No KYC record found" });

    res.status(200).json(myKYC);
  } catch (err) {
    console.error("Error fetching user KYC:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Update KYC
exports.updateKYC = async (req, res) => {
  try {
    let updatedData = { ...req.body };

    if (req.files?.idFront) {
      const result = await uploadToCloudinary(req.files.idFront[0], "kyc");
      updatedData.idFront = result.secure_url;
    }

    if (req.files?.idBack) {
      const result = await uploadToCloudinary(req.files.idBack[0], "kyc");
      updatedData.idBack = result.secure_url;
    }

    const kyc = await KYC.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });

    if (!kyc) return res.status(404).json({ error: "KYC not found" });

    res.json(kyc);
  } catch (err) {
    console.error("Error updating KYC:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Delete KYC
exports.deleteKYC = async (req, res) => {
  try {
    const kyc = await KYC.findByIdAndDelete(req.params.id);
    if (!kyc) return res.status(404).json({ error: "KYC not found" });

    res.json({ message: "KYC deleted successfully" });
  } catch (err) {
    console.error("Error deleting KYC:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
