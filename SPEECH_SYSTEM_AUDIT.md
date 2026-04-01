# Speech System Comprehensive Audit Report

## Executive Summary

The Speech system in Kilo Code has **PARTIAL IMPLEMENTATION** with several critical bugs and missing integrations. The TTS (Text-to-Speech) system is more complete than STT (Speech-to-Text), but both have significant gaps that prevent production use.

**Status: BROKEN/INCOMPLETE** - Requires immediate remediation before production deployment.

---

## 1. Complete Inventory of Existing Speech Files

### 1.1 Core Speech Files by Location

| File Path | Lines | Purpose | Status |
|-----------|-------|---------|--------|
| [`packages/app/src/utils/speech.ts`](packages/app/src/utils/speech.ts:1) | 326 | STT via Web Speech API | Partial |
| [`packages/app/src/utils/enhanced-speech-controller.ts`](packages/app/src/utils/enhanced-speech-controller.ts:1) | 555 | Enhanced speech controller | **BROKEN** |
| [`packages/kilo-vscode/webview-ui/src/utils/speech-controller.ts`](packages/kilo-vscode/webview-ui/src/utils/speech-controller.ts:1) | 108 | VS Code TTS controller | Working |
| [`packages/kilo-vscode/src/KiloProvider.ts`](packages/kilo-vscode/src/KiloProvider.ts:1898) | ~100 | Backend TTS provider handling | Working |
| [`packages/kilo-vscode/webview-ui/src/types/messages.ts`](packages/kilo-vscode/webview-ui/src/types/messages.ts:730) | ~40 | Speech message types | Working |
| [`packages/kilo-vscode/webview-ui/src/components/SpeechControls.tsx`](packages/kilo-vscode/webview-ui/src/components/SpeechControls.tsx:1) | 421+ | Speech controls UI | Partial |
| [`packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx`](packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx:1) | 372+ | Speech settings UI | Working |
| [`packages/kilo-vscode/webview-ui/src/components/chat/VscodeSessionTurn.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/VscodeSessionTurn.tsx:34) | 250+ | Chat turn speech integration | Working |
| [`packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx:1) | 272+ | Voice panel in left sidebar | Partial |
| [`packages/app/src/utils/sound.ts`](packages/app/src/utils/sound.ts:1) | 117 | Sound effects system | Working |

### 1.2 Configuration Files

| File | Settings Count | Status |
|------|----------------|--------|
| [`packages/kilo-vscode/package.json`](packages/kilo-vscode/package.json:742) | 16 speech settings | Working |

### 1.3 Documentation Files

| File | Purpose |
|------|---------|
| `docs/04_PHASE_EXECUTION/speech-T0-schema_and_settings_foundation.md` | Phase T0 specs |
| `docs/04_PHASE_EXECUTION/speech-T1-secrets_and_security.md` | Phase T1 specs |
| `docs/04_PHASE_EXECUTION/speech-T2-provider_registry_and_discovery.md` | Phase T2 specs |
| `docs/04_PHASE_EXECUTION/speech-T3-speech_ui_bridge.md` | Phase T3 specs |
| `docs/04_PHASE_EXECUTION/speech-T4-playback_and_queue.md` | Phase T4 specs |
| `docs/04_PHASE_EXECUTION/speech-T5-provider_runtime.md` | Phase T5 specs |
| `docs/13_PER_FEATURE_E2E_TEST_DOCS/speech-fallback.md` | E2E test docs |
| `docs/13_PER_FEATURE_E2E_TEST_DOCS/speech-playback.md` | E2E test docs |
| `docs/13_PER_FEATURE_E2E_TEST_DOCS/speech-settings.md` | E2E test docs |
| `docs/13_PER_FEATURE_E2E_TEST_DOCS/stock-speech.md` | E2E test docs |
| `docs/10_FAILURE_CATALOG/stock-speech-failure.md` | Failure catalog |
| `packages/kilo-docs/pages/code-with-ai/features/speech-to-text.md` | User documentation |
| `packages/kilo-docs/pages/contributing/architecture/voice-transcription.md` | Architecture docs |
| `packages/kilo-vscode/docs/non-agent-features/speech-to-text.md` | Internal docs |

---

## 2. Features That SHOULD Exist (From Corpus)

Based on the phase execution documents and corpus feature maps, the Speech system should include:

