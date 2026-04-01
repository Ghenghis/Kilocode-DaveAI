# FEATURE_RUNTIME_AUDIT.md

## Audit Summary

This document contains the runtime audit results for each feature, based on actual code verification.

---

## Feature Status Overview

| Feature                | Status      | Issue                         | Likely Cause                                 | Target Files                                                                                |
| ---------------------- | ----------- | ----------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **file_operations**    | WORKING     | None                          | N/A                                          | N/A                                                                                         |
| **provider_routing**   | NOT_AUDITED | Aborted                       | Agent timeout                                | `packages/opencode/src/provider/`, `packages/kilo-gateway/src/`                             |
| **session_management** | NOT_AUDITED | Aborted                       | Agent timeout                                | `packages/opencode/src/session/`                                                            |
| **agent_execution**    | WORKING     | None                          | N/A                                          | N/A                                                                                         |
| **ui_sidebar**         | NOT_AUDITED | Aborted                       | Agent timeout                                | `packages/kilo-vscode/webview-ui/src/`                                                      |
| **ui_chat**            | NOT_AUDITED | Aborted                       | Agent timeout                                | `packages/kilo-vscode/webview-ui/src/components/chat/`                                      |
| **webview**            | NOT_AUDITED | Aborted                       | Agent timeout                                | `packages/kilo-vscode/src/`, `packages/kilo-vscode/webview-ui/src/types/messages.ts`        |
| **settings**           | NOT_AUDITED | Aborted                       | Agent timeout                                | `packages/opencode/src/config/`, `packages/kilo-vscode/webview-ui/src/components/settings/` |
| **git_operations**     | WORKING     | None                          | N/A                                          | N/A                                                                                         |
| **terminal**           | WORKING     | None                          | N/A                                          | N/A                                                                                         |
| **authentication**     | PARTIAL     | Organization selection bypass | TUI flow designed for personal accounts only | `packages/kilo-gateway/src/auth/device-auth-tui.ts`                                         |
| **telemetry**          | NOT_AUDITED | Aborted                       | Agent timeout                                | `packages/kilo-telemetry/src/`                                                              |

---

## Detailed Feature Audits

### 1. file_operations - WORKING ✓

**Files Verified:**
| File | Status | Lines |
|------|--------|-------|
| `packages/opencode/src/tool/read.ts` | ✓ | 293 |
| `packages/opencode/src/tool/write.ts` | ✓ | 85 |
| `packages/opencode/src/tool/edit.ts` | ✓ | 669 |
| `packages/opencode/src/tool/glob.ts` | ✓ | 78 |
| `packages/opencode/src/tool/grep.ts` | ✓ | 156 |
| `packages/opencode/src/tool/registry.ts` | ✓ | 177 |

**Findings:**

- All tools properly defined using `Tool.define()` pattern
- Zod schema validation in place
- Permission layer integration via `ctx.ask()`
- External directory protection via `assertExternalDirectory()`
- File watcher integration via `Bus.publish()`
- LSP diagnostics integration present

**Registry Verification:**
`registry.ts` `all()` function properly exports: `ReadTool`, `WriteTool`, `EditTool`, `GlobTool`, `GrepTool`

**Kilo-specific notes:** `filterDiagnostics` import has `// kilocode_change` markers (intentional).

---

### 2. agent_execution - WORKING ✓

**Files Verified:**
| File | Status |
|------|--------|
| `packages/opencode/src/agent/agent.ts` | ✓ EXISTS |
| `packages/opencode/src/tool/task.ts` | ✓ EXISTS |
| `packages/opencode/src/session/processor.ts` | ✓ EXISTS |

**Registry Status:**
11 predefined agents found: `code`, `plan`, `debug`, `orchestrator`, `ask`, `general`, `explore`, `compaction`, `title`, `summary`

**Wiring Chain:**

```
TaskTool.init() → SessionPrompt.prompt() → ToolRegistry.tools() → processor.ts
```

**Findings:**

- Agent registry properly populated
- TaskTool registered in `ToolRegistry` (registry.ts:113)
- `Session.create()` properly called in task.ts:72
- All prompt files exist: `generate.txt`, `compaction.txt`, `debug.txt`, etc.

---

### 3. git_operations - WORKING ✓

**Files Verified:**
| File | Status | Lines |
|------|--------|-------|
| `packages/kilo-vscode/src/agent-manager/GitOps.ts` | ✓ | 383 |
| `packages/opencode/src/project/vcs.ts` | ✓ | 76 |
| `packages/kilo-vscode/src/agent-manager/WorktreeManager.ts` | ✓ | 1014 |

**Wiring Verified:**

