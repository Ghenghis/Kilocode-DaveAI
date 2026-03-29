# CI Pipeline Overview

## 1. ci-core.yml
Runs on push, PR, workflow_dispatch.
- checkout
- setup bun
- lint
- typecheck
- unit tests
- upload logs on failure

## 2. playwright-e2e.yml
Runs on PR and workflow_dispatch.
- install Playwright browsers
- run app E2E
- run vscode visual tests
- upload reports on failure

## 3. release-artifacts.yml
Runs on release published or workflow_dispatch.
- matrix on windows-latest, ubuntu-latest, macos-latest
- build repo
- package desktop
- upload release artifacts

## 4. reproducibility-check.yml
Runs on PR and workflow_dispatch.
- verify lockfile
- verify package.json scripts
- verify no placeholder scripts remain
- verify build graph commands exist
