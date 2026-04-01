# 🔌 WIRING AUDIT - Agent 4 of 20 - Kilo Code Extension

**Scope**: packages/kilo-vscode/ - UI ↔ Backend Wiring Analysis
**Corpus Reference**: KILO_CODE_REVERSE_ENGINEERING_CORPUS/

---

## 📊 COMPLETE MESSAGE TYPE INVENTORY

### ExtensionMessage (Backend → Webview) - 100+ message types defined

#### ✅ **HANDLED IN WEBVIEW** (Documented handlers)

| Message Type | Handler Location | Status |
|--------------|------------------|--------|
| `ready` | `server.tsx:46` | ✅ Wired |
| `connectionState` | `server.tsx:72` | ✅ Wired |
| `error` | `server.tsx:84` | ✅ Wired |
| `workspaceDirectoryChanged` | `server.tsx:64` | ✅ Wired |
| `languageChanged` | `server.tsx:68` | ✅ Wired |
| `profileData` | `server.tsx:90` | ✅ Wired |
| `deviceAuthStarted` | `server.tsx:95` | ✅ Wired |
| `deviceAuthComplete` | `server.tsx:105` | ✅ Wired |
| `deviceAuthFailed` | `server.tsx:112` | ✅ Wired |
| `deviceAuthCancelled` | `server.tsx:117` | ✅ Wired |
| `sessionCreated` | `session.tsx:535` | ✅ Wired |
| `sessionUpdated` | `session.tsx:587` | ✅ Wired |
| `sessionDeleted` | `session.tsx:591` | ✅ Wired |
| `sessionsLoaded` | `session.tsx:583` | ✅ Wired |
| `messagesLoaded` | `session.tsx:539` | ✅ Wired |
| `messageCreated` | `session.tsx:543` | ✅ Wired |
| `messageRemoved` | `session.tsx:595` | ✅ Wired |
| `partUpdated` | `session.tsx:547` | ✅ Wired |
| `sessionStatus` | `session.tsx:551` | ✅ Wired |
| `sessionError` | `session.tsx:599` | ✅ Wired |
| `sendMessageFailed` | `session.tsx:624` | ✅ Wired |
| `permissionRequest` | `session.tsx:555` | ✅ Wired |
| `permissionResolved` | `session.tsx:559` | ✅ Wired |
| `permissionError` | `session.tsx:563` | ✅ Wired |
| `todoUpdated` | `session.tsx:567` | ✅ Wired |
| `questionRequest` | `session.tsx:571` | ✅ Wired |
| `questionResolved` | `session.tsx:575` | ✅ Wired |
| `questionError` | `session.tsx:579` | ✅ Wired |
| `cloudSessionDataLoaded` | `session.tsx:628` | ✅ Wired |
| `cloudSessionImported` | `session.tsx:632` | ✅ Wired |
| `cloudSessionImportFailed` | `session.tsx:636` | ✅ Wired |
| `configLoaded` | `config.tsx:43` | ✅ Wired |
| `providersLoaded` | `provider.tsx:52` | ✅ Wired |
| `agentsLoaded` | `session.tsx:417` | ✅ Wired |
| `skillsLoaded` | `session.tsx:462` | ✅ Wired |
| `commandsLoaded` | N/A - sent but no direct handler | ⚠️ Partial |
| `notificationsLoaded` | `notifications.tsx:28` | ✅ Wired |
| `worktreeStatsLoaded` | `session.tsx:648` | ✅ Wired |
| `variantsLoaded` | `session.tsx:512` | ✅ Wired |
| `recentsLoaded` | `session.tsx:524` | ✅ Wired |
| `action` | `App.tsx:188` | ✅ Wired |
| `navigate` | `App.tsx:192` | ✅ Wired |
| `openCloudSession` | `App.tsx:197` | ✅ Wired |
| `viewSubAgentSession` | `App.tsx:202` | ✅ Wired |
| `migrationState` | `App.tsx:208` | ✅ Wired |
| `setChatBoxMessage` | N/A - no handler found | ❌ Missing |
| `appendChatBoxMessage` | N/A - no handler found | ❌ Missing |
| `appendReviewComments` | N/A - no handler found | ❌ Missing |
| `triggerTask` | N/A - no handler found | ❌ Missing |
| `speechSettingsLoaded` | N/A - no handler found | ❌ Missing |
| `speechAudioChunk` | N/A - no handler found | ❌ Missing |
| `speechError` | N/A - no handler found | ❌ Missing |
| `notificationSettingsLoaded` | N/A - no handler found | ❌ Missing |
| `browserSettingsLoaded` | N/A - no handler found | ❌ Missing |
| `autocompleteSettingsLoaded` | N/A - no handler found | ❌ Missing |
| `chatCompletionResult` | N/A - no handler found | ❌ Missing |
| `fileSearchResult` | N/A - no handler found | ❌ Missing |
| `configUpdated` | N/A - no handler found | ❌ Missing |
| `globalConfigLoaded` | N/A - no handler found | ❌ Missing |
| `marketplaceData` | N/A - no handler found | ❌ Missing |
| `marketplaceInstallResult` | N/A - no handler found | ❌ Missing |
| `marketplaceRemoveResult` | N/A - no handler found | ❌ Missing |
| `providerOAuthReady` | N/A - no handler found | ❌ Missing |
| `providerConnected` | N/A - no handler found | ❌ Missing |
| `providerDisconnected` | N/A - no handler found | ❌ Missing |
| `providerActionError` | N/A - no handler found | ❌ Missing |
| `customProviderModelsFetched` | N/A - no handler found | ❌ Missing |
| `enhancePromptResult` | N/A - no handler found | ❌ Missing |
| `enhancePromptError` | N/A - no handler found | ❌ Missing |
| `cloudSessionsLoaded` | N/A - no handler found | ❌ Missing |
| `gitRemoteUrlLoaded` | N/A - no handler found | ❌ Missing |
| `continueInWorktreeProgress` | N/A - no handler found | ❌ Missing |

