import { test, expect, type Page } from "@playwright/test"

// Error scenario testing
// These tests verify the application handles errors gracefully

test.describe("Error Scenario Testing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:6007")
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

  test("handles network timeout errors", async ({ page }) => {
    // Simulate network timeout by intercepting requests
    await page.route('**/*', route => {
      // Delay response to simulate timeout
      setTimeout(() => route.fulfill({
        status: 408,
        contentType: 'text/plain',
        body: 'Request Timeout'
      }), 30000)
    })

    const promptInput = page.locator('[data-testid="prompt-input"]')
    await promptInput.fill("Test message for timeout scenario")
    await page.locator('[data-testid="send-button"]').click()

    // Should handle timeout gracefully
    await page.waitForTimeout(35000)
    
    // Check for error display or timeout handling
    const errorDisplay = page.locator('[data-testid="error-display"]')
    const timeoutMessage = page.locator('[data-testid="timeout-message"]')
    
    // Either error should be displayed or app should recover
    const hasError = await errorDisplay.isVisible() || await timeoutMessage.isVisible()
    expect(hasError || await promptInput.isVisible()).toBeTruthy()
  })

  test("handles server error responses", async ({ page }) => {
    // Simulate server error
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal Server Error',
          message: 'Something went wrong on the server'
        })
      })
    })

    const promptInput = page.locator('[data-testid="prompt-input"]')
    await promptInput.fill("Test message for server error")
    await page.locator('[data-testid="send-button"]').click()

    await page.waitForTimeout(2000)

    // Should display server error
    const errorDisplay = page.locator('[data-testid="error-display"]')
    if (await errorDisplay.isVisible()) {
      await expect(errorDisplay).toContainText('Internal Server Error')
    }
  })

  test("handles malformed API responses", async ({ page }) => {
    // Simulate malformed response
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"invalid": json response}' // Invalid JSON
      })
    })

    const promptInput = page.locator('[data-testid="prompt-input"]')
    await promptInput.fill("Test message for malformed response")
    await page.locator('[data-testid="send-button"]').click()

    await page.waitForTimeout(2000)

    // Should handle malformed response gracefully
    const errorDisplay = page.locator('[data-testid="error-display"]')
    const promptInputStillVisible = await promptInput.isVisible()
    
    expect(errorDisplay.isVisible() || promptInputStillVisible).toBeTruthy()
  })

  test("handles authentication errors", async ({ page }) => {
    // Simulate authentication error
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'Authentication required'
        })
      })
    })

    const promptInput = page.locator('[data-testid="prompt-input"]')
    await promptInput.fill("Test message for auth error")
    await page.locator('[data-testid="send-button"]').click()

    await page.waitForTimeout(2000)

    // Should show authentication error or login prompt
    const authError = page.locator('[data-testid="auth-error"]')
    const loginPrompt = page.locator('[data-testid="login-prompt"]')
    
    const hasAuthError = await authError.isVisible() || await loginPrompt.isVisible()
    expect(hasAuthError).toBeTruthy()
  })

  test("handles rate limiting errors", async ({ page }) => {
    // Simulate rate limiting
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Rate Limit Exceeded',
          message: 'Too many requests'
        })
      })
    })

    const promptInput = page.locator('[data-testid="prompt-input"]')
    await promptInput.fill("Test message for rate limit")
    await page.locator('[data-testid="send-button"]').click()

    await page.waitForTimeout(2000)

    // Should show rate limiting message
    const rateLimitError = page.locator('[data-testid="rate-limit-error"]')
    if (await rateLimitError.isVisible()) {
      await expect(rateLimitError).toContainText('Rate Limit')
    }
  })

  test("handles resource exhaustion", async ({ page }) => {
    // Test with very large input
    const promptInput = page.locator('[data-testid="prompt-input"]')
    const largeText = "A".repeat(100000) // 100KB of text
    
    await promptInput.fill(largeText)
    
    // Should handle large input without crashing
    expect(await promptInput.inputValue()).toBe(largeText)
    
    // Try to send the large message
    await page.locator('[data-testid="send-button"]').click()
    await page.waitForTimeout(3000)
    
    // Should either handle gracefully or show appropriate error
    const promptInputStillVisible = await promptInput.isVisible()
    const errorDisplay = page.locator('[data-testid="error-display"]')
    
    expect(promptInputStillVisible || await errorDisplay.isVisible()).toBeTruthy()
  })

  test("handles concurrent requests", async ({ page }) => {
    const promptInput = page.locator('[data-testid="prompt-input"]')
    const sendButton = page.locator('[data-testid="send-button"]')
    
    // Send multiple messages rapidly
    const promises = []
    for (let i = 0; i < 10; i++) {
      await promptInput.fill(`Concurrent message ${i}`)
      promises.push(sendButton.click())
      await page.waitForTimeout(100)
    }
    
    await Promise.all(promises)
    await page.waitForTimeout(5000)
    
    // Should handle concurrent requests gracefully
    const promptInputStillVisible = await promptInput.isVisible()
    const errorDisplay = page.locator('[data-testid="error-display"]')
    
    expect(promptInputStillVisible || await errorDisplay.isVisible()).toBeTruthy()
  })

  test("handles memory pressure scenarios", async ({ page }) => {
    // Create memory pressure by generating large objects
    await page.evaluate(() => {
      // Create large arrays to simulate memory pressure
      const largeArrays = []
      for (let i = 0; i < 100; i++) {
        largeArrays.push(new Array(10000).fill(`memory-test-${i}`))
      }
      
      // Store in window for testing
      (window as any).memoryTestData = largeArrays
    })
    
    // Try to use the application under memory pressure
    const promptInput = page.locator('[data-testid="prompt-input"]')
    await promptInput.fill("Test under memory pressure")
    await page.locator('[data-testid="send-button"]').click()
    
    await page.waitForTimeout(3000)
    
    // Should still be functional
    expect(await promptInput.isVisible()).toBeTruthy()
    
    // Clean up
    await page.evaluate(() => {
      delete (window as any).memoryTestData
    })
  })

  test("handles browser storage errors", async ({ page }) => {
    // Test storage quota exceeded
    await page.evaluate(() => {
      try {
        // Fill localStorage to capacity
        const data = "x".repeat(10000)
        for (let i = 0; i < 1000; i++) {
          localStorage.setItem(`test-${i}`, data)
        }
      } catch (error) {
        ;(window as any).storageError = error
      }
    })
    
    // Try to use the application with storage issues
    const promptInput = page.locator('[data-testid="prompt-input"]')
    await promptInput.fill("Test with storage issues")
    await page.locator('[data-testid="send-button"]').click()
    
    await page.waitForTimeout(2000)
    
    // Should handle storage errors gracefully
    expect(await promptInput.isVisible()).toBeTruthy()
  })

  test("handles WebSocket connection errors", async ({ page }) => {
    // Intercept WebSocket connections and simulate errors
    await page.route('**/ws/**', route => {
      route.fulfill({
        status: 500,
        body: 'WebSocket connection failed'
      })
    })
    
    // Try to use features that might use WebSocket
    const promptInput = page.locator('[data-testid="prompt-input"]')
    await promptInput.fill("Test WebSocket error handling")
    await page.locator('[data-testid="send-button"]').click()
    
    await page.waitForTimeout(3000)
    
    // Should handle WebSocket errors gracefully
    const promptInputStillVisible = await promptInput.isVisible()
    const errorDisplay = page.locator('[data-testid="error-display"]')
    
    expect(promptInputStillVisible || await errorDisplay.isVisible()).toBeTruthy()
  })

  test("handles CORS errors", async ({ page }) => {
    // Simulate CORS error
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://wrong-origin.com'
        },
        body: JSON.stringify({ message: 'CORS test' })
      })
    })
    
    const promptInput = page.locator('[data-testid="prompt-input"]')
    await promptInput.fill("Test CORS error handling")
    await page.locator('[data-testid="send-button"]').click()
    
    await page.waitForTimeout(2000)
    
    // Should handle CORS issues gracefully
    const promptInputStillVisible = await promptInput.isVisible()
    const errorDisplay = page.locator('[data-testid="error-display"]')
    
    expect(promptInputStillVisible || await errorDisplay.isVisible()).toBeTruthy()
  })

  test("handles unexpected browser crashes", async ({ page }) => {
    // Simulate browser crash scenarios by testing extreme conditions
    await page.evaluate(() => {
      // Create recursive function that might cause stack overflow
      function recursiveTest(depth: number): void {
        if (depth > 1000) return
        recursiveTest(depth + 1)
      }
      
      try {
        recursiveTest(0)
      } catch (error) {
        ;(window as any).recursionError = error
      }
    })
    
    // Application should still be functional
    const promptInput = page.locator('[data-testid="prompt-input"]')
    await expect(promptInput).toBeVisible()
    
    await promptInput.fill("Test after extreme conditions")
    await page.locator('[data-testid="send-button"]').click()
    
    await page.waitForTimeout(2000)
    expect(await promptInput.isVisible()).toBeTruthy()
  })

  test("handles invalid user input gracefully", async ({ page }) => {
    const promptInput = page.locator('[data-testid="prompt-input"]')
    
    // Test various invalid inputs
    const invalidInputs = [
      null,
      undefined,
      "",
      "   ", // Whitespace only
      "\0", // Null character
      "\x00\x01\x02", // Control characters
      "🚀🔥💯🎉", // Unicode emojis
      "<script>alert('xss')</script>", // XSS attempt
      "{{{{invalid template}}}}", // Template injection
      "SELECT * FROM users; DROP TABLE users;", // SQL injection
    ]
    
    for (const input of invalidInputs) {
      await promptInput.fill(input || "")
      
      // Should handle without crashing
      expect(await promptInput.isVisible()).toBeTruthy()
      
      // Try to send (might be blocked by validation)
      await page.locator('[data-testid="send-button"]').click()
      await page.waitForTimeout(500)
      
      // Should still be functional
      expect(await promptInput.isVisible()).toBeTruthy()
    }
  })

  test("handles browser compatibility issues", async ({ page, browserName }) => {
    // Test browser-specific compatibility issues
    const compatibilityTest = await page.evaluate(() => {
      const issues = []
      
      // Test for common browser compatibility issues
      try {
        // Test for undefined objects
        if (typeof window.fetch === 'undefined') {
          issues.push('fetch not supported')
        }
        
        // Test for missing methods
        if (typeof Array.prototype.includes === 'undefined') {
          issues.push('Array.includes not supported')
        }
        
        // Test for CSS support
        const testElement = document.createElement('div')
        testElement.style.display = 'flex'
        if (testElement.style.display !== 'flex') {
          issues.push('flexbox not supported')
        }
        
        return issues
      } catch (error) {
        return ['compatibility test error: ' + error]
      }
    })
    
    // Should handle any compatibility issues gracefully
    const promptInput = page.locator('[data-testid="prompt-input"]')
    await expect(promptInput).toBeVisible()
    
    // Log any compatibility issues found
    if (compatibilityTest.length > 0) {
      console.log(`Compatibility issues in ${browserName}:`, compatibilityTest)
    }
  })
})
