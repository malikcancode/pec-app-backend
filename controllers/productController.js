const Product = require("../models/Product");

// Create product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    console.log("Received request to create product:", req.body); // Log incoming request
    const { name, price, category } = req.body;
    const image = req.file ? req.file.path : null;

    const product = new Product({
      name,
      price,
      category,
      image,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("Error creating product:", err); // Log the actual error for debugging
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
  const image = req.file ? req.file.path : null;

  try {
    console.log(`Received request to update product with ID ${id}:`, req.body); // Log request data

    const product = await Product.findById(id);
    if (!product) {
      console.log(`Product with ID ${id} not found`); // Log if product is not found
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.category = category || product.category;
    if (image) {
      product.image = image;
    }

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    console.error("Error updating product:", err); // Log error for debugging
    res.status(500).json({ message: "Error updating product", error: err });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Received request to delete product with ID ${id}`); // Log delete request

    const product = await Product.findById(id);
    if (!product) {
      console.log(`Product with ID ${id} not found`); // Log if product is not found
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err); // Log error for debugging
    res
      .status(500)
      .json({ message: "Error deleting product", error: err.message });
  }
};
