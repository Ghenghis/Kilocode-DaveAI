# Phase 2 Implementation Plan - Kilo Code Restoration Project

**Document Version**: 1.0  
**Date**: 2026-03-30  
**Agent**: 6 of 20 - Phase 2 Synthesis  
**Status**: MASTER IMPLEMENTATION ROADMAP

---

## A. Executive Summary

### Overall System Health Assessment

Based on comprehensive audits across 5 domains (Speech System, UI Elements, CLI Infrastructure, Wiring Connections, and Prompt Enhancer), the Kilo Code system exhibits **PARTIAL IMPLEMENTATION with CRITICAL BREAKING BUGS**.

| Domain | Status | Critical Issues | High Issues | Medium Issues |
|--------|--------|-----------------|-------------|---------------|
| Speech System | ⚠️ BROKEN | 1 | 5 | 9 |
| UI Elements | ⚠️ DISCONNECTED | 2 | 3 | 5 |
| CLI Infrastructure | 🔴 MISSING | 0 | 0 | 1 (feature missing) |
| Wiring Connections | 🔴 CRITICAL GAPS | 3 | 2 | 7 |
| Prompt Enhancer | ⚠️ PARTIAL | 0 | 2 | 3 |
| **TOTAL** | | **6** | **12** | **25** |

### Number of Critical Issues Found

- **P0 (Critical)**: 6 issues that block production
- **P1 (High)**: 12 issues that break major features
- **P2 (Medium)**: 25 issues affecting quality

### Recommended Implementation Approach

1. **Phase 2.1 (Week 1-2)**: Fix critical wiring and broken speech controller
2. **Phase 2.2 (Week 2-4)**: Complete speech system integration
3. **Phase 2.3 (Week 4-6)**: CLI infrastructure for external tools
4. **Phase 2.4 (Week 6-8)**: UI restoration and reconnection
5. **Phase 2.5 (Week 8-10)**: Prompt enhancer completion

---

## B. Issue Prioritization Matrix

### P0 - Critical (Must Fix Immediately - Block Production)

| ID | Issue | Location | Complexity | Risk if Not Fixed |
|----|-------|----------|------------|-------------------|
| SPEECH-001 | `this.this.setStore` bug - entire EnhancedSpeechController non-functional | [`enhanced-speech-controller.ts:214`](packages/app/src/utils/enhanced-speech-controller.ts:214), [220](packages/app/src/utils/enhanced-speech-controller.ts:220), [224](packages/app/src/utils/enhanced-speech-controller.ts:224) | Low | Speech system completely broken |
| WIRING-001 | `continueInWorktreeProgress` message has no handler | [`KiloProvider.ts:582-589`](packages/kilo-vscode/src/KiloProvider.ts:582) → No webview handler | Medium | Worktree progress updates lost |
| WIRING-002 | `setChatBoxMessage`, `appendChatBoxMessage` not wired | [`KiloProvider.ts:2581`](packages/kilo-vscode/src/KiloProvider.ts:2581) → No webview handler | Medium | Chat box cannot be programmatically controlled |
| WIRING-003 | `triggerTask` not wired from extension.ts | [`extension.ts:196`](packages/kilo-vscode/src/extension.ts:196) → No webview handler | Medium | Terminal command generation trigger broken |
| UI-001 | `speechToggle` event dispatched but no backend handler | [`LeftPanel.tsx:48-50`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx:48) | Medium | Voice controls non-functional |
| UI-002 | `navigateToSettings` event has no handler | [`LeftPanel.tsx:62-67`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx:62) | Low | Quick settings access broken |

### P1 - High (Should Fix Soon - Major Feature Gaps)