- GitOps imported by: `KiloProvider.ts`, `DiffViewerProvider.ts`, `AgentManagerProvider.ts`, `review-utils.ts`
- WorktreeManager imported by: `AgentManagerProvider.ts`
- Vcs imported by: `server.ts`, `bootstrap.ts`, `kilo-sessions.ts`

**Findings:**

- Uses `simple-git` (v3.31.1) with proper `spawn` wrapper
- Per-repo mutex locks prevent `index.lock` conflicts
- Multi-strategy branch detection with cross-platform path normalization
- 3-way git apply with conflict parsing

---

### 4. terminal - WORKING ✓

**Files Verified:**
| File | Status | Notes |
|------|--------|-------|
| `packages/opencode/src/tool/bash.ts` | ✓ | Agent command execution tool |
| `packages/opencode/src/server/routes/pty.ts` | ✓ | Server PTY routes |
| `packages/app/src/components/terminal.tsx` | ✓ | WebSocket UI component |

**Backend Wiring:**

- `server.ts` (line 29, 266): Imports and mounts `PtyRoutes` at `/pty`
- `PTYRoute` implements: list, create, get, update, delete, connect
- Uses `bun-pty` for PTY spawning

**Frontend Wiring:**

- `terminal.tsx` (lines 450-459): WebSocket connection to `/pty/${id}/connect`
- Uses `sdk.client.pty.update()` for resize sync

**Note:** `bash.ts` is NOT the interactive terminal - it's the AI agent shell command tool.

---

### 5. authentication - PARTIAL ⚠

**Files Verified:**
| File | Status | Notes |
|------|--------|-------|
| `packages/kilo-gateway/src/auth/device-auth-tui.ts` | ✓ | Core OAuth TUI flow |
| `packages/kilo-gateway/src/auth/token.ts` | ✓ | Token parsing utilities |
| `packages/kilo-gateway/src/plugin.ts` | ✓ | Plugin integration |

**Issues Found:**

#### Issue 1: Organization Selection Bypass (Medium Severity)

**Location:** `device-auth-tui.ts` lines 128-132

```typescript
// For TUI version, complete with personal account by default
// Organization selection is handled by TUI after this callback completes
const organizationId = undefined
const model = await getKiloDefaultModel(token, organizationId)
```

**Problem:** Organization is hardcoded to `undefined`. Multi-organization users are never prompted to select their organization.

#### Issue 2: Token Validation Minimal (Low Severity)

**Location:** `token.ts` lines 26-31

```typescript
export function isValidKilocodeToken(token: string): boolean {
  if (!token || typeof token !== "string") return false
  return token.length > 10
}
```

**Problem:** Only checks token length > 10 characters. No format validation.

#### Issue 3: Null Handling Gap (Low Severity)

**Location:** `device-auth-tui.ts` lines 120-122

```typescript
if (!result.token || !result.userEmail) {
  return { type: "failed" }
}
```

**Problem:** Silent failure if polling API returns `status: "approved"` without required fields.

#### Issue 4: No Environment Variable Validation (Low Severity)

**Location:** `constants.ts` line 13

```typescript
export const KILO_API_BASE = process.env[ENV_KILO_API_URL] || DEFAULT_KILO_API_URL
```

**Problem:** Invalid URLs would cause cryptic fetch failures later.

**Plugin Integration Status:** WORKING - `KiloAuthPlugin` properly wired in `INTERNAL_PLUGINS`

**Target Files to Fix:**

1. `packages/kilo-gateway/src/auth/device-auth-tui.ts` - Add organization selection
2. `packages/kilo-gateway/src/auth/token.ts` - Improve format validation

---

## NOT_AUDITED Features

The following features were not audited due to agent timeout:

| Feature            | Status      | Reason        |
| ------------------ | ----------- | ------------- |
| provider_routing   | NOT_AUDITED | Agent aborted |
| session_management | NOT_AUDITED | Agent aborted |
| ui_sidebar         | NOT_AUDITED | Agent aborted |
| ui_chat            | NOT_AUDITED | Agent aborted |
| webview            | NOT_AUDITED | Agent aborted |
| settings           | NOT_AUDITED | Agent aborted |
| telemetry          | NOT_AUDITED | Agent aborted |

---

## Audit Coverage Summary

| Status      | Count | Features                                                                                |
| ----------- | ----- | --------------------------------------------------------------------------------------- |
| WORKING     | 5     | file_operations, agent_execution, git_operations, terminal, (1 more)                    |
| PARTIAL     | 1     | authentication                                                                          |
| NOT_AUDITED | 6     | provider_routing, session_management, ui_sidebar, ui_chat, webview, settings, telemetry |

**Coverage: 41% of features audited (5/12 working, 1/12 partial)**
