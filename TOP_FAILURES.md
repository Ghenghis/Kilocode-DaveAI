# TOP_FAILURES.md

## Priority Failure Report - Top 10 Critical Issues

Based on corpus gap analysis (08_GAP_ANALYSIS/) and runtime audit findings.

---

## CRITICAL GAPS (Must Fix Immediately)

### GAP-CRIT-001: Session Prompt Assembly Validation

**Rank: 1** | **Risk Level: CRITICAL** | **Layer: Backend**

**Why it matters:**
Prompt injection vulnerabilities can lead to:

- Malicious code execution
- Data exfiltration
- Unauthorized file access
- Privilege escalation

**Corpus Evidence:**

- `08_GAP_ANALYSIS/gap-analysis-summary.json` - "Session Prompt Assembly Validation" listed as critical
- `05_RUNTIME_FLOWS/SESSION_LIFECYCLE.md` - No mention of prompt validation

**Likely Cause:**
No input sanitization on user messages before assembly into LLM prompts.

**Target Files:**
| File | Issue |
|------|-------|
| `packages/opencode/src/session/prompt.ts` | Missing prompt injection checks |
| `packages/opencode/src/session/message-v2.ts` | Message schema lacks validation |
| `packages/opencode/src/tool/read.ts` | Tool results not sanitized before prompt inclusion |

**Fix Approach:**

1. Add allowlist-based sanitization in `prompt.ts`
2. Validate all tool outputs before inclusion
3. Add test coverage for injection payloads

---

### GAP-CRIT-002: Provider Fallback Chain Testing

**Rank: 2** | **Risk Level: CRITICAL** | **Layer: Provider**

**Why it matters:**
If the primary provider fails and fallback is broken, the entire system becomes unavailable.

**Corpus Evidence:**

- `06_FEATURE_MAPS/feature-map-summary.json` - provider_routing marked CRITICAL
- `07_DEPENDENCY_INTELLIGENCE/coupling-hotspots.md` - Provider ↔ Server tight coupling

**Likely Cause:**
Fallback chain implemented but never tested with provider outages.

**Target Files:**
| File | Issue |
|------|-------|
| `packages/opencode/src/provider/provider.ts` | Fallback logic untested |
| `packages/kilo-gateway/src/provider.ts` | Kilo provider fallback missing |
| `packages/opencode/src/config/config.ts` | `MODEL_FALLBACK_ORDER` not validated |

**Fix Approach:**

1. Add integration tests with provider mocking
2. Verify fallback chain with `MODEL_FALLBACK_ORDER` config
3. Add timeout handling between providers

---

### GAP-CRIT-003: IPC Message Contract Validation

**Rank: 3** | **Risk Level: CRITICAL** | **Layer: UI/Backend**

**Why it matters:**
Schema mismatches between extension and webview cause runtime errors, silent failures, and unpredictable UI behavior.

**Corpus Evidence:**

- `08_GAP_ANALYSIS/gap-analysis-summary.json` - "IPC Message Contract Validation" listed as critical
- `06_FEATURE_MAPS/ui-control-to-handler-matrix.json` - 7,345 handler entries, no contract validation

**Likely Cause:**
Message types in `messages.ts` (50,624 chars) evolved without versioning or schema validation.

**Target Files:**
| File | Issue |
|------|-------|
| `packages/kilo-vscode/webview-ui/src/types/messages.ts` | No schema validation |
| `packages/kilo-vscode/src/extension.ts` | Message handlers lack validation |
| `packages/kilo-vscode/src/services/cli-backend/connection-service.ts` | No contract testing |

**Fix Approach:**

1. Add JSON Schema validation for all message types
2. Implement message versioning
3. Add integration tests for message contracts

---

### GAP-CRIT-004: Tool Permission Boundary Testing

**Rank: 4** | **Risk Level: CRITICAL** | **Layer: Backend**

**Why it matters:**
Security boundary violations could allow:

- Unauthorized file system access
- Shell command execution without approval
- Data exfiltration

**Corpus Evidence:**

- `08_GAP_ANALYSIS/portability-risks.json` - 23 high-severity portability risks identified
- `packages/opencode/src/tool/registry.ts` - Permission checks exist but untested

