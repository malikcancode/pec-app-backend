const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../middleware/multer"); // Import multer middleware

// Create Product (Admin only)
router.post("/create", upload.single("image"), productController.createProduct);

// Get all products
router.get("/", productController.getProducts);

// Get a product by ID
router.get("/:id", productController.getProductById);

// Update Product (Admin only)
router.put("/:id", upload.single("image"), productController.updateProduct);

// Delete Product (Admin only)
router.delete("/:id", productController.deleteProduct);

module.exports = router;
