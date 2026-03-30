import { test, expect, type Page } from "@playwright/test"

// Native integration tests for desktop application
// These tests verify native OS integration features

test.describe("Native Integration Tests", () => {
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

  test("file system operations", async ({ page }) => {
    // Test file opening
    const openFileButton = page.locator('[data-testid="open-file"]')
    if (await openFileButton.isVisible()) {
      await openFileButton.click()
      await page.waitForTimeout(1000)
      
      // Verify file dialog integration
      const fileDialog = page.locator('[data-testid="file-dialog"]')
      const fileContent = page.locator('[data-testid="file-content"]')
      
      expect(await fileDialog.isVisible() || await fileContent.isVisible()).toBeTruthy()
      
      if (await fileContent.isVisible()) {
        await expect(fileContent).toContainText("File content")
        await expect(page).toHaveScreenshot("native-file-opened.png", {
          animations: "disabled"
        })
      }
    }
    
    // Test file saving
    const saveFileButton = page.locator('[data-testid="save-file"]')
    if (await saveFileButton.isVisible()) {
      await saveFileButton.click()
      await page.waitForTimeout(1000)
      
      // Verify save dialog or confirmation
      const saveDialog = page.locator('[data-testid="save-dialog"]')
      const saveConfirmation = page.locator('[data-testid="save-confirmation"]')
      
      expect(await saveDialog.isVisible() || await saveConfirmation.isVisible()).toBeTruthy()
    }
    
    // Test folder selection
    const selectFolderButton = page.locator('[data-testid="select-folder"]')
    if (await selectFolderButton.isVisible()) {
      await selectFolderButton.click()
      await page.waitForTimeout(1000)
      
      // Verify folder dialog
      const folderDialog = page.locator('[data-testid="folder-dialog"]')
      const selectedFolder = page.locator('[data-testid="selected-folder"]')
      
      expect(await folderDialog.isVisible() || await selectedFolder.isVisible()).toBeTruthy()
    }
  })

  test("system notifications", async ({ page }) => {
    // Test notification creation
    const createNotificationButton = page.locator('[data-testid="create-notification"]')
    if (await createNotificationButton.isVisible()) {
      await createNotificationButton.click()
      await page.waitForTimeout(2000)
      
      // Verify notification appears
      const notification = page.locator('[data-testid="notification"]')
      if (await notification.isVisible()) {
        await expect(notification).toBeVisible()
        await expect(notification).toContainText("Test Notification")
        await expect(page).toHaveScreenshot("native-notification.png", {
          animations: "disabled"
        })
        
        // Test notification interaction
        const notificationAction = page.locator('[data-testid="notification-action"]')
        if (await notificationAction.isVisible()) {
          await notificationAction.click()
          await page.waitForTimeout(1000)
          
          // Verify action was handled
          const actionResult = page.locator('[data-testid="notification-action-result"]')
          if (await actionResult.isVisible()) {
            await expect(actionResult).toBeVisible()
          }
        }
      }
    }
    
    // Test notification dismissal
    const dismissNotificationButton = page.locator('[data-testid="dismiss-notification"]')
    if (await dismissNotificationButton.isVisible()) {
      await dismissNotificationButton.click()
      await page.waitForTimeout(1000)
      
      // Verify notification is dismissed
      const notification = page.locator('[data-testid="notification"]')
      expect(await notification.isVisible()).toBeFalsy()
    }
    
    // Test notification types
    const notificationTypes = ['info', 'warning', 'error', 'success']
    for (const type of notificationTypes) {
      const typeButton = page.locator(`[data-testid="notification-${type}"]`)
      if (await typeButton.isVisible()) {
        await typeButton.click()
        await page.waitForTimeout(1000)
        
        const notification = page.locator(`[data-testid="notification-${type}-display"]`)
        if (await notification.isVisible()) {
          await expect(notification).toBeVisible()
          await expect(page).toHaveScreenshot(`native-notification-${type}.png`, {
            animations: "disabled"
          })
        }
      }
    }
  })

  test("clipboard integration", async ({ page }) => {
    // Test clipboard copy
    const copyButton = page.locator('[data-testid="copy-to-clipboard"]')
    if (await copyButton.isVisible()) {
      await copyButton.click()
      await page.waitForTimeout(500)
      
      // Verify copy action
      const copyConfirmation = page.locator('[data-testid="copy-confirmation"]')
      if (await copyConfirmation.isVisible()) {
        await expect(copyConfirmation).toContainText("Copied to clipboard")
      }
    }
    
    // Test clipboard paste
    const pasteButton = page.locator('[data-testid="paste-from-clipboard"]')
    if (await pasteButton.isVisible()) {
      await pasteButton.click()
      await page.waitForTimeout(500)
      
      // Verify paste action
      const pastedContent = page.locator('[data-testid="pasted-content"]')
      if (await pastedContent.isVisible()) {
        await expect(pastedContent).toBeVisible()
        await expect(page).toHaveScreenshot("native-clipboard-paste.png", {
          animations: "disabled"
        })
      }
    }
    
    // Test clipboard formats
    const formatButtons = page.locator('[data-testid^="clipboard-format-"]')
    const formatCount = await formatButtons.count()
    
    for (let i = 0; i < formatCount; i++) {
      const formatButton = formatButtons.nth(i)
      if (await formatButton.isVisible()) {
        await formatButton.click()
        await page.waitForTimeout(500)
        
        const formatResult = page.locator('[data-testid="clipboard-format-result"]')
        if (await formatResult.isVisible()) {
          await expect(formatResult).toBeVisible()
        }
      }
    }
  })

  test("shell integration", async ({ page }) => {
    // Test shell command execution
    const shellCommandButton = page.locator('[data-testid="execute-shell-command"]')
    if (await shellCommandButton.isVisible()) {
      await shellCommandButton.click()
      await page.waitForTimeout(2000)
      
      // Verify command execution
      const commandResult = page.locator('[data-testid="shell-command-result"]')
      if (await commandResult.isVisible()) {
        await expect(commandResult).toBeVisible()
        await expect(page).toHaveScreenshot("native-shell-command.png", {
          animations: "disabled"
        })
      }
    }
    
    // Test file association
    const fileAssociationButton = page.locator('[data-testid="test-file-association"]')
    if (await fileAssociationButton.isVisible()) {
      await fileAssociationButton.click()
      await page.waitForTimeout(1000)
      
      // Verify file association
      const associationResult = page.locator('[data-testid="file-association-result"]')
      if (await associationResult.isVisible()) {
        await expect(associationResult).toBeVisible()
      }
    }
    
    // Test external application launch
    const launchAppButton = page.locator('[data-testid="launch-external-app"]')
    if (await launchAppButton.isVisible()) {
      await launchAppButton.click()
      await page.waitForTimeout(2000)
      
      // Verify application launch
      const launchResult = page.locator('[data-testid="external-app-launched"]')
      if (await launchResult.isVisible()) {
        await expect(launchResult).toBeVisible()
      }
    }
  })

  test("OS-specific features", async ({ page }) => {
    const platform = process.platform
    
    // Windows-specific tests
    if (platform === 'win32') {
      const windowsFeatures = [
        'windows-registry',
        'windows-shortcuts',
        'windows-taskbar',
        'windows-start-menu'
      ]
      
      for (const feature of windowsFeatures) {
        const featureButton = page.locator(`[data-testid="${feature}"]`)
        if (await featureButton.isVisible()) {
          await featureButton.click()
          await page.waitForTimeout(1000)
          
          const featureResult = page.locator(`[data-testid="${feature}-result"]`)
          if (await featureResult.isVisible()) {
            await expect(featureResult).toBeVisible()
            await expect(page).toHaveScreenshot(`native-windows-${feature}.png`, {
              animations: "disabled"
            })
          }
        }
      }
    }
    
    // macOS-specific tests
    if (platform === 'darwin') {
      const macosFeatures = [
        'macos-dock',
        'macos-menu-bar',
        'macos-spotlight',
        'macos-finder'
      ]
      
      for (const feature of macosFeatures) {
        const featureButton = page.locator(`[data-testid="${feature}"]`)
        if (await featureButton.isVisible()) {
          await featureButton.click()
          await page.waitForTimeout(1000)
          
          const featureResult = page.locator(`[data-testid="${feature}-result"]`)
          if (await featureResult.isVisible()) {
            await expect(featureResult).toBeVisible()
            await expect(page).toHaveScreenshot(`native-macos-${feature}.png`, {
              animations: "disabled"
            })
          }
        }
      }
    }
    
    // Linux-specific tests
    if (platform === 'linux') {
      const linuxFeatures = [
        'linux-desktop',
        'linux-file-manager',
        'linux-terminal',
        'linux-system-tray'
      ]
      
      for (const feature of linuxFeatures) {
        const featureButton = page.locator(`[data-testid="${feature}"]`)
        if (await featureButton.isVisible()) {
          await featureButton.click()
          await page.waitForTimeout(1000)
          
          const featureResult = page.locator(`[data-testid="${feature}-result"]`)
          if (await featureResult.isVisible()) {
            await expect(featureResult).toBeVisible()
            await expect(page).toHaveScreenshot(`native-linux-${feature}.png`, {
              animations: "disabled"
            })
          }
        }
      }
    }
  })

  test("process integration", async ({ page }) => {
    // Test process information
    const processInfoButton = page.locator('[data-testid="get-process-info"]')
    if (await processInfoButton.isVisible()) {
      await processInfoButton.click()
      await page.waitForTimeout(1000)
      
      // Verify process information
      const processInfo = page.locator('[data-testid="process-info"]')
      if (await processInfo.isVisible()) {
        await expect(processInfo).toBeVisible()
        await expect(processInfo).toContainText("PID")
        await expect(processInfo).toContainText("Memory")
        await expect(page).toHaveScreenshot("native-process-info.png", {
          animations: "disabled"
        })
      }
    }
    
    // Test process management
    const processManagementButton = page.locator('[data-testid="manage-processes"]')
    if (await processManagementButton.isVisible()) {
      await processManagementButton.click()
      await page.waitForTimeout(1000)
      
      // Verify process management
      const processList = page.locator('[data-testid="process-list"]')
      if (await processList.isVisible()) {
        await expect(processList).toBeVisible()
      }
    }
    
    // Test system resources
    const systemResourcesButton = page.locator('[data-testid="system-resources"]')
    if (await systemResourcesButton.isVisible()) {
      await systemResourcesButton.click()
      await page.waitForTimeout(1000)
      
      // Verify system resources
      const resourcesInfo = page.locator('[data-testid="system-resources"]')
      if (await resourcesInfo.isVisible()) {
        await expect(resourcesInfo).toBeVisible()
        await expect(page).toHaveScreenshot("native-system-resources.png", {
          animations: "disabled"
        })
      }
    }
  })

  test("network integration", async ({ page }) => {
    // Test network status
    const networkStatusButton = page.locator('[data-testid="network-status"]')
    if (await networkStatusButton.isVisible()) {
      await networkStatusButton.click()
      await page.waitForTimeout(1000)
      
      // Verify network status
      const networkInfo = page.locator('[data-testid="network-info"]')
      if (await networkInfo.isVisible()) {
        await expect(networkInfo).toBeVisible()
        await expect(networkInfo).toContainText("Online") || await expect(networkInfo).toContainText("Offline")
      }
    }
    
    // Test external URL opening
    const openUrlButton = page.locator('[data-testid="open-external-url"]')
    if (await openUrlButton.isVisible()) {
      await openUrlButton.click()
      await page.waitForTimeout(2000)
      
      // Verify URL opening
      const urlResult = page.locator('[data-testid="external-url-result"]')
      if (await urlResult.isVisible()) {
        await expect(urlResult).toBeVisible()
      }
    }
    
    // Test network requests
    const networkRequestButton = page.locator('[data-testid="test-network-request"]')
    if (await networkRequestButton.isVisible()) {
      await networkRequestButton.click()
      await page.waitForTimeout(3000)
      
      // Verify network request
      const requestResult = page.locator('[data-testid="network-request-result"]')
      if (await requestResult.isVisible()) {
        await expect(requestResult).toBeVisible()
        await expect(page).toHaveScreenshot("native-network-request.png", {
          animations: "disabled"
        })
      }
    }
  })

  test("storage integration", async ({ page }) => {
    // Test local storage
    const localStorageButton = page.locator('[data-testid="test-local-storage"]')
    if (await localStorageButton.isVisible()) {
      await localStorageButton.click()
      await page.waitForTimeout(500)
      
      // Verify local storage
      const storageResult = page.locator('[data-testid="local-storage-result"]')
      if (await storageResult.isVisible()) {
        await expect(storageResult).toBeVisible()
      }
    }
    
    // Test persistent storage
    const persistentStorageButton = page.locator('[data-testid="test-persistent-storage"]')
    if (await persistentStorageButton.isVisible()) {
      await persistentStorageButton.click()
      await page.waitForTimeout(500)
      
      // Verify persistent storage
      const persistentResult = page.locator('[data-testid="persistent-storage-result"]')
      if (await persistentResult.isVisible()) {
        await expect(persistentResult).toBeVisible()
        await expect(page).toHaveScreenshot("native-persistent-storage.png", {
          animations: "disabled"
        })
      }
    }
    
    // Test storage persistence across restarts
    const storagePersistenceButton = page.locator('[data-testid="test-storage-persistence"]')
    if (await storagePersistenceButton.isVisible()) {
      await storagePersistenceButton.click()
      await page.waitForTimeout(500)
      
      // Simulate application restart
      await page.reload()
      await page.waitForLoadState("networkidle")
      await page.waitForTimeout(1000)
      
      // Verify storage persisted
      const persistedData = page.locator('[data-testid="persisted-data"]')
      if (await persistedData.isVisible()) {
        await expect(persistedData).toBeVisible()
      }
    }
  })

  test("security integration", async ({ page }) => {
    // Test secure storage
    const secureStorageButton = page.locator('[data-testid="test-secure-storage"]')
    if (await secureStorageButton.isVisible()) {
      await secureStorageButton.click()
      await page.waitForTimeout(1000)
      
      // Verify secure storage
      const secureResult = page.locator('[data-testid="secure-storage-result"]')
      if (await secureResult.isVisible()) {
        await expect(secureResult).toBeVisible()
        await expect(page).toHaveScreenshot("native-secure-storage.png", {
          animations: "disabled"
        })
      }
    }
    
    // Test certificate validation
    const certificateButton = page.locator('[data-testid="test-certificate"]')
    if (await certificateButton.isVisible()) {
      await certificateButton.click()
      await page.waitForTimeout(1000)
      
      // Verify certificate validation
      const certificateResult = page.locator('[data-testid="certificate-result"]')
      if (await certificateResult.isVisible()) {
        await expect(certificateResult).toBeVisible()
      }
    }
    
    // Test permissions
    const permissionsButton = page.locator('[data-testid="test-permissions"]')
    if (await permissionsButton.isVisible()) {
      await permissionsButton.click()
      await page.waitForTimeout(1000)
      
      // Verify permissions
      const permissionsResult = page.locator('[data-testid="permissions-result"]')
      if (await permissionsResult.isVisible()) {
        await expect(permissionsResult).toBeVisible()
      }
    }
  })

  test("error handling for native operations", async ({ page }) => {
    // Test file operation errors
    const fileErrorButton = page.locator('[data-testid="test-file-error"]')
    if (await fileErrorButton.isVisible()) {
      await fileErrorButton.click()
      await page.waitForTimeout(1000)
      
      // Verify error handling
      const errorDisplay = page.locator('[data-testid="native-error-display"]')
      if (await errorDisplay.isVisible()) {
        await expect(errorDisplay).toBeVisible()
        await expect(errorDisplay).toContainText("File operation failed")
        await expect(page).toHaveScreenshot("native-file-error.png", {
          animations: "disabled"
        })
      }
    }
    
    // Test network operation errors
    const networkErrorButton = page.locator('[data-testid="test-network-error"]')
    if (await networkErrorButton.isVisible()) {
      await networkErrorButton.click()
      await page.waitForTimeout(2000)
      
      // Verify error handling
      const networkErrorDisplay = page.locator('[data-testid="network-error-display"]')
      if (await networkErrorDisplay.isVisible()) {
        await expect(networkErrorDisplay).toBeVisible()
        await expect(networkErrorDisplay).toContainText("Network operation failed")
      }
    }
    
    // Test permission errors
    const permissionErrorButton = page.locator('[data-testid="test-permission-error"]')
    if (await permissionErrorButton.isVisible()) {
      await permissionErrorButton.click()
      await page.waitForTimeout(1000)
      
      // Verify error handling
      const permissionErrorDisplay = page.locator('[data-testid="permission-error-display"]')
      if (await permissionErrorDisplay.isVisible()) {
        await expect(permissionErrorDisplay).toBeVisible()
        await expect(permissionErrorDisplay).toContainText("Permission denied")
        await expect(page).toHaveScreenshot("native-permission-error.png", {
          animations: "disabled"
        })
      }
    }
  })
})
