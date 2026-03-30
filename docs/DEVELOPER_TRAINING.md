# Kilo Code Developer Training Guide

## Welcome to Kilo Code Testing Framework

This guide will help you get started with the comprehensive testing framework for the Kilo Code project. You'll learn how to run tests, write new tests, and contribute to the testing ecosystem.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding the Test Structure](#understanding-the-test-structure)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Debugging Tests](#debugging-tests)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Contributing to Tests](#contributing-to-tests)

## Quick Start

### Prerequisites

Before you start, make sure you have:
- Node.js 20+ installed
- Bun package manager installed
- Git installed
- VS Code (recommended)

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Kilo-Org/kilocode.git
   cd kilocode
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Install Playwright browsers**:
   ```bash
   bunx playwright install
   ```

4. **Run your first test**:
   ```bash
   bun run test:governance --grep "coding standards" --reporter=list
   ```

5. **View test results**:
   ```bash
   open test-results/html/index.html
   ```

## Understanding the Test Structure

### Test Categories Overview

The Kilo Code testing framework is organized into **10 categories**:

| Category | Purpose | Test Count | Location |
|----------|---------|------------|----------|
| Governance | Policies, merge enforcement, release automation | 42 | `tests/governance/` |
| Migration | Data migration, schema evolution | 9 | `tests/migration/` |
| Performance | Performance optimization, benchmarks | 13 | `tests/performance/` |
| Resilience | Fault tolerance, self-healing | 8 | `tests/resilience/` |
| Scalability | Load testing, capacity planning | 7 | `tests/scalability/` |
| Disaster Recovery | Backup, restore, business continuity | 10 | `tests/disaster-recovery/` |
| Security | Security controls, vulnerability scanning | 12 | `tests/security/` |
| CI/CD | Pipeline validation, automation | 15 | `tests/cicd/` |
| Deployment | Deployment procedures, environment config | 12 | `tests/deployment/` |
| Release | Release pipelines, version management | 12 | `tests/release/` |

### Test File Structure

Each test file follows this structure:

```typescript
import { test, expect } from "@playwright/test"
import { execSync } from "child_process"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

test.describe("Test Category Name", () => {
  // Setup and teardown
  test.beforeAll(async () => {
    // Runs once before all tests in this describe block
  })

  test.beforeEach(async () => {
    // Runs before each test
  })

  // Test cases
  test("specific test case", async () => {
    // Test implementation
    expect(result).toBe(expected)
  })

  test("another test case", async ({ page }) => {
    // Test with page fixture
    await page.goto('/')
    expect(await page.title()).toContain('Kilo Code')
  })

  test.afterEach(async () => {
    // Runs after each test
  })

  test.afterAll(async () => {
    // Runs once after all tests in this describe block
  })
})
```

## Running Tests

### Basic Test Commands

#### Run All Tests
```bash
bun run test:playwright
```

#### Run Specific Categories
```bash
# Governance tests
bun run test:governance

# Performance tests
bun run test:performance

# Security tests
bun run test:security
```

#### Run Specific Tests
```bash
# Run specific test file
bunx playwright test tests/governance/governance-policies.spec.ts

# Run tests matching a pattern
bunx playwright test --grep "coding standards"

# Run tests in a specific project
bunx playwright test --project=governance-tests
```

### Test Options

#### Reporters
```bash
# HTML report (default)
bunx playwright test --reporter=html

# JSON report
bunx playwright test --reporter=json

# JUnit report
bunx playwright test --reporter=junit

# List reporter (simple output)
bunx playwright test --reporter=list
```

#### Debug Options
```bash
# Run in headed mode (show browser)
bunx playwright test --headed

# Run with trace
bunx playwright test --trace on

# Take screenshots on failure
bunx playwright test --screenshot=only-on-failure

# Run in debug mode
bunx playwright test --debug
```

#### Filtering
```bash
# Run tests matching a pattern
bunx playwright test --grep "pattern"

# Run tests in specific files
bunx playwright test tests/governance/*.spec.ts

# Run tests excluding a pattern
bunx playwright test --grep "pattern" --grepInvert "exclude"
```

