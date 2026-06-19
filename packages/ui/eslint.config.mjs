import { defineConfig } from "eslint/config";
import baseConfig from "../../eslint.config.mjs";

export default defineConfig([
  ...baseConfig,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
    },
  },
]);
