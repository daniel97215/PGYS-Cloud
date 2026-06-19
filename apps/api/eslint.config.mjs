import { defineConfig } from "eslint/config";
import baseConfig from "../../eslint.config.mjs";

export default defineConfig([
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    settings: {
      react: {
        version: "19.2.4"
      }
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off"
    }
  }
]);
