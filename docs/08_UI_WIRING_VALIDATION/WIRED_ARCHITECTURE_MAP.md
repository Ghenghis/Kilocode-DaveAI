# Wired Architecture Map

## User action chain
UI control
→ webview event
→ extension/provider bridge
→ runtime/provider logic
→ result/failure packet
→ UI state update

## Validate for each major surface
- control exists
- event emits
- backend receives
- backend responds
- UI updates
