# KILO CODE — ULTRA DETAILED RELEASE HARDENING + COMPLETE TEST KIT EXECUTION PACK FOR WINDSURF SWE-1.5

## DOCUMENT PURPOSE

This document is the authoritative execution pack for building the strongest practical release-hardening and test system for Kilo Code.

This is written for **Windsurf SWE-1.5** to execute step by step.

This pack is designed to answer four questions:

1. What test families must exist for a highly stable release?
2. What tools should be used for each family?
3. How should GitHub Actions be structured to enforce those checks?
4. In what order should SWE-1.5 implement the system so the repo becomes increasingly safer without collapsing under too much work at once?

This pack is **not** a vague wishlist.
It is an implementation contract.

---

# 0. EXECUTIVE SUMMARY

## What GitHub does

GitHub Actions is the **orchestration and enforcement layer**.

It can:

- run workflows
- execute builds/tests
- upload artifacts
- run matrix jobs
- block merges if configured
- publish releases if configured

## What GitHub does NOT do

GitHub Actions does **not**:

- invent test coverage
- write tests for you
- automatically fix bugs
- understand your release risk by itself
- guarantee release stability without explicit workflows and test suites

## What must be built

To make Kilo Code release-stable, SWE-1.5 must build a layered release-hardening system containing:

- static analysis
- type safety
- unit tests
- component/browser tests
- API tests
- VS Code extension tests
- Electron/desktop tests
- Playwright E2E tests
- accessibility checks
- visual regression checks
- package/build verification
- artifact/install smoke tests
- workflow/release pipeline validation
- upgrade/migration/config tests
- performance/stability tests
- failure-injection tests

## Core truth

There is no literal “find every single issue” stack.
There **is** a strongest practical release gauntlet that catches most serious failures before release.

This document defines that gauntlet.

---

# 1. PRIMARY GOAL

Build a release system that makes it difficult for Kilo Code to ship with:

- broken types
- broken imports/exports
- broken builds
- broken VS Code extension activation
- broken Electron/desktop startup
- broken UI flows
- broken API contracts
- broken release artifacts
- broken GitHub workflows
- accessibility regressions
- visual regressions
- missing required files in artifacts
- config migration failures
- cross-platform packaging surprises
- long-run stability issues

---

# 2. NON-NEGOTIABLE RELEASE PRINCIPLES

## Principle 1 — Fail closed

If a required test or gate fails, release must stop.

## Principle 2 — Fast lane and heavy lane

Do not run every expensive suite on every single tiny push.
Use layered workflows:

- PR/push fast gates
- nightly heavy gates
- release candidate gates
- tagged release gates

## Principle 3 — Critical path coverage > vanity coverage

Do not chase useless line coverage numbers while missing real release risks.
Focus on:

- startup paths
- activation paths
- core commands
- session/prompt/runtime flows
- artifact correctness
- install/startup smoke paths
- cross-system integration

## Principle 4 — Production-like verification

The release system must validate actual built outputs, not only source code.

## Principle 5 — Cross-platform truth

If the product supports multiple OS targets, release confidence requires multi-OS validation.

## Principle 6 — One source of truth

The release/testing system must align with the corpus and real repo structure.
No fake paths, no outdated assumptions, no guessed output folders.

---

# 3. REQUIRED TEST FAMILIES

This section defines the full release-hardening stack.

## FAMILY A — REPO HEALTH / STATIC SAFETY

### A1. Install integrity

Goal:

- verify dependency install works cleanly
- verify lockfile/workspace state is coherent

Required checks:

- clean install from lockfile
- workspace resolution
- dependency script health

### A2. Type checking

Primary tools:

- TypeScript compiler
- package-level typecheck tasks

Goal:

- catch broken interfaces and invalid refactors before runtime

Required checks:

- root typecheck
- package-specific typecheck
- extension and desktop typecheck if separate

### A3. Linting

Primary tool:

- ESLint

Goal:

- detect unsafe patterns, obvious errors, dead imports, maintainability problems

Required checks:

