const axios = require("axios");
const qs = require("qs");

const PAYKASSA_API_URL = "https://paykassa.pro/api/0.5/index.php";

/**
 * Create deposit invoice (PayKassa SCI API)
 */
const createInvoice = async ({ amount, currency, orderId }) => {
  const payload = {
    merchant_id: process.env.PAYKASSA_MERCHANT_ID,
    merchant_password: process.env.PAYKASSA_SCI_PASSWORD, // ✅ SCI password
    cmd: "sci_create_order",
    amount,
    currency, // e.g. "USDT.TRC20"
    order_id: orderId, // your internal txn id
    system: "auto", // let PayKassa choose
    comment: "Deposit to wallet",
    test: 1, // 0 = live mode
  };

  console.log("🔹 Sending payload to PayKassa:", payload);

  try {
    const { data } = await axios.post(
      PAYKASSA_API_URL,
      qs.stringify(payload), // 🔑 form-encoded
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    console.log("✅ PayKassa response:", data);
    return data;
  } catch (err) {
    console.error(
      "❌ PayKassa API error:",
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
};

module.exports = { createInvoice };
