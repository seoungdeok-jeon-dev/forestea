"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  disconnectClover,
  getCloverConnectUrl,
  getCloverStatus,
  type CloverAuthStatus,
} from "./actions";

export function SettingContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const reason = searchParams.get("reason");
  const detail = searchParams.get("detail");
  const hint = searchParams.get("hint");

  const [connectUrl, setConnectUrl] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<CloverAuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      const next = await disconnectClover();
      setAuthStatus(next);
    } finally {
      setDisconnecting(false);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [urlData, statusData] = await Promise.all([
          getCloverConnectUrl(),
          getCloverStatus(),
        ]);
        setConnectUrl(urlData.url);
        setAuthStatus(statusData);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [status]);

  const isConnected = authStatus?.connected === true;

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Clover Integration</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Connect your Clover POS to Forestea using OAuth 2.0.
      </p>

      {status === "success" && (
        <p className="mt-6 rounded-lg bg-subtle px-4 py-3 text-sm text-ink">
          Successfully connected to Clover. Access tokens have been saved to the database.
        </p>
      )}

      {status === "error" && reason === "token_exchange" && (
        <div className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Token exchange failed - Please verify:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
            <li>
              Clover Developer → Site URL ={" "}
              <code className="rounded bg-white/80 px-1">http://localhost:4000/auth</code>
            </li>
            <li>Copy APP SECRET from Clover Developer Dashboard to apps/api/.env</li>
            <li>Do not refresh this error page. Retry using the &quot;Connect&quot; button below</li>
          </ul>
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>
            Connection failed.{reason ? ` (${reason})` : ""}
          </p>
          {detail && (
            <p className="mt-2 break-all font-mono text-xs opacity-90">
              {decodeURIComponent(detail)}
            </p>
          )}
          {hint && <p className="mt-2 text-xs">{decodeURIComponent(hint)}</p>}
        </div>
      )}

      {status === "error" && isConnected && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Even if the status shows &quot;Connected&quot; below, this OAuth attempt may have failed.
          Please disconnect first, then retry using the &quot;Connect Clover Account&quot; button.
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-ink-soft">Checking connection status…</p>
      ) : (
        <div className="mt-8 space-y-4 rounded-2xl border border-line bg-card p-6 text-sm text-ink">
          <p>
            <span className="text-ink-soft">App configuration:</span>{" "}
            {authStatus?.appConfigured ? "Configured" : "Not configured (missing CLOVER_APP_ID, etc.)"}
          </p>
          <p>
            <span className="text-ink-soft">Connection status:</span>{" "}
            {authStatus?.connected ? "Connected" : "Not connected"}
          </p>
          {authStatus?.connected && authStatus.merchantId && (
            <p>
              <span className="text-ink-soft">Connected Merchant ID:</span>{" "}
              <code className="rounded bg-subtle px-1">{authStatus.merchantId}</code>
            </p>
          )}
          {authStatus?.merchantIdMismatch && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
              Merchant ID mismatch: .env file shows {authStatus.envMerchantId},
              but OAuth connected to {authStatus.merchantId}.
              Please update CLOVER_MERCHANT_ID in .env or disconnect and reconnect.
            </p>
          )}
          {authStatus?.connected && authStatus.accessTokenExpiresAt && (
            <p>
              <span className="text-ink-soft">Access token expires:</span>{" "}
              {new Date(authStatus.accessTokenExpiresAt).toLocaleString()}
              {authStatus.accessTokenExpired ? " (will auto-refresh)" : ""}
            </p>
          )}
          {isConnected ? (
            <div className="mt-4 space-y-3">
              <p className="rounded-lg bg-subtle px-3 py-2 text-ink">
                Connected to Clover POS. Menu and order APIs use tokens stored in the database.
              </p>
              <div className="flex flex-wrap gap-4">
                {connectUrl && (
                  <a
                    href={connectUrl}
                    className="text-sm font-medium text-ink-soft underline hover:text-ink"
                  >
                    Reconnect (if token expired or permissions changed)
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => void handleDisconnect()}
                  disabled={disconnecting}
                  className="text-sm font-medium text-red-700 underline hover:text-red-900 disabled:opacity-50"
                >
                  {disconnecting ? "Disconnecting…" : "Disconnect"}
                </button>
              </div>
            </div>
          ) : connectUrl ? (
            <a
              href={connectUrl}
              className="mt-4 inline-block rounded-full bg-accent px-6 py-3 font-medium text-on-accent hover:bg-accent-hover"
            >
              Connect Clover Account
            </a>
          ) : (
            <p className="text-bark-600">
              Cannot generate connection URL. Please verify CLOVER_APP_ID, CLOVER_APP_SECRET,
              and CLOVER_REDIRECT_URI in your API environment configuration.
            </p>
          )}
        </div>
      )}

      <div className="mt-8 space-y-2 text-xs text-ink-muted">
        <p>
          Clover Developer Dashboard → Site URL / Redirect URI:{" "}
          <code className="rounded bg-subtle px-1">http://localhost:4000/auth</code>
        </p>
        <p>
          For production, use{" "}
          <code className="rounded bg-subtle px-1">www.clover.com</code> for OAuth (not{" "}
          <code className="rounded bg-subtle px-1">apisandbox</code>).
          Always connect through this page. Authorization codes are single-use only.
        </p>
      </div>
    </div>
  );
}