- root lint
- package lint where needed
- import/order and unused checks if configured

### A4. Formatting verification

Goal:

- keep diffs clean and reduce avoidable review noise

Required checks:

- format check only
- no auto-format in CI, only verification

## FAMILY B — LOGIC TESTING

### B1. Unit tests

Primary tool:

- Vitest

Goal:

- validate isolated logic
- validate utilities
- validate parsers
- validate config transforms
- validate prompt/session helper logic

Required targets:

- utility modules
- parser/transform layers
- state helpers
- provider selection logic
- config normalization
- workflow helper functions if present

### B2. Branch/edge-case tests

Goal:

- explicitly cover failure branches, null handling, retry logic, malformed inputs

Required targets:

- malformed config
- provider failure paths
- empty input behavior
- retry/recovery conditions
- unexpected user state

## FAMILY C — UI / COMPONENT TESTING

### C1. Component rendering tests

Primary tools:

- Vitest browser mode and/or component testing setup

Goal:

- verify components render correctly in browser-like conditions
- validate props/state behavior
- catch broken event wiring at component level

Required targets:

- settings panels
- dialogs/modals
- input components
- provider selectors
- command surfaces
- status/error components

### C2. UI event tests

Goal:

- validate click/change/toggle/input behavior
- validate state transitions
- validate disabled/loading/error states

Required targets:

- settings save/apply/reset
- command buttons
- quick actions
- flow triggers
- error dialogs

## FAMILY D — API / BACKEND CONTRACT TESTING

### D1. API tests

Primary tools:

- Playwright APIRequestContext or equivalent HTTP-level tests

Goal:

- validate endpoint behavior without requiring full UI flows

Required targets:

- status/health endpoints
- backend task routes
- provider routes
- session endpoints
- config endpoints if exposed
- gateway endpoints if relevant

### D2. Contract/schema validation

Goal:

- detect drift in request/response formats

Required targets:

- JSON payload shape
- required fields
- optional fields
- error responses
- backwards compatibility where applicable

## FAMILY E — PLAYWRIGHT END-TO-END TESTING

### E1. Browser smoke flows

Primary tool:

- Playwright

Goal:

- fast confidence on most critical user journeys

Required flows:

- app loads
- core shell renders
- settings can open
- key command path can be triggered
- basic session/prompt flow starts successfully
- basic error banner path works

### E2. Full E2E journeys

Goal:

- validate real user workflows across multiple screens and states

Required flows:

- create/open project/workspace
- run main command flow
- edit settings
- trigger provider selection path
- verify session history or output behavior
- verify retry/recovery path
- verify failure UI path

### E3. Multi-browser coverage

Goal:

- catch browser-specific issues for web/UI surfaces

Required browsers:

- Chromium minimum
- optionally Firefox/WebKit for broader confidence if product surface needs it

## FAMILY F — ACCESSIBILITY TESTING

### F1. Accessibility smoke checks

Primary tools:

- Playwright + axe integration or equivalent

Goal:

- catch common accessibility defects early

Required checks:

- key screens
- settings screen
- dialogs
- main workflow screens
- form controls

### F2. Keyboard/focus testing

Goal:

- validate focus order, tab access, keyboard reachability, modal trapping

Required targets:

- settings
- dialogs
- main command surfaces
- provider selectors
- actionable lists/buttons

## FAMILY G — VISUAL REGRESSION TESTING

### G1. Screenshot baselines

Primary tool:

- Playwright screenshot assertions

Goal:

- catch layout, clipping, spacing, theme, icon, and overflow regressions

Required targets:

- main shell
- settings pages
- dialogs
- session panels
- output panes
- key state variations (loading/error/populated)

### G2. Multi-state visual coverage

Goal:

- verify not just happy-path appearance, but states

Required states:

- empty
- loading
- success
- error
- long text
- disabled
- selected/active
- compact/narrow viewport if relevant

## FAMILY H — VS CODE EXTENSION TESTING

### H1. Extension activation tests

Primary tool:

- @vscode/test-electron

Goal:

- verify extension loads and activates correctly in a real extension development host

