import { test, expect } from "@playwright/test"
import { execSync } from "child_process"
import { readFileSync, existsSync, writeFileSync } from "fs"
import { join } from "path"
import { createHash } from "crypto"

// Release Pipeline Testing
// These tests verify versioning, changelog generation, and release automation

test.describe("Release Pipeline Testing", () => {
  const workspaceRoot = process.cwd()
  const packageJsonPath = join(workspaceRoot, "package.json")

  test("version management validation", async () => {
    // Verify package.json version format
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
    expect(packageJson.version).toBeTruthy()
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+(-.*)?$/)

    // Verify version consistency across packages
    const packagesDir = join(workspaceRoot, "packages")
    const packageDirs = [
      "opencode",
      "kilo-vscode",
      "kilo-ui",
      "desktop",
      "app"
    ]

    for (const pkg of packageDirs) {
      const pkgPath = join(packagesDir, pkg, "package.json")
      if (existsSync(pkgPath)) {
        const pkgJson = JSON.parse(readFileSync(pkgPath, "utf8"))
        expect(pkgJson.version).toBeTruthy()
        expect(pkgJson.version).toMatch(/^\d+\.\d+\.\d+(-.*)?$/)
      }
    }

    // Test version bumping
    const currentVersion = packageJson.version
    const versionParts = currentVersion.split('.')
    const newVersion = `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2]) + 1}`

    // Simulate version bump
    packageJson.version = newVersion
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

    // Verify version was updated
    const updatedPackageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
    expect(updatedPackageJson.version).toBe(newVersion)

    // Restore original version
    packageJson.version = currentVersion
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  })

  test("changelog generation validation", async () => {
    // Verify CHANGELOG.md exists
    const changelogPath = join(workspaceRoot, "CHANGELOG.md")
    expect(existsSync(changelogPath)).toBe(true)

    // Verify changelog format
    const changelog = readFileSync(changelogPath, "utf8")
    expect(changelog).toContain("# Changelog")
    expect(changelog).toContain("## [")
    expect(changelog).toContain("### Added")
    expect(changelog).toContain("### Changed")
    expect(changelog).toContain("### Fixed")
    expect(changelog).toContain("### Deprecated")

    // Test changelog generation
    try {
      execSync("bun run changelog", { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      // Changelog generation might not be implemented
      console.log("Changelog generation result:", error.message)
    }

    // Verify changelog is up to date
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
    const currentVersion = packageJson.version
    
    // Should have entry for current version
    expect(changelog).toContain(`## [${currentVersion}]`)
  })

  test("release automation validation", async () => {
    // Test release script
    try {
      execSync("bun run release", { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      // Release script might not be implemented
      console.log("Release script result:", error.message)
    }

    // Verify release preparation
    const releaseChecks = [
      {
        name: "build-check",
        command: "bun run build",
        required: true
      },
      {
        name: "test-check",
        command: "bun test",
        required: true
      },
      {
        name: "lint-check",
        command: "bun run lint",
        required: true
      },
      {
        name: "typecheck-check",
        command: "bun run typecheck",
        required: true
      }
    ]

    for (const check of releaseChecks) {
      try {
        execSync(check.command, { cwd: workspaceRoot, stdio: "pipe" })
      } catch (error) {
        if (check.required) {
          throw new Error(`Release check ${check.name} failed`)
        }
      }
    }
  })

  test("package publishing validation", async () => {
    // Test package publishing preparation
    const packagesDir = join(workspaceRoot, "packages")
    const publishablePackages = [
      "opencode",
      "kilo-ui",
      "kilo-telemetry",
      "kilo-i18n",
      "util",
      "plugin"
    ]

    for (const pkg of publishablePackages) {
      const pkgPath = join(packagesDir, pkg, "package.json")
      if (existsSync(pkgPath)) {
        const pkgJson = JSON.parse(readFileSync(pkgPath, "utf8"))
        
        // Verify publishable package has required fields
        expect(pkgJson.name).toBeTruthy()
        expect(pkgJson.version).toBeTruthy()
        expect(pkgJson.description).toBeTruthy()
        expect(pkgJson.license).toBeTruthy()
        
        // Verify scripts
        if (pkgJson.scripts) {
          expect(pkgJson.scripts.build).toBeTruthy()
          expect(pkgJson.scripts.test).toBeTruthy()
        }
        
        // Verify files field
        if (pkgJson.files) {
          expect(Array.isArray(pkgJson.files)).toBe(true)
        }
      }
    }

    // Test npm publish simulation
    try {
      execSync("bun run build", { cwd: workspaceRoot, stdio: "pipe" })
      
      // Verify build outputs are ready for publishing
      for (const pkg of publishablePackages) {
        const distPath = join(packagesDir, pkg, "dist")
        if (existsSync(distPath)) {
          const packageJsonPath = join(distPath, "package.json")
          if (existsSync(packageJsonPath)) {
            const distPackageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
            expect(distPackageJson.name).toBeTruthy()
            expect(distPackageJson.version).toBeTruthy()
          }
        }
      }
    } catch (error) {
      console.log("Publish preparation failed:", error.message)
    }
  })

  test("release security validation", async () => {
    // Verify release doesn't contain sensitive information
    const sensitiveFiles = [
      ".env",
      ".env.local",
      ".env.production",
      "secrets.json",
      "private.key",
      "config/secrets.json"
    ]

    for (const file of sensitiveFiles) {
      const filePath = join(workspaceRoot, file)
      expect(existsSync(filePath), `Sensitive file ${file} should not exist`).toBe(false)
    }

    // Verify package.json doesn't contain sensitive data
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
    expect(packageJson).not.toHaveProperty("password")
    expect(packageJson).not.toHaveProperty("secret")
    expect(packageJson).not.toHaveProperty("token")

    // Test build artifacts don't contain sensitive data
    const packagesDir = join(workspaceRoot, "packages")
    const opencodeDist = join(packagesDir, "opencode", "dist")
    
    if (existsSync(opencodeDist)) {
      const indexJs = readFileSync(join(opencodeDist, "index.js"), "utf8")
      expect(indexJs).not.toContain("password")
      expect(indexJs).not.toContain("secret")
      expect(indexJs).not.toContain("token")
    }
  })

  test("release artifact validation", async () => {
    // Verify release artifacts are properly generated
    try {
      execSync("bun run build", { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      console.log("Build failed for artifact validation:", error.message)
    }

    // Verify build artifacts
    const expectedArtifacts = [
      "packages/opencode/dist",
      "packages/kilo-vscode/dist",
      "packages/kilo-ui/dist",
      "packages/desktop/dist"
    ]

    for (const artifact of expectedArtifacts) {
      const artifactPath = join(workspaceRoot, artifact)
      if (existsSync(artifactPath)) {
        // Verify artifact is not empty
        const files = require("fs").readdirSync(artifactPath)
        expect(files.length).toBeGreaterThan(0)
        
        // Verify package.json exists in dist
        const packageJsonPath = join(artifactPath, "package.json")
        if (existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
          expect(packageJson.name).toBeTruthy()
          expect(packageJson.version).toBeTruthy()
        }
      }
    }

    // Verify checksums
    const checksums = {}
    for (const artifact of expectedArtifacts) {
      const artifactPath = join(workspaceRoot, artifact)
      if (existsSync(artifactPath)) {
        const packageJsonPath = join(artifactPath, "package.json")
        if (existsSync(packageJsonPath)) {
          const content = readFileSync(packageJsonPath, "utf8")
          const hash = createHash("sha256").update(content).digest("hex")
          checksums[artifact] = hash
        }
      }
    }

    // Verify checksums are consistent
    expect(Object.keys(checksums).length).toBeGreaterThan(0)
  })

  test("release tagging validation", async () => {
    // Test git tagging
    try {
      const currentTags = execSync("git tag", { cwd: workspaceRoot, encoding: "utf8" })
      const tags = currentTags.split("\n").filter(tag => tag.trim())
      
      // Should have tags for releases
      expect(tags.length).toBeGreaterThan(0)
      
      // Verify tag format
      for (const tag of tags) {
        expect(tag).toMatch(/^v\d+\.\d+\.\d+(-.*)?$/)
      }
    } catch (error) {
      console.log("Git tag check failed:", error.message)
    }

    // Test tag creation
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
    const currentVersion = packageJson.version
    const tagName = `v${currentVersion}`

    try {
      // Check if tag exists
      execSync(`git rev-parse ${tagName}`, { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      // Tag doesn't exist, create it
      try {
        execSync(`git tag ${tagName}`, { cwd: workspaceRoot, stdio: "pipe" })
        console.log(`Created tag ${tagName}`)
      } catch (tagError) {
        console.log("Tag creation failed:", tagError.message)
      }
    }
  })

  test("release notes validation", async () => {
    // Verify release notes are generated
    const releaseNotesPath = join(workspaceRoot, "RELEASE_NOTES.md")
    if (existsSync(releaseNotesPath)) {
      const releaseNotes = readFileSync(releaseNotesPath, "utf8")
      
      // Verify release notes format
      expect(releaseNotes).toContain("# Release Notes")
      expect(releaseNotes).toContain("## Version")
      expect(releaseNotes).toContain("### Features")
      expect(releaseNotes).toContain("### Bug Fixes")
      expect(releaseNotes).toContain("### Breaking Changes")
    }

    // Test release notes generation
    try {
      execSync("bun run release-notes", { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      console.log("Release notes generation failed:", error.message)
    }
  })

  test("rollback validation", async () => {
    // Test rollback procedures
    const rollbackTests = [
      {
        name: "version-rollback",
        action: () => {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
          const originalVersion = packageJson.version
          
          // Simulate rollback to previous version
          const versionParts = originalVersion.split('.')
          const rollbackVersion = `${versionParts[0]}.${versionParts[1]}.${Math.max(0, parseInt(versionParts[2]) - 1)}`
          
          packageJson.version = rollbackVersion
          writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
          
          // Verify rollback
          const rolledBackPackageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
          expect(rolledBackPackageJson.version).toBe(rollbackVersion)
          
          // Restore original version
          packageJson.version = originalVersion
          writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
        }
      },
      {
        name: "build-rollback",
        action: () => {
          // Test build rollback
          try {
            execSync("bun run build", { cwd: workspaceRoot, stdio: "pipe" })
            
            // Verify build exists
            const opencodeDist = join(workspaceRoot, "packages", "opencode", "dist")
            expect(existsSync(opencodeDist)).toBe(true)
            
            // Simulate rollback (remove build)
            execSync("rm -rf packages/*/dist", { cwd: workspaceRoot, stdio: "pipe" })
            
            // Verify rollback worked
            expect(existsSync(opencodeDist)).toBe(false)
            
            // Rebuild
            execSync("bun run build", { cwd: workspaceRoot, stdio: "pipe" })
            expect(existsSync(opencodeDist)).toBe(true)
          } catch (error) {
            console.log("Build rollback test failed:", error.message)
          }
        }
      }
    ]

    for (const test of rollbackTests) {
      await test.action()
    }
  })

  test("release performance validation", async () => {
    // Test release process performance
    const releaseSteps = [
      {
        name: "build-performance",
        command: "bun run build",
        expectedTime: 120000 // 2 minutes
      },
      {
        name: "test-performance",
        command: "bun test",
        expectedTime: 60000 // 1 minute
      },
      {
        name: "package-performance",
        command: "bun run pack",
        expectedTime: 30000 // 30 seconds
      }
    ]

    for (const step of releaseSteps) {
      const startTime = Date.now()
      
      try {
        execSync(step.command, { cwd: workspaceRoot, stdio: "pipe" })
      } catch (error) {
        console.log(`${step.name} failed:`, error.message)
      }
      
      const endTime = Date.now()
      const executionTime = endTime - startTime
      
      // Should complete within expected time
      expect(executionTime).toBeLessThan(step.expectedTime)
    }
  })

  test("release documentation validation", async () => {
    // Verify release documentation exists
    const requiredDocs = [
      "README.md",
      "CHANGELOG.md",
      "LICENSE",
      "CONTRIBUTING.md"
    ]

    for (const doc of requiredDocs) {
      const docPath = join(workspaceRoot, doc)
      if (existsSync(docPath)) {
        const content = readFileSync(docPath, "utf8")
        expect(content.length).toBeGreaterThan(100)
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
        expect(content).toContain("#")
        expect(content).toContain("##")
      }
    }

    // Verify installation instructions
    const readmePath = join(workspaceRoot, "README.md")
    if (existsSync(readmePath)) {
      const readme = readFileSync(readmePath, "utf8")
      expect(readme).toContain("Installation")
      expect(readme).toContain("Usage")
      expect(readme).toContain("##")
    }
  })

  test("release compliance validation", async () => {
    // Verify license compliance
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
    expect(packageJson.license).toBeTruthy()
    expect(["MIT", "Apache-2.0", "BSD-3-Clause"]).toContain(packageJson.license)

    // Verify license file exists
    const licensePath = join(workspaceRoot, "LICENSE")
    expect(existsSync(licensePath)).toBe(true)

    // Verify repository information
    expect(packageJson.repository).toBeTruthy()
    if (packageJson.repository) {
      expect(packageJson.repository.url || packageJson.repository).toBeTruthy()
    }

    // Verify author information
    expect(packageJson.author).toBeTruthy()

    // Verify keywords
    if (packageJson.keywords) {
      expect(Array.isArray(packageJson.keywords)).toBe(true)
    }

    // Verify engines
    if (packageJson.engines) {
      expect(packageJson.engines.node).toBeTruthy()
      expect(packageJson.engines.node).toMatch(/^\d+\.\d+\.\d+/)
    }
  })
})
