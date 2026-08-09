import { getCloverAppConfig } from "./app-config.js";
import type { CloverConfig } from "./types.js";

/** @deprecated Use getCloverAppConfig + DB tokens. Kept for backward compatibility. */
export function getCloverConfig(): CloverConfig | null {
  const app = getCloverAppConfig();
  const accessToken = process.env.CLOVER_ACCESS_TOKEN;
  const merchantId =
    process.env.CLOVER_MERCHANT_ID ?? app?.defaultMerchantId;

  if (!accessToken || !merchantId) {
    return null;
  }

  const ecommerceApiKey = process.env.CLOVER_ECOMMERCE_API_KEY?.trim();

  return {
    accessToken,
    merchantId,
    sandbox: app?.sandbox ?? true,
    ecommerceApiKey: ecommerceApiKey || app?.ecommerceApiKey,
  };
}

export {
  getCloverAppConfig,
  buildAuthorizeUrl,
  getOAuthBaseUrl,
} from "./app-config.js";

export {
  getPlatformBaseUrl,
  getEcommerceBaseUrl,
  getTokenBaseUrl,
} from "./urls.js";
