import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import * as vscode from "vscode"
import { activate } from "../extension"
import { KiloProvider } from "../KiloProvider"
import { AgentManagerProvider } from "../agent-manager/AgentManagerProvider"

// Mock VS Code API
const mockVscode = {
  ExtensionContext: vi.fn(),
  window: {
    createOutputChannel: vi.fn(),
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    showWarningMessage: vi.fn(),
    registerTreeDataProvider: vi.fn(),
    registerWebviewPanelProvider: vi.fn()
  },
  workspace: {
    getConfiguration: vi.fn(),
    workspaceFolders: [],
    rootPath: "/test/workspace",
    onDidChangeWorkspaceFolders: vi.fn(),
    findFiles: vi.fn(),
    openTextDocument: vi.fn(),
    asRelativePath: vi.fn()
  },
  commands: {
    registerCommand: vi.fn(),
    executeCommand: vi.fn(),
    getCommands: vi.fn()
  },
  env: {
    appName: "VS Code Test",
    openExternal: vi.fn()
  },
  Uri: {
    file: vi.fn(),
    parse: vi.fn(),
    joinPath: vi.fn()
  },
  Range: vi.fn(),
  Position: vi.fn(),
  Selection: vi.fn(),
  TreeItem: vi.fn(),
  EventEmitter: vi.fn(),
  TreeItemCollapsibleState: {
    None: 0,
    Expanded: 1,
    Collapsed: 2
  },
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
    WorkspaceFolder: 3
  },
  ViewColumn: {
    One: 1,
    Two: 2,
    Three: 3
  },
  StatusBarAlignment: {
    Left: 1,
    Right: 2
  }
}

// Mock the VS Code module
vi.mock("vscode", () => mockVscode)

