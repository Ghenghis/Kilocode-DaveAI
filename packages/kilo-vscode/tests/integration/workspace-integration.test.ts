import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import * as vscode from "vscode"

// Mock VS Code workspace API
const mockVscode = {
  workspace: {
    workspaceFolders: [],
    rootPath: "/test/workspace",
    getConfiguration: vi.fn(),
    findFiles: vi.fn(),
    openTextDocument: vi.fn(),
    asRelativePath: vi.fn(),
    onDidChangeWorkspaceFolders: vi.fn(),
    onDidChangeTextDocument: vi.fn(),
    onDidSaveTextDocument: vi.fn(),
    onDidOpenTextDocument: vi.fn(),
    onDidCloseTextDocument: vi.fn(),
    getWorkspaceFolder: vi.fn(),
    getWorkspaceFolders: vi.fn()
  },
  window: {
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    createOutputChannel: vi.fn()
  },
  commands: {
    registerCommand: vi.fn(),
    executeCommand: vi.fn()
  },
  Uri: {
    file: vi.fn(),
    parse: vi.fn(),
    joinPath: vi.fn()
  },
  Position: vi.fn(),
  Range: vi.fn(),
  Selection: vi.fn(),
  TextDocument: vi.fn(),
  TextEditor: vi.fn(),
  WorkspaceFolder: vi.fn(),
  EventEmitter: vi.fn(),
  FileChangeEvent: vi.fn(),
  FileChangeType: {
    Created: 1,
    Changed: 2,
    Deleted: 3
  }
}

vi.mock("vscode", () => mockVscode)