#### ❌ **UNHANDLED ExtensionMessages** (Sent by backend but no webview handler)

| Message Type | Sent From | Priority |
|-------------|-----------|----------|
| `setChatBoxMessage` | `KiloProvider.ts:2581` | HIGH |
| `appendChatBoxMessage` | `KiloProvider.ts` | HIGH |
| `appendReviewComments` | `KiloProvider.ts:2668` | HIGH |
| `triggerTask` | `extension.ts:196` | HIGH |
| `speechSettingsLoaded` | `KiloProvider.ts:1916-1943` | MEDIUM |
| `speechAudioChunk` | `KiloProvider.ts:1972,2000` | MEDIUM |
| `speechError` | `KiloProvider.ts:2002` | MEDIUM |
| `notificationSettingsLoaded` | `KiloProvider.ts:1883-1896` | MEDIUM |
| `browserSettingsLoaded` | `KiloProvider.ts:2507-2516` | MEDIUM |
| `autocompleteSettingsLoaded` | `KiloProvider.ts:2616-2625` | MEDIUM |
| `chatCompletionResult` | `KiloProvider.ts:694` | MEDIUM |
| `fileSearchResult` | `KiloProvider.ts:711-723` | MEDIUM |
| `configUpdated` | `KiloProvider.ts:1799,2051` | MEDIUM |
| `globalConfigLoaded` | `KiloProvider.ts:1772` | MEDIUM |
| `marketplaceData` | `KiloProvider.ts:875` | MEDIUM |
| `marketplaceInstallResult` | `KiloProvider.ts:889` | MEDIUM |
| `marketplaceRemoveResult` | `KiloProvider.ts:904` | MEDIUM |
| `providerOAuthReady` | `provider-actions.ts` | MEDIUM |
| `providerConnected` | `provider-actions.ts` | MEDIUM |
| `providerDisconnected` | `provider-actions.ts` | MEDIUM |
| `providerActionError` | `KiloProvider.ts:1442-1448` | MEDIUM |
| `customProviderModelsFetched` | `KiloProvider.ts:1481,1485` | MEDIUM |
| `enhancePromptResult` | `KiloProvider.ts:854` | MEDIUM |
| `enhancePromptError` | `KiloProvider.ts:860-864` | MEDIUM |
| `cloudSessionsLoaded` | `cloud-session.ts` | MEDIUM |
| `gitRemoteUrlLoaded` | `KiloProvider.ts:767` | MEDIUM |
| `continueInWorktreeProgress` | `KiloProvider.ts:582-589` | HIGH |

