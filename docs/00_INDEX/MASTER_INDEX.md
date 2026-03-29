# Master Index

This index maps the execution docs to the remaining work categories.

## Canonical repo
`02_CANONICAL_REPO/` defines the only allowed active source tree, the archive strategy, and the source-of-truth rules.

## Execution phases
`04_PHASE_EXECUTION/` contains general repo phases and speech/TTS phases. Each phase includes goals, file targets, tests, stop rules, and outputs.

## Test docs
`05_BUILD_AND_TEST/` and `06_PLAYWRIGHT_AND_VISUAL_E2E/` contain command order, build failure triage, test categorization, Playwright journeys, and visual regression expectations.

## Runtime/provider docs
`07_PROVIDER_RUNTIME_VALIDATION/` covers Azure, local, stock/browser, MiniMax, fallback paths, health packets, and provider misconfiguration diagnosis.

## UI wiring docs
`08_UI_WIRING_VALIDATION/` covers settings bridges, message contracts, context providers, status badges, Dave surfaces, and stop/test button behavior.

## Release docs
`09_RELEASE_AND_ACTIONS/` covers GitHub Actions, Windows/Linux/macOS release artifacts, reproducibility, versioning, signing placeholders the owner must supply, and release signoff.

## Failure and packet docs
`10_FAILURE_CATALOG/` and `11_PACKET_TEMPLATES/` provide issue localization rules, blocker classes, packet schemas, and exact evidence expectations.
