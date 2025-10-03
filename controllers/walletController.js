const WalletTransaction = require("../models/WalletTransaction");
const User = require("../models/User");

// ------------------ DEPOSIT ------------------

// User initiates deposit
exports.depositRequest = async (req, res) => {
  try {
    const { amount, method, screenshot } = req.body;
    const userId = req.user.id; // from auth middleware

    const transaction = await WalletTransaction.create({
      user: userId,
      amount,
      method,
      type: "deposit",
      screenshot: screenshot || null,
      status: "pending",
    });

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin approves deposit
exports.approveDeposit = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const transaction = await WalletTransaction.findById(
      transactionId
    ).populate("user");
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    if (transaction.status !== "pending") {
      return res.status(400).json({ message: "Transaction already processed" });
    }

    // Update status
    transaction.status = "approved";
    await transaction.save();

    // Add balance to user
    transaction.user.balance += transaction.amount;
    await transaction.user.save();

    res.json({ success: true, message: "Deposit approved", transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin rejects deposit
exports.rejectDeposit = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const transaction = await WalletTransaction.findById(transactionId);
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    if (transaction.status !== "pending") {
      return res.status(400).json({ message: "Transaction already processed" });
    }

    transaction.status = "rejected";
    await transaction.save();

    res.json({ success: true, message: "Deposit rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------ WITHDRAW ------------------

// User requests withdraw
exports.withdrawRequest = async (req, res) => {
  try {
    const { amount, method } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const transaction = await WalletTransaction.create({
      user: userId,
      amount,
      method,
      type: "withdraw",
      status: "pending",
    });

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin approves withdraw
exports.approveWithdraw = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const transaction = await WalletTransaction.findById(
      transactionId
    ).populate("user");
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    if (transaction.status !== "pending") {
      return res.status(400).json({ message: "Transaction already processed" });
    }

    if (transaction.user.balance < transaction.amount) {
      return res.status(400).json({ message: "User has insufficient balance" });
    }

    // Update status
    transaction.status = "approved";
    await transaction.save();

    // Deduct balance from user
    transaction.user.balance -= transaction.amount;
    await transaction.user.save();

    res.json({ success: true, message: "Withdraw approved", transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin rejects withdraw
exports.rejectWithdraw = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const transaction = await WalletTransaction.findById(transactionId);
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    if (transaction.status !== "pending") {
      return res.status(400).json({ message: "Transaction already processed" });
    }

    transaction.status = "rejected";
    await transaction.save();

    res.json({ success: true, message: "Withdraw rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User transactions
exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });
    const user = await User.findById(req.user.id).select("balance name email");

    res.json({ transactions, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const transactions = await WalletTransaction.find(filter)
      .populate("user")
      .sort({ createdAt: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
