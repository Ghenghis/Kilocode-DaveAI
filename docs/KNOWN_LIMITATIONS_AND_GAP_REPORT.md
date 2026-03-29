# Known Limitations and Gap Report

This repository has been hardened for release, but these items still require live validation before any honest 100% claim:

- full dependency install and workspace build on clean runners
- Azure/local provider credentials and reachable endpoints
- Playwright execution on the target UI flows in a real CI environment
- desktop packaging success on all three OS runners
- empty placeholder-like file `AgentManagerApp.tsx` should either be implemented or removed if unused
- `.github/publish-python-sdk.yml` remains intentionally misplaced/commented and should be moved or deleted

## Structural findings from audit
- root `package.json` previously contained placeholder scripts (`random`, `hello`) and a failing root test stub; replaced with release-oriented scripts
- `.github/actions/setup-bun/action.yml` used `bun.lockb` cache hashing while repo uses `bun.lock`; corrected
- release workflows were incomplete for cross-platform desktop packaging; added