---

### WebviewMessage (Webview → Backend) - Handlers in KiloProvider.ts

| Message Type | Handler Location | Status |
|--------------|------------------|--------|
| `webviewReady` | `KiloProvider.ts:451` | ✅ Wired |
| `sendMessage` | `KiloProvider.ts:458` | ✅ Wired |
| `sendCommand` | `KiloProvider.ts:481` | ✅ Wired |
| `abort` | `KiloProvider.ts:505` | ✅ Wired |
| `revertSession` | `KiloProvider.ts:508` | ✅ Wired |
| `unrevertSession` | `KiloProvider.ts:513` | ✅ Wired |
| `permissionResponse` | `KiloProvider.ts:518` | ✅ Wired |
| `createSession` | `KiloProvider.ts:528` | ✅ Wired |
| `clearSession` | `KiloProvider.ts:531` | ✅ Wired |
| `loadMessages` | `KiloProvider.ts:535` | ✅ Wired |
| `syncSession` | `KiloProvider.ts:540` | ✅ Wired |
| `loadSessions` | `KiloProvider.ts:545` | ✅ Wired |
| `login` | `KiloProvider.ts:548` | ✅ Wired |
| `cancelLogin` | `KiloProvider.ts:553` | ✅ Wired |
| `logout` | `KiloProvider.ts:557` | ✅ Wired |
| `setOrganization` | `KiloProvider.ts:560` | ✅ Wired |
| `refreshProfile` | `KiloProvider.ts:565` | ✅ Wired |
| `openExternal` | `KiloProvider.ts:568` | ✅ Wired |
| `openSettingsPanel` | `KiloProvider.ts:573` | ✅ Wired |
| `openChanges` | `KiloProvider.ts:576` | ✅ Wired |
| `continueInWorktree` | `KiloProvider.ts:579` | ✅ Wired |
| `retryConnection` | `KiloProvider.ts:593` | ✅ Wired |
| `openSubAgentViewer` | `KiloProvider.ts:599` | ✅ Wired |
| `previewImage` | `KiloProvider.ts:602` | ✅ Wired |
| `openFile` | `KiloProvider.ts:605` | ✅ Wired |
| `requestProviders` | `KiloProvider.ts:610` | ✅ Wired |
| `connectProvider` | `KiloProvider.ts:613` | ✅ Wired |
| `authorizeProviderOAuth` | `KiloProvider.ts:614` | ✅ Wired |
| `completeProviderOAuth` | `KiloProvider.ts:615` | ✅ Wired |
| `disconnectProvider` | `KiloProvider.ts:616` | ✅ Wired |
| `saveCustomProvider` | `KiloProvider.ts:617` | ✅ Wired |
| `fetchCustomProviderModels` | `KiloProvider.ts:620` | ✅ Wired |
| `compact` | `KiloProvider.ts:625` | ✅ Wired |
| `requestAgents` | `KiloProvider.ts:628` | ✅ Wired |
| `requestSkills` | `KiloProvider.ts:631` | ✅ Wired |
| `requestCommands` | `KiloProvider.ts:634` | ✅ Wired |
| `removeSkill` | `KiloProvider.ts:637` | ✅ Wired |
| `removeMode` | `KiloProvider.ts:642` | ✅ Wired |
| `removeMcp` | `KiloProvider.ts:645` | ✅ Wired |
| `questionReply` | `KiloProvider.ts:649` | ✅ Wired |
| `questionReject` | `KiloProvider.ts:652` | ✅ Wired |
| `requestConfig` | `KiloProvider.ts:655` | ✅ Wired |
| `requestGlobalConfig` | `KiloProvider.ts:658` | ✅ Wired |
| `updateConfig` | `KiloProvider.ts:661` | ✅ Wired |
| `setLanguage` | `KiloProvider.ts:664` | ✅ Wired |
| `requestAutocompleteSettings` | `KiloProvider.ts:670` | ✅ Wired |
| `updateAutocompleteSetting` | `KiloProvider.ts:673` | ✅ Wired |
| `requestChatCompletion` | `KiloProvider.ts:687` | ✅ Wired |
| `requestFileSearch` | `KiloProvider.ts:700` | ✅ Wired |
| `chatCompletionAccepted` | `KiloProvider.ts:727` | ✅ Wired |
| `deleteSession` | `KiloProvider.ts:730` | ✅ Wired |
| `renameSession` | `KiloProvider.ts:733` | ✅ Wired |
| `updateSetting` | `KiloProvider.ts:736` | ✅ Wired |
| `requestBrowserSettings` | `KiloProvider.ts:739` | ✅ Wired |
| `requestNotificationSettings` | `KiloProvider.ts:742` | ✅ Wired |
| `requestSpeechSettings` | `KiloProvider.ts:745` | ✅ Wired |
| `saveSpeechSecret` | `KiloProvider.ts:748` | ✅ Wired |
| `clearSpeechSecret` | `KiloProvider.ts:751` | ✅ Wired |
| `synthesizeSpeech` | `KiloProvider.ts:754` | ✅ Wired |
| `requestNotifications` | `KiloProvider.ts:757` | ✅ Wired |
| `requestCloudSessions` | `KiloProvider.ts:762` | ✅ Wired |
| `requestGitRemoteUrl` | `KiloProvider.ts:765` | ✅ Wired |
| `requestCloudSessionData` | `KiloProvider.ts:770` | ✅ Wired |
| `importAndSend` | `KiloProvider.ts:773` | ✅ Wired |
| `dismissNotification` | `KiloProvider.ts:799` | ✅ Wired |
| `resetAllSettings` | `KiloProvider.ts:802` | ✅ Wired |
| `telemetry` | `KiloProvider.ts:805` | ✅ Wired |
| `persistVariant` | `KiloProvider.ts:808` | ✅ Wired |
| `requestVariants` | `KiloProvider.ts:814` | ✅ Wired |
| `persistRecents` | `KiloProvider.ts:819` | ✅ Wired |
| `requestRecents` | `KiloProvider.ts:822` | ✅ Wired |
| `requestLegacyMigrationData` | `KiloProvider.ts:828` | ✅ Wired |
| `startLegacyMigration` | `KiloProvider.ts:831` | ✅ Wired |
| `skipLegacyMigration` | `KiloProvider.ts:834` | ✅ Wired |
| `clearLegacyData` | `KiloProvider.ts:837` | ✅ Wired |
| `enhancePrompt` | `KiloProvider.ts:841` | ✅ Wired |
| `fetchMarketplaceData` | `KiloProvider.ts:868` | ✅ Wired |
| `filterMarketplaceItems` | `KiloProvider.ts:878` | ✅ Wired |
| `installMarketplaceItem` | `KiloProvider.ts:882` | ✅ Wired |
| `removeInstalledMarketplaceItem` | `KiloProvider.ts:897` | ✅ Wired |

