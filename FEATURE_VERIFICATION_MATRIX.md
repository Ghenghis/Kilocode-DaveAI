# FEATURE_VERIFICATION_MATRIX.md

## Feature-to-File Mapping Matrix

| Feature                | Files | UI Entry                                                                                                             | Backend Path                                                                                   | Config                                                                      | Provider               | Risk Level |
| ---------------------- | ----- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------- | ---------- |
| **file_operations**    | 1,291 | `packages/kilo-vscode/webview-ui/src/components/chat/ChatView.tsx`                                                   | `packages/opencode/src/tool/read.ts`, `write.ts`, `edit.ts`, `glob.ts`, `grep.ts`              | `packages/opencode/src/config/`                                             | N/A                    | HIGH       |
| **provider_routing**   | 353   | `packages/kilo-vscode/webview-ui/src/context/provider.tsx`                                                           | `packages/opencode/src/provider/provider.ts`, `packages/kilo-gateway/src/provider.ts`          | `MODEL_NAME`, `MODEL_FALLBACK_ORDER`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` | 18 bundled providers   | CRITICAL   |
| **session_management** | 409   | `packages/kilo-vscode/webview-ui/src/context/session.tsx`, `packages/app/src/context/global-sync.tsx`                | `packages/opencode/src/session/index.ts`, `packages/opencode/src/server/routes/session.ts`     | `DATABASE_PATH`, `SESSION_TIMEOUT`                                          | N/A                    | CRITICAL   |
| **agent_execution**    | 309   | `packages/kilo-vscode/webview-ui/src/App.tsx`                                                                        | `packages/opencode/src/agent/agent.ts`, `packages/opencode/src/tool/task.ts`                   | N/A                                                                         | N/A                    | HIGH       |
| **ui_sidebar**         | 296   | `packages/kilo-vscode/webview-ui/src/index.tsx`, `packages/kilo-vscode/src/KiloProvider.ts`                          | N/A                                                                                            | `SIDEBAR_POSITION`, `THEME`                                                 | N/A                    | MEDIUM     |
| **ui_chat**            | 219   | `packages/kilo-vscode/webview-ui/src/components/chat/ChatView.tsx`, `packages/app/src/pages/session.tsx`             | N/A                                                                                            | N/A                                                                         | N/A                    | MEDIUM     |
| **webview**            | 208   | `packages/kilo-vscode/webview-ui/src/index.tsx`, `packages/kilo-vscode/src/extension.ts`                             | `packages/kilo-vscode/src/services/cli-backend/connection-service.ts`                          | N/A                                                                         | N/A                    | HIGH       |
| **settings**           | 158   | `packages/kilo-vscode/webview-ui/src/components/settings/Settings.tsx`, `packages/app/src/components/settings-*.tsx` | `packages/opencode/src/config/config.ts`, `packages/sdk/js/src/client.ts`                      | 67 config files                                                             | N/A                    | MEDIUM     |
| **git_operations**     | 154   | `packages/kilo-vscode/src/agent-manager/GitOps.ts`                                                                   | `packages/opencode/src/project/vcs.ts`                                                         | N/A                                                                         | N/A                    | HIGH       |
| **terminal**           | 106   | `packages/app/src/components/terminal.tsx`, `packages/opencode/src/cli/cmd/tui/`                                     | `packages/opencode/src/tool/bash.ts`, `packages/opencode/src/server/routes/pty.ts`             | N/A                                                                         | N/A                    | MEDIUM     |
| **authentication**     | 32    | `packages/kilo-vscode/webview-ui/src/components/settings/ProvidersTab.tsx`                                           | `packages/kilo-gateway/src/auth/device-auth-tui.ts`, `packages/kilo-gateway/src/auth/token.ts` | `KILO_API_KEY`, `KILO_TOKEN`                                                | @kilocode/kilo-gateway | CRITICAL   |
| **telemetry**          | 26    | N/A (background)                                                                                                     | `packages/kilo-telemetry/src/telemetry.ts`                                                     | `ENABLE_TELEMETRY`                                                          | PostHog                | LOW        |

---

## Detailed Feature Mapping

### 1. file_operations

**File Count:** 1,291  
**Risk Level:** HIGH

**Core Files:**
| File | Purpose |
|------|---------|
| `packages/opencode/src/tool/read.ts` | File reading |
| `packages/opencode/src/tool/write.ts` | File writing |
| `packages/opencode/src/tool/edit.ts` | In-place editing |
| `packages/opencode/src/tool/glob.ts` | File pattern matching |
| `packages/opencode/src/tool/grep.ts` | Content search |
| `packages/opencode/src/tool/ls.ts` | Directory listing |
| `packages/opencode/src/tool/registry.ts` | Tool registration |

**UI Entry:** `packages/kilo-vscode/webview-ui/src/components/chat/ChatView.tsx`

**Backend Path:** `packages/opencode/src/tool/` + `packages/opencode/src/server/routes/file.ts`

**Config:** No specific config - uses workspace settings

---

### 2. provider_routing

**File Count:** 353  
**Risk Level:** CRITICAL

**Core Files:**
| File | Purpose |
|------|---------|
| `packages/opencode/src/provider/provider.ts` | Main provider registry (1407 lines) |
| `packages/opencode/src/provider/models.ts` | Models.dev integration |
| `packages/opencode/src/provider/transform.ts` | Message normalization |
| `packages/opencode/src/provider/model-cache.ts` | Kilo model caching |
| `packages/kilo-gateway/src/provider.ts` | Kilo provider factory (103 lines) |
| `packages/kilo-gateway/src/api/models.ts` | Fetch/transform Kilo API models |

**UI Entry:** `packages/kilo-vscode/webview-ui/src/context/provider.tsx`, `provider-utils.ts`

**Backend Path:** `packages/opencode/src/provider/` + `packages/kilo-gateway/src/`

**Config:**
| Config | File |
|--------|------|
| `MODEL_NAME` | `packages/opencode/src/config/config.ts` |
| `MODEL_FALLBACK_ORDER` | `packages/opencode/src/config/config.ts` |
| `OPENAI_API_KEY` | Environment variable |
| `ANTHROPIC_API_KEY` | Environment variable |

**Providers:** 18 bundled AI SDK providers

---

### 3. session_management

**File Count:** 409  
**Risk Level:** CRITICAL

**Core Files:**
| File | Purpose |
|------|---------|
| `packages/opencode/src/session/index.ts` | Session namespace (976 lines) |
| `packages/opencode/src/session/processor.ts` | Core AI processing loop |
| `packages/opencode/src/session/message-v2.ts` | Message schema with parts |
| `packages/opencode/src/session/llm.ts` | LLM interaction layer |
| `packages/opencode/src/session/prompt.ts` | Prompt construction |
| `packages/opencode/src/session/compaction.ts` | Session compaction |
| `packages/opencode/src/session/retry.ts` | Error retry logic |
| `packages/opencode/src/server/routes/session.ts` | Session API routes |

**UI Entry:**

- `packages/kilo-vscode/webview-ui/src/context/session.tsx`
- `packages/kilo-vscode/webview-ui/src/context/session-queue.ts`
- `packages/app/src/context/global-sync.tsx`
- `packages/app/src/context/sdk.tsx`

**Backend Path:** `packages/opencode/src/session/` + `packages/opencode/src/server/routes/session.ts`

**Config:**
| Config | File |
|--------|------|
| `DATABASE_PATH` | `packages/opencode/src/storage/db.ts` |
| `SESSION_TIMEOUT` | `packages/opencode/src/config/` |

---

### 4. agent_execution

**File Count:** 309  
**Risk Level:** HIGH

**Core Files:**
| File | Purpose |
|------|---------|
| `packages/opencode/src/agent/agent.ts` | Agent registry with built-in agents |
| `packages/opencode/src/tool/task.ts` | Subagent spawning |
| `packages/opencode/src/session/processor.ts` | AI processing loop |
| `packages/opencode/src/tool/tool.ts` | Tool interface |

**Built-in Agents:**
| Agent | Purpose |
|-------|---------|
| `code` | Default primary agent |
| `plan` | Plan mode (no edits) |
| `debug` | Debugging specialist |
| `orchestrator` | Task coordinator |
| `ask` | Read-only question answering |
| `explore` | Codebase exploration |

**UI Entry:** `packages/kilo-vscode/webview-ui/src/App.tsx`

**Backend Path:** `packages/opencode/src/agent/` + `packages/opencode/src/tool/task.ts`

---

### 5. ui_sidebar

**File Count:** 296  
**Risk Level:** MEDIUM

**Core Files:**
| File | Purpose |
|------|---------|
| `packages/kilo-vscode/src/KiloProvider.ts` | WebviewViewProvider (2909 lines) |
| `packages/kilo-vscode/webview-ui/src/index.tsx` | Webview entry |
| `packages/kilo-vscode/webview-ui/src/App.tsx` | Main app with providers |

**UI Entry:** `packages/kilo-vscode/webview-ui/src/index.tsx`

**Config:**
| Config | Purpose |
|--------|---------|
| `SIDEBAR_POSITION` | Sidebar location |
| `THEME` | Visual theme |

---

### 6. ui_chat

**File Count:** 219  
**Risk Level:** MEDIUM

**Core Files:**
| File | Purpose |
|------|---------|
| `packages/kilo-vscode/webview-ui/src/components/chat/ChatView.tsx` | Primary chat interface |
| `packages/kilo-vscode/webview-ui/src/components/chat/PromptInput.tsx` | Message input |
| `packages/kilo-vscode/webview-ui/src/components/chat/MessageList.tsx` | Chat history |
| `packages/app/src/pages/session.tsx` | Session page |

**UI Entry:** Both sidebar (`ChatView.tsx`) and web app (`session.tsx`)

---

### 7. webview

**File Count:** 208  
**Risk Level:** HIGH

**Core Files:**
| File | Purpose |
|------|---------|
| `packages/kilo-vscode/webview-ui/src/index.tsx` | Webview entry |
| `packages/kilo-vscode/src/extension.ts` | Extension host entry |
| `packages/kilo-vscode/webview-ui/src/types/messages.ts` | Message types (50624 chars) |
| `packages/kilo-vscode/src/services/cli-backend/connection-service.ts` | Backend communication |

**Message Flow:**

```
Webview (SolidJS) → postMessage → VS Code Extension Host → CLI (kilo serve)
```

**Health Check:** `GET /global/health` every 10s, 3000ms timeout

---

### 8. settings

**File Count:** 158  
**Risk Level:** MEDIUM

**Core Files:**
| File | Purpose |
|------|---------|
| `packages/kilo-vscode/webview-ui/src/components/settings/Settings.tsx` | Main settings |
| `packages/opencode/src/config/config.ts` | Config schema |
| `packages/sdk/js/src/client.ts` | SDK client config |

**UI Entries (16 tabs):**
| Tab | File |
|-----|------|
| General | `GeneralTab.tsx` |
| Models | `ModelsTab.tsx` |
| Providers | `ProvidersTab.tsx` |
| Agent Behaviour | `AgentBehaviourTab.tsx` |
| Auto Approve | `AutoApproveTab.tsx` |
| Browser | `BrowserTab.tsx` |
| Speech | `SpeechTab.tsx` |
| Display | `DisplayTab.tsx` |
| Context | `ContextTab.tsx` |
| Notifications | `NotificationsTab.tsx` |
| Experimental | `ExperimentalTab.tsx` |
| Checkpoints | `CheckpointsTab.tsx` |

---

### 9. git_operations

**File Count:** 154  
**Risk Level:** HIGH

**Core Files:**
| File | Purpose |
|------|---------|
| `packages/kilo-vscode/src/agent-manager/GitOps.ts` | Git operations |
| `packages/opencode/src/project/vcs.ts` | Git abstraction |
| `packages/kilo-vscode/src/agent-manager/WorktreeManager.ts` | Git worktree management |
| `packages/kilo-vscode/src/agent-manager/SetupScriptRunner.ts` | Setup script execution |

**UI Entry:** `packages/kilo-vscode/src/agent-manager/AgentManagerProvider.ts`

---

### 10. terminal

**File Count:** 106  
**Risk Level:** MEDIUM

**Core Files:**
| File | Purpose |
|------|---------|
| `packages/opencode/src/tool/bash.ts` | Shell command execution |
| `packages/opencode/src/server/routes/pty.ts` | PTY/shell routes |
| `packages/app/src/components/terminal.tsx` | Terminal UI |
| `packages/opencode/src/cli/cmd/tui/` | TUI terminal components |

**UI Entry:** `packages/app/src/components/terminal.tsx`, `packages/opencode/src/cli/cmd/tui/`

---

### 11. authentication

**File Count:** 32  
**Risk Level:** CRITICAL

**Core Files:**
| File | Purpose |
|------|---------|
| `packages/kilo-gateway/src/auth/device-auth-tui.ts` | OAuth device flow (current) |
| `packages/kilo-gateway/src/auth/device-auth.ts` | Browser-based auth (legacy) |
| `packages/kilo-gateway/src/auth/token.ts` | Token parsing |
| `packages/kilo-gateway/src/auth/polling.ts` | Generic polling |
| `packages/kilo-gateway/src/plugin.ts` | OpenCode auth plugin |

**UI Entry:** `packages/kilo-vscode/webview-ui/src/components/settings/ProvidersTab.tsx`

**Config:**
| Config | Purpose |
|--------|---------|
| `KILO_API_KEY` | Direct API key |
| `KILO_TOKEN` | OAuth token |

---

### 12. telemetry

**File Count:** 26  
**Risk Level:** LOW

**Core Files:**
| File | Purpose |
|------|---------|
| `packages/kilo-telemetry/src/telemetry.ts` | Main telemetry namespace |
| `packages/kilo-telemetry/src/client.ts` | PostHog client |
| `packages/kilo-telemetry/src/events.ts` | Event type enum |
| `packages/kilo-telemetry/src/tracer.ts` | OpenTelemetry tracer |
| `packages/kilo-telemetry/src/otel-exporter.ts` | PostHog span exporter |

**Backend Path:** PostHog API `https://us.i.posthog.com`

**Config:**
| Config | Purpose |
|--------|---------|
| `ENABLE_TELEMETRY` | Toggle on/off |

---

## Risk Summary by Feature

| Risk Level | Features                                                  |
| ---------- | --------------------------------------------------------- |
| CRITICAL   | provider_routing, session_management, authentication      |
| HIGH       | file_operations, agent_execution, webview, git_operations |
| MEDIUM     | ui_sidebar, ui_chat, settings, terminal                   |
| LOW        | telemetry                                                 |

---

## Gap Analysis by Feature

| Feature               | Gap Count | Critical Gaps                      |
| --------------------- | --------- | ---------------------------------- |
| session_lifecycle     | 3         | GAP-CRIT-001 (prompt injection)    |
| provider_routing      | 2         | GAP-CRIT-002 (fallback chain)      |
| ui_backend_wiring     | 3         | GAP-CRIT-003 (IPC contract)        |
| tool_execution        | 2         | GAP-CRIT-004 (permission boundary) |
| config_schema         | 2         | HIGH risk                          |
| extension_integration | 2         | HIGH risk                          |
| authentication        | 2         | MEDIUM risk                        |
| build_and_typecheck   | 2         | MEDIUM risk                        |
