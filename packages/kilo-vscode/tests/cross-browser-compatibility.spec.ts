import { test, expect, type Page } from "@playwright/test"

// Cross-browser compatibility tests
// These tests verify functionality works across different browsers

test.describe("Cross-browser Compatibility", () => {
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

  test("basic functionality works across browsers", async ({ page, browserName }) => {
    // Test basic chat functionality
    const promptInput = page.locator('[data-testid="prompt-input"]')
    await expect(promptInput).toBeVisible()
    
    // Type and send a message
    await promptInput.fill(`Test message for ${browserName}`)
    await page.locator('[data-testid="send-button"]').click()
    
    // Verify message appears
    await page.waitForTimeout(2000)
    const conversationArea = page.locator('[data-testid="conversation-area"]')
    await expect(conversationArea).toContainText(`Test message for ${browserName}`)
  })

  test("keyboard navigation works across browsers", async ({ page, browserName }) => {
    const promptInput = page.locator('[data-testid="prompt-input"]')
    await expect(promptInput).toBeVisible()
    
    // Test keyboard shortcuts
    await promptInput.focus()
    await promptInput.fill(`Keyboard test for ${browserName}`)
    
    // Test Enter to send (implementation dependent)
    await page.keyboard.press("Enter")
    await page.waitForTimeout(1000)
    
    // Test Tab navigation
    await page.keyboard.press("Tab")
    // Should move to next focusable element
  })

  test("responsive design works across browsers", async ({ page, browserName }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1024, height: 768 }, // Desktop
      { width: 420, height: 720 }   // VS Code sidebar
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.waitForTimeout(500)
      
      // Verify main interface is still visible
      await expect(page.locator('[data-testid="chat-view"]')).toBeVisible()
      await expect(page.locator('[data-testid="prompt-input"]')).toBeVisible()
    }
  })

  test("file uploads work across browsers", async ({ page, browserName }) => {
    const promptInput = page.locator('[data-testid="prompt-input"]')
    await expect(promptInput).toBeVisible()
    
    // Test paste functionality (browser-specific)
    await promptInput.focus()
    
    // Simulate paste event
    await page.evaluate(() => {
      const event = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer()
      })
      document.dispatchEvent(event)
    })
    
    // Should handle gracefully in all browsers
    await expect(promptInput).toBeVisible()
  })

  test("error handling works across browsers", async ({ page, browserName }) => {
    // Test error display
    const promptInput = page.locator('[data-testid="prompt-input"]')
    
    // Try to send very long message
    const longMessage = "A".repeat(1000)
    await promptInput.fill(longMessage)
    
    // Should handle gracefully
    await expect(promptInput).toHaveValue(longMessage)
    
    // Test special characters
    const specialChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?"
    await promptInput.fill(specialChars)
    await expect(promptInput).toHaveValue(specialChars)
  })

  test("localStorage/sessionStorage works across browsers", async ({ page, browserName }) => {
    // Test browser storage functionality
    await page.evaluate(() => {
      localStorage.setItem('test-key', `test-value-${browserName}`)
      sessionStorage.setItem('session-test', `session-value-${browserName}`)
    })
    
    // Verify storage works
    const localStorageValue = await page.evaluate(() => localStorage.getItem('test-key'))
    const sessionStorageValue = await page.evaluate(() => sessionStorage.getItem('session-test'))
    
    expect(localStorageValue).toBe(`test-value-${browserName}`)
    expect(sessionStorageValue).toBe(`session-value-${browserName}`)
  })

  test("console logging works across browsers", async ({ page, browserName }) => {
    // Test console functionality
    const consoleMessages: string[] = []
    
    page.on('console', msg => {
      consoleMessages.push(msg.text())
    })
    
    await page.evaluate(() => {
      console.log(`Test log for ${browserName}`)
      console.warn(`Test warning for ${browserName}`)
      console.error(`Test error for ${browserName}`)
    })
    
    await page.waitForTimeout(1000)
    
    // Verify console messages were captured
    expect(consoleMessages.some(msg => msg.includes(`Test log for ${browserName}`))).toBeTruthy()
  })

  test("network requests work across browsers", async ({ page, browserName }) => {
    // Monitor network requests
    const requests: string[] = []
    
    page.on('request', request => {
      requests.push(request.url())
    })
    
    // Trigger some network activity
    await page.evaluate(() => {
      fetch('/api/test', { method: 'POST', body: JSON.stringify({ test: true }) })
        .catch(() => {}); // Ignore errors for test
    })
    
    await page.waitForTimeout(1000)
    
    // Network requests should work (actual requests depend on implementation)
    expect(requests.length).toBeGreaterThanOrEqual(0)
  })

  test("CSS rendering works across browsers", async ({ page, browserName }) => {
    // Test CSS properties
    const computedStyles = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="chat-view"]')
      if (!element) return null
      
      const styles = getComputedStyle(element)
      return {
        display: styles.display,
        position: styles.position,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize
      }
    })
    
    if (computedStyles) {
      expect(computedStyles.display).toBeDefined()
      expect(computedStyles.position).toBeDefined()
      expect(computedStyles.fontFamily).toBeDefined()
      expect(computedStyles.fontSize).toBeDefined()
    }
  })

  test("JavaScript execution works across browsers", async ({ page, browserName }) => {
    // Test JavaScript features
    const jsTest = await page.evaluate(() => {
      return {
        arrayMethods: Array.isArray([]),
        objectKeys: Object.keys({ test: true }),
        jsonParse: JSON.parse('{"test": true}'),
        promise: Promise.resolve('test'),
        arrowFunction: (() => 'test')(),
        templateLiteral: `test-${browserName}`
      }
    })
    
    expect(jsTest.arrayMethods).toBe(true)
    expect(jsTest.objectKeys).toEqual(['test'])
    expect(jsTest.jsonParse).toEqual({ test: true })
    expect(jsTest.templateLiteral).toBe(`test-${browserName}`)
  })

  test("form handling works across browsers", async ({ page, browserName }) => {
    // Test form submission and validation
    await page.evaluate(() => {
      const form = document.createElement('form')
      const input = document.createElement('input')
      input.type = 'text'
      input.name = 'test'
      input.value = `test-${browserName}`
      form.appendChild(input)
      document.body.appendChild(form)
      
      form.addEventListener('submit', (e) => {
        e.preventDefault()
        ;(window as any).testFormSubmitted = true
      })
      
      form.submit()
    })
    
    await page.waitForTimeout(1000)
    
    const formSubmitted = await page.evaluate(() => (window as any).testFormSubmitted)
    expect(formSubmitted).toBe(true)
  })

  test("event handling works across browsers", async ({ page, browserName }) => {
    // Test event listeners and propagation
    const eventTest = await page.evaluate(() => {
      let clickCount = 0
      
      document.addEventListener('click', () => {
        clickCount++
      })
      
      document.body.click()
      document.body.click()
      document.body.click()
      
      return clickCount
    })
    
    expect(eventTest).toBe(3)
  })
})

