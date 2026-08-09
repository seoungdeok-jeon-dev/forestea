import { timingSafeEqual } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Shared secret used to authenticate server-to-server calls from the Next.js
 * web app (which performs its own user/admin session checks) to this API.
 * The browser never sees this value — only the web server holds it.
 */
export function getInternalSecret(): string {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "INTERNAL_API_SECRET is not configured (min 16 chars). Set it in the API env file.",
    );
  }
  return secret;
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Fastify preHandler that rejects any request not carrying the internal
 * service secret. Use on privileged endpoints (order placement, Clover admin).
 */
export async function requireInternal(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const provided = request.headers["x-internal-secret"];
  const header = Array.isArray(provided) ? provided[0] : provided;

  let expected: string;
  try {
    expected = getInternalSecret();
  } catch {
    reply.status(503).send({ error: "Server auth not configured" });
    return;
  }

  if (!header || !safeEqual(header, expected)) {
    reply.status(401).send({ error: "Unauthorized" });
  }
}
