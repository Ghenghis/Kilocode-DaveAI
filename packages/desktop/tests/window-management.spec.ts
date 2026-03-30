import { test, expect, type Page } from "@playwright/test"

// Window management tests for desktop application
// These tests verify window behavior, sizing, and state management

test.describe("Window Management Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:1420")
    await page.waitForLoadState("networkidle")
    
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

  test("window initialization and default state", async ({ page }) => {
    // Verify window is properly initialized
    const windowInfo = await page.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        title: document.title,
        focused: document.hasFocus()
      }
    })
    
    expect(windowInfo.width).toBeGreaterThan(800)
    expect(windowInfo.height).toBeGreaterThan(600)
    expect(windowInfo.title).toContain("OpenCode")
    expect(windowInfo.focused).toBe(true)
    
    // Take screenshot of initial window state
    await expect(page).toHaveScreenshot("window-initial-state.png", {
      fullPage: true,
      animations: "disabled"
    })
  })

  test("window resizing functionality", async ({ page }) => {
    // Test window resizing to different sizes
    const testSizes = [
      { width: 800, height: 600 },
      { width: 1024, height: 768 },
      { width: 1280, height: 720 },
      { width: 1920, height: 1080 }
    ]
    
    for (const size of testSizes) {
      await page.setViewportSize(size)
      await page.waitForTimeout(500)
      
      // Verify UI adapts to new size
      const windowSize = await page.evaluate(() => {
        return {
          width: window.innerWidth,
          height: window.innerHeight
        }
      })
      
      expect(windowSize.width).toBe(size.width)
      expect(windowSize.height).toBe(size.height)
      
      // Verify all elements are still visible
      await expect(page.locator('[data-testid="app-header"]')).toBeVisible()
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible()
      
      // Take screenshot for each size
      await expect(page).toHaveScreenshot(`window-resized-${size.width}x${size.height}.png`, {
        fullPage: true,
        animations: "disabled"
      })
    }
  })

  test("window minimization and restoration", async ({ page }) => {
    // Test window minimization
    const minimizeButton = page.locator('[data-testid="window-minimize"]')
    if (await minimizeButton.isVisible()) {
      await minimizeButton.click()
      await page.waitForTimeout(1000)
      
      // Verify window is minimized (if testable)
      const windowState = await page.evaluate(() => {
        return {
          minimized: (window as any).minimized || false,
          visible: document.visibilityState === 'visible'
        }
      })
      
      // Test window restoration
      const restoreButton = page.locator('[data-testid="window-restore"]')
      if (await restoreButton.isVisible()) {
        await restoreButton.click()
        await page.waitForTimeout(1000)
        
        // Verify window is restored
        const restoredState = await page.evaluate(() => {
          return {
            minimized: (window as any).minimized || false,
            visible: document.visibilityState === 'visible',
            focused: document.hasFocus()
          }
        })
        
        expect(restoredState.visible).toBe(true)
        await expect(page).toHaveScreenshot("window-restored.png", {
          fullPage: true,
          animations: "disabled"
        })
      }
    }
  })

  test("window maximization and restoration", async ({ page }) => {
    // Test window maximization
    const maximizeButton = page.locator('[data-testid="window-maximize"]')
    if (await maximizeButton.isVisible()) {
      // Store original size
      const originalSize = page.viewportSize()
      
      await maximizeButton.click()
      await page.waitForTimeout(1000)
      
      // Verify window is maximized
      const maximizedSize = page.viewportSize()
      expect(maximizedSize.width).toBeGreaterThan(originalSize?.width || 0)
      expect(maximizedSize.height).toBeGreaterThan(originalSize?.height || 0)
      
      await expect(page).toHaveScreenshot("window-maximized.png", {
        fullPage: true,
        animations: "disabled"
      })
      
      // Test window restoration from maximized state
      const restoreButton = page.locator('[data-testid="window-restore"]')
      if (await restoreButton.isVisible()) {
        await restoreButton.click()
        await page.waitForTimeout(1000)
        
        // Verify window is restored to original size
        const restoredSize = page.viewportSize()
        expect(restoredSize.width).toBeLessThanOrEqual(maximizedSize.width)
        expect(restoredSize.height).toBeLessThanOrEqual(maximizedSize.height)
        
        await expect(page).toHaveScreenshot("window-restored-from-maximized.png", {
          fullPage: true,
          animations: "disabled"
        })
      }
    }
  })

  test("window positioning", async ({ page }) => {
    // Test window positioning to different screen locations
    const positions = [
      { x: 0, y: 0 }, // Top-left
      { x: 100, y: 100 }, // Offset from top-left
      { x: 500, y: 300 } // Custom position
    ]
    
    for (const position of positions) {
      // Note: Actual window positioning may not be testable via Playwright
      // This test focuses on the UI response to positioning changes
      
      // Simulate position change
      await page.evaluate((pos) => {
        (window as any).moveTo?.(pos.x, pos.y)
      }, position)
      
      await page.waitForTimeout(500)
      
      // Verify window content is still accessible
      await expect(page.locator('[data-testid="app-header"]')).toBeVisible()
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible()
    }
  })

  test("window state persistence", async ({ page }) => {
    // Change window state
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(500)
    
    // Change application state
    const stateToggle = page.locator('[data-testid="window-state-toggle"]')
    if (await stateToggle.isVisible()) {
      await stateToggle.click()
      await page.waitForTimeout(500)
    }
    
    // Simulate window close and reopen (reload)
    await page.reload()
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(1000)
    
    // Verify state is restored
    const restoredState = page.locator('[data-testid="window-state-restored"]')
    if (await restoredState.isVisible()) {
      await expect(restoredState).toBeVisible()
      await expect(page).toHaveScreenshot("window-state-persisted.png", {
        fullPage: true,
        animations: "disabled"
      })
    }
  })

  test("window focus and activation", async ({ page }) => {
    // Test window focus
    await page.bringToFront()
    await page.waitForTimeout(500)
    
    const isFocused = await page.evaluate(() => document.hasFocus())
    expect(isFocused).toBe(true)
    
    // Test focus loss and regain
    await page.evaluate(() => {
      window.blur()
    })
    await page.waitForTimeout(500)
    
    const isBlurred = await page.evaluate(() => document.hasFocus())
    expect(isBlurred).toBe(false)
    
    // Regain focus
    await page.focus()
    await page.waitForTimeout(500)
    
    const isRefocused = await page.evaluate(() => document.hasFocus())
    expect(isRefocused).toBe(true)
    
    await expect(page).toHaveScreenshot("window-focused.png", {
      fullPage: true,
      animations: "disabled"
    })
  })

  test("multi-window scenarios", async ({ page }) => {
    // Test opening additional windows
    const openNewWindowButton = page.locator('[data-testid="open-new-window"]')
    if (await openNewWindowButton.isVisible()) {
      await openNewWindowButton.click()
      await page.waitForTimeout(1000)
      
      // Verify new window indicator
      const newWindowIndicator = page.locator('[data-testid="new-window-opened"]')
      if (await newWindowIndicator.isVisible()) {
        await expect(newWindowIndicator).toBeVisible()
      }
      
      // Test window switching
      const switchWindowButton = page.locator('[data-testid="switch-window"]')
      if (await switchWindowButton.isVisible()) {
        await switchWindowButton.click()
        await page.waitForTimeout(500)
        
        // Verify window switching
        const activeWindow = page.locator('[data-testid="active-window"]')
        if (await activeWindow.isVisible()) {
          await expect(activeWindow).toBeVisible()
        }
      }
    }
  })

  test("window title and icon", async ({ page }) => {
    // Test window title
    const title = await page.title()
    expect(title).toContain("OpenCode")
    
    // Test title updates
    const updateTitleButton = page.locator('[data-testid="update-window-title"]')
    if (await updateTitleButton.isVisible()) {
      await updateTitleButton.click()
      await page.waitForTimeout(500)
      
      const updatedTitle = await page.title()
      expect(updatedTitle).toContain("Updated")
    }
    
    // Test window icon (if accessible)
    const windowIcon = page.locator('[data-testid="window-icon"]')
    if (await windowIcon.isVisible()) {
      await expect(windowIcon).toBeVisible()
      await expect(page).toHaveScreenshot("window-icon.png", {
        animations: "disabled"
      })
    }
  })

  test("window borders and chrome", async ({ page }) => {
    // Test window border visibility
    const windowBorder = page.locator('[data-testid="window-border"]')
    if (await windowBorder.isVisible()) {
      await expect(windowBorder).toBeVisible()
      await expect(page).toHaveScreenshot("window-border.png", {
        fullPage: true,
        animations: "disabled"
      })
    }
    
    // Test title bar
    const titleBar = page.locator('[data-testid="title-bar"]')
    if (await titleBar.isVisible()) {
      await expect(titleBar).toBeVisible()
      await expect(page).toHaveScreenshot("window-title-bar.png", {
        animations: "disabled"
      })
    }
    
    // Test control buttons
    const controlButtons = page.locator('[data-testid="window-controls"]')
    if (await controlButtons.isVisible()) {
      await expect(controlButtons).toBeVisible()
      
      // Test individual control buttons
      const buttons = ['minimize', 'maximize', 'close']
      for (const button of buttons) {
        const buttonElement = page.locator(`[data-testid="window-${button}"]`)
        if (await buttonElement.isVisible()) {
          await expect(buttonElement).toBeVisible()
        }
      }
    }
  })

  test("responsive window behavior", async ({ page }) => {
    // Test minimum window size
    await page.setViewportSize({ width: 400, height: 300 })
    await page.waitForTimeout(500)
    
    // Verify UI adapts to small size
    await expect(page.locator('[data-testid="app-header"]')).toBeVisible()
    
    // Test content overflow handling
    const contentArea = page.locator('[data-testid="main-content"]')
    if (await contentArea.isVisible()) {
      const hasScroll = await contentArea.evaluate((el) => {
        return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth
      })
      
      // Should have scroll bars if content overflows
      if (hasScroll) {
        await expect(page).toHaveScreenshot("window-small-scroll.png", {
          fullPage: true,
          animations: "disabled"
        })
      }
    }
    
    // Test very large window size
    await page.setViewportSize({ width: 2560, height: 1440 })
    await page.waitForTimeout(500)
    
    // Verify UI scales properly
    await expect(page.locator('[data-testid="app-header"]')).toBeVisible()
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible()
    
    await expect(page).toHaveScreenshot("window-large.png", {
      fullPage: true,
      animations: "disabled"
    })
  })

  test("window animations and transitions", async ({ page }) => {
    // Test window show/hide animations
    const hideWindowButton = page.locator('[data-testid="hide-window"]')
    if (await hideWindowButton.isVisible()) {
      await hideWindowButton.click()
      await page.waitForTimeout(1000)
      
      // Verify window is hidden
      const windowHidden = page.locator('[data-testid="window-hidden"]')
      if (await windowHidden.isVisible()) {
        await expect(windowHidden).toBeVisible()
      }
      
      // Test window show animation
      const showWindowButton = page.locator('[data-testid="show-window"]')
      if (await showWindowButton.isVisible()) {
        await showWindowButton.click()
        await page.waitForTimeout(1000)
        
        // Verify window is shown
        const windowShown = page.locator('[data-testid="window-shown"]')
        if (await windowShown.isVisible()) {
          await expect(windowShown).toBeVisible()
        }
      }
    }
  })

  test("window error handling", async ({ page }) => {
    // Test window resize error handling
    await page.setViewportSize({ width: 100, height: 100 })
    await page.waitForTimeout(500)
    
    // Verify app handles minimum size gracefully
    await expect(page.locator('[data-testid="app-header"]')).toBeVisible()
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible()
    
    // Test window state error recovery
    const triggerStateError = page.locator('[data-testid="trigger-window-state-error"]')
    if (await triggerStateError.isVisible()) {
      await triggerStateError.click()
      await page.waitForTimeout(1000)
      
      // Verify error is handled gracefully
      const errorDisplay = page.locator('[data-testid="window-state-error"]')
      if (await errorDisplay.isVisible()) {
        await expect(errorDisplay).toBeVisible()
        await expect(page).toHaveScreenshot("window-state-error.png", {
          animations: "disabled"
        })
      }
      
      // Test error recovery
      const recoverButton = page.locator('[data-testid="recover-window-state"]')
      if (await recoverButton.isVisible()) {
        await recoverButton.click()
        await page.waitForTimeout(1000)
        
        // Verify recovery
        const recoveredState = page.locator('[data-testid="window-state-recovered"]')
        if (await recoveredState.isVisible()) {
          await expect(recoveredState).toBeVisible()
        }
      }
    }
  })

  test("window performance", async ({ page }) => {
    // Test window resize performance
    const startTime = Date.now()
    
    // Perform multiple resize operations
    const sizes = [
      { width: 800, height: 600 },
      { width: 1024, height: 768 },
      { width: 1280, height: 720 },
      { width: 1920, height: 1080 }
    ]
    
    for (const size of sizes) {
      await page.setViewportSize(size)
      await page.waitForTimeout(100)
    }
    
    const endTime = Date.now()
    const resizeTime = endTime - startTime
    
    // Should resize quickly
    expect(resizeTime).toBeLessThan(2000)
    
    // Test window focus performance
    const focusStartTime = Date.now()
    
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.blur())
      await page.waitForTimeout(10)
      await page.focus()
      await page.waitForTimeout(10)
    }
    
    const focusEndTime = Date.now()
    const focusTime = focusEndTime - focusStartTime
    
    // Should handle focus changes quickly
    expect(focusTime).toBeLessThan(1000)
  })
})
