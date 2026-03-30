import { test, expect, type Page } from "@playwright/test"

// Visual regression testing across browsers and platforms
// These tests ensure visual consistency and detect UI regressions

test.describe("Visual Regression Testing", () => {
  const viewports = [
    { width: 800, height: 600, name: "mobile" },
    { width: 1024, height: 768, name: "tablet" },
    { width: 1280, height: 720, name: "desktop-small" },
    { width: 1920, height: 1080, name: "desktop-large" }
  ]

  const themes = ['light', 'dark', 'auto']

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:1420")
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

  test("main interface visual regression", async ({ page }) => {
    // Test main interface across all viewports
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForTimeout(500)
      
      await expect(page).toHaveScreenshot(`main-interface-${viewport.name}-${viewport.width}x${viewport.height}.png`, {
        fullPage: true,
        animations: "disabled",
        maxDiffPixelRatio: 0.02
      })
    }
  })

  test("chat interface visual regression", async ({ page }) => {
    // Navigate to chat section
    const chatButton = page.locator('[data-testid="nav-chat"]')
    if (await chatButton.isVisible()) {
      await chatButton.click()
      await page.waitForTimeout(1000)
    }

    // Test chat interface across viewports
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForTimeout(500)
      
      await expect(page).toHaveScreenshot(`chat-interface-${viewport.name}-${viewport.width}x${viewport.height}.png`, {
        fullPage: true,
        animations: "disabled",
        maxDiffPixelRatio: 0.02
      })
    }

    // Test chat interaction states
    const chatInput = page.locator('[data-testid="chat-input"] input')
    if (await chatInput.isVisible()) {
      // Empty state
      await expect(page).toHaveScreenshot("chat-input-empty.png", {
        animations: "disabled",
        maxDiffPixelRatio: 0.02
      })

      // Focused state
      await chatInput.click()
      await page.waitForTimeout(200)
      await expect(page).toHaveScreenshot("chat-input-focused.png", {
        animations: "disabled",
        maxDiffPixelRatio: 0.02
      })

      // Typing state
      await chatInput.fill("Hello, this is a test message")
      await page.waitForTimeout(200)
      await expect(page).toHaveScreenshot("chat-input-typing.png", {
        animations: "disabled",
        maxDiffPixelRatio: 0.02
      })

      // Message sent state (simulate)
      await chatInput.press("Enter")
      await page.waitForTimeout(500)
      await expect(page).toHaveScreenshot("chat-message-sent.png", {
        animations: "disabled",
        maxDiffPixelRatio: 0.02
      })
    }
  })

  test("settings interface visual regression", async ({ page }) => {
    // Navigate to settings section
    const settingsButton = page.locator('[data-testid="nav-settings"]')
    if (await settingsButton.isVisible()) {
      await settingsButton.click()
      await page.waitForTimeout(1000)
    }

    // Test settings across viewports
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForTimeout(500)
      
      await expect(page).toHaveScreenshot(`settings-interface-${viewport.name}-${viewport.width}x${viewport.height}.png`, {
        fullPage: true,
        animations: "disabled",
        maxDiffPixelRatio: 0.02
      })
    }

    // Test settings tabs
    const settingsTabs = [
      'general-settings',
      'model-settings', 
      'interface-settings',
      'advanced-settings'
    ]

    for (const tab of settingsTabs) {
      const tabButton = page.locator(`[data-testid="settings-tab-${tab}"]`)
      if (await tabButton.isVisible()) {
        await tabButton.click()
        await page.waitForTimeout(500)
        
        await expect(page).toHaveScreenshot(`settings-${tab}.png`, {
          fullPage: true,
          animations: "disabled",
          maxDiffPixelRatio: 0.02
        })
      }
    }
  })

  test("theme visual regression", async ({ page }) => {
    // Test different themes
    for (const theme of themes) {
      const themeButton = page.locator(`[data-testid="theme-${theme}"]`)
      if (await themeButton.isVisible()) {
        await themeButton.click()
        await page.waitForTimeout(1000)
        
        // Test theme across viewports
        for (const viewport of viewports) {
          await page.setViewportSize({ width: viewport.width, height: viewport.height })
          await page.waitForTimeout(500)
          
          await expect(page).toHaveScreenshot(`theme-${theme}-${viewport.name}-${viewport.width}x${viewport.height}.png`, {
            fullPage: true,
            animations: "disabled",
            maxDiffPixelRatio: 0.02
          })
        }
      }
    }
  })

  test("form components visual regression", async ({ page }) => {
    // Navigate to settings for form testing
    const settingsButton = page.locator('[data-testid="nav-settings"]')
    if (await settingsButton.isVisible()) {
      await settingsButton.click()
      await page.waitForTimeout(1000)
    }

    // Test form input states
    const formInputs = [
      { selector: 'input[type="text"]', type: "text" },
      { selector: 'input[type="password"]', type: "password" },
      { selector: 'input[type="email"]', type: "email" },
      { selector: 'textarea', type: "textarea" },
      { selector: 'select', type: "select" }
    ]

    for (const input of formInputs) {
      const inputElement = page.locator(input.selector)
      if (await inputElement.isVisible()) {
        // Default state
        await expect(page).toHaveScreenshot(`form-${input.type}-default.png`, {
          animations: "disabled",
          maxDiffPixelRatio: 0.02
        })

        // Focus state
        await inputElement.click()
        await page.waitForTimeout(200)
        await expect(page).toHaveScreenshot(`form-${input.type}-focused.png`, {
          animations: "disabled",
          maxDiffPixelRatio: 0.02
        })

        // Filled state
        if (input.type !== 'select') {
          await inputElement.fill("Test content")
          await page.waitForTimeout(200)
          await expect(page).toHaveScreenshot(`form-${input.type}-filled.png`, {
            animations: "disabled",
            maxDiffPixelRatio: 0.02
          })
        }

        // Error state
        const errorTrigger = page.locator(`[data-testid="trigger-${input.type}-error"]`)
        if (await errorTrigger.isVisible()) {
          await errorTrigger.click()
          await page.waitForTimeout(200)
          await expect(page).toHaveScreenshot(`form-${input.type}-error.png`, {
            animations: "disabled",
            maxDiffPixelRatio: 0.02
          })
        }
      }
    }

    // Test checkbox and radio states
    const checkboxes = page.locator('input[type="checkbox"]')
    const checkboxCount = await checkboxes.count()

    for (let i = 0; i < Math.min(checkboxCount, 3); i++) {
      const checkbox = checkboxes.nth(i)
      
      // Unchecked state
      await expect(page).toHaveScreenshot(`checkbox-${i}-unchecked.png`, {
        animations: "disabled",
        maxDiffPixelRatio: 0.02
      })

      // Checked state
      await checkbox.check()
      await page.waitForTimeout(200)
      await expect(page).toHaveScreenshot(`checkbox-${i}-checked.png`, {
        animations: "disabled",
        maxDiffPixelRatio: 0.02
      })
    }

    const radios = page.locator('input[type="radio"]')
    const radioCount = await radios.count()

    for (let i = 0; i < Math.min(radioCount, 3); i++) {
      const radio = radios.nth(i)
      
      // Unchecked state
      await expect(page).toHaveScreenshot(`radio-${i}-unchecked.png`, {
        animations: "disabled",
        maxDiffPixelRatio: 0.02
      })

      // Checked state
      await radio.check()
      await page.waitForTimeout(200)
      await expect(page).toHaveScreenshot(`radio-${i}-checked.png`, {
        animations: "disabled",
        maxDiffPixelRatio: 0.02
      })
    }
  })

  test("button components visual regression", async ({ page }) => {
    // Test different button types and states
    const buttonTypes = [
      { selector: '[data-testid="primary-button"]', type: "primary" },
      { selector: '[data-testid="secondary-button"]', type: "secondary" },
      { selector: '[data-testid="danger-button"]', type: "danger" },
      { selector: '[data-testid="success-button"]', type: "success" },
      { selector: '[data-testid="icon-button"]', type: "icon" }
    ]

    for (const buttonType of buttonTypes) {
      const button = page.locator(buttonType.selector)
      if (await button.isVisible()) {
        // Default state
        await expect(page).toHaveScreenshot(`button-${buttonType.type}-default.png`, {
          animations: "disabled",
          maxDiffPixelRatio: 0.02
        })

        // Hover state
        await button.hover()
        await page.waitForTimeout(200)
        await expect(page).toHaveScreenshot(`button-${buttonType.type}-hover.png`, {
          animations: "disabled",
          maxDiffPixelRatio: 0.02
        })

        // Active state
        await button.click()
        await page.waitForTimeout(200)
        await expect(page).toHaveScreenshot(`button-${buttonType.type}-active.png`, {
          animations: "disabled",
          maxDiffPixelRatio: 0.02
        })

        // Disabled state
        const disabledToggle = page.locator(`[data-testid="disable-${buttonType.type}"]`)
        if (await disabledToggle.isVisible()) {
          await disabledToggle.click()
          await page.waitForTimeout(200)
          await expect(page).toHaveScreenshot(`button-${buttonType.type}-disabled.png`, {
            animations: "disabled",
            maxDiffPixelRatio: 0.02
          })
        }
      }
    }
  })

  test("notification visual regression", async ({ page }) => {
    // Test different notification types
    const notificationTypes = ['info', 'success', 'warning', 'error']

    for (const type of notificationTypes) {
      const triggerButton = page.locator(`[data-testid="trigger-${type}-notification"]`)
      if (await triggerButton.isVisible()) {
        await triggerButton.click()
        await page.waitForTimeout(500)
        
        await expect(page).toHaveScreenshot(`notification-${type}.png`, {
          animations: "disabled",
          maxDiffPixelRatio: 0.02
        })

        // Dismiss notification
        const dismissButton = page.locator('[data-testid="dismiss-notification"]')
        if (await dismissButton.isVisible()) {
          await dismissButton.click()
          await page.waitForTimeout(500)
        }
      }
    }
  })

  test("modal and dialog visual regression", async ({ page }) => {
    // Test different modal types
    const modalTypes = [
      'about-modal',
      'help-modal',
      'confirm-dialog',
      'error-dialog',
      'success-dialog'
    ]

    for (const modalType of modalTypes) {
      const modalTrigger = page.locator(`[data-testid="trigger-${modalType}"]`)
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click()
        await page.waitForTimeout(500)
        
        await expect(page).toHaveScreenshot(`modal-${modalType}.png`, {
          animations: "disabled",
          maxDiffPixelRatio: 0.02
        })

        // Close modal
        const closeButton = page.locator('[data-testid="modal-close"]')
        if (await closeButton.isVisible()) {
          await closeButton.click()
          await page.waitForTimeout(500)
        }
      }
    }
  })

  test("loading states visual regression", async ({ page }) => {
    // Test different loading states
    const loadingStates = [
      'loading-spinner',
      'progress-bar',
      'skeleton-loader',
      'shimmer-effect'
    ]

    for (const loadingState of loadingStates) {
      const triggerButton = page.locator(`[data-testid="trigger-${loadingState}"]`)
      if (await triggerButton.isVisible()) {
        await triggerButton.click()
        await page.waitForTimeout(500)
        
        await expect(page).toHaveScreenshot(`loading-${loadingState}.png`, {
          animations: "disabled",
          maxDiffPixelRatio: 0.02
        })

        // Stop loading
        const stopButton = page.locator(`[data-testid="stop-${loadingState}"]`)
        if (await stopButton.isVisible()) {
          await stopButton.click()
          await page.waitForTimeout(500)
        }
      }
    }
  })

  test("responsive design visual regression", async ({ page }) => {
    // Test responsive breakpoints
    const breakpoints = [
      { width: 320, height: 568, name: "mobile-small" },
      { width: 375, height: 667, name: "mobile-medium" },
      { width: 414, height: 896, name: "mobile-large" },
      { width: 768, height: 1024, name: "tablet-small" },
      { width: 1024, height: 768, name: "tablet-medium" },
      { width: 1280, height: 720, name: "desktop-small" },
      { width: 1366, height: 768, name: "desktop-medium" },
      { width: 1920, height: 1080, name: "desktop-large" },
      { width: 2560, height: 1440, name: "desktop-xlarge" }
    ]

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
      await page.waitForTimeout(500)
      
      await expect(page).toHaveScreenshot(`responsive-${breakpoint.name}-${breakpoint.width}x${breakpoint.height}.png`, {
        fullPage: true,
        animations: "disabled",
        maxDiffPixelRatio: 0.02
      })
    }
  })

  test("cross-browser visual regression", async ({ page, browserName }) => {
    // Test browser-specific rendering
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)
    
    await expect(page).toHaveScreenshot(`browser-${browserName}-main-interface.png`, {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.03 // Slightly higher tolerance for cross-browser differences
    })

    // Test chat interface
    const chatButton = page.locator('[data-testid="nav-chat"]')
    if (await chatButton.isVisible()) {
      await chatButton.click()
      await page.waitForTimeout(1000)
      
      await expect(page).toHaveScreenshot(`browser-${browserName}-chat-interface.png`, {
        fullPage: true,
        animations: "disabled",
        maxDiffPixelRatio: 0.03
      })
    }

    // Test settings interface
    const settingsButton = page.locator('[data-testid="nav-settings"]')
    if (await settingsButton.isVisible()) {
      await settingsButton.click()
      await page.waitForTimeout(1000)
      
      await expect(page).toHaveScreenshot(`browser-${browserName}-settings-interface.png`, {
        fullPage: true,
        animations: "disabled",
        maxDiffPixelRatio: 0.03
      })
    }
  })

  test("component-level visual regression", async ({ page }) => {
    // Test individual components
    const components = [
      { selector: '[data-testid="app-header"]', name: "header" },
      { selector: '[data-testid="sidebar"]', name: "sidebar" },
      { selector: '[data-testid="main-content"]', name: "main-content" },
      { selector: '[data-testid="status-bar"]', name: "status-bar" },
      { selector: '[data-testid="navigation"]', name: "navigation" }
    ]

    for (const component of components) {
      const element = page.locator(component.selector)
      if (await element.isVisible()) {
        await expect(element).toHaveScreenshot(`component-${component.name}.png`, {
          animations: "disabled",
          maxDiffPixelRatio: 0.02
        })
      }
    }
  })

  test("interaction flow visual regression", async ({ page }) => {
    // Test complete user interaction flows
    const flows = [
      {
        name: "new-chat-flow",
        steps: [
          { action: 'click', selector: '[data-testid="nav-chat"]' },
          { action: 'click', selector: '[data-testid="new-session"]' },
          { action: 'type', selector: '[data-testid="chat-input"] input', text: "Hello, world!" },
          { action: 'click', selector: '[data-testid="send-button"]' }
        ]
      },
      {
        name: "settings-flow",
        steps: [
          { action: 'click', selector: '[data-testid="nav-settings"]' },
          { action: 'click', selector: '[data-testid="settings-tab-general"]' },
          { action: 'type', selector: '[data-testid="setting-model"]', text: "gpt-4" },
          { action: 'click', selector: '[data-testid="save-settings"]' }
        ]
      }
    ]

    for (const flow of flows) {
      // Reset to initial state
      await page.goto("http://localhost:1420")
      await page.waitForLoadState("networkidle")
      await page.waitForTimeout(500)

      // Execute flow steps
      for (const step of flow.steps) {
        switch (step.action) {
          case 'click':
            await page.locator(step.selector).click()
            break
          case 'type':
            await page.locator(step.selector).fill(step.text || "")
            break
        }
        await page.waitForTimeout(500)
        
        // Take screenshot after each step
        if (flow.steps.indexOf(step) === flow.steps.length - 1) {
          await expect(page).toHaveScreenshot(`flow-${flow.name}-final.png`, {
            fullPage: true,
            animations: "disabled",
            maxDiffPixelRatio: 0.02
          })
        }
      }
    }
  })

  test("visual regression performance impact", async ({ page }) => {
    // Measure performance of visual regression testing
    const startTime = Date.now()

    // Take screenshots across all viewports
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForTimeout(500)
      
      await page.screenshot({
        path: `test-performance-${viewport.name}.png`,
        fullPage: true
      })
    }

    const endTime = Date.now()
    const screenshotTime = endTime - startTime

    // Visual regression testing should be reasonably fast
    expect(screenshotTime).toBeLessThan(10000) // 10 seconds

    // Test memory usage during screenshot capture
    const memoryInfo = await page.evaluate(() => {
      return (performance as any).memory || { usedJSHeapSize: 0 }
    })

    if (memoryInfo.usedJSHeapSize) {
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(200 * 1024 * 1024) // 200MB
    }
  })
})
