const { MerchantApi } = require("paykassa-api-sdk/lib/merchant.js");
const {
  CheckTransactionRequest,
  GenerateAddressRequest,
} = require("paykassa-api-sdk/lib/dto.js");
const { System, Currency } = require("paykassa-api-sdk/lib/struct.js");
require("dotenv").config();

const merchantId = process.env.PAYKASSA_MERCHANT_ID;
const merchantPassword = process.env.PAYKASSA_MERCHANT_PASSWORD;
const testMode = process.env.PAYKASSA_TEST_MODE === "true";

// ✅ Instantiate once
const merchantApi = new MerchantApi(merchantId, merchantPassword).setTest(
  testMode
);

module.exports = {
  merchantApi,
  GenerateAddressRequest,
  CheckTransactionRequest,
  System,
  Currency,
};
