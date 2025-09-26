const Product = require("../models/Product");

// Create product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const image = req.file ? req.file.path : null; // Assuming Multer stores image file

    const product = new Product({
      name,
      price,
      category,
      image,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error creating product", error: err });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error fetching product", error: err });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, category } = req.body;
  const image = req.file ? req.file.path : null; // Get the new image if it's uploaded

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the fields, but keep the previous image if not updated
    product.name = name || product.name;
    product.price = price || product.price;
    product.category = category || product.category;

    if (image) {
      product.image = image; // Only update image if a new one is uploaded
    }

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error updating product", error: err });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Use `findByIdAndDelete` instead of `remove`
    await Product.findByIdAndDelete(id);

    // Send success response
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    // Log detailed error for debugging
    console.error("Error deleting product:", err);

    // Return error message to the frontend
    res
      .status(500)
      .json({ message: "Error deleting product", error: err.message });
  }
};
