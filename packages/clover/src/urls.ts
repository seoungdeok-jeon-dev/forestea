export function getPlatformBaseUrl(sandbox: boolean): string {
  return sandbox
    ? "https://apisandbox.dev.clover.com"
    : "https://api.clover.com";
}

export function getEcommerceBaseUrl(sandbox: boolean): string {
  return sandbox
    ? "https://scl-sandbox.dev.clover.com"
    : "https://scl.clover.com";
}

export function getTokenBaseUrl(sandbox: boolean): string {
  return sandbox
    ? "https://token-sandbox.dev.clover.com"
    : "https://token.clover.com";
}
