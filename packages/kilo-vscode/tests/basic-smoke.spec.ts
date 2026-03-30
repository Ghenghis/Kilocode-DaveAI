import { test, expect } from "@playwright/test"

// Simple smoke test that doesn't require Storybook
test("basic smoke test", async ({ page }) => {
  // Just navigate to a simple page to verify Playwright works
  await page.goto("about:blank")
  
  // Verify page loads
  expect(page.url()).toBe("about:blank")
  
  // Verify we can interact with the page
  await page.setContent("<html><body><h1>Test Page</h1></body></html>")
  
  // Verify content is loaded
  await expect(page.locator("h1")).toHaveText("Test Page")
})