Required targets:

- activation event(s)
- command registration
- config registration
- startup path
- failure path when environment incomplete

### H2. Command integration tests

Goal:

- verify commands can be invoked and behave correctly

Required targets:

- core commands
- settings commands
- session commands
- quick-action commands
- feature-specific commands

### H3. Web extension tests

Primary tool:

- @vscode/test-web

Goal:

- validate web-extension compatibility when applicable

## FAMILY I — ELECTRON / DESKTOP TESTING

### I1. Desktop startup smoke tests

Primary tool:

- Playwright Electron mode or equivalent Electron automation

Goal:

- validate the packaged or dev desktop app launches successfully

Required targets:

- app start
- window created
- basic UI visible
- preload works
- no startup crash

### I2. Desktop interaction tests

Goal:

- validate important desktop-specific flows

Required targets:

- menu actions if present
- window lifecycle
- IPC-backed actions
- settings interactions
- file/open/save path if desktop uses them

### I3. Desktop package smoke tests

Goal:

- verify built desktop artifacts actually run

## FAMILY J — BUILD / PACKAGE / ARTIFACT VALIDATION

### J1. Build validation

Goal:

- ensure all supported products build successfully

Required targets:

- extension build/package
- desktop build/package
- backend build
- UI build
- CLI build if present

### J2. Artifact content validation

Goal:

- verify built outputs include required files and exclude obvious junk

Required checks:

- expected binaries/files present
- package metadata present
- README/license if required
- no broken output path assumptions

### J3. Installer/package verification

Goal:

- ensure the thing users download is valid

Required targets:

- VSIX installability
- desktop package presence/launchability
- zip/tar source package integrity if released

## FAMILY K — GITHUB ACTIONS / RELEASE PIPELINE VALIDATION

### K1. Workflow syntax and path validation

Goal:

- verify workflows reference real scripts/files/paths

Required checks:

- workflow files exist
- referenced scripts exist
- artifact paths exist
- package paths exist
- matrix targets are valid

### K2. Release dry runs

Goal:

- validate packaging/release logic before real public release

Required checks:

- build
- package
- upload artifacts
- verify artifact names/locations
- verify tag/release conditions

### K3. Secrets/signing validation

Goal:

- explicitly document and verify missing release prerequisites

Required checks:

- required secrets documented
- missing secrets fail clearly
- signing expectations documented
- release jobs gated appropriately

## FAMILY L — CONFIG / MIGRATION / COMPATIBILITY TESTING

### L1. Config compatibility tests

Goal:

- prevent releases from breaking existing user config

Required targets:

- default config
- old config versions
- partial config
- malformed config
- missing fields
- deprecated fields

### L2. Workspace/project compatibility tests

Goal:

- verify known workspace shapes do not break startup/flows

Required targets:

- empty workspace
- standard workspace
- large workspace
- missing expected files
- read-only or limited-permission workspace if relevant

## FAMILY M — PERFORMANCE / STABILITY TESTING

### M1. Startup timing checks

Goal:

- catch severe startup regressions

Required targets:

- extension activation time
- desktop launch time
- main UI ready time

### M2. Long-session soak tests

Goal:

- detect memory leaks, hangs, cumulative degradation

Required targets:

- repeated session start/stop
- repeated command runs
- prolonged open window state
- repeated settings changes

### M3. Stress/parallel tests

Goal:

- validate behavior under repeated or concurrent actions where relevant

## FAMILY N — FAILURE INJECTION / RESILIENCE TESTING

### N1. Network/provider failure tests

Goal:

- verify graceful handling of external failures

Required targets:

- provider timeout
- provider error response
- provider unavailable
- malformed provider payload

### N2. File/system failure tests

Goal:

- verify handling of missing files, denied access, corrupted state

Required targets:

- missing config
- corrupted config
- read-only paths
- missing workspace files
- invalid cache/state

### N3. Retry/recovery tests

Goal:

- verify fallback and retry logic is not broken or infinite

## FAMILY O — OBSERVABILITY / FAILURE FORENSICS

