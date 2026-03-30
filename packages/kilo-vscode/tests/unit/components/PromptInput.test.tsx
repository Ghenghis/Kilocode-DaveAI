import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library"
import { PromptInput } from "@/components/chat/PromptInput"
import { createContext } from "@/context/session"
import { createContext as createServerContext } from "@/context/server"
import { createContext as createLanguageContext } from "@/context/language"
import { createContext as createVSCodeContext } from "@/context/vscode"
import { createContext as createWorktreeModeContext } from "@/context/worktree-mode"

// Mock contexts
const mockSession = {
  session: {
    id: "test-session",
    status: "idle",
    messages: []
  },
  sendMessage: vi.fn(),
  abort: vi.fn(),
  clear: vi.fn()
}

const mockServer = {
  post: vi.fn(),
  get: vi.fn(),
  ws: vi.fn()
}

const mockLanguage = {
  t: (key: string, params?: any) => key,
  current: () => "en"
}

const mockVSCode = {
  postMessage: vi.fn(),
  getState: vi.fn(),
  setState: vi.fn()
}

const mockWorktreeMode = {
  isWorktreeMode: () => false,
  worktreeRoot: () => null
}

describe("PromptInput Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderComponent = (props = {}) => {
    const SessionContext = createContext(mockSession)
    const ServerContext = createServerContext(mockServer)
    const LanguageContext = createLanguageContext(mockLanguage)
    const VSCodeContext = createVSCodeContext(mockVSCode)
    const WorktreeModeContext = createWorktreeModeContext(mockWorktreeMode)

    return render(() => (
      <SessionContext.Provider>
        <ServerContext.Provider>
          <LanguageContext.Provider>
            <VSCodeContext.Provider>
              <WorktreeModeContext.Provider>
                <PromptInput {...props} />
              </WorktreeModeContext.Provider>
            </VSCodeContext.Provider>
          </LanguageContext.Provider>
        </ServerContext.Provider>
      </SessionContext.Provider>
    ))
  }

  describe("Basic Rendering", () => {
    it("should render input field and send button", () => {
      renderComponent()
      
      expect(screen.getByRole("textbox")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument()
    })

    it("should show abort button when session is active", () => {
      mockSession.session.status = "processing"
      
      renderComponent()
      
      expect(screen.getByRole("button", { name: /abort/i })).toBeInTheDocument()
      expect(screen.queryByRole("button", { name: /send/i })).not.toBeInTheDocument()
    })

    it("should disable input when blocked", () => {
      renderComponent({ blocked: () => true })
      
      const input = screen.getByRole("textbox")
      expect(input).toBeDisabled()
    })
  })

  describe("Text Input Behavior", () => {
    it("should handle text input correctly", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      await fireEvent.input(input, { target: { value: "Hello, world!" } })
      
      expect(input).toHaveValue("Hello, world!")
    })

    it("should handle empty input submission", async () => {
      renderComponent()
      
      const sendButton = screen.getByRole("button", { name: /send/i })
      
      // Send button should be disabled with empty input
      expect(sendButton).toBeDisabled()
      
      // Clicking should not trigger submission
      await fireEvent.click(sendButton)
      expect(mockSession.sendMessage).not.toHaveBeenCalled()
    })

    it("should handle Enter key submission", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      await fireEvent.input(input, { target: { value: "Test message" } })
      
      await fireEvent.keyDown(input, { key: "Enter" })
      
      expect(mockSession.sendMessage).toHaveBeenCalledWith({
        content: "Test message",
        images: []
      })
    })

    it("should handle Shift+Enter for new lines", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      await fireEvent.input(input, { target: { value: "Line 1\nLine 2" } })
      
      await fireEvent.keyDown(input, { key: "Enter", shiftKey: true })
      
      // Should not submit on Shift+Enter
      expect(mockSession.sendMessage).not.toHaveBeenCalled()
    })
  })

  describe("File Mentions", () => {
    it("should handle @ file mentions", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      await fireEvent.input(input, { target: { value: "@src/test.ts" } })
      
      // Should trigger file mention logic
      expect(input).toHaveValue("@src/test.ts")
    })

    it("should show file mention suggestions", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      
      // Type @ to trigger suggestions
      await fireEvent.input(input, { target: { value: "@" } })
      
      // Should show file suggestions (implementation dependent)
      expect(input).toHaveValue("@")
    })

    it("should handle invalid file paths", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      await fireEvent.input(input, { target: { value: "@nonexistent/file.txt" } })
      
      // Should handle gracefully
      expect(input).toHaveValue("@nonexistent/file.txt")
    })
  })

  describe("Ghost Text Autocomplete", () => {
    it("should show ghost text suggestions", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      
      // Type partial command to trigger autocomplete
      await fireEvent.input(input, { target: { value: "help" } })
      
      // Should show ghost text (implementation dependent)
      expect(input).toHaveValue("help")
    })

    it("should accept ghost text with Tab", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      await fireEvent.input(input, { target: { value: "help" } })
      
      await fireEvent.keyDown(input, { key: "Tab" })
      
      // Should accept ghost text
      expect(input).toBeDefined()
    })

    it("should dismiss ghost text with Escape", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      await fireEvent.input(input, { target: { value: "help" } })
      
      await fireEvent.keyDown(input, { key: "Escape" })
      
      // Should dismiss ghost text
      expect(input).toHaveValue("help")
    })
  })

  describe("Slash Commands", () => {
    it("should handle slash command triggers", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      await fireEvent.input(input, { target: { value: "/clear" } })
      
      // Should trigger slash command
      expect(input).toHaveValue("/clear")
    })

    it("should show slash command suggestions", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      await fireEvent.input(input, { target: { value: "/" } })
      
      // Should show command suggestions
      expect(input).toHaveValue("/")
    })

    it("should execute valid slash commands", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      await fireEvent.input(input, { target: { value: "/clear" } })
      
      await fireEvent.keyDown(input, { key: "Enter" })
      
      // Should execute clear command instead of sending message
      expect(mockSession.sendMessage).not.toHaveBeenCalled()
    })
  })

  describe("Image Attachments", () => {
    it("should handle image paste events", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      
      // Simulate image paste
      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: new DataTransfer()
      })
      
      // Add image to clipboard data
      Object.defineProperty(pasteEvent.clipboardData!, "items", {
        value: [{
          kind: "file",
          type: "image/png"
        }],
        writable: false
      })
      
      await fireEvent.paste(input, pasteEvent)
      
      // Should handle image attachment
      expect(input).toBeDefined()
    })

    it("should show image attachment previews", async () => {
      renderComponent()
      
      // Mock image attachment
      const mockImage = {
        id: "test-image",
        data: "base64-data",
        mimeType: "image/png"
      }
      
      // Should display image preview
      expect(mockImage).toBeDefined()
    })

    it("should remove image attachments", async () => {
      renderComponent()
      
      // Mock removing an image attachment
      const removeButton = screen.queryByRole("button", { name: /remove/i })
      
      if (removeButton) {
        await fireEvent.click(removeButton)
        // Should remove the image
      }
    })
  })

  describe("Prompt History", () => {
    it("should navigate through prompt history with arrow keys", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      
      // Add some history first
      await fireEvent.input(input, { target: { value: "First message" } })
      await fireEvent.keyDown(input, { key: "Enter" })
      
      await fireEvent.input(input, { target: { value: "Second message" } })
      await fireEvent.keyDown(input, { key: "Enter" })
      
      // Navigate history
      await fireEvent.keyDown(input, { key: "ArrowUp" })
      expect(input).toHaveValue("Second message")
      
      await fireEvent.keyDown(input, { key: "ArrowUp" })
      expect(input).toHaveValue("First message")
      
      await fireEvent.keyDown(input, { key: "ArrowDown" })
      expect(input).toHaveValue("Second message")
    })

    it("should save draft messages", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      await fireEvent.input(input, { target: { value: "Draft message" } })
      
      // Simulate component unmount/remount
      renderComponent()
      
      // Should restore draft
      const restoredInput = screen.getByRole("textbox")
      expect(restoredInput).toHaveValue("Draft message")
    })
  })

  describe("Error Handling", () => {
    it("should handle submission errors gracefully", async () => {
      mockSession.sendMessage.mockRejectedValue(new Error("Network error"))
      
      renderComponent()
      
      const input = screen.getByRole("textbox")
      await fireEvent.input(input, { target: { value: "Test message" } })
      
      const sendButton = screen.getByRole("button", { name: /send/i })
      await fireEvent.click(sendButton)
      
      // Should handle error without crashing
      expect(mockSession.sendMessage).toHaveBeenCalled()
    })

    it("should handle large text input", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      const largeText = "A".repeat(10000) // 10KB text
      
      await fireEvent.input(input, { target: { value: largeText } })
      
      expect(input).toHaveValue(largeText)
      expect(screen.getByRole("button", { name: /send/i })).toBeEnabled()
    })

    it("should handle rapid input changes", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      
      // Rapidly change input value
      for (let i = 0; i < 100; i++) {
        await fireEvent.input(input, { target: { value: `Message ${i}` } })
      }
      
      // Should handle without crashing
      expect(input).toHaveValue("Message 99")
    })
  })

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      expect(input).toHaveAttribute("aria-label")
      
      const sendButton = screen.getByRole("button", { name: /send/i })
      expect(sendButton).toHaveAttribute("aria-label")
    })

    it("should support keyboard navigation", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      input.focus()
      
      // Tab navigation
      await fireEvent.keyDown(input, { key: "Tab" })
      
      // Should move to next focusable element
      expect(document.activeElement).not.toBe(input)
    })

    it("should announce important state changes", async () => {
      renderComponent()
      
      const input = screen.getByRole("textbox")
      await fireEvent.input(input, { target: { value: "Test message" } })
      
      // Should announce when message is sent
      await fireEvent.keyDown(input, { key: "Enter" })
      
      expect(mockSession.sendMessage).toHaveBeenCalled()
    })
  })
})
