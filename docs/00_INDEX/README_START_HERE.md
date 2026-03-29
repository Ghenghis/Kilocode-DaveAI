# V18.2 Massive Markdown Execution Docs

This pack is a documentation-first execution layer for agents finishing the remaining KiloCode/Dave work. It is built to reduce the remaining work to deterministic run/fix/rerun loops. It does not falsely claim that runtime proof already happened.

## What this pack is for
Use this pack when you want agents to:
- restore the canonical repo tree
- finish remaining wiring without broad rewrites
- run build, typecheck, unit, Playwright, provider validation, and release workflows
- log every failure as an issue packet
- keep one writer only
- enforce fail-closed behavior
- produce release-ready documentation for GitHub

This pack is intentionally documentation-heavy. The goal is to remove ambiguity.

## Read order
1. `00_INDEX/MASTER_INDEX.md`
2. `01_MASTER_ACTION_PLAN/V18_2_MASTER_ACTION_PLAN.md`
3. `02_CANONICAL_REPO/V18_2_CANONICAL_REPO_LAYOUT.md`
4. `03_AGENT_OPERATING_CONTRACT/V18_2_AGENT_OPERATING_CONTRACT.md`
5. `04_PHASE_EXECUTION/`
6. `05_BUILD_AND_TEST/`
7. `06_PLAYWRIGHT_AND_VISUAL_E2E/`
8. `07_PROVIDER_RUNTIME_VALIDATION/`
9. `08_UI_WIRING_VALIDATION/`
10. `09_RELEASE_AND_ACTIONS/`
11. `10_FAILURE_CATALOG/`
12. `11_PACKET_TEMPLATES/`
13. `12_REMAINING_WORK/V18_2_REMAINING_WORK_MASTER.md`

## Hard rules
- One writer only.
- No phase jump.
- No broad rewrite.
- No fake completion language.
- No merge without proof artifacts.
- No release without build, test, E2E, provider, and artifact evidence.
- No unresolved blocker packet at release signoff.
