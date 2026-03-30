# Testing Guide

## Overview

Kilo Code uses a comprehensive test suite to ensure reliability across all platforms. Tests are run on both Windows and Linux CI runners.

## Running Tests

### From Repository Root

```bash
# Run all unit tests
bun run test:unit

# Run linting
bun run lint

# Run typecheck
bun run typecheck

# Run full test suite (lint + typecheck + unit tests)
bun run test
```

### Package-Specific Tests

```bash
# Run tests for a specific package
bun --cwd packages/opencode test
bun --cwd packages/kilo-vscode test:unit
bun --cwd packages/app test:unit
bun --cwd packages/kilo-telemetry test
```

### Single Test File

```bash
# Run a specific test file
bun test test/tool/tool.test.ts
```

## Platform-Specific Considerations

### Windows

On Windows, some tests may exhibit platform-specific behavior:

#### Git Line Endings (CRLF vs LF)

Windows uses CRLF (`\r\n`) line endings while Unix uses LF (`\n`). Some tests involving git operations may fail if not properly configured.

**Symptoms:**

```
error: expect(received).toBe(expected)
  "two\r\n"
- Expected  + 0
+ Received  + 0
```

**Solutions:**

1. **Configure git autocrlf** before running tests:

   ```bash
   git config --global core.autocrlf input
   ```

2. **Use .gitattributes** - The repository includes `.gitattributes` that normalizes line endings. Ensure it's properly configured.

3. **Run tests in a clean checkout** - Clone fresh to avoid line ending issues.

#### Unix Shell Commands

Some tests assume Unix shell utilities (`/bin/bash`, `pwd`, `echo`). On Windows, these may not be available.

**Symptoms:**

```
ENOENT: no such file or directory, uv_spawn '/bin/bash'
```

**Solutions:**

1. **Use Git Bash or WSL** - Run tests in a Unix-like environment:

   ```bash
   # Using Git Bash
   git bash -c "bun run test:unit"

   # Using WSL
   wsl bun run test:unit
   ```

2. **Use Windows-specific test runner** - The CI workflow handles this automatically by installing Git Bash on Windows runners.

### Linux

Linux is the primary development platform. All tests should pass on Linux runners.

## Filtering Test Output

### Windows (findstr)

```bash
# Show only passing tests
bun run test:unit 2>&1 | findstr /C:"(pass)"

# Show only failing tests
bun run test:unit 2>&1 | findstr /C:"(fail)"

# Show test summary
bun run test:unit 2>&1 | findstr /C:"Test Suites:" /C:"Tests:"

# Show specific test names
bun run test:unit 2>&1 | findstr /C:"pass" /C:"fail"
```

### Linux (grep)

```bash
# Show only passing tests
bun run test:unit 2>&1 | grep "(pass)"

# Show only failing tests
bun run test:unit 2>&1 | grep "(fail)"

# Show test summary
bun run test:unit 2>&1 | grep -E "(Test Suites|Tests:)"

# Show specific test names
bun run test:unit 2>&1 | grep -E "(pass|fail)"
```

## Test Coverage

The test suite covers:

| Category          | Packages                                   | Coverage                    |
| ----------------- | ------------------------------------------ | --------------------------- |
| Unit Tests        | opencode, kilo-vscode, app, kilo-telemetry | Core logic                  |
| Integration Tests | kilo-vscode                                | Git operations, file system |
| i18n Tests        | All packages                               | Translation completeness    |
| Type Tests        | All packages                               | TypeScript strict mode      |

## CI Pipeline

Tests run automatically on:

| Platform | Runner                        | Purpose               |
| -------- | ----------------------------- | --------------------- |
| Linux    | blacksmith-4vcpu-ubuntu-2404  | Primary test platform |
| Windows  | blacksmith-4vcpu-windows-2025 | Windows compatibility |

See `.github/workflows/test.yml` for the CI configuration.

## Known Issues

### Windows-Specific Failures

The following tests may fail on Windows due to platform differences:

1. **Git patch application tests** - Line ending differences
2. **Shell environment tests** - Unix commands not available

These failures do **not** indicate code defects and are expected on Windows. They pass on Linux CI runners.

## Writing Tests

### Guidelines

1. **Avoid mocks** - Tests should test actual implementation
2. **Platform-aware** - Use `path.join` instead of hardcoded paths
3. **Cross-platform assertions** - Consider line ending differences in string comparisons
4. **Unix command fallback** - Check for Unix commands before assuming availability

### Example: Platform-Aware Test

```typescript
import { describe, it, expect } from "bun:test"
import path from "path"

describe("platform-aware test", () => {
  it("handles paths correctly", () => {
    const filePath = path.join("some", "directory", "file.txt")
    expect(filePath).toMatch(/\//) // Unix-style on Unix
    // Or normalize for comparison:
    expect(filePath.replace(/\\/g, "/")).toBe("some/directory/file.txt")
  })
})
```

## Debugging Failed Tests

### Locally

```bash
# Run with verbose output
bun test --reporter=verbose

# Run specific test file with watch
bun test --watch test/tool/tool.test.ts

# Generate coverage report
bun test --coverage
```

### On CI

1. Download the test artifacts from the failed workflow run
2. Check `test-results/` for detailed output
3. Review `playwright-report/` for E2E test screenshots

## Test Maintenance

When adding new tests:

1. Ensure tests pass on Linux
2. Verify no platform-specific assumptions (or mark as skip on Windows)
3. Update this guide if new platform-specific behavior is discovered