### Test Results

After running tests, you'll find results in:

- `test-results/html/index.html` - Interactive HTML report
- `test-results/results.json` - Machine-readable JSON results
- `test-results/results.xml` - JUnit XML results
- `test-results/trace/` - Trace files for debugging

## Writing Tests

### Test Writing Guidelines

#### 1. Choose the Right Category

Before writing a test, determine which category it belongs to:

- **Governance**: Coding standards, policies, compliance
- **Performance**: Speed, memory, resource usage
- **Security**: Vulnerabilities, access controls
- **Migration**: Data migration, version compatibility
- **Resilience**: Fault tolerance, recovery
- **Scalability**: Load handling, capacity
- **Disaster Recovery**: Backup, restore procedures
- **CI/CD**: Pipeline validation, automation
- **Deployment**: Deployment procedures
- **Release**: Release automation, versioning

#### 2. Follow Naming Conventions

```typescript
// Good: descriptive and clear
test("coding standards validation for TypeScript files", async () => {
  // Test implementation
})

// Bad: vague and unclear
test("test1", async () => {
  // Test implementation
})
```

#### 3. Use Proper Test Structure

```typescript
test.describe("File Processing", () => {
  test("should process valid JSON files", async () => {
    // Arrange
    const validJson = '{"name": "test", "value": 123}'
    
    // Act
    const result = processJson(validJson)
    
    // Assert
    expect(result.success).toBe(true)
    expect(result.data.name).toBe("test")
  })

  test("should reject invalid JSON files", async () => {
    // Arrange
    const invalidJson = '{"name": "test", "value":}'
    
    // Act & Assert
    expect(() => processJson(invalidJson)).toThrow()
  })
})
```

#### 4. Use Appropriate Assertions

```typescript
// Good: specific assertions
expect(result.status).toBe(200)
expect(response.data).toHaveProperty('id')
expect(array.length).toBeGreaterThan(0)

// Bad: generic assertions
expect(result).toBeTruthy()
expect(response).toBeDefined()
```

#### 5. Handle Async Operations

```typescript
test("should handle async operations correctly", async () => {
  // Good: proper async handling
  const result = await fetchData()
  expect(result).toBeDefined()
  
  // Bad: not waiting for async operations
  const promise = fetchData()
  expect(promise).toBeDefined() // This will always pass
})
```

### Test Examples

#### Example 1: File System Test
```typescript
test("should read configuration file correctly", async () => {
  const configPath = join(workspaceRoot, 'config.json')
  
  // Check if file exists
  expect(existsSync(configPath)).toBe(true)
  
  // Read and validate content
  const config = JSON.parse(readFileSync(configPath, 'utf8'))
  expect(config).toHaveProperty('version')
  expect(config.version).toMatch(/^\d+\.\d+\.\d+$/)
})
```

#### Example 2: Process Execution Test
```typescript
test("should execute build command successfully", async () => {
  // Execute build command
  const result = execSync('bun run build', { 
    encoding: 'utf8',
    cwd: workspaceRoot 
  })
  
  // Validate build output
  expect(result).toContain('Build completed')
  expect(result).not.toContain('error')
})
```

#### Example 3: API Test
```typescript
test("should handle API requests correctly", async ({ request }) => {
  // Make API request
  const response = await request.get('/api/users')
  
  // Validate response
  expect(response.status()).toBe(200)
  
  const data = await response.json()
  expect(Array.isArray(data)).toBe(true)
  expect(data.length).toBeGreaterThan(0)
})
```

#### Example 4: Browser Test
```typescript
test("should render login page correctly", async ({ page }) => {
  // Navigate to page
  await page.goto('/login')
  
  // Check page title
  expect(await page.title()).toContain('Login')
  
  // Check form elements
  const usernameInput = page.locator('input[name="username"]')
  const passwordInput = page.locator('input[name="password"]')
  const submitButton = page.locator('button[type="submit"]')
  
  expect(await usernameInput.isVisible()).toBe(true)
  expect(await passwordInput.isVisible()).toBe(true)
  expect(await submitButton.isVisible()).toBe(true)
})
```

