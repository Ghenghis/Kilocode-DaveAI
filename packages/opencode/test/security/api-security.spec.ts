import { test, expect, type Page, type APIRequestContext } from "@playwright/test"

// API Security Hardening Tests
// These tests verify API security measures and vulnerability protection

test.describe("API Security Hardening", () => {
  let apiContext: APIRequestContext

  test.beforeEach(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: "http://localhost:3000", // API base URL
      extraHTTPHeaders: {
        'Content-Type': 'application/json'
      }
    })
  })

  test.afterEach(async () => {
    await apiContext.dispose()
  })

  test("authentication and authorization", async () => {
    // Test unauthenticated access
    const unauthResponse = await apiContext.get('/api/protected')
    expect(unauthResponse.status()).toBe(401)

    // Test invalid authentication
    const invalidAuthResponse = await apiContext.get('/api/protected', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    })
    expect(invalidAuthResponse.status()).toBe(401)

    // Test malformed authentication header
    const malformedAuthResponse = await apiContext.get('/api/protected', {
      headers: {
        'Authorization': 'Bearer'
      }
    })
    expect(malformedAuthResponse.status()).toBe(401)

    // Test missing authentication header
    const missingAuthResponse = await apiContext.get('/api/protected', {
      headers: {}
    })
    expect(missingAuthResponse.status()).toBe(401)

    // Test authentication with valid credentials (if available)
    const validAuthResponse = await apiContext.post('/api/auth/login', {
      data: {
        username: 'test@example.com',
        password: 'test-password'
      }
    })

    if (validAuthResponse.status() === 200) {
      const authData = await validAuthResponse.json()
      const token = authData.token

      // Test authenticated access
      const authResponse = await apiContext.get('/api/protected', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      expect(authResponse.status()).toBe(200)

      // Test authorization levels
      const adminResponse = await apiContext.get('/api/admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      // Should be 403 if not admin, 200 if admin
      expect([403, 200]).toContain(adminResponse.status())
    }
  })

  test("input validation and sanitization", async () => {
    // Test SQL injection attempts
    const sqlInjectionPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "1' UNION SELECT * FROM users--",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --"
    ]

    for (const payload of sqlInjectionPayloads) {
      const response = await apiContext.post('/api/search', {
        data: { query: payload }
      })
      
      // Should reject malicious input
      expect(response.status()).toBe(400)
      
      const errorData = await response.json()
      expect(errorData.error).toContain('Invalid input')
    }

    // Test XSS attempts
    const xssPayloads = [
      "<script>alert('xss')</script>",
      "javascript:alert('xss')",
      "<img src=x onerror=alert('xss')>",
      "<svg onload=alert('xss')>",
      "';alert('xss');//"
    ]

    for (const payload of xssPayloads) {
      const response = await apiContext.post('/api/message', {
        data: { content: payload }
      })
      
      // Should sanitize or reject XSS attempts
      expect([400, 422]).toContain(response.status())
      
      if (response.status() === 200) {
        const data = await response.json()
        // Content should be sanitized
        expect(data.content).not.toContain('<script>')
        expect(data.content).not.toContain('javascript:')
      }
    }

    // Test path traversal attempts
    const pathTraversalPayloads = [
      "../../../etc/passwd",
      "..\\..\\..\\windows\\system32\\config\\sam",
      "/etc/shadow",
      "....//....//....//etc/passwd"
    ]

    for (const payload of pathTraversalPayloads) {
      const response = await apiContext.get(`/api/file/${encodeURIComponent(payload)}`)
      
      // Should reject path traversal attempts
      expect(response.status()).toBeGreaterThanOrEqual(400)
    }

    // Test command injection attempts
    const commandInjectionPayloads = [
      "; ls -la",
      "| cat /etc/passwd",
      "&& rm -rf /",
      "`whoami`",
      "$(id)"
    ]

    for (const payload of commandInjectionPayloads) {
      const response = await apiContext.post('/api/execute', {
        data: { command: payload }
      })
      
      // Should reject command injection attempts
      expect(response.status()).toBeGreaterThanOrEqual(400)
    }

    // Test NoSQL injection attempts
    const nosqlPayloads = [
      { "$ne": null },
      { "$gt": "" },
      { "$where": "function() { return true }" },
      { "$regex": ".*" }
    ]

    for (const payload of nosqlPayloads) {
      const response = await apiContext.post('/api/query', {
        data: payload
      })
      
      // Should reject NoSQL injection attempts
      expect(response.status()).toBeGreaterThanOrEqual(400)
    }
  })

  test("rate limiting and abuse prevention", async ({ page }) => {
    // Test rate limiting on sensitive endpoints
    const endpoint = '/api/auth/login'
    
    // Make multiple rapid requests
    const responses = []
    for (let i = 0; i < 20; i++) {
      const response = await apiContext.post(endpoint, {
        data: {
          username: 'test@example.com',
          password: 'wrong-password'
        }
      })
      responses.push(response.status())
    }

    // Should eventually be rate limited
    const rateLimitedResponses = responses.filter(status => status === 429)
    expect(rateLimitedResponses.length).toBeGreaterThan(0)

    // Test rate limiting headers
    const rateLimitedResponse = await apiContext.post(endpoint, {
      data: {
        username: 'test@example.com',
        password: 'wrong-password'
      }
    })

    if (rateLimitedResponse.status() === 429) {
      const headers = rateLimitedResponse.headers()
      expect(headers['retry-after'] || headers['x-ratelimit-reset']).toBeTruthy()
    }

    // Test concurrent request limits
    const concurrentRequests = Array.from({ length: 50 }, () =>
      apiContext.get('/api/expensive-operation')
    )

    const concurrentResults = await Promise.allSettled(concurrentRequests)
    const rejectedCount = concurrentResults.filter(result => 
      result.status === 'rejected' || 
      (result.status === 'fulfilled' && result.value.status() >= 400)
    ).length

    // Should reject some concurrent requests
    expect(rejectedCount).toBeGreaterThan(0)
  })

  test("security headers implementation", async ({ page }) => {
    // Test security headers on API responses
    const response = await apiContext.get('/api/health')
    
    const headers = response.headers()
    
    // Check for important security headers
    const expectedHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'strict-transport-security',
      'content-security-policy',
      'referrer-policy'
    ]

    for (const header of expectedHeaders) {
      expect(headers[header]).toBeTruthy()
    }

    // Verify header values
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toMatch(/^(DENY|SAMEORIGIN)/)
    expect(headers['x-xss-protection']).toMatch(/^1; mode=block$/)
    expect(headers['strict-transport-security']).toMatch(/^max-age=/)
    expect(headers['content-security-policy']).toMatch(/default-src/)
  })

  test("CORS configuration", async ({ page }) => {
    // Test CORS preflight requests
    const preflightResponse = await apiContext.fetch('/api/test', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    })

    expect(preflightResponse.status()).toBe(204)

    const corsHeaders = preflightResponse.headers()
    expect(corsHeaders['access-control-allow-origin']).toBeTruthy()
    expect(corsHeaders['access-control-allow-methods']).toBeTruthy()
    expect(corsHeaders['access-control-allow-headers']).toBeTruthy()

    // Test CORS with invalid origin
    const invalidOriginResponse = await apiContext.fetch('/api/test', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://malicious-site.com',
        'Access-Control-Request-Method': 'POST'
      }
    })

    // Should reject invalid origins
    expect(invalidOriginResponse.status()).toBeGreaterThanOrEqual(400)
  })

  test("data exposure and information leakage", async ({ page }) => {
    // Test for sensitive data in responses
    const responses = [
      await apiContext.get('/api/user/profile'),
      await apiContext.get('/api/error'),
      await apiContext.post('/api/auth/login', {
        data: { username: 'invalid', password: 'invalid' }
      })
    ]

    for (const response of responses) {
      const data = await response.json()
      const dataString = JSON.stringify(data)
      
      // Should not expose sensitive information
      expect(dataString).not.toContain('password')
      expect(dataString).not.toContain('secret')
      expect(dataString).not.toContain('token')
      expect(dataString).not.toContain('key')
      expect(dataString).not.toContain('database')
      expect(dataString).not.toContain('internal')
      expect(dataString).not.toContain('stack trace') // unless in development
    }

    // Test error messages don't leak information
    const errorResponse = await apiContext.get('/api/nonexistent-endpoint')
    expect(errorResponse.status()).toBe(404)
    
    const errorData = await errorResponse.json()
    expect(errorData.message).toBeTruthy()
    expect(errorData.stack).toBeUndefined() // Should not expose stack traces
  })

  test("session management security", async ({ page }) => {
    // Test session creation
    const loginResponse = await apiContext.post('/api/auth/login', {
      data: {
        username: 'test@example.com',
        password: 'test-password'
      }
    })

    if (loginResponse.status() === 200) {
      const authData = await loginResponse.json()
      const token = authData.token

      // Test session validation
      const sessionResponse = await apiContext.get('/api/session/validate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      expect(sessionResponse.status()).toBe(200)

      // Test session invalidation
      const logoutResponse = await apiContext.post('/api/auth/logout', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      expect(logoutResponse.status()).toBe(200)

      // Test token reuse after logout
      const reuseResponse = await apiContext.get('/api/protected', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      expect(reuseResponse.status()).toBe(401)
    }
  })

  test("file upload security", async ({ page }) => {
    // Test malicious file upload attempts
    const maliciousFiles = [
      { name: 'malware.exe', mimeType: 'application/octet-stream', content: 'fake malware' },
      { name: 'script.php', mimeType: 'application/x-php', content: '<?php system($_GET["cmd"]); ?>' },
      { name: 'virus.scr', mimeType: 'application/octet-stream', content: 'fake virus' }
    ]

    for (const file of maliciousFiles) {
      const formData = new FormData()
      formData.append('file', new Blob([file.content]), file.name)

      const response = await apiContext.post('/api/upload', {
        data: formData
      })

      // Should reject malicious files
      expect(response.status()).toBeGreaterThanOrEqual(400)
    }

    // Test oversized file upload
    const oversizedContent = 'x'.repeat(100 * 1024 * 1024) // 100MB
    const formData = new FormData()
    formData.append('file', new Blob([oversizedContent]), 'large.txt')

    const oversizedResponse = await apiContext.post('/api/upload', {
      data: formData
    })

    // Should reject oversized files
    expect(oversizedResponse.status()).toBeGreaterThanOrEqual(400)
  })

  test("API endpoint security", async ({ page }) => {
    // Test for exposed sensitive endpoints
    const sensitiveEndpoints = [
      '/api/admin/users',
      '/api/system/config',
      '/api/database/backup',
      '/api/logs/system',
      '/api/keys/private'
    ]

    for (const endpoint of sensitiveEndpoints) {
      const response = await apiContext.get(endpoint)
      
      // Should be protected (401, 403, or 404)
      expect([401, 403, 404]).toContain(response.status())
    }

    // Test for debug endpoints in production
    const debugEndpoints = [
      '/api/debug',
      '/api/test',
      '/api/diagnostics',
      '/api/profiler'
    ]

    for (const endpoint of debugEndpoints) {
      const response = await apiContext.get(endpoint)
      
      // Should not be available in production
      expect([401, 403, 404]).toContain(response.status())
    }
  })

  test("input size and format validation", async ({ page }) => {
    // Test oversized input
    const oversizedInput = 'x'.repeat(10000) // 10KB
    const response = await apiContext.post('/api/message', {
      data: { content: oversizedInput }
    })
    
    // Should reject oversized input
    expect(response.status()).toBeGreaterThanOrEqual(400)

    // Test invalid JSON format
    const invalidJSONResponses = [
      apiContext.post('/api/data', { data: 'invalid json' }),
      apiContext.post('/api/data', { data: '{"incomplete": json' }),
      apiContext.post('/api/data', { data: '{"circular": {}}' })
    ]

    for (const response of invalidJSONResponses) {
      expect(response.status()).toBeGreaterThanOrEqual(400)
    }

    // Test invalid data types
    const invalidTypeResponses = [
      apiContext.post('/api/user', { data: { age: 'not-a-number' } }),
      apiContext.post('/api/user', { data: { email: 'invalid-email' } }),
      apiContext.post('/api/user', { data: { date: 'invalid-date' } })
    ]

    for (const response of invalidTypeResponses) {
      expect(response.status()).toBeGreaterThanOrEqual(400)
    }
  })

  test("API versioning security", async ({ page }) => {
    // Test version header validation
    const versionResponses = [
      apiContext.get('/api/v1/data'),
      apiContext.get('/api/v2/data'),
      apiContext.get('/api/data', { headers: { 'API-Version': 'v1' } }),
      apiContext.get('/api/data', { headers: { 'API-Version': 'invalid' } })
    ]

    for (const response of versionResponses) {
      // Should handle versioning gracefully
      expect(response.status()).toBeLessThan(500)
    }

    // Test deprecated version handling
    const deprecatedResponse = await apiContext.get('/api/v0/legacy')
    if (deprecatedResponse.status() === 200) {
      const headers = deprecatedResponse.headers()
      expect(headers['deprecation'] || headers['sunset']).toBeTruthy()
    }
  })

  test("security monitoring and logging", async ({ page }) => {
    // Test security event logging
    const securityEvents = [
      { endpoint: '/api/auth/login', method: 'POST', data: { username: 'test', password: 'wrong' } },
      { endpoint: '/api/protected', method: 'GET', headers: {} },
      { endpoint: '/api/admin', method: 'GET', headers: { 'Authorization': 'Bearer invalid' } }
    ]

    for (const event of securityEvents) {
      const response = await apiContext.fetch(event.endpoint, {
        method: event.method,
        headers: event.headers || {},
        data: event.data || undefined
      })

      // Security events should be logged (we can't directly test this,
      // but we can ensure the API responds appropriately)
      expect(response.status()).toBeLessThan(500)
    }

    // Test audit trail functionality
    const auditResponse = await apiContext.get('/api/audit/logs')
    if (auditResponse.status() === 200) {
      const logs = await auditResponse.json()
      
      // Should contain security-relevant information
      expect(Array.isArray(logs)).toBe(true)
      
      if (logs.length > 0) {
        const log = logs[0]
        expect(log.timestamp).toBeTruthy()
        expect(log.action).toBeTruthy()
        expect(log.ip).toBeTruthy() // Should log IP addresses
      }
    }
  })
})
