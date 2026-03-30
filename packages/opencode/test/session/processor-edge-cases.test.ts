import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { SessionProcessor } from "@/session/processor"
import { MessageV2 } from "@/session/message-v2"
import { Config } from "@/config/config"
import { Provider } from "@/provider/provider"

describe("SessionProcessor Edge Cases", () => {
  let mockConfig: any
  let mockModel: Provider.Model
  let mockAgent: any
  let mockAbortSignal: AbortSignal

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockConfig = {
      get: vi.fn().mockResolvedValue({})
    }

    mockModel = {
      id: "test-model",
      name: "Test Model",
      provider: {
        id: "test-provider",
        name: "Test Provider"
      }
    } as Provider.Model

    mockAgent = {
      id: "test-agent",
      name: "Test Agent"
    }

    mockAbortSignal = new AbortController().signal
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("Empty Tool Call Handling", () => {
    it("should handle empty tool calls array", async () => {
      const assistantMessage = {
        role: "assistant",
        content: "No tools needed",
        parts: []
      } as MessageV2.Assistant

      const processor = SessionProcessor.create({
        assistantMessage,
        sessionID: "test-session",
        model: mockModel,
        abort: mockAbortSignal
      })

      const mockStreamInput = {
        text: "Simple response",
        toolCalls: [],
        done: true
      }

      // Should not throw when processing empty tool calls
      await expect(processor.process(mockStreamInput)).resolves.toBeDefined()
    })

    it("should handle null/undefined tool calls", async () => {
      const assistantMessage = {
        role: "assistant", 
        content: "Response",
        parts: null as any
      } as MessageV2.Assistant

      const processor = SessionProcessor.create({
        assistantMessage,
        sessionID: "test-session", 
        model: mockModel,
        abort: mockAbortSignal
      })

      const mockStreamInput = {
        text: "Response",
        toolCalls: null,
        done: true
      }

      await expect(processor.process(mockStreamInput)).resolves.toBeDefined()
    })
  })

  describe("Malformed Tool Call Handling", () => {
    it("should handle tool calls with missing required fields", async () => {
      const assistantMessage = {
        role: "assistant",
        content: "Tool response",
        parts: []
      } as MessageV2.Assistant

      const processor = SessionProcessor.create({
        assistantMessage,
        sessionID: "test-session",
        model: mockModel,
        abort: mockAbortSignal
      })

      const malformedToolCalls = [
        { id: "", function: { name: "", arguments: "" } }, // Empty fields
        { id: "valid-id", function: null }, // Null function
        { id: "valid-id", function: { name: "test", arguments: null } } // Null args
      ]

      const mockStreamInput = {
        text: "Processing tools",
        toolCalls: malformedToolCalls,
        done: true
      }

      // Should handle malformed tool calls gracefully
      await expect(processor.process(mockStreamInput)).resolves.toBeDefined()
    })

    it("should handle tool calls with invalid JSON arguments", async () => {
      const assistantMessage = {
        role: "assistant",
        content: "Tool response",
        parts: []
      } as MessageV2.Assistant

      const processor = SessionProcessor.create({
        assistantMessage,
        sessionID: "test-session",
        model: mockModel,
        abort: mockAbortSignal
      })

      const invalidJsonToolCalls = [
        {
          id: "test-1",
          function: {
            name: "test_function",
            arguments: "{ invalid json string"
          }
        }
      ]

      const mockStreamInput = {
        text: "Processing tools",
        toolCalls: invalidJsonToolCalls,
        done: true
      }

      await expect(processor.process(mockStreamInput)).resolves.toBeDefined()
    })
  })

  describe("Abort Signal Handling", () => {
    it("should handle immediate abort signal", async () => {
      const abortController = new AbortController()
      abortController.abort()

      const assistantMessage = {
        role: "assistant",
        content: "Response",
        parts: []
      } as MessageV2.Assistant

      const processor = SessionProcessor.create({
        assistantMessage,
        sessionID: "test-session",
        model: mockModel,
        abort: abortController.signal
      })

      const mockStreamInput = {
        text: "Long response",
        toolCalls: [],
        done: false
      }

      // Should handle abort gracefully
      await expect(processor.process(mockStreamInput)).resolves.toBeDefined()
    })

    it("should handle abort during processing", async () => {
      const abortController = new AbortController()

      const assistantMessage = {
        role: "assistant",
        content: "Response",
        parts: []
      } as MessageV2.Assistant

      const processor = SessionProcessor.create({
        assistantMessage,
        sessionID: "test-session",
        model: mockModel,
        abort: abortController.signal
      })

      // Abort after a short delay
      setTimeout(() => abortController.abort(), 10)

      const mockStreamInput = {
        text: "Long response that gets interrupted",
        toolCalls: [],
        done: false
      }

      await expect(processor.process(mockStreamInput)).resolves.toBeDefined()
    })
  })

  describe("Large Content Handling", () => {
    it("should handle very large text responses", async () => {
      const assistantMessage = {
        role: "assistant",
        content: "Large response",
        parts: []
      } as MessageV2.Assistant

      const processor = SessionProcessor.create({
        assistantMessage,
        sessionID: "test-session",
        model: mockModel,
        abort: mockAbortSignal
      })

      // Create a very large text response (>1MB)
      const largeText = "A".repeat(1_000_000)

      const mockStreamInput = {
        text: largeText,
        toolCalls: [],
        done: true
      }

      await expect(processor.process(mockStreamInput)).resolves.toBeDefined()
    })

    it("should handle many tool calls", async () => {
      const assistantMessage = {
        role: "assistant",
        content: "Many tools",
        parts: []
      } as MessageV2.Assistant

      const processor = SessionProcessor.create({
        assistantMessage,
        sessionID: "test-session",
        model: mockModel,
        abort: mockAbortSignal
      })

      // Create many tool calls
      const manyToolCalls = Array.from({ length: 1000 }, (_, i) => ({
        id: `tool-${i}`,
        function: {
          name: "test_function",
          arguments: JSON.stringify({ index: i })
        }
      }))

      const mockStreamInput = {
        text: "Processing many tools",
        toolCalls: manyToolCalls,
        done: true
      }

      await expect(processor.process(mockStreamInput)).resolves.toBeDefined()
    })
  })

  describe("Concurrent Processing", () => {
    it("should handle multiple concurrent processes", async () => {
      const assistantMessage = {
        id: "test-msg-1",
        sessionID: "test-session-1",
        role: "assistant" as const,
        time: { created: Date.now() },
        content: "Concurrent response",
        parts: []
      } as unknown as MessageV2.Assistant

      const processor1 = SessionProcessor.create({
        assistantMessage,
        sessionID: "test-session-1",
        model: mockModel,
        abort: mockAbortSignal
      })

      const processor2 = SessionProcessor.create({
        assistantMessage,
        sessionID: "test-session-2", 
        model: mockModel,
        abort: mockAbortSignal
      })

      const mockStreamInput = {
        user: "test-user",
        sessionID: "test-session-concurrent",
        model: mockModel,
        agent: mockAgent,
        system: "You are a helpful assistant",
        abort: mockAbortSignal,
        messages: [],
        tools: [],
        text: "Concurrent processing",
        toolCalls: [],
        done: true
      }

      // Should handle concurrent processing without interference
      const [result1, result2] = await Promise.all([
        processor1.process(mockStreamInput),
        processor2.process(mockStreamInput)
      ])

      expect(result1).toBeDefined()
      expect(result2).toBeDefined()
    })
  })

  describe("Resource Exhaustion", () => {
    it("should handle memory pressure scenarios", async () => {
      const assistantMessage = {
        id: "test-msg-memory",
        sessionID: "test-session",
        role: "assistant" as const,
        time: { created: Date.now() },
        content: "Memory test",
        parts: []
      } as unknown as MessageV2.Assistant

      const processor = SessionProcessor.create({
        assistantMessage,
        sessionID: "test-session",
        model: mockModel,
        abort: mockAbortSignal
      })

      // Simulate memory pressure with large data
      const largeToolCalls = Array.from({ length: 100 }, (_, i) => ({
        id: `memory-test-${i}`,
        function: {
          name: "memory_test_function",
          arguments: JSON.stringify({
            data: "A".repeat(10_000), // 10KB per tool call
            index: i
          })
        }
      }))

      const mockStreamInput = {
        user: "test-user",
        sessionID: "test-session",
        model: mockModel,
        agent: mockAgent,
        system: "You are a helpful assistant",
        abort: mockAbortSignal,
        messages: [],
        tools: [],
        text: "Memory pressure test",
        toolCalls: largeToolCalls,
        done: true
      }

      await expect(processor.process(mockStreamInput)).resolves.toBeDefined()
    })
  })
})
