# UI Elements Audit Report - Kilo Code VS Code Extension

**Audit Date:** 2026-03-30  
**Auditor:** Agent 2 - UI Components  
**Reference Corpus:** `KILO_CODE_REVERSE_ENGINEERING_CORPUS/`

---

## Executive Summary

This audit examines the Kilo Code VS Code Extension webview UI to identify missing, broken, or disconnected UI elements compared to stock Kilo Code specifications. The audit covers left panel items, status indicators, speech controls, toolbar items, and menu features.

**Key Finding:** Most UI components ARE implemented in the codebase, but many are either:
1. Not wired to actual functionality
2. Conditionally hidden based on readonly mode
3. Present but using stub/disconnected event handlers
4. Referenced in StatusMonitor but feature-flagged as disabled

---

## 1. Complete Inventory of Current UI Components

### 1.1 Left Panel Components

**File:** [`packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx)

| Component | Lines | Status | Notes |
|-----------|-------|--------|-------|
| Voice Controls Section | 79-127 | ✅ Implemented | Switch toggle, recording/speaking indicators |
| Status Section | 129-181 | ✅ Implemented | Expandable with connection, session, file changes status |
| Quick Actions Section | 183-256 | ✅ Implemented | New Task, History, Marketplace, Changes, Settings |
| Provider Status Section | 258-279 | ✅ Implemented | Shows when connected, includes Main Provider and Speech |

**CSS:** [`packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.css`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.css) (277 lines)

### 1.2 Main Chat Components

| Component | File Path | Lines | Status |
|-----------|-----------|-------|--------|
| ChatView | [`ChatView.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/ChatView.tsx) | 243 | ✅ Container component |
| TaskHeader | [`TaskHeader.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/TaskHeader.tsx) | 139 | ✅ Session title, cost, context, todos |
| MessageList | [`MessageList.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/MessageList.tsx) | - | ✅ Message display |
| PromptInput | [`PromptInput.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/PromptInput.tsx) | - | ✅ Input with slash commands |
| QuestionDock | [`QuestionDock.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/QuestionDock.tsx) | - | ✅ Question handling |
| PermissionDock | [`PermissionDock.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/PermissionDock.tsx) | - | ✅ Permission handling |
| LeftPanel | [`LeftPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx) | 284 | ✅ Sidebar |

### 1.3 Status & Debug Components

| Component | File Path | Lines | Status | Issue |
|-----------|-----------|-------|--------|-------|
| StatusPanel | [`StatusPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/StatusPanel.tsx) | 283 | ✅ Present | NOT linked to main UI |
| SpeechControls | [`SpeechControls.tsx`](packages/kilo-vscode/webview-ui/src/components/SpeechControls.tsx) | 440 | ✅ Present | NOT linked to main UI |
| EnhancedDebugPanel | [`EnhancedDebugPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/EnhancedDebugPanel.tsx) | - | ✅ Present | NOT linked to main UI |
| EnhancedCLIConsole | [`EnhancedCLIConsole.tsx`](packages/kilo-vscode/webview-ui/src/components/EnhancedCLIConsole.tsx) | - | ✅ Present | NOT linked to main UI |

### 1.4 Settings Components

**Directory:** [`packages/kilo-vscode/webview-ui/src/components/settings/`](packages/kilo-vscode/webview-ui/src/components/settings/)

| Component | Status |
|-----------|--------|
| Settings.tsx | ✅ |
| ProvidersTab.tsx | ✅ |
| ModelsTab.tsx | ✅ |
| SpeechTab.tsx | ✅ |
| AgentBehaviourTab.tsx | ✅ |
| AboutKiloCodeTab.tsx | ✅ |

### 1.5 Marketplace Components

**Directory:** [`packages/kilo-vscode/webview-ui/src/components/marketplace/`](packages/kilo-vscode/webview-ui/src/components/marketplace/)

| Component | Status |
|-----------|--------|
| MarketplaceView.tsx | ✅ |
| MarketplaceListView.tsx | ✅ |
| ItemCard.tsx | ✅ |
| InstallModal.tsx | ✅ |
| RemoveDialog.tsx | ✅ |

---

## 2. What SHOULD Exist (Based on Corpus)

