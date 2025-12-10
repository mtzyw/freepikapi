import next from "eslint-config-next";
import tseslint from "@typescript-eslint/eslint-plugin";

// Base Next.js + TypeScript config (flat)
const config = [
  ...next,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
];

export default config;