### O1. Failure artifact capture

Goal:

- every critical CI/E2E failure must leave evidence

Required artifacts:

- screenshots
- traces
- logs
- videos where useful
- packaged test reports

### O2. Human-readable reports

Goal:

- make failures actionable quickly

## FAMILY P — RELEASE READINESS GOVERNANCE

### P1. Merge gates

Goal:

- prevent breaking code from landing

Required:

- required checks on PR
- branch protection aligned with core workflows

### P2. Release gates

Goal:

- prevent unstable releases from shipping

Required:

- release candidate workflow
- final release workflow
- artifact verification
- no publish unless all required gates pass

### P3. Post-build manual review points

Goal:

- reserve human judgment for the few things automation cannot fully decide

Required:

- review visual diffs
- review release notes
- review signing/package outputs
- approve release candidate

---

# 4. COMPLETE TOOL STACK

Recommended stack:

## Core tools

- TypeScript compiler
- ESLint
- Prettier or equivalent format checker if already used
- Vitest
- Playwright
- @vscode/test-electron
- @vscode/test-web if applicable
- Playwright Electron testing support or equivalent desktop automation
- GitHub Actions
- artifact validation scripts
- fixture libraries for config/workspace/failure scenarios

## Optional reinforcement tools

Use only if justified by repo needs:

- coverage reporters
- schema validators
- dependency graph analyzers
- workflow linters
- release notes automation
- package integrity scripts

---

# 5. HOW MANY TEST TYPES / TOOLS OVERALL

## Major test families

This pack defines **16 major families**:
A through P.

## Concrete practical gates/tools/check classes

In actual execution, this usually expands to roughly **30–45 distinct checks/jobs/scripts** depending on how the repo is split.

That is enough to build a very strong release gauntlet.

---

# 6. REQUIRED WORKFLOW LANES

## LANE 1 — PR / PUSH FAST GATE

Purpose:

- catch common breakage quickly
- keep CI reasonably fast
- block obvious bad merges

Required jobs:

1. install
2. typecheck
3. lint
4. format check
5. core unit tests
6. minimal component/browser tests
7. minimal API smoke tests if fast
8. extension activation smoke
9. desktop startup smoke if feasible
10. basic build checks
11. artifact existence validation
12. upload failure artifacts

## LANE 2 — NIGHTLY / HEAVY VALIDATION

Purpose:

- run expensive suites without punishing every small PR

Required jobs:

1. full unit matrix
2. full component/browser tests
3. full Playwright E2E
4. accessibility suite
5. visual regression suite
6. desktop interaction suite
7. VS Code command integration suite
8. config migration suite
9. failure injection suite
10. soak/stability suite
11. cross-platform matrix where appropriate
12. artifact/report upload

## LANE 3 — RELEASE CANDIDATE GATE

Purpose:

- simulate release without publishing publicly

Required jobs:

1. clean install
2. typecheck
3. lint
4. unit tests
5. component/browser tests
6. API tests
7. extension integration tests
8. Electron/desktop tests
9. full Playwright E2E
10. accessibility checks
11. visual checks
12. build/package all required outputs
13. workflow path validation
14. artifact validation
15. install/smoke tests on built outputs
16. release readiness report
17. upload all artifacts
18. block if anything fails

## LANE 4 — TAGGED RELEASE / PUBLISH GATE

Purpose:

- publish only after release candidate quality exists

Required jobs:

1. verify tag/release conditions
2. rebuild or reuse validated artifacts according to policy
3. verify required secrets/signing prerequisites
4. publish artifacts
5. attach release assets
6. generate release summary
7. record checksums/integrity data if used

---

# 7. IMPLEMENTATION PHASE PLAN FOR WINDSURF SWE-1.5

## PHASE 0 — DISCOVERY + MAPPING

Objective:
Understand current repo scripts, workflows, package layout, extension layout, desktop layout, and current test coverage before changing anything.

Mandatory tasks:

