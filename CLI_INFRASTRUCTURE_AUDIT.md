# CLI Infrastructure Audit Report

**Agent 3 of 20 - CLI Infrastructure Audit**
**Date**: 2026-03-30
**Purpose**: Audit CLI infrastructure for CLI toggle implementation (WindSurf, Claude Code, LM Studio, Ollama, Cursor)

---

## Executive Summary

The Kilo Code CLI infrastructure is well-developed for the VS Code extension integration but **lacks any external tool integration framework**. There is no CLI toggle mechanism for external tools. The CLI runs as a server process that the VS Code extension connects to via HTTP/SSE, but there are no endpoints or spawning mechanisms for external tools like WindSurf, Claude Code, LM Studio, Ollama, or Cursor.

---

## 1. CLI Commands Inventory

### Location: [`packages/opencode/src/cli/cmd/`](packages/opencode/src/cli/cmd/)

| Command | File | Description |
|---------|------|-------------|
| `acp` | [`cmd/acp.ts`](packages/opencode/src/cli/cmd/acp.ts:1) | Agent Communication Protocol |
| `agent` | [`cmd/agent.ts`](packages/opencode/src/cli/cmd/agent.ts:1) | Agent management (7901 chars) |
| `auth` | [`cmd/auth.ts`](packages/opencode/src/cli/cmd/auth.ts:1) | Authentication (16817 chars) |
| `db` | [`cmd/db.ts`](packages/opencode/src/cli/cmd/db.ts:1) | Database operations |
| `export` | [`cmd/export.ts`](packages/opencode/src/cli/cmd/export.ts:1) | Export functionality |
| `generate` | [`cmd/generate.ts`](packages/opencode/src/cli/cmd/generate.ts:1) | Code generation |
| `github` | [`cmd/github.ts`](packages/opencode/src/cli/cmd/github.ts:1) | GitHub integration (57942 chars - largest) |
| `import` | [`cmd/import.ts`](packages/opencode/src/cli/cmd/import.ts:1) | Import functionality |
| `mcp` | [`cmd/mcp.ts`](packages/opencode/src/cli/cmd/mcp.ts:1) | Model Context Protocol |
| `models` | [`cmd/models.ts`](packages/opencode/src/cli/cmd/models.ts:1) | List models |
| `pr` | [`cmd/pr.ts`](packages/opencode/src/cli/cmd/pr.ts:1) | Pull request operations |
| `remote` | [`cmd/remote.ts`](packages/opencode/src/cli/cmd/remote.ts:1) | Remote sessions |
| `run` | [`cmd/run.ts`](packages/opencode/src/cli/cmd/run.ts:1) | Run task (23321 chars) |
| `serve` | [`cmd/serve.ts`](packages/opencode/src/cli/cmd/serve.ts:1) | **Start headless server** |
| `session` | [`cmd/session.ts`](packages/opencode/src/cli/cmd/session.ts:1) | Session management |
| `stats` | [`cmd/stats.ts`](packages/opencode/src/cli/cmd/stats.ts:1) | Statistics |
| `uninstall` | [`cmd/uninstall.ts`](packages/opencode/src/cli/cmd/uninstall.ts:1) | Uninstall |
| `upgrade` | [`cmd/upgrade.ts`](packages/opencode/src/cli/cmd/upgrade.ts:1) | Upgrade |
| `web` | [`cmd/web.ts`](packages/opencode/src/cli/cmd/web.ts:1) | Web UI |
| `workspace-serve` | [`cmd/workspace-serve.ts`](packages/opencode/src/cli/cmd/workspace-serve.ts:1) | Workspace server |

**Key Finding**: No `toggle` or `external` command exists for CLI toggle functionality.

---

## 2. Server Architecture

### Location: [`packages/opencode/src/server/server.ts`](packages/opencode/src/server/server.ts:1)