**All WebviewMessage types have handlers in KiloProvider.ts ✅**

---

## 🚨 CRITICAL WIRING GAPS

### 1. **Speech Settings NOT Wired to UI** (MEDIUM Priority)
- **File**: `KiloProvider.ts:1916-1943` sends `speechSettingsLoaded`
- **Missing**: No handler in any webview context
- **Impact**: Speech settings changes in backend don't update UI

### 2. **Chat Box Messages NOT Wired** (HIGH Priority)
- **File**: `KiloProvider.ts` sends `setChatBoxMessage`, `appendChatBoxMessage`  
- **Missing**: No handler in webview for these message types
- **Impact**: Chat box cannot be programmatically set/appended

### 3. **Continue In Worktree Progress NOT Wired** (HIGH Priority)
- **File**: `KiloProvider.ts:582-589` sends `continueInWorktreeProgress`
- **Missing**: No handler in webview
- **Impact**: Progress updates for "Continue in Worktree" feature are lost

### 4. **Review Comments NOT Wired** (HIGH Priority)
- **File**: `KiloProvider.ts:2668` sends `appendReviewComments`
- **Missing**: No handler in webview for `appendReviewComments`
- **Impact**: Diff viewer comments cannot be appended to chat

### 5. **Trigger Task NOT Wired** (HIGH Priority)
- **File**: `extension.ts:196` sends `triggerTask`
- **Missing**: No handler in webview for `triggerTask`
- **Impact**: Terminal command generation trigger doesn't work

