/** Static Clover app credentials from environment (never store tokens here). */
export interface CloverAppConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  /** Ecommerce public token (PAKMS) for card tokenization — Clover Developer dashboard */
  ecommerceApiKey?: string;
  defaultMerchantId?: string;
  sandbox: boolean;
}

export function getCloverAppConfig(): CloverAppConfig | null {
  const appId = process.env.CLOVER_APP_ID;
  const appSecret = process.env.CLOVER_APP_SECRET;
  const redirectUri = process.env.CLOVER_REDIRECT_URI;
  const ecommerceApiKey = process.env.CLOVER_ECOMMERCE_API_KEY;

  if (!appId || !appSecret || !redirectUri) {
    return null;
  }

  const trim = (s: string) => s.trim().replace(/^["']|["']$/g, "");

  return {
    appId: trim(appId),
    appSecret: trim(appSecret),
    redirectUri: trim(redirectUri),
    ecommerceApiKey: ecommerceApiKey ? trim(ecommerceApiKey) : undefined,
    defaultMerchantId: process.env.CLOVER_MERCHANT_ID || undefined,
    sandbox: process.env.CLOVER_SANDBOX !== "false",
  };
}

/** OAuth token + refresh (POST /oauth/v2/token, /refresh) */
export function getOAuthTokenBaseUrl(sandbox: boolean): string {
  return sandbox
    ? "https://apisandbox.dev.clover.com"
    : "https://api.clover.com";
}

/** OAuth authorize redirect (GET /oauth/v2/authorize) — different host in sandbox */
export function getAuthorizeBaseUrl(sandbox: boolean): string {
  return sandbox
    ? "https://sandbox.dev.clover.com"
    : "https://www.clover.com";
}

/** @deprecated Use getOAuthTokenBaseUrl */
export function getOAuthBaseUrl(sandbox: boolean): string {
  return getOAuthTokenBaseUrl(sandbox);
}

export function buildAuthorizeUrl(config: CloverAppConfig): string {
  const base = getAuthorizeBaseUrl(config.sandbox);
  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    response_type: "code",
  });
  return `${base}/oauth/v2/authorize?${params.toString()}`;
}