### 2.1 Server Stack
- **Framework**: Hono (lines 1-47)
- **Protocol**: HTTP + SSE (Server-Sent Events)
- **WebSocket**: Supported via `hono/bun` (line 45)
- **Default Port**: 4096 (line 68)
- **Default Hostname**: 127.0.0.1 (line 57 in [`server.ts`](packages/opencode/src/server/server.ts:57))

### 2.2 Authentication Mechanism
- **Basic Auth**: Implemented via `basicAuth` middleware (line 9, 101)
- **Credentials**: 
  - Username: `KILO_SERVER_USERNAME` env var (default: `"kilo"`) - line 100
  - Password: `KILO_SERVER_PASSWORD` env var (required) - line 98
- **Auth Check**: Applied to all routes except `/log` and `OPTIONS` (lines 94-102)

### 2.3 CORS Configuration
- Localhost origins allowed (lines 125-126)
- Tauri origins allowed (lines 128-132)
- `*.opencode.ai` HTTPS origins allowed (lines 134-137)
- Custom whitelist via `cors` option (line 653)

### 2.4 Event System
- **Global Events**: `/global/event` endpoint (SSE) - [`routes/global.ts`](packages/opencode/src/server/routes/global.ts:41)
- **Session Events**: `/event` endpoint (SSE) - [`server.ts`](packages/opencode/src/server/server.ts:554)
- **Heartbeat**: 10-second interval (lines 591-598, 88-98)

---

## 3. API Routes Inventory

### Location: [`packages/opencode/src/server/routes/`](packages/opencode/src/server/routes/)

| Route File | Prefix | Purpose |
|------------|--------|---------|
| [`commit-message.ts`](packages/opencode/src/server/routes/commit-message.ts:1) | `/commit-message` | Generate commit messages |
| [`config.ts`](packages/opencode/src/server/routes/config.ts:1) | `/config` | Configuration management |
| [`enhance-prompt.ts`](packages/opencode/src/server/routes/enhance-prompt.ts:1) | `/enhance-prompt` | Prompt enhancement |
| [`experimental.ts`](packages/opencode/src/server/routes/experimental.ts:1) | `/experimental` | Experimental features |
| [`file.ts`](packages/opencode/src/server/routes/file.ts:1) | `/file` | File operations |
| [`global.ts`](packages/opencode/src/server/routes/global.ts:1) | `/global` | Global events (SSE) |
| [`kilocode.ts`](packages/opencode/src/server/routes/kilocode.ts:1) | `/kilocode` | Kilo-specific routes |
| [`mcp.ts`](packages/opencode/src/server/routes/mcp.ts:1) | `/mcp` | MCP server management |
| [`permission.ts`](packages/opencode/src/server/routes/permission.ts:1) | `/permission` | Permission handling |
| [`project.ts`](packages/opencode/src/server/routes/project.ts:1) | `/project` | Project operations |
| [`provider.ts`](packages/opencode/src/server/routes/provider.ts:1) | `/provider` | Provider management |
| [`pty.ts`](packages/opencode/src/server/routes/pty.ts:1) | `/pty` | PTY sessions (WebSocket) |
| [`question.ts`](packages/opencode/src/server/routes/question.ts:1) | `/question` | Question handling |
| [`remote.ts`](packages/opencode/src/server/routes/remote.ts:1) | `/remote` | Remote operations |
| [`session.ts`](packages/opencode/src/server/routes/session.ts:1) | `/session` | Session management |
| [`telemetry.ts`](packages/opencode/src/server/routes/telemetry.ts:1) | `/telemetry` | PostHog telemetry |
| [`tui.ts`](packages/opencode/src/server/routes/tui.ts:1) | `/tui` | TUI events |
| [`workspace.ts`](packages/opencode/src/server/routes/workspace.ts:1) | `/workspace` | Workspace operations |

### Kilo-Specific Routes (under `/kilocode`):
- [`POST /kilocode/skill/remove`](packages/opencode/src/server/routes/kilocode.ts:14) - Remove skill
- [`POST /kilocode/agent/remove`](packages/opencode/src/server/routes/kilocode.ts:44) - Remove custom agent