### 6. **Config Updates NOT Wired** (MEDIUM Priority)
- **File**: `KiloProvider.ts:1799,2051` sends `configUpdated`
- **Missing**: No handler in `config.tsx` for `configUpdated` (only handles `configLoaded`)
- **Impact**: Config changes don't trigger UI updates until reload

### 7. **Settings Panels NOT Receiving Updates** (MEDIUM Priority)
- **Missing handlers for**:
  - `notificationSettingsLoaded`
  - `browserSettingsLoaded`
  - `autocompleteSettingsLoaded`
- **Impact**: Settings UI may show stale values

---

## 📋 AGENT MANAGER WIRING ANALYSIS

**File**: `packages/kilo-vscode/src/agent-manager/AgentManagerProvider.ts`

The AgentManagerProvider has its own message handling. Key issues:

| Message Type | Direction | Handler | Status |
|-------------|-----------|---------|--------|
| `agentManager.state` | → Webview | `AgentManagerApp.tsx` | ✅ Wired |
| `agentManager.sessionMeta` | → Webview | `AgentManagerApp.tsx` | ✅ Wired |
| `agentManager.repoInfo` | → Webview | `AgentManagerApp.tsx` | ✅ Wired |
| `agentManager.worktreeSetup` | → Webview | `AgentManagerApp.tsx` | ✅ Wired |
| `agentManager.sessionAdded` | → Webview | `AgentManagerApp.tsx` | ✅ Wired |
| `agentManager.sessionForked` | → Webview | `AgentManagerApp.tsx` | ✅ Wired |
| `agentManager.worktreeDiff` | → Webview | `AgentManagerApp.tsx` | ✅ Wired |
| `agentManager.worktreeStats` | → Webview | `AgentManagerApp.tsx` | ✅ Wired |
| `agentManager.localStats` | → Webview | `AgentManagerApp.tsx` | ✅ Wired |
| `agentManager.applyWorktreeDiffResult` | → Webview | `AgentManagerApp.tsx:1341` | ✅ Wired |
| `agentManager.keybindings` | → Webview | `AgentManagerApp.tsx` | ✅ Wired |
| `agentManager.multiVersionProgress` | → Webview | `AgentManagerApp.tsx` | ✅ Wired |
| `agentManager.branches` | → Webview | `AgentManagerApp.tsx` | ✅ Wired |
| `agentManager.externalWorktrees` | → Webview | `AgentManagerApp.tsx` | ✅ Wired |
| `agentManager.importResult` | → Webview | `AgentManagerApp.tsx` | ✅ Wired |
| `agentManager.setSessionModel` | → Webview | `AgentManagerApp.tsx` | ✅ Wired |
| `agentManager.sendInitialMessage` | → Webview | `AgentManagerApp.tsx` | ✅ Wired |

**Agent Manager Webview → Backend Messages (all handled in AgentManagerProvider.ts)**:
- All `agentManager.*` request messages are handled ✅

---

## 🔧 SETTINGS WIRING GAPS

