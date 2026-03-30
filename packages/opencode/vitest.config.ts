/// <reference types="vitest" />
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    watch: false,
    testTimeout: 30_000,
    environment: "node",
    include: ["test/**/*.{test,spec}.{js,ts,tsx}", "src/**/__tests__/**/*.{js,ts,tsx}"],
    exclude: ["node_modules", "dist", "build", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "build/",
        "test/",
        "**/*.d.ts",
        "**/*.config.*",
        "migration/",
        "src/provider/models-snapshot.ts"
      ]
    }
  },
  esbuild: {
    target: "node18"
  }
})
