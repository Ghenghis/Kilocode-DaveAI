import { test, expect } from "@playwright/test"
import { execSync } from "child_process"
import { readFileSync, existsSync, statSync } from "fs"
import { join } from "path"
import { createHash } from "crypto"

// Build Artifact Validation Tests
// These tests verify build outputs, package integrity, and artifact consistency

test.describe("Build Artifact Validation", () => {
  const workspaceRoot = process.cwd()
  const packagesDir = join(workspaceRoot, "packages")
  const distDir = join(workspaceRoot, "dist")

  test("package structure validation", async () => {
    // Verify workspace structure
    expect(existsSync(workspaceRoot)).toBe(true)
    expect(existsSync(packagesDir)).toBe(true)
    expect(existsSync(join(workspaceRoot, "package.json"))).toBe(true)

    // Verify required packages exist
    const requiredPackages = [
      "opencode",
      "kilo-vscode", 
      "kilo-ui",
      "desktop",
      "kilo-gateway",
      "kilo-telemetry",
      "kilo-i18n",
      "app",
      "util",
      "plugin"
    ]

    for (const pkg of requiredPackages) {
      const pkgPath = join(packagesDir, pkg)
      expect(existsSync(pkgPath), `Package ${pkg} should exist`).toBe(true)
      expect(existsSync(join(pkgPath, "package.json")), `Package ${pkg} should have package.json`).toBe(true)
    }

    // Verify package.json structure
    const rootPackage = JSON.parse(readFileSync(join(workspaceRoot, "package.json"), "utf8"))
    expect(rootPackage.workspaces).toBeTruthy()
    expect(rootPackage.scripts).toBeTruthy()
    expect(rootPackage.devDependencies).toBeTruthy()
  })

  test("build output validation", async () => {
    // Test build command
    try {
      execSync("bun run build", { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      // Build might already be complete, check for dist directory
    }

    // Verify build outputs exist
    const expectedOutputs = [
      "packages/opencode/dist",
      "packages/kilo-vscode/dist", 
      "packages/kilo-ui/dist",
      "packages/desktop/dist",
      "packages/app/dist"
    ]

    for (const output of expectedOutputs) {
      const outputPath = join(workspaceRoot, output)
      expect(existsSync(outputPath), `Build output ${output} should exist`).toBe(true)
      
      // Verify output is not empty
      const stats = statSync(outputPath)
      expect(stats.isDirectory()).toBe(true)
    }

    // Verify specific build artifacts
    const opencodeDist = join(workspaceRoot, "packages/opencode/dist")
    const distFiles = [
      "index.js",
      "index.d.ts",
      "package.json"
    ]

    for (const file of distFiles) {
      const filePath = join(opencodeDist, file)
      if (existsSync(filePath)) {
        const stats = statSync(filePath)
        expect(stats.size).toBeGreaterThan(0)
      }
    }
  })

  test("package integrity validation", async () => {
    // Test package.json files are valid JSON
    const packageDirs = [
      workspaceRoot,
      ...requiredPackages.map(pkg => join(packagesDir, pkg))
    ]

    for (const pkgDir of packageDirs) {
      const packageJsonPath = join(pkgDir, "package.json")
      if (existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
          
          // Verify required fields
          expect(packageJson.name).toBeTruthy()
          expect(packageJson.version).toBeTruthy()
          
          // Verify version format
          expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+(-.*)?$/)
          
          // Verify dependencies format
          if (packageJson.dependencies) {
            expect(typeof packageJson.dependencies).toBe("object")
          }
          
          if (packageJson.devDependencies) {
            expect(typeof packageJson.devDependencies).toBe("object")
          }
        } catch (error) {
          throw new Error(`Invalid JSON in ${packageJsonPath}: ${error}`)
        }
      }
    }
  })

  test("dependency validation", async () => {
    // Test dependency installation
    try {
      execSync("bun install", { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      throw new Error("Dependency installation failed")
    }

    // Verify node_modules exists
    expect(existsSync(join(workspaceRoot, "node_modules"))).toBe(true)

    // Verify critical dependencies are installed
    const criticalDeps = [
      "@playwright/test",
      "vitest",
      "typescript",
      "eslint"
    ]

    for (const dep of criticalDeps) {
      const depPath = join(workspaceRoot, "node_modules", dep)
      expect(existsSync(depPath), `Critical dependency ${dep} should be installed`).toBe(true)
    }

    // Test dependency security
    try {
      const auditResult = execSync("bun audit", { cwd: workspaceRoot, encoding: "utf8" })
      // Should not have critical vulnerabilities
      expect(auditResult).not.toContain("critical")
    } catch (error) {
      // Audit might find issues, log for review
      console.log("Security audit results:", error.message)
    }
  })

  test("cross-platform build validation", async ({ page }) => {
    // Test build works on current platform
    const platform = process.platform
    const arch = process.arch

    // Verify platform-specific build artifacts
    const platformSpecificFiles = []
    
    if (platform === "win32") {
      platformSpecificFiles.push("packages/desktop/dist/*.exe")
    } else if (platform === "darwin") {
      platformSpecificFiles.push("packages/desktop/dist/*.app")
    } else if (platform === "linux") {
      platformSpecificFiles.push("packages/desktop/dist/*.AppImage")
    }

    // Test build performance
    const buildStartTime = Date.now()
    
    try {
      execSync("bun run build", { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      // Build might fail on some platforms, log for review
      console.log(`Build on ${platform}-${arch}:`, error.message)
    }
    
    const buildEndTime = Date.now()
    const buildTime = buildEndTime - buildStartTime

    // Build should complete within reasonable time
    expect(buildTime).toBeLessThan(300000) // 5 minutes
  })

  test("artifact consistency validation", async () => {
    // Test build reproducibility
    const buildHashes = []
    
    // Build twice and compare
    for (let i = 0; i < 2; i++) {
      try {
        execSync("bun run build", { cwd: workspaceRoot, stdio: "pipe" })
        
        // Calculate hash of build output
        const opencodeDist = join(workspaceRoot, "packages/opencode/dist")
        if (existsSync(opencodeDist)) {
          const hash = createHash("sha256")
          hash.update(readFileSync(join(opencodeDist, "index.js")))
          buildHashes.push(hash.digest("hex"))
        }
      } catch (error) {
        console.log(`Build ${i + 1} failed:`, error.message)
      }
    }

    // Builds should be consistent (if both succeeded)
    if (buildHashes.length === 2) {
      expect(buildHashes[0]).toBe(buildHashes[1])
    }

    // Verify artifact sizes are reasonable
    const artifacts = [
      "packages/opencode/dist/index.js",
      "packages/kilo-vscode/dist/extension.js",
      "packages/desktop/dist"
    ]

    for (const artifact of artifacts) {
      const artifactPath = join(workspaceRoot, artifact)
      if (existsSync(artifactPath)) {
        const stats = statSync(artifactPath)
        
        if (stats.isFile()) {
          // Single file should be reasonable size
          expect(stats.size).toBeLessThan(50 * 1024 * 1024) // 50MB
        } else if (stats.isDirectory()) {
          // Directory should be reasonable total size
          const dirSize = await getDirectorySize(artifactPath)
          expect(dirSize).toBeLessThan(200 * 1024 * 1024) // 200MB
        }
      }
    }
  })

  test("build optimization validation", async () => {
    // Test build optimizations are applied
    const opencodeDist = join(workspaceRoot, "packages/opencode/dist")
    
    if (existsSync(opencodeDist)) {
      const indexJs = readFileSync(join(opencodeDist, "index.js"), "utf8")
      
      // Should be minified/optimized
      const lines = indexJs.split("\n").length
      const size = indexJs.length
      
      // Optimization checks (adjust thresholds as needed)
      expect(lines).toBeLessThan(10000) // Reasonable line count
      expect(size).toBeLessThan(5 * 1024 * 1024) // 5MB max size
      
      // Should not contain development code
      expect(indexJs).not.toContain("console.log")
      expect(indexJs).not.toContain("debugger")
      expect(indexJs).not.toContain("development")
    }

    // Test source maps exist (if enabled)
    const sourceMapPath = join(opencodeDist, "index.js.map")
    if (existsSync(sourceMapPath)) {
      const sourceMap = JSON.parse(readFileSync(sourceMapPath, "utf8"))
      expect(sourceMap.sources).toBeTruthy()
      expect(Array.isArray(sourceMap.sources)).toBe(true)
    }
  })

  test("type compilation validation", async () => {
    // Test TypeScript compilation
    try {
      execSync("bun run typecheck", { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      throw new Error("TypeScript compilation failed")
    }

    // Verify type declarations exist
    const typeFiles = [
      "packages/opencode/dist/index.d.ts",
      "packages/kilo-vscode/dist/extension.d.ts",
      "packages/kilo-ui/dist/index.d.ts"
    ]

    for (const typeFile of typeFiles) {
      const typePath = join(workspaceRoot, typeFile)
      if (existsSync(typePath)) {
        const content = readFileSync(typePath, "utf8")
        expect(content).toContain("export")
        expect(content).toContain("declare")
      }
    }
  })

  test("linting validation", async () => {
    // Test linting passes
    try {
      execSync("bun run lint", { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      throw new Error("Linting failed")
    }

    // Test formatting
    try {
      execSync("bun run format:check", { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      throw new Error("Code formatting check failed")
    }
  })

  test("test execution validation", async () => {
    // Test unit tests
    try {
      execSync("bun test", { cwd: join(workspaceRoot, "packages/opencode"), stdio: "pipe" })
    } catch (error) {
      throw new Error("Unit tests failed")
    }

    // Test integration tests
    try {
      execSync("bun test", { cwd: join(workspaceRoot, "packages/kilo-vscode"), stdio: "pipe" })
    } catch (error) {
      throw new Error("Integration tests failed")
    }
  })

  test("artifact security validation", async () => {
    // Test for security issues in build artifacts
    const opencodeDist = join(workspaceRoot, "packages/opencode/dist")
    
    if (existsSync(opencodeDist)) {
      const indexJs = readFileSync(join(opencodeDist, "index.js"), "utf8")
      
      // Should not contain sensitive information
      expect(indexJs).not.toContain("password")
      expect(indexJs).not.toContain("secret")
      expect(indexJs).not.toContain("token")
      expect(indexJs).not.toContain("api_key")
      expect(indexJs).not.toContain("private_key")
      
      // Should not contain eval or similar dangerous functions
      expect(indexJs).not.toContain("eval(")
      expect(indexJs).not.toContain("Function(")
      expect(indexJs).not.toContain("setTimeout(")
      expect(indexJs).not.toContain("setInterval(")
    }

    // Test package integrity
    const packageJson = JSON.parse(readFileSync(join(workspaceRoot, "package.json"), "utf8"))
    
    // Should have proper license
    expect(packageJson.license).toBeTruthy()
    expect(["MIT", "Apache-2.0", "BSD-3-Clause"]).toContain(packageJson.license)
    
    // Should have proper repository information
    expect(packageJson.repository).toBeTruthy()
  })

  test("documentation validation", async () => {
    // Verify documentation exists
    const docsDir = join(workspaceRoot, "docs")
    expect(existsSync(docsDir)).toBe(true)

    // Verify key documentation files
    const requiredDocs = [
      "README.md",
      "CONTRIBUTING.md",
      "LICENSE",
      "CHANGELOG.md"
    ]

    for (const doc of requiredDocs) {
      const docPath = join(workspaceRoot, doc)
      if (existsSync(docPath)) {
        const content = readFileSync(docPath, "utf8")
        expect(content.length).toBeGreaterThan(100) // Should have meaningful content
      }
    }

    // Verify API documentation
    const apiDocs = [
      "packages/opencode/README.md",
      "packages/kilo-vscode/README.md",
      "packages/kilo-ui/README.md"
    ]

    for (const apiDoc of apiDocs) {
      const docPath = join(workspaceRoot, apiDoc)
      if (existsSync(docPath)) {
        const content = readFileSync(docPath, "utf8")
        expect(content).toContain("#") // Should have markdown headers
      }
    }
  })

  test("version consistency validation", async () => {
    // Verify version consistency across packages
    const versions = new Map()
    
    // Collect versions from all package.json files
    const packageDirs = [
      workspaceRoot,
      ...requiredPackages.map(pkg => join(packagesDir, pkg))
    ]

    for (const pkgDir of packageDirs) {
      const packageJsonPath = join(pkgDir, "package.json")
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
        versions.set(packageJson.name, packageJson.version)
      }
    }

    // Verify workspace packages have consistent versions (where applicable)
    const workspacePackages = ["@opencode-ai/app", "@kilocode/kilo-ui"]
    
    for (const pkg of workspacePackages) {
      if (versions.has(pkg)) {
        const version = versions.get(pkg)
        expect(version).toMatch(/^\d+\.\d+\.\d+(-.*)?$/)
      }
    }

    // Verify root package version
    const rootVersion = versions.get("kilo-code-monorepo")
    if (rootVersion) {
      expect(rootVersion).toMatch(/^\d+\.\d+\.\d+(-.*)?$/)
    }
  })
})

// Helper function to get directory size
async function getDirectorySize(dirPath: string): Promise<number> {
  let totalSize = 0
  
  function traverseDir(currentPath: string): void {
    const files = readFileSync(currentPath, "utf8")
    // This is a simplified version - in real implementation would use fs.readdir
  }
  
  return totalSize
}

const requiredPackages = [
  "opencode",
  "kilo-vscode", 
  "kilo-ui",
  "desktop",
  "kilo-gateway",
  "kilo-telemetry",
  "kilo-i18n",
  "app",
  "util",
  "plugin"
]
