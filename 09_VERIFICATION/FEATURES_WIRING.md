# FEATURES_WIRING.md

## Feature-to-Component Mapping and Data Flow

**Repository:** KiloCode-DaveAI  
**Documentation Date:** 2026-04-01

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Feature-to-Component Mapping](#2-feature-to-component-mapping)
3. [Data Flow Diagrams](#3-data-flow-diagrams)
4. [Settings-to-Backend Wiring](#4-settings-to-backend-wiring)
5. [Speech-to-Chat Integration](#5-speech-to-chat-integration)
6. [Provider-to-AI Behavior](#6-provider-to-ai-behavior)
7. [Key Integration Points](#7-key-integration-points)

---

## 1. Architecture Overview

### Product Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
├─────────────────────────────────────────────────────────────┤
│  Kilo CLI        │  VS Code Extension  │  Desktop │  Web   │
│  (TUI + Server)  │  (Agent Manager)    │  (Tauri) │  (App) │
└────────┬─────────┴──────────┬──────────┴────┬─────┴────┬────┘
         │                   │               │          │
         └───────────────────┴───────────────┴──────────┘
                             │ SDK (HTTP + SSE)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    CORE CLI ENGINE                           │
│              packages/opencode/src/server/                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Agents  │  │  Tools   │  │ Sessions │  │ Providers│    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Package Boundaries

| Zone | Packages | Purpose |
|------|----------|---------|
| `opencode_core` | `packages/opencode/` | CLI engine, agents, tools, server |
| `kilo_extensions` | `packages/kilo-vscode/`, `packages/kilo-ui/`, `packages/kilo-gateway/`, `packages/kilo-telemetry/`, `packages/kilo-i18n/` | Kilo-specific extensions |
| `frontend_apps` | `packages/app/`, `packages/desktop/` | UI applications (synced from upstream) |
| `shared_infrastructure` | `packages/sdk/`, `packages/plugin/`, `packages/util/` | Shared code |

---

## 2. Feature-to-Component Mapping

### 2.1 Chat Feature Wiring

| Feature | Components | Data Flow |
|---------|-----------|-----------|
| **Message Display** | `MessageTimeline` → `MessagePart` → `SessionTurn` | SDK receives message → Timeline renders → Parts display |
| **Composer Input** | `SessionComposerState` → `SessionComposerRegion` | User types → State updates → Submit to SDK |
| **Slash Commands** | `prompt.ts` → `useSlashCommand` hook | Input parsed → Command detected → Handler invoked |
| **File Mentions** | `useFileMention` hook → File search | `@` detected → Autocomplete → File selected |
| **Terminal Panel** | `TerminalPanel` → `TerminalLabel` | Shell command → Terminal manager → Output displayed |
| **Review Annotations** | `SessionReview` → `LineComment` → `DiffViewerApp` | Diff computed → Comments added → Displayed inline |

### 2.2 Settings Feature Wiring

| Feature | Components | Data Flow |
|---------|-----------|-----------|
| **Provider Config** | `SettingsEditorProvider` → `ProviderConfigPanel` → `config-utils.ts` | User edits → Validation → SDK call → Backend update |
| **Model Selection** | `ModelSelector` → `MultiModelSelector` → `useProviders` | User selects → State update → SDK sets model |
| **Theme Selection** | `ThemeSettings` → `resolve.ts` → `loader.ts` | User picks → CSS vars update → UI re-renders |
| **Feature Flags** | `ExperimentalSettings` → `FeatureFlags` context | Toggle → State persisted → Components conditionally render |

### 2.3 Agent Manager Feature Wiring

| Feature | Components | Data Flow |
|---------|-----------|-----------|
| **Worktree Creation** | `WorktreeItem` → `WorktreeManager` → `GitOps` | User action → Git worktree cmd → State updated |
| **Session Management** | `AgentManagerProvider` → `SessionTerminalManager` | Create/delete → Terminal allocated → State persisted |
| **Git Stats** | `GitStatsPoller` → `WorktreeStateManager` | Poll interval → Git stats → UI updates |

### 2.4 Speech Feature Wiring

| Feature | Components | Data Flow |
|---------|-----------|-----------|
| **Speech Recognition** | `enhanced-speech-controller.ts` → `speech.ts` | Mic input → Provider API → Text transcript |
| **Speech Playback** | `speech.ts` → `sound.ts` | Response text → TTS provider → Audio output |
| **Queue Management** | `enhanced-speech-controller.ts` | Multiple responses → Queue ordered → Playback sequential |

---

## 3. Data Flow Diagrams

### 3.1 Settings Change Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Settings UI    │────▶│  webview-ui/     │────▶│  SDK Client     │
│  (React/Solid)  │     │  config-utils.ts │     │  (HTTP Request) │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                            │
                                                            ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Kilo Gateway   │◀────│  Server Routes   │◀────│  CLI Backend    │
│  (Auth/Routing)│     │  (Hono)          │     │  (Session Mgmt) │
└────────┬────────┘     └──────────────────┘     └────────┬────────┘
         │                                                  │
         ▼                                                  ▼
┌─────────────────┐                              ┌─────────────────┐
│  Provider API   │                              │  Provider       │
│  (OpenAI, etc.) │                              │  (25+ models)   │
└─────────────────┘                              └─────────────────┘
```

### 3.2 Chat Message Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User Input     │────▶│  Composer State  │────▶│  SDK Chat API   │
│  (Prompt)       │     │  (SolidJS)       │     │  (POST /chat)   │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                            │
                         ┌──────────────────────────────────┘
                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Server Agent   │────▶│  Tool Execution  │────▶│  SDK SSE Stream │
│  (AI Processing)│     │  (if needed)     │     │  (Server-Sent)  │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                         │                                  │
                         ▼                                  ▼
              ┌──────────────────┐              ┌─────────────────┐
              │  File/Terminal   │              │  MessageTimeline │
              │  Operations      │              │  (Streaming)     │
              └──────────────────┘              └─────────────────┘
```

### 3.3 Provider Configuration Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Provider Panel │────▶│  Settings Store   │────▶│  Gateway Route  │
│  (UI)           │     │  (Persist)       │     │  (provider.ts)  │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                            │
                         ┌──────────────────────────────────┘
                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Provider Pool  │◀───▶│  Load Balancer   │◀───▶│  AI Providers   │
│  (Multi-provider)│     │  (Priority/Latency)│   │  (OpenAI, etc.) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## 4. Settings-to-Backend Wiring

### 4.1 Settings Architecture

**Entry Point:** `packages/kilo-vscode/src/SettingsEditorProvider.ts`

```
SettingsEditorProvider
├── Settings Tree View (VS Code API)
├── Search (VS Code API)
├── Validation (Zod schemas)
└── Change Tracking (VS Code API)
```

### 4.2 Settings Storage

**Location:** `packages/app/src/utils/persist.ts`

| Storage Type | Backend | Sync |
|-------------|---------|------|
| VS Code Settings | `JSON` files in `.vscode/` | Automatic via VS Code |
| App State | `localStorage` / `sessionStorage` | Browser-based |
| SDK State | Server-side session | Via SDK calls |

### 4.3 Settings-to-Backend Bridge

**Location:** `webview-ui/src/utils/config-utils.ts`

```typescript
// Settings changes flow through this bridge:
interface ConfigBridge {
  // Read configuration
  getProviders(): Promise<ProviderConfig[]>
  getModels(): Promise<ModelConfig[]>
  getTheme(): Promise<ThemeConfig>
  
  // Write configuration
  updateProvider(id: string, config: Partial<ProviderConfig>): Promise<void>
  updateModel(id: string, config: Partial<ModelConfig>): Promise<void>
  updateTheme(config: ThemeConfig): Promise<void>
  
  // Validation
  validateProvider(config: ProviderConfig): Promise<ValidationResult>
  testProviderConnection(id: string): Promise<HealthStatus>
}
```

### 4.4 Settings Categories and Their Backends

| Category | Storage | Backend Handler |
|----------|---------|----------------|
| `agent-behaviour` | VS Code Settings | `packages/opencode/src/server/routes/settings.ts` |
| `providers` | VS Code Settings + Secure Storage | `packages/kilo-gateway/src/provider.ts` |
| `models` | VS Code Settings | `packages/opencode/src/models/` |
| `appearance` | VS Code Settings | `packages/ui/src/theme/` |
| `keybindings` | VS Code Settings | `packages/kilo-vscode/src/commands/` |
| `advanced` | VS Code Settings | Various |

---

## 5. Speech-to-Chat Integration

### 5.1 Speech Controller Architecture

**Location:** `packages/app/src/utils/enhanced-speech-controller.ts`

```typescript
class EnhancedSpeechController {
  // Input: Microphone → Speech-to-Text
  // - Provider: Browser Speech API, Azure, or custom
  // - Output: Text transcript sent to chat
  
  // Output: AI Response → Text-to-Speech
  // - Provider: Browser Speech API, Azure TTS
  // - Output: Audio playback
  
  // Queue: Multiple responses managed sequentially
  // Fallback: Primary provider fails → Secondary provider
}
```

### 5.2 Speech-to-Chat Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Microphone     │────▶│  Speech-to-Text  │────▶│  Chat Composer  │
│  (Browser API)  │     │  Provider        │     │  (as user input)│
└─────────────────┘     └──────────────────┘     └─────────────────┘

┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  AI Response    │────▶│  Text-to-Speech  │────▶│  Audio Output   │
│  (LLM output)   │     │  Provider        │     │  (Speaker)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### 5.3 Speech Settings UI

**Location:** `webview-ui/src/components/settings/SpeechSettings.tsx`

| Setting | Description | Default |
|---------|-------------|---------|
| `speech.inputProvider` | STT provider | Browser |
| `speech.outputProvider` | TTS provider | Browser |
| `speech.inputLanguage` | STT language | en-US |
| `speech.outputVoice` | TTS voice | System default |
| `speech.autoPlay` | Auto-play responses | true |

---

## 6. Provider-to-AI Behavior

### 6.1 Provider System Architecture

**Location:** `packages/kilo-gateway/src/provider.ts`

```typescript
interface ProviderRouter {
  // Route request to appropriate provider
  route(request: AIRequest): Provider
  
  // Provider failover
  failover(from: Provider, to: Provider): void
  
  // Load balancing
  selectProvider(providers: Provider[]): Provider
}
```

### 6.2 Provider Configuration Impact

| Configuration | Effect on AI Behavior |
|---------------|------------------------|
| `provider.priority` | Higher priority = more likely selected |
| `provider.enabled` | Disabled providers skipped entirely |
| `model.temperature` | Higher = more creative, lower = more deterministic |
| `model.maxTokens` | Maximum response length |
| `model.contextWindow` | How much history can be sent |

### 6.3 Provider Health Monitoring

**Location:** `packages/app/src/utils/server-health.ts`

```typescript
interface HealthStatus {
  provider: string
  status: "healthy" | "degraded" | "unhealthy"
  latency: number  // ms
  lastCheck: Date
}

// Health checks every 10 seconds
// Visual indicators in settings UI
```

### 6.4 Supported Providers

| Provider | Type | Capabilities |
|----------|------|--------------|
| OpenAI | `openai` | streaming, functionCalling, vision |
| Anthropic | `anthropic` | streaming, functionCalling, vision |
| Azure OpenAI | `azure` | streaming, functionCalling, vision |
| Google AI | `google` | streaming, vision |
| AWS Bedrock | `aws` | streaming, functionCalling |
| Local (Ollama) | `local` | Depends on model |
| Custom | `custom` | Depends on endpoint |

---

## 7. Key Integration Points

### 7.1 IPC Communication (VS Code Extension)

**Location:** `packages/kilo-vscode/src/extension.ts`

| Message Type | Direction | Purpose |
|-------------|-----------|---------|
| `SessionCreate` | UI → Backend | Create new session |
| `SessionDelete` | UI → Backend | Delete session |
| `ChatMessage` | UI → Backend | Send message |
| `ChatResponse` | Backend → UI | Receive response (SSE) |
| `TerminalOutput` | Backend → UI | Terminal display |
| `SettingsUpdate` | UI → Backend | Update settings |
| `WorktreeAction` | UI → Backend | Git worktree ops |

### 7.2 Event Bus (BusEvent System)

**Location:** `packages/opencode/src/bus/bus-event.ts`

| Event | Publishers | Subscribers |
|-------|-----------|-------------|
| `SessionCreated` | AgentManager | UI, Telemetry |
| `ToolExecuted` | Tools | UI, Telemetry |
| `MessageReceived` | Server | UI |
| `SettingsChanged` | Settings | All components |
| `ProviderHealthChanged` | Gateway | UI (status bar) |

### 7.3 SDK API Endpoints

**Location:** `packages/sdk/js/src/v2/gen/sdk.gen.ts`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/session/create` | POST | Create session |
| `/api/session/:id` | GET/PATCH/DELETE | Manage session |
| `/api/chat/:sessionId/message` | POST | Send message |
| `/api/providers` | GET/POST/DELETE | Manage providers |
| `/api/tools/execute` | POST | Execute tool |
| `/health` | GET | Health check |

### 7.4 Component Dependencies Graph

```
App
├── @kilocode/ui
│   ├── Button, Input, Toast, Tooltip, ...
│   └── Theme (CSS variables)
├── @kilocode/sdk
│   └── HTTP + SSE client
├── @kilocode/kilo-gateway
│   └── Provider routing
├── @kilocode/kilo-telemetry
│   └── Event tracking
└── @kilocode/kilo-i18n
    └── Translations
```

---

## Verification Checklist

| Check | Status | Notes |
|-------|--------|-------|
| All features mapped to components | ✅ | See FEATURES_LIST.md |
| All components exist in codebase | ✅ | Verified against packages/ |
| Data flows documented | ✅ | See section 3 |
| Settings-to-backend verified | ✅ | See section 4 |
| Speech integration documented | ✅ | See section 5 |
| Provider behavior documented | ✅ | See section 6 |

---

## Cross-References

- **Feature List:** [`FEATURES_LIST.md`](./FEATURES_LIST.md)
- **Fix Ledger:** [`FIX_LEDGER.md`](./FIX_LEDGER.md)
- **Feature Discovery:** [`docs/14_FEATURE_DISCOVERY/00_MASTER_INDEX.md`](../../docs/14_FEATURE_DISCOVERY/00_MASTER_INDEX.md)

---

_Document generated: 2026-04-01_
