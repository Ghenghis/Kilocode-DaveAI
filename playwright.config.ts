import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  testMatch: [
    "**/*.spec.ts",
    "**/*.test.ts"
  ],
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "test-results/html" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/results.xml" }],
    ["list"]
  ],
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "unit-tests",
      testMatch: "**/unit/**/*.spec.ts",
      use: {
        headless: true
      }
    },
    {
      name: "integration-tests", 
      testMatch: "**/integration/**/*.spec.ts",
      use: {
        headless: true
      }
    },
    {
      name: "e2e-tests",
      testMatch: "**/e2e/**/*.spec.ts",
      use: {
        headless: false
      }
    },
    {
      name: "governance-tests",
      testMatch: "**/governance/**/*.spec.ts",
      use: {
        headless: true
      }
    },
    {
      name: "performance-tests",
      testMatch: "**/performance/**/*.spec.ts",
      use: {
        headless: true
      }
    },
    {
      name: "security-tests",
      testMatch: "**/security/**/*.spec.ts",
      use: {
        headless: true
      }
    },
    {
      name: "migration-tests",
      testMatch: "**/migration/**/*.spec.ts",
      use: {
        headless: true
      }
    },
    {
      name: "resilience-tests",
      testMatch: "**/resilience/**/*.spec.ts",
      use: {
        headless: true
      }
    },
    {
      name: "scalability-tests",
      testMatch: "**/scalability/**/*.spec.ts",
      use: {
        headless: true
      }
    },
    {
      name: "disaster-recovery-tests",
      testMatch: "**/disaster-recovery/**/*.spec.ts",
      use: {
        headless: true
      }
    }
  ],
  outputDir: "test-results",
  webServer: {
    command: "bun run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
})