| ID | Issue | Location | Complexity | Risk if Not Fixed |
|----|-------|----------|------------|-------------------|
| SPEECH-002 | STT backend missing in CLI | [`packages/opencode/src/`](packages/opencode/src/) - No speech routes | High | No speech-to-text in backend |
| SPEECH-003 | OpenAI-compatible STT endpoint not implemented | `POST /audio/transcriptions` not defined | High | Cannot use OpenAI-compatible STT |
| SPEECH-004 | SSML processing has XSS vulnerability | [`enhanced-speech-controller.ts:496-508`](packages/app/src/utils/enhanced-speech-controller.ts:496) | Medium | Security vulnerability |
| SPEECH-005 | Voice commands dispatch events but no listeners | [`enhanced-speech-controller.ts:453`](packages/app/src/utils/enhanced-speech-controller.ts:453) | Medium | Voice commands non-functional |
| SPEECH-006 | Empty catch blocks in speech.ts silently swallow errors | [`speech.ts:105,285,299,314`](packages/app/src/utils/speech.ts:105) | Low | Debugging impossible |
| WIRING-004 | `appendReviewComments` not wired | [`KiloProvider.ts:2668`](packages/kilo-vscode/src/KiloProvider.ts:2668) → No webview handler | Medium | Diff viewer comments cannot append |
| WIRING-005 | `configUpdated` not handled (only `configLoaded` exists) | [`KiloProvider.ts:1799,2051`](packages/kilo-vscode/src/KiloProvider.ts:1799) → `config.tsx` | Medium | Config changes require reload |
| UI-003 | SpeechControls component isolated from main UI | [`SpeechControls.tsx`](packages/kilo-vscode/webview-ui/src/components/SpeechControls.tsx:1) not rendered anywhere | Medium | Speech debugging panel inaccessible |
| UI-004 | StatusPanel component isolated from main UI | [`StatusPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/StatusPanel.tsx:1) not rendered anywhere | Medium | Status details inaccessible |
| UI-005 | OpenHands feature disabled | [`StatusMonitor.ts:39`](packages/kilo-vscode/webview-ui/src/services/StatusMonitor.ts:39) | Low | Feature tracking incomplete |
| PROMPT-001 | No enhancement settings UI | N/A - doesn't exist | High | Cannot configure prompt enhancement |
| PROMPT-002 | `small_model` config not exposed in UI | [`config.ts:1186`](packages/opencode/src/config/config.ts:1186) | Medium | Enhancement model selection hidden |

### P2 - Medium (Nice to Have - Quality Issues)

| ID | Issue | Location | Complexity | Risk if Not Fixed |
|----|-------|----------|------------|-------------------|
| SPEECH-007 | Provider health checks and fallback missing | Discovery service doesn't exist | High | No automatic provider failover |
| SPEECH-008 | Audio queue system missing | Only single utterance handling | Medium | Overlapping speech issues |
| SPEECH-009 | Device capabilities hardcoded | [`enhanced-speech-controller.ts:196-201`](packages/app/src/utils/enhanced-speech-controller.ts:196) | Low | Inaccurate device info |
| SPEECH-010 | Playwright E2E tests missing | Test docs exist but no tests | High | No automated speech testing |
| SPEECH-011 | ElevenLabs provider declared but not implemented | [`enhanced-speech-controller.ts:11`](packages/app/src/utils/enhanced-speech-controller.ts:11) | Medium | Provider unavailable |
| SPEECH-012 | Coqui provider declared but not implemented | [`enhanced-speech-controller.ts:11`](packages/app/src/utils/enhanced-speech-controller.ts:11) | Medium | Provider unavailable |
| SPEECH-013 | Audio quality settings not implemented | [`enhanced-speech-controller.ts:89`](packages/app/src/utils/enhanced-speech-controller.ts:89) | Low | Quality control unavailable |
| SPEECH-014 | `continuousRecognition` setting not used | [`enhanced-speech-controller.ts:296`](packages/app/src/utils/enhanced-speech-controller.ts:296) | Low | Setting has no effect |
| SPEECH-015 | Metrics calculation uses wrong formula | [`enhanced-speech-controller.ts:323`](packages/app/src/utils/enhanced-speech-controller.ts:323) | Low | Incorrect metrics |
| WIRING-006 | `speechSettingsLoaded` not wired | [`KiloProvider.ts:1916-1943`](packages/kilo-vscode/src/KiloProvider.ts:1916) | Medium | Speech settings don't update UI |
| WIRING-007 | `notificationSettingsLoaded` not wired | [`KiloProvider.ts:1883-1896`](packages/kilo-vscode/src/KiloProvider.ts:1883) | Medium | Notification settings stale |
| WIRING-008 | `browserSettingsLoaded` not wired | [`KiloProvider.ts:2507-2516`](packages/kilo-vscode/src/KiloProvider.ts:2507) | Medium | Browser settings stale |
| WIRING-009 | `autocompleteSettingsLoaded` not wired | [`KiloProvider.ts:2616-2625`](packages/kilo-vscode/src/KiloProvider.ts:2616) | Medium | Autocomplete settings stale |
| WIRING-010 | 55 ExtensionMessage types sent but not handled | [`messages.ts`](packages/kilo-vscode/webview-ui/src/types/messages.ts) | Medium | Message silently dropped |
| UI-006 | No mode switcher in toolbar | [`TaskHeader.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/TaskHeader.tsx:1) | Medium | Cannot visually switch modes |
| UI-007 | No quick provider selector | N/A | Medium | Must navigate to settings |
| UI-008 | No browser automation UI | Browser automation exists but no control | Medium | Cannot control browser automation |
| CLI-001 | No CLI toggle command for external tools | `cmd/toggle.ts` doesn't exist | High | Cannot integrate WindSurf/Claude Code/Ollama |
| PROMPT-003 | No multi-provider fallback for enhancement | Uses only default/small model | Medium | No resilience if provider fails |
| PROMPT-004 | No codebase context in enhancement | [`enhance-prompt.ts:22`](packages/opencode/src/kilocode/enhance-prompt.ts:22) | High | Enhancement lacks project context |