### 2.1 Stock Kilo Code Left Panel Items (Per User Feedback)

| Item | Expected | Found | File/Line |
|------|----------|-------|-----------|
| Voice toggle/control | Yes | ✅ | LeftPanel.tsx:85-90 |
| Status indicators | Yes | ✅ | LeftPanel.tsx:129-181 |
| Quick action buttons | Yes | ✅ | LeftPanel.tsx:183-256 |
| Provider status display | Yes | ✅ | LeftPanel.tsx:258-279 |
| Changes button with file count | Yes | ✅ | LeftPanel.tsx:227-242 |
| Marketplace button | Yes | ✅ | LeftPanel.tsx:215-225 |
| History button | Yes | ✅ | LeftPanel.tsx:203-213 |

### 2.2 Stock Kilo Code Features (From Corpus Feature Maps)

| Feature | Expected | Found | Status |
|---------|----------|-------|--------|
| Agent Manager | Yes | ✅ | packages/kilo-vscode/src/agent-manager/ |
| Worktree isolation | Yes | ✅ | worktree-mode.tsx |
| Multi-Session | Yes | ✅ | session.tsx |
| Kilo Gateway | Yes | ✅ | packages/kilo-gateway/ |
| Marketplace | Yes | ✅ | marketplace/ components |
| Browser Automation | Yes | ❌ | No UI integration found |
| OpenHands | Yes | ⚠️ | StatusMonitor.ts:39 - feature flagged disabled |

---

## 3. What IS Implemented But Broken or Disconnected

### 3.1 SpeechControls Component

**File:** [`SpeechControls.tsx`](packages/kilo-vscode/webview-ui/src/components/SpeechControls.tsx:1-440)

**Issue:** The SpeechControls component (440 lines) exists but is NOT integrated into the main ChatView or App layout. It appears to be a standalone diagnostic panel.

```typescript
// SpeechControls.tsx:34-93
// onMount sets up message handlers but these are never triggered
// because SpeechControls is never rendered in the main UI tree
```

**Evidence:** Searching for `SpeechControls` usage in App.tsx and ChatView.tsx shows no import or rendering.

### 3.2 StatusPanel Component

**File:** [`StatusPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/StatusPanel.tsx:1-283)

**Issue:** The StatusPanel (283 lines) with detailed connection, performance, provider, and feature status exists but is NOT integrated into the main UI.

**Evidence:** StatusPanel is never imported or rendered in App.tsx.

### 3.3 OpenHands Feature Flag

**File:** [`StatusMonitor.ts`](packages/kilo-vscode/webview-ui/src/services/StatusMonitor.ts:39)

```typescript
// Line 39 - feature exists but disabled
openhands: { enabled: false, working: false },
```

**Issue:** OpenHands is referenced in the status tracking but has no UI toggle or integration.

### 3.4 EnhancedDebugPanel & EnhancedCLIConsole

**Issue:** These debug tools are implemented but not connected to any UI. They're standalone components that need explicit routing to be visible.

---

## 4. What is MISSING Entirely

### 4.1 Main App Toolbar

**Issue:** No dedicated toolbar component found in the main chat UI. Stock Kilo Code typically shows:
- Mode switcher (Code/Ask/Architect)
- Provider selector
- Quick action buttons

**Current State:** Mode switching is done through `session.selectAgent()` but no visual mode switcher component is visible in the sidebar.

### 4.2 Quick Settings Access

**Issue:** No quick-access settings button in the header/toolbar for common settings like:
- Model selection
- Provider toggle
- Theme switcher

**Current State:** Settings require navigating through the full Settings view.

### 4.3 Status Bar Integration

**Issue:** The VS Code status bar integration (mentioned in corpus as `packages/kilo-vscode/src/status.ts`) appears to exist but may not be fully wired to display:
- Connection state
- Current model
- Token usage
- Cost tracking

### 4.4 Real-time Activity Indicators

**Issue:** No visible indicators for:
- Agent thinking/processing state (beyond basic busy/idle)
- Tool execution progress
- Network activity

---

## 5. Specific File Paths and Line Numbers

### 5.1 LeftPanel Analysis

| Item | File | Lines | Issue |
|------|------|-------|-------|
| Voice toggle handler | [`LeftPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx) | 43-51 | Dispatched but no backend handler |
| Status expansion | [`LeftPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx) | 131-139 | Local state only |
| Changes button | [`LeftPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx) | 227-242 | `vscode.postMessage({ type: "openChanges" })` - needs backend |
| Marketplace navigation | [`LeftPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx) | 73-75 | Dispatches event, App.tsx handles |
| History navigation | [`LeftPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx) | 69-71 | Dispatches event, App.tsx handles |

