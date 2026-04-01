# FEATURES_LIST.md

## Complete Feature Inventory

**Repository:** KiloCode-DaveAI  
**Discovery Date:** 2026-03-29  
**Documentation Date:** 2026-04-01

---

## Table of Contents

1. [UI Features](#1-ui-features)
2. [Backend Features](#2-backend-features)
3. [Chat Features](#3-chat-features)
4. [Settings Features](#4-settings-features)
5. [Menu Features](#5-menu-features)
6. [Special Features](#6-special-features)
7. [Feature Count Summary](#7-feature-count-summary)

---

## 1. UI Features

### 1.1 Component Library (packages/kilo-ui/src/components/)

| Component | File | Description |
|-----------|------|-------------|
| Button | `button.tsx` | Primary interactive button with variants (default, primary, secondary, ghost, danger, success) |
| Input | `input.tsx` | Text input with type support (text, password, email, number, search, tel, url) |
| Toast | `toast.tsx` | Notification toasts with variants (default, success, error, warning, info, loading) |
| Tooltip | `tooltip.tsx` | Hover tooltip with placement options (top, bottom, left, right, etc.) |
| Badge | `badge.tsx` | Status badges with variants (default, secondary, outline) |
| Alert | `alert.tsx` | Alert messages with variants (info, warning, error, success) |
| Label | `label.tsx` | Form label component |
| Textarea | `textarea.tsx` | Multi-line text input |
| Tabs | `tabs.tsx` | Tabbed interface with List, Trigger, Content |
| Select | `select.tsx` | Dropdown selection component |
| Dialog | `dialog.tsx` | Modal dialog component |
| Switch | `switch.tsx` | Toggle switch component |
| Checkbox | `checkbox.tsx` | Checkbox component |
| RadioGroup | `radio-group.tsx` | Radio button group |
| Accordion | `accordion.tsx` | Collapsible accordion component |
| Collapsible | `collapsible.tsx` | Generic collapsible component |
| Popover | `popover.tsx` | Popover overlay component |
| ContextMenu | `context-menu.tsx` | Context menu component |
| DropdownMenu | `dropdown-menu.tsx` | Dropdown menu component |
| Card | `card.tsx` | Card container component |
| Progress | `progress.tsx` | Progress bar component |
| ProgressCircle | `progress-circle.tsx` | Circular progress indicator |
| Spinner | `spinner.tsx` | Loading spinner |
| Avatar | `avatar.tsx` | User avatar component |
| Icon | `icon.tsx` | Icon component with 150+ icons |
| IconButton | `icon-button.tsx` | Icon-only button |
| Markdown | `markdown.tsx` | Markdown renderer |
| FileIcon | `file-icon.tsx` | File type icon |
| ImagePreview | `image-preview.tsx` | Image preview component |
| ScrollView | `scroll-view.tsx` | Virtual scrolling container |
| List | `list.tsx` | List component with sorting/filtering |
| ResizeHandle | `resize-handle.tsx` | Drag-to-resize handle |
| Keybind | `keybind.tsx` | Keyboard shortcut display |
| HoverCard | `hover-card.tsx` | Hover card component |
| InlineInput | `inline-input.tsx` | Inline editing input |
| TextField | `text-field.tsx` | Text field with label and error |
| Tag | `tag.tsx` | Tag/label component |
| AppIcon | `app-icon.tsx` | Application icon |
| Logo | `logo.tsx` | Logo component |
| ProviderIcon | `provider-icon.tsx` | AI provider icon |
| Font | `font.tsx` | Font configuration |
| File | `file.tsx` | File browser component |
| FileSearch | `file-search.tsx` | File search component |
| FileMedia | `file-media.tsx` | Media file display |

### 1.2 Theme System (packages/ui/src/theme/)

| Theme | File | Type |
|-------|------|------|
| Aura | `themes/aura.json` | Dark |
| Ayu | `themes/ayu.json` | Both |
| Carbonfox | `themes/carbonfox.json` | Dark |
| Catppuccin | `themes/catppuccin.json` | Dark |
| Dracula | `themes/dracula.json` | Dark |
| Gruvbox | `themes/gruvbox.json` | Dark |
| Monokai | `themes/monokai.json` | Dark |
| Nightowl | `themes/nightowl.json` | Light |
| Nord | `themes/nord.json` | Dark |
| OC-2 | `themes/oc-2.json` | Dark (Kilo custom) |
| Onedarkpro | `themes/onedarkpro.json` | Dark |
| Shades of Purple | `themes/shadesofpurple.json` | Dark |
| Solarized | `themes/solarized.json` | Both |
| Tokyo Night | `themes/tokyonight.json` | Dark |
| Vesper | `themes/vesper.json` | Dark |

**Total: 15 themes**

### 1.3 Chat Interface Components

| Component | Location | Description |
|-----------|----------|-------------|
| MessageTimeline | `packages/app/src/pages/session/message-timeline.tsx` | Main chat message display |
| Composer | `packages/app/src/pages/session/composer/` | Message composer |
| FileTabs | `packages/app/src/pages/session/file-tabs.tsx` | Tab bar for open files |
| TerminalPanel | `packages/app/src/pages/session/terminal-panel.tsx` | Embedded terminal |
| SessionReview | `packages/ui/src/components/session-review.tsx` | Review annotations |
| SessionTurn | `packages/ui/src/components/session-turn.tsx` | Chat turn display |
| MessagePart | `packages/ui/src/components/message-part.tsx` | Message content renderer |
| MessageNav | `packages/ui/src/components/message-nav.tsx` | Message navigation |
| SessionRetry | `packages/ui/src/components/session-retry.tsx` | Retry functionality |
| TextReveal | `packages/ui/src/components/text-reveal.tsx` | Animated text reveal |
| TextShimmer | `packages/ui/src/components/text-shimmer.tsx` | Loading shimmer effect |
| TextStrikethrough | `packages/ui/src/components/text-strikethrough.tsx` | Strikethrough animation |
| Typewriter | `packages/ui/src/components/typewriter.tsx` | Typewriter effect |
| ShellSubmessage | `packages/ui/src/components/shell-submessage-motion.tsx` | Shell message animation |
| ThinkingHeading | `packages/ui/src/components/thinking-heading.tsx` | Thinking level display |
| TodoPanel | `packages/app/src/pages/session/composer/session-todo-dock.tsx` | Todo panel |
| QuestionDock | `packages/app/src/pages/session/composer/session-question-dock.tsx` | Questions panel |
| PermissionDock | `packages/app/src/pages/session/composer/session-permission-dock.tsx` | Permissions panel |
| RequestTree | `packages/app/src/pages/session/composer/session-request-tree.ts` | Request hierarchy |

### 1.4 Agent Manager UI

| Component | Location | Description |
|-----------|----------|-------------|
| WorktreeItem | `webview-ui/agent-manager/WorktreeItem.tsx` | Worktree list item |
| MultiModelSelector | `webview-ui/agent-manager/MultiModelSelector.tsx` | Model selector |
| DiffViewerApp | `webview-ui/diff-viewer/DiffViewerApp.tsx` | Diff viewer |
| LineComment | `packages/ui/src/components/line-comment.tsx` | Inline comments |
| LineCommentAnnotations | `packages/ui/src/components/line-comment-annotations.tsx` | Comment threading |
| ToolCountLabel | `packages/ui/src/components/tool-count-label.tsx` | Tool usage display |
| ToolCountSummary | `packages/ui/src/components/tool-count-summary.tsx` | Tool usage summary |
| ToolStatusTitle | `packages/ui/src/components/tool-status-title.tsx` | Tool status display |
| DockPrompt | `packages/ui/src/components/dock-prompt.tsx` | Dock prompt |
| DockSurface | `packages/ui/src/components/dock-surface.tsx` | Dock surface |
| BasicTool | `packages/ui/src/components/basic-tool.tsx` | Tool display |

---

## 2. Backend Features

### 2.1 Server Management

| Feature | Location | Description |
|---------|----------|-------------|
| Server Manager | `packages/kilo-vscode/src/services/cli-backend/server-manager.ts` | CLI server lifecycle |
| Connection Service | `packages/kilo-vscode/src/services/cli-backend/connection-service.ts` | WebSocket/HTTP connections |
| Server Utils | `packages/kilo-vscode/src/services/cli-backend/server-utils.ts` | Port/URL utilities |
| SDK SSE Adapter | `packages/kilo-vscode/src/services/cli-backend/sdk-sse-adapter.ts` | SSE communication |

### 2.2 SDK Integration

| Feature | Location | Description |
|---------|----------|-------------|
| TypeScript SDK | `packages/sdk/js/src/` | Auto-generated SDK |
| SDK Gen Types | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | Generated API types |

### 2.3 Provider System

| Feature | Location | Description |
|---------|----------|-------------|
| Provider Routing | `packages/kilo-gateway/src/provider.ts` | Request routing |
| Provider Types | `packages/kilo-gateway/src/types.ts` | Type definitions |
| TUI Integration | `packages/kilo-gateway/src/tui.ts` | Terminal UI |
| Provider Debug | `packages/kilo-gateway/src/provider-debug.ts` | Debug tools |
| API Routes | `packages/kilo-gateway/src/server/routes.ts` | REST endpoints |

### 2.4 Session Management

| Feature | Location | Description |
|---------|----------|-------------|
| Session Types | `packages/kilo-vscode/src/agent-manager/types.ts` | Type definitions |
| Worktree State | `packages/kilo-vscode/src/agent-manager/WorktreeStateManager.ts` | State persistence |
| Session Terminal | `packages/kilo-vscode/src/agent-manager/SessionTerminalManager.ts` | Terminal management |

### 2.5 Tool Execution

| Feature | Location | Description |
|---------|----------|-------------|
| Tool Interface | `packages/plugin/src/tool.ts` | Tool definition |
| Shell Tool | `packages/plugin/src/shell.ts` | Shell command execution |
| Built-in Tools | `packages/opencode/src/tools/` | read, write, glob, grep, bash, web, edit, goto |

### 2.6 Agent Orchestration

| Feature | Location | Description |
|---------|----------|-------------|
| Agent Manager Provider | `packages/kilo-vscode/src/agent-manager/AgentManagerProvider.ts` | Main provider |
| Git Operations | `packages/kilo-vscode/src/agent-manager/GitOps.ts` | Git operations |
| Git Stats Poller | `packages/kilo-vscode/src/agent-manager/GitStatsPoller.ts` | Git statistics |

---

## 3. Chat Features

### 3.1 Message System

| Feature | Location | Description |
|---------|----------|-------------|
| Message Timeline | `packages/app/src/pages/session/message-timeline.tsx` | Message display |
| Message Rendering | `packages/app/src/pages/session/message-timeline.tsx` | Markdown/code rendering |
| Message Input | `packages/app/src/pages/session.tsx` | Input handling |

### 3.2 Real-time Messaging

| Feature | Location | Description |
|---------|----------|-------------|
| WebSocket Communication | `packages/kilo-vscode/src/services/cli-backend/connection-service.ts` | Bidirectional comm |
| Streaming Responses | `packages/app/src/utils/speech.ts` | Token streaming |
| Message States | `packages/app/src/pages/session/message-timeline.tsx` | State tracking |

### 3.3 Slash Commands

| Feature | Location | Description |
|---------|----------|-------------|
| Command Parser | `packages/app/src/utils/prompt.ts` | `/open`, `/terminal`, `/share`, `/model`, `/clear` |
| Shell Detection | `packages/app/src/utils/prompt.ts` | `!` prefix for shell |
| File Mentions | `packages/app/src/hooks/useFileMention.ts` | `@` file references |
| Image Attachments | `packages/app/src/hooks/useImageAttachments.ts` | Image support |
| Drag and Drop | `packages/app/src/pages/prompt/prompt-drop-file.spec.ts` | File drop |

### 3.4 Terminal Integration

| Feature | Location | Description |
|---------|----------|-------------|
| Terminal Panel | `packages/app/src/pages/session/terminal-panel.tsx` | Embedded terminal |
| Terminal Labels | `packages/app/src/pages/session/terminal-label.ts` | Label management |

### 3.5 Review Features

| Feature | Location | Description |
|---------|----------|-------------|
| Review Tab | `packages/app/src/pages/session/review-tab.tsx` | Diff viewer |
| Review Annotations | `webview-ui/agent-manager/review-annotations.ts` | Inline comments |
| Diff Viewer | `webview-ui/diff-viewer/DiffViewerApp.tsx` | Side-by-side diff |

### 3.6 Context Management

| Feature | Location | Description |
|---------|----------|-------------|
| Prompt Context | `packages/app/src/pages/prompt/context.spec.ts` | Context injection |
| Session History | `packages/app/src/hooks/usePromptHistory.ts` | History navigation |
| Thinking Level | `packages/app/e2e/thinking-level.spec.ts` | Thinking toggle |

---

## 4. Settings Features

### 4.1 Settings Architecture

| Feature | Location | Description |
|---------|----------|-------------|
| Settings Editor Provider | `packages/kilo-vscode/src/SettingsEditorProvider.ts` | VS Code integration |
| Settings Storage | `packages/app/src/utils/persist.ts` | Persistent storage |

### 4.2 Provider Configuration

| Feature | Location | Description |
|---------|----------|-------------|
| Provider Management | `webview-ui/src/utils/config-utils.ts` | Add/remove providers |
| Provider Settings UI | `webview-ui/src/components/settings/` | Settings panels |
| Health Check | `packages/app/src/utils/server-health.ts` | Connectivity test |

### 4.3 Model Selection

| Feature | Location | Description |
|---------|----------|-------------|
| Model Configuration | `webview-ui/src/components/shared/ModelSelector.tsx` | Model dropdown |
| Multi-Model Support | `webview-ui/agent-manager/MultiModelSelector.tsx` | Multi-model |

### 4.4 Theme Customization

| Feature | Location | Description |
|---------|----------|-------------|
| Theme Selection | `webview-ui/src/components/settings/ThemeSettings.tsx` | Theme picker |
| Theme Resolution | `packages/ui/src/theme/resolve.ts` | Runtime switching |
| Theme Loader | `packages/ui/src/theme/loader.ts` | Async loading |

### 4.5 Keybinding Management

| Feature | Location | Description |
|---------|----------|-------------|
| Keybinding Format | `packages/kilo-vscode/src/agent-manager/format-keybinding.ts` | Formatting |
| Default Bindings | `packages/kilo-vscode/package.json` | Default shortcuts |

### 4.6 Feature Flags

| Feature | Location | Description |
|---------|----------|-------------|
| Feature Flags | `webview-ui/src/components/settings/ExperimentalSettings.tsx` | Toggle UI |
| Experimental Settings | `webview-ui/src/components/settings/ExperimentalSettings.tsx` | Beta features |

### 4.7 Workspace Settings

| Feature | Location | Description |
|---------|----------|-------------|
| Workspace Config | `packages/app/src/pages/layout/sidebar-workspace.tsx` | Workspace-specific |
| Project Settings | `.kilocode/config.json` | Project-level config |

---

## 5. Menu Features

### 5.1 VS Code Menu Integration

| Feature | Location | Description |
|---------|----------|-------------|
| Command Palette | `packages/kilo-vscode/package.json` | Commands |
| View Container | `packages/kilo-vscode/package.json` | Views |
| Editor Context | `packages/kilo-vscode/src/code-actions/` | Editor menu |
| Explorer Context | `packages/kilo-vscode/src/` | File explorer |

### 5.2 Context Menus

| Feature | Location | Description |
|---------|----------|-------------|
| Editor Context Menu | `packages/kilo-vscode/src/code-actions/` | AI edit actions |
| Tree Item Menu | `packages/kilo-vscode/src/agent-manager/` | Worktree/session ops |
| Custom Menus | `packages/kilo-vscode/package.json` | Dynamic menus |

### 5.3 Command Palette

| Command | Shortcut | Description |
|---------|----------|-------------|
| `kilo.focus` | `Ctrl+Shift+O` | Focus chat |
| `kilo.newSession` | `Ctrl+Shift+N` | New session |
| `kilo.selectModel` | `Ctrl+Shift+M` | Select model |
| `kilo.toggleAutoApprove` | - | Toggle auto-approve |
| `kilo.openSettings` | - | Open settings |

### 5.4 Status Bar Items

| Feature | Location | Description |
|---------|----------|-------------|
| Status Bar | `packages/kilo-vscode/src/session-status.ts` | Connection status |
| Model Indicator | `packages/kilo-vscode/src/session-status.ts` | Current model |
| Autocomplete Status | `packages/kilo-vscode/src/services/autocomplete/AutocompleteStatusBar.ts` | Autocomplete |

### 5.5 Quick Picks

| Feature | Description |
|---------|-------------|
| Model Selector | Model selection picker |
| Session Picker | Session list picker |
| Provider Picker | Provider selection |
| Command Picker | Command palette |

### 5.6 Sidebar Panels

| Feature | Location | Description |
|---------|----------|-------------|
| Chat Sidebar | `packages/kilo-vscode/src/KiloProvider.ts` | Main chat |
| Agent Manager | `packages/kilo-vscode/src/agent-manager/` | Worktree/session |
| Settings Panel | `packages/kilo-vscode/src/SettingsEditorProvider.ts` | Settings tree |

---

## 6. Special Features

### 6.1 Agent Manager

| Feature | Location | Description |
|---------|----------|-------------|
| Multi-session | `packages/kilo-vscode/src/agent-manager/AgentManagerProvider.ts` | Multiple sessions |
| Worktree Isolation | `packages/kilo-vscode/src/agent-manager/WorktreeManager.ts` | Git worktrees |
| Branch Management | `packages/kilo-vscode/src/agent-manager/GitOps.ts` | Branch operations |
| Terminal per Session | `packages/kilo-vscode/src/agent-manager/SessionTerminalManager.ts` | Dedicated terminals |
| State Persistence | `packages/kilo-vscode/src/agent-manager/WorktreeStateManager.ts` | Save/restore state |
| Git Stats | `packages/kilo-vscode/src/agent-manager/GitStatsPoller.ts` | Real-time stats |

### 6.2 Legacy Migration

| Feature | Location | Description |
|---------|----------|-------------|
| Migration Service | `packages/kilo-vscode/src/legacy-migration/migration-service.ts` | Continue migration |
| Settings Migration | `packages/kilo-vscode/src/legacy-migration/` | Settings import |
| History Migration | `packages/kilo-vscode/src/legacy-migration/` | History import |
| Provider Mapping | `packages/kilo-vscode/src/legacy-migration/provider-mapping.ts` | Provider mapping |

### 6.3 Marketplace Integration

| Feature | Location | Description |
|---------|----------|-------------|
| Extension Detection | `packages/kilo-vscode/src/services/marketplace/detection.ts` | Detect extensions |
| Marketplace API | `packages/kilo-vscode/src/services/marketplace/api.ts` | Browse/search |
| Extension Installer | `packages/kilo-vscode/src/services/marketplace/installer.ts` | Install/uninstall |

### 6.4 Browser Automation

| Feature | Location | Description |
|---------|----------|-------------|
| Browser Service | `packages/kilo-vscode/src/services/browser-automation/browser-automation-service.ts` | Browser control |
| Commands | `packages/kilo-vscode/src/services/browser-automation/` | launch, navigate, click, fill, extract, screenshot |

### 6.5 Telemetry & Analytics

| Feature | Location | Description |
|---------|----------|-------------|
| Telemetry Client | `packages/kilo-telemetry/src/telemetry.ts` | Event tracking |
| OpenTelemetry | `packages/kilo-telemetry/src/otel-exporter.ts` | Distributed tracing |
| Event Types | `packages/kilo-telemetry/src/` | session.create, chat.message, tool.execute, error |

### 6.6 Internationalization

| Feature | Location | Description |
|---------|----------|-------------|
| i18n System | `packages/kilo-i18n/` | Translations |
| Language Files | `packages/app/src/i18n/` | 16 languages supported |

---

## 7. Feature Count Summary

| Category | Feature Count |
|----------|---------------|
| UI Components | 75+ |
| Themes | 15 |
| Backend Services | 15+ |
| Chat Features | 20+ |
| Settings Features | 15+ |
| Menu Features | 10+ |
| Special Features | 15+ |
| **TOTAL** | **165+** |

---

## Cross-References

- **Feature Wiring:** [`FEATURES_WIRING.md`](./FEATURES_WIRING.md)
- **Feature Discovery:** [`docs/14_FEATURE_DISCOVERY/00_MASTER_INDEX.md`](../../docs/14_FEATURE_DISCOVERY/00_MASTER_INDEX.md)
- **Fix Ledger:** [`FIX_LEDGER.md`](./FIX_LEDGER.md)

---

_Document generated: 2026-04-01_
