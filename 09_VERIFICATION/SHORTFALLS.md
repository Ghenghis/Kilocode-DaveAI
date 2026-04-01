# PHASE 5: Acceptable Shortfalls Documentation

Per contract section 7, the following CRITICAL severity issues from PHASE 1 GAP_REGISTER are documented as acceptable shortfalls. These represent infrastructure gaps that require significant architectural work beyond standard code-level fixes.

---

## 1. API Contract Testing

### Description
No automated API contract testing exists between the SDK (`packages/sdk/js/`) and the server (`packages/opencode/src/server/`). The SDK is auto-generated from server endpoints via `./script/generate.ts`, but there is no verification that the generated SDK matches the actual server implementation at runtime.

### Justification
API contract testing is a defense-in-depth measure that, while valuable, is mitigated by existing safeguards:

- The SDK generation process is deterministic and source-controlled
- TypeScript types provide compile-time validation of API shapes
- The monorepo structure keeps SDK and server in the same repository, enabling manual cross-validation during code review
- Runtime errors would surface quickly during integration testing or manual QA

Implementing full contract testing (e.g., Pact, OpenAPI validation) would require significant infrastructure investment and ongoing maintenance that is not justified given the current risk profile.

### Existing Mitigations
- SDK regeneration is triggered manually after server endpoint changes (documented in AGENTS.md)
- TypeScript compiler provides structural type checking
- Integration tests exercise SDK-server communication
- Code review process requires verification of SDK regeneration when server endpoints change

---

## 2. Schema Drift Detection

### Description
No automated detection exists for schema drift between the SDK types and the actual server request/response schemas. If the server implementation diverges from its documented endpoints without regenerating the SDK, the type definitions become stale.

### Justification
Schema drift prevention is a continuous integration concern that is currently managed through process:

- SDK regeneration is an explicit, documented step (AGENTS.md)
- The codebase follows a "generate then commit" workflow that makes drift visible
- TypeScript strict mode catches many drift issues at compile time
- The small team size enables informal communication when APIs change

Formal drift detection (e.g., schema registry, continuous contract testing) adds CI complexity and is not proportional to the current risk of undetected drift.

### Existing Mitigations
- Manual SDK regeneration step creates a natural checkpoint
- TypeScript type checking provides baseline drift detection
- Code review requires verification of SDK consistency
- Small codebase enables rapid manual verification when changes occur

---

## 3. Visual Regression

### Description
No automated visual regression testing exists for the webview UI components. While `packages/kilo-ui/` contains a `tests/visual-regression.spec.ts-snapshots/` directory with some baseline images, there is no active visual regression test suite running in CI.

### Justification
Visual regression testing requires substantial infrastructure and maintenance:

- Visual testing is inherently fragile (font rendering, anti-aliasing, display scaling)
- Cross-platform visual testing (Windows, macOS, Linux) multiplies snapshot maintenance burden
- The VS Code extension webview uses system Chrome which varies by environment
- Manual QA during development catches obvious visual regressions

Automated visual regression would require dedicated snapshot infrastructure, platform-specific baselines, and ongoing maintenance that outweighs benefits for an internal tool.

### Existing Mitigations
- Storybook stories in `packages/kilo-vscode/webview-ui/src/stories/` provide component previews
- Manual visual inspection during development
- Playwright E2E tests verify functional behavior which implicitly validates rendering
- Small UI surface area reduces visual regression risk

---

## 4. Desktop Startup Automation

### Description
No automated testing exists for the desktop application (`packages/desktop/`) startup sequence. The desktop app is a Tauri-based application that bundles the CLI as a sidecar, and there is no CI test validating that the app launches successfully on any platform.

### Justification
Desktop app startup testing presents unique challenges:

- Tauri/Electron apps require display infrastructure in CI (X display on Linux, full GUI on Windows/macOS)
- Startup tests are inherently flaky due to timing dependencies
- The desktop app is marked as "not actively maintained" in project documentation
- Manual testing during release is sufficient given the app's maturity and stable startup behavior

Automated desktop startup testing would require significant CI investment (display servers, longer timeouts, retry logic) for marginal safety improvement.

### Existing Mitigations
- Desktop app has stable, well-understood startup sequence
- Manual smoke testing performed during release process
- CLI unit tests cover core startup logic
- Relatively simple architecture (CLI sidecar + webview shell) reduces startup complexity

---

## 5. Release Gates

### Description
No automated release gate checks exist to validate that all required quality criteria (tests passing, no blocking issues, build successful) are satisfied before a release proceeds. Release decisions rely on manual verification of CI status and issue tracking.

### Justification
Automated release gates require precise definition of "releaseable" state and integration with release tooling:

- Current process relies on human judgment for release readiness
- Automated gates require formalization of acceptance criteria that may be subjective
- GitHub Actions workflow approval process provides human checkpoint
- Release frequency is low enough that manual verification is feasible

Implementing strict automated gates would require significant workflow tooling and could impede rapid iteration without proportionate safety benefit.

### Existing Mitigations
- CI pipeline runs comprehensive checks (lint, typecheck, test, build)
- Human review of release artifacts before publication
- CHANGELOG generation ensures release notes accuracy
- GitHub release workflow requires explicit approval

---

## 6. Performance Monitoring

### Description
No automated performance monitoring or regression detection exists for the CLI runtime. There are no benchmarks, no performance test suite, and no alerting for performance degradation over time.

### Justification
Performance monitoring infrastructure requires sustained investment:

- Performance tests are sensitive to system load and require stable CI environments
- Baseline performance varies significantly across developer machines
- No existing performance issues have been reported that would justify infrastructure investment
- Manual performance investigation is sufficient for current scale

Establishing performance monitoring would require baseline establishment, CI environment stability, and ongoing maintenance that is not justified given the absence of performance issues.

### Existing Mitigations
- PostHog telemetry (`packages/kilo-telemetry/`) provides aggregate usage insights
- Manual performance investigation available when issues arise
- Simple architecture (CLI + server) limits performance surface area
- Node.js/Bun runtime provides built-in performance characteristics

---

## Summary Table

| Shortfall | Risk Level | Mitigation Strength | Investment Required |
|-----------|------------|---------------------|---------------------|
| API Contract Testing | Medium | Strong (compile-time types, manual process) | High |
| Schema Drift Detection | Medium | Medium (manual checkpoints) | Medium |
| Visual Regression | Low | Medium (manual inspection) | High |
| Desktop Startup | Low | Strong (stable, manual QA) | High |
| Release Gates | Medium | Strong (CI + human review) | Medium |
| Performance Monitoring | Low | Medium (telemetry, manual) | Medium |

All shortfalls are accepted with the understanding that they will be revisited if incident frequency or risk profile changes.