- inspect root package scripts
- inspect workspace config
- inspect existing `.github/workflows`
- inspect extension test state
- inspect desktop build/package state
- inspect current unit test state
- inspect current Playwright/Vitest presence
- inspect artifact paths
- inspect release scripts
- inspect current failures / missing pieces

Required deliverables:

- release-hardening gap report
- script inventory
- workflow inventory
- test inventory
- build output inventory

Hard rules:

- do not rewrite everything blindly
- do not introduce duplicate test frameworks unless justified
- prefer extending existing good structure

## PHASE 1 — FAST GATE FOUNDATION

Objective:
Make the PR/push path safe first.

Mandatory implementation:

- install job
- typecheck job
- lint job
- format check job
- root/core unit tests
- basic build validation
- basic artifact-on-failure support

Required deliverables:

- stable CI fast lane
- required check names suitable for branch protection

Completion criteria:

- PR fast gate is green on a known-good branch
- failures are understandable
- runtime is reasonable

## PHASE 2 — UNIT + COMPONENT TEST EXPANSION

Objective:
Build logic confidence and component confidence.

Mandatory implementation:

- Vitest configuration cleanup/standardization
- unit coverage for critical logic
- browser/component tests for critical UI components
- edge-case tests for known risky logic

Required targets:

- session logic
- prompt logic
- config logic
- provider selection
- core utilities
- settings UI components

## PHASE 3 — PLAYWRIGHT SMOKE + CORE E2E

Objective:
Cover real user flows.

Mandatory implementation:

- Playwright base config
- local/CI setup
- smoke flow suite
- one or more core end-to-end journeys
- failure artifact capture

Required flows:

- startup/load
- open settings
- modify/save settings or equivalent
- trigger core command/session flow
- verify visible success/failure result
- verify recovery/error path

## PHASE 4 — VS CODE EXTENSION INTEGRATION TESTING

Objective:
Make sure the extension actually works in a real host.

Mandatory implementation:

- extension integration harness
- activation tests
- command tests
- settings/config registration tests
- test workspace fixtures

## PHASE 5 — ELECTRON / DESKTOP TESTING

Objective:
Validate desktop-specific startup and interactions.

Mandatory implementation:

- desktop smoke launch
- basic interaction path
- package smoke path after build
- failure artifact capture

## PHASE 6 — ACCESSIBILITY + VISUAL + API HARDENING

Objective:
Catch subtle but serious regressions.

Mandatory implementation:

- a11y suite for key screens
- visual baselines for critical screens/states
- API/contract suite for backend routes
- deterministic mocks where needed

## PHASE 7 — ARTIFACT / WORKFLOW / RELEASE PIPELINE VALIDATION

Objective:
Ensure release mechanics are correct.

Mandatory implementation:

- workflow-to-path validation
- artifact path validation
- package/install smoke checks
- release dry run workflow
- secrets/signing requirement checks

## PHASE 8 — MIGRATION / PERFORMANCE / RESILIENCE

Objective:
Catch real-world failures missed by normal happy-path suites.

Mandatory implementation:

- config migration fixtures
- corrupted/missing config tests
- provider failure/retry tests
- startup timing guardrails
- long-run/soak tests where realistic

## PHASE 9 — GOVERNANCE + MERGE/RELEASE ENFORCEMENT

Objective:
Make the system actually protect the repo.

Mandatory implementation:

- required PR checks list
- branch protection recommendations
- release-candidate policy
- publish gate policy
- documentation for maintainers

---

# 8. EXACT DELIVERABLES SWE-1.5 MUST PRODUCE

## A. Repo configuration deliverables

- root scripts for test/build/check orchestration
- package-level scripts as needed
- shared config files for Vitest/Playwright/etc.
- test fixtures directories
- helper utilities for CI/reports

## B. Workflow deliverables

- PR/push fast gate workflow
- nightly heavy workflow
- release candidate workflow
- tagged release/publish workflow
- artifact upload/failure evidence behavior

## C. Test deliverables

- unit tests
- edge-case tests
- browser/component tests
- Playwright smoke specs
- Playwright full E2E specs
- accessibility tests
- visual tests
- API tests
- extension integration tests
- desktop tests
- migration/resilience/perf tests