---

## C. Implementation Phases

### Phase 2.1: Critical Wiring Fixes (Weeks 1-2)

**Objective**: Fix P0 issues that block production and restore broken message wiring.

#### Sprint 1.1: Speech Controller Bug Fix
| Issue | File | Change | Time |
|-------|------|--------|------|
| SPEECH-001 | [`enhanced-speech-controller.ts`](packages/app/src/utils/enhanced-speech-controller.ts:214) | Fix `this.this.setStore` → `this.setStore` (3 locations) | 15 min |
| SPEECH-006 | [`speech.ts`](packages/app/src/utils/speech.ts:105) | Add error logging to empty catch blocks | 30 min |

#### Sprint 1.2: Message Wiring Critical Fixes
| Issue | File | Change | Time |
|-------|------|--------|------|
| WIRING-001 | Webview context | Add `continueInWorktreeProgress` handler | 1 hr |
| WIRING-002 | Webview context | Add `setChatBoxMessage`, `appendChatBoxMessage` handlers | 2 hr |
| WIRING-003 | Webview context | Add `triggerTask` handler in App.tsx | 1 hr |

#### Sprint 1.3: UI Event Wiring
| Issue | File | Change | Time |
|-------|------|--------|------|
| UI-001 | [`KiloProvider.ts`](packages/kilo-vscode/src/KiloProvider.ts) | Add `speechToggle` message handler | 1 hr |
| UI-002 | [`App.tsx`](packages/kilo-vscode/webview-ui/src/App.tsx) | Add `navigateToSettings` handler | 30 min |

**Dependencies**: None  
**Total Phase 2.1 Time**: ~8 hours

---

### Phase 2.2: Speech System Repair (Weeks 2-4)

**Objective**: Complete speech-to-text implementation and fix security issues.

