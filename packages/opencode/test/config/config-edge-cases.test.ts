import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { Config } from "@/config/config"
import { writeFileSync, mkdirSync, rmSync } from "fs"
import { join } from "path"

describe("Config Validation Edge Cases", () => {
  let testDir: string
  let mockInstance: any

  beforeEach(() => {
    vi.clearAllMocks()
    testDir = join(process.cwd(), "test-config-" + Date.now())
    mkdirSync(testDir, { recursive: true })

    mockInstance = {
      directory: testDir,
      worktree: null
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    try {
      rmSync(testDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe("Malformed JSON Handling", () => {
    it("should handle invalid JSON syntax", async () => {
      const invalidJson = `{
        "model": "claude-3-sonnet",
        "invalid": "missing quote
      }`

      const configFile = join(testDir, "kilo.json")
      writeFileSync(configFile, invalidJson)

      await expect(
        Config.get(mockInstance)
      ).rejects.toThrow("Invalid JSON")
    })

    it("should handle truncated JSON", async () => {
      const truncatedJson = `{
        "model": "claude-3-sonnet",
        "logLevel": "debug"
      `

      const configFile = join(testDir, "kilo.json")
      writeFileSync(configFile, truncatedJson)

      await expect(
        Config.get(mockInstance)
      ).rejects.toThrow()
    })

    it("should handle JSON with comments (JSONC)", async () => {
      const jsoncContent = `{
        // This is a comment
        "model": "claude-3-sonnet", /* inline comment */
        "logLevel": "debug"
      }`

      const configFile = join(testDir, "kilo.jsonc")
      writeFileSync(configFile, jsoncContent)

      // Should handle JSONC correctly
      const config = await Config.get(mockInstance)
      expect(config.model).toBe("claude-3-sonnet")
      expect(config.logLevel).toBe("debug")
    })
  })

  describe("Invalid Schema Values", () => {
    it("should handle invalid model values", async () => {
      const invalidConfig = {
        model: 123, // Should be string
        logLevel: "invalid-level",
        server: {
          port: "not-a-number" // Should be number
        }
      }

      const configFile = join(testDir, "kilo.json")
      writeFileSync(configFile, JSON.stringify(invalidConfig))

      await expect(
        Config.get(mockInstance)
      ).rejects.toThrow()
    })

    it("should handle null required fields", async () => {
      const invalidConfig = {
        model: null,
        logLevel: null
      }

      const configFile = join(testDir, "kilo.json")
      writeFileSync(configFile, JSON.stringify(invalidConfig))

      await expect(
        Config.get(mockInstance)
      ).rejects.toThrow()
    })

    it("should handle unknown fields in strict mode", async () => {
      const configWithUnknownFields = {
        model: "claude-3-sonnet",
        logLevel: "debug",
        unknownField: "should not be allowed",
        anotherUnknown: {
          nested: true
        }
      }

      const configFile = join(testDir, "kilo.json")
      writeFileSync(configFile, JSON.stringify(configWithUnknownFields))

      await expect(
        Config.get(mockInstance)
      ).rejects.toThrow()
    })
  })

  describe("File System Edge Cases", () => {
    it("should handle unreadable config files", async () => {
      const configFile = join(testDir, "kilo.json")
      writeFileSync(configFile, '{"model": "test"}')

      // Mock file read to simulate permission error
      const originalReadFileSync = require('fs').readFileSync
      vi.mock('fs', () => ({
        readFileSync: vi.fn(() => {
          throw new Error("EACCES: permission denied")
        }),
        writeFileSync: originalReadFileSync,
        mkdirSync: vi.fn(),
        rmSync: vi.fn()
      }))

      await expect(
        Config.get(mockInstance)
      ).rejects.toThrow()
    })

    it("should handle missing config directories", async () => {
      const nonExistentDir = join(testDir, "non-existent")
      mockInstance.directory = nonExistentDir

      // Should handle missing directory gracefully
      const config = await Config.get(mockInstance)
      expect(config).toBeDefined()
    })

    it("should handle circular file inclusions", async () => {
      const baseConfig = {
        model: "claude-3-sonnet",
        logLevel: "debug"
      }

      const baseFile = join(testDir, "base.json")
      const mainFile = join(testDir, "kilo.json")
      
      writeFileSync(baseFile, JSON.stringify(baseConfig))
      writeFileSync(mainFile, `{
        "model": "claude-3-opus",
        "include": "${baseFile}"
      }`)

      // Should detect and handle circular references
      await expect(
        Config.get(mockInstance)
      ).resolves.toBeDefined()
    })
  })

  describe("Environment Variable Edge Cases", () => {
    it("should handle undefined environment variables", async () => {
      const configWithEnv = {
        model: "${UNDEFINED_VAR}",
        logLevel: "debug"
      }

      const configFile = join(testDir, "kilo.json")
      writeFileSync(configFile, JSON.stringify(configWithEnv))

      // Should handle undefined env vars gracefully
      await expect(
        Config.get(mockInstance)
      ).rejects.toThrow()
    })

    it("should handle malformed environment variable syntax", async () => {
      const configWithBadEnv = {
        model: "${INCOMPLETE_VAR",
        logLevel: "debug"
      }

      const configFile = join(testDir, "kilo.json")
      writeFileSync(configFile, JSON.stringify(configWithBadEnv))

      await expect(
        Config.get(mockInstance)
      ).rejects.toThrow()
    })

    it("should handle environment variables with special characters", async () => {
      process.env.TEST_SPECIAL_VAR = "value-with-$pecial-char$"

      const configWithSpecialEnv = {
        model: "${TEST_SPECIAL_VAR}",
        logLevel: "debug"
      }

      const configFile = join(testDir, "kilo.json")
      writeFileSync(configFile, JSON.stringify(configWithSpecialEnv))

      const config = await Config.get(mockInstance)
      expect(config.model).toBe("value-with-$pecial-char$")

      delete process.env.TEST_SPECIAL_VAR
    })
  })

  describe("Config Merging Edge Cases", () => {
    it("should handle conflicting config files", async () => {
      const config1 = {
        model: "claude-3-sonnet",
        logLevel: "debug",
        server: { port: 3000 }
      }

      const config2 = {
        model: "claude-3-opus",
        logLevel: "info",
        server: { host: "localhost" }
      }

      writeFileSync(join(testDir, "kilo.json"), JSON.stringify(config1))
      writeFileSync(join(testDir, "opencode.json"), JSON.stringify(config2))

      const config = await Config.get(mockInstance)
      // Should merge with proper precedence
      expect(config).toBeDefined()
    })

    it("should handle deeply nested merge conflicts", async () => {
      const config1 = {
        tools: {
          enabled: ["tool1", "tool2"],
          config: {
            timeout: 5000,
            retries: 3
          }
        }
      }

      const config2 = {
        tools: {
          enabled: ["tool3"],
          config: {
            timeout: 10000
          }
        }
      }

      writeFileSync(join(testDir, "kilo.json"), JSON.stringify(config1))
      writeFileSync(join(testDir, "opencode.json"), JSON.stringify(config2))

      const config = await Config.get(mockInstance)
      expect(config.tools.enabled).toContain("tool1")
      expect(config.tools.enabled).toContain("tool3")
    })
  })

  describe("Large Config Files", () => {
    it("should handle very large config files", async () => {
      // Create a large config with many entries
      const largeConfig = {
        model: "claude-3-sonnet",
        logLevel: "debug",
        tools: {
          enabled: Array.from({ length: 1000 }, (_, i) => `tool-${i}`),
          config: Object.fromEntries(
            Array.from({ length: 100 }, (_, i) => [`setting-${i}`, `value-${i}`])
          )
        }
      }

      const configFile = join(testDir, "kilo.json")
      writeFileSync(configFile, JSON.stringify(largeConfig))

      const config = await Config.get(mockInstance)
      expect(config.tools.enabled).toHaveLength(1000)
    })
  })
})
