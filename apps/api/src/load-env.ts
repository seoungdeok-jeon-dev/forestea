import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Resolve from this file so env loads even if cwd is the monorepo root.
const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Local development: apps/api/.env.local (gitignored).
// Deployed (Railway): process.env from the platform dashboard — no file required.
dotenv.config({ path: path.join(apiRoot, ".env.local") });
dotenv.config({ path: path.join(apiRoot, ".env") });
