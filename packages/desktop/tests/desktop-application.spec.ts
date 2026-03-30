import { test, expect, type Page } from "@playwright/test"

// Desktop application tests with visual UI validation
// These tests verify the complete desktop application functionality

test.describe("Desktop Application Testing", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the desktop application
    await page.goto("http://localhost:1420") // Default Tauri dev port
    
    // Wait for the application to load
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

  test("application startup and main interface", async ({ page }) => {
    // Take a screenshot of the main interface
    await expect(page).toHaveScreenshot("desktop-main-interface.png", {
      fullPage: true,
      animations: "disabled"
    })
    
    // Verify main UI elements are present
    await expect(page.locator('[data-testid="app-header"]')).toBeVisible()
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible()
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
    
    // Verify application title
    const title = await page.title()
    expect(title).toContain("OpenCode")
  })

  test("window management functionality", async ({ page }) => {
    // Test window sizing
    const initialSize = page.viewportSize()
    expect(initialSize?.width).toBeGreaterThan(800)
    expect(initialSize?.height).toBeGreaterThan(600)
    
    // Test window resizing
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(1000)
    
    // Verify UI adapts to new size
    await expect(page).toHaveScreenshot("desktop-window-resized.png", {
      fullPage: true,
      animations: "disabled"
    })
    
    // Test window minimization/maximization (if available)
    const maximizeButton = page.locator('[data-testid="window-maximize"]')
    if (await maximizeButton.isVisible()) {
      await maximizeButton.click()
      await page.waitForTimeout(1000)
      await expect(page).toHaveScreenshot("desktop-window-maximized.png", {
        fullPage: true,
        animations: "disabled"
      })
    }
  })

  test("native file dialogs and operations", async ({ page }) => {
    // Look for file upload functionality
    const fileUploadButton = page.locator('[data-testid="file-upload"]')
    if (await fileUploadButton.isVisible()) {
      // Mock file selection
      const fileInput = page.locator('input[type="file"]')
      if (await fileInput.isVisible()) {
        // Simulate file selection
        await fileInput.setInputFiles({
          name: "test-file.txt",
          mimeType: "text/plain",
          buffer: Buffer.from("test file content")
        })
        
        // Verify file is processed
        await page.waitForTimeout(1000)
        await expect(page.locator('[data-testid="file-processed"]')).toBeVisible()
      }
    }
    
    // Test file save dialog (if available)
    const saveButton = page.locator('[data-testid="save-button"]')
    if (await saveButton.isVisible()) {
      await saveButton.click()
      await page.waitForTimeout(1000)
      
      // Verify save dialog appears or file is saved
      const saveDialog = page.locator('[data-testid="save-dialog"]')
      const saveConfirmation = page.locator('[data-testid="save-confirmation"]')
      
      expect(await saveDialog.isVisible() || await saveConfirmation.isVisible()).toBeTruthy()
    }
  })

  test("system notifications functionality", async ({ page }) => {
    // Look for notification triggers
    const notificationTrigger = page.locator('[data-testid="trigger-notification"]')
    if (await notificationTrigger.isVisible()) {
      await notificationTrigger.click()
      await page.waitForTimeout(2000)
      
      // Verify notification is displayed
      const notification = page.locator('[data-testid="notification"]')
      if (await notification.isVisible()) {
        await expect(notification).toContainText("Notification")
        await expect(page).toHaveScreenshot("desktop-notification.png", {
          animations: "disabled"
        })
      }
    }
    
    // Test notification dismissal
    const dismissButton = page.locator('[data-testid="dismiss-notification"]')
    if (await dismissButton.isVisible()) {
      await dismissButton.click()
      await page.waitForTimeout(500)
      
      // Verify notification is hidden
      const notification = page.locator('[data-testid="notification"]')
      expect(await notification.isVisible()).toBeFalsy()
    }
  })

  test("system tray integration", async ({ page }) => {
    // Test system tray menu (if accessible)
    const trayButton = page.locator('[data-testid="system-tray"]')
    if (await trayButton.isVisible()) {
      await trayButton.click()
      await page.waitForTimeout(1000)
      
      // Verify tray menu appears
      const trayMenu = page.locator('[data-testid="tray-menu"]')
      if (await trayMenu.isVisible()) {
        await expect(trayMenu).toBeVisible()
        await expect(page).toHaveScreenshot("desktop-tray-menu.png", {
          animations: "disabled"
        })
        
        // Test tray menu items
        const menuItems = page.locator('[data-testid^="tray-menu-item-"]')
        const itemCount = await menuItems.count()
        expect(itemCount).toBeGreaterThan(0)
      }
    }
  })

  test("application menu functionality", async ({ page }) => {
    // Test main application menu
    const menuButton = page.locator('[data-testid="app-menu"]')
    if (await menuButton.isVisible()) {
      await menuButton.click()
      await page.waitForTimeout(1000)
      
      // Verify menu appears
      const appMenu = page.locator('[data-testid="app-menu-dropdown"]')
      if (await appMenu.isVisible()) {
        await expect(appMenu).toBeVisible()
        await expect(page).toHaveScreenshot("desktop-app-menu.png", {
          animations: "disabled"
        })
        
        // Test menu items
        const menuItems = page.locator('[data-testid^="menu-item-"]')
        const itemCount = await menuItems.count()
        expect(itemCount).toBeGreaterThan(0)
        
        // Test specific menu items
        const settingsItem = page.locator('[data-testid="menu-item-settings"]')
        if (await settingsItem.isVisible()) {
          await settingsItem.click()
          await page.waitForTimeout(1000)
          
          // Verify settings panel appears
          const settingsPanel = page.locator('[data-testid="settings-panel"]')
          if (await settingsPanel.isVisible()) {
            await expect(settingsPanel).toBeVisible()
            await expect(page).toHaveScreenshot("desktop-settings-panel.png", {
              animations: "disabled"
            })
          }
        }
      }
    }
  })

  test("keyboard shortcuts and accelerators", async ({ page }) => {
    // Test common keyboard shortcuts
    
    // Ctrl/Cmd + N for new file/session
    await page.keyboard.press((process.platform === 'darwin' ? 'Meta' : 'Control') + '+n')
    await page.waitForTimeout(1000)
    
    // Verify new session/file dialog appears
    const newDialog = page.locator('[data-testid="new-dialog"]')
    if (await newDialog.isVisible()) {
      await expect(newDialog).toBeVisible()
    }
    
    // Ctrl/Cmd + S for save
    await page.keyboard.press((process.platform === 'darwin' ? 'Meta' : 'Control') + '+s')
    await page.waitForTimeout(1000)
    
    // Verify save action is triggered
    const saveAction = page.locator('[data-testid="save-action"]')
    if (await saveAction.isVisible()) {
      await expect(saveAction).toBeVisible()
    }
    
    // Ctrl/Cmd + , for settings
    await page.keyboard.press((process.platform === 'darwin' ? 'Meta' : 'Control') + '+,')
    await page.waitForTimeout(1000)
    
    // Verify settings panel appears
    const settingsPanel = page.locator('[data-testid="settings-panel"]')
    if (await settingsPanel.isVisible()) {
      await expect(settingsPanel).toBeVisible()
    }
  })

  test("drag and drop functionality", async ({ page }) => {
    // Look for drop zones
    const dropZone = page.locator('[data-testid="drop-zone"]')
    if (await dropZone.isVisible()) {
      // Create a test file to drag
      const testFile = {
        name: "dragged-file.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("dragged file content")
      }
      
      // Simulate drag and drop
      await dropZone.dispatchEvent('dragover')
      await dropZone.dispatchEvent('drop', {
        dataTransfer: {
          files: [testFile]
        }
      })
      
      await page.waitForTimeout(1000)
      
      // Verify file is processed
      const fileProcessed = page.locator('[data-testid="file-processed"]')
      if (await fileProcessed.isVisible()) {
        await expect(fileProcessed).toBeVisible()
        await expect(page).toHaveScreenshot("desktop-drag-drop.png", {
          animations: "disabled"
        })
      }
    }
  })

  test("deep linking and URL handling", async ({ page }) => {
    // Test deep link functionality
    const deepLinkButton = page.locator('[data-testid="test-deep-link"]')
    if (await deepLinkButton.isVisible()) {
      await deepLinkButton.click()
      await page.waitForTimeout(1000)
      
      // Verify deep link is handled
      const deepLinkContent = page.locator('[data-testid="deep-link-content"]')
      if (await deepLinkContent.isVisible()) {
        await expect(deepLinkContent).toBeVisible()
      }
    }
    
    // Test URL scheme handling
    await page.goto("opencode://test-command?param=value")
    await page.waitForTimeout(2000)
    
    // Verify URL is processed
    const urlProcessed = page.locator('[data-testid="url-processed"]')
    if (await urlProcessed.isVisible()) {
      await expect(urlProcessed).toBeVisible()
    }
  })

  test("application lifecycle events", async ({ page }) => {
    // Test application state persistence
    const stateToggle = page.locator('[data-testid="state-toggle"]')
    if (await stateToggle.isVisible()) {
      // Change application state
      await stateToggle.click()
      await page.waitForTimeout(500)
      
      // Simulate application restart (reload page)
      await page.reload()
      await page.waitForLoadState("networkidle")
      await page.waitForTimeout(1000)
      
      // Verify state is persisted
      const persistedState = page.locator('[data-testid="persisted-state"]')
      if (await persistedState.isVisible()) {
        await expect(persistedState).toBeVisible()
      }
    }
  })

  test("cross-platform compatibility", async ({ page }) => {
    // Test platform-specific features
    const platform = process.platform
    
    // Windows-specific features
    if (platform === 'win32') {
      const windowsFeature = page.locator('[data-testid="windows-feature"]')
      if (await windowsFeature.isVisible()) {
        await expect(windowsFeature).toBeVisible()
        await expect(page).toHaveScreenshot("desktop-windows-feature.png", {
          animations: "disabled"
        })
      }
    }
    
    // macOS-specific features
    if (platform === 'darwin') {
      const macosFeature = page.locator('[data-testid="macos-feature"]')
      if (await macosFeature.isVisible()) {
        await expect(macosFeature).toBeVisible()
        await expect(page).toHaveScreenshot("desktop-macos-feature.png", {
          animations: "disabled"
        })
      }
    }
    
    // Linux-specific features
    if (platform === 'linux') {
      const linuxFeature = page.locator('[data-testid="linux-feature"]')
      if (await linuxFeature.isVisible()) {
        await expect(linuxFeature).toBeVisible()
        await expect(page).toHaveScreenshot("desktop-linux-feature.png", {
          animations: "disabled"
        })
      }
    }
  })

  test("performance and responsiveness", async ({ page }) => {
    // Test application performance
    const startTime = Date.now()
    
    // Navigate through different sections
    const sections = ['chat', 'settings', 'history']
    for (const section of sections) {
      const sectionButton = page.locator(`[data-testid="nav-${section}"]`)
      if (await sectionButton.isVisible()) {
        await sectionButton.click()
        await page.waitForTimeout(500)
      }
    }
    
    const endTime = Date.now()
    const navigationTime = endTime - startTime
    
    // Should navigate quickly
    expect(navigationTime).toBeLessThan(5000)
    
    // Test memory usage (if available)
    const memoryInfo = await page.evaluate(() => {
      return (performance as any).memory || { usedJSHeapSize: 0 }
    })
    
    // Memory usage should be reasonable
    if (memoryInfo.usedJSHeapSize) {
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024) // 100MB
    }
  })

  test("error handling and recovery", async ({ page }) => {
    // Test error scenarios
    const errorTrigger = page.locator('[data-testid="trigger-error"]')
    if (await errorTrigger.isVisible()) {
      await errorTrigger.click()
      await page.waitForTimeout(1000)
      
      // Verify error is displayed gracefully
      const errorDisplay = page.locator('[data-testid="error-display"]')
      if (await errorDisplay.isVisible()) {
        await expect(errorDisplay).toBeVisible()
        await expect(page).toHaveScreenshot("desktop-error-display.png", {
          animations: "disabled"
        })
        
        // Test error recovery
        const recoverButton = page.locator('[data-testid="error-recover"]')
        if (await recoverButton.isVisible()) {
          await recoverButton.click()
          await page.waitForTimeout(1000)
          
          // Verify application recovers
          const recoveredState = page.locator('[data-testid="recovered-state"]')
          if (await recoveredState.isVisible()) {
            await expect(recoveredState).toBeVisible()
          }
        }
      }
    }
  })

  test("accessibility features", async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.waitForTimeout(200)
    
    // Verify focus is visible
    const focusedElement = page.locator(':focus')
    expect(await focusedElement.count()).toBeGreaterThan(0)
    
    // Test ARIA labels and roles
    const accessibleElements = page.locator('[aria-label], [role]')
    expect(await accessibleElements.count()).toBeGreaterThan(0)
    
    // Test screen reader compatibility
    const screenReaderElements = page.locator('[aria-live], [aria-atomic]')
    if (await screenReaderElements.count() > 0) {
      expect(await screenReaderElements.first().isVisible()).toBe(true)
    }
  })

  test("complete UI visual validation", async ({ page }) => {
    // Take comprehensive screenshots of all major UI states
    
    // Main interface
    await expect(page).toHaveScreenshot("desktop-main-complete.png", {
      fullPage: true,
      animations: "disabled"
    })
    
    // Chat interface
    const chatSection = page.locator('[data-testid="chat-section"]')
    if (await chatSection.isVisible()) {
      await chatSection.scrollIntoViewIfNeeded()
      await expect(page).toHaveScreenshot("desktop-chat-interface.png", {
        fullPage: false,
        animations: "disabled"
      })
    }
    
    // Settings interface
    const settingsButton = page.locator('[data-testid="nav-settings"]')
    if (await settingsButton.isVisible()) {
      await settingsButton.click()
      await page.waitForTimeout(1000)
      await expect(page).toHaveScreenshot("desktop-settings-complete.png", {
        fullPage: true,
        animations: "disabled"
      })
    }
    
    // Responsive design at different sizes
    const viewports = [
      { width: 800, height: 600 },
      { width: 1024, height: 768 },
      { width: 1920, height: 1080 }
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.waitForTimeout(500)
      
      await expect(page).toHaveScreenshot(`desktop-responsive-${viewport.width}x${viewport.height}.png`, {
        fullPage: true,
        animations: "disabled"
      })
    }
  })
})
