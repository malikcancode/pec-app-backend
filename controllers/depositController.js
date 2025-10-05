const Deposit = require("../models/depositModel");
const User = require("../models/User"); // your user model
const { verifyIpnRequest } = require("../utils/ipnVerifier");

const {
  merchantApi,
  CheckTransactionRequest,
} = require("../utils/paykassaClient");

// Create deposit address (initiate deposit)
async function initDeposit(req, res) {
  try {
    const { userId, amount, system, currency } = req.body;
    if (!userId || !amount || !system || !currency) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // Generate a unique orderId (you could use uuid or your own logic)
    // Use this as Paykassa “order_id” / invoice id
    const orderId = `dep_${Date.now()}_${userId}`;

    // Call Paykassa generateAddress
    const request = new merchantApi.GenerateAddressRequest()
      .setOrderId(orderId)
      .setSystem(system)
      .setCurrency(currency)
      .setComment(`Deposit for user ${userId}`);
    const response = await merchantApi.generateAddress(request);

    if (response.getError()) {
      const msg = response.getMessage() || "Error from Paykassa";
      return res.status(500).json({ error: msg });
    }

    const wallet = response.getWallet();
    const tag = response.getIsTag() ? response.getTag() : null;
    const invoice = response.getInvoiceId();

    // Save in DB
    const deposit = await Deposit.create({
      user: userId,
      orderId: invoice,
      expectedAmount: amount,
      system,
      currency,
      walletAddress: wallet,
      tag,
      status: "pending",
    });

    // Return to frontend
    return res.json({
      orderId: invoice,
      wallet,
      tag,
      system,
      currency,
    });
  } catch (err) {
    console.error("initDeposit error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// IPN webhook / callback
async function handleIpn(req, res) {
  try {
    // Optional: verify request signature, IP whitelist etc
    if (!verifyIpnRequest(req)) {
      console.warn("IPN verification failed", req.ip, req.body);
      return res.status(403).send("Forbidden");
    }

    const privateHash = req.body.private_hash;
    if (!privateHash) {
      return res.status(400).send("Missing private_hash");
    }

    // Call Paykassa checkTransaction (or checkPayment, depending on their API)
    const checkReq = new merchantApi.CheckTransactionRequest().setPrivateHash(
      privateHash
    );
    const checkRes = await merchantApi.checkTransaction(checkReq);

    if (checkRes.getError()) {
      console.error("Paykassa checkTransaction error:", checkRes.getMessage());
      return res.status(400).send("Error");
    }

    // Parse data
    const orderId = checkRes.getOrderId();
    const txid = checkRes.getTxid();
    const amountReceived = parseFloat(checkRes.getAmount());
    const status = checkRes.getStatus(); // e.g. "yes"
    const system = checkRes.getSystem();
    const currency = checkRes.getCurrency();

    // Find our deposit record
    const deposit = await Deposit.findOne({ orderId });
    if (!deposit) {
      console.warn("Deposit orderId not found:", orderId);
      return res.status(404).send("Order not found");
    }

    // Only credit if status "yes"
    if (status === "yes") {
      // Avoid double crediting
      if (deposit.status !== "credited") {
        deposit.status = "credited";
        deposit.txid = txid;
        deposit.receivedAmount = amountReceived;
        await deposit.save();

        // Credit user balance
        const user = await User.findById(deposit.user);
        if (user) {
          user.balance = (user.balance || 0) + amountReceived;
          await user.save();
        } else {
          console.error("User not found to credit deposit", deposit.user);
        }
      }
    } else {
      // If still pending / not confirmed, you may leave status
      deposit.status = "pending";
      await deposit.save();
    }

    // Respond to Paykassa (they expect “order_id|success”)
    return res.send(`${orderId}|success`);
  } catch (err) {
    console.error("handleIpn error:", err);
    return res.status(500).send("Error");
  }
}

// (Optional) endpoint to query deposit status
async function getDepositStatus(req, res) {
  try {
    const { orderId } = req.query;
    if (!orderId) return res.status(400).json({ error: "Missing orderId" });

    const deposit = await Deposit.findOne({ orderId });
    if (!deposit) return res.status(404).json({ error: "Not found" });
    return res.json({
      orderId: deposit.orderId,
      status: deposit.status,
      txid: deposit.txid,
      receivedAmount: deposit.receivedAmount,
    });
  } catch (err) {
    console.error("getDepositStatus error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}

async function handleTransactionNotification(req, res) {
  try {
    // (Optional) verify IP / signature etc same as IPN
    // verifyIpnRequest(req) or similar

    const privateHash = req.body.private_hash; // or maybe req.body.transaction or something
    // Actually, the notification may include the same "private_hash" or other identifier — check docs or experiments

    // Use Paykassa’s checkTransaction API to fetch full details
    const checkReq = new CheckTransactionRequest().setPrivateHash(privateHash);
    const checkRes = await merchantApi.checkTransaction(checkReq);

    if (checkRes.getError()) {
      console.error("Transaction notify error:", checkRes.getMessage());
      return res.status(400).send("Error");
    }

    const orderId = checkRes.getOrderId();
    const txid = checkRes.getTxid();
    const amount = parseFloat(checkRes.getAmount());
    const confirmations = checkRes.getConfirmations();
    const required = checkRes.getRequiredConfirmations();
    const status = checkRes.getStatus();
    const system = checkRes.getSystem();
    const currency = checkRes.getCurrency();
    const address_from = checkRes.getAddressFrom();
    const address = checkRes.getAddress();
    const tag = checkRes.getTag(); // if applicable

    // Find the deposit record by orderId
    const deposit = await Deposit.findOne({ orderId });
    if (!deposit) {
      console.warn(
        "Transaction notify: deposit not found for orderId",
        orderId
      );
      // respond anyway so Paykassa knows you got it
      return res.send(`${orderId}|success`);
    }

    // Update deposit record: e.g. update confirmations, maybe credit if now meets required
    deposit.txid = txid;
    deposit.receivedAmount = amount;
    deposit.confirmations = confirmations;
    deposit.requiredConfirmations = required;
    deposit.system = system;
    deposit.currency = currency;
    deposit.addressFrom = address_from;
    deposit.address = address;
    deposit.tag = tag;
    // If status is “yes” and deposit not yet credited, credit now
    if (status === "yes" && deposit.status !== "credited") {
      deposit.status = "credited";
      // Also credit user wallet
      const user = await User.findById(deposit.user);
      if (user) {
        user.balance = (user.balance || 0) + amount;
        await user.save();
      }
    }

    await deposit.save();

    // respond so Paykassa knows you have processed it
    return res.send(`${orderId}|success`);
  } catch (err) {
    console.error("handleTransactionNotification error:", err);
    return res.status(500).send("Error");
  }
}

module.exports = {
  initDeposit,
  handleIpn,
  handleTransactionNotification,

  getDepositStatus,
};