### Test Data Management

#### Using Fixtures
```typescript
// Create test data fixtures
const testUsers = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
]

test("should validate user data", async () => {
  for (const user of testUsers) {
    expect(user.id).toBeGreaterThan(0)
    expect(user.email).toMatch(/@.*\./)
  }
})
```

#### Mocking External Dependencies
```typescript
test("should handle external API failure", async ({ page }) => {
  // Mock API failure
  await page.route('/api/users', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' })
    })
  })
  
  // Test error handling
  await page.goto('/users')
  const errorMessage = page.locator('.error-message')
  expect(await errorMessage.isVisible()).toBe(true)
})
```

## Debugging Tests

### Debugging Techniques

#### 1. Use Debug Mode
```bash
bunx playwright test --debug
```

#### 2. Use Headed Mode
```bash
bunx playwright test --headed
```

#### 3. Add Console Logs
```typescript
test("should process data correctly", async () => {
  const data = { name: 'test', value: 123 }
  console.log('Input data:', data)
  
  const result = processData(data)
  console.log('Result:', result)
  
  expect(result.success).toBe(true)
})
```

#### 4. Use Breakpoints
```typescript
test("should handle complex logic", async () => {
  const data = getInputData()
  
  // Add breakpoint here in VS Code
  const processed = processComplexData(data)
  
  expect(processed).toBeDefined()
})
```

#### 5. Generate Trace Files
```bash
bunx playwright test --trace on
```

Then view the trace:
```bash
bunx playwright show-trace test-results/trace/trace.zip
```

### Common Debugging Scenarios

#### Test Timeout Issues
```typescript
test("should handle slow operations", async () => {
  // Increase timeout for this specific test
  test.setTimeout(60000) // 60 seconds
  
  const result = await slowOperation()
  expect(result).toBeDefined()
})
```

#### Flaky Tests
```typescript
test("should handle race conditions", async () => {
  // Use proper waiting
  await page.waitForSelector('.loaded')
  
  const element = page.locator('.dynamic-content')
  expect(await element.isVisible()).toBe(true)
})
```

#### Memory Leaks
```typescript
test("should clean up resources properly", async () => {
  const resource = createResource()
  
  try {
    // Test logic
    expect(resource.isValid()).toBe(true)
  } finally {
    // Always cleanup
    resource.cleanup()
  }
})
```

## Best Practices

### 1. Test Organization

- **Logical grouping**: Group related tests together
- **Clear naming**: Use descriptive test names
- **Proper structure**: Follow the standard test structure
- **Documentation**: Add comments for complex logic

### 2. Test Independence

- **No dependencies**: Tests should not depend on each other
- **Isolation**: Each test should run in isolation
- **Cleanup**: Clean up test data and state
- **Deterministic**: Tests should produce consistent results

### 3. Test Coverage

- **Edge cases**: Test edge cases and error conditions
- **Happy paths**: Test normal operation scenarios
- **Error handling**: Test error handling and recovery
- **Performance**: Test performance characteristics

### 4. Test Maintenance

- **Regular updates**: Keep tests updated with code changes
- **Refactoring**: Refactor tests for clarity and maintainability
- **Documentation**: Keep documentation up to date
- **Monitoring**: Monitor test health and performance

### 5. Security Considerations

- **No sensitive data**: Avoid using sensitive test data
- **Test credentials**: Use test-specific credentials
- **Environment isolation**: Use isolated test environments
- **Data cleanup**: Clean up test data properly

## Troubleshooting

### Common Issues and Solutions

#### 1. Installation Issues

**Problem**: Playwright browsers not installed
```bash
Error: Executable doesn't exist
```

**Solution**:
```bash
bunx playwright install
```

#### 2. Test Timeouts

**Problem**: Tests timing out
```bash
Error: Test timeout of 30000ms exceeded
```

