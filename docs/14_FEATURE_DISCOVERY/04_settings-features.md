# Settings Features Documentation

**Agent:** 07 - Settings & Configuration  
**Discovery Date:** 2026-03-29  
**Packages Scanned:** `SettingsEditorProvider.ts`, settings panels, configuration files

---

## Table of Contents

1. [Settings Architecture](#1-settings-architecture)
2. [Provider Configuration](#2-provider-configuration)
3. [Model Selection](#3-model-selection)
4. [Theme Customization](#4-theme-customization)
5. [Keybinding Management](#5-keybinding-management)
6. [Feature Flags](#6-feature-flags)
7. [Workspace Settings](#7-workspace-settings)

---

## 1. Settings Architecture

### 1.1 Settings Editor Provider

**Location:** `packages/kilo-vscode/src/SettingsEditorProvider.ts`

**Description:** VS Code settings editor integration for Kilo Code settings.

**Features:**

- Tree-based settings view
- Search functionality
- Settings validation
- Change tracking
- Reset to defaults
- Import/export settings

### 1.2 Settings Structure

```typescript
interface Settings {
  // Provider settings
  providers: ProviderConfig[]

  // Model settings
  models: ModelConfig[]

  // Appearance settings
  appearance: AppearanceSettings

  // Behavior settings
  behavior: BehaviorSettings

  // Keybindings
  keybindings: KeybindingSettings

  // Advanced settings
  advanced: AdvancedSettings
}
```

### 1.3 Settings Storage

**Location:** `packages/app/src/utils/persist.ts`

**Features:**

- Persistent storage
- Cross-session persistence
- Default values
- Settings migration
- Encryption for sensitive data

---

## 2. Provider Configuration

### 2.1 Provider Management

**Location:** `webview-ui/src/utils/config-utils.ts`

**Features:**

- Add/remove providers
- API key management (secure storage)
- Endpoint configuration
- Custom provider support

### 2.2 Provider Settings UI

**Location:** `webview-ui/src/components/settings/`

**Settings:**

```typescript
interface ProviderSettings {
  id: string
  name: string
  type: "openai" | "anthropic" | "azure" | "google" | "local"
  apiKey?: string // Stored securely
  endpoint?: string // Custom API endpoint
  enabled: boolean
  priority: number // Higher = preferred
  models: string[] // Enabled models
  capabilities?: {
    streaming?: boolean
    functionCalling?: boolean
    vision?: boolean
  }
}
```

### 2.3 Health Check

**Features:**

- Provider connectivity test
- API key validation
- Response time measurement
- Status indicators (green/yellow/red)

---

## 3. Model Selection

### 3.1 Model Configuration

**Location:** `webview-ui/src/components/shared/ModelSelector.tsx`

**Features:**

- Model dropdown selection
- Multi-model support
- Model filtering by provider
- Priority ordering
- Default model setting

### 3.2 Model Settings

```typescript
interface ModelConfig {
  id: string // e.g., "gpt-4-turbo"
  provider: string // Provider ID
  enabled: boolean
  priority: number
  contextWindow?: number // Context window size
  maxTokens?: number // Max response tokens
  temperature?: number // Sampling temperature
  topP?: number // Top-p sampling
}
```

### 3.3 Model Selector Component

**Features:**

- Search/filter models
- Provider grouping
- Model comparison view
- Recently used models
- Favorites

---

## 4. Theme Customization

### 4.1 Theme Selection

**Location:** `webview-ui/src/components/settings/ThemeSettings.tsx`

**Features:**

- Theme dropdown
- Light/dark mode toggle
- OS theme sync
- Preview thumbnails

### 4.2 Theme Settings

```typescript
interface ThemeSettings {
  theme: string // Theme ID
  variant: "light" | "dark" | "auto"
  accentColor?: string // Custom accent
  fontSize?: number
  fontFamily?: string
  lineHeight?: number
}
```

### 4.3 Available Themes

| Theme ID     | Name         | Type |
| ------------ | ------------ | ---- |
| `aura`       | Aura         | Dark |
| `ayu`        | Ayu          | Both |
| `catppuccin` | Catppuccin   | Dark |
| `dracula`    | Dracula      | Dark |
| `gruvbox`    | Gruvbox      | Dark |
| `monokai`    | Monokai      | Dark |
| `nord`       | Nord         | Dark |
| `oc-2`       | Kilo Dark    | Dark |
| `onedarkpro` | One Dark Pro | Dark |
| `solarized`  | Solarized    | Both |
| `tokyonight` | Tokyo Night  | Dark |

---

## 5. Keybinding Management

### 5.1 Keybinding Settings

**Location:** `packages/kilo-vscode/src/agent-manager/format-keybinding.ts`

**Features:**

- Custom keyboard shortcuts
- Keybinding conflict detection
- Default keybindings
- Keybinding presets

### 5.2 Keybinding Structure

```typescript
interface KeybindingSettings {
  [command: string]: string // e.g., "ctrl+shift+p"
}
```

### 5.3 Default Keybindings

| Command              | Default Binding | Description    |
| -------------------- | --------------- | -------------- |
| `kilo.focus`         | `Ctrl+Shift+O`  | Focus chat     |
| `kilo.newSession`    | `Ctrl+Shift+N`  | New session    |
| `kilo.toggleSidebar` | `Ctrl+B`        | Toggle sidebar |

---

## 6. Feature Flags

### 6.1 Feature Flag System

**Features:**

- Enable/disable features
- A/B testing support
- Gradual rollouts
- User segment targeting

### 6.2 Feature Flags Configuration

```typescript
interface FeatureFlags {
  // Chat features
  streamingResponses: boolean
  multiModelSupport: boolean
  slashCommands: boolean

  // UI features
  compactMode: boolean
  soundEffects: boolean

  // Experimental
  experimentalFeatures: boolean
  betaFeatures: boolean
}
```

### 6.3 Feature Flag UI

**Location:** `webview-ui/src/components/settings/ExperimentalSettings.tsx`

**Features:**

- Toggle switches
- Experimental section
- Feature descriptions
- Warning messages

---

## 7. Workspace Settings

### 7.1 Workspace Configuration

**Location:** `packages/app/src/pages/layout/sidebar-workspace.tsx`

**Features:**

- Workspace-specific settings
- Multi-workspace support
- Workspace switching
- Workspace creation/deletion

### 7.2 Workspace Settings Structure

```typescript
interface WorkspaceSettings {
  workspaceId: string
  name: string
  path: string
  providers: ProviderConfig[]
  defaultModel?: string
  theme?: string
}
```

### 7.3 Project Settings

**Location:** `.kilocode/config.json`

**Features:**

- Project-level overrides
- Shared team settings
- .gitignore integration

---

## Cross-References

- **UI Features:** [`01_UI-features.md`](./01_UI-features.md)
- **Backend Features:** [`02_backend-features.md`](./02_backend-features.md)
- **Special Features:** [`06_special-features.md`](./06_special-features.md)

---

_Document generated by Agent-07 (Settings & Configuration)_
