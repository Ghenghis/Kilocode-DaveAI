# Repo Audit Findings

## High-value corrections applied
- normalized root scripts for lint/typecheck/unit/build/release entrypoints
- corrected Bun cache key to use `bun.lock`
- added release-hardening docs
- added missing GitHub Actions workflows for CI, E2E, release, reproducibility

## Remaining manual review items
- verify whether `AgentManagerApp.tsx` should exist as a real source file
- verify release secrets for GitHub Actions (`BOT_PAT`, signing certs, Azure secrets, etc.)
- verify provider registry wiring paths in actual source modules before claiming full runtime readiness
