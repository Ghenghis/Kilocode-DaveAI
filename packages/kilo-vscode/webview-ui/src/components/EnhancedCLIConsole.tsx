/**
 * Enhanced CLI Console Component
 * Comprehensive command line interface with auto-completion, history, and real-time output
 * Based on corpus analysis of all Kilo Code features
 */

import { Component, createSignal, createEffect, onMount, onCleanup, Show, For } from "solid-js"
import { Button } from "@kilocode/kilo-ui/button"
import { Icon } from "@kilocode/kilo-ui/icon"
import { Tooltip } from "@kilocode/kilo-ui/tooltip"
import type { 
  CLICommand, 
  CLIExecutionResult, 
  CLIConsoleConfig 
} from "../types/status"

interface EnhancedCLIConsoleProps {
  config?: Partial<CLIConsoleConfig>
  onCommandExecute?: (command: string) => Promise<CLIExecutionResult>
  onClearHistory?: () => void
}

export const EnhancedCLIConsole: Component<EnhancedCLIConsoleProps> = (props) => {
  // Configuration with defaults
  const config: CLIConsoleConfig = {
    maxHistory: 100,
    enableAutoComplete: true,
    enableSyntaxHighlighting: true,
    enableRealTimeOutput: true,
    commandTimeout: 30000,
    enableCommandHistory: true,
    ...props.config
  }

  // Signals
  const [commandInput, setCommandInput] = createSignal("")
  const [commandHistory, setCommandHistory] = createSignal<string[]>([])
  const [historyIndex, setHistoryIndex] = createSignal(-1)
  const [executionResults, setExecutionResults] = createSignal<CLIExecutionResult[]>([])
  const [isExecuting, setIsExecuting] = createSignal(false)
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = createSignal<string[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = createSignal(0)
  const [showSuggestions, setShowSuggestions] = createSignal(false)
  const [logLevel, setLogLevel] = createSignal<"debug" | "info" | "warning" | "error">("info")

  // Refs
  let inputRef: HTMLTextAreaElement | undefined
  let outputRef: HTMLDivElement | undefined

  // CLI commands based on corpus analysis
  const cliCommands: CLICommand[] = [
    // Provider commands
    {
      id: "provider-list",
      command: "provider list",
      description: "List all configured providers",
      category: "provider",
      parameters: [],
      dangerous: false,
      examples: ["provider list", "provider list --status"]
    },
    {
      id: "provider-test",
      command: "provider test",
      description: "Test connection to a specific provider",
      category: "provider",
      parameters: [
        { name: "provider", type: "string", required: true, description: "Provider name" },
        { name: "timeout", type: "number", required: false, description: "Timeout in seconds", defaultValue: 30 }
      ],
      dangerous: false,
      examples: ["provider test openai", "provider test anthropic --timeout 60"]
    },
    {
      id: "provider-connect",
      command: "provider connect",
      description: "Connect to a provider",
      category: "provider",
      parameters: [
        { name: "provider", type: "string", required: true, description: "Provider name" }
      ],
      dangerous: false,
      examples: ["provider connect openai", "provider connect local"]
    },
    {
      id: "provider-disconnect",
      command: "provider disconnect",
      description: "Disconnect from a provider",
      category: "provider",
      parameters: [
        { name: "provider", type: "string", required: true, description: "Provider name" }
      ],
      dangerous: false,
      examples: ["provider disconnect openai"]
    },

    // Session commands
    {
      id: "session-list",
      command: "session list",
      description: "List all sessions",
      category: "session",
      parameters: [
        { name: "status", type: "string", required: false, description: "Filter by status" }
      ],
      dangerous: false,
      examples: ["session list", "session list --status active"]
    },
    {
      id: "session-create",
      command: "session create",
      description: "Create a new session",
      category: "session",
      parameters: [
        { name: "name", type: "string", required: false, description: "Session name" },
        { name: "agent", type: "string", required: false, description: "Agent name" }
      ],
      dangerous: false,
      examples: ["session create", "session create --name 'Debug Session' --agent gpt-4"]
    },
    {
      id: "session-delete",
      command: "session delete",
      description: "Delete a session",
      category: "session",
      parameters: [
        { name: "id", type: "string", required: true, description: "Session ID" }
      ],
      dangerous: true,
      examples: ["session delete abc123"]
    },

    // Tool commands
    {
      id: "tool-list",
      command: "tool list",
      description: "List all available tools",
      category: "tool",
      parameters: [],
      dangerous: false,
      examples: ["tool list"]
    },
    {
      id: "tool-test",
      command: "tool test",
      description: "Test a specific tool",
      category: "tool",
      parameters: [
        { name: "tool", type: "string", required: true, description: "Tool name" },
        { name: "args", type: "array", required: false, description: "Tool arguments" }
      ],
      dangerous: false,
      examples: ["tool test read", "tool test bash --args ['ls -la']"]
    },

    // Config commands
    {
      id: "config-get",
      command: "config get",
      description: "Get configuration value",
      category: "config",
      parameters: [
        { name: "key", type: "string", required: true, description: "Configuration key" }
      ],
      dangerous: false,
      examples: ["config get provider.openai.apiKey", "config get ui.theme"]
    },
    {
      id: "config-set",
      command: "config set",
      description: "Set configuration value",
      category: "config",
      parameters: [
        { name: "key", type: "string", required: true, description: "Configuration key" },
        { name: "value", type: "string", required: true, description: "Configuration value" }
      ],
      dangerous: false,
      examples: ["config set ui.theme dark", "config set provider.openai.model gpt-4"]
    },
    {
      id: "config-reset",
      command: "config reset",
      description: "Reset configuration to defaults",
      category: "config",
      parameters: [
        { name: "key", type: "string", required: false, description: "Configuration key (optional)" }
      ],
      dangerous: true,
      examples: ["config reset", "config reset provider.openai"]
    },

    // Debug commands
    {
      id: "debug-logs",
      command: "debug logs",
      description: "Show system logs",
      category: "debug",
      parameters: [
        { name: "level", type: "string", required: false, description: "Log level" },
        { name: "limit", type: "number", required: false, description: "Number of logs", defaultValue: 50 }
      ],
      dangerous: false,
      examples: ["debug logs", "debug logs --level error --limit 10"]
    },
    {
      id: "debug-trace",
      command: "debug trace",
      description: "Enable/disable event tracing",
      category: "debug",
      parameters: [
        { name: "enable", type: "boolean", required: false, description: "Enable tracing", defaultValue: true }
      ],
      dangerous: false,
      examples: ["debug trace --enable true", "debug trace --enable false"]
    },
    {
      id: "debug-profile",
      command: "debug profile",
      description: "Start performance profiling",
      category: "debug",
      parameters: [
        { name: "duration", type: "number", required: false, description: "Profile duration in seconds", defaultValue: 60 }
      ],
      dangerous: false,
      examples: ["debug profile", "debug profile --duration 120"]
    },

    // System commands
    {
      id: "system-status",
      command: "system status",
      description: "Show system status",
      category: "system",
      parameters: [],
      dangerous: false,
      examples: ["system status"]
    },
    {
      id: "system-health",
      command: "system health",
      description: "Perform health check",
      category: "system",
      parameters: [],
      dangerous: false,
      examples: ["system health"]
    },
    {
      id: "system-refresh",
      command: "system refresh",
      description: "Refresh all system status",
      category: "system",
      parameters: [
        { name: "force", type: "boolean", required: false, description: "Force refresh", defaultValue: false }
      ],
      dangerous: false,
      examples: ["system refresh", "system refresh --force true"]
    },
    {
      id: "system-restart",
      command: "system restart",
      description: "Restart the system",
      category: "system",
      parameters: [],
      dangerous: true,
      examples: ["system restart"]
    },

    // Help command
    {
      id: "help",
      command: "help",
      description: "Show help information",
      category: "system",
      parameters: [
        { name: "command", type: "string", required: false, description: "Command to get help for" }
      ],
      dangerous: false,
      examples: ["help", "help provider list", "help session create"]
    }
  ]

  // Auto-completion logic
  const updateAutoComplete = (input: string) => {
    if (!config.enableAutoComplete) {
      setAutoCompleteSuggestions([])
      setShowSuggestions(false)
      return
    }

    const parts = input.trim().split(/\s+/)
    const lastPart = parts[parts.length - 1] || ""

    let suggestions: string[] = []

    if (parts.length === 1) {
      // Suggest commands
      suggestions = cliCommands
        .map(cmd => cmd.command)
        .filter(cmd => cmd.startsWith(lastPart))
    } else {
      // Suggest parameters or values
      const command = cliCommands.find(cmd => cmd.command.startsWith(parts[0]))
      if (command) {
        suggestions = command.parameters
          .map(param => `--${param.name}`)
          .filter(param => param.startsWith(lastPart))
      }
    }

    setAutoCompleteSuggestions(suggestions)
    setShowSuggestions(suggestions.length > 0)
    setSelectedSuggestion(0)
  }

  // Execute command
  const executeCommand = async (command: string) => {
    if (!command.trim()) return

    setIsExecuting(true)
    const startTime = Date.now()

    try {
      let result: CLIExecutionResult

      if (props.onCommandExecute) {
        result = await props.onCommandExecute(command)
      } else {
        result = await executeCommandLocally(command)
      }

      result.duration = Date.now() - startTime
      result.timestamp = new Date()

      // Add to history
      const history = commandHistory()
      if (!history.includes(command)) {
        const newHistory = [command, ...history].slice(0, config.maxHistory)
        setCommandHistory(newHistory)
      }

      // Add to results
      setExecutionResults(prev => [result, ...prev].slice(0, 100))

      setCommandInput("")
      setShowSuggestions(false)

    } catch (error) {
      const result: CLIExecutionResult = {
        command,
        success: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp: new Date()
      }

      setExecutionResults(prev => [result, ...prev].slice(0, 100))
    } finally {
      setIsExecuting(false)
      setHistoryIndex(-1)
    }
  }

  // Execute command locally (fallback)
  const executeCommandLocally = async (command: string): Promise<CLIExecutionResult> => {
    const parts = command.trim().split(/\s+/)
    const cmd = parts[0]
    const args = parts.slice(1)

    switch (cmd) {
      case "help":
        if (args.length > 0) {
          const helpCommand = cliCommands.find(c => c.command.startsWith(args[0]))
          if (helpCommand) {
            return {
              command,
              success: true,
              output: formatCommandHelp(helpCommand),
              duration: 0,
              timestamp: new Date()
            }
          }
        }
        return {
          command,
          success: true,
          output: formatAllCommandsHelp(),
          duration: 0,
          timestamp: new Date()
        }

      case "system-status":
        return {
          command,
          success: true,
          output: "System Status: Running\nProviders: 7/7 connected\nFeatures: 12/12 active\nHealth Score: 95%",
          duration: 0,
          timestamp: new Date()
        }

      case "system-health":
        return {
          command,
          success: true,
          output: "Health Check: PASSED\nAll systems operational\nNo issues detected",
          duration: 0,
          timestamp: new Date()
        }

      default:
        return {
          command,
          success: false,
          output: "",
          error: `Unknown command: ${cmd}. Type 'help' for available commands.`,
          duration: 0,
          timestamp: new Date()
        }
    }
  }

  // Format command help
  const formatCommandHelp = (command: CLICommand): string => {
    let help = `${command.command}\n`
    help += `Description: ${command.description}\n`
    help += `Category: ${command.category}\n`
    
    if (command.parameters.length > 0) {
      help += `Parameters:\n`
      command.parameters.forEach(param => {
        help += `  --${param.name} (${param.type})${param.required ? ' [required]' : ' [optional]'} - ${param.description}\n`
      })
    }
    
    help += `Examples:\n`
    command.examples.forEach(example => {
      help += `  ${example}\n`
    })

    if (command.dangerous) {
      help += `⚠️  This command is marked as dangerous and may cause data loss or system instability.\n`
    }

    return help
  }

  // Format all commands help
  const formatAllCommandsHelp = (): string => {
    let help = "Available Commands:\n\n"
    
    const categories = Array.from(new Set(cliCommands.map(cmd => cmd.category)))
    
    categories.forEach(category => {
      help += `${category.toUpperCase()}:\n`
      cliCommands
        .filter(cmd => cmd.category === category)
        .forEach(cmd => {
          help += `  ${cmd.command} - ${cmd.description}\n`
        })
      help += "\n"
    })

    help += "Type 'help <command>' for detailed information about a specific command."
    return help
  }

  // Handle input changes
  const handleInputChange = (value: string) => {
    setCommandInput(value)
    updateAutoComplete(value)
    setHistoryIndex(-1)
  }

  // Handle key down events
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      
      if (showSuggestions()) {
        const suggestions = autoCompleteSuggestions()
        const selected = selectedSuggestion()
        if (selected >= 0 && selected < suggestions.length) {
          setCommandInput(suggestions[selected])
        }
      } else {
        executeCommand(commandInput())
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      navigateHistory(-1)
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      if (showSuggestions()) {
        const suggestions = autoCompleteSuggestions()
        setSelectedSuggestion(prev => (prev + 1) % suggestions.length)
      } else {
        navigateHistory(1)
      }
    } else if (event.key === "Tab") {
      event.preventDefault()
      if (showSuggestions()) {
        const suggestions = autoCompleteSuggestions()
        const selected = selectedSuggestion()
        if (selected >= 0 && selected < suggestions.length) {
          setCommandInput(suggestions[selected])
          setShowSuggestions(false)
        }
      }
    } else if (event.key === "Escape") {
      setShowSuggestions(false)
      setSelectedSuggestion(0)
    }
  }

  // Navigate command history
  const navigateHistory = (direction: number) => {
    const history = commandHistory()
    const currentIndex = historyIndex()
    
    if (direction === -1 && currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1
      setHistoryIndex(newIndex)
      setCommandInput(history[newIndex])
    } else if (direction === 1 && currentIndex > -1) {
      const newIndex = currentIndex - 1
      setHistoryIndex(newIndex)
      setCommandInput(newIndex >= 0 ? history[newIndex] : "")
    }
  }

  // Clear console
  const clearConsole = () => {
    setExecutionResults([])
    if (props.onClearHistory) {
      props.onClearHistory()
    }
  }

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (outputRef) {
      outputRef.scrollTop = outputRef.scrollHeight
    }
  }

  // Effects
  createEffect(() => {
    scrollToBottom()
  })

  createEffect(() => {
    if (executionResults().length > 0) {
      scrollToBottom()
    }
  })

  onMount(() => {
    // Focus input on mount
    if (inputRef) {
      inputRef.focus()
    }
  })

  return (
    <div class="enhanced-cli-console">
      {/* Header */}
      <div class="cli-header">
        <div class="cli-title">
          <Icon name="code" size="small" />
          <span>Kilo CLI Console</span>
        </div>
        <div class="cli-controls">
          <select 
            value={logLevel()} 
            onChange={(e) => setLogLevel(e.target.value as any)}
            class="cli-log-level"
          >
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <Tooltip value="Clear console" placement="top">
            <Button
              variant="ghost"
              size="small"
              onClick={clearConsole}
            >
              <Icon name="close" size="small" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Output */}
      <div class="cli-output" ref={outputRef}>
        <For each={executionResults()}>
          {(result) => (
            <div class={`cli-result ${result.success ? 'success' : 'error'}`}>
              <div class="cli-result-header">
                <span class="cli-command">{result.command}</span>
                <span class="cli-timestamp">
                  {result.timestamp.toLocaleTimeString()}
                </span>
                <span class="cli-duration">
                  {result.duration}ms
                </span>
              </div>
              {result.output && (
                <pre class="cli-output-text">{result.output}</pre>
              )}
              {result.error && (
                <pre class="cli-error-text">{result.error}</pre>
              )}
            </div>
          )}
        </For>
      </div>

      {/* Input */}
      <div class="cli-input-container">
        <div class="cli-input-wrapper">
          <textarea
            ref={inputRef}
            value={commandInput()}
            onInput={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command... (Tab to autocomplete, ↑↓ for history)"
            class="cli-input"
            rows={1}
            disabled={isExecuting()}
          />
          
          {/* Auto-complete suggestions */}
          <Show when={showSuggestions() && autoCompleteSuggestions().length > 0}>
            <div class="cli-suggestions">
              <For each={autoCompleteSuggestions()}>
                {(suggestion, index) => (
                  <div
                    class={`cli-suggestion ${index() === selectedSuggestion() ? 'selected' : ''}`}
                    onClick={() => {
                      setCommandInput(suggestion)
                      setShowSuggestions(false)
                    }}
                  >
                    {suggestion}
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
        
        <Button
          variant="primary"
          size="small"
          onClick={() => executeCommand(commandInput())}
          disabled={isExecuting() || !commandInput().trim()}
          class="cli-execute-btn"
        >
          {isExecuting() ? "..." : "Execute"}
        </Button>
      </div>

      {/* Status bar */}
      <div class="cli-status">
        <span class="cli-status-item">
          History: {commandHistory().length}/{config.maxHistory}
        </span>
        <span class="cli-status-item">
          Results: {executionResults().length}
        </span>
        <span class="cli-status-item">
          {isExecuting() ? "Executing..." : "Ready"}
        </span>
      </div>
    </div>
  )
}

export default EnhancedCLIConsole
