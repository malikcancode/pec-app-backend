const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer"); // ✅ memoryStorage
const {
  createKYC,
  getAllKYC,
  getKYCById,
  updateKYC,
  deleteKYC,
} = require("../controllers/kycController");

// Routes
router.post(
  "/",
  upload.fields([{ name: "idFront" }, { name: "idBack" }]),
  createKYC
);

router.get("/", getAllKYC);
router.get("/:id", getKYCById);

router.put(
  "/:id",
  upload.fields([{ name: "idFront" }, { name: "idBack" }]),
  updateKYC
);

router.delete("/:id", deleteKYC);

module.exports = router;