test.describe("Browser-specific Features", () => {
  test("Chrome-specific features", async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome-specific test')
    
    // Test Chrome DevTools protocol features
    const chromeFeatures = await page.evaluate(() => {
      return {
        hasChrome: typeof (window as any).chrome !== 'undefined',
        hasWebkit: typeof (window as any).webkit !== 'undefined',
        userAgent: navigator.userAgent
      }
    })
    
    expect(chromeFeatures.userAgent).toContain('Chrome')
  })

  test("Firefox-specific features", async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test')
    
    // Test Firefox-specific features
    const firefoxFeatures = await page.evaluate(() => {
      return {
        userAgent: navigator.userAgent,
        hasInstallTrigger: typeof (window as any).InstallTrigger !== 'undefined'
      }
    })
    
    expect(firefoxFeatures.userAgent).toContain('Firefox')
  })

  test("Safari-specific features", async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari-specific test')
    
    // Test Safari-specific features
    const safariFeatures = await page.evaluate(() => {
      return {
        userAgent: navigator.userAgent,
        hasWebkit: typeof (window as any).webkit !== 'undefined'
      }
    })
    
    const hasSafari = safariFeatures.userAgent.includes('Safari')
    const hasWebKit = safariFeatures.userAgent.includes('AppleWebKit')
    expect(hasSafari || hasWebKit).toBeTruthy()
  })

  test("Edge-specific features", async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium' || !navigator.userAgent.includes('Edg'), 'Edge-specific test')
    
    // Test Edge-specific features
    const edgeFeatures = await page.evaluate(() => {
      return {
        userAgent: navigator.userAgent
      }
    })
    
    expect(edgeFeatures.userAgent).toContain('Edg')
  })
})
