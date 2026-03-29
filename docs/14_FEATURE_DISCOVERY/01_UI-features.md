# UI Features Documentation

**Agent:** 01 - UI Components  
**Discovery Date:** 2026-03-29  
**Packages Scanned:** `kilo-ui/`, `app/src/pages/`, `webview-ui/src/components/`

---

## Table of Contents

1. [Component Library](#1-component-library)
2. [Theme System](#2-theme-system)
3. [Toast Notifications](#3-toast-notifications)
4. [Tooltips](#4-tooltips)
5. [Chat Interface Components](#5-chat-interface-components)
6. [Settings Panels](#6-settings-panels)
7. [Agent Manager UI](#7-agent-manager-ui)

---

## 1. Component Library

### 1.1 Button Component

**Location:** `packages/kilo-ui/src/components/button.tsx`

**Description:** Primary interactive button component with multiple variants.

**Variants:**
- `default` - Standard button
- `primary` - Primary action button
- `secondary` - Secondary action button
- `ghost` - Ghost/outline style
- `danger` - Destructive actions
- `success` - Successconfirmations

**Props:**
```typescript
interface ButtonProps {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: (e: MouseEvent) => void
  children: JSX.Element
}
```

**Usage Example:**
```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Submit
</Button>
```

### 1.2 Input Component

**Location:** `packages/kilo-ui/src/components/input.tsx`

**Description:** Text input component with consistent styling.

**Props:**
```typescript
interface InputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'onInput'> {
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url'
  onInput?: (e: InputEvent & { currentTarget: HTMLInputElement }) => void
}
```

**Usage Example:**
```tsx
<Input 
  type="text" 
  placeholder="Enter your name" 
  onInput={(e) => setValue(e.currentTarget.value)} 
/>
```

### 1.3 Toast Component

**Location:** `packages/kilo-ui/src/components/toast.tsx`

**Description:** Notification toast component for displaying transient messages.

**Variants:**
- `default` - General information
- `success` - Success messages
- `error` - Error messages
- `warning` - Warning messages
- `info` - Informational messages
- `loading` - Loading state

**Features:**
- Auto-dismiss timer
- Manual dismiss button
- Stacking multiple toasts
- Custom duration
- Icon display
- Action buttons

**Usage Example:**
```tsx
toast.success('File saved successfully', {
  duration: 3000,
  action: { label: 'Undo', onClick: handleUndo }
})
```

### 1.4 Tooltip Component

**Location:** `packages/kilo-ui/src/components/tooltip.tsx`

**Description:** Hover tooltip for additional information.

**Placement Options:**
- `top`, `bottom`, `left`, `right`
- `top-start`, `top-end`
- `bottom-start`, `bottom-end`

**Features:**
- Delay configuration
- Force open state
- Keyboard accessibility
- Keybind display support

**Usage Example:**
```tsx
<Tooltip content="Save file" placement="top">
  <button>💾</button>
</Tooltip>
```

---

## 2. Theme System

### 2.1 Theme Infrastructure

**Location:** `packages/ui/src/theme/`

**Description:** Comprehensive theming system supporting 14+ visual themes.

**Available Themes:**
| Theme | File | Characteristics |
|-------|------|-----------------|
| Aura | `themes/aura.json` | Purple accent, modern |
| Ayu | `themes/ayu.json` | GitHub-inspired colors |
| Carbonfox | `themes/carbonfox.json` | Dark, muted tones |
| Catppuccin | `themes/catppuccin.json` | Pastel, Mocha variants |
| Dracula | `themes/dracula.json` | Classic dark theme |
| Gruvbox | `themes/gruvbox.json` | Retro, warm colors |
| Monokai | `themes/monokai.json` | Vibrant syntax colors |
| Nightowl | `themes/nightowl.json` | Light, blue accents |
| Nord | `themes/nord.json` | Arctic, cool tones |
| OC-2 | `themes/oc-2.json` | Kilo custom theme |
| Onedarkpro | `themes/onedarkpro.json` | One Dark inspired |
| Shades of Purple | `themes/shadesofpurple.json` | Purple-centric |
| Solarized | `themes/solarized.json` | Low contrast, solarized |
| Tokyo Night | `themes/tokyonight.json` | Japanese night aesthetic |
| Vesper | `themes/vesper.json` | Dark, warm tones |

### 2.2 Theme Resolution

**Location:** `packages/ui/src/theme/resolve.ts`

**Features:**
- OS theme detection (light/dark)
- User preference override
- Runtime theme switching
- Theme persistence
- CSS variable generation

### 2.3 Theme Loader

**Location:** `packages/ui/src/theme/loader.ts`

**Features:**
- Async theme loading
- Theme validation
- Fallback to default
- Theme caching

---

## 3. Toast Notifications

### 3.1 Toast System Architecture

**Location:** `packages/kilo-ui/src/components/toast.tsx`

**Features:**
- Toast manager singleton
- Queue-based display
- Position management (top, bottom, left, right)
- Max visible toasts limit
- Progress indicator for timed toasts

### 3.2 Toast Variants

| Variant | Icon | Color | Use Case |
|---------|------|-------|----------|
| `default` | ℹ️ | Blue | General info |
| `success` | ✓ | Green | Success confirmations |
| `error` | ✕ | Red | Error messages |
| `warning` | ⚠ | Yellow | Warnings |
| `info` | ℹ️ | Blue | Information |
| `loading` | ⟳ | Blue | Async operations |

### 3.3 Toast Configuration

```typescript
interface ToastConfig {
  duration?: number      // Auto-dismiss delay (ms)
  dismissible?: boolean  // Show close button
  position?: Position    // Screen position
  maxVisible?: number    // Max simultaneous toasts
  pauseOnHover?: boolean // Pause timer on hover
}
```

---

## 4. Tooltips

### 4.1 Tooltip System

**Location:** `packages/kilo-ui/src/components/tooltip.tsx`

**Placement Options:**
```typescript
type Placement = 
  | 'top' | 'bottom' | 'left' | 'right'
  | 'top-start' | 'top-end'
  | 'bottom-start' | 'bottom-end'
  | 'left-start' | 'left-end'
  | 'right-start' | 'right-end'
```

**Features:**
- Mouse hover activation
- Focus activation for accessibility
- Delay configuration (enter/leave)
- Force open mode
- Keybind display (e.g., "Ctrl+S")

### 4.2 Tooltip Props

```typescript
interface TooltipProps {
  content: string | JSX.Element
  placement?: Placement
  delay?: number
  forceOpen?: boolean
  children: JSX.Element
}
```

---

## 5. Chat Interface Components

### 5.1 Message Timeline

**Location:** `packages/app/src/pages/session/message-timeline.tsx`

**Description:** Main chat message display with history.

**Features:**
- Virtual scrolling for performance
- Message grouping by date
- Auto-scroll to latest
- Jump to message
- Message reactions
- Code block syntax highlighting

### 5.2 Composer

**Location:** `packages/app/src/pages/session/composer/`

**Components:**
- `SessionComposerState` - Composer state management
- `SessionComposerRegion` - Editable region
- `SessionPermissionDock` - Permission requests
- `SessionQuestionDock` - Questions panel
- `SessionTodoDock` - Todo items panel
- `SessionRequestTree` - Request hierarchy

### 5.3 Prompt Input

**Location:** `packages/app/src/pages/session.tsx`

**Features:**
- Multi-line input
- File drag-and-drop
- Slash commands (`/`, `/terminal`, `/share`)
- Shell command detection (`!`)
- @mention file support
- History navigation (up/down)
- Autocomplete

### 5.4 File Tabs

**Location:** `packages/app/src/pages/session/file-tabs.tsx`

**Features:**
- Tab bar for open files
- Scroll to tab
- Tab close button
- File modification indicator

### 5.5 Terminal Panel

**Location:** `packages/app/src/pages/session/terminal-panel.tsx`

**Features:**
- Embedded terminal
- Multiple terminal tabs
- Terminal label management
- Terminal clear

---

## 6. Settings Panels

### 6.1 Settings Architecture

**Location:** `packages/kilo-vscode/src/SettingsEditorProvider.ts`

**Description:** VS Code settings editor integration.

**Features:**
- Settings tree view
- Search functionality
- Settings validation
- Change tracking
- Reset to defaults

### 6.2 Settings Categories

| Category | Description |
|----------|-------------|
| `agent-behaviour` | Agent behavior settings |
| `providers` | AI provider configuration |
| `models` | Model selection and priorities |
| `appearance` | Theme and UI settings |
| `keybindings` | Keyboard shortcuts |
| `advanced` | Advanced configuration |

### 6.3 Provider Configuration UI

**Location:** `webview-ui/src/components/settings/`

**Features:**
- Provider add/remove
- API key management
- Endpoint configuration
- Model selection per provider
- Priority ordering
- Health check status

---

## 7. Agent Manager UI

### 7.1 Worktree Manager

**Location:** `webview-ui/agent-manager/WorktreeItem.tsx`

**Features:**
- Worktree list display
- Worktree creation dialog
- Worktree deletion
- Branch switching
- Git stats display

### 7.2 Multi-Model Selector

**Location:** `webview-ui/agent-manager/MultiModelSelector.tsx`

**Features:**
- Model dropdown
- Multi-model support
- Model filtering
- Provider grouping

### 7.3 Review Annotations

**Location:** `webview-ui/agent-manager/review-annotations.ts`

**Features:**
- Inline diff viewer
- Comment threading
- Review status indicators
- Annotation rendering

---

## Cross-References

- **Backend Features:** [`02_backend-features.md`](./02_backend-features.md)
- **Chat Features:** [`03_chat-features.md`](./03_chat-features.md)
- **Settings Features:** [`04_settings-features.md`](./04_settings-features.md)

---

*Document generated by Agent-01 (UI Components)*
