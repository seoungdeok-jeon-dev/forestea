const path = require("path");
const { execSync } = require("child_process");
const { config } = require("dotenv");

const apiDir = path.resolve(__dirname, "../../../apps/api");
// Keep in sync with apps/api/src/load-env.ts:
// NODE_ENV=production (or CLOVER_ENV=prod) → .env.production, otherwise .env.development
const envName =
  process.env.NODE_ENV === "production" || process.env.CLOVER_ENV === "prod"
    ? "production"
    : "development";

// Env-specific file wins; .env holds shared fallbacks (dotenv never overrides).
const candidates = [`.env.${envName}`, ".env"];
let anyLoaded = false;
for (const file of candidates) {
  const loaded = config({ path: path.join(apiDir, file) });
  if (!loaded.error) anyLoaded = true;
}

if (!process.env.DATABASE_URL) {
  console.error(
    `DATABASE_URL missing. Checked ${candidates
      .map((f) => path.join(apiDir, f))
      .join(", ")}${anyLoaded ? "" : " (none found)"}`,
  );
  process.exit(1);
}

const cmd = process.argv.slice(2).join(" ");
if (!cmd) {
  console.error("Usage: node run-with-api-env.cjs <command>");
  process.exit(1);
}

execSync(cmd, { stdio: "inherit", env: process.env });
