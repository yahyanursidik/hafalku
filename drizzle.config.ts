import { defineConfig } from "drizzle-kit";
import { loadEnv } from "./server/config/env";

const env = loadEnv();

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