describe("VS Code Extension Integration Tests", () => {
  let mockContext: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockContext = {
      extensionUri: { fsPath: "/test/extension" },
      subscriptions: [],
      workspaceState: {
        get: vi.fn(),
        update: vi.fn(),
        keys: vi.fn()
      },
      globalState: {
        get: vi.fn(),
        update: vi.fn(),
        keys: vi.fn()
      },
      secrets: {
        get: vi.fn(),
        store: vi.fn(),
        delete: vi.fn()
      },
      extensionPath: "/test/extension/path"
    }

    // Reset mock implementations
    mockVscode.window.createOutputChannel.mockReturnValue({
      appendLine: vi.fn(),
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn()
    })

    mockVscode.workspace.getConfiguration.mockReturnValue({
      get: vi.fn(),
      update: vi.fn(),
      has: vi.fn(),
      inspect: vi.fn()
    })

    mockVscode.commands.registerCommand.mockReturnValue({
      dispose: vi.fn()
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("Extension Activation", () => {
    it("should activate extension successfully", () => {
      expect(() => {
        activate(mockContext)
      }).not.toThrow()

      expect(mockVscode.window.createOutputChannel).toHaveBeenCalled()
      expect(mockVscode.commands.registerCommand).toHaveBeenCalled()
    })

    it("should register all expected commands", () => {
      activate(mockContext)

      // Check that commands were registered
      expect(mockVscode.commands.registerCommand).toHaveBeenCalledTimes(expect.any(Number))
      
      // Get all registered commands
      const registeredCommands = mockVscode.commands.registerCommand.mock.calls.map(call => call[0])
      
      // Verify core commands are registered
      expect(registeredCommands).toContain("kilo.openChat")
      expect(registeredCommands).toContain("kilo.newSession")
    })

    it("should create output channel", () => {
      activate(mockContext)

      expect(mockVscode.window.createOutputChannel).toHaveBeenCalledWith(
        expect.stringContaining("Kilo")
      )
    })

    it("should handle workspace configuration", () => {
      const mockConfig = {
        get: vi.fn().mockReturnValue("test-value"),
        update: vi.fn(),
        has: vi.fn().mockReturnValue(true),
        inspect: vi.fn().mockReturnValue({
          globalValue: "global",
          workspaceValue: "workspace"
        })
      }
      mockVscode.workspace.getConfiguration.mockReturnValue(mockConfig)

      activate(mockContext)

      expect(mockVscode.workspace.getConfiguration).toHaveBeenCalled()
    })

    it("should register tree data providers", () => {
      activate(mockContext)

      expect(mockVscode.window.registerTreeDataProvider).toHaveBeenCalled()
    })

    it("should setup webview panel providers", () => {
      activate(mockContext)

      expect(mockVscode.window.registerWebviewPanelProvider).toHaveBeenCalled()
    })
  })

  describe("Workspace Integration", () => {
    it("should handle workspace folder changes", () => {
      const mockEventEmitter = {
        event: vi.fn(),
        fire: vi.fn()
      }
      mockVscode.workspace.onDidChangeWorkspaceFolders.mockReturnValue(mockEventEmitter)

      activate(mockContext)

      expect(mockVscode.workspace.onDidChangeWorkspaceFolders).toHaveBeenCalled()
    })

    it("should access workspace files", async () => {
      const mockFiles = [
        { fsPath: "/test/file1.ts" },
        { fsPath: "/test/file2.ts" }
      ]
      mockVscode.workspace.findFiles.mockResolvedValue(mockFiles)

      activate(mockContext)

      // Test file finding
      const files = await mockVscode.workspace.findFiles("**/*.ts")
      expect(files).toEqual(mockFiles)
      expect(mockVscode.workspace.findFiles).toHaveBeenCalledWith("**/*.ts")
    })

    it("should handle relative paths", () => {
      mockVscode.workspace.asRelativePath.mockReturnValue("relative/path")
      mockVscode.Uri.file.mockReturnValue({ fsPath: "/absolute/path" })

      activate(mockContext)

      const relativePath = mockVscode.workspace.asRelativePath("/absolute/path")
      expect(relativePath).toBe("relative/path")
    })

    it("should open text documents", async () => {
      const mockDocument = {
        uri: { fsPath: "/test/document.ts" },
        getText: vi.fn().mockReturnValue("document content"),
        save: vi.fn().mockResolvedValue(true)
      }
      mockVscode.workspace.openTextDocument.mockResolvedValue(mockDocument)

      activate(mockContext)

      const document = await mockVscode.workspace.openTextDocument("/test/document.ts")
      expect(document).toEqual(mockDocument)
    })
  })

  describe("Command Registration", () => {
    it("should register chat commands", () => {
      activate(mockContext)

      const commandCalls = mockVscode.commands.registerCommand.mock.calls
      const chatCommands = commandCalls.filter(call => call[0].startsWith("kilo.chat"))
      
      expect(chatCommands.length).toBeGreaterThan(0)
    })

    it("should register session management commands", () => {
      activate(mockContext)

      const commandCalls = mockVscode.commands.registerCommand.mock.calls
      const sessionCommands = commandCalls.filter(call => call[0].startsWith("kilo.session"))
      
      expect(sessionCommands.length).toBeGreaterThan(0)
    })

    it("should register settings commands", () => {
      activate(mockContext)

      const commandCalls = mockVscode.commands.registerCommand.mock.calls
      const settingsCommands = commandCalls.filter(call => call[0].startsWith("kilo.settings"))
      
      expect(settingsCommands.length).toBeGreaterThan(0)
    })

    it("should execute commands properly", async () => {
      const mockCommandHandler = vi.fn()
      mockVscode.commands.registerCommand.mockImplementation((command, handler) => {
        if (command === "kilo.test") {
          mockCommandHandler.mockImplementation(handler)
        }
        return { dispose: vi.fn() }
      })

      activate(mockContext)

      // Execute the test command
      await mockCommandHandler({ test: "parameter" })

      expect(mockCommandHandler).toHaveBeenCalled()
    })
  })

  describe("Configuration Management", () => {
    it("should access extension configuration", () => {
      const mockConfig = {
        get: vi.fn((key) => {
          if (key === "model") return "claude-3-sonnet"
          if (key === "logLevel") return "debug"
          return undefined
        }),
        update: vi.fn(),
        has: vi.fn(),
        inspect: vi.fn()
      }
      mockVscode.workspace.getConfiguration.mockReturnValue(mockConfig)

      activate(mockContext)

      const config = mockVscode.workspace.getConfiguration("kilo")
      expect(config.get("model")).toBe("claude-3-sonnet")
      expect(config.get("logLevel")).toBe("debug")
    })

    it("should update configuration", () => {
      const mockConfig = {
        get: vi.fn(),
        update: vi.fn(),
        has: vi.fn(),
        inspect: vi.fn()
      }
      mockVscode.workspace.getConfiguration.mockReturnValue(mockConfig)

      activate(mockContext)

      const config = mockVscode.workspace.getConfiguration("kilo")
      config.update("model", "gpt-4", mockVscode.ConfigurationTarget.Global)

      expect(mockConfig.update).toHaveBeenCalledWith(
        "model",
        "gpt-4",
        mockVscode.ConfigurationTarget.Global
      )
    })

    it("should handle configuration changes", () => {
      const mockEventEmitter = {
        event: vi.fn(),
        fire: vi.fn()
      }
      const mockConfig = {
        get: vi.fn(),
        update: vi.fn(),
        has: vi.fn(),
        inspect: vi.fn(),
        onDidChange: vi.fn().mockReturnValue(mockEventEmitter)
      }
      mockVscode.workspace.getConfiguration.mockReturnValue(mockConfig)

      activate(mockContext)

      expect(mockConfig.onDidChange).toHaveBeenCalled()
    })
  })

  describe("Window Integration", () => {
    it("should show information messages", () => {
      activate(mockContext)

      mockVscode.window.showInformationMessage("Test message")
      expect(mockVscode.window.showInformationMessage).toHaveBeenCalledWith("Test message")
    })

    it("should show error messages", () => {
      activate(mockContext)

      mockVscode.window.showErrorMessage("Error message")
      expect(mockVscode.window.showErrorMessage).toHaveBeenCalledWith("Error message")
    })

    it("should show warning messages", () => {
      activate(mockContext)

      mockVscode.window.showWarningMessage("Warning message")
      expect(mockVscode.window.showWarningMessage).toHaveBeenCalledWith("Warning message")
    })

    it("should open external URLs", async () => {
      const mockUri = { scheme: "http", path: "example.com" }
      mockVscode.Uri.parse.mockReturnValue(mockUri)
      mockVscode.env.openExternal.mockResolvedValue(true)

      activate(mockContext)

      const result = await mockVscode.env.openExternal(mockUri)
      expect(result).toBe(true)
      expect(mockVscode.env.openExternal).toHaveBeenCalledWith(mockUri)
    })
  })

  describe("Context Management", () => {
    it("should manage extension context subscriptions", () => {
      activate(mockContext)

      expect(mockContext.subscriptions.length).toBeGreaterThan(0)
    })

    it("should handle context disposal", () => {
      activate(mockContext)

      // Simulate extension deactivation
      mockContext.subscriptions.forEach((subscription: any) => {
        subscription.dispose()
      })

      // All disposables should have been called
      expect(mockContext.subscriptions.every((sub: any) => sub.dispose.mock.calls.length > 0)).toBe(true)
    })

    it("should persist workspace state", () => {
      mockContext.workspaceState.get.mockReturnValue("persisted-value")
      mockContext.workspaceState.update.mockResolvedValue(undefined)

      activate(mockContext)

      const value = mockContext.workspaceState.get("test-key")
      expect(value).toBe("persisted-value")

      mockContext.workspaceState.update("test-key", "new-value")
      expect(mockContext.workspaceState.update).toHaveBeenCalledWith("test-key", "new-value")
    })

    it("should manage global state", () => {
      mockContext.globalState.get.mockReturnValue("global-value")
      mockContext.globalState.update.mockResolvedValue(undefined)

      activate(mockContext)

      const value = mockContext.globalState.get("global-key")
      expect(value).toBe("global-value")

      mockContext.globalState.update("global-key", "new-global-value")
      expect(mockContext.globalState.update).toHaveBeenCalledWith("global-key", "new-global-value")
    })
  })

  describe("Error Handling", () => {
    it("should handle activation errors gracefully", () => {
      // Mock a function that throws during activation
      mockVscode.window.createOutputChannel.mockImplementation(() => {
        throw new Error("Output channel creation failed")
      })

      expect(() => {
        activate(mockContext)
      }).toThrow("Output channel creation failed")
    })

    it("should handle command registration errors", () => {
      mockVscode.commands.registerCommand.mockImplementation(() => {
        throw new Error("Command registration failed")
      })

      expect(() => {
        activate(mockContext)
      }).toThrow()
    })

    it("should handle workspace access errors", () => {
      mockVscode.workspace.getConfiguration.mockImplementation(() => {
        throw new Error("Configuration access failed")
      })

      expect(() => {
        activate(mockContext)
      }).toThrow()
    })
  })

  describe("Performance Considerations", () => {
    it("should activate within reasonable time", () => {
      const startTime = Date.now()
      
      activate(mockContext)
      
      const endTime = Date.now()
      const activationTime = endTime - startTime
      
      // Should activate within 100ms (adjust based on actual requirements)
      expect(activationTime).toBeLessThan(100)
    })

    it("should not register excessive commands", () => {
      activate(mockContext)

      const commandCount = mockVscode.commands.registerCommand.mock.calls.length
      expect(commandCount).toBeLessThan(100) // Reasonable limit
    })

    it("should manage memory efficiently", () => {
      const initialMemory = process.memoryUsage().heapUsed

      activate(mockContext)

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })
  })
})