**Solution**:
```typescript
test.setTimeout(60000) // Increase timeout
```

#### 3. Browser Issues

**Problem**: Browser not launching
```bash
Error: Browser failed to launch
```

**Solution**:
```bash
# Reinstall browsers
bunx playwright install --force

# Check system requirements
bunx playwright install-deps
```

#### 4. Environment Issues

**Problem**: Tests failing in CI but not locally
```bash
Error: File not found
```

**Solution**:
```typescript
// Use absolute paths
const filePath = join(process.cwd(), 'config.json')
```

#### 5. Memory Issues

**Problem**: Tests running out of memory
```bash
Error: JavaScript heap out of memory
```

**Solution**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" bunx playwright test
```

### Getting Help

1. **Check documentation**: Read the [Testing Framework Documentation](./TESTING_FRAMEWORK.md)
2. **Search issues**: Look for similar issues in GitHub
3. **Ask for help**: Reach out to the team on Discord
4. **Create issue**: Create a GitHub issue if needed

## Contributing to Tests

### Adding New Tests

1. **Choose category**: Select appropriate test category
2. **Create test file**: Create new test file in correct directory
3. **Write tests**: Follow test writing guidelines
4. **Run tests**: Ensure tests pass
5. **Add documentation**: Update documentation if needed

### Example: Adding a New Test

```typescript
// tests/governance/new-feature.spec.ts
import { test, expect } from "@playwright/test"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

test.describe("New Feature Governance", () => {
  test("should validate new feature configuration", async () => {
    const configPath = join(process.cwd(), 'config', 'new-feature.json')
    
    // Check if config exists
    expect(existsSync(configPath)).toBe(true)
    
    // Validate config structure
    const config = JSON.parse(readFileSync(configPath, 'utf8'))
    expect(config).toHaveProperty('enabled')
    expect(config).toHaveProperty('version')
    expect(config.version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  test("should enforce new feature policies", async () => {
    // Test policy enforcement
    const policyResult = checkNewFeaturePolicy()
    expect(policyResult.compliant).toBe(true)
    expect(policyResult.violations).toHaveLength(0)
  })
})
```

### Test Review Process

1. **Self-review**: Review your own tests
2. **Peer review**: Get review from team members
3. **Automated checks**: Ensure CI/CD checks pass
4. **Documentation**: Update documentation
5. **Merge**: Merge after approval

### Test Maintenance

1. **Regular updates**: Keep tests updated
2. **Performance monitoring**: Monitor test performance
3. **Failure analysis**: Analyze test failures
4. **Improvement planning**: Plan improvements

## Resources

### Documentation
- [Playwright Documentation](https://playwright.dev/)
- [Testing Framework Documentation](./TESTING_FRAMEWORK.md)
- [Best Practices Guide](./BEST_PRACTICES.md)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [Playwright VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
- [Bun](https://bun.sh/)

### Community
- [GitHub Issues](https://github.com/Kilo-Org/kilocode/issues)
- [Discord Community](https://discord.gg/kilocode)
- [Team Chat](https://chat.kilocode.ai)

## Next Steps

1. **Run the tests**: Try running different test categories
2. **Write a test**: Write your first test
3. **Contribute**: Add tests for new features
4. **Learn more**: Read additional documentation

Happy testing! 🚀

---

## Quick Reference

### Essential Commands
```bash
# Install dependencies
bun install

# Install browsers
bunx playwright install

# Run all tests
bun run test:playwright

# Run specific category
bun run test:governance

# Run with debug
bunx playwright test --debug

# View results
open test-results/html/index.html
```

### Test Structure Template
```typescript
import { test, expect } from "@playwright/test"

test.describe("Feature Name", () => {
  test("should do something", async () => {
    // Test implementation
    expect(result).toBe(expected)
  })
})
```

### Common Assertions
```typescript
expect(value).toBe(expected)
expect(value).toEqual(expected)
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeGreaterThan(0)
expect(value).toHaveProperty('key')
expect(array).toHaveLength(5)
expect(string).toMatch(/pattern/)
```
