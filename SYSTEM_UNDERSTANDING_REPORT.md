# SYSTEM_UNDERSTANDING_REPORT.md

## 1. SYSTEM OVERVIEW

### What This System Is

**Kilo Code** is a multi-product AI coding agent platform built as a monorepo using Turborepo + Bun. It provides:

- A CLI tool (`kilo`) for terminal-based AI-assisted coding
- A VS Code extension with sidebar chat and Agent Manager
- A web interface (`kilo web`)
- A desktop application (Tauri)

### Major Components

| Package                    | Name                       | Purpose                                                |
| -------------------------- | -------------------------- | ------------------------------------------------------ |
| `packages/opencode/`       | `@kilocode/cli`            | Core CLI engine - agents, tools, sessions, server, TUI |
| `packages/kilo-vscode/`    | `kilo-code`                | VS Code extension with sidebar chat + Agent Manager    |
| `packages/sdk/js/`         | `@kilocode/sdk`            | Auto-generated TypeScript SDK for server API           |
| `packages/kilo-gateway/`   | `@kilocode/kilo-gateway`   | Kilo auth, provider routing, API integration           |
| `packages/kilo-ui/`        | `@kilocode/kilo-ui`        | SolidJS component library (theme/style overrides)      |
| `packages/app/`            | `@opencode-ai/app`         | Shared SolidJS web UI for desktop and `kilo web`       |
| `packages/kilo-telemetry/` | `@kilocode/kilo-telemetry` | PostHog analytics + OpenTelemetry                      |
| `packages/plugin/`         | `@kilocode/plugin`         | Plugin/tool interface definitions                      |

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         UI LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ VS Code      │  │ Desktop      │  │ Web/TUI      │            │
│  │ Extension    │  │ Electron     │  │ (app/opencode│            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
└─────────┼─────────────────┼──────────────────┼─────────────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CORE CLI (opencode)                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Server: HTTP API, /global/health, Session Management         │  │
│  │  Session Store: SQLite                                       │  │
│  │  Tools: File I/O, Git, Shell, etc.                          │  │
│  └──────────────────────────┬───────────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    KILO GATEWAY (kilo-gateway)                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Provider Routing (OpenAI, Anthropic, Azure, etc.)            │  │
│  │  Auth: API Key, OAuth, Token Refresh                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. FEATURE INVENTORY

### 12 Features Detected

| Feature                | File Count | Description                                                     |
| ---------------------- | ---------- | --------------------------------------------------------------- |
| **file_operations**    | 1,291      | File read, write, edit, and creation operations                 |
| **session_management** | 409        | Session, context, and state management                          |
| **agent_execution**    | 309        | Agent execution, tool invocation, and task handling             |
| **provider_routing**   | 353        | AI provider and model routing, selection, and management        |
| **ui_sidebar**         | 296        | Sidebar, panel, and view UI components                          |
| **ui_chat**            | 219        | Chat, message, prompt, and input UI handling                    |
| **webview**            | 208        | Webview, iframe, and postMessage communication                  |
| **settings**           | 158        | Configuration, preferences, and settings management             |
| **git_operations**     | 154        | Git operations including commit, branch, and diff               |
| **terminal**           | 106        | Terminal, shell, command execution                              |
| **authentication**     | 32         | Authentication, login, logout, token, and credential management |
| **telemetry**          | 26         | Analytics, metrics, PostHog, and OpenTelemetry tracking         |

### Additional Metrics

| Metric                   | Count |
| ------------------------ | ----- |
| **Endpoints Found**      | 993   |
| **UI Handlers Found**    | 421   |
| **Providers Found**      | 150   |
| **Config Schemas Found** | 67    |
| **Events Found**         | 107   |

---

## 3. CRITICAL SYSTEM AREAS

### Session / Chat System

**Location:** `packages/opencode/src/session/`

**Key Files:**

- `session/index.ts` - Session namespace (create, fork, remove, messages, share)
- `session/processor.ts` - Core AI processing loop
- `session/message-v2.ts` - Message schema with parts
- `session/llm.ts` - LLM interaction layer
- `session/prompt.ts` - Prompt construction
- `session/compaction.ts` - Session compaction for long conversations

**UI Location:** `packages/kilo-vscode/webview-ui/src/components/chat/`

### Agent/Orchestration System

**Location:** `packages/opencode/src/agent/`

**Built-in Agents:**
| Agent | Purpose |
|-------|---------|
| `code` | Default primary agent |
| `plan` | Plan mode (no edits) |
| `debug` | Debugging specialist |
| `orchestrator` | Task coordinator |
| `ask` | Read-only question answering |
| `explore` | Codebase exploration |
| `general` | Subagent for parallel tasks |

**Orchestration:** `packages/opencode/src/tool/task.ts` - Subagent spawning

### Provider/Model System

**Location:** `packages/opencode/src/provider/` and `packages/kilo-gateway/src/`

**18 Bundled AI SDK Providers:**

- `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/azure`, `@ai-sdk/google`
- `@ai-sdk/google-vertex`, `@ai-sdk/amazon-bedrock`, `@ai-sdk/xai`, `@ai-sdk/mistral`
- `@ai-sdk/groq`, `@ai-sdk/deepinfra`, `@ai-sdk/cerebras`, `@ai-sdk/cohere`
- `@ai-sdk/gateway`, `@ai-sdk/togetherai`, `@ai-sdk/perplexity`, `@ai-sdk/vercel`
- `@openrouter/ai-sdk-provider`, `@kilocode/kilo-gateway`

**Kilo Gateway:** `packages/kilo-gateway/src/provider.ts` - Wraps OpenRouter SDK

### Config System

**Location:** `packages/opencode/src/config/`

**67 Config-Related Source Files** across:

- `packages/opencode/src/config/config.ts`
- `packages/opencode/src/bun/index.ts`, `registry.ts`
- `packages/kilo-vscode/src/provider-actions.ts`
- `packages/sdk/js/src/client.ts`, `server.ts`

**Config Categories:**

- Provider: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `MODEL_NAME`, `MODEL_FALLBACK_ORDER`
- Server: `PORT`, `HOST`, `LOG_LEVEL`, `DATABASE_PATH`, `SESSION_TIMEOUT`
- Workspace: `WORKSPACE_ROOT`, `IGNORE_PATTERNS`, `MAX_FILE_SIZE`, `ENABLE_TELEMETRY`
- UI: `THEME`, `FONT_SIZE`, `SIDEBAR_POSITION`, `TERMINAL_FONT`

### UI System

**Multi-Target SolidJS Architecture:**

| Product            | Entry Point                                        | Type              |
| ------------------ | -------------------------------------------------- | ----------------- |
| VS Code Extension  | `packages/kilo-vscode/webview-ui/src/index.tsx`    | Webview (SolidJS) |
| Web App            | `packages/app/src/entry.tsx`                       | SolidJS Web       |
| Desktop (Tauri)    | `packages/desktop/src/index.tsx`                   | Desktop           |
| Desktop (Electron) | `packages/desktop-electron/src/renderer/index.tsx` | Electron          |
| CLI TUI            | `packages/opencode/src/cli/cmd/tui/`               | Terminal UI       |
| Shared Components  | `packages/kilo-ui/src/`                            | Component Library |

**UI Provider Hierarchy (Sidebar):**
`ThemeProvider → I18nProvider → DialogProvider → MarkedProvider → VSCodeProvider → ServerProvider → ProviderProvider → SessionProvider`

---

## 4. ENTRY POINTS

### How System Starts

| Entry     | File                                            | Type                   |
| --------- | ----------------------------------------------- | ---------------------- |
| CLI       | `packages/opencode/src/index.ts`                | Main entry using yargs |
| Server    | `packages/opencode/src/server/server.ts`        | Hono-based HTTP server |
| TUI       | `packages/opencode/src/tui.ts`                  | Terminal UI            |
| Webview   | `packages/kilo-vscode/webview-ui/src/index.tsx` | VS Code Webview        |
| Web App   | `packages/app/src/entry.tsx`                    | SolidJS Web entry      |
| Desktop   | `packages/desktop/src/index.tsx`                | Tauri desktop          |
| Extension | `packages/kilo-vscode/src/extension.ts`         | VS Code Extension Host |

### Main Execution Flows

**1. HTTP Request-Response Flow**

```
Client → POST /chat → Server → Provider (OpenAI/Anthropic) → SSE Stream
```

**2. Session Lifecycle**

```
create → execute → update → terminate
States: INITIAL → ACTIVE ↔ PAUSED → TERMINATED
```

**3. UI Backend Wiring**

```
Webview → postMessage → Extension Host → IPC Bridge → HTTP+SSE → kilo serve
```

**4. Tool Execution**

```
POST /tools/exec → Tool Registry → Sandbox → Result
```

**5. Authentication Flow**

```
POST /auth/device → poll → token → Bearer header injection
```

---

## 5. KNOWN RISKS (from Gap Analysis)

### Critical Gaps (4)

| ID           | Category          | Title                              | Impact                                             |
| ------------ | ----------------- | ---------------------------------- | -------------------------------------------------- |
| GAP-CRIT-001 | session_lifecycle | Session Prompt Assembly Validation | HIGH - Prompt injection vulnerabilities undetected |
| GAP-CRIT-002 | provider_routing  | Provider Fallback Chain Testing    | HIGH - System unavailable without fallback         |
| GAP-CRIT-003 | ui_backend_wiring | IPC Message Contract Validation    | HIGH - Runtime errors from schema mismatches       |
| GAP-CRIT-004 | tool_execution    | Tool Permission Boundary Testing   | HIGH - Security boundary violations undetected     |

### High Severity Risks

| Category                        | Count | Key Issues                                 |
| ------------------------------- | ----- | ------------------------------------------ |
| Undocumented files              | 2,569 | Maintenance burden                         |
| Dead code candidates            | 768   | Technical debt                             |
| Missing test coverage           | 2,000 | Reliability risk                           |
| Ambiguous modules               | 490   | Understanding difficulty                   |
| High severity portability risks | 23    | Security vulnerabilities (exec, fs_unsafe) |

### Overall Risk Level: HIGH

**Immediate Action Required:** GAP-CRIT-001 through GAP-CRIT-004

---

## 6. PACKAGE DEPENDENCY MATRIX

| Consumer          | @kilocode/cli | @kilocode/sdk | @kilocode/plugin | kilo-code | @kilocode/ui |
| ----------------- | ------------- | ------------- | ---------------- | --------- | ------------ |
| @kilocode/cli     | -             | Y             | Y                | N         | N            |
| @kilocode/sdk     | Y             | -             | N                | Y         | N            |
| @kilocode/plugin  | Y             | N             | -                | N         | N            |
| kilo-code         | Y             | Y             | N                | -         | Y            |
| @kilocode/ui      | N             | N             | N                | Y         | -            |
| @kilocode/gateway | N             | Y             | N                | N         | N            |

**Central Hub:** `@kilocode/cli` (packages/opencode) - all products depend on or bundle this

---

## 7. ENTRY POINTS (144 Identified)

| Zone          | Entry Points |
| ------------- | ------------ |
| opencode_core | 21 flows     |
| frontend_apps | 9 flows      |

**Primary Entry Points:**

- CLI: `index.ts`, `cli.ts`
- Server: `server/index.ts`, `server.ts`
- TUI: `tui.ts`, `tui/`
- Agent: `agent/index.ts`, `agent/agent.ts`
- Webview: `kilo-vscode/webview-ui/src/index.tsx`
- Renderer: `packages/app/src/entry.tsx`
- Desktop: `packages/desktop-electron/src/main/index.ts`

---

## 8. RUNTIME FLOWS (30 Documented)

| Category          | Count | Flows                                                                                                                        |
| ----------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------- |
| request_response  | 10    | Overview, Primary HTTP, Secondary HTTP, Session, Auth, SSE, Error, Evidence, Verification                                    |
| session_lifecycle | 11    | Overview, States, Creation, Active, Pause/Resume, Termination, Persistence, Context, Message History, Evidence, Verification |
| ui_backend_wiring | 9     | Overview, VS Code Extension, SDK Client, Desktop App, Web Interface, State Sync, Error Handling, Evidence, Verification      |