## D. Validation deliverables

- artifact path validator
- workflow path validator
- release readiness checklist
- required checks list
- failure triage instructions

## E. Documentation deliverables

- test strategy doc
- CI workflow map
- release candidate runbook
- artifact validation guide
- maintainer quickstart

---

# 9. STRICT RULES FOR SWE-1.5

## Rule 1

Do not introduce a second competing framework when an existing good framework can be expanded.

## Rule 2

Do not create tests that only verify implementation trivia and miss user-visible risk.

## Rule 3

Do not claim “100% coverage” as literal bug-proofing.

## Rule 4

Do not leave flaky tests untreated.
Any flaky test must be:

- fixed
- quarantined with explicit reason
- or removed/reworked

## Rule 5

Do not make workflows so slow that the team stops trusting or running them.

## Rule 6

Do not put all jobs in one giant workflow if separation improves clarity and speed.

## Rule 7

Do not publish releases from unvalidated artifacts.

## Rule 8

Do not silently skip OS-specific checks if release targets include those OSes.

## Rule 9

Do not mark release-ready until artifact, startup, and install smoke tests pass.

## Rule 10

Always produce actionable failure output:

- exact failed step
- exact failed file/test/spec
- exact artifact path if relevant

---

# 10. MERGE GATE POLICY

Recommended required PR checks:

- install
- typecheck
- lint
- format check
- unit tests
- minimal component/browser tests
- extension activation smoke
- basic build/package validation
- minimal Playwright smoke
- artifact/failure upload on fail

Optional depending on runtime budget:

- minimal desktop smoke

No PR merge should be allowed if required checks fail.

---

# 11. RELEASE GATE POLICY

A release candidate may only be considered healthy if all of these pass:

- clean install
- typecheck
- lint
- unit tests
- component tests
- API tests
- extension integration tests
- desktop tests
- full Playwright E2E
- accessibility suite
- visual suite
- build/package all artifacts
- artifact validation
- install/startup smoke
- workflow path validation
- release-readiness review

A public release may only occur after release-candidate success.

---

# 12. FAILURE ARTIFACT POLICY

On failure, always collect:

- screenshots for UI failures
- traces for Playwright failures
- logs for extension/desktop failures
- built artifacts when packaging fails late
- test reports
- coverage/report summaries where helpful

Artifacts must be uploaded in CI and retained long enough to investigate.

---

# 13. WHAT “MOST STABLE RELEASE” ACTUALLY MEANS

For this project, the strongest realistic meaning is:

- core code is type-safe
- critical logic is unit-tested
- critical UI is component-tested
- core user journeys are E2E-tested
- extension activates and commands work
- desktop launches and basic flows work
- accessibility violations are checked
- visual drift is checked
- API contracts are checked
- builds/package paths are validated
- release artifacts exist and launch
- workflows reference real paths
- migration/config breakage is tested
- major failure/recovery paths are tested
- release is blocked on failure

That is the target.

---

# 14. WHAT SWE-1.5 SHOULD NOT WASTE TIME ON FIRST

Do NOT begin by:

- trying to hit arbitrary 100% line coverage across everything
- building a perfect visual suite before smoke tests exist
- building a huge nightly before PR fast gate is stable
- creating giant brittle E2E specs before smaller smoke paths work
- overcomplicating secrets/signing before build/package correctness exists
- adding many extra tools if Vitest + Playwright + extension/Electron tooling already cover the main risk

---

# 15. REQUIRED FIRST PASS PRIORITY ORDER

Use this order:

1. script/workflow inventory
2. fast gate CI
3. typecheck/lint/build stabilization
4. core unit tests
5. Playwright smoke tests
6. extension activation tests
7. artifact validation
8. release candidate workflow
9. component/browser tests
10. desktop tests
11. API tests
12. accessibility tests
13. visual tests
14. migration tests
15. resilience/performance/soak tests
16. publish gate hardening

---

# 16. WINDSURF SWE-1.5 EXECUTION INSTRUCTION BLOCK

