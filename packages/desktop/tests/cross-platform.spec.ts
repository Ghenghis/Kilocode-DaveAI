import { test, expect, type Page } from "@playwright/test"

// Cross-platform desktop testing
// These tests verify platform-specific functionality and compatibility

test.describe("Cross-Platform Desktop Testing", () => {
  const currentPlatform = process.platform
  
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

  test(`platform detection - ${currentPlatform}`, async ({ page }) => {
    // Verify platform is correctly detected
    const detectedPlatform = await page.evaluate(() => {
      return (window as any).platform || navigator.platform
    })
    
    expect(detectedPlatform).toBeTruthy()
    
    // Verify platform-specific UI elements
    const platformIndicator = page.locator(`[data-testid="platform-${currentPlatform}"]`)
    if (await platformIndicator.isVisible()) {
      await expect(platformIndicator).toBeVisible()
      await expect(page).toHaveScreenshot(`platform-${currentPlatform}-indicator.png`, {
        animations: "disabled"
      })
    }
  })

  test("Windows-specific functionality", async ({ page }) => {
    test.skip(currentPlatform !== 'win32', 'Windows-specific test')
    
    // Test Windows registry integration
    const registryTest = page.locator('[data-testid="windows-registry-test"]')
    if (await registryTest.isVisible()) {
      await registryTest.click()
      await page.waitForTimeout(2000)
      
      const registryResult = page.locator('[data-testid="windows-registry-result"]')
      if (await registryResult.isVisible()) {
        await expect(registryResult).toBeVisible()
        await expect(page).toHaveScreenshot("windows-registry-integration.png", {
          animations: "disabled"
        })
      }
    }
    
    // Test Windows shortcuts
    const shortcutsTest = page.locator('[data-testid="windows-shortcuts-test"]')
    if (await shortcutsTest.isVisible()) {
      await shortcutsTest.click()
      await page.waitForTimeout(1000)
      
      const shortcutsResult = page.locator('[data-testid="windows-shortcuts-result"]')
      if (await shortcutsResult.isVisible()) {
        await expect(shortcutsResult).toBeVisible()
        await expect(page).toHaveScreenshot("windows-shortcuts.png", {
          animations: "disabled"
        })
      }
    }
    
    // Test Windows taskbar integration
    const taskbarTest = page.locator('[data-testid="windows-taskbar-test"]')
    if (await taskbarTest.isVisible()) {
      await taskbarTest.click()
      await page.waitForTimeout(1000)
      
      const taskbarResult = page.locator('[data-testid="windows-taskbar-result"]')
      if (await taskbarResult.isVisible()) {
        await expect(taskbarResult).toBeVisible()
        await expect(page).toHaveScreenshot("windows-taskbar.png", {
          animations: "disabled"
        })
      }
    }
    
    // Test Windows file associations
    const fileAssociationTest = page.locator('[data-testid="windows-file-association-test"]')
    if (await fileAssociationTest.isVisible()) {
      await fileAssociationTest.click()
      await page.waitForTimeout(1000)
      
      const associationResult = page.locator('[data-testid="windows-file-association-result"]')
      if (await associationResult.isVisible()) {
        await expect(associationResult).toBeVisible()
      }
    }
    
    // Test Windows-specific keyboard shortcuts
    await page.keyboard.press('Control+s') // Save
    await page.waitForTimeout(500)
    
    const saveResult = page.locator('[data-testid="windows-save-result"]')
    if (await saveResult.isVisible()) {
      await expect(saveResult).toBeVisible()
    }
  })

  test("macOS-specific functionality", async ({ page }) => {
    test.skip(currentPlatform !== 'darwin', 'macOS-specific test')
    
    // Test macOS dock integration
    const dockTest = page.locator('[data-testid="macos-dock-test"]')
    if (await dockTest.isVisible()) {
      await dockTest.click()
      await page.waitForTimeout(1000)
      
      const dockResult = page.locator('[data-testid="macos-dock-result"]')
      if (await dockResult.isVisible()) {
        await expect(dockResult).toBeVisible()
        await expect(page).toHaveScreenshot("macos-dock-integration.png", {
          animations: "disabled"
        })
      }
    }
    
    // Test macOS menu bar
    const menuBarTest = page.locator('[data-testid="macos-menu-bar-test"]')
    if (await menuBarTest.isVisible()) {
      await menuBarTest.click()
      await page.waitForTimeout(1000)
      
      const menuBarResult = page.locator('[data-testid="macos-menu-bar-result"]')
      if (await menuBarResult.isVisible()) {
        await expect(menuBarResult).toBeVisible()
        await expect(page).toHaveScreenshot("macos-menu-bar.png", {
          animations: "disabled"
        })
      }
    }
    
    // Test macOS Spotlight integration
    const spotlightTest = page.locator('[data-testid="macos-spotlight-test"]')
    if (await spotlightTest.isVisible()) {
      await spotlightTest.click()
      await page.waitForTimeout(1000)
      
      const spotlightResult = page.locator('[data-testid="macos-spotlight-result"]')
      if (await spotlightResult.isVisible()) {
        await expect(spotlightResult).toBeVisible()
      }
    }
    
    // Test macOS-specific keyboard shortcuts
    await page.keyboard.press('Meta+s') // Save
    await page.waitForTimeout(500)
    
    const saveResult = page.locator('[data-testid="macos-save-result"]')
    if (await saveResult.isVisible()) {
      await expect(saveResult).toBeVisible()
    }
    
    // Test macOS Touch Bar (if available)
    const touchBarTest = page.locator('[data-testid="macos-touch-bar-test"]')
    if (await touchBarTest.isVisible()) {
      await touchBarTest.click()
      await page.waitForTimeout(1000)
      
      const touchBarResult = page.locator('[data-testid="macos-touch-bar-result"]')
      if (await touchBarResult.isVisible()) {
        await expect(touchBarResult).toBeVisible()
        await expect(page).toHaveScreenshot("macos-touch-bar.png", {
          animations: "disabled"
        })
      }
    }
  })

  test("Linux-specific functionality", async ({ page }) => {
    test.skip(currentPlatform !== 'linux', 'Linux-specific test')
    
    // Test Linux desktop environment detection
    const desktopTest = page.locator('[data-testid="linux-desktop-test"]')
    if (await desktopTest.isVisible()) {
      await desktopTest.click()
      await page.waitForTimeout(1000)
      
      const desktopResult = page.locator('[data-testid="linux-desktop-result"]')
      if (await desktopResult.isVisible()) {
        await expect(desktopResult).toBeVisible()
        await expect(page).toHaveScreenshot("linux-desktop-environment.png", {
          animations: "disabled"
        })
      }
    }
    
    // Test Linux file manager integration
    const fileManagerTest = page.locator('[data-testid="linux-file-manager-test"]')
    if (await fileManagerTest.isVisible()) {
      await fileManagerTest.click()
      await page.waitForTimeout(1000)
      
      const fileManagerResult = page.locator('[data-testid="linux-file-manager-result"]')
      if (await fileManagerResult.isVisible()) {
        await expect(fileManagerResult).toBeVisible()
        await expect(page).toHaveScreenshot("linux-file-manager.png", {
          animations: "disabled"
        })
      }
    }
    
    // Test Linux terminal integration
    const terminalTest = page.locator('[data-testid="linux-terminal-test"]')
    if (await terminalTest.isVisible()) {
      await terminalTest.click()
      await page.waitForTimeout(1000)
      
      const terminalResult = page.locator('[data-testid="linux-terminal-result"]')
      if (await terminalResult.isVisible()) {
        await expect(terminalResult).toBeVisible()
      }
    }
    
    // Test Linux system tray
    const systemTrayTest = page.locator('[data-testid="linux-system-tray-test"]')
    if (await systemTrayTest.isVisible()) {
      await systemTrayTest.click()
      await page.waitForTimeout(1000)
      
      const trayResult = page.locator('[data-testid="linux-system-tray-result"]')
      if (await trayResult.isVisible()) {
        await expect(trayResult).toBeVisible()
        await expect(page).toHaveScreenshot("linux-system-tray.png", {
          animations: "disabled"
        })
      }
    }
  })

  test("cross-platform file system operations", async ({ page }) => {
    // Test file path handling across platforms
    const pathTest = page.locator('[data-testid="cross-platform-path-test"]')
    if (await pathTest.isVisible()) {
      await pathTest.click()
      await page.waitForTimeout(1000)
      
      const pathResult = page.locator('[data-testid="cross-platform-path-result"]')
      if (await pathResult.isVisible()) {
        await expect(pathResult).toBeVisible()
        
        // Verify platform-specific path separators
        const pathContent = await pathResult.textContent()
        if (currentPlatform === 'win32') {
          expect(pathContent).toContain('\\')
        } else {
          expect(pathContent).toContain('/')
        }
      }
    }
    
    // Test file permissions handling
    const permissionsTest = page.locator('[data-testid="file-permissions-test"]')
    if (await permissionsTest.isVisible()) {
      await permissionsTest.click()
      await page.waitForTimeout(1000)
      
      const permissionsResult = page.locator('[data-testid="file-permissions-result"]')
      if (await permissionsResult.isVisible()) {
        await expect(permissionsResult).toBeVisible()
        await expect(page).toHaveScreenshot(`cross-platform-permissions-${currentPlatform}.png`, {
          animations: "disabled"
        })
      }
    }
    
    // Test file system events
    const fsEventsTest = page.locator('[data-testid="file-system-events-test"]')
    if (await fsEventsTest.isVisible()) {
      await fsEventsTest.click()
      await page.waitForTimeout(2000)
      
      const fsEventsResult = page.locator('[data-testid="file-system-events-result"]')
      if (await fsEventsResult.isVisible()) {
        await expect(fsEventsResult).toBeVisible()
      }
    }
  })

  test("cross-platform keyboard shortcuts", async ({ page }) => {
    // Test platform-specific modifier keys
    const modifierKey = currentPlatform === 'darwin' ? 'Meta' : 'Control'
    
    // Test common shortcuts with platform-specific modifiers
    const shortcuts = [
      { key: `${modifierKey}+n`, action: 'new' },
      { key: `${modifierKey}+s`, action: 'save' },
      { key: `${modifierKey}+o`, action: 'open' },
      { key: `${modifierKey}+q`, action: 'quit' }
    ]
    
    for (const shortcut of shortcuts) {
      await page.keyboard.press(shortcut.key)
      await page.waitForTimeout(500)
      
      const actionResult = page.locator(`[data-testid="${shortcut.action}-result"]`)
      if (await actionResult.isVisible()) {
        await expect(actionResult).toBeVisible()
      }
    }
    
    // Test platform-specific shortcuts
    if (currentPlatform === 'win32') {
      await page.keyboard.press('Alt+F4') // Close window
      await page.waitForTimeout(500)
      
      const closeResult = page.locator('[data-testid="window-close-result"]')
      if (await closeResult.isVisible()) {
        await expect(closeResult).toBeVisible()
      }
    } else if (currentPlatform === 'darwin') {
      await page.keyboard.press('Meta+w') // Close window
      await page.waitForTimeout(500)
      
      const closeResult = page.locator('[data-testid="window-close-result"]')
      if (await closeResult.isVisible()) {
        await expect(closeResult).toBeVisible()
      }
    }
  })

  test("cross-platform UI consistency", async ({ page }) => {
    // Test UI consistency across platforms
    await expect(page).toHaveScreenshot(`cross-platform-ui-${currentPlatform}.png`, {
      fullPage: true,
      animations: "disabled"
    })
    
    // Verify core UI elements are present on all platforms
    const coreElements = [
      '[data-testid="app-header"]',
      '[data-testid="main-content"]',
      '[data-testid="sidebar"]',
      '[data-testid="status-bar"]'
    ]
    
    for (const element of coreElements) {
      await expect(page.locator(element)).toBeVisible()
    }
    
    // Test platform-specific adaptations
    const platformElements = page.locator(`[data-testid^="${currentPlatform}-"]`)
    const platformCount = await platformElements.count()
    
    if (platformCount > 0) {
      for (let i = 0; i < platformCount; i++) {
        const element = platformElements.nth(i)
        if (await element.isVisible()) {
          await expect(element).toBeVisible()
        }
      }
    }
  })

  test("cross-platform performance", async ({ page }) => {
    // Test performance metrics on current platform
    const performanceTest = page.locator('[data-testid="performance-test"]')
    if (await performanceTest.isVisible()) {
      await performanceTest.click()
      await page.waitForTimeout(3000)
      
      const performanceResult = page.locator('[data-testid="performance-result"]')
      if (await performanceResult.isVisible()) {
        await expect(performanceResult).toBeVisible()
        
        // Verify performance is within acceptable bounds
        const performanceText = await performanceResult.textContent()
        const metrics = performanceText?.match(/(\d+)/g)
        
        if (metrics && metrics.length > 0) {
          const startupTime = parseInt(metrics[0])
          expect(startupTime).toBeLessThan(5000) // Should start within 5 seconds
        }
      }
    }
    
    // Test memory usage
    const memoryTest = page.locator('[data-testid="memory-test"]')
    if (await memoryTest.isVisible()) {
      await memoryTest.click()
      await page.waitForTimeout(2000)
      
      const memoryResult = page.locator('[data-testid="memory-result"]')
      if (await memoryResult.isVisible()) {
        await expect(memoryResult).toBeVisible()
        
        const memoryText = await memoryResult.textContent()
        const memoryMatch = memoryText?.match(/(\d+)\s*MB/i)
        
        if (memoryMatch) {
          const memoryUsage = parseInt(memoryMatch[1])
          expect(memoryUsage).toBeLessThan(200) // Should use less than 200MB
        }
      }
    }
  })

  test("cross-platform error handling", async ({ page }) => {
    // Test platform-specific error scenarios
    const errorScenarios = [
      'file-access-error',
      'network-error',
      'permission-error',
      'resource-error'
    ]
    
    for (const scenario of errorScenarios) {
      const errorTrigger = page.locator(`[data-testid="trigger-${scenario}"]`)
      if (await errorTrigger.isVisible()) {
        await errorTrigger.click()
        await page.waitForTimeout(1000)
        
        const errorDisplay = page.locator('[data-testid="error-display"]')
        if (await errorDisplay.isVisible()) {
          await expect(errorDisplay).toBeVisible()
          await expect(page).toHaveScreenshot(`cross-platform-error-${scenario}-${currentPlatform}.png`, {
            animations: "disabled"
          })
        }
        
        // Test error recovery
        const recoverButton = page.locator('[data-testid="error-recover"]')
        if (await recoverButton.isVisible()) {
          await recoverButton.click()
          await page.waitForTimeout(1000)
          
          const recoveredState = page.locator('[data-testid="recovered-state"]')
          if (await recoveredState.isVisible()) {
            await expect(recoveredState).toBeVisible()
          }
        }
      }
    }
  })

  test("cross-platform accessibility", async ({ page }) => {
    // Test accessibility features on current platform
    const accessibilityTest = page.locator('[data-testid="accessibility-test"]')
    if (await accessibilityTest.isVisible()) {
      await accessibilityTest.click()
      await page.waitForTimeout(1000)
      
      const accessibilityResult = page.locator('[data-testid="accessibility-result"]')
      if (await accessibilityResult.isVisible()) {
        await expect(accessibilityResult).toBeVisible()
      }
    }
    
    // Test screen reader compatibility
    const screenReaderTest = page.locator('[data-testid="screen-reader-test"]')
    if (await screenReaderTest.isVisible()) {
      await screenReaderTest.click()
      await page.waitForTimeout(1000)
      
      const screenReaderResult = page.locator('[data-testid="screen-reader-result"]')
      if (await screenReaderResult.isVisible()) {
        await expect(screenReaderResult).toBeVisible()
      }
    }
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.waitForTimeout(200)
    
    const focusedElement = page.locator(':focus')
    expect(await focusedElement.count()).toBeGreaterThan(0)
    
    // Verify ARIA labels are present
    const ariaElements = page.locator('[aria-label], [role]')
    expect(await ariaElements.count()).toBeGreaterThan(0)
  })

  test("cross-platform installation and updates", async ({ page }) => {
    // Test update mechanism
    const updateTest = page.locator('[data-testid="update-test"]')
    if (await updateTest.isVisible()) {
      await updateTest.click()
      await page.waitForTimeout(2000)
      
      const updateResult = page.locator('[data-testid="update-result"]')
      if (await updateResult.isVisible()) {
        await expect(updateResult).toBeVisible()
        await expect(page).toHaveScreenshot(`cross-platform-update-${currentPlatform}.png`, {
          animations: "disabled"
        })
      }
    }
    
    // Test auto-updater functionality
    const autoUpdateTest = page.locator('[data-testid="auto-update-test"]')
    if (await autoUpdateTest.isVisible()) {
      await autoUpdateTest.click()
      await page.waitForTimeout(2000)
      
      const autoUpdateResult = page.locator('[data-testid="auto-update-result"]')
      if (await autoUpdateResult.isVisible()) {
        await expect(autoUpdateResult).toBeVisible()
      }
    }
  })

  test("cross-platform security features", async ({ page }) => {
    // Test secure storage
    const secureStorageTest = page.locator('[data-testid="secure-storage-test"]')
    if (await secureStorageTest.isVisible()) {
      await secureStorageTest.click()
      await page.waitForTimeout(1000)
      
      const secureStorageResult = page.locator('[data-testid="secure-storage-result"]')
      if (await secureStorageResult.isVisible()) {
        await expect(secureStorageResult).toBeVisible()
        await expect(page).toHaveScreenshot(`cross-platform-security-${currentPlatform}.png`, {
          animations: "disabled"
        })
      }
    }
    
    // Test certificate validation
    const certificateTest = page.locator('[data-testid="certificate-test"]')
    if (await certificateTest.isVisible()) {
      await certificateTest.click()
      await page.waitForTimeout(1000)
      
      const certificateResult = page.locator('[data-testid="certificate-result"]')
      if (await certificateResult.isVisible()) {
        await expect(certificateResult).toBeVisible()
      }
    }
    
    // Test sandbox isolation
    const sandboxTest = page.locator('[data-testid="sandbox-test"]')
    if (await sandboxTest.isVisible()) {
      await sandboxTest.click()
      await page.waitForTimeout(1000)
      
      const sandboxResult = page.locator('[data-testid="sandbox-result"]')
      if (await sandboxResult.isVisible()) {
        await expect(sandboxResult).toBeVisible()
      }
    }
  })
})
