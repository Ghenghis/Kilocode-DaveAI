# Special Features Documentation

**Agent:** 02/09/10 - Agent Manager, Browser Automation, Legacy Migration  
**Discovery Date:** 2026-03-29  
**Packages Scanned:** `agent-manager/`, `browser-automation/`, `legacy-migration/`, `marketplace/`

---

## Table of Contents

1. [Agent Manager](#1-agent-manager)
2. [Worktree Management](#2-worktree-management)
3. [Multi-Session Orchestration](#3-multi-session-orchestration)
4. [Legacy Migration](#4-legacy-migration)
5. [Marketplace Integration](#5-marketplace-integration)
6. [Browser Automation](#6-browser-automation)
7. [Telemetry & Analytics](#7-telemetry--analytics)

---

## 1. Agent Manager

### 1.1 Agent Manager Overview

**Location:** `packages/kilo-vscode/src/agent-manager/`

**Description:** Multi-session orchestration system with git worktree isolation.

**Key Files:**
- `AgentManagerProvider.ts` - Main provider (68KB)
- `WorktreeManager.ts` - Worktree management (37KB)
- `WorktreeStateManager.ts` - State persistence (13KB)
- `SessionTerminalManager.ts` - Terminal management (9KB)
- `GitOps.ts` - Git operations (14KB)

### 1.2 Agent Manager Features

| Feature | Description |
|---------|-------------|
| Multi-session | Multiple concurrent chat sessions |
| Worktree isolation | Git worktree per session |
| Branch management | Create/switch branches |
| Terminal per session | Dedicated terminal per session |
| State persistence | Save/restore session state |
| Git stats | Real-time git statistics |

### 1.3 Worktree Manager

**Location:** `packages/kilo-vscode/src/agent-manager/WorktreeManager.ts`

**Features:**
- Create worktree from branch
- Delete worktree
- List worktrees
- Switch between worktrees
- Worktree state tracking

```typescript
interface WorktreeManager {
  createWorktree(name: string, fromBranch?: string): Promise<Worktree>
  deleteWorktree(name: string): Promise<void>
  listWorktrees(): Promise<Worktree[]>
  getWorktree(name: string): Promise<Worktree | null>
  switchWorktree(name: string): Promise<void>
}
```

---

## 2. Worktree Management

### 2.1 Worktree Creation

**Features:**
- Create from existing branch
- Create from commit
- Clone repository
- Custom worktree directory

### 2.2 Worktree State

**Location:** `packages/kilo-vscode/src/agent-manager/WorktreeStateManager.ts`

**Features:**
- Persistent state storage
- State per worktree
- State restoration on reload
- Multi-window support

### 2.3 Worktree UI

**Location:** `webview-ui/agent-manager/WorktreeItem.tsx`

**Features:**
- Tree view display
- Status indicators
- Context menu actions
- Drag and drop reordering

---

## 3. Multi-Session Orchestration

### 3.1 Session Types

**Location:** `packages/kilo-vscode/src/agent-manager/types.ts`

```typescript
interface Session {
  id: string
  name: string
  worktreeId?: string
  branch?: string
  provider?: string
  model?: string
  status: 'active' | 'paused' | 'completed' | 'error'
  createdAt: Date
  updatedAt: Date
}
```

### 3.2 Session Management

**Features:**
- Create session
- Delete session
- Switch session
- Pause/resume session
- Session history

### 3.3 Terminal Manager

**Location:** `packages/kilo-vscode/src/agent-manager/SessionTerminalManager.ts`

**Features:**
- Terminal per session
- Terminal multiplexing
- Terminal state persistence
- Terminal sharing

---

## 4. Legacy Migration

### 4.1 Migration Service

**Location:** `packages/kilo-vscode/src/legacy-migration/migration-service.ts`

**Description:** Migrates from Continue extension to Kilo Code.

**Features:**
- Settings migration
- History migration
- Session migration
- Provider configuration

### 4.2 Migration Handlers

**Location:** `packages/kilo-vscode/src/legacy-migration/`

| Handler | Description |
|---------|-------------|
| `legacy-types.ts` | Legacy type definitions |
| `provider-mapping.ts` | Provider mapping |
| `migration-service.ts` | Main migration logic |

### 4.3 Migration Flow

1. Detect legacy installation
2. Export legacy data
3. Transform to new format
4. Import to Kilo Code
5. Verify migration

---

## 5. Marketplace Integration

### 5.1 Marketplace Detection

**Location:** `packages/kilo-vscode/src/services/marketplace/detection.ts`

**Features:**
- Detect installed extensions
- Check for Continue extension
- Version detection

### 5.2 Marketplace API

**Location:** `packages/kilo-vscode/src/services/marketplace/api.ts`

**Features:**
- Browse extensions
- Search extensions
- Install/uninstall
- Extension metadata

### 5.3 Extension Installer

**Location:** `packages/kilo-vscode/src/services/marketplace/installer.ts`

**Features:**
- Download extension
- Install to VS Code
- Enable/disable
- Update extension

---

## 6. Browser Automation

### 6.1 Browser Automation Service

**Location:** `packages/kilo-vscode/src/services/browser-automation/browser-automation-service.ts`

**Description:** Browser control capabilities for web interactions.

**Features:**
- Launch browser
- Navigate to URL
- Click elements
- Fill forms
- Extract content
- Screenshot

### 6.2 Browser Commands

```typescript
interface BrowserCommand {
  action: 'launch' | 'navigate' | 'click' | 'fill' | 'extract' | 'screenshot'
  target?: string
  value?: string
  options?: BrowserOptions
}
```

### 6.3 Browser Use Cases

- Web search automation
- Documentation fetching
- Web scraping
- Form submission
- Testing web applications

---

## 7. Telemetry & Analytics

### 7.1 Telemetry Client

**Location:** `packages/kilo-telemetry/src/telemetry.ts`

**Features:**
- Event tracking
- User identification
- Session tracking
- Error reporting

### 7.2 OpenTelemetry Integration

**Location:** `packages/kilo-telemetry/src/otel-exporter.ts`

**Features:**
- Distributed tracing
- Trace context propagation
- Span management
- Metric collection

### 7.3 Event Types

| Event | Description |
|-------|-------------|
| `session.create` | Session created |
| `session.delete` | Session deleted |
| `chat.message` | Chat message sent |
| `chat.response` | Chat response received |
| `tool.execute` | Tool executed |
| `error` | Error occurred |

### 7.4 Telemetry Configuration

```typescript
interface TelemetryConfig {
  enabled: boolean
  userId?: string
  endpoint?: string
  samplingRate?: number
  anonymize?: boolean
}
```

---

## Cross-References

- **UI Features:** [`01_UI-features.md`](./01_UI-features.md)
- **Backend Features:** [`02_backend-features.md`](./02_backend-features.md)
- **Chat Features:** [`03_chat-features.md`](./03_chat-features.md)

---

*Document generated by Agent-02/09/10 (Agent Manager, Browser Automation, Legacy Migration)*
