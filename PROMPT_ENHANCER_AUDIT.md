# Prompt Enhancer System Audit Report

**Agent 5 of 20 - Prompt Enhancer Audit**
**Date**: 2026-03-30
**Working Directory**: g:/KiloCode-DaveAI

---

## Executive Summary

The Prompt Enhancer system is **partially implemented** with a basic working implementation. The core enhancement logic exists in `packages/opencode/src/kilocode/enhance-prompt.ts` and uses the general provider system for model selection. However, there is **no dedicated settings UI**, **no multi-provider selection**, and **no codebase search integration** for epic prompt enhancement.

---

## 1. Current Prompt Enhancement Implementation Status

### 1.1 Core Implementation Files

| File | Purpose | Status |
|------|---------|--------|
| [`packages/opencode/src/kilocode/enhance-prompt.ts`](packages/opencode/src/kilocode/enhance-prompt.ts:1) | Core enhancement function | ✅ Implemented |
| [`packages/opencode/src/server/routes/enhance-prompt.ts`](packages/opencode/src/server/routes/enhance-prompt.ts:1) | Hono route at `/enhance-prompt` | ✅ Implemented |
| [`packages/kilo-vscode/src/KiloProvider.ts`](packages/kilo-vscode/src/KiloProvider.ts:841) | Extension message handler | ✅ Implemented |

### 1.2 Implementation Details

**Core Function** (`packages/opencode/src/kilocode/enhance-prompt.ts:22`):
```typescript
export async function enhancePrompt(text: string): Promise<string> {
  log.info("enhancing", { length: text.length })
  const defaultModel = await Provider.defaultModel()
  const model =
    (await Provider.getSmallModel(defaultModel.providerID)) ??
    (await Provider.getModel(defaultModel.providerID, defaultModel.modelID))
  // ... uses generateText with INSTRUCTION system prompt
}
```

**Key Characteristics**:
- Uses `generateText` from AI SDK directly
- No agent identity, system prompt, tools, or plugins
- Simple instruction: "Generate an enhanced version of this prompt..."
- Temperature: 0.7 if supported
- Max retries: 3
- Cleans output with `clean()` function (removes markdown code fences)

### 1.3 API Endpoint

**Route**: `POST /enhance-prompt`
- Registered in [`packages/opencode/src/server/server.ts:276`](packages/opencode/src/server/server.ts:276)
- Request body: `{ text: string }`
- Response: `{ text: string }`

### 1.4 Message Protocol

**Webview → Extension** ([`messages.ts:1930-1935`](packages/kilo-vscode/webview-ui/src/types/messages.ts:1930)):
```typescript
export interface EnhancePromptRequest {
  type: "enhancePrompt"
  text: string
  requestId: string
}
```

**Extension → Webview** ([`messages.ts:1156-1168`](packages/kilo-vscode/webview-ui/src/types/messages.ts:1156)):
```typescript
export interface EnhancePromptResultMessage {
  type: "enhancePromptResult"
  text: string
  requestId: string
}

export interface EnhancePromptErrorMessage {
  type: "enhancePromptError"
  error: string
  requestId: string
}
```

---

## 2. Provider Support Inventory

### 2.1 AI SDK Providers

**Supported Providers** ([`packages/kilo-gateway/src/api/constants.ts:75`](packages/kilo-gateway/src/api/constants.ts:75)):
```typescript
export const AI_SDK_PROVIDERS = ["anthropic", "openai", "openai-compatible", "openrouter"] as const
```

### 2.2 Provider Selection for Enhancement

The prompt enhancement uses the general provider system:
- Uses `Provider.defaultModel()` as base provider
- Falls back to `Provider.getSmallModel()` if configured
- Falls back to full model if no small model

**Model Configuration** ([`packages/opencode/src/config/config.ts:1186`](packages/opencode/src/config/config.ts:1186)):
```typescript
small_model: ModelId.nullable()
  .describe("Small model to use for tasks like title generation in the format of provider/model")
```

### 2.3 Local Provider Support

**LM Studio**: Referenced in `packages/opencode/src/provider/models-snapshot.ts` as `lmstudio-cloud`
**Ollama**: Referenced in `packages/opencode/src/provider/models-snapshot.ts` as `ollama-cloud`

**Local Provider Detection** ([`packages/opencode/src/provider/provider.ts:1192`](packages/opencode/src/provider/provider.ts:1192)):
```typescript
log.info("loading local provider", { pkg: model.api.npm })
installedPath = model.api.npm
```

### 2.4 Provider Support Summary

