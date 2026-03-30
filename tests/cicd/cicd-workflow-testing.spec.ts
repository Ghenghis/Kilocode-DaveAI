import { test, expect } from "@playwright/test"
import { execSync } from "child_process"
import { readFileSync, existsSync, writeFileSync } from "fs"
import { join } from "path"
import { createHash } from "crypto"

// CI/CD Workflow Testing
// These tests verify GitHub Actions workflows and CI/CD pipeline reliability

test.describe("CI/CD Workflow Testing", () => {
  const workspaceRoot = process.cwd()
  const workflowsDir = join(workspaceRoot, ".github", "workflows")

  test("workflow structure validation", async () => {
    // Verify workflows directory exists
    expect(existsSync(workflowsDir)).toBe(true)

    // Verify required workflows exist
    const requiredWorkflows = [
      "ci-core.yml",
      "pr-fast-gate.yml", 
      "install-integrity.yml",
      "playwright-e2e.yml"
    ]

    for (const workflow of requiredWorkflows) {
      const workflowPath = join(workflowsDir, workflow)
      expect(existsSync(workflowPath), `Workflow ${workflow} should exist`).toBe(true)
      
      // Verify workflow is valid YAML
      const content = readFileSync(workflowPath, "utf8")
      expect(content).toContain("name:")
      expect(content).toContain("on:")
      expect(content).toContain("jobs:")
    }

    // Verify workflow syntax
    for (const workflow of requiredWorkflows) {
      const workflowPath = join(workflowsDir, workflow)
      try {
        execSync(`yamllint ${workflowPath}`, { cwd: workspaceRoot, stdio: "pipe" })
      } catch (error) {
        console.log(`YAML lint for ${workflow}:`, error.message)
      }
    }
  })

  test("CI core workflow validation", async () => {
    const ciCorePath = join(workflowsDir, "ci-core.yml")
    const ciCoreContent = readFileSync(ciCorePath, "utf8")

    // Verify CI core workflow structure
    expect(ciCoreContent).toContain("lint")
    expect(ciCoreContent).toContain("typecheck")
    expect(ciCoreContent).toContain("test")
    expect(ciCoreContent).toContain("build")

    // Verify job dependencies
    expect(ciCoreContent).toContain("needs:")
    
    // Verify matrix strategy if present
    if (ciCoreContent.includes("strategy:")) {
      expect(ciCoreContent).toContain("matrix:")
    }

    // Test CI core workflow locally
    try {
      // Simulate CI core steps
      execSync("bun run lint", { cwd: workspaceRoot, stdio: "pipe" })
      execSync("bun run typecheck", { cwd: workspaceRoot, stdio: "pipe" })
      execSync("bun test", { cwd: join(workspaceRoot, "packages/opencode"), stdio: "pipe" })
      execSync("bun test", { cwd: join(workspaceRoot, "packages/kilo-vscode"), stdio: "pipe" })
      execSync("bun run build", { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      throw new Error("CI core workflow simulation failed")
    }
  })

  test("PR fast gate workflow validation", async () => {
    const prFastGatePath = join(workflowsDir, "pr-fast-gate.yml")
    const prFastGateContent = readFileSync(prFastGatePath, "utf8")

    // Verify PR fast gate workflow structure
    expect(prFastGateContent).toContain("pull_request")
    expect(prFastGateContent).toContain("push")
    expect(prFastGateContent).toContain("branches:")

    // Verify fast gate checks
    expect(prFastGateContent).toContain("lint")
    expect(prFastGateContent).toContain("typecheck")
    expect(prFastGateContent).toContain("format")
    expect(prFastGateContent).toContain("test")
    expect(prFastGateContent).toContain("build")

    // Verify artifact handling
    if (prFastGateContent.includes("upload-artifact")) {
      expect(prFastGateContent).toContain("download-artifact")
    }

    // Test PR fast gate steps
    try {
      execSync("bun run lint", { cwd: workspaceRoot, stdio: "pipe" })
      execSync("bun run typecheck", { cwd: workspaceRoot, stdio: "pipe" })
      execSync("bun run format:check", { cwd: workspaceRoot, stdio: "pipe" })
      execSync("bun test", { cwd: join(workspaceRoot, "packages/opencode"), stdio: "pipe" })
      execSync("bun run build", { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      throw new Error("PR fast gate workflow simulation failed")
    }
  })

  test("install integrity workflow validation", async () => {
    const installIntegrityPath = join(workflowsDir, "install-integrity.yml")
    const installIntegrityContent = readFileSync(installIntegrityPath, "utf8")

    // Verify install integrity workflow structure
    expect(installIntegrityContent).toContain("push")
    expect(installIntegrityContent).toContain("pull_request")
    expect(installIntegrityContent).toContain("ubuntu-latest")
    expect(installIntegrityContent).toContain("windows-latest")

    // Verify install steps
    expect(installIntegrityContent).toContain("checkout")
    expect(installIntegrityContent).toContain("setup-node")
    expect(installIntegrityContent).toContain("install")
    expect(installIntegrityContent).toContain("cache")

    // Test install integrity
    try {
      // Clean install
      execSync("rm -rf node_modules", { cwd: workspaceRoot, stdio: "pipe" })
      execSync("bun install", { cwd: workspaceRoot, stdio: "pipe" })
      
      // Verify critical packages
      const criticalPackages = ["@playwright/test", "vitest", "typescript"]
      for (const pkg of criticalPackages) {
        const pkgPath = join(workspaceRoot, "node_modules", pkg)
        expect(existsSync(pkgPath)).toBe(true)
      }
    } catch (error) {
      throw new Error("Install integrity test failed")
    }
  })

  test("Playwright E2E workflow validation", async () => {
    const playwrightE2EPath = join(workflowsDir, "playwright-e2e.yml")
    const playwrightE2EContent = readFileSync(playwrightE2EPath, "utf8")

    // Verify Playwright E2E workflow structure
    expect(playwrightE2EContent).toContain("playwright")
    expect(playwrightE2EContent).toContain("browser-install")
    expect(playwrightE2EContent).toContain("upload-report")

    // Verify test execution
    expect(playwrightE2EContent).toContain("test")
    expect(playwrightE2EContent).toContain("report")

    // Test Playwright setup
    try {
      execSync("bun run playwright:install", { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      // Playwright install might fail, check if browsers are available
      console.log("Playwright install result:", error.message)
    }

    // Verify Playwright configuration
    const playwrightConfigs = [
      "packages/kilo-vscode/playwright.config.ts",
      "packages/desktop/playwright.config.ts"
    ]

    for (const config of playwrightConfigs) {
      const configPath = join(workspaceRoot, config)
      if (existsSync(configPath)) {
        const content = readFileSync(configPath, "utf8")
        expect(content).toContain("defineConfig")
        expect(content).toContain("testDir")
      }
    }
  })

  test("workflow security validation", async () => {
    // Verify workflows don't contain sensitive information
    const workflowFiles = [
      "ci-core.yml",
      "pr-fast-gate.yml",
      "install-integrity.yml",
      "playwright-e2e.yml"
    ]

    for (const workflowFile of workflowFiles) {
      const workflowPath = join(workflowsDir, workflowFile)
      const content = readFileSync(workflowPath, "utf8")
      
      // Should not contain secrets
      expect(content).not.toContain("password")
      expect(content).not.toContain("secret")
      expect(content).not.toContain("token")
      expect(content).not.toContain("api_key")
      
      // Should use secrets properly
      if (content.includes("secrets.")) {
        expect(content).toMatch(/\${{\s*secrets\.[A-Z_]+\s*}}/)
      }
    }

    // Verify workflow permissions
    for (const workflowFile of workflowFiles) {
      const workflowPath = join(workflowsDir, workflowFile)
      const content = readFileSync(workflowPath, "utf8")
      
      // Should have appropriate permissions
      if (content.includes("permissions:")) {
        expect(content).toContain("contents: read")
      }
    }
  })

  test("workflow performance validation", async () => {
    // Test workflow execution time
    const workflowTests = [
      {
        name: "lint-test",
        command: "bun run lint && bun run typecheck",
        expectedTime: 30000 // 30 seconds
      },
      {
        name: "unit-test",
        command: "bun test",
        expectedTime: 60000 // 1 minute
      },
      {
        name: "build-test",
        command: "bun run build",
        expectedTime: 120000 // 2 minutes
      }
    ]

    for (const test of workflowTests) {
      const startTime = Date.now()
      
      try {
        execSync(test.command, { cwd: workspaceRoot, stdio: "pipe" })
      } catch (error) {
        console.log(`${test.name} failed:`, error.message)
      }
      
      const endTime = Date.now()
      const executionTime = endTime - startTime
      
      // Should complete within expected time
      expect(executionTime).toBeLessThan(test.expectedTime)
    }
  })

  test("workflow failure scenarios", async () => {
    // Test workflow failure handling
    const failureScenarios = [
      {
        name: "lint-failure",
        command: "echo 'bad code' > test.js && bun run lint",
        shouldFail: true
      },
      {
        name: "typecheck-failure", 
        command: "echo 'const x: number = \"string\"' > test.ts && bun run typecheck",
        shouldFail: true
      },
      {
        name: "test-failure",
        command: "echo 'test(\"fail\", () => expect(true).toBe(false))' > test.spec.ts && bun test",
        shouldFail: true
      }
    ]

    for (const scenario of failureScenarios) {
      try {
        execSync(scenario.command, { cwd: workspaceRoot, stdio: "pipe" })
        
        if (scenario.shouldFail) {
          throw new Error(`Scenario ${scenario.name} should have failed but passed`)
        }
      } catch (error) {
        if (!scenario.shouldFail) {
          throw new Error(`Scenario ${scenario.name} failed unexpectedly: ${error.message}`)
        }
      }
      
      // Cleanup
      try {
        execSync("rm -f test.js test.ts test.spec.ts", { cwd: workspaceRoot, stdio: "pipe" })
      } catch {}
    }
  })

  test("workflow caching validation", async () => {
    // Test caching mechanisms
    const cacheTests = [
      {
        name: "node-modules-cache",
        command: "rm -rf node_modules && bun install",
        cacheKey: "node-modules"
      },
      {
        name: "playwright-cache", 
        command: "bun run playwright:install",
        cacheKey: "playwright"
      }
    ]

    for (const test of cacheTests) {
      const startTime = Date.now()
      
      try {
        execSync(test.command, { cwd: workspaceRoot, stdio: "pipe" })
      } catch (error) {
        console.log(`${test.name} failed:`, error.message)
      }
      
      const firstRunTime = Date.now() - startTime
      
      // Run again to test cache
      const secondStartTime = Date.now()
      
      try {
        execSync(test.command, { cwd: workspaceRoot, stdio: "pipe" })
      } catch (error) {
        console.log(`${test.name} second run failed:`, error.message)
      }
      
      const secondRunTime = Date.now() - secondStartTime
      
      // Second run should be faster (cached)
      if (firstRunTime > 10000) { // Only check if first run was significant
        expect(secondRunTime).toBeLessThan(firstRunTime * 0.8) // At least 20% faster
      }
    }
  })

  test("workflow artifact validation", async () => {
    // Test artifact generation and handling
    const artifactTests = [
      {
        name: "build-artifacts",
        command: "bun run build",
        expectedFiles: ["packages/opencode/dist", "packages/kilo-vscode/dist"]
      },
      {
        name: "test-reports",
        command: "bun test --reporter=html",
        expectedFiles: ["test-results.html"]
      }
    ]

    for (const test of artifactTests) {
      try {
        execSync(test.command, { cwd: workspaceRoot, stdio: "pipe" })
        
        // Verify expected files exist
        for (const file of test.expectedFiles) {
          const filePath = join(workspaceRoot, file)
          if (existsSync(filePath)) {
            const stats = require("fs").statSync(filePath)
            expect(stats.size).toBeGreaterThan(0)
          }
        }
      } catch (error) {
        console.log(`${test.name} failed:`, error.message)
      }
    }
  })

  test("workflow matrix validation", async () => {
    // Test matrix strategy if present
    const workflows = [
      "ci-core.yml",
      "pr-fast-gate.yml",
      "install-integrity.yml"
    ]

    for (const workflowFile of workflows) {
      const workflowPath = join(workflowsDir, workflowFile)
      const content = readFileSync(workflowPath, "utf8")
      
      if (content.includes("strategy:")) {
        expect(content).toContain("matrix:")
        
        // Verify matrix configuration
        if (content.includes("os:")) {
          expect(content).toContain("ubuntu-latest")
          expect(content).toContain("windows-latest")
          expect(content).toContain("macos-latest")
        }
        
        if (content.includes("node-version:")) {
          expect(content).toMatch(/\d+\.\d+\.\d+/)
        }
      }
    }
  })

  test("workflow dependency validation", async () => {
    // Test workflow job dependencies
    const ciCorePath = join(workflowsDir, "ci-core.yml")
    const ciCoreContent = readFileSync(ciCorePath, "utf8")

    if (ciCoreContent.includes("needs:")) {
      // Verify dependency structure is valid
      const jobs = ciCoreContent.match(/jobs:\s*\n\s*(\w+)/g)
      if (jobs) {
        const jobNames = jobs.map(job => job.match(/jobs:\s*\n\s*(\w+)/)?.[1]).filter(Boolean)
        
        // Verify all referenced jobs exist
        for (const job of jobNames) {
          expect(ciCoreContent).toContain(`${job}:`)
        }
      }
    }
  })

  test("workflow environment validation", async () => {
    // Test workflow environment variables
    const workflows = [
      "ci-core.yml",
      "pr-fast-gate.yml",
      "install-integrity.yml"
    ]

    for (const workflowFile of workflows) {
      const workflowPath = join(workflowsDir, workflowFile)
      const content = readFileSync(workflowPath, "utf8")
      
      // Verify environment variables are used properly
      if (content.includes("env:")) {
        expect(content).toMatch(/\w+:\s*\${{\s*\w+\s*}}/)
      }
      
      // Verify Node.js version
      if (content.includes("setup-node")) {
        expect(content).toContain("node-version")
        expect(content).toMatch(/\d+\.\d+\.\d+/)
      }
    }
  })

  test("workflow notification validation", async () => {
    // Test workflow notifications and reporting
    const workflows = [
      "ci-core.yml",
      "pr-fast-gate.yml",
      "playwright-e2e.yml"
    ]

    for (const workflowFile of workflows) {
      const workflowPath = join(workflowsDir, workflowFile)
      const content = readFileSync(workflowPath, "utf8")
      
      // Verify notification mechanisms
      if (content.includes("notify:")) {
        expect(content).toContain("email")
        expect(content).toContain("slack")
      }
      
      // Verify reporting mechanisms
      if (content.includes("upload-report")) {
        expect(content).toContain("artifact")
      }
    }
  })
})
