import { test, expect, type Page } from "@playwright/test"

// Visual UI testing for desktop application
// These tests verify complete UI rendering and visual consistency

test.describe("Visual UI Testing", () => {
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

  test("complete main interface visual validation", async ({ page }) => {
    // Take comprehensive screenshot of main interface
    await expect(page).toHaveScreenshot("visual-main-interface-complete.png", {
      fullPage: true,
      animations: "disabled"
    })
    
    // Verify all major UI sections are visible
    await expect(page.locator('[data-testid="app-header"]')).toBeVisible()
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible()
    await expect(page.locator('[data-testid="status-bar"]')).toBeVisible()
  })

  test("chat interface visual validation", async ({ page }) => {
    // Navigate to chat section
    const chatButton = page.locator('[data-testid="nav-chat"]')
    if (await chatButton.isVisible()) {
      await chatButton.click()
      await page.waitForTimeout(1000)
    }
    
    // Take screenshot of chat interface
    await expect(page).toHaveScreenshot("visual-chat-interface.png", {
      fullPage: true,
      animations: "disabled"
    })
    
    // Verify chat components are properly rendered
    await expect(page.locator('[data-testid="chat-messages"]')).toBeVisible()
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="chat-controls"]')).toBeVisible()
    
    // Test chat input visual states
    const chatInput = page.locator('[data-testid="chat-input"] input')
    if (await chatInput.isVisible()) {
      await chatInput.click()
      await page.waitForTimeout(200)
      await expect(page).toHaveScreenshot("visual-chat-input-focused.png", {
        animations: "disabled"
      })
      
      await chatInput.fill("Test message")
      await page.waitForTimeout(200)
      await expect(page).toHaveScreenshot("visual-chat-input-typed.png", {
        animations: "disabled"
      })
    }
  })

  test("settings interface visual validation", async ({ page }) => {
    // Navigate to settings section
    const settingsButton = page.locator('[data-testid="nav-settings"]')
    if (await settingsButton.isVisible()) {
      await settingsButton.click()
      await page.waitForTimeout(1000)
    }
    
    // Take screenshot of settings interface
    await expect(page).toHaveScreenshot("visual-settings-interface.png", {
      fullPage: true,
      animations: "disabled"
    })
    
    // Test settings sections
    const settingsSections = [
      'general-settings',
      'model-settings',
      'interface-settings',
      'advanced-settings'
    ]
    
    for (const section of settingsSections) {
      const sectionTab = page.locator(`[data-testid="settings-tab-${section}"]`)
      if (await sectionTab.isVisible()) {
        await sectionTab.click()
        await page.waitForTimeout(500)
        
        await expect(page).toHaveScreenshot(`visual-settings-${section}.png`, {
          fullPage: true,
          animations: "disabled"
        })
      }
    }
  })

  test("responsive design visual validation", async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 800, height: 600, name: "small" },
      { width: 1024, height: 768, name: "medium" },
      { width: 1280, height: 720, name: "large" },
      { width: 1920, height: 1080, name: "xlarge" }
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForTimeout(500)
      
      await expect(page).toHaveScreenshot(`visual-responsive-${viewport.name}-${viewport.width}x${viewport.height}.png`, {
        fullPage: true,
        animations: "disabled"
      })
    }
  })

  test("theme and styling visual validation", async ({ page }) => {
    // Test different themes if available
    const themes = ['light', 'dark', 'auto']
    
    for (const theme of themes) {
      const themeButton = page.locator(`[data-testid="theme-${theme}"]`)
      if (await themeButton.isVisible()) {
        await themeButton.click()
        await page.waitForTimeout(1000)
        
        await expect(page).toHaveScreenshot(`visual-theme-${theme}.png`, {
          fullPage: true,
          animations: "disabled"
        })
      }
    }
  })

  test("modal and dialog visual validation", async ({ page }) => {
    // Test various modals and dialogs
    const modals = [
      'about-modal',
      'help-modal',
      'confirm-dialog',
      'error-dialog',
      'success-dialog'
    ]
    
    for (const modal of modals) {
      const modalTrigger = page.locator(`[data-testid="trigger-${modal}"]`)
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click()
        await page.waitForTimeout(500)
        
        await expect(page).toHaveScreenshot(`visual-modal-${modal}.png`, {
          animations: "disabled"
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

  test("form and input visual validation", async ({ page }) => {
    // Test various form inputs and their states
    const formInputs = [
      { selector: '[data-testid="text-input"]', type: "text" },
      { selector: '[data-testid="password-input"]', type: "password" },
      { selector: '[data-testid="email-input"]', type: "email" },
      { selector: '[data-testid="textarea-input"]', type: "textarea" },
      { selector: '[data-testid="select-input"]', type: "select" },
      { selector: '[data-testid="checkbox-input"]', type: "checkbox" },
      { selector: '[data-testid="radio-input"]', type: "radio" }
    ]
    
    for (const input of formInputs) {
      const inputElement = page.locator(input.selector)
      if (await inputElement.isVisible()) {
        // Default state
        await expect(page).toHaveScreenshot(`visual-input-${input.type}-default.png`, {
          animations: "disabled"
        })
        
        // Focus state
        await inputElement.click()
        await page.waitForTimeout(200)
        await expect(page).toHaveScreenshot(`visual-input-${input.type}-focused.png`, {
          animations: "disabled"
        })
        
        // Error state (if applicable)
        const errorTrigger = page.locator(`[data-testid="trigger-${input.type}-error"]`)
        if (await errorTrigger.isVisible()) {
          await errorTrigger.click()
          await page.waitForTimeout(200)
          await expect(page).toHaveScreenshot(`visual-input-${input.type}-error.png`, {
            animations: "disabled"
          })
        }
      }
    }
  })

  test("button and control visual validation", async ({ page }) => {
    // Test various button types and states
    const buttons = [
      { selector: '[data-testid="primary-button"]', type: "primary" },
      { selector: '[data-testid="secondary-button"]', type: "secondary" },
      { selector: '[data-testid="danger-button"]', type: "danger" },
      { selector: '[data-testid="success-button"]', type: "success" },
      { selector: '[data-testid="icon-button"]', type: "icon" },
      { selector: '[data-testid="floating-button"]', type: "floating" }
    ]
    
    for (const button of buttons) {
      const buttonElement = page.locator(button.selector)
      if (await buttonElement.isVisible()) {
        // Default state
        await expect(page).toHaveScreenshot(`visual-button-${button.type}-default.png`, {
          animations: "disabled"
        })
        
        // Hover state
        await buttonElement.hover()
        await page.waitForTimeout(200)
        await expect(page).toHaveScreenshot(`visual-button-${button.type}-hover.png`, {
          animations: "disabled"
        })
        
        // Active/pressed state
        await buttonElement.click()
        await page.waitForTimeout(200)
        await expect(page).toHaveScreenshot(`visual-button-${button.type}-active.png`, {
          animations: "disabled"
        })
        
        // Disabled state (if applicable)
        const disabledToggle = page.locator(`[data-testid="disable-${button.type}"]`)
        if (await disabledToggle.isVisible()) {
          await disabledToggle.click()
          await page.waitForTimeout(200)
          await expect(page).toHaveScreenshot(`visual-button-${button.type}-disabled.png`, {
            animations: "disabled"
          })
        }
      }
    }
  })

  test("loading and progress visual validation", async ({ page }) => {
    // Test loading states and progress indicators
    const loadingElements = [
      '[data-testid="loading-spinner"]',
      '[data-testid="progress-bar"]',
      '[data-testid="skeleton-loader"]',
      '[data-testid="shimmer-effect"]'
    ]
    
    for (const loadingSelector of loadingElements) {
      const loadingElement = page.locator(loadingSelector)
      if (await loadingElement.isVisible()) {
        await expect(page).toHaveScreenshot(`visual-loading-${loadingSelector.replace(/[^a-zA-Z0-9]/g, '-')}.png`, {
          animations: "disabled"
        })
      }
    }
    
    // Test loading overlay
    const loadingOverlay = page.locator('[data-testid="loading-overlay"]')
    if (await loadingOverlay.isVisible()) {
      await expect(page).toHaveScreenshot("visual-loading-overlay.png", {
        animations: "disabled"
      })
    }
  })

  test("notification and toast visual validation", async ({ page }) => {
    // Test different notification types
    const notificationTypes = ['info', 'success', 'warning', 'error']
    
    for (const type of notificationTypes) {
      const triggerButton = page.locator(`[data-testid="trigger-${type}-notification"]`)
      if (await triggerButton.isVisible()) {
        await triggerButton.click()
        await page.waitForTimeout(500)
        
        await expect(page).toHaveScreenshot(`visual-notification-${type}.png`, {
          animations: "disabled"
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

  test("table and list visual validation", async ({ page }) => {
    // Test table rendering
    const tableElement = page.locator('[data-testid="data-table"]')
    if (await tableElement.isVisible()) {
      await expect(page).toHaveScreenshot("visual-table-default.png", {
        animations: "disabled"
      })
      
      // Test table sorting
      const sortHeader = page.locator('[data-testid="table-sort-header"]')
      if (await sortHeader.isVisible()) {
        await sortHeader.click()
        await page.waitForTimeout(500)
        await expect(page).toHaveScreenshot("visual-table-sorted.png", {
          animations: "disabled"
        })
      }
      
      // Test table filtering
      const filterInput = page.locator('[data-testid="table-filter"]')
      if (await filterInput.isVisible()) {
        await filterInput.fill("test")
        await page.waitForTimeout(500)
        await expect(page).toHaveScreenshot("visual-table-filtered.png", {
          animations: "disabled"
        })
      }
    }
    
    // Test list rendering
    const listElement = page.locator('[data-testid="data-list"]')
    if (await listElement.isVisible()) {
      await expect(page).toHaveScreenshot("visual-list-default.png", {
        animations: "disabled"
      })
    }
  })

  test("chart and visualization visual validation", async ({ page }) => {
    // Test chart rendering if available
    const chartTypes = ['bar-chart', 'line-chart', 'pie-chart', 'area-chart']
    
    for (const chartType of chartTypes) {
      const chartElement = page.locator(`[data-testid="${chartType}"]`)
      if (await chartElement.isVisible()) {
        await expect(page).toHaveScreenshot(`visual-chart-${chartType}.png`, {
          animations: "disabled"
        })
      }
    }
  })

  test("accessibility visual validation", async ({ page }) => {
    // Test high contrast mode
    const highContrastToggle = page.locator('[data-testid="toggle-high-contrast"]')
    if (await highContrastToggle.isVisible()) {
      await highContrastToggle.click()
      await page.waitForTimeout(1000)
      
      await expect(page).toHaveScreenshot("visual-accessibility-high-contrast.png", {
        fullPage: true,
        animations: "disabled"
      })
    }
    
    // Test large text mode
    const largeTextToggle = page.locator('[data-testid="toggle-large-text"]')
    if (await largeTextToggle.isVisible()) {
      await largeTextToggle.click()
      await page.waitForTimeout(1000)
      
      await expect(page).toHaveScreenshot("visual-accessibility-large-text.png", {
        fullPage: true,
        animations: "disabled"
      })
    }
    
    // Test keyboard focus indicators
    await page.keyboard.press('Tab')
    await page.waitForTimeout(200)
    await expect(page).toHaveScreenshot("visual-accessibility-focus-indicator.png", {
      animations: "disabled"
    })
  })

  test("error and empty state visual validation", async ({ page }) => {
    // Test error states
    const errorStates = [
      'network-error',
      'file-error',
      'validation-error',
      'server-error'
    ]
    
    for (const errorState of errorStates) {
      const errorTrigger = page.locator(`[data-testid="trigger-${errorState}"]`)
      if (await errorTrigger.isVisible()) {
        await errorTrigger.click()
        await page.waitForTimeout(500)
        
        await expect(page).toHaveScreenshot(`visual-error-${errorState}.png`, {
          animations: "disabled"
        })
      }
    }
    
    // Test empty states
    const emptyStates = [
      'empty-chat',
      'empty-list',
      'empty-table',
      'no-data'
    ]
    
    for (const emptyState of emptyStates) {
      const emptyTrigger = page.locator(`[data-testid="trigger-${emptyState}"]`)
      if (await emptyTrigger.isVisible()) {
        await emptyTrigger.click()
        await page.waitForTimeout(500)
        
        await expect(page).toHaveScreenshot(`visual-empty-${emptyState}.png", {
          animations: "disabled"
        })
      }
    }
  })

  test("animation and transition visual validation", async ({ page }) => {
    // Enable animations for this test
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0.3s !important;
          transition-duration: 0.3s !important;
        }
      `,
    })
    
    // Test slide animations
    const slideTrigger = page.locator('[data-testid="trigger-slide-animation"]')
    if (await slideTrigger.isVisible()) {
      await slideTrigger.click()
      await page.waitForTimeout(500)
      
      await expect(page).toHaveScreenshot("visual-animation-slide.png", {
        animations: "allowed"
      })
    }
    
    // Test fade animations
    const fadeTrigger = page.locator('[data-testid="trigger-fade-animation"]')
    if (await fadeTrigger.isVisible()) {
      await fadeTrigger.click()
      await page.waitForTimeout(500)
      
      await expect(page).toHaveScreenshot("visual-animation-fade.png", {
        animations: "allowed"
      })
    }
  })

  test("cross-platform visual consistency", async ({ page }) => {
    // Test platform-specific UI elements
    const platform = process.platform
    
    // Platform-specific visual tests
    if (platform === 'win32') {
      const windowsElements = page.locator('[data-testid^="windows-"]')
      const count = await windowsElements.count()
      
      for (let i = 0; i < count; i++) {
        const element = windowsElements.nth(i)
        if (await element.isVisible()) {
          await expect(page).toHaveScreenshot(`visual-platform-windows-${i}.png`, {
            animations: "disabled"
          })
        }
      }
    } else if (platform === 'darwin') {
      const macosElements = page.locator('[data-testid^="macos-"]')
      const count = await macosElements.count()
      
      for (let i = 0; i < count; i++) {
        const element = macosElements.nth(i)
        if (await element.isVisible()) {
          await expect(page).toHaveScreenshot(`visual-platform-macos-${i}.png`, {
            animations: "disabled"
          })
        }
      }
    } else if (platform === 'linux') {
      const linuxElements = page.locator('[data-testid^="linux-"]')
      const count = await linuxElements.count()
      
      for (let i = 0; i < count; i++) {
        const element = linuxElements.nth(i)
        if (await element.isVisible()) {
          await expect(page).toHaveScreenshot(`visual-platform-linux-${i}.png`, {
            animations: "disabled"
          })
        }
      }
    }
  })
})