| Provider | Support Status | Notes |
|----------|---------------|-------|
| Kilo (built-in) | ✅ Full | Uses `Provider.defaultModel()` |
| OpenAI | ✅ Supported | Via AI SDK |
| Anthropic | ✅ Supported | Via AI SDK |
| OpenRouter | ✅ Supported | Via AI SDK |
| OpenAI-Compatible | ✅ Supported | Via `openai-compatible` provider |
| LM Studio | ⚠️ Partial | Model snapshot includes `lmstudio-cloud` |
| Ollama | ⚠️ Partial | Model snapshot includes `ollama-cloud` |

---

## 3. Codebase Search Integration Status

### 3.1 Current State

**Finding**: There is **NO** codebase search integration in the current prompt enhancement implementation.

The `enhancePrompt` function at [`packages/opencode/src/kilocode/enhance-prompt.ts:22`](packages/opencode/src/kilocode/enhance-prompt.ts:22) uses a simple `generateText` call with only:
- The user-provided text
- A static instruction prompt
- No context injection
- No codebase-aware enhancement

### 3.2 Missing Codebase Integration

**What's NOT implemented**:
- ❌ File context injection
- ❌ Git history awareness
- ❌ Project structure understanding
- ❌ Related code search
- ❌ Import/export chain analysis

---

## 4. What's MISSING for Epic Prompt Enhancement

### 4.1 Settings & Configuration

| Missing Feature | Location | Severity |
|----------------|----------|----------|
| Dedicated prompt enhancement settings UI | N/A | HIGH |
| Enhancement model selector | N/A | HIGH |
| Enhancement provider selection | N/A | HIGH |
| Enhancement behavior toggles | N/A | MEDIUM |

**Config file reference** ([`packages/opencode/src/config/config.ts:1186`](packages/opencode/src/config/config.ts:1186)):
```typescript
small_model: ModelId.nullable()
  .describe("Small model to use for tasks like title generation...")
```
This setting affects prompt enhancement but is not exposed in any UI.

### 4.2 Multi-Provider Enhancement

**Current**: Prompt enhancement uses whatever model is configured as `small_model` or defaults.

**Missing for Epic**:
- ❌ Per-provider enhancement model selection
- ❌ Enhancement-specific API key configuration
- ❌ Fallback chain for enhancement (e.g., try OpenAI → try Anthropic → try local)
- ❌ Cost-aware enhancement model selection

### 4.3 Codebase-Aware Enhancement

**Missing**:
- ❌ Context window with current file content
- ❌ Project language/framework detection
- ❌ Relevant file recommendations
- ❌ Import resolution awareness
- ❌ Type information injection

### 4.4 UI/UX

**Current i18n strings** ([`packages/kilo-vscode/webview-ui/src/i18n/en.ts:245-248`](packages/kilo-vscode/webview-ui/src/i18n/en.ts:245)):
```typescript
"prompt.action.enhance": "Enhance Prompt",
"prompt.action.resetModel": "Reset Model to Default",
"prompt.action.enhanceDescription":
  "'Enhance Prompt' button helps improve your prompt by providing additional context, clarification, or rephrasing..."
```

**Missing UI elements**:
- ❌ Enhancement settings panel
- ❌ Enhancement model badge display
- ❌ Enhancement status indicator
- ❌ Enhancement history/undo

---

## 5. Specific File Paths and Line Numbers

### 5.1 Core Implementation
| File | Lines | Description |
|------|-------|-------------|
| `packages/opencode/src/kilocode/enhance-prompt.ts` | 1-46 | Main enhancement logic |
| `packages/opencode/src/server/routes/enhance-prompt.ts` | 1-40 | API route definition |
| `packages/opencode/src/server/server.ts` | 276 | Route registration |
| `packages/kilo-vscode/src/KiloProvider.ts` | 841-862 | Extension message handler |

### 5.2 Type Definitions
| File | Lines | Description |
|------|-------|-------------|
| `packages/kilo-vscode/webview-ui/src/types/messages.ts` | 1156-1168 | Result/Error types |
| `packages/kilo-vscode/webview-ui/src/types/messages.ts` | 1930-1935 | Request type |

### 5.3 Provider System
| File | Lines | Description |
|------|-------|-------------|
| `packages/kilo-gateway/src/api/constants.ts` | 75 | AI SDK providers list |
| `packages/opencode/src/provider/provider.ts` | 1277-1281 | getSmallModel function |
| `packages/opencode/src/provider/provider.ts` | 1357-1360 | defaultModel function |
| `packages/opencode/src/config/config.ts` | 1186 | small_model config |