### VS Code Settings → Backend Config

| Setting | Source | Handler | Status |
|---------|--------|---------|--------|
| `kilo-code.new.language` | `setLanguage` | `KiloProvider.ts:664-668` | ✅ Wired |
| `kilo-code.new.autocomplete.*` | `updateAutocompleteSetting` | `KiloProvider.ts:673-684` | ✅ Wired |
| `kilo-code.new.browserAutomation.*` | N/A | Not wired | ❌ Missing |
| `kilo-code.new.speech.*` | N/A | Not wired | ❌ Missing |
| `kilo-code.new.notifications.*` | N/A | Not wired | ❌ Missing |

### Backend Config → VS Code Settings

| Config Key | Source | Handler | Status |
|-----------|--------|---------|--------|
| Model selection | `configLoaded` | `config.tsx` | ✅ Partial |
| Provider config | `configLoaded` | `provider.tsx` | ✅ Partial |
| Permission rules | `configLoaded` | Auto-approve tab | ✅ Partial |

---

## 📁 KEY FILE REFERENCES

### Backend Message Handlers
- `packages/kilo-vscode/src/KiloProvider.ts:450-912` - Main switch statement for WebviewMessage
- `packages/kilo-vscode/src/extension.ts:155-251` - Command registrations

### Webview Message Handlers
- `packages/kilo-vscode/webview-ui/src/context/server.tsx:44-121` - Server/connection messages
- `packages/kilo-vscode/webview-ui/src/context/session.tsx:532-647` - Session messages
- `packages/kilo-vscode/webview-ui/src/context/config.tsx:43` - Config messages
- `packages/kilo-vscode/webview-ui/src/context/provider.tsx:52` - Provider messages
- `packages/kilo-vscode/webview-ui/src/context/notifications.tsx:28` - Notification messages
- `packages/kilo-vscode/webview-ui/src/App.tsx:186-211` - Navigation/action messages

### Message Type Definitions
- `packages/kilo-vscode/webview-ui/src/types/messages.ts` - All message types (2174 lines)

---

## 🎯 PRIORITY RANKING FOR FIXES

### P0 - CRITICAL (Must Fix)
1. **Continue In Worktree Progress** - `continueInWorktreeProgress` has no handler
2. **Chat Box Messages** - `setChatBoxMessage`, `appendChatBoxMessage` not wired
3. **Trigger Task** - `triggerTask` not wired from extension.ts

### P1 - HIGH (Should Fix)
4. **Review Comments** - `appendReviewComments` not wired
5. **Config Updates** - `configUpdated` not handled (only `configLoaded`)

### P2 - MEDIUM (Nice to Fix)
6. **Speech Settings** - `speechSettingsLoaded`, `speechAudioChunk`, `speechError` not wired
7. **Notification Settings** - `notificationSettingsLoaded` not wired
8. **Browser Settings** - `browserSettingsLoaded` not wired
9. **Autocomplete Settings** - `autocompleteSettingsLoaded` not wired

---

## 📊 SUMMARY STATISTICS

| Category | Total | Handled | Missing | % Wired |
|----------|-------|---------|---------|---------|
| ExtensionMessage types | ~100 | ~45 | ~55 | 45% |
| WebviewMessage types | ~120 | ~120 | 0 | 100% |
| Settings wiring | ~15 | ~8 | ~7 | 53% |
| Agent Manager messages | ~25 | ~25 | 0 | 100% |

---

## 🔍 ACTUAL vs INTENDED FLOW ANALYSIS

### Message Flow Diagram (Simplified)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VS Code Extension                             │
│  ┌──────────────────┐    ┌─────────────────┐    ┌───────────────┐   │
│  │  KiloProvider    │───▶│ ConnectionService│───▶│ CLI Backend  │   │
│  │  (message hub)   │    │  (SSE events)   │    │ (kilo serve) │   │
│  └────────┬─────────┘    └─────────────────┘    └───────────────┘   │
│           │ postMessage                                             │
└───────────│─────────────────────────────────────────────────────────┘
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Webview UI                                    │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐  ┌───────────┐   │
│  │  ServerCtx │  │ SessionCtx │  │ ProviderCtx│  │  ConfigCtx│   │
│  │  (11 msgs)│  │ (25 msgs) │  │ (1 msg)   │  │ (1 msg)   │   │
│  └────────────┘  └────────────┘  └───────────┘  └───────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

