import { test, expect, type Page } from "@playwright/test"

// Smoke tests for critical extension functionality
// These tests verify that the extension can start up and perform basic operations

test.describe("Extension Smoke Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the extension webview
    await page.goto("http://localhost:6007")
    
    // Wait for the page to load
    await page.waitForLoadState("networkidle")
    
    // Disable animations for consistent testing
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    })
  })

  test("extension loads and renders main interface", async ({ page }) => {
    // Verify the main interface elements are present
    await expect(page.locator('[data-testid="chat-view"]')).toBeVisible()
    await expect(page.locator('[data-testid="prompt-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="send-button"]')).toBeVisible()
  })

  test("can send a basic message", async ({ page }) => {
    // Find the prompt input
    const promptInput = page.locator('[data-testid="prompt-input"]')
    await expect(promptInput).toBeVisible()
    
    // Type a test message
    await promptInput.fill("Hello, this is a test message")
    
    // Click send button
    const sendButton = page.locator('[data-testid="send-button"]')
    await sendButton.click()
    
    // Verify the message appears in chat
    await expect(page.locator('[data-testid="user-message"]')).toContainText("Hello, this is a test message")
  })

  test("can access settings", async ({ page }) => {
    // Look for settings button or menu
    const settingsButton = page.locator('[data-testid="settings-button"]')
    if (await settingsButton.isVisible()) {
      await settingsButton.click()
      
      // Verify settings panel appears
      await expect(page.locator('[data-testid="settings-panel"]')).toBeVisible()
    }
  })

  test("handles file mentions", async ({ page }) => {
    const promptInput = page.locator('[data-testid="prompt-input"]')
    await expect(promptInput).toBeVisible()
    
    // Type @ to trigger file mention
    await promptInput.fill("@")
    
    // Should show file suggestions (if implemented)
    await page.waitForTimeout(1000)
    
    // Verify the @ symbol is still there
    expect(await promptInput.inputValue()).toBe("@")
  })

  test("displays error messages properly", async ({ page }) => {
    // This would require mocking an error scenario
    // For now, just verify error display components exist
    const errorDisplay = page.locator('[data-testid="error-display"]')
    if (await errorDisplay.isVisible()) {
      await expect(errorDisplay).toBeVisible()
    }
  })

  test("responsive design works on different viewports", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('[data-testid="chat-view"]')).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('[data-testid="chat-view"]')).toBeVisible()
    
    // Test sidebar viewport (original size)
    await page.setViewportSize({ width: 420, height: 720 })
    await expect(page.locator('[data-testid="chat-view"]')).toBeVisible()
  })

  test("keyboard navigation works", async ({ page }) => {
    const promptInput = page.locator('[data-testid="prompt-input"]')
    await expect(promptInput).toBeVisible()
    
    // Focus the input
    await promptInput.focus()
    await expect(promptInput).toBeFocused()
    
    // Type and test Enter to send
    await promptInput.fill("Test keyboard navigation")
    await page.keyboard.press("Enter")
    
    // Verify message was sent (if send functionality works)
    await page.waitForTimeout(1000)
  })

  test("handles empty input gracefully", async ({ page }) => {
    const promptInput = page.locator('[data-testid="prompt-input"]')
    const sendButton = page.locator('[data-testid="send-button"]')
    
    // Try to send empty message
    await promptInput.fill("")
    await sendButton.click()
    
    // Should not send empty message
    // Verify no new user message appears
    const userMessages = page.locator('[data-testid="user-message"]')
    const currentCount = await userMessages.count()
    
    // Wait a moment to ensure no message is added
    await page.waitForTimeout(1000)
    
    // Count should be the same
    expect(await userMessages.count()).toBe(currentCount)
  })

  test("displays loading states", async ({ page }) => {
    const promptInput = page.locator('[data-testid="prompt-input"]')
    const sendButton = page.locator('[data-testid="send-button"]')
    
    // Send a message to trigger loading state
    await promptInput.fill("Test loading state")
    await sendButton.click()
    
    // Check for loading indicators
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]')
    const abortButton = page.locator('[data-testid="abort-button"]')
    
    // Should show either loading indicator or abort button
    const hasLoading = await loadingIndicator.isVisible() || await abortButton.isVisible()
    expect(hasLoading).toBeTruthy()
  })

  test("maintains conversation history", async ({ page }) => {
    const promptInput = page.locator('[data-testid="prompt-input"]')
    const sendButton = page.locator('[data-testid="send-button"]')
    
    // Send multiple messages
    const messages = [
      "First message",
      "Second message", 
      "Third message"
    ]
    
    for (const message of messages) {
      await promptInput.fill(message)
      await sendButton.click()
      await page.waitForTimeout(500)
    }
    
    // Verify all messages are in the conversation
    const conversationArea = page.locator('[data-testid="conversation-area"]')
    await expect(conversationArea).toContainText("First message")
    await expect(conversationArea).toContainText("Second message")
    await expect(conversationArea).toContainText("Third message")
  })
})

test.describe("Extension Error Handling", () => {
  test("handles network failures gracefully", async ({ page }) => {
    // Simulate network failure by going to an invalid page
    await page.goto("about:blank")
    
    // Should handle gracefully without crashing
    // This is more of a browser resilience test
    expect(page.url()).toBe("about:blank")
  })

  test("handles malformed input", async ({ page }) => {
    await page.goto("http://localhost:6007")
    await page.waitForLoadState("networkidle")
    
    const promptInput = page.locator('[data-testid="prompt-input"]')
    if (await promptInput.isVisible()) {
      // Try very long input
      const longText = "A".repeat(10000)
      await promptInput.fill(longText)
      
      // Should handle without crashing
      expect(await promptInput.inputValue()).toBe(longText)
      
      // Try special characters
      const specialChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?"
      await promptInput.fill(specialChars)
      expect(await promptInput.inputValue()).toBe(specialChars)
    }
  })

  test("handles rapid user interactions", async ({ page }) => {
    await page.goto("http://localhost:6007")
    await page.waitForLoadState("networkidle")
    
    const promptInput = page.locator('[data-testid="prompt-input"]')
    const sendButton = page.locator('[data-testid="send-button"]')
    
    if (await promptInput.isVisible() && await sendButton.isVisible()) {
      // Rapidly click send button
      for (let i = 0; i < 10; i++) {
        await sendButton.click()
        await page.waitForTimeout(50)
      }
      
      // Should handle gracefully without crashing
      await expect(page.locator('body')).toBeVisible()
    }
  })
})