### 5.4 UI/Internationalization
| File | Lines | Description |
|------|-------|-------------|
| `packages/kilo-vscode/webview-ui/src/i18n/en.ts` | 245-248 | Enhance prompt labels |
| `packages/app/src/context/prompt.tsx` | 1-287 | Prompt context (not enhancement-specific) |
| `packages/app/src/utils/prompt.ts` | 1-203 | Prompt utilities |

---

## 6. Recommendations for Implementation

### 6.1 High Priority

1. **Add Enhancement Settings UI**
   - Create settings panel at `settings/prompt-enhancement`
   - Add enhancement model selector dropdown
   - Add enhancement provider selector
   - Persist settings to config

2. **Expose small_model in Settings**
   - Currently only configurable via `kilo.json`
   - Need UI to select model for enhancement
   - Need to show current enhancement model in prompt UI

### 6.2 Medium Priority

3. **Add Codebase Context to Enhancement**
   - Pass current file path/language to enhancement
   - Inject relevant project context
   - Add option to include git diff context

4. **Enhancement Status Display**
   - Show "Enhancing..." state
   - Show which model is being used
   - Add error recovery UI

### 6.3 Lower Priority

5. **Multi-Provider Fallback Chain**
   - Define fallback order: local → cloud
   - Add cost-aware selection
   - Add manual override option

6. **Enhancement History**
   - Store original vs enhanced prompts
   - Allow undo/redo of enhancement
   - Track enhancement usage analytics

---

## 7. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Webview UI                             │
│  ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │ Prompt Input     │───▶│ EnhancePromptRequest         │  │
│  │ [Enhance Button]│    │ { text, requestId }         │  │
│  └─────────────────┘    └──────────────┬────────────────┘  │
└───────────────────────────────────────┼─────────────────────┘
                                        │ VS Code Messaging
┌───────────────────────────────────────┼─────────────────────┐
│                   Extension (KiloProvider.ts)                │
│  ┌──────────────────────────────────▼────────────────────┐ │
│  │ case "enhancePrompt":                                   │ │
│  │   sdkClient.enhancePrompt.enhance({ text })           │ │
│  └──────────────────────────────────┬────────────────────┘ │
└──────────────────────────────────────┼──────────────────────┘
                                       │
┌──────────────────────────────────────┼──────────────────────┐
│                      CLI Server                              │
│  ┌──────────────────────────────────▼────────────────────┐ │
│  │ POST /enhance-prompt                                    │ │
│  │   └─▶ enhancePrompt(text)                              │ │
│  │         └─▶ Provider.getSmallModel()                  │ │
│  │               └─▶ generateText(model, ...)            │ │
│  └──────────────────────────────────┬────────────────────┘ │
└──────────────────────────────────────┼──────────────────────┘
                                       │
┌──────────────────────────────────────┼──────────────────────┐
│                   AI SDK / Provider                          │
│  ┌──────────────────────────────────▼────────────────────┐   │
│  │ anthropic | openai | openai-compatible | openrouter │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Testability

**Existing test infrastructure**:
- E2E tests at `packages/app/e2e/prompt/prompt.spec.ts`
- Prompt selector: `[data-component="prompt-input"]`

**No dedicated enhancement tests found** - Would need to add:
- Test for enhance button click
- Test for enhancement API call
- Test for error handling
- Test for enhancement result display

---

## 9. Conclusion

The Prompt Enhancer system is a **functional but basic implementation**. It provides the core capability to enhance prompts using AI but lacks:

1. **No dedicated settings** - Cannot configure enhancement behavior
2. **No provider selection** - Uses default/small model with no UI control
3. **No codebase integration** - Does not leverage project context
4. **No advanced features** - No multi-provider fallback, cost tracking, etc.

The foundation is solid (KiloProvider handling, SDK integration, route registration), but the **epic prompt enhancement feature is approximately 40% implemented** when considering all the missing components for a full epic experience.

---

## Appendix: Key Search Results

**Files containing "enhancePrompt"**:
- `packages/opencode/src/kilocode/enhance-prompt.ts` (core)
- `packages/opencode/src/server/routes/enhance-prompt.ts` (route)
- `packages/kilo-vscode/src/KiloProvider.ts` (handler)
- `packages/kilo-vscode/webview-ui/src/types/messages.ts` (types)
- `packages/sdk/js/src/v2/gen/sdk.gen.ts` (SDK)

**Files containing "small_model"**:
- `packages/opencode/src/config/config.ts:1186`
- `packages/opencode/src/provider/provider.ts:1280-1281`
