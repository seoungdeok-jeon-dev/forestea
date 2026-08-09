import {
  getOAuthTokenBaseUrl,
  type CloverAppConfig,
} from "./app-config.js";
import { getPlatformBaseUrl } from "./urls.js";

export interface CloverTokenResponse {
  access_token: string;
  access_token_expiration: number;
  refresh_token: string;
  refresh_token_expiration?: number;
}

export interface CloverTokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date | null;
}

function unixToDate(seconds: number): Date {
  return new Date(seconds * 1000);
}

function mapTokenResponse(data: CloverTokenResponse): CloverTokenPair {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    accessTokenExpiresAt: unixToDate(data.access_token_expiration),
    refreshTokenExpiresAt: data.refresh_token_expiration
      ? unixToDate(data.refresh_token_expiration)
      : null,
  };
}

function tokenExchangeBases(sandbox: boolean): string[] {
  if (!sandbox) return ["https://api.clover.com"];
  return [
    getOAuthTokenBaseUrl(true),
    "https://sandbox.dev.clover.com",
  ];
}

async function postOAuthToken(
  base: string,
  payload: Record<string, string>,
  asForm: boolean,
): Promise<Response> {
  if (asForm) {
    return fetch(`${base}/oauth/v2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams(payload).toString(),
    });
  }

  return fetch(`${base}/oauth/v2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
}

/**
 * Exchange authorization code for tokens.
 * Includes redirect_uri (must match authorize + Developer Site URL).
 */
export async function exchangeAuthorizationCode(
  config: CloverAppConfig,
  code: string,
): Promise<CloverTokenPair> {
  const trimmedCode = code.trim();
  const payload: Record<string, string> = {
    client_id: config.appId,
    client_secret: config.appSecret,
    code: trimmedCode,
    redirect_uri: config.redirectUri,
  };

  const errors: string[] = [];

  for (const base of tokenExchangeBases(config.sandbox)) {
    for (const asForm of [false, true] as const) {
      const res = await postOAuthToken(base, payload, asForm);
      if (res.ok) {
        const data = (await res.json()) as CloverTokenResponse;
        return mapTokenResponse(data);
      }
      const body = await res.text();
      errors.push(
        `${base} (${asForm ? "form" : "json"}): ${res.status} ${body}`,
      );
    }
  }

  throw new Error(
    `Clover token exchange failed: ${errors.join(" | ")}`,
  );
}

export async function refreshAccessToken(
  config: CloverAppConfig,
  refreshToken: string,
): Promise<CloverTokenPair> {
  const base = getOAuthTokenBaseUrl(config.sandbox);
  const res = await fetch(`${base}/oauth/v2/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: config.appId,
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Clover token refresh failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as CloverTokenResponse;
  return mapTokenResponse(data);
}

/** Optional check — uses inventory endpoint (same as /menu). Does not throw. */
export async function probePlatformAccess(
  config: CloverAppConfig,
  merchantId: string,
  accessToken: string,
): Promise<{ ok: boolean; status: number; body: string }> {
  const base = getPlatformBaseUrl(config.sandbox);
  const url = `${base}/v3/merchants/${merchantId}/items?limit=1`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body: body.slice(0, 300) };
}

/** Refresh if access token expires within this window (ms). */
export const TOKEN_EXPIRY_BUFFER_MS = 60_000;

export function isAccessTokenExpired(expiresAt: Date, now = Date.now()): boolean {
  return expiresAt.getTime() - now <= TOKEN_EXPIRY_BUFFER_MS;
}