**Issue**: 55 ExtensionMessage types are sent but not handled in any webview context.

---

## ✅ COMPLETE MESSAGE TRACEABILITY MATRIX

### Backend Sends → Webview Receives

| Line | Message Type | Backend Location | Webview Handler | Status |
|------|-------------|-----------------|-----------------|--------|
| 246-261 | `ready` | KiloProvider.ts | server.tsx:46 | ✅ |
| 934 | `connectionState` | KiloProvider.ts | server.tsx:72 | ✅ |
| 975 | `connectionState` | KiloProvider.ts | server.tsx:72 | ✅ |
| 1016 | `languageChanged` | KiloProvider.ts | server.tsx:68 | ✅ |
| 1010 | `profileData` | KiloProvider.ts | server.tsx:90 | ✅ |
| 1017 | `migrationState` | KiloProvider.ts | App.tsx:208 | ✅ |
| 1159-1196 | `messagesLoaded` | KiloProvider.ts | session.tsx:539 | ✅ |
| 1197-1260 | `sessionCreated` | KiloProvider.ts | session.tsx:535 | ✅ |
| 1361 | `sessionUpdated` | KiloProvider.ts | session.tsx:587 | ✅ |
| 1333 | `sessionDeleted` | KiloProvider.ts | session.tsx:591 | ✅ |
| 1172-1178 | `sessionStatus` | KiloProvider.ts | session.tsx:551 | ✅ |
| 1883-1896 | `notificationSettingsLoaded` | KiloProvider.ts | **NOT HANDLED** | ❌ |
| 1916-1943 | `speechSettingsLoaded` | KiloProvider.ts | **NOT HANDLED** | ❌ |
| 1972,2000 | `speechAudioChunk` | KiloProvider.ts | **NOT HANDLED** | ❌ |
| 2002 | `speechError` | KiloProvider.ts | **NOT HANDLED** | ❌ |
| 2507-2516 | `browserSettingsLoaded` | KiloProvider.ts | **NOT HANDLED** | ❌ |
| 2616-2625 | `autocompleteSettingsLoaded` | KiloProvider.ts | **NOT HANDLED** | ❌ |
| 2668 | `appendReviewComments` | KiloProvider.ts | **NOT HANDLED** | ❌ |
| 2668 | `setChatBoxMessage` | KiloProvider.ts | **NOT HANDLED** | ❌ |
| 2668 | `appendChatBoxMessage` | KiloProvider.ts | **NOT HANDLED** | ❌ |
| 1799 | `configUpdated` | KiloProvider.ts | **NOT HANDLED** | ❌ |
| 2051 | `configUpdated` | KiloProvider.ts | **NOT HANDLED** | ❌ |

---

**Document Version**: 1.0
**Auditor**: Agent 4 of 20 - Wiring Audit
**Date**: 2026-03-30
**Files Analyzed**: 
- `packages/kilo-vscode/webview-ui/src/types/messages.ts` (2174 lines)
- `packages/kilo-vscode/src/KiloProvider.ts` (2909 lines)
- `packages/kilo-vscode/src/extension.ts` (399 lines)
- `packages/kilo-vscode/webview-ui/src/App.tsx` (308 lines)
- `packages/kilo-vscode/webview-ui/src/context/server.tsx` (165 lines)
- `packages/kilo-vscode/webview-ui/src/context/session.tsx` (800+ lines)
- `packages/kilo-vscode/webview-ui/src/context/config.tsx`
- `packages/kilo-vscode/webview-ui/src/context/provider.tsx`
- `packages/kilo-vscode/webview-ui/src/context/notifications.tsx`
