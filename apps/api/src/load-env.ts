import dotenv from "dotenv";

// Load environment-specific configuration
// NODE_ENV=production → .env.production, otherwise .env.development
const env = process.env.NODE_ENV === "production" ? "production" : "development";

dotenv.config({ path: `.env.${env}` });
dotenv.config();
