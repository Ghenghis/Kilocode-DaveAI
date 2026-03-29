# Wired Architecture Map

## Core surfaces
- `packages/kilo-vscode/src/KiloProvider.ts` -> extension/webview bridge and settings message routing
- `packages/kilo-vscode/src/SettingsEditorProvider.ts` -> settings launch / Dave settings surface
- `packages/kilo-vscode/webview-ui/src/components/settings/` -> user-facing settings tabs
- `packages/kilo-vscode/webview-ui/src/context/` -> front-end message/state providers
- `packages/kilo-vscode/src/services/tts/` -> TTS discovery, playback, secret storage, provider contracts
- `packages/opencode/src/` -> CLI, orchestration, writer execution, provider/runtime logic
- `.github/workflows/` -> release-quality automation gates

## Speech control-plane map
- `TtsTypes.ts` -> canonical speech config shape
- `SecretManager.ts` -> secure provider secret storage
- `DiscoveryService.ts` -> local engine scanning and health
- `TtsPlaybackService.ts` -> queue, interrupt, playback routing
- `SpeechTab.tsx` -> provider selection, keys, health state, queue controls
- `TtsProvider` context -> speech status and stop behavior in webview

## Enforcement map
- root `package.json` -> canonical repo scripts
- `.github/actions/setup-bun/action.yml` -> dependency setup
- `core/permissions` or equivalent writer guard path -> one-writer enforcement
- `.dave/` and `docs/release-hardening` -> proof, issues, release policy