#### Sprint 2.1: Security & Bug Fixes
| Issue | File | Change | Time |
|-------|------|--------|------|
| SPEECH-004 | [`enhanced-speech-controller.ts:496`](packages/app/src/utils/enhanced-speech-controller.ts:496) | Fix SSML XML escaping (XSS prevention) | 2 hr |
| SPEECH-005 | [`enhanced-speech-controller.ts:453`](packages/app/src/utils/enhanced-speech-controller.ts:453) | Wire voice commands to actual handlers | 3 hr |
| SPEECH-009 | [`enhanced-speech-controller.ts:196`](packages/app/src/utils/enhanced-speech-controller.ts:196) | Query actual device capabilities | 2 hr |

#### Sprint 2.2: STT Backend Implementation
| Issue | File | Change | Time |
|-------|------|--------|------|
| SPEECH-002 | [`packages/opencode/src/server/routes/`](packages/opencode/src/server/routes/) | Create speech routes for STT | 8 hr |
| SPEECH-003 | Same | Implement `POST /audio/transcriptions` | 4 hr |

#### Sprint 2.3: Missing Provider Implementation
| Issue | File | Change | Time |
|-------|------|--------|------|
| SPEECH-011 | [`KiloProvider.ts`](packages/kilo-vscode/src/KiloProvider.ts) | Implement ElevenLabs TTS | 6 hr |
| SPEECH-012 | Same | Implement Coqui TTS | 6 hr |
| SPEECH-008 | [`enhanced-speech-controller.ts`](packages/app/src/utils/enhanced-speech-controller.ts) | Implement audio queue system | 4 hr |

**Dependencies**: Phase 2.1 must be complete  
**Total Phase 2.2 Time**: ~35 hours

---

### Phase 2.3: CLI Infrastructure (Weeks 4-6)

**Objective**: Build infrastructure for external tool integration (CLI toggle).

#### Sprint 3.1: Core Toggle Infrastructure
| Issue | File | Description | Time |
|-------|------|------------|------|
| CLI-001 | Create [`cmd/toggle.ts`](packages/opencode/src/cli/cmd/toggle.ts) | CLI toggle command | 8 hr |
| CLI-001 | Create [`routes/toggle.ts`](packages/opencode/src/server/routes/toggle.ts) | Toggle API endpoints | 6 hr |
| CLI-001 | Create config schema | External tool registry | 4 hr |

#### Sprint 3.2: Process Management
| Issue | File | Description | Time |
|-------|------|------------|------|
| CLI-001 | Process management module | Tool spawning, health monitoring | 12 hr |
| CLI-001 | IPC mechanism | Tool communication protocol | 8 hr |

#### Sprint 3.3: SDK Updates
| Issue | File | Description | Time |
|-------|------|------------|------|
| CLI-001 | [`packages/sdk/js/src/`](packages/sdk/js/src/) | Tool management client methods | 4 hr |

**Dependencies**: None (new feature)  
**Total Phase 2.3 Time**: ~42 hours

---

### Phase 2.4: UI Restoration (Weeks 6-8)

**Objective**: Reconnect isolated UI components and add missing elements.

#### Sprint 4.1: Integrate Isolated Components
| Issue | File | Change | Time |
|-------|------|--------|------|
| UI-003 | [`App.tsx`](packages/kilo-vscode/webview-ui/src/App.tsx) | Integrate SpeechControls into Settings view | 4 hr |
| UI-004 | Same | Integrate StatusPanel into UI (maybe as expandable panel) | 4 hr |

#### Sprint 4.2: Settings Wiring
| Issue | File | Change | Time |
|-------|------|--------|------|
| WIRING-006 | Speech context | Add `speechSettingsLoaded` handler | 2 hr |
| WIRING-007 | Notifications context | Add `notificationSettingsLoaded` handler | 2 hr |
| WIRING-008 | Browser context | Add `browserSettingsLoaded` handler | 2 hr |
| WIRING-009 | Autocomplete context | Add `autocompleteSettingsLoaded` handler | 2 hr |
| WIRING-005 | [`config.tsx`](packages/kilo-vscode/webview-ui/src/context/config.tsx) | Add `configUpdated` handler | 2 hr |

