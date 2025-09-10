import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load connection string from .env.local to reduce duplication
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Set it in .env.local before running migrations.");
}

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  // We use raw SQL migrations; no ORM schema here.
  schema: [],
  dbCredentials: { url: process.env.DATABASE_URL || "" },
});

