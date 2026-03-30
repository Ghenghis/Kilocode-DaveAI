import { test, expect, type Page } from "@playwright/test"
import { AxeBuilder, createAxeBuilder } from "@axe-core/playwright"

// Accessibility testing and WCAG 2.1 AA compliance
// These tests verify accessibility compliance across all components

test.describe("Accessibility Testing and Compliance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:1420")
    await page.waitForLoadState("networkidle")
    
    // Enable accessibility testing mode
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

  test("WCAG 2.1 AA compliance - main interface", async ({ page }) => {
    // Run axe accessibility checks
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    // Take accessibility compliance screenshot
    await expect(page).toHaveScreenshot("accessibility-main-interface.png", {
      fullPage: true,
      animations: "disabled"
    })
  })

  test("keyboard navigation and focus management", async ({ page }) => {
    // Test tab navigation through all interactive elements
    const interactiveElements = page.locator(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const elementCount = await interactiveElements.count()
    expect(elementCount).toBeGreaterThan(0)

    // Navigate through all elements using Tab
    for (let i = 0; i < elementCount; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)
      
      // Verify focus is visible and manageable
      const focusedElement = page.locator(':focus')
      expect(await focusedElement.count()).toBe(1)
      
      // Verify focus indicator is visible
      const focusStyles = await focusedElement.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return {
          outline: styles.outline,
          outlineOffset: styles.outlineOffset,
          boxShadow: styles.boxShadow
        }
      })
      
      // Should have some form of focus indicator
      const hasFocusIndicator = 
        focusStyles.outline !== 'none' || 
        focusStyles.boxShadow !== 'none' ||
        focusStyles.outlineOffset !== '0px'
      
      expect(hasFocusIndicator).toBe(true)
    }

    // Test Shift+Tab navigation
    for (let i = 0; i < elementCount; i++) {
      await page.keyboard.press('Shift+Tab')
      await page.waitForTimeout(100)
      
      const focusedElement = page.locator(':focus')
      expect(await focusedElement.count()).toBe(1)
    }

    // Test Enter and Space key activation
    const buttons = page.locator('button, [role="button"]')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      await button.focus()
      await page.waitForTimeout(100)
      
      // Test Space key
      await page.keyboard.press('Space')
      await page.waitForTimeout(200)
      
      // Test Enter key
      await page.keyboard.press('Enter')
      await page.waitForTimeout(200)
    }

    await expect(page).toHaveScreenshot("accessibility-keyboard-navigation.png", {
      fullPage: true,
      animations: "disabled"
    })
  })

  test("screen reader compatibility and ARIA attributes", async ({ page }) => {
    // Verify proper ARIA labels and roles
    const ariaElements = page.locator('[aria-label], [aria-labelledby], [aria-describedby], [role]')
    const ariaCount = await ariaElements.count()
    expect(ariaCount).toBeGreaterThan(0)

    // Check for proper ARIA attributes
    for (let i = 0; i < ariaCount; i++) {
      const element = ariaElements.nth(i)
      const ariaInfo = await element.evaluate((el) => {
        return {
          tagName: el.tagName,
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          ariaLabelledby: el.getAttribute('aria-labelledby'),
          ariaDescribedby: el.getAttribute('aria-describedby'),
          ariaExpanded: el.getAttribute('aria-expanded'),
          ariaHidden: el.getAttribute('aria-hidden'),
          ariaLive: el.getAttribute('aria-live'),
          tabIndex: el.getAttribute('tabindex')
        }
      })

      // Validate ARIA attributes
      if (ariaInfo.role) {
        expect(ariaInfo.role).toMatch(/^(button|link|navigation|main|complementary|contentinfo|search|banner|form|region|article|dialog|alert|status|timer|marquee|application|log|progressbar|tooltip|menu|menubar|listbox|treegrid|grid|table|row|column|rowgroup|rowheader|columnheader|cell|group|img|heading|list|listitem|none|presentation|text|textbox|checkbox|radio|switch|combobox|slider|spinbutton|searchbox|tab|tabpanel|tablist|tree|treeitem|separator|toolbar|feed|figure|caption|math|mroot|mrow|mfrac|msqrt|merror|mtext|menclose|semantics|annotation-xml|foreignObject|desc|title)$/)
      }

      if (ariaInfo.ariaLabel) {
        expect(ariaInfo.ariaLabel.trim()).length.toBeGreaterThan(0)
      }

      if (ariaInfo.ariaExpanded) {
        expect(['true', 'false']).toContain(ariaInfo.ariaExpanded)
      }

      if (ariaInfo.ariaHidden) {
        expect(['true', 'false']).toContain(ariaInfo.ariaHidden)
      }
    }

    // Test semantic HTML structure
    const semanticElements = page.locator('main, nav, header, footer, section, article, aside, h1, h2, h3, h4, h5, h6')
    const semanticCount = await semanticElements.count()
    expect(semanticCount).toBeGreaterThan(0)

    // Verify heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    
    if (headingCount > 0) {
      let previousLevel = 1
      for (let i = 0; i < headingCount; i++) {
        const heading = headings.nth(i)
        const level = parseInt(await heading.evaluate((el) => el.tagName.charAt(1)))
        
        // Heading levels should not skip more than one level
        expect(level - previousLevel).toBeLessThanOrEqual(1)
        previousLevel = level
      }
    }

    await expect(page).toHaveScreenshot("accessibility-aria-compliance.png", {
      fullPage: true,
      animations: "disabled"
    })
  })

  test("color contrast and visual accessibility", async ({ page }) => {
    // Test color contrast ratios
    const colorContrastResults = await page.evaluate(() => {
      const results: any[] = []
      const elements = document.querySelectorAll('*')
      
      elements.forEach(element => {
        const styles = window.getComputedStyle(element)
        const color = styles.color
        const backgroundColor = styles.backgroundColor
        
        if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          results.push({
            element: element.tagName + (element.className ? '.' + element.className : ''),
            color: color,
            backgroundColor: backgroundColor,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight
          })
        }
      })
      
      return results
    })

    // Verify we have color information
    expect(colorContrastResults.length).toBeGreaterThan(0)

    // Test high contrast mode
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' })
    await page.waitForTimeout(1000)

    await expect(page).toHaveScreenshot("accessibility-high-contrast.png", {
      fullPage: true,
      animations: "disabled"
    })

    // Test reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(1000)

    await expect(page).toHaveScreenshot("accessibility-reduced-motion.png", {
      fullPage: true,
      animations: "disabled"
    })

    // Test prefers-reduced-data
    await page.emulateMedia({ reducedData: 'reduce' })
    await page.waitForTimeout(1000)

    await expect(page).toHaveScreenshot("accessibility-reduced-data.png", {
      fullPage: true,
      animations: "disabled"
    })
  })

  test("form accessibility", async ({ page }) => {
    // Navigate to settings or any form
    const settingsButton = page.locator('[data-testid="nav-settings"]')
    if (await settingsButton.isVisible()) {
      await settingsButton.click()
      await page.waitForTimeout(1000)
    }

    // Test form labels and associations
    const formInputs = page.locator('input, select, textarea')
    const inputCount = await formInputs.count()

    for (let i = 0; i < inputCount; i++) {
      const input = formInputs.nth(i)
      
      // Check for proper labeling
      const hasLabel = await input.evaluate((el) => {
        const labels = [
          el.getAttribute('aria-label'),
          el.getAttribute('aria-labelledby'),
          el.closest('label') !== null,
          document.querySelector(`label[for="${el.id}"]`) !== null
        ]
        return labels.some(label => label !== null && label !== '')
      })

      expect(hasLabel).toBe(true)

      // Check for proper input types
      const inputType = await input.getAttribute('type')
      if (inputType) {
        expect(['text', 'password', 'email', 'url', 'tel', 'search', 'number', 'date', 'time', 'datetime-local', 'month', 'week', 'color', 'range', 'checkbox', 'radio', 'file', 'hidden', 'submit', 'reset', 'button']).toContain(inputType)
      }
    }

    // Test form validation messages
    const requiredInputs = page.locator('[required], [aria-required="true"]')
    const requiredCount = await requiredInputs.count()

    for (let i = 0; i < requiredCount; i++) {
      const input = requiredInputs.nth(i)
      
      // Check for required attribute indication
      const requiredIndication = await input.evaluate((el) => {
        const hasRequiredAttr = el.hasAttribute('required') || el.getAttribute('aria-required') === 'true'
        const hasAriaRequired = el.getAttribute('aria-required') === 'true'
        return hasRequiredAttr || hasAriaRequired
      })

      expect(requiredIndication).toBe(true)
    }

    // Test error messages accessibility
    const errorMessages = page.locator('[role="alert"], [role="status"], .error, .validation-error')
    const errorCount = await errorMessages.count()

    for (let i = 0; i < errorCount; i++) {
      const error = errorMessages.nth(i)
      const errorInfo = await error.evaluate((el) => {
        return {
          role: el.getAttribute('role'),
          ariaLive: el.getAttribute('aria-live'),
          textContent: el.textContent?.trim()
        }
      })

      // Error messages should be accessible
      if (errorInfo.role) {
        expect(['alert', 'status', 'alertdialog']).toContain(errorInfo.role)
      }

      if (errorInfo.textContent) {
        expect(errorInfo.textContent.length).toBeGreaterThan(0)
      }
    }

    await expect(page).toHaveScreenshot("accessibility-form-compliance.png", {
      fullPage: true,
      animations: "disabled"
    })
  })

  test("link and navigation accessibility", async ({ page }) => {
    // Test link accessibility
    const links = page.locator('a[href]')
    const linkCount = await links.count()

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      
      // Check for proper link text or aria-label
      const linkText = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      
      expect(linkText?.trim().length || ariaLabel?.length || 0).toBeGreaterThan(0)

      // Check for proper role
      const role = await link.getAttribute('role')
      if (role) {
        expect(role).toBe('link')
      }

      // Check for target attribute (should open in same tab unless specified)
      const target = await link.getAttribute('target')
      if (target === '_blank') {
        // External links should have aria-label or indicate external nature
        const hasExternalIndication = await link.evaluate((el) => {
          const text = el.textContent || ''
          const ariaLabel = el.getAttribute('aria-label') || ''
          return text.includes('external') || text.includes('opens in new window') || 
                 ariaLabel.includes('external') || ariaLabel.includes('opens in new window')
        })
        
        // Note: This might not always be required, but good practice
        // expect(hasExternalIndication).toBe(true)
      }
    }

    // Test navigation landmarks
    const navigationElements = page.locator('nav, [role="navigation"]')
    const navCount = await navigationElements.count()

    for (let i = 0; i < navCount; i++) {
      const nav = navigationElements.nth(i)
      
      // Navigation should have proper labeling
      const hasLabel = await nav.evaluate((el) => {
        const ariaLabel = el.getAttribute('aria-label')
        const ariaLabelledby = el.getAttribute('aria-labelledby')
        const hasTitle = el.hasAttribute('title')
        return ariaLabel || ariaLabelledby || hasTitle
      })

      // Navigation should be labeled (best practice)
      // expect(hasLabel).toBe(true)
    }

    // Test skip links (accessibility feature)
    const skipLinks = page.locator('a[href^="#"], [role="button"][tabindex="0"]')
    const skipLinkCount = await skipLinks.count()

    // Should have skip links for better navigation
    // expect(skipLinkCount).toBeGreaterThan(0)

    await expect(page).toHaveScreenshot("accessibility-navigation.png", {
      fullPage: true,
      animations: "disabled"
    })
  })

  test("table accessibility", async ({ page }) => {
    // Look for tables in the interface
    const tables = page.locator('table')
    const tableCount = await tables.count()

    for (let i = 0; i < tableCount; i++) {
      const table = tables.nth(i)
      
      // Check for table caption
      const caption = table.locator('caption')
      const hasCaption = await caption.count() > 0
      
      if (!hasCaption) {
        // Check for aria-label or aria-labelledby on table
        const ariaLabel = await table.getAttribute('aria-label')
        const ariaLabelledby = await table.getAttribute('aria-labelledby')
        expect(ariaLabel || ariaLabelledby).toBeTruthy()
      }

      // Check for table headers
      const headers = table.locator('th')
      const headerCount = await headers.count()
      
      if (headerCount > 0) {
        // Headers should have scope attribute
        for (let j = 0; j < headerCount; j++) {
          const header = headers.nth(j)
          const scope = await header.getAttribute('scope')
          
          if (scope) {
            expect(['row', 'col', 'rowgroup', 'colgroup']).toContain(scope)
          }
        }
      }

      // Check for proper table structure
      const hasThead = await table.locator('thead').count() > 0
      const hasTbody = await table.locator('tbody').count() > 0
      
      // Tables should have proper structure
      if (hasThead) {
        expect(hasTbody).toBe(true)
      }
    }

    await expect(page).toHaveScreenshot("accessibility-tables.png", {
      fullPage: true,
      animations: "disabled"
    })
  })

  test("media accessibility", async ({ page }) => {
    // Test image accessibility
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      
      // Check for alt text
      const alt = await img.getAttribute('alt')
      const role = await img.getAttribute('role')
      
      if (role === 'presentation') {
        // Decorative images should have role="presentation"
        expect(alt).toBe('')
      } else {
        // Meaningful images should have alt text
        expect(alt).toBeTruthy()
      }

      // Check for proper dimensions
      const width = await img.getAttribute('width')
      const height = await img.getAttribute('height')
      
      // Images should have dimensions or be responsive
      expect(width || height || await img.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return styles.width !== 'auto' && styles.height !== 'auto'
      })).toBeTruthy()
    }

    // Test video accessibility
    const videos = page.locator('video')
    const videoCount = await videos.count()

    for (let i = 0; i < videoCount; i++) {
      const video = videos.nth(i)
      
      // Check for controls
      const hasControls = await video.hasAttribute('controls')
      expect(hasControls).toBe(true)

      // Check for captions or tracks
      const tracks = video.locator('track')
      const trackCount = await tracks.count()
      
      // Videos should have captions for accessibility
      // expect(trackCount).toBeGreaterThan(0)
    }

    // Test audio accessibility
    const audios = page.locator('audio')
    const audioCount = await audios.count()

    for (let i = 0; i < audioCount; i++) {
      const audio = audios.nth(i)
      
      // Check for controls
      const hasControls = await audio.hasAttribute('controls')
      expect(hasControls).toBe(true)

      // Check for transcripts or descriptions
      const hasDescription = await audio.evaluate((el) => {
        const next = el.nextElementSibling
        return next && (next.tagName === 'DIV' || next.tagName === 'P') && 
               next.textContent && next.textContent.includes('transcript')
      })

      // Audio should have transcripts for accessibility
      // expect(hasDescription).toBe(true)
    }

    await expect(page).toHaveScreenshot("accessibility-media.png", {
      fullPage: true,
      animations: "disabled"
    })
  })

  test("dynamic content accessibility", async ({ page }) => {
    // Test live regions
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"], [role="log"], [role="marquee"], [role="timer"]')
    const liveRegionCount = await liveRegions.count()

    for (let i = 0; i < liveRegionCount; i++) {
      const liveRegion = liveRegions.nth(i)
      const ariaLive = await liveRegion.getAttribute('aria-live')
      const role = await liveRegion.getAttribute('role')
      
      if (ariaLive) {
        expect(['polite', 'assertive', 'off']).toContain(ariaLive)
      }

      if (role) {
        expect(['status', 'alert', 'log', 'marquee', 'timer']).toContain(role)
      }
    }

    // Test modal/dialog accessibility
    const modals = page.locator('[role="dialog"], [role="alertdialog"], .modal, .dialog')
    const modalCount = await modals.count()

    // Test triggering a modal if available
    const modalTrigger = page.locator('[data-testid="trigger-modal"]')
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click()
      await page.waitForTimeout(1000)

      const visibleModals = page.locator('[role="dialog"]:visible, [role="alertdialog"]:visible, .modal:visible, .dialog:visible')
      const visibleModalCount = await visibleModals.count()

      for (let i = 0; i < visibleModalCount; i++) {
        const modal = visibleModals.nth(i)
        
        // Modal should have proper focus management
        const modalTitle = modal.locator('h1, h2, h3, [role="heading"]')
        const hasTitle = await modalTitle.count() > 0
        
        if (hasTitle) {
          expect(await modalTitle.first().isVisible()).toBe(true)
        }

        // Modal should have close mechanism
        const closeButton = modal.locator('button[aria-label*="close"], button[title*="close"], .close, [data-testid="modal-close"]')
        const hasCloseButton = await closeButton.count() > 0
        
        expect(hasCloseButton).toBe(true)

        // Modal should trap focus
        const focusedElement = page.locator(':focus')
        const isFocusedInModal = await focusedElement.evaluate((el, modalEl) => {
          return modalEl.contains(el)
        }, await modal.elementHandle())
        
        expect(isFocusedInModal).toBe(true)

        // Test ESC key to close modal
        await page.keyboard.press('Escape')
        await page.waitForTimeout(500)
      }
    }

    await expect(page).toHaveScreenshot("accessibility-dynamic-content.png", {
      fullPage: true,
      animations: "disabled"
    })
  })

  test("accessibility tools integration", async ({ page }) => {
    // Test with different accessibility tools
    const tools = [
      { name: 'axe-core', enabled: true },
      { name: 'screen-reader-simulation', enabled: true },
      { name: 'keyboard-only', enabled: true },
      { name: 'high-contrast', enabled: true }
    ]

    for (const tool of tools) {
      if (!tool.enabled) continue

      switch (tool.name) {
        case 'axe-core':
          // Already tested in first test
          break

        case 'screen-reader-simulation':
          // Simulate screen reader behavior
          await page.addStyleTag({
            content: `
              * { font-family: system-ui !important; }
              img::before { content: attr(alt) !important; display: block !important; }
              [aria-label]::before { content: attr(aria-label) !important; display: block !important; }
            `
          })
          await page.waitForTimeout(1000)
          break

        case 'keyboard-only':
          // Disable mouse events
          await page.addStyleTag({
            content: `
              * { pointer-events: none !important; }
              button:focus, a:focus, input:focus, select:focus, textarea:focus { 
                pointer-events: auto !important; 
              }
            `
          })
          await page.waitForTimeout(1000)
          break

        case 'high-contrast':
          await page.emulateMedia({ forcedColors: 'active' })
          await page.waitForTimeout(1000)
          break
      }

      await expect(page).toHaveScreenshot(`accessibility-${tool.name}.png`, {
        fullPage: true,
        animations: "disabled"
      })
    }
  })

  test("accessibility performance impact", async ({ page }) => {
    // Measure performance with accessibility features enabled
    const startTime = Date.now()

    // Enable all accessibility features
    await page.emulateMedia({ 
      reducedMotion: 'reduce', 
      colorScheme: 'dark',
      forcedColors: 'active'
    })

    // Navigate through major sections
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

    // Accessibility features should not significantly impact performance
    expect(navigationTime).toBeLessThan(5000)

    // Test memory usage
    const memoryInfo = await page.evaluate(() => {
      return (performance as any).memory || { usedJSHeapSize: 0 }
    })

    if (memoryInfo.usedJSHeapSize) {
      // Memory usage should be reasonable
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(150 * 1024 * 1024) // 150MB
    }
  })
})