---

## 4. SDK Client Architecture

### Location: [`packages/sdk/js/src/`](packages/sdk/js/src/)

### 4.1 SDK Structure
- **Auto-generated Types**: [`gen/types.gen.ts`](packages/sdk/js/src/gen/types.gen.ts:1) (68,342 chars)
- **SDK Client**: [`gen/sdk.gen.ts`](packages/sdk/js/src/gen/sdk.gen.ts:1) (34,673 chars)
- **Client Wrapper**: [`client.ts`](packages/sdk/js/src/client.ts:1) - `createKiloClient()`
- **Server Wrapper**: [`server.ts`](packages/sdk/js/src/server.ts:1) - `createKiloServer()`

### 4.2 Client Creation
```typescript
// packages/sdk/js/src/client.ts:8
export function createKiloClient(config?: Config & { directory?: string }) {
  // Sets x-kilo-directory header
  // Returns KiloClient wrapper around auto-generated client
}
```

### 4.3 Server Spawning
```typescript
// packages/sdk/js/src/server.ts:54
export async function createKiloServer(options?: ServerOptions) {
  // Spawns 'kilo serve' process
  // Waits for "kilo server listening" output
  // Returns URL and close function
}
```

---

## 5. Extension CLI Integration

### Location: [`packages/kilo-vscode/src/services/cli-backend/`](packages/kilo-vscode/src/services/cli-backend/)

### 5.1 Server Manager
- [`server-manager.ts`](packages/kilo-vscode/src/services/cli-backend/server-manager.ts:1) - Manages CLI process lifecycle
- Spawns `kilo serve --port 0` (line 69)
- Sets environment variables (lines 70-83):
  - `KILO_SERVER_PASSWORD` - Random 32-byte hex
  - `KILO_CLIENT=vscode`
  - `KILO_ENABLE_QUESTION_TOOL=true`
  - `KILOCODE_FEATURE=vscode-extension`
  - `KILO_TELEMETRY_LEVEL`
  - `KILO_APP_NAME=kilo-code`
  - `KILO_APP_VERSION`
  - `KILO_VSCODE_VERSION`

### 5.2 Communication
- HTTP + SSE via SDK client
- No direct CLI spawning from external tools
- No IPC mechanism for external tool integration

---

## 6. External Tool References (IDE Detection Only)

### Location: [`packages/opencode/src/ide/index.ts`](packages/opencode/src/ide/index.ts:8)

The codebase references external tools only for IDE detection:
```typescript
const SUPPORTED_IDES = [
  { name: "Windsurf" as const, cmd: "windsurf" },
  { name: "Visual Studio Code - Insiders" as const, cmd: "code-insiders" },
  { name: "Visual Studio Code" as const, cmd: "code" },
  { name: "Cursor" as const, cmd: "cursor" },
  { name: "VSCodium" as const, cmd: "codium" },
]
```

**Note**: This is NOT CLI toggle integration - just IDE detection for feature flags.

---

## 7. Ollama Integration (Provider Only)

### Location: [`packages/opencode/src/provider/models-snapshot.ts`](packages/opencode/src/provider/models-snapshot.ts:1)

Ollama is only integrated as an LLM provider via `ollama-cloud` configuration. It is not a CLI toggle target.

---

## 8. Missing Infrastructure for CLI Toggle

### 8.1 What's Missing

| Component | Status | Location |
|-----------|--------|----------|
| CLI toggle command | **MISSING** | N/A - needs new `cmd/toggle.ts` |
| External tool registry | **MISSING** | N/A - needs new config/registry |
| Tool spawning mechanism | **MISSING** | N/A - needs process management |
| Tool status endpoint | **MISSING** | N/A - needs `/toggle/:tool/status` |
| Tool configuration UI | **MISSING** | N/A - needs webview UI |
| SDK tool methods | **MISSING** | N/A - needs client.gen.ts update |
| External tool communication protocol | **MISSING** | N/A - needs design |

