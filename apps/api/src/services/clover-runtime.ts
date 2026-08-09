import { CloverClient, getCloverAppConfig } from "@forestea/clover";
import { prisma } from "@forestea/db";
import {
  forceRefreshAccessToken,
  getActiveCloverAuth,
  getValidAccessToken,
} from "./clover-token-service.js";

function isCloverUnauthorized(err: unknown): boolean {
  return (
    err instanceof Error &&
    /Clover Platform API 401|Clover Ecommerce API 401/.test(err.message)
  );
}

async function buildCloverClient(merchantId: string): Promise<CloverClient> {
  const app = getCloverAppConfig();
  if (!app) {
    throw new Error("Clover app credentials are not configured");
  }
  const { accessToken, merchantId: tokenMerchantId } =
    await getValidAccessToken(merchantId);
  return new CloverClient({
    accessToken,
    merchantId: tokenMerchantId,
    sandbox: app.sandbox,
    ecommerceApiKey: app.ecommerceApiKey,
  });
}

export async function withClover<T>(
  fn: (clover: CloverClient) => Promise<T>,
): Promise<{
  result: T;
  mode: "clover";
  merchantId: string;
}> {
  const app = getCloverAppConfig();
  const auth = await getActiveCloverAuth();

  if (!app) {
    throw new Error("Clover app credentials are not configured");
  }

  if (!auth) {
    throw new Error("Clover is not connected. Complete OAuth at /admin/setting.");
  }

  const merchantId = auth.merchantId;

  try {
    const clover = await buildCloverClient(merchantId);
    const result = await fn(clover);
    return { result, mode: "clover", merchantId };
  } catch (err) {
    if (!isCloverUnauthorized(err)) throw err;
    await forceRefreshAccessToken(merchantId);
    const clover = await buildCloverClient(merchantId);
    const result = await fn(clover);
    return { result, mode: "clover", merchantId };
  }
}

export function formatCloverAuthHint(merchantId: string | null): string {
  const envId = process.env.CLOVER_MERCHANT_ID;
  if (envId && merchantId && envId !== merchantId) {
    return `Token is for merchant ${merchantId} but CLOVER_MERCHANT_ID=${envId}. Remove or update .env to match, then re-run OAuth.`;
  }
  return "Disconnect, uninstall/reinstall Forestea on the sandbox merchant, then connect again (authorize URL must be sandbox.dev.clover.com).";
}