```text
TASK TYPE: COMPLETE RELEASE HARDENING + TEST KIT IMPLEMENTATION

OBJECTIVE:
Design and implement the strongest practical release-hardening and test system for Kilo Code using the existing repo structure, existing scripts/workflows where useful, and the recommended layered stack in this document.

PRIMARY GOALS:
1. Stabilize PR/push fast gate
2. Add strong automated coverage for logic, UI, API, extension, desktop, and release mechanics
3. Create release-candidate and publish gates that prevent unstable releases

MANDATORY TOOLING DIRECTION:
- TypeScript typecheck
- ESLint
- Vitest for unit/logic/component-level coverage
- Playwright for E2E/API/a11y/visual where appropriate
- @vscode/test-electron for VS Code extension integration
- desktop/Electron automation for desktop startup/interactions
- GitHub Actions for workflow enforcement

MANDATORY IMPLEMENTATION ORDER:
Phase 0 Discovery + Mapping
Phase 1 Fast Gate Foundation
Phase 2 Unit + Component Expansion
Phase 3 Playwright Smoke + Core E2E
Phase 4 VS Code Extension Integration
Phase 5 Electron/Desktop Testing
Phase 6 Accessibility + Visual + API Hardening
Phase 7 Artifact / Workflow / Release Pipeline Validation
Phase 8 Migration / Performance / Resilience
Phase 9 Governance + Merge/Release Enforcement

MANDATORY RULES:
- Do not claim literal bug-proof 100% certainty
- Do not skip phases
- Do not create duplicate/conflicting frameworks unnecessarily
- Do not leave workflows referencing non-existent paths
- Do not publish from unvalidated artifacts
- Do not leave flaky tests unresolved without explicit quarantine reasoning
- Prefer extending existing good structure over replacing everything
- Produce maintainable scripts/workflows, not one-off hacks

REQUIRED OUTPUTS:
- updated scripts/configs
- updated or new GitHub workflows
- test suites across all required families
- artifact validation scripts
- release candidate workflow
- maintainer documentation
- clear report of what is complete, what remains, and what gates now exist

DEFINITION OF DONE:
Done means Kilo Code has a layered release gauntlet with fast PR checks, heavy/nightly validation, release-candidate validation, and publish gating, covering core logic, critical UI, API contracts, VS Code extension behavior, desktop behavior, artifacts, workflows, and release readiness.

Do not stop at partial coverage if critical release-risk areas remain untested.
```

---

# 17. FINAL DELIVERABLE CHECKLIST

Before SWE-1.5 claims completion, all of these must be answered with a specific artifact, workflow, script, or suite.

- Is clean install verified?
- Is typecheck enforced?
- Is lint enforced?
- Is format check enforced?
- Are critical unit tests in place?
- Are critical edge-case tests in place?
- Are component/browser tests in place?
- Are Playwright smoke flows in place?
- Are core E2E journeys in place?
- Are accessibility tests in place?
- Are visual regression tests in place?
- Are API tests in place?
- Are VS Code extension activation/command tests in place?
- Are desktop startup/interaction tests in place?
- Are build/package checks in place?
- Are artifact validators in place?
- Are workflow path validators in place?
- Are release candidate workflows in place?
- Are install/startup smoke tests on built outputs in place?
- Are migration/config compatibility tests in place?
- Are failure/retry/resilience tests in place?
- Are performance/stability checks in place?
- Are PR merge gates documented?
- Are release publish gates documented?
- Are failure artifacts uploaded in CI?
- Is maintainer documentation produced?

If any answer is no, the release system is not complete.

---

# 18. BOTTOM LINE

The best action plan is **not**:

- blindly pushing and hoping GitHub fixes it
- immediately publishing releases
- trying to solve everything in one giant workflow

The best action plan is:

- build the layered full test kit
- wire it into staged GitHub Actions gates
- use fast checks for PRs
- use heavy checks for nightly/release candidates
- use publish workflows only after the release gauntlet passes

That is how Kilo Code gets its most stable practical release.