### 8.2 Required Components

1. **CLI Command** (`packages/opencode/src/cli/cmd/toggle.ts`)
   - `toggle list` - List available external tools
   - `toggle enable <tool>` - Enable a tool
   - `toggle disable <tool>` - Disable a tool
   - `toggle status <tool>` - Check tool status
   - `toggle spawn <tool>` - Launch external tool

2. **Server Routes** (`packages/opencode/src/server/routes/toggle.ts`)
   - `GET /toggle/tools` - List available tools
   - `GET /toggle/:tool/status` - Get tool status
   - `POST /toggle/:tool/spawn` - Spawn tool process
   - `POST /toggle/:tool/kill` - Kill tool process

3. **Configuration Schema** (`packages/opencode/src/config/`)
   - External tool registry
   - Tool-specific settings
   - Path detection for external binaries

4. **Process Management**
   - Spawn external tool processes
   - Monitor tool health
   - Handle tool output streams
   - Graceful shutdown

5. **SDK Updates** (`packages/sdk/js/src/`)
   - Tool management client methods
   - Process status types

---

## 9. Priority Recommendations

### Priority 1: Core Infrastructure
1. Create `cmd/toggle.ts` with basic command structure
2. Add configuration schema for external tools
3. Create `routes/toggle.ts` with basic endpoints

### Priority 2: Process Management
4. Implement tool spawning in CLI
5. Add health monitoring for external tools
6. Create IPC communication mechanism

### Priority 3: UI Integration
7. Add toggle UI to VS Code extension settings
8. Create webview components for tool management
9. Add status indicators in Agent Manager

### Priority 4: SDK & Documentation
10. Update SDK with tool management methods
11. Add API documentation
12. Write integration tests

---

## 10. Key File References

| Purpose | File Path | Lines |
|---------|-----------|-------|
| CLI serve command | [`packages/opencode/src/cli/cmd/serve.ts`](packages/opencode/src/cli/cmd/serve.ts:1) | 45 |
| Server main | [`packages/opencode/src/server/server.ts`](packages/opencode/src/server/server.ts:1) | 694 |
| Auth middleware | [`packages/opencode/src/server/server.ts`](packages/opencode/src/server/server.ts:94) | 8 |
| Session routes | [`packages/opencode/src/server/routes/session.ts`](packages/opencode/src/server/routes/session.ts:1) | 29,627 |
| Global events | [`packages/opencode/src/server/routes/global.ts`](packages/opencode/src/server/routes/global.ts:41) | 69 |
| Kilo routes | [`packages/opencode/src/server/routes/kilocode.ts`](packages/opencode/src/server/routes/kilocode.ts:1) | 74 |
| SDK server | [`packages/sdk/js/src/server.ts`](packages/sdk/js/src/server.ts:1) | 162 |
| SDK client | [`packages/sdk/js/src/client.ts`](packages/sdk/js/src/client.ts:1) | 35 |
| Server manager | [`packages/kilo-vscode/src/services/cli-backend/server-manager.ts`](packages/kilo-vscode/src/services/cli-backend/server-manager.ts:1) | 245 |
| IDE detection | [`packages/opencode/src/ide/index.ts`](packages/opencode/src/ide/index.ts:8) | 12 |
| Provider models | [`packages/opencode/src/provider/models-snapshot.ts`](packages/opencode/src/provider/models-snapshot.ts:1) | 1 |

---

## Conclusion

The CLI infrastructure is well-developed for its current use case (VS Code extension integration via spawned `kilo serve` process). However, it lacks **all** infrastructure for CLI toggle functionality with external tools.

**No existing code handles:**
- External tool discovery
- External tool spawning
- External tool communication
- External tool lifecycle management
- CLI toggle UI

The implementation would need to start from scratch with new commands, routes, configuration, and UI components.