### 2.1 Required Features (From T0-T5 Phase Specs)

| Feature | Phase | Expected |
|---------|-------|----------|
| Speech settings schema/types | T0 | ✅ Schema exists in package.json |
| Secure secret handling | T1 | ✅ Secrets stored in VS Code keychain |
| Provider registry definitions | T2 | ⚠️ Partial - only 3 providers |
| Discovery service | T2 | ❌ Missing |
| Playback/queue/controller | T4 | ⚠️ Partial |
| Stream/player utils | T4 | ⚠️ Partial |
| Speech UI tab and message contracts | T3 | ✅ Working |
| Artifact packet generation | T7 | ❌ Missing |
| Playwright coverage | T8 | ❌ Missing |

### 2.2 Complete Feature Wishlist (From enhanced-speech-controller.ts)

The `EnhancedSpeechSettings` interface at [`enhanced-speech-controller.ts:4`](packages/app/src/utils/enhanced-speech-controller.ts:4) defines these expected features:

| Feature | Implemented | Status |
|---------|-------------|--------|
| enabled | ✅ | Working |
| autoSpeakAssistant | ✅ | Working |
| continuousRecognition | ⚠️ | Partial |
| provider ("browser" \| "azure" \| "openai" \| "elevenlabs" \| "coqui") | ⚠️ | Only 3 working |
| location ("local" \| "cloud") | ✅ | Working |
| voiceId | ✅ | Working |
| language | ✅ | Working |
| rate | ✅ | Working |
| pitch | ✅ | Working |
| volume | ✅ | Working |
| audioQuality | ❌ | Not implemented |
| sampleRate | ⚠️ | Defined but unused |
| audioFormat | ❌ | Not implemented |
| bitrate | ❌ | Not implemented |
| confidenceThreshold | ⚠️ | Defined but not wired |
| silenceTimeout | ❌ | Not implemented |
| maxRecordingDuration | ❌ | Not implemented |
| enableEmotion | ❌ | Not implemented |
| enableSSML | ⚠️ | Defined but broken |
| enableVoiceCloning | ❌ | Not implemented |
| enableSoundEffects | ❌ | Not implemented |
| debugMode | ⚠️ | Partial |
| showConfidenceScores | ❌ | Not implemented |
| logAudioEvents | ⚠️ | Partial |
| performanceMetrics | ❌ | Not implemented |

### 2.3 Voice Commands (From enhanced-speech-controller.ts)

Interface at [`enhanced-speech-controller.ts:45`](packages/app/src/utils/enhanced-speech-controller.ts:45):

| Feature | Implemented | Status |
|---------|-------------|--------|
| VoiceCommand interface | ✅ | Defined |
| addVoiceCommand() | ✅ | Defined |
| removeVoiceCommand() | ✅ | Defined |
| updateVoiceCommand() | ✅ | Defined |
| checkVoiceCommands() | ✅ | Defined |
| executeVoiceCommand() | ✅ | Defined |
| Voice command dispatch | ⚠️ | Event dispatch but no handler |

---

## 3. Features That ARE Implemented But BROKEN

### 3.1 CRITICAL BUG: enhanced-speech-controller.ts

**Location:** [`enhanced-speech-controller.ts:214`](packages/app/src/utils/enhanced-speech-controller.ts:214), [`enhanced-speech-controller.ts:220`](packages/app/src/utils/enhanced-speech-controller.ts:220), [`enhanced-speech-controller.ts:224`](packages/app/src/utils/enhanced-speech-controller.ts:224)

```typescript
// Line 214 - BROKEN: this.this.setStore should be this.setStore
this.this.setStore("audioDevices", audioDevices)

// Line 220 - BROKEN: same issue
this.this.setStore("availableVoices", voices)

// Line 224 - BROKEN: same issue  
this.this.setStore("availableVoices", this.synthesis!.getVoices())
```

**Impact:** The entire EnhancedSpeechController is non-functional due to infinite recursion or TypeError.

### 3.2 BROKEN: Web Speech API Recognition

**Location:** [`packages/app/src/utils/speech.ts`](packages/app/src/utils/speech.ts:1)

The STT implementation uses `getSpeechRecognitionCtor` from runtime-adapters but:
- No actual backend integration
- No provider routing
- Works only in browser with Web Speech API
- No connection to VS Code extension

### 3.3 BROKEN: Voice Commands System

