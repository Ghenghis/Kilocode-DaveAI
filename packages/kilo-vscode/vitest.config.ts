import { defineConfig } from "vitest/config"
import { resolve } from "path"

export default defineConfig({
  test: {
    globals: true,
    watch: false,
    testTimeout: 30_000,
    environment: "jsdom",
    include: ["tests/**/*.{test,spec}.{js,ts,tsx}", "src/**/__tests__/**/*.{js,ts,tsx}"],
    exclude: ["node_modules", "dist", "build", "out", "webview-ui/dist"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "build/",
        "out/",
        "test/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "webview-ui/dist/"
      ]
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  },
  esbuild: {
    target: "node18"
  }
})
