// controllers/walletController.js
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

let createInvoice;
if (process.env.NODE_ENV === "production") {
  createInvoice = require("../utils/PayKassa").createInvoice;
} else {
  createInvoice = require("../utils/MockPayKassa").createInvoice;
}

// @desc Get wallet balance & transactions
// @route GET /api/wallet
// @access Private
exports.getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.id });
    }

    const transactions = await Transaction.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({ balance: wallet.balance, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create deposit via PayKassa
// @route POST /api/wallet/deposit
// @access Private
exports.createDeposit = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const txn = await Transaction.create({
      user: req.user.id,
      type: "deposit",
      amount,
      method: currency,
      status: "pending",
    });

    // Use mock invoice in development
    const paykassaRes = await createInvoice({
      amount,
      currency,
      orderId: txn._id.toString(),
    });

    if (paykassaRes.error) {
      return res.status(400).json({ message: paykassaRes.message });
    }

    txn.referenceId = paykassaRes.data.invoice;
    txn.depositAddress = paykassaRes.data.wallet;
    await txn.save();

    res.status(201).json({
      message: "Deposit created. Send funds to provided address (mock).",
      deposit: {
        address: paykassaRes.data.wallet,
        amount: paykassaRes.data.amount,
        invoiceId: paykassaRes.data.invoice,
        currency: paykassaRes.data.currency,
      },
      txn,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Mock confirm deposit (for testing, PayKassa webhook will replace this later)
// @route PATCH /api/wallet/confirm/:id
// @access Admin/Test
exports.confirmDeposit = async (req, res) => {
  try {
    const txn = await Transaction.findById(req.params.id);
    if (!txn) return res.status(404).json({ message: "Transaction not found" });

    if (txn.status !== "pending") {
      return res.status(400).json({ message: "Transaction already processed" });
    }

    txn.status = "success";
    await txn.save();

    const wallet = await Wallet.findOne({ user: txn.user });
    wallet.balance += txn.amount;
    await wallet.save();

    res.json({ message: "Deposit confirmed (manual)", txn });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Request withdrawal
// @route POST /api/wallet/withdraw
// @access Private
exports.createWithdraw = async (req, res) => {
  try {
    const { amount, method, walletAddress } = req.body;

    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const txn = await Transaction.create({
      user: req.user.id,
      type: "withdraw",
      amount,
      method,
      walletAddress,
      status: "pending",
    });

    res.status(201).json({ message: "Withdrawal request created", txn });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Approve withdrawal (manual for now)
// @route PATCH /api/wallet/approve/:id
// @access Admin/Test
exports.approveWithdraw = async (req, res) => {
  try {
    const txn = await Transaction.findById(req.params.id);
    if (!txn) return res.status(404).json({ message: "Transaction not found" });

    if (txn.status !== "pending") {
      return res.status(400).json({ message: "Transaction already processed" });
    }

    const wallet = await Wallet.findOne({ user: txn.user });
    if (!wallet || wallet.balance < txn.amount) {
      return res
        .status(400)
        .json({ message: "Insufficient balance in wallet" });
    }

    txn.status = "success";
    await txn.save();

    wallet.balance -= txn.amount;
    await wallet.save();

    res.json({ message: "Withdrawal approved (manual)", txn });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
