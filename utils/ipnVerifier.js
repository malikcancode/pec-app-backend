async function handleIpn(req, res) {
  try {
    // Step 1: Verify the request
    if (!verifyIpnRequest(req)) {
      console.warn("IPN verification failed", req.ip, req.body);
      return res.status(403).send("Forbidden");
    }

    const { private_hash, order_id, status, txid, amount } = req.body;

    // Step 2: Find the deposit in your DB
    const deposit = await Deposit.findOne({ orderId: order_id });
    if (!deposit) {
      console.warn("Deposit orderId not found:", order_id);
      // Still respond so Paykassa knows you received it
      return res.send(`${order_id}|success`);
    }

    // Step 3: Update deposit if status is "yes"
    if (status === "yes" && deposit.status !== "credited") {
      deposit.status = "credited";
      deposit.txid = txid;
      deposit.receivedAmount = parseFloat(amount);
      await deposit.save();

      // Credit user balance
      const user = await User.findById(deposit.user);
      if (user) {
        user.balance = (user.balance || 0) + parseFloat(amount);
        await user.save();
      }
    }

    // Step 4: Respond to Paykassa to confirm processing
    return res.send(`${order_id}|success`);
  } catch (err) {
    console.error("handleIpn error:", err);
    return res.status(500).send("Error");
  }
}