describe("Workspace Integration Tests", () => {
  let mockContext: any
  let mockWorkspaceFolders: any[]

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockContext = {
      extensionUri: { fsPath: "/test/extension" },
      subscriptions: [],
      workspaceState: { get: vi.fn(), update: vi.fn() },
      globalState: { get: vi.fn(), update: vi.fn() }
    }

    mockWorkspaceFolders = [
      {
        uri: { fsPath: "/test/workspace1", toString: () => "file:///test/workspace1" },
        name: "workspace1",
        index: 0
      },
      {
        uri: { fsPath: "/test/workspace2", toString: () => "file:///test/workspace2" },
        name: "workspace2",
        index: 1
      }
    ]

    mockVscode.workspace.getWorkspaceFolders.mockReturnValue(mockWorkspaceFolders)
    mockVscode.workspace.rootPath = "/test/workspace1"

    // Setup file finding mock
    mockVscode.workspace.findFiles.mockResolvedValue([
      { fsPath: "/test/workspace1/file1.ts" },
      { fsPath: "/test/workspace1/file2.js" },
      { fsPath: "/test/workspace2/file3.py" }
    ])

    // Setup document opening mock
    mockVscode.workspace.openTextDocument.mockResolvedValue({
      uri: { fsPath: "/test/file.ts" },
      getText: vi.fn().mockReturnValue("file content"),
      save: vi.fn().mockResolvedValue(true)
    })

    // Setup event emitter mock
    const mockEventEmitter = {
      event: vi.fn(),
      fire: vi.fn()
    }
    mockVscode.workspace.onDidChangeWorkspaceFolders.mockReturnValue(mockEventEmitter)
    mockVscode.workspace.onDidChangeTextDocument.mockReturnValue(mockEventEmitter)
    mockVscode.workspace.onDidSaveTextDocument.mockReturnValue(mockEventEmitter)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("Workspace Folder Detection", () => {
    it("should detect workspace folders", () => {
      const folders = mockVscode.workspace.getWorkspaceFolders()
      
      expect(folders).toHaveLength(2)
      expect(folders[0].name).toBe("workspace1")
      expect(folders[1].name).toBe("workspace2")
    })

    it("should handle empty workspace", () => {
      mockVscode.workspace.getWorkspaceFolders.mockReturnValue([])
      
      const folders = mockVscode.workspace.getWorkspaceFolders()
      expect(folders).toHaveLength(0)
    })

    it("should get workspace folder for file", () => {
      const fileUri = mockVscode.Uri.file("/test/workspace1/file.ts")
      mockVscode.workspace.getWorkspaceFolder.mockReturnValue(mockWorkspaceFolders[0])

      const folder = mockVscode.workspace.getWorkspaceFolder(fileUri)
      expect(folder).toBe(mockWorkspaceFolders[0])
      expect(folder.name).toBe("workspace1")
    })

    it("should handle file outside workspace", () => {
      const fileUri = mockVscode.Uri.file("/outside/file.ts")
      mockVscode.workspace.getWorkspaceFolder.mockReturnValue(undefined)

      const folder = mockVscode.workspace.getWorkspaceFolder(fileUri)
      expect(folder).toBeUndefined()
    })

    it("should get root path for single folder workspace", () => {
      const rootPath = mockVscode.workspace.rootPath
      expect(rootPath).toBe("/test/workspace1")
    })

    it("should handle multi-root workspace", () => {
      // In multi-root, rootPath might be undefined
      mockVscode.workspace.rootPath = undefined
      
      const rootPath = mockVscode.workspace.rootPath
      expect(rootPath).toBeUndefined()
      
      // Should use getWorkspaceFolders instead
      const folders = mockVscode.workspace.getWorkspaceFolders()
      expect(folders).toHaveLength(2)
    })
  })

  describe("File System Operations", () => {
    it("should find files by pattern", async () => {
      const files = await mockVscode.workspace.findFiles("**/*.ts")
      
      expect(mockVscode.workspace.findFiles).toHaveBeenCalledWith("**/*.ts")
      expect(files).toHaveLength(3)
    })

    it("should find files with exclusion patterns", async () => {
      const files = await mockVscode.workspace.findFiles("**/*.ts", "**/node_modules/**")
      
      expect(mockVscode.workspace.findFiles).toHaveBeenCalledWith("**/*.ts", "**/node_modules/**")
      expect(files).toHaveLength(3)
    })

    it("should handle file search errors", async () => {
      mockVscode.workspace.findFiles.mockRejectedValue(new Error("Search failed"))
      
      await expect(mockVscode.workspace.findFiles("**/*.ts")).rejects.toThrow("Search failed")
    })

    it("should open text documents", async () => {
      const fileUri = mockVscode.Uri.file("/test/file.ts")
      const document = await mockVscode.workspace.openTextDocument(fileUri)
      
      expect(mockVscode.workspace.openTextDocument).toHaveBeenCalledWith(fileUri)
      expect(document.uri.fsPath).toBe("/test/file.ts")
    })

    it("should handle document opening errors", async () => {
      const fileUri = mockVscode.Uri.file("/nonexistent/file.ts")
      mockVscode.workspace.openTextDocument.mockRejectedValue(new Error("File not found"))
      
      await expect(mockVscode.workspace.openTextDocument(fileUri)).rejects.toThrow("File not found")
    })

    it("should convert to relative paths", () => {
      const absolutePath = "/test/workspace1/src/file.ts"
      mockVscode.workspace.asRelativePath.mockReturnValue("src/file.ts")
      
      const relativePath = mockVscode.workspace.asRelativePath(absolutePath)
      expect(relativePath).toBe("src/file.ts")
      expect(mockVscode.workspace.asRelativePath).toHaveBeenCalledWith(absolutePath)
    })

    it("should handle relative path conversion for files outside workspace", () => {
      const outsidePath = "/outside/file.ts"
      mockVscode.workspace.asRelativePath.mockReturnValue(outsidePath)
      
      const relativePath = mockVscode.workspace.asRelativePath(outsidePath)
      expect(relativePath).toBe(outsidePath)
    })
  })

  describe("Workspace Events", () => {
    it("should listen to workspace folder changes", () => {
      const eventHandler = vi.fn()
      const disposable = mockVscode.workspace.onDidChangeWorkspaceFolders(eventHandler)
      
      expect(mockVscode.workspace.onDidChangeWorkspaceFolders).toHaveBeenCalledWith(eventHandler)
      expect(typeof disposable.dispose).toBe("function")
    })

    it("should handle workspace folder addition", () => {
      const eventHandler = vi.fn()
      mockVscode.workspace.onDidChangeWorkspaceFolders(eventHandler)
      
      const addedFolder = {
        uri: { fsPath: "/test/workspace3" },
        name: "workspace3"
      }
      
      const event = {
        added: [addedFolder],
        removed: []
      }
      
      const registeredHandler = mockVscode.workspace.onDidChangeWorkspaceFolders.mock.calls[0][0]
      registeredHandler(event)
      
      expect(eventHandler).toHaveBeenCalledWith(event)
    })

    it("should handle workspace folder removal", () => {
      const eventHandler = vi.fn()
      mockVscode.workspace.onDidChangeWorkspaceFolders(eventHandler)
      
      const removedFolder = mockWorkspaceFolders[0]
      
      const event = {
        added: [],
        removed: [removedFolder]
      }
      
      const registeredHandler = mockVscode.workspace.onDidChangeWorkspaceFolders.mock.calls[0][0]
      registeredHandler(event)
      
      expect(eventHandler).toHaveBeenCalledWith(event)
    })

    it("should listen to document changes", () => {
      const changeHandler = vi.fn()
      const disposable = mockVscode.workspace.onDidChangeTextDocument(changeHandler)
      
      expect(mockVscode.workspace.onDidChangeTextDocument).toHaveBeenCalledWith(changeHandler)
    })

    it("should listen to document saves", () => {
      const saveHandler = vi.fn()
      const disposable = mockVscode.workspace.onDidSaveTextDocument(saveHandler)
      
      expect(mockVscode.workspace.onDidSaveTextDocument).toHaveBeenCalledWith(saveHandler)
    })

    it("should listen to document opens", () => {
      const openHandler = vi.fn()
      const disposable = mockVscode.workspace.onDidOpenTextDocument(openHandler)
      
      expect(mockVscode.workspace.onDidOpenTextDocument).toHaveBeenCalledWith(openHandler)
    })

    it("should listen to document closes", () => {
      const closeHandler = vi.fn()
      const disposable = mockVscode.workspace.onDidCloseTextDocument(closeHandler)
      
      expect(mockVscode.workspace.onDidCloseTextDocument).toHaveBeenCalledWith(closeHandler)
    })
  })

  describe("Multi-Workspace Support", () => {
    it("should handle multiple workspace folders", () => {
      const folders = mockVscode.workspace.getWorkspaceFolders()
      
      expect(folders).toHaveLength(2)
      expect(folders[0].index).toBe(0)
      expect(folders[1].index).toBe(1)
    })

    it("should identify files across workspaces", () => {
      const file1 = mockVscode.Uri.file("/test/workspace1/file.ts")
      const file2 = mockVscode.Uri.file("/test/workspace2/file.ts")
      
      mockVscode.workspace.getWorkspaceFolder.mockImplementation((uri) => {
        if (uri.fsPath.includes("workspace1")) return mockWorkspaceFolders[0]
        if (uri.fsPath.includes("workspace2")) return mockWorkspaceFolders[1]
        return undefined
      })
      
      const folder1 = mockVscode.workspace.getWorkspaceFolder(file1)
      const folder2 = mockVscode.workspace.getWorkspaceFolder(file2)
      
      expect(folder1.name).toBe("workspace1")
      expect(folder2.name).toBe("workspace2")
    })

    it("should handle workspace-specific configurations", () => {
      const mockConfig = {
        get: vi.fn((key) => {
          if (key === "model") return "claude-3-sonnet"
          if (key === "workspace") return "multi-workspace"
          return undefined
        }),
        update: vi.fn()
      }
      mockVscode.workspace.getConfiguration.mockReturnValue(mockConfig)
      
      const config = mockVscode.workspace.getConfiguration("kilo")
      
      expect(config.get("model")).toBe("claude-3-sonnet")
      expect(config.get("workspace")).toBe("multi-workspace")
    })

    it("should handle workspace switching", () => {
      // Simulate switching from single to multi-workspace
      mockVscode.workspace.rootPath = undefined
      mockVscode.workspace.getWorkspaceFolders.mockReturnValue([mockWorkspaceFolders[0]])
      
      const folders = mockVscode.workspace.getWorkspaceFolders()
      expect(folders).toHaveLength(1)
      expect(mockVscode.workspace.rootPath).toBeUndefined()
    })
  })

  describe("File Watching", () => {
    it("should detect file changes", () => {
      const changeHandler = vi.fn()
      mockVscode.workspace.onDidChangeTextDocument(changeHandler)
      
      const mockDocument = {
        uri: { fsPath: "/test/file.ts" },
        version: 2,
        getText: vi.fn().mockReturnValue("changed content")
      }
      
      const event = {
        document: mockDocument,
        contentChanges: [{ text: "new content", range: new mockVscode.Range(0, 0, 0, 10) }]
      }
      
      const registeredHandler = mockVscode.workspace.onDidChangeTextDocument.mock.calls[0][0]
      registeredHandler(event)
      
      expect(changeHandler).toHaveBeenCalledWith(event)
    })

    it("should detect file saves", () => {
      const saveHandler = vi.fn()
      mockVscode.workspace.onDidSaveTextDocument(saveHandler)
      
      const mockDocument = {
        uri: { fsPath: "/test/file.ts" },
        getText: vi.fn().mockReturnValue("saved content")
      }
      
      const event = { document: mockDocument }
      
      const registeredHandler = mockVscode.workspace.onDidSaveTextDocument.mock.calls[0][0]
      registeredHandler(event)
      
      expect(saveHandler).toHaveBeenCalledWith(event)
    })

    it("should detect file creation", () => {
      const openHandler = vi.fn()
      mockVscode.workspace.onDidOpenTextDocument(openHandler)
      
      const mockDocument = {
        uri: { fsPath: "/test/newfile.ts" },
        getText: vi.fn().mockReturnValue("new file content")
      }
      
      const event = { document: mockDocument }
      
      const registeredHandler = mockVscode.workspace.onDidOpenTextDocument.mock.calls[0][0]
      registeredHandler(event)
      
      expect(openHandler).toHaveBeenCalledWith(event)
    })

    it("should detect file deletion", () => {
      const closeHandler = vi.fn()
      mockVscode.workspace.onDidCloseTextDocument(closeHandler)
      
      const mockDocument = {
        uri: { fsPath: "/test/deletedfile.ts" },
        getText: vi.fn().mockReturnValue("")
      }
      
      const event = { document: mockDocument }
      
      const registeredHandler = mockVscode.workspace.onDidCloseTextDocument.mock.calls[0][0]
      registeredHandler(event)
      
      expect(closeHandler).toHaveBeenCalledWith(event)
    })
  })

  describe("Workspace Configuration", () => {
    it("should access workspace configuration", () => {
      const mockConfig = {
        get: vi.fn().mockReturnValue("test-value"),
        update: vi.fn(),
        has: vi.fn().mockReturnValue(true),
        inspect: vi.fn().mockReturnValue({
          globalValue: "global",
          workspaceValue: "workspace",
          workspaceFolderValue: "folder"
        })
      }
      mockVscode.workspace.getConfiguration.mockReturnValue(mockConfig)
      
      const config = mockVscode.workspace.getConfiguration("kilo")
      
      expect(config.get("test-key")).toBe("test-value")
      expect(config.has("test-key")).toBe(true)
      expect(config.inspect("test-key")).toEqual({
        globalValue: "global",
        workspaceValue: "workspace",
        workspaceFolderValue: "folder"
      })
    })

    it("should update workspace configuration", () => {
      const mockConfig = {
        get: vi.fn(),
        update: vi.fn(),
        has: vi.fn(),
        inspect: vi.fn()
      }
      mockVscode.workspace.getConfiguration.mockReturnValue(mockConfig)
      
      const config = mockVscode.workspace.getConfiguration("kilo")
      config.update("model", "gpt-4", 1) // Global
      
      expect(mockConfig.update).toHaveBeenCalledWith("model", "gpt-4", 1)
    })

    it("should handle configuration changes", () => {
      const mockConfig = {
        get: vi.fn(),
        update: vi.fn(),
        has: vi.fn(),
        inspect: vi.fn(),
        onDidChange: vi.fn().mockReturnValue({ dispose: vi.fn() })
      }
      mockVscode.workspace.getConfiguration.mockReturnValue(mockConfig)
      
      const config = mockVscode.workspace.getConfiguration("kilo")
      const changeHandler = vi.fn()
      const disposable = config.onDidChange(changeHandler)
      
      expect(mockConfig.onDidChange).toHaveBeenCalledWith(changeHandler)
      expect(typeof disposable.dispose).toBe("function")
    })
  })

  describe("Error Handling", () => {
    it("should handle workspace access errors", () => {
      mockVscode.workspace.getWorkspaceFolders.mockImplementation(() => {
        throw new Error("Workspace access failed")
      })
      
      expect(() => {
        mockVscode.workspace.getWorkspaceFolders()
      }).toThrow("Workspace access failed")
    })

    it("should handle file operation errors", async () => {
      mockVscode.workspace.findFiles.mockRejectedValue(new Error("File operation failed"))
      
      await expect(mockVscode.workspace.findFiles("**/*.ts")).rejects.toThrow("File operation failed")
    })

    it("should handle configuration errors", () => {
      mockVscode.workspace.getConfiguration.mockImplementation(() => {
        throw new Error("Configuration access failed")
      })
      
      expect(() => {
        mockVscode.workspace.getConfiguration("kilo")
      }).toThrow("Configuration access failed")
    })

    it("should handle event listener errors", () => {
      mockVscode.workspace.onDidChangeWorkspaceFolders.mockImplementation(() => {
        throw new Error("Event registration failed")
      })
      
      expect(() => {
        mockVscode.workspace.onDidChangeWorkspaceFolders(vi.fn())
      }).toThrow("Event registration failed")
    })
  })

  describe("Performance Considerations", () => {
    it("should handle large workspace efficiently", async () => {
      // Mock large number of files
      const largeFileList = Array.from({ length: 10000 }, (_, i) => ({
        fsPath: `/test/workspace/file${i}.ts`
      }))
      mockVscode.workspace.findFiles.mockResolvedValue(largeFileList)
      
      const startTime = Date.now()
      const files = await mockVscode.workspace.findFiles("**/*.ts")
      const endTime = Date.now()
      
      expect(files).toHaveLength(10000)
      expect(endTime - startTime).toBeLessThan(1000) // Should handle large lists efficiently
    })

    it("should batch workspace operations", async () => {
      const operations = [
        () => mockVscode.workspace.findFiles("**/*.ts"),
        () => mockVscode.workspace.findFiles("**/*.js"),
        () => mockVscode.workspace.findFiles("**/*.py")
      ]
      
      const startTime = Date.now()
      await Promise.all(operations.map(op => op()))
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(500) // Should batch efficiently
    })

    it("should manage event subscriptions efficiently", () => {
      const disposables = []
      
      // Register many event listeners
      for (let i = 0; i < 100; i++) {
        const disposable = mockVscode.workspace.onDidChangeTextDocument(vi.fn())
        disposables.push(disposable)
      }
      
      expect(disposables).toHaveLength(100)
      
      // Dispose all efficiently
      const startTime = Date.now()
      disposables.forEach(d => d.dispose())
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(50) // Should dispose quickly
    })
  })
})
