import {
  exchangeAuthorizationCode,
  getCloverAppConfig,
  isAccessTokenExpired,
  refreshAccessToken,
  type CloverAppConfig,
  type CloverTokenPair,
} from "@forestea/clover";
import { prisma } from "@forestea/db";

/** Default merchant from env (hint only — API must use DB merchant after OAuth). */
export function resolveMerchantIdFromEnv(): string | null {
  const app = getCloverAppConfig();
  return app?.defaultMerchantId ?? null;
}

/** @deprecated Use getActiveCloverAuth() */
export function resolveMerchantId(explicit?: string): string | null {
  return explicit ?? resolveMerchantIdFromEnv();
}

export async function getActiveCloverAuth() {
  return prisma.cloverAuth.findFirst({
    orderBy: { updatedAt: "desc" },
  });
}

export async function getConnectedMerchantId(
  explicit?: string,
): Promise<string | null> {
  if (explicit) return explicit;

  const auth = await getActiveCloverAuth();
  if (auth) return auth.merchantId;

  return resolveMerchantIdFromEnv();
}

export async function upsertCloverAuth(
  merchantId: string,
  tokens: CloverTokenPair,
) {
  return prisma.cloverAuth.upsert({
    where: { merchantId },
    create: {
      merchantId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    },
    update: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    },
  });
}

const exchangeInflight = new Map<string, Promise<CloverTokenPair>>();

/** Dedupe parallel /auth hits with the same one-time code. */
export async function exchangeAndStoreTokens(
  code: string,
  merchantId: string,
): Promise<CloverTokenPair> {
  const key = `${merchantId}:${code.trim()}`;
  const existing = exchangeInflight.get(key);
  if (existing) return existing;

  const work = (async () => {
    const app = getCloverAppConfig();
    if (!app) {
      throw new Error("Clover app credentials are not configured");
    }

    const tokens = await exchangeAuthorizationCode(app, code);
    await upsertCloverAuth(merchantId, tokens);
    return tokens;
  })();

  exchangeInflight.set(key, work);
  try {
    return await work;
  } finally {
    exchangeInflight.delete(key);
  }
}

export async function disconnectClover(merchantId?: string) {
  if (merchantId) {
    return prisma.cloverAuth.deleteMany({ where: { merchantId } });
  }
  return prisma.cloverAuth.deleteMany();
}

export async function refreshAndStoreTokens(
  merchantId: string,
  app: CloverAppConfig,
): Promise<CloverTokenPair> {
  const existing = await prisma.cloverAuth.findUnique({
    where: { merchantId },
  });

  if (!existing) {
    throw new Error(`No Clover auth record for merchant ${merchantId}`);
  }

  const tokens = await refreshAccessToken(app, existing.refreshToken);
  await upsertCloverAuth(merchantId, tokens);
  return tokens;
}

export async function forceRefreshAccessToken(
  merchantId: string,
): Promise<CloverTokenPair> {
  const app = getCloverAppConfig();
  if (!app) {
    throw new Error("Clover app credentials are not configured");
  }
  return refreshAndStoreTokens(merchantId, app);
}

/**
 * Uses the merchant_id from clover_auth (must match the OAuth install).
 */
export async function getValidAccessToken(
  merchantId?: string,
): Promise<{ accessToken: string; merchantId: string }> {
  const app = getCloverAppConfig();
  if (!app) {
    throw new Error("Clover app credentials are not configured");
  }

  const record = merchantId
    ? await prisma.cloverAuth.findUnique({ where: { merchantId } })
    : await getActiveCloverAuth();

  if (!record) {
    throw new Error(
      "Clover is not connected. Complete OAuth from /admin/setting.",
    );
  }

  if (!isAccessTokenExpired(record.accessTokenExpiresAt)) {
    return { accessToken: record.accessToken, merchantId: record.merchantId };
  }

  const tokens = await refreshAndStoreTokens(record.merchantId, app);
  return { accessToken: tokens.accessToken, merchantId: record.merchantId };
}

export async function getCloverConnectionStatus(merchantId?: string) {
  const record = merchantId
    ? await prisma.cloverAuth.findUnique({ where: { merchantId } })
    : await getActiveCloverAuth();

  const envMerchantId = resolveMerchantIdFromEnv();

  if (!record) {
    return {
      connected: false as const,
      envMerchantId,
    };
  }

  return {
    connected: true as const,
    merchantId: record.merchantId,
    envMerchantId,
    merchantIdMismatch: Boolean(
      envMerchantId && envMerchantId !== record.merchantId,
    ),
    accessTokenExpiresAt: record.accessTokenExpiresAt.toISOString(),
    refreshTokenExpiresAt: record.refreshTokenExpiresAt?.toISOString() ?? null,
    accessTokenExpired: isAccessTokenExpired(record.accessTokenExpiresAt),
  };
}
