# Feature Discovery Master Index

**Repository:** KiloCode-DaveAI  
**Comparison Target:** Kilo-Org/kilocode (version 7.1.9)  
**Discovery Method:** 20-agent parallel codebase scan with 25% overlap  
**Discovery Date:** 2026-03-29

## Table of Contents

1. [UI Features](./01_UI-features.md)
2. [Backend Features](./02_backend-features.md)
3. [Chat Features](./03_chat-features.md)
4. [Settings Features](./04_settings-features.md)
5. [Menu Features](./05_menu-features.md)
6. [Special Features](./06_special-features.md)
7. [Proposed Features](./proposed-features.md)
8. [To-Add Features](./to-add-features.md)
9. [Master Feature Catalog](./Dave-Features.md)

## Agent Scanning Assignments

### Primary Agents (15 Specialized)

| Agent | Focus Area               | Primary Packages                                                   |
| ----- | ------------------------ | ------------------------------------------------------------------ |
| 01    | UI Components            | `kilo-ui/`, `app/src/pages/`, `webview-ui/src/components/`         |
| 02    | Agent Manager Core       | `kilo-vscode/src/agent-manager/`                                   |
| 03    | Autocomplete System      | `kilo-vscode/src/services/autocomplete/`                           |
| 04    | CLI Backend & Server     | `opencode/src/server/`, `kilo-vscode/src/services/cli-backend/`    |
| 05    | Provider System          | `KiloProvider.ts`, `kilo-provider-utils.ts`, `provider-actions.ts` |
| 06    | Webview & Chat UI        | `webview-ui/src/`, `app/src/pages/session.tsx`                     |
| 07    | Settings & Configuration | `SettingsEditorProvider.ts`, settings panels                       |
| 08    | Marketplace & Extensions | `marketplace/`, `plugin/`                                          |
| 09    | Browser Automation       | `browser-automation-service.ts`                                    |
| 10    | Legacy Migration         | `legacy-migration/`                                                |
| 11    | Code Actions & Editor    | `code-actions/`, `commit-message/`                                 |
| 12    | Telemetry & Analytics    | `kilo-telemetry/`, `telemetry/`                                    |
| 13    | Desktop Electron         | `desktop-electron/src/`                                            |
| 14    | Internationalization     | `kilo-i18n/`, i18n directories                                     |
| 15    | Gateway & Auth           | `kilo-gateway/src/`, auth handlers                                 |

### Verification Agents (5 Redundant - 25% Overlap)

| Agent | Overlap Targets     | Verification Focus                |
| ----- | ------------------- | --------------------------------- |
| 16    | Agent-01 & Agent-06 | UI/Webview overlap                |
| 17    | Agent-02 & Agent-05 | Agent Manager/Provider overlap    |
| 18    | Agent-03 & Agent-11 | Autocomplete/Code Actions overlap |
| 19    | Agent-04 & Agent-12 | CLI Backend/Telemetry overlap     |
| 20    | Agent-07 & Agent-08 | Settings/Marketplace overlap      |

## Feature Categories Summary

### UI Features

- Component library (SolidJS)
- Theme system with 14+ themes
- Toast notifications
- Tooltips
- Chat interface components
- Settings panels
- Agent Manager UI

### Backend Features

- CLI server management
- SDK integration
- Provider routing
- Session management
- Tool execution
- Agent orchestration

### Chat Features

- Real-time messaging
- Message timeline
- Slash commands
- File handling
- Terminal integration
- Review annotations

### Settings Features

- Provider configuration
- Model selection
- Theme customization
- Keybinding management
- Feature flags
- Workspace settings

### Menu Features

- VS Code menu integration
- Context menus
- Status bar items
- Quick picks
- Command palette

### Special Features

- Agent Manager with worktree isolation
- Multi-session orchestration
- Legacy Continue migration
- Marketplace integration
- Browser automation
- Telemetry & analytics

## Documentation Status

| Category          | Status         | Agent Assigned | Findings Count |
| ----------------- | -------------- | -------------- | -------------- |
| UI Features       | 🔄 In Progress | Agent-01       | TBD            |
| Backend Features  | ⏳ Pending     | Agent-04       | TBD            |
| Chat Features     | ⏳ Pending     | Agent-06       | TBD            |
| Settings Features | ⏳ Pending     | Agent-07       | TBD            |
| Menu Features     | ⏳ Pending     | Agent-01/06    | TBD            |
| Special Features  | ⏳ Pending     | Agent-02/09/10 | TBD            |

## Key Differentiators from Upstream

KiloCode-DaveAI includes these Kilo-specific features not found in stock Kilo-Org/kilocode:

1. **Agent Manager** - Multi-session orchestration with git worktree isolation
2. **Kilo Gateway** - Auth, provider routing, API integration
3. **Kilo Telemetry** - PostHog + OpenTelemetry integration
4. **Kilo i18n** - Extended internationalization
5. **Legacy Migration** - Continue extension migration support
6. **Browser Automation** - Browser control capabilities
7. **Marketplace** - Extension marketplace integration

## Next Steps

1. Execute Phase 1: Primary agent scanning (Agents 01-15)
2. Execute Phase 2: Verification scanning (Agents 16-20)
3. Compile findings into categorized documentation
4. Generate Dave-Features.md master document
5. Generate to-add-features.md backlog
6. Review and quality check

---

_This index is maintained by the feature discovery team. Last updated: 2026-03-29_