**High Severity Risk Files (from corpus):**
| File | Risks |
|------|-------|
| `packages/app/e2e/actions.ts` | exec, fs_unsafe |
| `packages/kilo-vscode/src/agent-manager/GitOps.ts` | exec, process_env, fs_unsafe |
| `packages/kilo-vscode/src/agent-manager/git-transfer.ts` | exec, fs_unsafe |
| `packages/kilo-vscode/src/agent-manager/shell-env.ts` | exec, process_env |

**Likely Cause:**
Permission system exists (`ctx.ask()`) but boundary conditions not tested.

**Target Files:**
| File | Issue |
|------|-------|
| `packages/opencode/src/tool/bash.ts` | Shell permission boundary |
| `packages/opencode/src/tool/write.ts` | File write permission boundary |
| `packages/opencode/src/tool/edit.ts` | File edit permission boundary |
| `packages/opencode/src/tool/registry.ts` | Permission filtering not tested |

**Fix Approach:**

1. Add permission boundary tests for all tools
2. Test `ctx.ask()` flow with various approval/denial scenarios
3. Verify external directory blocking works correctly

---

## HIGH PRIORITY FAILURES

### GAP-HIGH-001: Config Validation Gaps

**Rank: 5** | **Risk Level: HIGH** | **Layer: Backend**

**Why it matters:**
Invalid config causes silent failures or cryptic errors.

**Corpus Evidence:**

- `09_INTEGRATION_PATTERNS/CONFIG_RUNTIME_INTEGRATION.md` - "No Startup Validation" listed
- `06_FEATURE_MAPS/config-schema-map.json` - 67 config files, no schema enforcement

**Likely Cause:**
Config read from multiple sources (env, file, runtime API) with no unified validation.

**Target Files:**
| File | Issue |
|------|-------|
| `packages/opencode/src/config/config.ts` | No JSON schema validation |
| `packages/opencode/src/bun/index.ts` | Env vars not validated |
| `packages/sdk/js/src/client.ts` | Config propagation not validated |

**Fix Approach:**

1. Add JSON Schema for all config options
2. Validate at startup, fail fast on invalid config
3. Add migration path for config format changes

---

### GAP-HIGH-002: Database Migration Failure Risk

**Rank: 6** | **Risk Level: HIGH** | **Layer: Backend**

**Why it matters:**
Database migration failures can cause data loss or corruption.

**Corpus Evidence:**

- `10_DEPLOYMENT_INTELLIGENCE/RELEASE_BLOCKERS.md` - "Database Migration Failure" scored 4.0/5
- `packages/opencode/src/storage/db.ts` - SQLite with Drizzle ORM

**Likely Cause:**
No backup before migration, no rollback mechanism.

**Target Files:**
| File | Issue |
|------|-------|
| `packages/opencode/src/storage/db.ts` | No backup before migration |
| `packages/opencode/src/storage/json-migration.ts` | Migration logic fragile |

**Fix Approach:**

1. Add automatic backup before migration
2. Implement rollback mechanism
3. Add migration testing

---

### GAP-HIGH-003: Session Message History Overflow

**Rank: 7** | **Risk Level: HIGH** | **Layer: Backend**

**Why it matters:**
Exceeding message limits causes session failures mid-conversation.

**Corpus Evidence:**

- `05_RUNTIME_FLOWS/SESSION_LIFECYCLE.md` - "10,000 max messages, 1M max tokens, 50MB max attachment"
- No overflow handling detected in corpus

**Likely Cause:**
Compaction exists but may not trigger before hitting limits.

**Target Files:**
| File | Issue |
|------|-------|
| `packages/opencode/src/session/compaction.ts` | Compaction trigger threshold unclear |
| `packages/opencode/src/session/message-v2.ts` | No pre-send validation |
| `packages/opencode/src/session/processor.ts` | Error handling for overflow missing |

**Fix Approach:**

1. Add pre-send validation with clear error messages
2. Verify compaction triggers before limits
3. Add user notification when approaching limits

---

## MEDIUM PRIORITY FAILURES

