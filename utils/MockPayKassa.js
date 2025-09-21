// utils/MockPayKassa.js
const createInvoice = async ({ amount, currency, orderId }) => {
  console.log("🔹 MockPayKassa: creating invoice", {
    amount,
    currency,
    orderId,
  });

  // Simulate invoice response
  return {
    error: false,
    data: {
      invoice: `MOCK-${orderId}`, // mock invoice id
      wallet: "T-MOCK-ADDRESS-123456", // mock wallet address
      amount,
      currency,
    },
  };
};

module.exports = { createInvoice };
