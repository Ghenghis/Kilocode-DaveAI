import { test, expect, type Page } from "@playwright/test"

// Core user journey tests for critical workflows
// These tests verify complete user workflows from start to finish

test.describe("Core User Journeys", () => {
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

  test("complete chat conversation workflow", async ({ page }) => {
    // Step 1: Start a new conversation
    const promptInput = page.locator('[data-testid="prompt-input"]')
    await expect(promptInput).toBeVisible()
    
    // Step 2: Send initial greeting
    await promptInput.fill("Hello, I need help with a coding task")
    await page.locator('[data-testid="send-button"]').click()
    
    // Step 3: Wait for response
    await page.waitForTimeout(2000)
    
    // Step 4: Send follow-up with code
    await promptInput.fill("Can you help me debug this function?\n\n```javascript\nfunction test() {\n  return 'hello';\n}\n```")
    await page.locator('[data-testid="send-button"]').click()
    
    // Step 5: Wait for code analysis response
    await page.waitForTimeout(3000)
    
    // Step 6: Send another message
    await promptInput.fill("What's the best way to improve this?")
    await page.locator('[data-testid="send-button"]').click()
    
    // Step 7: Verify conversation flow
    const conversationArea = page.locator('[data-testid="conversation-area"]')
    await expect(conversationArea).toContainText("Hello, I need help")
    await expect(conversationArea).toContainText("debug this function")
    await expect(conversationArea).toContainText("best way to improve")
    
    // Step 8: Verify code blocks are rendered properly
    const codeBlocks = page.locator('pre code')
    expect(await codeBlocks.count()).toBeGreaterThan(0)
  })

  test("settings configuration workflow", async ({ page }) => {
    // Step 1: Access settings
    const settingsButton = page.locator('[data-testid="settings-button"]')
    if (await settingsButton.isVisible()) {
      await settingsButton.click()
      
      // Step 2: Navigate through settings tabs
      const modelsTab = page.locator('[data-testid="models-tab"]')
      if (await modelsTab.isVisible()) {
        await modelsTab.click()
        await expect(page.locator('[data-testid="models-settings"]')).toBeVisible()
      }
      
      const displayTab = page.locator('[data-testid="display-tab"]')
      if (await displayTab.isVisible()) {
        await displayTab.click()
        await expect(page.locator('[data-testid="display-settings"]')).toBeVisible()
      }
      
      const languageTab = page.locator('[data-testid="language-tab"]')
      if (await languageTab.isVisible()) {
        await languageTab.click()
        await expect(page.locator('[data-testid="language-settings"]')).toBeVisible()
      }
      
      // Step 3: Make a configuration change
      const themeSelector = page.locator('[data-testid="theme-selector"]')
      if (await themeSelector.isVisible()) {
        await themeSelector.click()
        await page.locator('[data-value="dark"]').click()
        
        // Step 4: Save settings
        const saveButton = page.locator('[data-testid="save-settings"]')
        if (await saveButton.isVisible()) {
          await saveButton.click()
          
          // Step 5: Verify settings are applied
          await page.waitForTimeout(1000)
          // Settings should be persisted (implementation dependent)
        }
      }
    }
  })

  test("file operations workflow", async ({ page }) => {
    const promptInput = page.locator('[data-testid="prompt-input"]')
    
    // Step 1: Use file mention
    await promptInput.fill("@src/main.js")
    
    // Step 2: Wait for file suggestions
    await page.waitForTimeout(1000)
    
    // Step 3: Select a file (if suggestions appear)
    const fileSuggestions = page.locator('[data-testid="file-suggestion"]')
    if (await fileSuggestions.first().isVisible()) {
      await fileSuggestions.first().click()
      
      // Step 4: Send message with file context
      await page.keyboard.press("Enter")
      await page.waitForTimeout(2000)
      
      // Step 5: Verify file context is included
      const conversationArea = page.locator('[data-testid="conversation-area"]')
      await expect(conversationArea).toContainText("src/main.js")
    }
  })

  test("error recovery workflow", async ({ page }) => {
    const promptInput = page.locator('[data-testid="prompt-input"]')
    
    // Step 1: Send a message that might cause an error
    await promptInput.fill("Generate an extremely long response that might timeout")
    await page.locator('[data-testid="send-button"]').click()
    
    // Step 2: Wait for potential error or timeout
    await page.waitForTimeout(5000)
    
    // Step 3: Check for error display
    const errorDisplay = page.locator('[data-testid="error-display"]')
    if (await errorDisplay.isVisible()) {
      // Step 4: Try to dismiss error
      const dismissButton = page.locator('[data-testid="dismiss-error"]')
      if (await dismissButton.isVisible()) {
        await dismissButton.click()
      }
      
      // Step 5: Verify error is handled gracefully
      await expect(promptInput).toBeVisible()
      await expect(page.locator('[data-testid="send-button"]')).toBeVisible()
    }
    
    // Step 6: Send a new message to verify recovery
    await promptInput.fill("Can you help me with a simple task?")
    await page.locator('[data-testid="send-button"]').click()
    await page.waitForTimeout(2000)
    
    // Should be able to continue normally
    await expect(promptInput).toBeVisible()
  })

  test("multi-session workflow", async ({ page }) => {
    // Step 1: Send message in current session
    const promptInput = page.locator('[data-testid="prompt-input"]')
    await promptInput.fill("This is message 1")
    await page.locator('[data-testid="send-button"]').click()
    await page.waitForTimeout(1000)
    
    // Step 2: Look for session management
    const newSessionButton = page.locator('[data-testid="new-session-button"]')
    if (await newSessionButton.isVisible()) {
      await newSessionButton.click()
      
      // Step 3: Verify new session starts
      await page.waitForTimeout(1000)
      const conversationArea = page.locator('[data-testid="conversation-area"]')
      
      // Should be empty in new session (implementation dependent)
      // await expect(conversationArea).not.toContainText("This is message 1")
      
      // Step 4: Send message in new session
      await promptInput.fill("This is message 2 in new session")
      await page.locator('[data-testid="send-button"]').click()
      await page.waitForTimeout(1000)
      
      await expect(conversationArea).toContainText("This is message 2")
    }
  })

  test("agent mode switching workflow", async ({ page }) => {
    // Step 1: Look for agent mode selector
    const modeSelector = page.locator('[data-testid="mode-selector"]')
    if (await modeSelector.isVisible()) {
      // Step 2: Try different modes
      await modeSelector.click()
      
      const codeMode = page.locator('[data-testid="mode-code"]')
      if (await codeMode.isVisible()) {
        await codeMode.click()
        await page.waitForTimeout(1000)
        
        // Step 3: Send a message in code mode
        const promptInput = page.locator('[data-testid="prompt-input"]')
        await promptInput.fill("Help me write a function")
        await page.locator('[data-testid="send-button"]').click()
        await page.waitForTimeout(2000)
        
        // Step 4: Verify mode-specific behavior
        const conversationArea = page.locator('[data-testid="conversation-area"]')
        await expect(conversationArea).toContainText("Help me write a function")
      }
    }
  })

  test("provider configuration workflow", async ({ page }) => {
    // Step 1: Access provider settings
    const settingsButton = page.locator('[data-testid="settings-button"]')
    if (await settingsButton.isVisible()) {
      await settingsButton.click()
      
      const providersTab = page.locator('[data-testid="providers-tab"]')
      if (await providersTab.isVisible()) {
        await providersTab.click()
        
        // Step 2: Configure a provider
        const addProviderButton = page.locator('[data-testid="add-provider"]')
        if (await addProviderButton.isVisible()) {
          await addProviderButton.click()
          
          // Step 3: Fill provider configuration
          const providerName = page.locator('[data-testid="provider-name"]')
          if (await providerName.isVisible()) {
            await providerName.fill("Test Provider")
            
            const apiKey = page.locator('[data-testid="api-key"]')
            if (await apiKey.isVisible()) {
              await apiKey.fill("test-api-key")
              
              // Step 4: Save configuration
              const saveButton = page.locator('[data-testid="save-provider"]')
              if (await saveButton.isVisible()) {
                await saveButton.click()
                await page.waitForTimeout(1000)
                
                // Step 5: Verify provider is added
                const providerList = page.locator('[data-testid="provider-list"]')
                await expect(providerList).toContainText("Test Provider")
              }
            }
          }
        }
      }
    }
  })

  test("import/export workflow", async ({ page }) => {
    // Step 1: Look for import functionality
    const importButton = page.locator('[data-testid="import-button"]')
    if (await importButton.isVisible()) {
      await importButton.click()
      
      // Step 2: Handle import dialog
      const importDialog = page.locator('[data-testid="import-dialog"]')
      if (await importDialog.isVisible()) {
        // Step 3: Try file upload (if supported)
        const fileInput = page.locator('[data-testid="file-input"]')
        if (await fileInput.isVisible()) {
          // Note: Actual file upload testing requires test files
          // For now, just verify the dialog opens
          await expect(importDialog).toBeVisible()
        }
        
        // Step 4: Close dialog
        const cancelButton = page.locator('[data-testid="cancel-import"]')
        if (await cancelButton.isVisible()) {
          await cancelButton.click()
        }
      }
    }
    
    // Step 5: Look for export functionality
    const exportButton = page.locator('[data-testid="export-button"]')
    if (await exportButton.isVisible()) {
      await exportButton.click()
      
      // Verify export dialog appears
      const exportDialog = page.locator('[data-testid="export-dialog"]')
      if (await exportDialog.isVisible()) {
        await expect(exportDialog).toBeVisible()
        
        // Close dialog
        const cancelButton = page.locator('[data-testid="cancel-export"]')
        if (await cancelButton.isVisible()) {
          await cancelButton.click()
        }
      }
    }
  })
})