#### Sprint 4.3: Missing UI Elements
| Issue | File | Change | Time |
|-------|------|--------|------|
| UI-006 | [`TaskHeader.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/TaskHeader.tsx) | Add mode switcher component | 6 hr |
| UI-007 | LeftPanel or header | Add quick provider selector | 4 hr |
| UI-008 | Settings or toolbar | Add browser automation controls | 8 hr |

**Dependencies**: Phase 2.1 should be complete  
**Total Phase 2.4 Time**: ~36 hours

---

### Phase 2.5: Prompt Enhancer Completion (Weeks 8-10)

**Objective**: Complete the epic prompt enhancement feature.

#### Sprint 5.1: Settings UI
| Issue | File | Change | Time |
|-------|------|--------|------|
| PROMPT-001 | Create settings panel | Enhancement settings UI | 8 hr |
| PROMPT-002 | [`config.ts`](packages/opencode/src/config/config.ts) | Expose small_model in UI | 4 hr |

#### Sprint 5.2: Multi-Provider Support
| Issue | File | Change | Time |
|-------|------|--------|------|
| PROMPT-003 | [`enhance-prompt.ts`](packages/opencode/src/kilocode/enhance-prompt.ts) | Add multi-provider fallback chain | 6 hr |
| PROMPT-003 | Settings UI | Add provider selection dropdown | 4 hr |

#### Sprint 5.3: Codebase Integration
| Issue | File | Change | Time |
|-------|------|--------|------|
| PROMPT-004 | [`enhance-prompt.ts`](packages/opencode/src/kilocode/enhance-prompt.ts) | Add file context injection | 8 hr |
| PROMPT-004 | Same | Add project language/framework detection | 6 hr |

**Dependencies**: None  
**Total Phase 2.5 Time**: ~36 hours

---

## D. Detailed Issue List

### SPEECH System Issues

| ID | Description | Location | Priority | Complexity | Risk | Dependencies | Est. Time |
|----|-------------|----------|----------|------------|------|-------------|-----------|
| SPEECH-001 | `this.this.setStore` bug makes EnhancedSpeechController non-functional | [`enhanced-speech-controller.ts:214,220,224`](packages/app/src/utils/enhanced-speech-controller.ts:214) | P0 | Low | System broken | None | 15 min |
| SPEECH-002 | STT backend missing in CLI - no speech recognition routes | [`packages/opencode/src/server/routes/`](packages/opencode/src/server/routes/) | P1 | High | No STT in backend | None | 8 hr |
| SPEECH-003 | OpenAI-compatible STT endpoint not implemented | `POST /audio/transcriptions` | P1 | High | Cannot use external STT | SPEECH-002 | 4 hr |
| SPEECH-004 | SSML processing has XSS vulnerability - no XML escaping | [`enhanced-speech-controller.ts:496-508`](packages/app/src/utils/enhanced-speech-controller.ts:496) | P1 | Medium | Security vulnerability | None | 2 hr |
| SPEECH-005 | Voice commands dispatch events but no listeners exist | [`enhanced-speech-controller.ts:453`](packages/app/src/utils/enhanced-speech-controller.ts:453) | P1 | Medium | Commands non-functional | None | 3 hr |
| SPEECH-006 | Empty catch blocks silently swallow errors | [`speech.ts:105,285,299,314`](packages/app/src/utils/speech.ts:105) | P1 | Low | Debugging impossible | None | 30 min |
| SPEECH-007 | Provider health checks and fallback missing | Discovery service doesn't exist | P2 | High | No failover | SPEECH-002 | 8 hr |
| SPEECH-008 | Audio queue system missing - only single utterance | [`enhanced-speech-controller.ts`](packages/app/src/utils/enhanced-speech-controller.ts) | P2 | Medium | Overlap issues | None | 4 hr |
| SPEECH-009 | Device capabilities hardcoded, not actually queried | [`enhanced-speech-controller.ts:196-201`](packages/app/src/utils/enhanced-speech-controller.ts:196) | P2 | Low | Inaccurate info | None | 2 hr |
| SPEECH-010 | Playwright E2E tests missing | Test docs exist but no tests | P2 | High | No automation | None | 12 hr |
| SPEECH-011 | ElevenLabs provider declared but not implemented | [`enhanced-speech-controller.ts:11`](packages/app/src/utils/enhanced-speech-controller.ts:11) | P2 | Medium | Provider unavailable | None | 6 hr |
| SPEECH-012 | Coqui provider declared but not implemented | [`enhanced-speech-controller.ts:11`](packages/app/src/utils/enhanced-speech-controller.ts:11) | P2 | Medium | Provider unavailable | None | 6 hr |
| SPEECH-013 | Audio quality settings not implemented | [`enhanced-speech-controller.ts:89`](packages/app/src/utils/enhanced-speech-controller.ts:89) | P2 | Low | No quality control | None | 2 hr |
| SPEECH-014 | `continuousRecognition` setting not used | [`enhanced-speech-controller.ts:296`](packages/app/src/utils/enhanced-speech-controller.ts:296) | P2 | Low | Setting useless | None | 1 hr |
| SPEECH-015 | Metrics calculation uses wrong formula | [`enhanced-speech-controller.ts:323`](packages/app/src/utils/enhanced-speech-controller.ts:323) | P2 | Low | Incorrect metrics | None | 1 hr |

### UI Element Issues

| ID | Description | Location | Priority | Complexity | Risk | Dependencies | Est. Time |
|----|-------------|----------|----------|------------|------|-------------|-----------|
| UI-001 | `speechToggle` event dispatched but no backend handler | [`LeftPanel.tsx:48-50`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx:48) | P0 | Medium | Voice controls broken | None | 1 hr |
| UI-002 | `navigateToSettings` event has no handler | [`LeftPanel.tsx:62-67`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx:62) | P0 | Low | Quick settings broken | None | 30 min |
| UI-003 | SpeechControls component exists but not integrated | [`SpeechControls.tsx`](packages/kilo-vscode/webview-ui/src/components/SpeechControls.tsx:1) | P1 | Medium | Panel inaccessible | UI-001 | 4 hr |
| UI-004 | StatusPanel component exists but not integrated | [`StatusPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/StatusPanel.tsx:1) | P1 | Medium | Status inaccessible | None | 4 hr |
| UI-005 | OpenHands feature disabled in StatusMonitor | [`StatusMonitor.ts:39`](packages/kilo-vscode/webview-ui/src/services/StatusMonitor.ts:39) | P1 | Low | Incomplete tracking | None | 1 hr |
| UI-006 | No mode switcher in toolbar | [`TaskHeader.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/TaskHeader.tsx:1) | P2 | Medium | Cannot switch modes visually | None | 6 hr |
| UI-007 | No quick provider selector | N/A | P2 | Medium | Must navigate to settings | None | 4 hr |
| UI-008 | Browser automation exists but no UI | StatusMonitor has browser automation | P2 | Medium | Cannot control | None | 8 hr |

### CLI Infrastructure Issues

| ID | Description | Location | Priority | Complexity | Risk | Dependencies | Est. Time |
|----|-------------|----------|----------|------------|------|-------------|-----------|
| CLI-001 | No CLI toggle command for external tools | `cmd/toggle.ts` doesn't exist | P2 | High | Cannot integrate external tools | None | 40 hr |

### Wiring Connection Issues

| ID | Description | Location | Priority | Complexity | Risk | Dependencies | Est. Time |
|----|-------------|----------|----------|------------|------|-------------|-----------|
| WIRING-001 | `continueInWorktreeProgress` no handler | [`KiloProvider.ts:582-589`](packages/kilo-vscode/src/KiloProvider.ts:582) | P0 | Medium | Progress lost | None | 1 hr |
| WIRING-002 | `setChatBoxMessage`, `appendChatBoxMessage` not wired | [`KiloProvider.ts:2581`](packages/kilo-vscode/src/KiloProvider.ts:2581) | P0 | Medium | Chatbox uncontrollable | None | 2 hr |
| WIRING-003 | `triggerTask` not wired | [`extension.ts:196`](packages/kilo-vscode/src/extension.ts:196) | P0 | Medium | Trigger broken | None | 1 hr |
| WIRING-004 | `appendReviewComments` not wired | [`KiloProvider.ts:2668`](packages/kilo-vscode/src/KiloProvider.ts:2668) | P1 | Medium | Comments can't append | None | 2 hr |
| WIRING-005 | `configUpdated` not handled | [`KiloProvider.ts:1799,2051`](packages/kilo-vscode/src/KiloProvider.ts:1799) | P1 | Medium | Requires reload | None | 2 hr |
| WIRING-006 | `speechSettingsLoaded` not wired | [`KiloProvider.ts:1916-1943`](packages/kilo-vscode/src/KiloProvider.ts:1916) | P2 | Medium | Settings don't update | UI-001 | 2 hr |
| WIRING-007 | `notificationSettingsLoaded` not wired | [`KiloProvider.ts:1883-1896`](packages/kilo-vscode/src/KiloProvider.ts:1883) | P2 | Medium | Stale settings | None | 2 hr |
| WIRING-008 | `browserSettingsLoaded` not wired | [`KiloProvider.ts:2507-2516`](packages/kilo-vscode/src/KiloProvider.ts:2507) | P2 | Medium | Stale settings | None | 2 hr |
| WIRING-009 | `autocompleteSettingsLoaded` not wired | [`KiloProvider.ts:2616-2625`](packages/kilo-vscode/src/KiloProvider.ts:2616) | P2 | Medium | Stale settings | None | 2 hr |
| WIRING-010 | 55 ExtensionMessage types sent but not handled | [`messages.ts`](packages/kilo-vscode/webview-ui/src/types/messages.ts) | P2 | Medium | Silent drops | None | 12 hr |

### Prompt Enhancer Issues

| ID | Description | Location | Priority | Complexity | Risk | Dependencies | Est. Time |
|----|-------------|----------|----------|------------|------|-------------|-----------|
| PROMPT-001 | No enhancement settings UI | N/A | P1 | High | Cannot configure | None | 8 hr |
| PROMPT-002 | `small_model` config not exposed in UI | [`config.ts:1186`](packages/opencode/src/config/config.ts:1186) | P1 | Medium | Enhancement model hidden | PROMPT-001 | 4 hr |
| PROMPT-003 | No multi-provider fallback for enhancement | [`enhance-prompt.ts`](packages/opencode/src/kilocode/enhance-prompt.ts) | P2 | Medium | No resilience | PROMPT-001 | 6 hr |
| PROMPT-004 | No codebase context in enhancement | [`enhance-prompt.ts:22`](packages/opencode/src/kilocode/enhance-prompt.ts:22) | P2 | High | Dumb enhancement | None | 14 hr |

---

## E. Resource Requirements

### Additional Audits Needed

| Audit | Purpose | Priority | Est. Time |
|-------|---------|----------|-----------|
| Agent Manager Audit | Full analysis of agent-manager wiring | High | 4 hr |
| Provider System Audit | Deep dive into provider selection/failover | High | 6 hr |
| Session Management Audit | Cross-reference session message handling | Medium | 4 hr |
| Telemetry Audit | Verify PostHog integration completeness | Medium | 3 hr |
| MCP Server Audit | Verify MCP server management wiring | Medium | 4 hr |

### Testing Requirements

| Test Type | Coverage Needed | Est. Time |
|-----------|-----------------|-----------|
| Unit Tests | Speech controller, enhance-prompt, wiring handlers | 20 hr |
| Integration Tests | Full message flow, provider integration | 24 hr |
| Playwright E2E | All P0/P1 flows, speech settings, chat | 32 hr |
| Visual Regression | SpeechControls, StatusPanel, mode switcher | 16 hr |

### Build Verification Requirements

After each phase:
1. Run `bun turbo typecheck` to verify no type errors
2. Run `bun test` from `packages/opencode/` for unit tests
3. Run lint to verify code style compliance
4. Verify extension builds with `bun run extension`

---

## F. Dependency Graph

```
Phase 2.1 (Critical Wiring)
├── SPEECH-001 (15 min) ──────────────┐
├── SPEECH-006 (30 min)               │
├── WIRING-001 (1 hr)                 ├──► Phase 2.2 Ready
├── WIRING-002 (2 hr)                 │
├── WIRING-003 (1 hr)                 │
├── UI-001 (1 hr)                     │
└── UI-002 (30 min)                   │
                                     │
Phase 2.2 (Speech System) ◄──────────┘
├── SPEECH-004 (2 hr)
├── SPEECH-005 (3 hr)
├── SPEECH-009 (2 hr)
├── SPEECH-002 (8 hr) ────────────────┐
├── SPEECH-003 (4 hr)                 │
├── SPEECH-011 (6 hr)                 ├──► Phase 2.4 Ready
├── SPEECH-012 (6 hr)                 │
├── SPEECH-008 (4 hr)                 │
├── SPEECH-007 (8 hr, after SPEECH-002)│
└── SPEECH-010 (12 hr)                │

Phase 2.3 (CLI Infrastructure) ────── No dependencies
└── CLI-001 (40 hr)

Phase 2.4 (UI Restoration) ◄────────── Phase 2.1
├── UI-003 (4 hr, after UI-001)
├── UI-004 (4 hr)
├── WIRING-005 (2 hr)
├── WIRING-006 (2 hr, after UI-001)
├── WIRING-007 (2 hr)
├── WIRING-008 (2 hr)
├── WIRING-009 (2 hr)
├── WIRING-010 (12 hr)
├── UI-006 (6 hr)
├── UI-007 (4 hr)
└── UI-008 (8 hr)

Phase 2.5 (Prompt Enhancer) ────────── No dependencies
├── PROMPT-001 (8 hr)
├── PROMPT-002 (4 hr, after PROMPT-001)
├── PROMPT-003 (6 hr, after PROMPT-001)
└── PROMPT-004 (14 hr)
```

---

## G. Estimated Timeline Summary

| Phase | Duration | Total Hours | Key Milestones |
|-------|----------|-------------|----------------|
| Phase 2.1 | Week 1-2 | 8 hr | All P0 issues resolved |
| Phase 2.2 | Week 2-4 | 35 hr | STT backend complete, security fixed |
| Phase 2.3 | Week 4-6 | 42 hr | CLI toggle infrastructure ready |
| Phase 2.4 | Week 6-8 | 36 hr | All UI components integrated |
| Phase 2.5 | Week 8-10 | 36 hr | Epic prompt enhancement complete |
| **Total** | **10 weeks** | **157 hr** | |

---

## H. Success Criteria

### Phase 2.1 Success
- [ ] `this.this.setStore` bug fixed in enhanced-speech-controller.ts
- [ ] All P0 message handlers wired
- [ ] `speechToggle` and `navigateToSettings` events functional
- [ ] No new typecheck errors introduced

### Phase 2.2 Success
- [ ] STT backend routes exist and handle `/audio/transcriptions`
- [ ] SSML processing is secure (no XSS)
- [ ] Voice commands have working event listeners
- [ ] Empty catch blocks log errors

### Phase 2.3 Success
- [ ] `kilo toggle` CLI command works
- [ ] External tool registry is configurable
- [ ] Tool spawning and health monitoring functional

### Phase 2.4 Success
- [ ] SpeechControls accessible from Settings
- [ ] StatusPanel accessible from UI
- [ ] All settings panels receive live updates
- [ ] Mode switcher visible in header

### Phase 2.5 Success
- [ ] Enhancement settings UI exists
- [ ] `small_model` configurable via UI
- [ ] Multi-provider fallback works
- [ ] Enhancement includes codebase context

---

*Document generated: 2026-03-30*  
*Agent 6 of 20 - Phase 2 Implementation Plan Synthesis*
