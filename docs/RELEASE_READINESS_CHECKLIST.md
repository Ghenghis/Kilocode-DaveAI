# Release Readiness Checklist

## Canonical tree

- [ ] Single active source root is repository root
- [ ] `.dave/` contains project docs and artifact rules only
- [ ] duplicate execution-pack folders removed from active source tree

## Wiring

- [ ] Settings -> provider bridge verified
- [ ] Settings -> speech state bridge verified
- [ ] UI controls produce backend message events
- [ ] backend provider registry emits health state to UI
- [ ] one-writer enforcement blocks non-writer commit path
- [ ] fail-closed gates stop release when lint/type/test fail

## CI

- [ ] core CI runs lint, typecheck, unit tests
- [ ] E2E CI runs Playwright app flow and vscode visual flow
- [ ] release CI packages desktop artifacts for Windows/Linux/macOS
- [ ] reproducibility workflow verifies lockfile, package graph, and build scripts

## Provider validation

- [ ] Azure secret stored through VS Code SecretStorage only
- [ ] stock speech fallback verified
- [ ] local provider healthcheck verified
- [ ] provider-health packet emitted on failure

## Release artifacts

- [ ] changelog or release notes prepared
- [ ] desktop artifacts attached
- [ ] docs zip or repo docs available
- [ ] known gaps documented
