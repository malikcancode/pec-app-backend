require("dotenv").config();

let cached = null;

async function loadPaykassa() {
  if (!cached) {
    const { MerchantApi } = await import("paykassa-api-sdk/lib/merchant.js");
    const dto = await import("paykassa-api-sdk/lib/dto.js");
    const struct = await import("paykassa-api-sdk/lib/struct.js");

    const merchantId = process.env.PAYKASSA_MERCHANT_ID;
    const merchantPassword = process.env.PAYKASSA_MERCHANT_PASSWORD;
    const testMode = process.env.PAYKASSA_TEST_MODE === "true";

    const merchantApi = new MerchantApi(merchantId, merchantPassword).setTest(
      testMode
    );

    cached = {
      merchantApi,
      GenerateAddressRequest: dto.GenerateAddressRequest,
      CheckTransactionRequest: dto.CheckTransactionRequest,
      System: struct.System,
      Currency: struct.Currency,
    };
  }
  return cached;
}

module.exports = loadPaykassa;
