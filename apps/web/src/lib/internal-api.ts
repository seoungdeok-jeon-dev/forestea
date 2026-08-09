import "server-only";
import { auth } from "@/auth";

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

/**
 * Server-to-server fetch to the Fastify API. Attaches the internal service
 * secret so privileged endpoints trust the call. NEVER expose this to the
 * browser — it must only run in server actions / route handlers.
 */
export async function internalApiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) {
    throw new Error("INTERNAL_API_SECRET is not configured on the web server.");
  }

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
      "x-internal-secret": secret,
    },
    cache: "no-store",
  });
}

/**
 * Ensures the current session belongs to an ADMIN. Throws otherwise so
 * privileged server actions fail closed.
 */
export async function requireAdmin(): Promise<{ id: string; email?: string | null }> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHENTICATED");
  }
  if (session.user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return { id: session.user.id, email: session.user.email };
}
