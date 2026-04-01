import { Component, For, Show, createSignal, createEffect, onMount } from "solid-js"
import { Card } from "@kilocode/kilo-ui/card"
import { Input } from "@kilocode/kilo-ui/input"
import { Button } from "@kilocode/kilo-ui/button"
import { Badge } from "@kilocode/kilo-ui/badge"
import { useVSCode } from "../context/vscode"

interface LogEntry {
  id: string
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error'
  source: string
  message: string
  data?: any
}

interface CLICommand {
  id: string
  command: string
  description: string
  category: string
  dangerous: boolean
}

const DebugPanel: Component = () => {
  const vscode = useVSCode()
  
  // State
  const [logs, setLogs] = createSignal<LogEntry[]>([])
  const [commandInput, setCommandInput] = createSignal("")
  const [commandHistory, setCommandHistory] = createSignal<string[]>([])
  const [historyIndex, setHistoryIndex] = createSignal(-1)
  const [isExecuting, setIsExecuting] = createSignal(false)
  const [selectedLogLevel, setSelectedLogLevel] = createSignal<'all' | 'debug' | 'info' | 'warn' | 'error'>('all')
  const [autoScroll, setAutoScroll] = createSignal(true)
  
  // Predefined commands
  const predefinedCommands: CLICommand[] = [
    {
      id: 'status',
      command: 'status',
      description: 'Show system status',
      category: 'System',
      dangerous: false
    },
    {
      id: 'providers',
      command: 'providers',
      description: 'List all providers',
      category: 'Providers',
      dangerous: false
    },
    {
      id: 'features',
      command: 'features',
      description: 'List all features',
      category: 'Features',
      dangerous: false
    },
    {
      id: 'health',
      command: 'health',
      description: 'Check system health',
      category: 'System',
      dangerous: false
    },
    {
      id: 'logs',
      command: 'logs',
      description: 'Show recent logs',
      category: 'Logging',
      dangerous: false
    },
    {
      id: 'errors',
      command: 'errors',
      description: 'Show recent errors',
      category: 'Logging',
      dangerous: false
    },
    {
      id: 'clear',
      command: 'clear',
      description: 'Clear logs',
      category: 'Logging',
      dangerous: false
    },
    {
      id: 'restart',
      command: 'restart',
      description: 'Restart backend',
      category: 'System',
      dangerous: true
    },
    {
      id: 'reset',
      command: 'reset',
      description: 'Reset all settings',
      category: 'System',
      dangerous: true
    },
    {
      id: 'debug-on',
      command: 'debug on',
      description: 'Enable debug mode',
      category: 'Debug',
      dangerous: false
    },
    {
      id: 'debug-off',
      command: 'debug off',
      description: 'Disable debug mode',
      category: 'Debug',
      dangerous: false
    },
    {
      id: 'test-speech',
      command: 'test speech',
      description: 'Test speech functionality',
      category: 'Speech',
      dangerous: false
    },
    {
      id: 'test-provider',
      command: 'test provider <name>',
      description: 'Test specific provider',
      category: 'Providers',
      dangerous: false
    }
  ]

  // Setup message handlers
  onMount(() => {
    vscode.onMessage((message) => {
      switch (message.type) {
        case "log":
          addLog(message.data)
          break
        case "commandResult":
          handleCommandResult(message.data)
          break
        case "debugInfo":
          handleDebugInfo(message.data)
          break
      }
    })
    
    // Request initial logs
    vscode.postMessage({
      type: "debug",
      action: "getLogs"
    })
  })

  // Add log entry
  const addLog = (entry: Omit<LogEntry, 'id'>) => {
    const newLog: LogEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(entry.timestamp)
    }
    
    setLogs(prev => [...prev, newLog].slice(-1000)) // Keep last 1000 logs
    
    // Auto scroll if enabled
    if (autoScroll()) {
      setTimeout(() => {
        const logContainer = document.getElementById('log-container')
        if (logContainer) {
          logContainer.scrollTop = logContainer.scrollHeight
        }
      }, 10)
    }
  }

  // Handle command result
  const handleCommandResult = (data: { command: string; result: any; error?: string }) => {
    setIsExecuting(false)
    
    if (data.error) {
      addLog({
        timestamp: new Date(),
        level: 'error',
        source: 'CLI',
        message: `Command failed: ${data.command}`,
        data: { error: data.error }
      })
    } else {
      addLog({
        timestamp: new Date(),
        level: 'info',
        source: 'CLI',
        message: `Command executed: ${data.command}`,
        data: data.result
      })
    }
  }

  // Handle debug info
  const handleDebugInfo = (data: any) => {
    addLog({
      timestamp: new Date(),
      level: 'debug',
      source: 'Debug',
      message: 'Debug info received',
      data
    })
  }

  // Execute command
  const executeCommand = (command: string) => {
    if (!command.trim()) return
    
    setIsExecuting(true)
    setCommandInput("")
    
    // Add to history
    setCommandHistory(prev => [...prev.slice(-49), command]) // Keep last 50
    setHistoryIndex(-1)
    
    // Send to backend
    vscode.postMessage({
      type: "debug",
      action: "executeCommand",
      command: command.trim()
    })
    
    // Log command execution
    addLog({
      timestamp: new Date(),
      level: 'info',
      source: 'CLI',
      message: `Executing: ${command}`
    })
  }

  // Handle input submission
  const handleSubmit = (e: Event) => {
    e.preventDefault()
    executeCommand(commandInput())
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    const history = commandHistory()
    
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIndex = Math.min(historyIndex() + 1, history.length - 1)
      setHistoryIndex(newIndex)
      setCommandInput(history[history.length - 1 - newIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIndex = Math.max(historyIndex() - 1, -1)
      setHistoryIndex(newIndex)
      setCommandInput(newIndex === -1 ? "" : history[history.length - 1 - newIndex])
    }
  }

  // Filter logs by level
  const filteredLogs = () => {
    const level = selectedLogLevel()
    if (level === 'all') return logs()
    return logs().filter(log => log.level === level)
  }

  // Get log level color
  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'debug': return 'text-gray-500'
      case 'info': return 'text-blue-500'
      case 'warn': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  // Get log level badge variant
  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case 'debug': return <Badge variant="outline" class="text-xs">DEBUG</Badge>
      case 'info': return <Badge variant="secondary" class="text-xs">INFO</Badge>
      case 'warn': return <Badge variant="outline" class="text-xs text-yellow-600">WARN</Badge>
      case 'error': return <Badge variant="destructive" class="text-xs">ERROR</Badge>
      default: return <Badge variant="outline" class="text-xs">{level}</Badge>
    }
  }

  return (
    <div class="p-4 space-y-4 h-full flex flex-col">
      {/* Command Input */}
      <Card class="p-4">
        <h3 class="font-semibold mb-3">CLI Debug Console</h3>
        <form onSubmit={handleSubmit} class="space-y-2">
          <div class="flex space-x-2">
            <Input
              value={commandInput()}
              onInput={(e) => setCommandInput(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter debug command..."
              class="flex-1"
              disabled={isExecuting()}
            />
            <Button 
              type="submit" 
              disabled={isExecuting() || !commandInput().trim()}
            >
              {isExecuting() ? '...' : 'Execute'}
            </Button>
          </div>
          
          {/* Quick Commands */}
          <div class="flex flex-wrap gap-1">
            <For each={predefinedCommands.filter(cmd => !cmd.dangerous)}>
              {(cmd) => (
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => executeCommand(cmd.command)}
                  class="text-xs"
                >
                  {cmd.command}
                </Button>
              )}
            </For>
          </div>
        </form>
      </Card>

      {/* Log Controls */}
      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="font-semibold">Logs</span>
            <Badge variant="secondary" class="text-xs">
              {filteredLogs().length} entries
            </Badge>
          </div>
          <div class="flex items-center space-x-2">
            <select
              value={selectedLogLevel()}
              onInput={(e) => setSelectedLogLevel(e.currentTarget.value as any)}
              class="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Levels</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
            <Button
              variant="outline"
              size="small"
              onClick={() => setAutoScroll(!autoScroll())}
            >
              {autoScroll() ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
            </Button>
            <Button
              variant="outline"
              size="small"
              onClick={() => setLogs([])}
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Log Display */}
      <Card class="flex-1 p-4">
        <div 
          id="log-container"
          class="h-full overflow-y-auto font-mono text-sm space-y-1"
        >
          <For 
            each={filteredLogs()}
            fallback={
              <div class="text-gray-500 text-center py-4">No logs to display</div>
            }
          >
            {(log) => (
              <div class="border-l-2 border-gray-200 pl-2 py-1 hover:bg-gray-50">
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-gray-500">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  {getLogLevelBadge(log.level)}
                  <span class="text-xs text-gray-600">{log.source}</span>
                </div>
                <div class={`mt-1 ${getLogLevelColor(log.level)}`}>
                  {log.message}
                </div>
                <Show when={log.data}>
                  <details class="mt-1">
                    <summary class="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                      Data
                    </summary>
                    <pre class="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </details>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Card>

      {/* Command Reference */}
      <Card class="p-4">
        <h3 class="font-semibold mb-3">Command Reference</h3>
        <div class="space-y-2">
          <For each={predefinedCommands}>
            {(cmd) => (
              <div class="flex items-center justify-between p-2 rounded border">
                <div class="flex items-center space-x-2">
                  <code class="text-sm bg-gray-100 px-2 py-1 rounded">
                    {cmd.command}
                  </code>
                  <span class="text-sm text-gray-600">{cmd.description}</span>
                  <Badge variant="outline" class="text-xs">
                    {cmd.category}
                  </Badge>
                </div>
                <div class="flex items-center space-x-2">
                  <Show when={cmd.dangerous}>
                    <Badge variant="destructive" class="text-xs">
                      Dangerous
                    </Badge>
                  </Show>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => setCommandInput(cmd.command)}
                  >
                    Use
                  </Button>
                </div>
              </div>
            )}
          </For>
        </div>
      </Card>
    </div>
  )
}

export default DebugPanel