### 5.2 ChatView Integration Points

| Item | File | Line | Status |
|------|------|-------|--------|
| LeftPanel rendering | [`ChatView.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/ChatView.tsx) | 129-142 | ✅ Conditionally shown |
| Changes button | [`ChatView.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/ChatView.tsx) | 205-231 | ✅ In session-diff-badge |
| Worktree button | [`ChatView.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/ChatView.tsx) | 183-204 | ✅ Continue in Worktree |

### 5.3 App.tsx View Routing

| View | File | Line | Handler |
|------|------|-------|---------|
| newTask | [`App.tsx`](packages/kilo-vscode/webview-ui/src/App.tsx) | 229-234 | ✅ ChatView |
| marketplace | [`App.tsx`](packages/kilo-vscode/webview-ui/src/App.tsx) | 236-238 | ✅ MarketplaceView |
| history | [`App.tsx`](packages/kilo-vscode/webview-ui/src/App.tsx) | 239-241 | ✅ HistoryView |
| profile | [`App.tsx`](packages/kilo-vscode/webview-ui/src/App.tsx) | 242-248 | ✅ ProfileView |
| settings | [`App.tsx`](packages/kilo-vscode/webview-ui/src/App.tsx) | 249-258 | ✅ Settings component |
| subAgentViewer | [`App.tsx`](packages/kilo-vscode/webview-ui/src/App.tsx) | 259-261 | ✅ ChatView readonly |

### 5.4 Event Wiring Issues

| Event | Dispatched | Handled | Backend |
|-------|------------|---------|--------|
| speechToggle | LeftPanel.tsx:48 | ❌ No handler | ❌ Not implemented |
| newTaskRequest | Multiple | ✅ App.tsx:150 | ✅ |
| marketplaceButtonClicked | LeftPanel.tsx:74 | ✅ App.tsx:153 | ✅ |
| historyButtonClicked | LeftPanel.tsx:70 | ✅ App.tsx:156 | ✅ |
| openChanges | LeftPanel.tsx:59 | ✅ vscode.postMessage | ✅ Backend handles |
| navigateToSettings | LeftPanel.tsx:64-66 | ❌ No handler | ❌ Not implemented |

---

## 6. Priority Ranking

### P0 - Critical (Breaks Core Flow)

1. **Speech event handlers disconnected**
   - Location: [`LeftPanel.tsx:48-50`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx:48)
   - Issue: `speechToggle` event dispatched but no backend handler
   - Impact: Voice controls non-functional

2. **Settings navigation not wired**
   - Location: [`LeftPanel.tsx:62-67`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx:62)
   - Issue: `navigateToSettings` event dispatched but no handler in App.tsx
   - Impact: Quick settings access from left panel broken

### P1 - High (Feature Incomplete)

3. **SpeechControls component isolated**
   - Location: [`SpeechControls.tsx`](packages/kilo-vscode/webview-ui/src/components/SpeechControls.tsx:1)
   - Issue: Full speech diagnostic panel not accessible from UI
   - Impact: Users cannot access speech settings/debugging

4. **StatusPanel component isolated**
   - Location: [`StatusPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/StatusPanel.tsx:1)
   - Issue: Detailed status panel not accessible from UI
   - Impact: No way to view provider/feature status details

5. **OpenHands feature disabled**
   - Location: [`StatusMonitor.ts:39`](packages/kilo-vscode/webview-ui/src/services/StatusMonitor.ts:39)
   - Issue: Feature exists in tracking but `enabled: false, working: false`
   - Impact: Related functionality not available

### P2 - Medium (Missing Polish)

