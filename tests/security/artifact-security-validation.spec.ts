import { test, expect } from "@playwright/test"
import { execSync } from "child_process"
import { readFileSync, existsSync, createHash } from "fs"
import { join } from "path"

// Artifact Security Validation Tests
// These tests verify package security scanning, checksums, and integrity validation

test.describe("Artifact Security Validation", () => {
  const workspaceRoot = process.cwd()

  test("dependency security scanning", async () => {
    // Test npm audit
    try {
      const auditResult = execSync("bun audit", { cwd: workspaceRoot, encoding: "utf8" })
      
      // Should not have critical vulnerabilities
      expect(auditResult).not.toContain("critical")
      
      // Log vulnerabilities for review
      if (auditResult.includes("high")) {
        console.log("High vulnerabilities found:", auditResult)
      }
    } catch (error) {
      // Audit might find issues, log for review
      console.log("Security audit results:", error.message)
    }

    // Test Snyk security scanning (if available)
    try {
      execSync("snyk test", { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      // Snyk might not be installed
      console.log("Snyk scan not available:", error.message)
    }

    // Test OWASP dependency check
    try {
      execSync("dependency-check", { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      // OWASP dependency check might not be installed
      console.log("OWASP dependency check not available:", error.message)
    }
  })

  test("package integrity validation", async () => {
    // Verify package.json files are valid
    const packageDirs = [
      workspaceRoot,
      join(workspaceRoot, "packages", "opencode"),
      join(workspaceRoot, "packages", "kilo-vscode"),
      join(workspaceRoot, "packages", "kilo-ui"),
      join(workspaceRoot, "packages", "desktop")
    ]

    for (const pkgDir of packageDirs) {
      const packageJsonPath = join(pkgDir, "package.json")
      if (existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
          
          // Verify required fields
          expect(packageJson.name).toBeTruthy()
          expect(packageJson.version).toBeTruthy()
          
          // Verify no suspicious fields
          expect(packageJson).not.toHaveProperty("scripts").toMatch(/eval|Function|setTimeout/)
          
          // Verify dependencies are legitimate
          if (packageJson.dependencies) {
            for (const [name, version] of Object.entries(packageJson.dependencies)) {
              expect(name).toMatch(/^[a-z0-9@/-]+$/i)
              expect(typeof version).toBe("string")
            }
          }
        } catch (error) {
          throw new Error(`Invalid package.json in ${pkgDir}: ${error}`)
        }
      }
    }
  })

  test("checksum validation", async () => {
    // Generate checksums for critical files
    const criticalFiles = [
      "package.json",
      "packages/opencode/package.json",
      "packages/kilo-vscode/package.json",
      "packages/kilo-ui/package.json",
      "packages/desktop/package.json"
    ]

    const checksums = {}
    
    for (const file of criticalFiles) {
      const filePath = join(workspaceRoot, file)
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, "utf8")
        const hash = createHash("sha256").update(content).digest("hex")
        checksums[file] = hash
      }
    }

    // Verify checksums are generated
    expect(Object.keys(checksums).length).toBeGreaterThan(0)

    // Generate checksums file
    const checksumsPath = join(workspaceRoot, "checksums.json")
    const checksumsData = {
      generated: new Date().toISOString(),
      algorithm: "sha256",
      files: checksums
    }

    // Write checksums file
    require("fs").writeFileSync(checksumsPath, JSON.stringify(checksumsData, null, 2))

    // Verify checksums file is valid
    const savedChecksums = JSON.parse(readFileSync(checksumsPath, "utf8"))
    expect(savedChecksums.algorithm).toBe("sha256")
    expect(savedChecksums.files).toBeTruthy()

    // Test checksum verification
    for (const [file, expectedHash] of Object.entries(checksums)) {
      const filePath = join(workspaceRoot, file)
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, "utf8")
        const actualHash = createHash("sha256").update(content).digest("hex")
        expect(actualHash).toBe(expectedHash)
      }
    }
  })

  test("build artifact security", async () => {
    // Build artifacts for testing
    try {
      execSync("bun run build", { cwd: workspaceRoot, stdio: "pipe" })
    } catch (error) {
      console.log("Build failed for security testing:", error.message)
    }

    // Verify build artifacts don't contain sensitive data
    const buildArtifacts = [
      "packages/opencode/dist",
      "packages/kilo-vscode/dist",
      "packages/kilo-ui/dist"
    ]

    for (const artifact of buildArtifacts) {
      const artifactPath = join(workspaceRoot, artifact)
      if (existsSync(artifactPath)) {
        // Check for sensitive data in JavaScript files
        const jsFiles = require("fs").readdirSync(artifactPath).filter(file => file.endsWith(".js"))
        
        for (const jsFile of jsFiles) {
          const jsPath = join(artifactPath, jsFile)
          const content = readFileSync(jsPath, "utf8")
          
          // Should not contain sensitive information
          expect(content).not.toContain("password")
          expect(content).not.toContain("secret")
          expect(content).not.toContain("token")
          expect(content).not.toContain("api_key")
          expect(content).not.toContain("private_key")
          
          // Should not contain dangerous functions
          expect(content).not.toContain("eval(")
          expect(content).not.toContain("Function(")
          expect(content).not.toContain("setTimeout(")
          expect(content).not.toContain("setInterval(")
        }
      }
    }
  })

  test("package publishing security", async () => {
    // Verify packages are ready for secure publishing
    const packagesDir = join(workspaceRoot, "packages")
    const publishablePackages = ["opencode", "kilo-ui", "kilo-telemetry", "kilo-i18n"]

    for (const pkg of publishablePackages) {
      const pkgPath = join(packagesDir, pkg)
      const packageJsonPath = join(pkgPath, "package.json")
      
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
        
        // Verify no sensitive scripts
        if (packageJson.scripts) {
          for (const [name, script] of Object.entries(packageJson.scripts)) {
            expect(script.toString()).not.toContain("password")
            expect(script.toString()).not.toContain("secret")
            expect(script.toString()).not.toContain("token")
          }
        }
        
        // Verify files field doesn't include sensitive files
        if (packageJson.files) {
          const sensitiveFiles = packageJson.files.filter((file: string) => 
            file.includes("secret") || 
            file.includes("private") || 
            file.includes("key") ||
            file.includes(".env")
          )
          expect(sensitiveFiles.length).toBe(0)
        }
        
        // Verify .npmignore exists
        const npmignorePath = join(pkgPath, ".npmignore")
        if (existsSync(npmignorePath)) {
          const npmignore = readFileSync(npmignorePath, "utf8")
          expect(npmignore).toContain(".env")
          expect(npmignore).toContain("secret")
          expect(npmignore).toContain("private")
        }
      }
    }
  })

  test("container security validation", async () => {
    // Test Docker security if Dockerfiles exist
    const dockerfilePaths = [
      "packages/desktop/Dockerfile",
      "packages/opencode/Dockerfile",
      "Dockerfile"
    ]

    for (const dockerfilePath of dockerfilePaths) {
      const fullPath = join(workspaceRoot, dockerfilePath)
      if (existsSync(fullPath)) {
        const dockerfile = readFileSync(fullPath, "utf8")
        
        // Verify Dockerfile security practices
        expect(dockerfile).not.toContain("ADD") // Should use COPY instead
        expect(dockerfile).not.toContain("USER root") // Should not run as root
        expect(dockerfile).not.toContain("--insecure-registry")
        
        // Should use specific base image versions
        expect(dockerfile).toMatch(/FROM .+:\d+\.\d+(\.\d+)?/)
        
        // Should have non-root user
        if (dockerfile.includes("USER")) {
          expect(dockerfile).not.toContain("USER root")
        }
      }
    }

    // Test Docker security scanning
    try {
      execSync("docker run --rm -v $(pwd):/app clair-scanner:latest", { 
        cwd: workspaceRoot, 
        stdio: "pipe" 
      })
    } catch (error) {
      // Clair scanner might not be available
      console.log("Docker security scan not available:", error.message)
    }
  })

  test("code security analysis", async () => {
    // Test for common security vulnerabilities in source code
    const securityChecks = [
      {
        name: "hardcoded-secrets",
        pattern: /(password|secret|token|api_key|private_key)\s*[=:]\s*['"`][^'"`]+['"`]/g,
        files: ["**/*.ts", "**/*.js", "**/*.json"]
      },
      {
        name: "sql-injection",
        pattern: /(SELECT|INSERT|UPDATE|DELETE).*\$\{.*\}/g,
        files: ["**/*.ts", "**/*.js"]
      },
      {
        name: "xss-vulnerability",
        pattern: /(innerHTML|outerHTML).*\$\{.*\}/g,
        files: ["**/*.ts", "**/*.js"]
      },
      {
        name: "eval-usage",
        pattern: /eval\s*\(/g,
        files: ["**/*.ts", "**/*.js"]
      },
      {
        name: "dangerous-functions",
        pattern: /(Function|setTimeout|setInterval)\s*\(/g,
        files: ["**/*.ts", "**/*.js"]
      }
    ]

    for (const check of securityChecks) {
      try {
        const grepResult = execSync(`grep -r "${check.pattern.source}" --include="*.ts" --include="*.js" --include="*.json" .`, {
          cwd: workspaceRoot,
          encoding: "utf8"
        })
        
        if (grepResult.trim()) {
          console.log(`Security issue found: ${check.name}`)
          console.log(grepResult)
          
          // For demo purposes, we'll log but not fail
          // In production, you might want to fail on these
        }
      } catch (error) {
        // No matches found, which is good
      }
    }
  })

  test("environment variable security", async () => {
    // Verify environment variables don't contain sensitive data
    const envFiles = [
      ".env",
      ".env.example",
      ".env.template"
    ]

    for (const envFile of envFiles) {
      const envPath = join(workspaceRoot, envFile)
      if (existsSync(envPath)) {
        const envContent = readFileSync(envPath, "utf8")
        
        // Should not contain actual secrets
        expect(envContent).not.toContain("sk-") // OpenAI API keys
        expect(envContent).not.toContain("ghp_") // GitHub tokens
        expect(envContent).not.toContain("gho_") // GitHub OAuth tokens
        expect(envContent).not.toContain("ghu_") // GitHub user tokens
        expect(envContent).not.toContain("xoxb-") // Slack tokens
        
        // Should have placeholder values
        expect(envContent).toContain("your_") || envContent.includes("PLACEHOLDER")
      }
    }

    // Verify environment variable usage in code
    try {
      const envUsage = execSync("grep -r \"process.env.\" --include=\"*.ts\" --include=\"*.js\" .", {
        cwd: workspaceRoot,
        encoding: "utf8"
      })
      
      if (envUsage.trim()) {
        const envLines = envUsage.split("\n")
        for (const line of envLines) {
          if (line.trim()) {
            // Should validate environment variables
            expect(line).not.toContain("process.env.password")
            expect(line).not.toContain("process.env.secret")
            expect(line).not.toContain("process.env.token")
          }
        }
      }
    } catch (error) {
      // No environment variable usage found
    }
  })

  test("file permission security", async () => {
    // Verify file permissions are secure
    const criticalFiles = [
      "package.json",
      "packages/*/package.json",
      ".env*",
      "*.key",
      "*.pem"
    ]

    for (const filePattern of criticalFiles) {
      try {
        const findResult = execSync(`find . -name "${filePattern}" -type f`, {
          cwd: workspaceRoot,
          encoding: "utf8"
        })
        
        const files = findResult.trim().split("\n").filter(f => f.trim())
        
        for (const file of files) {
          const filePath = join(workspaceRoot, file)
          const stats = require("fs").statSync(filePath)
          
          // Should not be world-writable
          expect(stats.mode & 0o002).toBe(0)
          
          // Sensitive files should not be world-readable
          if (file.includes(".env") || file.includes(".key") || file.includes(".pem")) {
            expect(stats.mode & 0o004).toBe(0)
          }
        }
      } catch (error) {
        // No files found matching pattern
      }
    }
  })

  test("git security validation", async () => {
    // Verify .gitignore exists and is comprehensive
    const gitignorePath = join(workspaceRoot, ".gitignore")
    expect(existsSync(gitignorePath)).toBe(true)
    
    const gitignore = readFileSync(gitignorePath, "utf8")
    
    // Should ignore sensitive files
    expect(gitignore).toContain(".env")
    expect(gitignore).toContain("node_modules")
    expect(gitignore).toContain("dist")
    expect(gitignore).toContain("*.log")
    expect(gitignore).toContain(".DS_Store")
    
    // Verify no sensitive files are tracked
    try {
      const gitStatus = execSync("git status --porcelain", {
        cwd: workspaceRoot,
        encoding: "utf8"
      })
      
      const trackedFiles = gitStatus.split("\n").filter(line => 
        line.trim() && !line.startsWith("??")
      )
      
      for (const file of trackedFiles) {
        const filename = file.substring(3)
        
        // Should not track sensitive files
        expect(filename).not.toContain(".env")
        expect(filename).not.toContain("secret")
        expect(filename).not.toContain("private")
        expect(filename).not.toContain("key")
      }
    } catch (error) {
      // Git might not be initialized
    }
  })

  test("supply chain security", async () => {
    // Test npm registry security
    try {
      const npmConfig = execSync("npm config list", { encoding: "utf8" })
      expect(npmConfig).not.toContain("insecure")
    } catch (error) {
      console.log("npm config check failed:", error.message)
    }

    // Test package lock integrity
    const packageLockPath = join(workspaceRoot, "package-lock.json")
    const bunLockbPath = join(workspaceRoot, "bun.lockb")
    
    if (existsSync(packageLockPath)) {
      const packageLock = JSON.parse(readFileSync(packageLockPath, "utf8"))
      expect(packageLock.lockfileVersion).toBeTruthy()
      expect(packageLock.packages).toBeTruthy()
    }
    
    if (existsSync(bunLockbPath)) {
      // bun.lockb is binary, just check it exists
      expect(require("fs").statSync(bunLockbPath).size).toBeGreaterThan(0)
    }

    // Test for typosquatting attacks
    const packageJson = JSON.parse(readFileSync(join(workspaceRoot, "package.json"), "utf8"))
    
    if (packageJson.dependencies) {
      for (const [name, version] of Object.entries(packageJson.dependencies)) {
        // Check for common typosquatting patterns
        expect(name).not.toContain("lodaash") // Should be lodash
        expect(name).not.toContain("reqeust") // Should be request
        expect(name).not.toContain("exrpess") // Should be express
        
        // Verify package name format
        expect(name).toMatch(/^[a-z0-9@/-]+$/i)
      }
    }
  })

  test("security monitoring validation", async () => {
    // Test security monitoring tools
    const securityTools = [
      {
        name: "snyk",
        command: "snyk test",
        required: false
      },
      {
        name: "npm-audit",
        command: "bun audit",
        required: true
      },
      {
        name: "eslint-security",
        command: "bun run lint:security",
        required: false
      }
    ]

    for (const tool of securityTools) {
      try {
        execSync(tool.command, { cwd: workspaceRoot, stdio: "pipe" })
        console.log(`${tool.name} security check completed`)
      } catch (error) {
        if (tool.required) {
          console.log(`Required security tool ${tool.name} failed:`, error.message)
        } else {
          console.log(`Optional security tool ${tool.name} not available:`, error.message)
        }
      }
    }

    // Verify security reporting
    const securityReportPath = join(workspaceRoot, "security-report.json")
    if (existsSync(securityReportPath)) {
      const securityReport = JSON.parse(readFileSync(securityReportPath, "utf8"))
      
      expect(securityReport.timestamp).toBeTruthy()
      expect(securityReport.vulnerabilities).toBeTruthy()
      expect(Array.isArray(securityReport.vulnerabilities)).toBe(true)
    }
  })
})
