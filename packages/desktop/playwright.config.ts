import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false, // Desktop tests often need sequential execution
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 1,
  workers: process.env["PLAYWRIGHT_WORKERS"]
    ? Number.parseInt(process.env["PLAYWRIGHT_WORKERS"]!, 10) || 1
    : 1, // Limit workers for desktop testing
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:1420", // Default Tauri dev port
    viewport: { width: 1200, height: 800 }, // Default desktop size
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { 
        ...devices["Desktop Chrome"], 
        viewport: { width: 1200, height: 800 },
        contextOptions: {
          permissions: ["clipboard-read", "clipboard-write", "notifications"]
        }
      },
    },
    {
      name: "firefox-desktop",
      use: { 
        ...devices["Desktop Firefox"], 
        viewport: { width: 1200, height: 800 },
        contextOptions: {
          permissions: ["clipboard-read", "clipboard-write", "notifications"]
        }
      },
    },
    {
      name: "webkit-desktop",
      use: { 
        ...devices["Desktop Safari"], 
        viewport: { width: 1200, height: 800 },
        contextOptions: {
          permissions: ["clipboard-read", "clipboard-write", "notifications"]
        }
      },
    }
  ],
  webServer: {
    command: "bun run dev", // Start Tauri dev server
    url: "http://localhost:1420",
    reuseExistingServer: !process.env["CI"],
    timeout: 300_000, // 5 minutes for desktop app startup
  },
  timeout: 120_000, // 2 minutes for desktop operations
  expect: {
    timeout: 15_000, // Longer timeout for desktop operations
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02, // Slightly higher tolerance for desktop UI
      animation: "disabled"
    },
  },
})
