import {
  buildAuthorizeUrl,
  getCloverAppConfig,
} from "@forestea/clover";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  disconnectClover,
  exchangeAndStoreTokens,
  getActiveCloverAuth,
  getCloverConnectionStatus,
} from "../services/clover-token-service.js";
import { requireInternal } from "../security.js";

const exchangeBodySchema = z.object({
  code: z.string().min(1),
  merchantId: z.string().min(1),
});

export async function registerAuthRoutes(app: FastifyInstance) {
  const adminRedirectSuccess =
    process.env.CLOVER_OAUTH_SUCCESS_URL ??
    `${process.env.WEB_ORIGIN ?? "http://localhost:3000"}/admin/setting?status=success`;

  const adminRedirectError =
    process.env.CLOVER_OAUTH_ERROR_URL ??
    `${process.env.WEB_ORIGIN ?? "http://localhost:3000"}/admin/setting?status=error`;

  /**
   * Clover OAuth callback — must match Clover Developer "Site URL":
   * http://localhost:4000/auth
   */
  app.get("/auth", async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    const code = query.code ?? query.authorization_code;
    const merchantId =
      query.merchant_id ?? query.merchantId ?? query.mId;
    const appConfig = getCloverAppConfig();

    request.log.info({ merchantId, hasCode: Boolean(code) }, "OAuth callback");

    if (!appConfig) {
      return reply.redirect(`${adminRedirectError}&reason=app_not_configured`);
    }

    if (!code) {
      if (merchantId) {
        return reply.redirect(buildAuthorizeUrl(appConfig));
      }
      return reply.redirect(`${adminRedirectError}&reason=missing_code`);
    }

    if (!merchantId) {
      return reply.redirect(`${adminRedirectError}&reason=missing_merchant_id`);
    }

    try {
      await exchangeAndStoreTokens(code, merchantId);
      return reply.redirect(adminRedirectSuccess);
    } catch (err) {
      const message = err instanceof Error ? err.message : "oauth_failed";
      const reason = message.includes("token exchange")
        ? "token_exchange"
        : "oauth_failed";
      request.log.error({ err, merchantId }, "Clover OAuth failed");
      const detail = encodeURIComponent(message.slice(0, 400));
      const hint = encodeURIComponent(
        message.includes("validate authentication code")
          ? "Clover Developer의 Site URL·APP SECRET이 apps/api/.env와 일치하는지 확인 후, 연동 해제 → 연동하기(에러 URL 새로고침 금지)."
          : "code는 1회용입니다. 연동 버튼을 다시 눌러 새 code로 시도하세요.",
      );
      return reply.redirect(
        `${adminRedirectError}&reason=${reason}&detail=${detail}&hint=${hint}`,
      );
    }
  });

  app.post("/auth/exchange", { preHandler: requireInternal }, async (request, reply) => {
    const parsed = exchangeBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    try {
      const tokens = await exchangeAndStoreTokens(
        parsed.data.code,
        parsed.data.merchantId,
      );
      return {
        ok: true,
        merchantId: parsed.data.merchantId,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt.toISOString(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Exchange failed";
      return reply.status(502).send({ error: message });
    }
  });

  app.post("/auth/disconnect", { preHandler: requireInternal }, async () => {
    const { clearMenuCache } = await import("../services/menu-cache.js");
    clearMenuCache();
    const result = await disconnectClover();
    return { ok: true, deleted: result.count };
  });

  app.get("/auth/connect-url", { preHandler: requireInternal }, async () => {
    const appConfig = getCloverAppConfig();
    if (!appConfig) {
      return { url: null, error: "Clover app credentials not configured" };
    }
    const url = buildAuthorizeUrl(appConfig);
    return {
      url,
      redirectUri: appConfig.redirectUri,
      authorizeHost: new URL(url).host,
      tokenHost: appConfig.sandbox
        ? "apisandbox.dev.clover.com"
        : "api.clover.com",
      note: "Sandbox authorize must use sandbox.dev.clover.com (not apisandbox)",
    };
  });

  app.get("/auth/status", { preHandler: requireInternal }, async () => {
    const appConfig = getCloverAppConfig();
    return {
      appConfigured: Boolean(appConfig),
      sandbox: appConfig?.sandbox ?? true,
      redirectUri: appConfig?.redirectUri ?? null,
      ...(await getCloverConnectionStatus()),
    };
  });

  app.get("/auth/diagnostics", { preHandler: requireInternal }, async (_request, reply) => {
    const appConfig = getCloverAppConfig();
    const auth = await getActiveCloverAuth();

    if (!appConfig || !auth) {
      return reply.status(400).send({
        ok: false,
        error: "Not connected or app credentials missing",
      });
    }

    const { getValidAccessToken, forceRefreshAccessToken } = await import(
      "../services/clover-token-service.js"
    );
    const { fetchWithRetry, getPlatformBaseUrl } = await import(
      "@forestea/clover"
    );

    try {
      let accessToken: string;
      let merchantId: string;
      try {
        ({ accessToken, merchantId } = await getValidAccessToken());
      } catch {
        const refreshed = await forceRefreshAccessToken(auth.merchantId);
        accessToken = refreshed.accessToken;
        merchantId = auth.merchantId;
      }

      const base = getPlatformBaseUrl(appConfig.sandbox);
      const itemsUrl = `${base}/v3/merchants/${merchantId}/items?limit=1`;
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      };

      const itemsRes = await fetchWithRetry(itemsUrl, { headers });
      const itemsBody = await itemsRes.text();

      let tokenClaims: Record<string, unknown> | null = null;
      try {
        const parts = accessToken.split(".");
        if (parts.length >= 2) {
          tokenClaims = JSON.parse(
            Buffer.from(parts[1]!, "base64url").toString(),
          ) as Record<string, unknown>;
        }
      } catch {
        tokenClaims = null;
      }

      const connectUrl = buildAuthorizeUrl(appConfig);

      const rateLimited = itemsRes.status === 429;

      return {
        ok: itemsRes.ok,
        merchantId,
        envMerchantId: appConfig.defaultMerchantId ?? null,
        authorizeHost: new URL(connectUrl).host,
        tokenClaims: tokenClaims
          ? {
              app_uuid: tokenClaims.app_uuid,
              merchant_uuid: tokenClaims.merchant_uuid,
              permission_bitmap: tokenClaims.permission_bitmap,
              exp: tokenClaims.exp,
            }
          : null,
        platformProbe: {
          items: {
            url: itemsUrl,
            status: itemsRes.status,
            body: itemsBody.slice(0, 300),
          },
        },
        hint: rateLimited
          ? "Clover sandbox rate limit (429). Wait 10–30s; do not spam diagnostics and /menu."
          : !itemsRes.ok
            ? "Token or permissions issue — reinstall app and reconnect from /admin/setting"
            : undefined,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Diagnostics failed";
      return reply.status(502).send({ ok: false, error: message });
    }
  });
}
