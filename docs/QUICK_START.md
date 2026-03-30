# Kilo Code Testing Framework - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 20+ installed
- Bun package manager installed
- Git installed

### Step 1: Setup
```bash
# Clone the repository
git clone https://github.com/Kilo-Org/kilocode.git
cd kilocode

# Install dependencies
bun install

# Install Playwright browsers
bunx playwright install
```

### Step 2: Run Your First Test
```bash
# Run governance tests
bun run test:governance --reporter=list

# View results
open test-results/html/index.html
```

### Step 3: Explore Test Categories
```bash
# Try different test categories
bun run test:performance    # Performance tests
bun run test:security       # Security tests
bun run test:migration      # Migration tests
bun run test:resilience     # Resilience tests
```

## 📊 Test Categories Overview

| Category | Command | Purpose |
|----------|---------|---------|
| **Governance** | `bun run test:governance` | Policies, merge enforcement, quality |
| **Performance** | `bun run test:performance` | Speed, memory, benchmarks |
| **Security** | `bun run test:security` | Vulnerabilities, access controls |
| **Migration** | `bun run test:migration` | Data migration, version compatibility |
| **Resilience** | `bun run test:resilience` | Fault tolerance, recovery |
| **Scalability** | `bun run test:scalability` | Load testing, capacity |
| **Disaster Recovery** | `bun run test:disaster-recovery` | Backup, restore procedures |
| **CI/CD** | `bun run test:cicd` | Pipeline validation, automation |
| **Deployment** | `bun run test:deployment` | Deployment procedures |
| **Release** | `bun run test:release` | Release automation, versioning |

## 🧪 Common Test Commands

### Run Tests
```bash
# Run all tests
bun run test:playwright

# Run specific category
bun run test:governance

# Run specific test file
bunx playwright test tests/governance/governance-policies.spec.ts

# Run tests matching pattern
bunx playwright test --grep "coding standards"
```

### Debug Tests
```bash
# Run in debug mode
bunx playwright test --debug

# Run with browser visible
bunx playwright test --headed

# Generate trace files
bunx playwright test --trace on
```

### Test Reports
```bash
# HTML report (default)
bunx playwright test --reporter=html

# JSON report
bunx playwright test --reporter=json

# JUnit report
bunx playwright test --reporter=junit

# Simple list output
bunx playwright test --reporter=list
```

## 📁 Test Structure

```
tests/
├── governance/           # 42 tests - Policies, quality, compliance
├── migration/           # 9 tests  - Data migration, versioning
├── performance/         # 13 tests - Performance, benchmarks
├── resilience/          # 8 tests  - Fault tolerance, recovery
├── scalability/         # 7 tests  - Load testing, capacity
├── disaster-recovery/   # 10 tests - Backup, restore
├── security/            # 12 tests - Security, vulnerabilities
├── cicd/               # 15 tests - CI/CD, automation
├── deployment/         # 12 tests - Deployment procedures
└── release/            # 12 tests - Release automation
```

## 🎯 Writing Your First Test

### Basic Test Structure
```typescript
import { test, expect } from "@playwright/test"

test.describe("My Feature", () => {
  test("should work correctly", async () => {
    // Arrange
    const input = "test data"
    
    // Act
    const result = processInput(input)
    
    // Assert
    expect(result.success).toBe(true)
  })
})
```

### File System Test Example
```typescript
import { test, expect } from "@playwright/test"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

test("should read configuration file", async () => {
  const configPath = join(process.cwd(), 'package.json')
  
  expect(existsSync(configPath)).toBe(true)
  
  const packageJson = JSON.parse(readFileSync(configPath, 'utf8'))
  expect(packageJson).toHaveProperty('name')
  expect(packageJson.name).toBe('@kilocode/kilo')
})
```

### API Test Example
```typescript
import { test, expect } from "@playwright/test"

test("should handle API requests", async ({ request }) => {
  const response = await request.get('/api/health')
  
  expect(response.status()).toBe(200)
  
  const data = await response.json()
  expect(data.status).toBe('healthy')
})
```

## 🔧 Development Workflow

### 1. Make Changes
```bash
# Edit your code
vim src/my-feature.ts
```

### 2. Run Relevant Tests
```bash
# Run tests for your feature
bun run test:governance --grep "my feature"
```

### 3. Debug if Needed
```bash
# Debug failing tests
bunx playwright test --debug --grep "failing test"
```

### 4. Run Full Test Suite
```bash
# Run all tests before committing
bun run test:playwright
```

### 5. Commit Changes
```bash
git add .
git commit -m "Add my feature with tests"
git push
```

## 🚨 Common Issues & Solutions

### Issue: Tests Timeout
```bash
Error: Test timeout of 30000ms exceeded
```
**Solution**: Increase timeout or optimize test
```typescript
test.setTimeout(60000) // 60 seconds
```

### Issue: Browser Not Found
```bash
Error: Executable doesn't exist
```
**Solution**: Reinstall browsers
```bash
bunx playwright install --force
```

### Issue: Tests Fail in CI
```bash
Error: File not found
```
**Solution**: Use absolute paths
```typescript
const filePath = join(process.cwd(), 'config.json')
```

## 📈 Test Results

### Viewing Results
```bash
# Open HTML report
open test-results/html/index.html

# View JSON results
cat test-results/results.json

# View JUnit results
cat test-results/results.xml
```

### Understanding Results
- **✅ Passed**: Test succeeded
- **❌ Failed**: Test failed with error
- **⏱️ Skipped**: Test was skipped
- **🔄 Retried**: Test failed and was retried

## 🎯 Next Steps

### Learn More
- Read the [Testing Framework Documentation](./TESTING_FRAMEWORK.md)
- Check the [Developer Training Guide](./DEVELOPER_TRAINING.md)
- Explore [Best Practices](./BEST_PRACTICES.md)

### Contribute
- Add tests for new features
- Improve existing tests
- Fix failing tests
- Share feedback

### Get Help
- Check GitHub Issues
- Join Discord Community
- Ask the team

## 🎉 You're Ready!

You now have:
- ✅ Environment set up
- ✅ Tests running
- ✅ Basic understanding of the framework
- ✅ Resources to learn more

**Happy testing! 🚀**

---

## 📚 Quick Reference

### Essential Commands
```bash
# Setup
bun install && bunx playwright install

# Run tests
bun run test:playwright
bun run test:governance
bun run test:performance
bun run test:security

# Debug
bunx playwright test --debug
bunx playwright test --headed

# Results
open test-results/html/index.html
```

### Test Template
```typescript
import { test, expect } from "@playwright/test"

test.describe("Feature", () => {
  test("should work", async () => {
    expect(true).toBe(true)
  })
})
```

### Common Assertions
```typescript
expect(value).toBe(expected)
expect(value).toBeTruthy()
expect(value).toHaveProperty('key')
expect(array).toHaveLength(5)
expect(string).toMatch(/pattern/)
```

### Test Categories
- **Governance**: Policies, quality, compliance
- **Performance**: Speed, memory, benchmarks
- **Security**: Vulnerabilities, access controls
- **Migration**: Data migration, versioning
- **Resilience**: Fault tolerance, recovery
- **Scalability**: Load testing, capacity
- **Disaster Recovery**: Backup, restore
- **CI/CD**: Pipeline validation, automation
- **Deployment**: Deployment procedures
- **Release**: Release automation, versioning

---

**Need help?** Check the [full documentation](./TESTING_FRAMEWORK.md) or ask the team! 🤝
