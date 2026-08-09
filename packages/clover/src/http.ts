function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayMs(res: Response, attempt: number, baseMs: number): number {
  const header = res.headers.get("retry-after");
  if (header) {
    const seconds = Number.parseInt(header, 10);
    if (!Number.isNaN(seconds)) return Math.min(seconds * 1000, 15_000);
  }
  return Math.min(baseMs * 2 ** attempt, 10_000);
}

/** Retry Clover rate limits (429) and transient errors (503). */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options?: { maxRetries?: number; baseMs?: number },
): Promise<Response> {
  const maxRetries = options?.maxRetries ?? 3;
  const baseMs = options?.baseMs ?? 600;
  let last: Response | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, init);
    last = res;

    if (res.status !== 429 && res.status !== 503) {
      return res;
    }

    if (attempt === maxRetries) {
      return res;
    }

    await sleep(retryDelayMs(res, attempt, baseMs));
  }

  return last!;
}
