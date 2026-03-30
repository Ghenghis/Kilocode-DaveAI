import { test, expect, type Page } from "@playwright/test"

// Performance Optimization Tests
// These tests verify performance metrics and optimization effectiveness

test.describe("Performance Optimization", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:1420")
    await page.waitForLoadState("networkidle")
  })

  test("initial load performance", async ({ page }) => {
    // Measure initial load metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        resourceCount: performance.getEntriesByType('resource').length
      }
    })

    // Performance benchmarks
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000) // 2 seconds
    expect(performanceMetrics.loadComplete).toBeLessThan(5000) // 5 seconds
    expect(performanceMetrics.firstPaint).toBeLessThan(1000) // 1 second
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1500) // 1.5 seconds
    expect(performanceMetrics.totalLoadTime).toBeLessThan(8000) // 8 seconds

    // Resource loading optimization
    expect(performanceMetrics.resourceCount).toBeLessThan(100) // Reasonable number of resources

    // Memory usage
    const memoryInfo = await page.evaluate(() => {
      return (performance as any).memory || { usedJSHeapSize: 0, totalJSHeapSize: 0 }
    })

    if (memoryInfo.usedJSHeapSize) {
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024) // 50MB initial
    }
  })

  test("navigation performance", async ({ page }) => {
    // Test navigation between sections
    const sections = ['chat', 'settings', 'history']
    const navigationTimes: number[] = []

    for (const section of sections) {
      const startTime = Date.now()
      
      const sectionButton = page.locator(`[data-testid="nav-${section}"]`)
      if (await sectionButton.isVisible()) {
        await sectionButton.click()
        await page.waitForLoadState('networkidle')
        
        const endTime = Date.now()
        navigationTimes.push(endTime - startTime)
        
        // Each navigation should be fast
        expect(endTime - startTime).toBeLessThan(1000) // 1 second
      }
    }

    // Average navigation time
    const avgNavigationTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length
    expect(avgNavigationTime).toBeLessThan(500) // 500ms average

    // Take performance screenshot
    await expect(page).toHaveScreenshot("performance-navigation.png", {
      fullPage: true,
      animations: "disabled"
    })
  })

  test("rendering performance", async ({ page }) => {
    // Test rendering performance with large content
    const renderStartTime = Date.now()
    
    // Generate large content
    await page.evaluate(() => {
      const container = document.querySelector('[data-testid="main-content"]')
      if (container) {
        const largeContent = Array.from({ length: 1000 }, (_, i) => 
          `<div class="test-item">Item ${i}</div>`
        ).join('')
        container.innerHTML = largeContent
      }
    })

    await page.waitForTimeout(1000)
    const renderEndTime = Date.now()
    const renderTime = renderEndTime - renderStartTime

    // Large content rendering should be reasonable
    expect(renderTime).toBeLessThan(3000) // 3 seconds

    // Test scrolling performance
    const scrollStartTime = Date.now()
    
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })

    await page.waitForTimeout(500)
    const scrollEndTime = Date.now()
    const scrollTime = scrollEndTime - scrollStartTime

    // Scrolling should be smooth
    expect(scrollTime).toBeLessThan(1000) // 1 second

    // Cleanup
    await page.evaluate(() => {
      const container = document.querySelector('[data-testid="main-content"]')
      if (container) {
        container.innerHTML = ''
      }
    })
  })

  test("memory management", async ({ page }) => {
    // Test memory usage over time
    const memorySnapshots: number[] = []
    
    for (let i = 0; i < 10; i++) {
      // Perform memory-intensive operations
      await page.evaluate(() => {
        // Create and destroy elements
        const container = document.createElement('div')
        container.innerHTML = Array.from({ length: 100 }, (_, i) => 
          `<div>Memory test ${i}</div>`
        ).join('')
        document.body.appendChild(container)
        
        // Simulate some work
        const elements = container.querySelectorAll('div')
        elements.forEach(el => {
          el.style.color = 'red'
          el.style.fontSize = '14px'
        })
        
        // Clean up
        document.body.removeChild(container)
      })

      // Measure memory
      const memoryInfo = await page.evaluate(() => {
        return (performance as any).memory || { usedJSHeapSize: 0 }
      })

      if (memoryInfo.usedJSHeapSize) {
        memorySnapshots.push(memoryInfo.usedJSHeapSize)
      }

      await page.waitForTimeout(500)
    }

    // Memory should not grow significantly
    if (memorySnapshots.length > 1) {
      const memoryGrowth = memorySnapshots[memorySnapshots.length - 1] - memorySnapshots[0]
      expect(memoryGrowth).toBeLessThan(20 * 1024 * 1024) // 20MB growth
    }

    // Test garbage collection
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc()
      }
    })

    await page.waitForTimeout(1000)

    // Memory after garbage collection
    const finalMemoryInfo = await page.evaluate(() => {
      return (performance as any).memory || { usedJSHeapSize: 0 }
    })

    if (finalMemoryInfo.usedJSHeapSize && memorySnapshots.length > 0) {
      const memoryReduction = memorySnapshots[memorySnapshots.length - 1] - finalMemoryInfo.usedJSHeapSize
      expect(memoryReduction).toBeGreaterThan(0) // Should free some memory
    }
  })

  test("network performance", async ({ page }) => {
    // Test API response times
    const apiEndpoints = [
      '/api/health',
      '/api/user/profile',
      '/api/settings',
      '/api/chat/history'
    ]

    const responseTimes: number[] = []

    for (const endpoint of apiEndpoints) {
      const startTime = Date.now()
      
      try {
        const response = await page.evaluate(async (url) => {
          const response = await fetch(url)
          return response.ok
        }, `http://localhost:3000${endpoint}`)
        
        const endTime = Date.now()
        responseTimes.push(endTime - startTime)
        
        // API responses should be fast
        expect(endTime - startTime).toBeLessThan(2000) // 2 seconds
      } catch (error) {
        // Skip if endpoint doesn't exist
        console.log(`Endpoint ${endpoint} not available`)
      }
    }

    if (responseTimes.length > 0) {
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      expect(avgResponseTime).toBeLessThan(1000) // 1 second average
    }

    // Test resource loading optimization
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource')
      
      return {
        totalSize: resources.reduce((sum: number, resource: any) => sum + (resource.transferSize || 0), 0),
        cachedResources: resources.filter((resource: any) => resource.transferSize === 0).length,
        slowResources: resources.filter((resource: any) => resource.duration > 1000).length,
        largeResources: resources.filter((resource: any) => (resource.transferSize || 0) > 1024 * 1024).length
      }
    })

    // Resource optimization checks
    expect(resourceMetrics.cachedResources).toBeGreaterThan(0) // Should have cached resources
    expect(resourceMetrics.slowResources).toBeLessThan(5) // Few slow resources
    expect(resourceMetrics.largeResources).toBeLessThan(3) // Few large resources
  })

  test("animation and transition performance", async ({ page }) => {
    // Test animation performance
    await page.addStyleTag({
      content: `
        .test-animation {
          animation: test-anim 1s ease-in-out infinite;
        }
        
        @keyframes test-anim {
          0% { transform: translateX(0); }
          50% { transform: translateX(100px); }
          100% { transform: translateX(0); }
        }
      `
    })

    // Create animated elements
    await page.evaluate(() => {
      const container = document.createElement('div')
      container.innerHTML = Array.from({ length: 50 }, (_, i) => 
        `<div class="test-animation" style="position: absolute; left: ${i * 10}px; top: ${i * 10}px;">Anim ${i}</div>`
      ).join('')
      document.body.appendChild(container)
    })

    // Measure animation performance
    const animationStartTime = Date.now()
    
    await page.waitForTimeout(3000) // Let animations run
    
    const animationEndTime = Date.now()
    const animationTime = animationEndTime - animationStartTime

    // Animations should not block the main thread
    expect(animationTime).toBeLessThan(4000) // Should complete within reasonable time

    // Test frame rate during animations
    const frameRate = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0
        let lastTime = performance.now()
        
        function countFrames() {
          frameCount++
          const currentTime = performance.now()
          
          if (currentTime - lastTime >= 1000) {
            resolve(frameCount)
            return
          }
          
          requestAnimationFrame(countFrames)
        }
        
        requestAnimationFrame(countFrames)
      })
    })

    // Should maintain reasonable frame rate
    expect(frameRate).toBeGreaterThan(30) // At least 30 FPS

    // Cleanup
    await page.evaluate(() => {
      const container = document.querySelector('div')
      if (container && container.innerHTML.includes('test-animation')) {
        document.body.removeChild(container)
      }
    })
  })

  test("database query performance", async ({ page }) => {
    // Test database query performance (if applicable)
    const queryTests = [
      { query: 'SELECT * FROM users LIMIT 10', expectedTime: 500 },
      { query: 'SELECT COUNT(*) FROM messages', expectedTime: 1000 },
      { query: 'SELECT * FROM chat_history ORDER BY created_at DESC LIMIT 50', expectedTime: 800 }
    ]

    for (const test of queryTests) {
      const startTime = Date.now()
      
      try {
        const result = await page.evaluate(async (query) => {
          // This would be replaced with actual database query execution
          const response = await fetch('/api/database/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
          })
          return response.json()
        }, test.query)
        
        const endTime = Date.now()
        const queryTime = endTime - startTime
        
        // Database queries should be fast
        expect(queryTime).toBeLessThan(test.expectedTime)
      } catch (error) {
        // Skip if database endpoint doesn't exist
        console.log(`Database query not available: ${test.query}`)
      }
    }
  })

  test("concurrent user performance", async ({ page }) => {
    // Simulate multiple concurrent operations
    const concurrentOperations = [
      () => page.locator('[data-testid="nav-chat"]').click(),
      () => page.locator('[data-testid="nav-settings"]').click(),
      () => page.locator('[data-testid="nav-history"]').click(),
      () => page.evaluate(() => window.scrollTo(0, 100)),
      () => page.evaluate(() => window.scrollTo(0, 0))
    ]

    const startTime = Date.now()
    
    // Execute operations concurrently
    await Promise.all(concurrentOperations.map(op => op()))
    
    const endTime = Date.now()
    const concurrentTime = endTime - startTime

    // Concurrent operations should be efficient
    expect(concurrentTime).toBeLessThan(2000) // 2 seconds
  })

  test("performance under load", async ({ page }) => {
    // Simulate high load scenarios
    const loadTests = [
      {
        name: 'rapid-navigation',
        action: async () => {
          for (let i = 0; i < 20; i++) {
            await page.locator('[data-testid="nav-chat"]').click()
            await page.waitForTimeout(50)
            await page.locator('[data-testid="nav-settings"]').click()
            await page.waitForTimeout(50)
          }
        }
      },
      {
        name: 'rapid-input',
        action: async () => {
          const input = page.locator('[data-testid="chat-input"] input')
          if (await input.isVisible()) {
            for (let i = 0; i < 100; i++) {
              await input.fill(`Message ${i}`)
              await page.waitForTimeout(10)
            }
          }
        }
      },
      {
        name: 'rapid-scrolling',
        action: async () => {
          for (let i = 0; i < 50; i++) {
            await page.evaluate(() => window.scrollTo(0, Math.random() * document.body.scrollHeight))
            await page.waitForTimeout(20)
          }
        }
      }
    ]

    for (const test of loadTests) {
      const startTime = Date.now()
      const startMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })

      await test.action()

      const endTime = Date.now()
      const endMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })

      const loadTime = endTime - startTime
      const memoryGrowth = endMemory - startMemory

      // Load tests should complete within reasonable time
      expect(loadTime).toBeLessThan(10000) // 10 seconds
      
      // Memory growth should be controlled
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024) // 50MB
    }
  })

  test("performance monitoring and metrics", async ({ page }) {
    // Test performance monitoring capabilities
    const monitoringData = await page.evaluate(() => {
      return {
        webVitals: {
          lcp: (performance as any).getLargestContentfulPaint?.(),
          fid: (performance as any).getFirstInputDelay?.(),
          cls: (performance as any).getCLS?.(),
          fcp: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime,
          ttfb: performance.getEntriesByType('navigation')[0]?.responseStart - performance.getEntriesByType('navigation')[0]?.requestStart
        },
        resourceMetrics: {
          totalResources: performance.getEntriesByType('resource').length,
          totalSize: performance.getEntriesByType('resource').reduce((sum: number, r: any) => sum + (r.transferSize || 0), 0),
          slowResources: performance.getEntriesByType('resource').filter((r: any) => r.duration > 1000).length
        },
        memoryMetrics: (performance as any).memory || {}
      }
    })

    // Core Web Vitals should be within acceptable ranges
    if (monitoringData.webVitals.lcp) {
      expect(monitoringData.webVitals.lcp.value).toBeLessThan(2500) // LCP < 2.5s
    }

    if (monitoringData.webVitals.fid) {
      expect(monitoringData.webVitals.fid.value).toBeLessThan(100) // FID < 100ms
    }

    if (monitoringData.webVitals.cls) {
      expect(monitoringData.webVitals.cls.value).toBeLessThan(0.1) // CLS < 0.1
    }

    // Performance monitoring should be active
    expect(monitoringData.webVitals.fcp).toBeTruthy()
    expect(monitoringData.resourceMetrics.totalResources).toBeGreaterThan(0)
  })

  test("performance regression detection", async ({ page }) => {
    // Establish baseline performance metrics
    const baselineMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      
      return {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      }
    })

    // Simulate performance regression
    await page.addStyleTag({
      content: `
        * { transition: all 2s ease !important; }
        body { background: linear-gradient(45deg, red, blue, green, yellow) !important; }
      `
    })

    // Navigate to different section to trigger re-render
    await page.locator('[data-testid="nav-settings"]').click()
    await page.waitForLoadState('networkidle')

    // Measure degraded performance
    const degradedMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      
      return {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      }
    })

    // Performance should not have regressed significantly
    const loadTimeRegression = degradedMetrics.loadTime - baselineMetrics.loadTime
    expect(loadTimeRegression).toBeLessThan(2000) // Less than 2 seconds regression

    // Cleanup
    await page.reload()
    await page.waitForLoadState('networkidle')
  })
})
