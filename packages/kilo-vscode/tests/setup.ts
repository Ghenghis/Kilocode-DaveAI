import { beforeAll, afterEach, afterAll } from "vitest"

// Mock VS Code API
const mockVSCode = {
  window: {
    createOutputChannel: vi.fn(),
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    showWarningMessage: vi.fn()
  },
  workspace: {
    getConfiguration: vi.fn(),
    workspaceFolders: [],
    rootPath: "/test/workspace"
  },
  commands: {
    registerCommand: vi.fn(),
    executeCommand: vi.fn()
  },
  env: {
    appName: "VS Code Test"
  },
  Uri: {
    file: (path: string) => ({ fsPath: path }),
    parse: vi.fn()
  },
  Range: vi.fn(),
  Position: vi.fn(),
  Selection: vi.fn()
}

// Setup mocks
beforeAll(() => {
  global.vscode = mockVSCode
  global.require = vi.fn()
})

afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  vi.restoreAllMocks()
})