6. **No mode switcher in toolbar**
   - Location: [`TaskHeader.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/TaskHeader.tsx:1)
   - Issue: No visual mode indicator/switcher
   - Impact: Users can't easily switch modes

7. **No quick provider selector**
   - Issue: No dropdown for quick provider switching
   - Impact: Requires navigating to settings

8. **No browser automation UI**
   - Issue: Browser automation exists (per StatusMonitor) but no UI
   - Impact: Users can't control/debug browser automation

---

## 7. Visual Comparison Notes

### Stock Kilo Code Expected Layout

```
┌─────────────────────────────────────────────────────┐
│  [Logo]  Kilo Code    [Mode: Code ▼]   [⚙️] [👤]  │  <- Toolbar (MISSING)
├────────┬────────────────────────────────────────────┤
│        │  Session Title              Cost | Tokens  │  <- TaskHeader
│ Voice  ├────────────────────────────────────────────┤
│ [ON]   │                                            │
│        │          Chat Messages                     │
│ Status │                                            │
│ ▼      │                                            │
│        ├────────────────────────────────────────────┤
│ Quick  │  [Prompt Input]                           │
│ Actions│                                            │
│        │                                            │
└────────┴────────────────────────────────────────────┘
```

### Current Implementation

The current LeftPanel DOES contain all the elements mentioned (Voice, Status, Quick Actions), but:

1. **Voice section** exists but events are not wired
2. **Status section** is expandable but purely local state
3. **Quick Actions** exist and most are wired (History, Marketplace work)
4. **Changes button** exists in both LeftPanel and ChatView

---

## 8. Recommendations

### Immediate Fixes (P0)

1. **Wire speechToggle event to backend**
   - File: [`LeftPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx:43-51)
   - Add backend message handler in extension.ts

2. **Wire navigateToSettings event**
   - File: [`LeftPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx:62-67)
   - Add handler in App.tsx's message handler

### Short-term (P1)

3. **Integrate SpeechControls into Settings**
   - Create link from SpeechTab to SpeechControls panel
   - Or embed SpeechControls functionality into SpeechTab

4. **Integrate StatusPanel into UI**
   - Add accessible button to show status details
   - Or merge relevant info into LeftPanel Status section

### Medium-term (P2)

5. **Add mode switcher component**
   - Visual indicator in TaskHeader or separate toolbar
   - Click to cycle or dropdown to select

6. **Add provider quick-select**
   - Dropdown in header or LeftPanel
   - Shows current provider with quick switch

---

## Appendix: File Manifest

### Core UI Files Audited

| File | Lines | Status |
|------|-------|--------|
| [`App.tsx`](packages/kilo-vscode/webview-ui/src/App.tsx) | 308 | Main container |
| [`ChatView.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/ChatView.tsx) | 243 | Chat container |
| [`LeftPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.tsx) | 284 | Sidebar |
| [`LeftPanel.css`](packages/kilo-vscode/webview-ui/src/components/chat/LeftPanel.css) | 277 | Sidebar styles |
| [`TaskHeader.tsx`](packages/kilo-vscode/webview-ui/src/components/chat/TaskHeader.tsx) | 139 | Session header |
| [`SpeechControls.tsx`](packages/kilo-vscode/webview-ui/src/components/SpeechControls.tsx) | 440 | Speech panel (disconnected) |
| [`StatusPanel.tsx`](packages/kilo-vscode/webview-ui/src/components/StatusPanel.tsx) | 283 | Status panel (disconnected) |
| [`StatusMonitor.ts`](packages/kilo-vscode/webview-ui/src/services/StatusMonitor.ts) | 283 | Status tracking service |

### Event Flow Issues Found

| Event | Source | Target | Status |
|-------|--------|--------|--------|
| speechToggle | LeftPanel.tsx | Backend | ❌ Missing handler |
| navigateToSettings | LeftPanel.tsx | App.tsx | ❌ Missing handler |
| openChanges | LeftPanel.tsx, ChatView.tsx | Backend | ✅ Working |
| newTaskRequest | Multiple | App.tsx | ✅ Working |
| marketplaceButtonClicked | LeftPanel.tsx | App.tsx | ✅ Working |
| historyButtonClicked | LeftPanel.tsx | App.tsx | ✅ Working |

---

**End of Audit Report**