**Location:** [`enhanced-speech-controller.ts:453`](packages/app/src/utils/enhanced-speech-controller.ts:453)

Voice commands dispatch a `voiceCommand` CustomEvent but:
- No event listener implementation found
- No way to connect commands to actual actions
- Commands are stored but never executed against any handler

### 3.4 BROKEN: SSML Processing

**Location:** [`enhanced-speech-controller.ts:496`](packages/app/src/utils/enhanced-speech-controller.ts:496)

```typescript
private processSSML(text: string, settings: EnhancedSpeechSettings): string {
  // Basic SSML processing - returns broken XML
  let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${settings.language}">`
  
  if (settings.enableEmotion) {
    ssml += `<emphasis level="moderate">${text}</emphasis>`  // Missing closing tag handling
  } else {
    ssml += text  // Text is not escaped!
  }
  
  ssml += `</speak>`
  return ssml
}
```

Issues:
- Text content is not XML-escaped (XSS vulnerability)
- Missing proper SSML markup support
- No validation of input

### 3.5 BROKEN: Audio Device Enumeration

**Location:** [`enhanced-speech-controller.ts:193`](packages/app/src/utils/enhanced-speech-controller.ts:193)

```typescript
async initializeAudio() {
  // ...
  const audioDevices: AudioDevice[] = devices
    .filter(device => device.kind === 'audioinput' || device.kind === 'audiooutput')
    .map(device => ({
      // ...
      capabilities: {
        echoCancellation: true,  // HARDCODED - not actual capabilities
        noiseSuppression: true,  // HARDCODED
        autoGainControl: true,   // HARDCODED
        sampleRate: 44100,       // HARDCODED
        channelCount: 2          // HARDCODED
      }
    }))
```

The device capabilities are hardcoded and not actually queried from the device.

---

## 4. Features That Are MISSING Entirely

### 4.1 Provider Discovery Service

According to corpus specs, there should be:
- Provider health checks
- Automatic fallback between providers
- Provider status UI

**Current State:** Only static configuration exists.

### 4.2 Speech Artifact Packets

Per phase T7 specs:
- Issue/proof/failure packets should be emitted
- Speech events should be logged for debugging
- Metrics should be collected

**Current State:** Metrics interface exists but no collection system.

### 4.3 STT Backend Integration

The CLI (`packages/opencode/src/`) has NO speech recognition backend:
- No server routes for speech
- No provider integration for STT
- No streaming transcription support

### 4.4 ElevenLabs and Coqui Providers

Interface declares support at [`enhanced-speech-controller.ts:11`](packages/app/src/utils/enhanced-speech-controller.ts:11):
```typescript
provider: "browser" | "azure" | "openai" | "elevenlabs" | "coqui"
```

But only browser, azure, and openaiCompatible are implemented in the TTS controller.

### 4.5 Audio Queue System

Per phase T4 specs, there should be:
- Queue management for multiple speech requests
- Priority handling
- Overlap prevention

**Current State:** Only single utterance handling exists.

### 4.6 Playwright E2E Tests

Per phase T8 specs, speech should have:
- Playwright coverage for settings
- Playwright coverage for playback
- Visual regression tests

**Current State:** Test docs exist but tests are not implemented.

### 4.7 OpenAI-Compatible STT Support

Only TTS is implemented via OpenAI-compatible API. STT (speech-to-text) via:
```typescript
POST /audio/transcriptions
```

**Current State:** Not implemented.

---

## 5. Provider Integration Status

### 5.1 TTS Providers (Text-to-Speech)

| Provider | Location | Status | Notes |
|----------|----------|--------|-------|
| **Browser (Web Speech API)** | [`speech-controller.ts:56`](packages/kilo-vscode/webview-ui/src/utils/speech-controller.ts:56) | ✅ Working | Uses `SpeechSynthesisUtterance` |
| **Azure TTS** | [`KiloProvider.ts:1953`](packages/kilo-vscode/src/KiloProvider.ts:1953) | ✅ Working | SSML markup, neural voices |
| **OpenAI-Compatible** | [`KiloProvider.ts:1976`](packages/kilo-vscode/src/KiloProvider.ts:1976) | ✅ Working | Custom endpoint support |
| **ElevenLabs** | N/A | ❌ Missing | Declared but not implemented |
| **Coqui** | N/A | ❌ Missing | Declared but not implemented |

### 5.2 STT Providers (Speech-to-Text)

| Provider | Status | Notes |
|----------|--------|-------|
| **Browser (Web Speech API)** | ⚠️ Partial | Works in browser only, no backend |
| **Azure STT** | ❌ Missing | Not implemented |
| **OpenAI-Compatible STT** | ❌ Missing | Not implemented |

### 5.3 Secret Storage

| Secret | Storage Method | Status |
|--------|-----------------|--------|
| `azureApiKey` | VS Code Secrets | ✅ Working |
| `openaiCompatibleApiKey` | VS Code Secrets | ✅ Working |

---

## 6. UI Wiring Status

### 6.1 Message Contract (VS Code Extension)

**Inbound to Extension (UI → Backend):**
| Message | Handler | Status |
|---------|---------|--------|
| `requestSpeechSettings` | [`KiloProvider.ts`](packages/kilo-vscode/src/KiloProvider.ts:1916) | ✅ Working |
| `saveSpeechSecret` | [`KiloProvider.ts:1906`](packages/kilo-vscode/src/KiloProvider.ts:1906) | ✅ Working |
| `clearSpeechSecret` | [`KiloProvider.ts:1911`](packages/kilo-vscode/src/KiloProvider.ts:1911) | ✅ Working |
| `synthesizeSpeech` | [`KiloProvider.ts:754`](packages/kilo-vscode/src/KiloProvider.ts:754) | ✅ Working |

**Outbound to UI (Backend → Frontend):**
| Message | Sender | Status |
|---------|--------|--------|
| `speechSettingsLoaded` | [`KiloProvider.ts:1922`](packages/kilo-vscode/src/KiloProvider.ts:1922) | ✅ Working |
| `speechAudioChunk` | [`KiloProvider.ts:1972`](packages/kilo-vscode/src/KiloProvider.ts:1972) | ✅ Working |
| `speechError` | [`KiloProvider.ts:2002`](packages/kilo-vscode/src/KiloProvider.ts:2002) | ✅ Working |

### 6.2 Settings UI Wiring

| Setting | Saved Via | Status |
|---------|-----------|--------|
| `speech.enabled` | [`SpeechTab.tsx:128`](packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx:128) | ✅ Working |
| `speech.autoSpeakAssistant` | [`SpeechTab.tsx:143`](packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx:143) | ✅ Working |
| `speech.location` | [`SpeechTab.tsx:159`](packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx:159) | ✅ Working |
| `speech.provider` | [`SpeechTab.tsx:180`](packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx:180) | ✅ Working |
| `speech.browserVoice` | [`SpeechTab.tsx:198`](packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx:198) | ✅ Working |
| `speech.browserLang` | [`SpeechTab.tsx:205`](packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx:205) | ✅ Working |
| `speech.browserRate` | [`SpeechTab.tsx:212`](packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx:212) | ✅ Working |
| `speech.browserPitch` | [`SpeechTab.tsx:219`](packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx:219) | ✅ Working |
| `speech.azureRegion` | [`SpeechTab.tsx:234`](packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx:234) | ✅ Working |
| `speech.azureVoice` | [`SpeechTab.tsx:241`](packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx:241) | ✅ Working |
| `speech.azureFormat` | [`SpeechTab.tsx:248`](packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx:248) | ✅ Working |
| `speech.openaiCompatibleBaseUrl` | [`SpeechTab.tsx:293`](packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx:293) | ✅ Working |
| `speech.openaiCompatibleModel` | [`SpeechTab.tsx:300`](packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx:300) | ✅ Working |
| `speech.openaiCompatibleVoice` | [`SpeechTab.tsx:307`](packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx:307) | ✅ Working |
| `speech.openaiCompatibleResponseFormat` | [`SpeechTab.tsx:314`](packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx:314) | ✅ Working |

### 6.3 Chat UI Integration

| Feature | Location | Status |
|---------|----------|--------|
| Auto-speak assistant | [`VscodeSessionTurn.tsx:182`](packages/kilo-vscode/webview-ui/src/components/chat/VscodeSessionTurn.tsx:182) | ✅ Working |
| Manual speak button | [`VscodeSessionTurn.tsx:244`](packages/kilo-vscode/webview-ui/src/components/chat/VscodeSessionTurn.tsx:244) | ✅ Working |
| Stop button | [`VscodeSessionTurn.tsx:248`](packages/kilo-vscode/webview-ui/src/components/chat/VscodeSessionTurn.tsx:248) | ✅ Working |

### 6.4 Left Panel Integration

| Feature | Location | Status |
|---------|----------|--------|
| Voice toggle | [`LeftPanel.tsx:85`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx:85) | ⚠️ Event dispatch but no backend handler |
| Recording status | [`LeftPanel.tsx:96`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx:96) | ⚠️ UI exists, data not connected |
| Voice settings button | [`LeftPanel.tsx:117`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx:117) | ✅ Working |

---

## 7. File-by-File Findings

### 7.1 packages/app/src/utils/speech.ts

| Line | Finding | Severity |
|------|---------|----------|
| 1-326 | STT using Web Speech API | Info |
| 60 | Uses `getSpeechRecognitionCtor` adapter | Info |
| 158-272 | Full recognition lifecycle | Info |
| 105, 285, 299, 314 | Empty catch blocks (silently swallows errors) | Medium |
| 318-325 | Returns interface: isSupported, isRecording, committed, interim, start, stop | Info |

**Assessment:** Browser-only STT. No backend integration.

### 7.2 packages/app/src/utils/enhanced-speech-controller.ts

| Line | Finding | Severity |
|------|---------|----------|
| 4-43 | EnhancedSpeechSettings interface - comprehensive | Info |
| 45-53 | VoiceCommand interface | Info |
| 55-64 | SpeechMetrics interface | Info |
| 66-77 | AudioDevice interface | Info |
| 214 | **BUG:** `this.this.setStore` should be `this.setStore` | CRITICAL |
| 220 | **BUG:** same issue | CRITICAL |
| 224 | **BUG:** same issue | CRITICAL |
| 296 | `continuousRecognition` setting not actually used | Medium |
| 323 | Metrics calculation uses wrong formula (average of averages) | Low |
| 379 | SSML processing not actually used anywhere | Medium |
| 496-508 | **BUG:** Broken SSML - no XML escaping | HIGH |
| 533-536 | debugMode logging exists but no actual event tracking | Medium |

**Assessment:** Controller is completely broken due to `this.this` bug.

### 7.3 packages/kilo-vscode/webview-ui/src/utils/speech-controller.ts

| Line | Finding | Severity |
|------|---------|----------|
| 1-108 | TTS controller for VS Code extension | Info |
| 48-67 | Browser TTS implementation | Working |
| 69-100 | Cloud TTS via VS Code backend | Working |
| 102-105 | Base64 to Blob conversion | Working |

**Assessment:** Fully functional TTS controller.

### 7.4 packages/kilo-vscode/src/KiloProvider.ts

| Line | Finding | Severity |
|------|---------|----------|
| 1898-1942 | Speech secrets and settings | Info |
| 1906-1912 | Secret save/clear | Working |
| 1916-1942 | Settings loading | Working |
| 1951-2003 | `handleSynthesizeSpeech` method | Working |
| 1953-1972 | Azure TTS implementation | Working |
| 1976-2000 | OpenAI-compatible TTS implementation | Working |

**Assessment:** Backend TTS fully functional.

### 7.5 packages/kilo-vscode/webview-ui/src/components/SpeechControls.tsx

| Line | Finding | Severity |
|------|---------|----------|
| 1-421+ | Full speech controls UI | Info |
| 67-78 | Message handlers for speech status | Working |
| 84-91 | Status request on mount | Working |
| 202-214 | Status badge display | Working |
| 237-249 | Recording/speaking buttons | Working |
| 258-286 | Live transcription display | UI exists |
| 370-371 | Test speak button | Working |

**Assessment:** UI is comprehensive but depends on broken EnhancedSpeechController.

### 7.6 packages/kilo-vscode/webview-ui/src/components/settings/SpeechTab.tsx

| Line | Finding | Severity |
|------|---------|----------|
| 1-372+ | Settings tab UI | Info |
| 78-100 | Settings loading from backend | Working |
| 116-118 | Test speech functionality | Working |

**Assessment:** Fully functional settings UI.

### 7.7 packages/kilo-vscode/webview-ui/src/components/chat/VscodeSessionTurn.tsx

| Line | Finding | Severity |
|------|---------|----------|
| 182-189 | Auto-speak effect | Working |
| 244-249 | Manual speak/stop | Working |

**Assessment:** Chat integration fully functional.

---

## 8. Priority Ranking of Fixes

### P0 (Critical - Block Production)

1. **Fix `this.this.setStore` bug in enhanced-speech-controller.ts (lines 214, 220, 224)**
   - This makes the entire enhanced controller non-functional
   
2. **Fix empty catch blocks in speech.ts**
   - Silent error swallowing hides debugging information

### P1 (High - Major Feature Gaps)

3. **Implement STT backend in CLI (packages/opencode/src/)**
   - No speech recognition in the backend
   - Add server routes for speech-to-text

4. **Implement OpenAI-compatible STT endpoint**
   - `POST /audio/transcriptions` not implemented

5. **Fix SSML processing (XML escaping)**
   - Security vulnerability in `processSSML`

6. **Wire voice commands to actual handlers**
   - Events dispatched but no listeners

### P2 (Medium - Quality Issues)

7. **Add provider health checks and fallback**
   - Discovery service missing

8. **Implement audio queue system**
   - Overlap prevention needed

9. **Add actual device capability detection**
   - Currently hardcoded values

10. **Implement Playwright E2E tests**
    - Test docs exist but no actual tests

### P3 (Low - Nice to Have)

11. **Add ElevenLabs provider support**
12. **Add Coqui provider support**
13. **Implement audio quality settings**
14. **Add confidence score display**
15. **Implement voice cloning settings**

---

## 9. Recommendations for Completing the Speech System

### 9.1 Immediate Fixes (Before Any Other Work)

```typescript
// File: packages/app/src/utils/enhanced-speech-controller.ts
// Lines 214, 220, 224

// Change FROM:
this.this.setStore("audioDevices", audioDevices)
this.this.setStore("availableVoices", voices)
this.this.setStore("availableVoices", this.synthesis!.getVoices())

// Change TO:
this.setStore("audioDevices", audioDevices)
this.setStore("availableVoices", voices)
this.setStore("availableVoices", this.synthesis!.getVoices())
```

### 9.2 Architecture Recommendations

1. **Decouple enhanced-speech-controller from actual VS Code integration**
   - The `enhanced-speech-controller.ts` is in `packages/app` (desktop/web)
   - It should not be used by the VS Code extension
   - VS Code should use `speech-controller.ts` only

2. **Add STT to CLI backend**
   - Create `packages/opencode/src/server/routes/speech.ts`
   - Implement `POST /audio/transcriptions` for OpenAI-compatible
   - Add Azure STT support

3. **Add provider health monitoring**
   - Periodic health checks to `/audio/speech` or health endpoints
   - Emit status updates to UI

4. **Add artifact packet generation**
   - Emit `issue` packets on errors
   - Emit `proof` packets on successful synthesis
   - Emit `failure` packets with detailed error info

### 9.3 Testing Strategy

1. **Unit tests for speech.ts**
2. **Unit tests for enhanced-speech-controller.ts** (after bug fix)
3. **Integration tests for KiloProvider speech handling**
4. **Playwright E2E for speech settings flow**
5. **Playwright E2E for speech playback flow**
6. **Visual regression tests for SpeechControls.tsx UI**

---

## 10. Summary

| Category | Status | Count |
|----------|--------|-------|
| Total speech files identified | ✅ | 12 |
| TTS providers working | ✅ | 3 (browser, Azure, OpenAI) |
| STT providers working | ⚠️ | 1 (browser only, no backend) |
| CRITICAL bugs | 🔴 | 1 (this.this bug) |
| Missing features | 🔴 | 8+ |
| UI wiring issues | ⚠️ | 2 (voice commands, left panel status) |
| Settings fully wired | ✅ | 16 settings |
| Message contracts | ✅ | All working |

**Overall Assessment: PARTIALLY FUNCTIONAL**

The TTS system works well for the VS Code extension with browser, Azure, and OpenAI-compatible providers. However, the STT system is severely limited, and the `enhanced-speech-controller.ts` in the app package is completely broken due to the `this.this` bug. Significant work is needed to complete the speech system for production use.

---

*Audit generated: 2026-03-30*
*Agent 1 of 20 - Speech System Audit*
*Corpus reference: KILO_CODE_REVERSE_ENGINEERING_CORPUS/*
