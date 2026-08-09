"use server";

import { internalApiFetch, requireAdmin } from "@/lib/internal-api";

export interface CloverAuthStatus {
  appConfigured: boolean;
  connected: boolean;
  sandbox?: boolean;
  merchantId?: string;
  envMerchantId?: string | null;
  merchantIdMismatch?: boolean;
  accessTokenExpiresAt?: string;
  accessTokenExpired?: boolean;
}

async function guarded<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : "ERROR";
    if (message === "UNAUTHENTICATED" || message === "FORBIDDEN") {
      throw new Error(message);
    }
    throw new Error(message);
  }
}

export async function getCloverConnectUrl(): Promise<{ url: string | null }> {
  return guarded(async () => {
    await requireAdmin();
    const res = await internalApiFetch("/auth/connect-url");
    if (!res.ok) return { url: null };
    const data = (await res.json()) as { url: string | null };
    return { url: data.url ?? null };
  });
}

export async function getCloverStatus(): Promise<CloverAuthStatus> {
  return guarded(async () => {
    await requireAdmin();
    const res = await internalApiFetch("/auth/status");
    if (!res.ok) {
      return { appConfigured: false, connected: false };
    }
    return (await res.json()) as CloverAuthStatus;
  });
}

export async function disconnectClover(): Promise<CloverAuthStatus> {
  return guarded(async () => {
    await requireAdmin();
    await internalApiFetch("/auth/disconnect", { method: "POST" });
    const res = await internalApiFetch("/auth/status");
    if (!res.ok) {
      return { appConfigured: false, connected: false };
    }
    return (await res.json()) as CloverAuthStatus;
  });
}
