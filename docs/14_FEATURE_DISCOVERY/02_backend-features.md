# Backend Features Documentation

**Agent:** 04 - CLI Backend & Server  
**Discovery Date:** 2026-03-29  
**Packages Scanned:** `opencode/src/server/`, `kilo-vscode/src/services/cli-backend/`, `sdk/js/src/`

---

## Table of Contents

1. [Server Management](#1-server-management)
2. [SDK Integration](#2-sdk-integration)
3. [Provider Routing](#3-provider-routing)
4. [Session Management](#4-session-management)
5. [Tool Execution](#5-tool-execution)
6. [Agent Orchestration](#6-agent-orchestration)
7. [CLI Commands](#7-cli-commands)

---

## 1. Server Management

### 1.1 Server Manager

**Location:** `packages/kilo-vscode/src/services/cli-backend/server-manager.ts`

**Description:** Manages the lifecycle of the CLI backend server process.

**Features:**
- Server process spawning and lifecycle
- Port management and allocation
- Health check monitoring
- Auto-restart on failure
- Graceful shutdown

**Configuration:**
```typescript
interface ServerConfig {
  port?: number                    // Auto-assign if not specified
  host?: string                   // Default: localhost
  maxRetries?: number             // Connection retry attempts
  retryDelay?: number             // Delay between retries (ms)
  healthCheckInterval?: number     // Health check frequency
  shutdownTimeout?: number        // Graceful shutdown timeout
}
```

### 1.2 Connection Service

**Location:** `packages/kilo-vscode/src/services/cli-backend/connection-service.ts`

**Description:** Handles WebSocket and HTTP connections to the CLI server.

**Features:**
- WebSocket connection management
- SSE (Server-Sent Events) support
- Request/response multiplexing
- Connection state tracking
- Reconnection handling

### 1.3 Server Utilities

**Location:** `packages/kilo-vscode/src/services/cli-backend/server-utils.ts`

**Features:**
- Port availability checking
- Server URL construction
- Process ID management

---

## 2. SDK Integration

### 2.1 SDK SSE Adapter

**Location:** `packages/kilo-vscode/src/services/cli-backend/sdk-sse-adapter.ts`

**Description:** Adapts the SDK for SSE-based communication with the CLI server.

**Features:**
- SSE event parsing
- Message deserialization
- Stream handling
- Error recovery

### 2.2 TypeScript SDK

**Location:** `packages/sdk/js/src/`

**Description:** Auto-generated TypeScript SDK for CLI server API integration.

**API Endpoints:**
```typescript
// Session management
POST   /api/session/create
GET    /api/session/:id
DELETE /api/session/:id
PATCH  /api/session/:id

// Chat operations
POST   /api/chat/:sessionId/message
GET    /api/chat/:sessionId/history
DELETE /api/chat/:sessionId/messages

// File operations
POST   /api/files/read
POST   /api/files/write
POST   /api/files/edit

// Tool execution
POST   /api/tools/execute
GET    /api/tools/:id/status

// Provider management
GET    /api/providers
POST   /api/providers
DELETE /api/providers/:id
```

---

## 3. Provider Routing

### 3.1 Provider System

**Location:** `packages/kilo-gateway/src/provider.ts`

**Description:** Routes requests to appropriate AI providers based on configuration.

**Features:**
- Multi-provider support
- Provider failover
- Load balancing
- Cost optimization
- Latency-based routing

**Supported Providers:**
- OpenAI
- Anthropic
- Azure OpenAI
- Google AI (Gemini)
- Local providers
- Custom endpoints

### 3.2 Provider Types

**Location:** `packages/kilo-gateway/src/types.ts`

```typescript
interface Provider {
  id: string
  name: string
  type: 'openai' | 'anthropic' | 'azure' | 'google' | 'local' | 'custom'
  apiKey?: string
  endpoint?: string
  models: Model[]
  priority?: number              // Higher = preferred
  enabled?: boolean
  capabilities?: ProviderCapabilities
}

interface ProviderCapabilities {
  streaming?: boolean
  functionCalling?: boolean
  vision?: boolean
  embedding?: boolean
}
```

### 3.3 TUI Integration

**Location:** `packages/kilo-gateway/src/tui.ts`

**Features:**
- Terminal user interface for provider management
- Interactive provider configuration
- Status display

---

## 4. Session Management

### 4.1 Session Types

**Location:** `packages/kilo-vscode/src/agent-manager/types.ts`

```typescript
interface Session {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  worktreeId?: string
  branch?: string
  provider?: string
  model?: string
  status: SessionStatus
  history: Message[]
}

type SessionStatus = 
  | 'active' 
  | 'paused' 
  | 'completed' 
  | 'error'
```

### 4.2 Worktree State Manager

**Location:** `packages/kilo-vscode/src/agent-manager/WorktreeStateManager.ts`

**Features:**
- Worktree-specific session state
- State persistence
- State restoration on reload
- Multiple concurrent worktrees

### 4.3 Session Terminal Manager

**Location:** `packages/kilo-vscode/src/agent-manager/SessionTerminalManager.ts`

**Features:**
- Terminal per session
- Terminal multiplexing
- Terminal lifecycle management

---

## 5. Tool Execution

### 5.1 Tool Interface

**Location:** `packages/plugin/src/tool.ts`

```typescript
interface Tool {
  name: string
  description: string
  parameters?: JSONSchema
  execute: (params: unknown, context: ToolContext) => Promise<ToolResult>
}

interface ToolContext {
  session: Session
  workspace: Workspace
  terminal: Terminal
  editor: Editor
  logger: Logger
}
```

### 5.2 Shell Tool

**Location:** `packages/plugin/src/shell.ts`

**Description:** Executes shell commands in the terminal.

**Features:**
- Bash/Shell command execution
- Working directory control
- Environment variable passing
- Output streaming
- Timeout handling

### 5.3 Built-in Tools

| Tool | Description |
|------|-------------|
| `read` | Read file contents |
| `write` | Write/edit file contents |
| `glob` | Find files by pattern |
| `grep` | Search file contents |
| `bash` | Execute shell commands |
| `web` | Web search |
| `edit` | Apply edits to files |
| `goto` | Navigate to location |

---

## 6. Agent Orchestration

### 6.1 Agent Manager Provider

**Location:** `packages/kilo-vscode/src/agent-manager/AgentManagerProvider.ts`

**Description:** Main provider for agent management in VS Code.

**Features:**
- Session creation/deletion
- Worktree management
- Branch operations
- Git operations
- Terminal management

### 6.2 Git Operations

**Location:** `packages/kilo-vscode/src/agent-manager/GitOps.ts`

**Features:**
- Git status polling
- Branch creation/switching
- Commit operations
- Remote operations
- Worktree operations

### 6.3 Git Stats Poller

**Location:** `packages/kilo-vscode/src/agent-manager/GitStatsPoller.ts`

**Features:**
- Periodic git stats updates
- Branch tracking
- Change detection
- Diff calculation

---

## 7. CLI Commands

### 7.1 CLI Backend Commands

**Location:** `packages/desktop-electron/src/main/cli.ts`

```bash
# Session commands
kilo session create [--name <name>] [--worktree <path>]
kilo session list
kilo session switch <session-id>
kilo session delete <session-id>

# Worktree commands
kilo worktree create <name> [--from <branch>]
kilo worktree list
kilo worktree delete <name>

# Provider commands
kilo provider add <type> [--api-key <key>]
kilo provider list
kilo provider remove <id>

# General commands
kilo serve [--port <port>]
kilo web [--port <port>]
kilo run <prompt>
```

### 7.2 Server Commands

**Location:** `packages/kilo-gateway/src/server/routes.ts`

**REST Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/providers` | List providers |
| POST | `/chat` | Send chat message |
| GET | `/sessions` | List sessions |
| POST | `/sessions` | Create session |

---

## Cross-References

- **UI Features:** [`01_UI-features.md`](./01_UI-features.md)
- **Chat Features:** [`03_chat-features.md`](./03_chat-features.md)
- **Special Features:** [`06_special-features.md`](./06_special-features.md)

---

*Document generated by Agent-04 (CLI Backend & Server)*