### GAP-MEDIUM-001: Authentication Organization Selection Bypass

**Rank: 8** | **Risk Level: MEDIUM** | **Layer: Auth**

**Why it matters:**
Multi-organization users cannot select their organization, causing auth failures or wrong account usage.

**Corpus Evidence:**

- `09_INTEGRATION_PATTERNS/PROVIDER_INTEGRATION.md` - Organization handling not documented
- `packages/kilo-gateway/src/auth/device-auth-tui.ts` - `organizationId = undefined` hardcoded

**Likely Cause:**
TUI flow designed for personal accounts only.

**Target Files:**
| File | Issue |
|------|-------|
| `packages/kilo-gateway/src/auth/device-auth-tui.ts` | Organization selection missing |

**Fix Approach:**

1. Add organization selection prompt in TUI flow
2. Store selected organization in config
3. Pass organization to `getKiloDefaultModel()`

---

### GAP-MEDIUM-002: Telemetry Privacy Issues

**Rank: 9** | **Risk Level: MEDIUM** | **Layer: Telemetry**

**Why it matters:**
Sensitive data may be captured in telemetry, violating privacy.

**Corpus Evidence:**

- `08_GAP_ANALYSIS/gap-analysis-summary.json` - "Privacy issue with telemetry" listed
- `packages/kilo-telemetry/src/otel-exporter.ts` - Filters exist but may miss sensitive fields

**Likely Cause:**
Filter patterns may not catch all sensitive attributes.

**Target Files:**
| File | Issue |
|------|-------|
| `packages/kilo-telemetry/src/otel-exporter.ts` | Sensitive field filtering incomplete |
| `packages/kilo-telemetry/src/tracer.ts` | Span attributes not fully sanitized |

**Fix Approach:**

1. Audit all span attributes for sensitive data
2. Add redaction for file paths, tokens, API keys
3. Add privacy review process

---

### GAP-MEDIUM-003: Test Coverage Gaps

**Rank: 10** | **Risk Level: MEDIUM** | **Layer: Testing**

**Why it matters:**
2,000 files lack test coverage, leading to undetected regressions.

**Corpus Evidence:**

- `08_GAP_ANALYSIS/gap-analysis-summary.json` - "2,000 missing test coverage"
- `08_TEST_COVERAGE/gap-analysis-summary.json` - "Overall coverage: 40%"

**Likely Cause:**
Tests added ad-hoc, no coverage enforcement in CI.

**Target Files:**
| Category | Files Needing Tests |
|----------|---------------------|
| `packages/app/e2e/` | Most e2e test files |
| `packages/app/src/components/` | Dialog components, session components |
| `packages/app/src/context/` | Context providers and stores |

**Fix Approach:**

1. Enforce coverage thresholds in CI (e.g., 80%)
2. Add integration tests for critical paths
3. Use corpus to prioritize test coverage

---

## Summary by Layer

| Layer         | Critical | High | Medium | Total |
| ------------- | -------- | ---- | ------ | ----- |
| **Backend**   | 3        | 2    | 1      | 6     |
| **UI**        | 1        | 0    | 1      | 2     |
| **Provider**  | 1        | 0    | 0      | 1     |
| **Auth**      | 0        | 0    | 1      | 1     |
| **Telemetry** | 0        | 0    | 1      | 1     |
| **Testing**   | 0        | 0    | 1      | 1     |

---

## Recommended Fix Order

1. **GAP-CRIT-003** (IPC Message Contract) - Easiest to validate fix
2. **GAP-CRIT-004** (Tool Permission Boundary) - Security critical
3. **GAP-CRIT-001** (Session Prompt Assembly) - Security critical
4. **GAP-CRIT-002** (Provider Fallback) - Availability critical
5. **GAP-MEDIUM-001** (Auth Organization) - User impact high
6. **GAP-HIGH-003** (Session Overflow) - Reliability
7. **GAP-HIGH-001** (Config Validation) - Developer experience
8. **GAP-HIGH-002** (Database Migration) - Data safety
9. **GAP-MEDIUM-002** (Telemetry Privacy) - Compliance
10. **GAP-MEDIUM-003** (Test Coverage) - Technical debt
