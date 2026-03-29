# Chat Features Documentation

**Agent:** 06 - Webview & Chat UI  
**Discovery Date:** 2026-03-29  
**Packages Scanned:** `webview-ui/src/`, `app/src/pages/session.tsx`

---

## Table of Contents

1. [Message System](#1-message-system)
2. [Real-time Messaging](#2-real-time-messaging)
3. [Slash Commands](#3-slash-commands)
4. [File Handling](#4-file-handling)
5. [Terminal Integration](#5-terminal-integration)
6. [Review Features](#6-review-features)
7. [Context Management](#7-context-management)

---

## 1. Message System

### 1.1 Message Timeline

**Location:** `packages/app/src/pages/session/message-timeline.tsx`

**Description:** Main chat message display with history support.

**Features:**
- Virtual scrolling for performance
- Message grouping by date
- Auto-scroll to latest message
- Jump to specific message
- Message search
- Copy message content

**Message Structure:**
```typescript
interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string | MessageContent
  timestamp: Date
  attachments?: Attachment[]
  annotations?: Annotation[]
  status?: 'sending' | 'sent' | 'error'
}

interface MessageContent {
  type: 'text' | 'code' | 'image' | 'file'
  text?: string
  language?: string
  uri?: string
}
```

### 1.2 Message Rendering

**Features:**
- Markdown rendering
- Syntax highlighting (code blocks)
- Image display
- File previews
- Link detection
- @mention highlighting

### 1.3 Message Input

**Location:** `packages/app/src/pages/session.tsx`

**Features:**
- Multi-line input support
- Auto-expanding textarea
- Character/line count
- Placeholder text
- Disabled state

---

## 2. Real-time Messaging

### 2.1 WebSocket Communication

**Features:**
- Bidirectional communication
- Stream responses (SSE)
- Heartbeat/ping-pong
- Auto-reconnection
- Message queuing during disconnect

### 2.2 Streaming Responses

**Features:**
- Token-by-token streaming
- Markdown streaming
- Code block streaming
- Interrupted streaming (cancel)
- Speed throttling

### 2.3 Message States

| State | Description |
|-------|-------------|
| `sending` | Message being sent |
| `sent` | Message delivered |
| `streaming` | Response being received |
| `completed` | Full response received |
| `error` | Error occurred |

---

## 3. Slash Commands

### 3.1 Command Parser

**Location:** `packages/app/src/utils/prompt.ts`

**Description:** Parses slash commands in the prompt input.

**Supported Commands:**
| Command | Description | Syntax |
|---------|-------------|--------|
| `/open` | Open file | `/open <filepath>` |
| `/terminal` | Terminal command | `/terminal <command>` |
| `/share` | Share session | `/share` |
| `/model` | Switch model | `/model <model-name>` |
| `/clear` | Clear conversation | `/clear` |

### 3.2 Slash Command Handler

**Location:** `packages/app/src/hooks/useSlashCommand.ts`

**Features:**
- Command autocomplete
- Argument parsing
- Help text display
- Command history

### 3.3 Shell Command Detection

**Feature:** Commands starting with `!` are treated as shell commands.

```bash
!ls -la  # Execute shell command
```

---

## 4. File Handling

### 4.1 File Mentions

**Location:** `packages/app/src/hooks/useFileMention.ts`

**Feature:** Reference files using `@` syntax.

**Syntax:**
```
@filename      # File in workspace root
@src/file.ts   # File in subdirectory
@../file.md     # File in parent directory
```

**Features:**
- Autocomplete file paths
- Relative path resolution
- File existence validation
- Clickable file references

### 4.2 File Drag and Drop

**Location:** `packages/app/src/pages/prompt/prompt-drop-file.spec.ts`

**Features:**
- Drag files into chat
- Drop to attach
- Multiple file support
- URI and content handling

### 4.3 Image Attachments

**Location:** `packages/app/src/hooks/useImageAttachments.ts`

**Features:**
- Image preview
- Multiple images
- Copy/paste images
- File type validation

---

## 5. Terminal Integration

### 5.1 Terminal Panel

**Location:** `packages/app/src/pages/session/terminal-panel.tsx`

**Features:**
- Embedded terminal
- Multiple terminal tabs
- Terminal label display
- Terminal clear
- Terminal resize

### 5.2 Terminal Manager

**Location:** `packages/app/src/pages/session/terminal-panel.tsx`

**Features:**
- Terminal creation
- Terminal destruction
- Terminal switching
- Terminal labeling
- Terminal state persistence

### 5.3 Terminal Labels

**Location:** `packages/app/src/pages/session/terminal-label.ts`

**Features:**
- Custom terminal names
- Auto-generated labels
- Label editing

---

## 6. Review Features

### 6.1 Review Tab

**Location:** `packages/app/src/pages/session/review-tab.tsx`

**Features:**
- Diff viewer
- Side-by-side comparison
- Inline changes
- Approve/reject changes

### 6.2 Review Annotations

**Location:** `webview-ui/agent-manager/review-annotations.ts`

**Features:**
- Inline comments
- Thread replies
- Change highlighting
- Review status

### 6.3 Diff Viewer

**Location:** `webview-ui/diff-viewer/DiffViewerApp.tsx`

**Features:**
- Unified diff view
- Split diff view
- Syntax highlighting
- Line numbers
- Change navigation

---

## 7. Context Management

### 7.1 Prompt Context

**Location:** `packages/app/src/pages/prompt/context.spec.ts`

**Features:**
- Context injection
- File context
- Git context
- Workspace context

### 7.2 Session History

**Location:** `packages/app/src/hooks/usePromptHistory.ts`

**Features:**
- History navigation (up/down)
- Search history
- Clear history
- History persistence

### 7.3 Thinking Level

**Location:** `packages/app/e2e/thinking-level.spec.ts`

**Features:**
- Thinking toggle
- Thinking level display
- Thinking visibility control

---

## Cross-References

- **UI Features:** [`01_UI-features.md`](./01_UI-features.md)
- **Backend Features:** [`02_backend-features.md`](./02_backend-features.md)
- **Settings Features:** [`04_settings-features.md`](./04_settings-features.md)

---

*Document generated by Agent-06 (Webview & Chat UI)*
