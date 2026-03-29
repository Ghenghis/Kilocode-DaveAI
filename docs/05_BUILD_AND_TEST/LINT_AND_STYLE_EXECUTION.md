# Lint and Style Execution

## Goal
Catch dead code, style drift, obvious placeholders, and stale imports before typecheck.

## Rules
- fix lint root causes only
- do not mass-format unrelated files during the same patch
- record every autofix step

## Evidence
- lint command
- first error class
- changed-files list
- rerun output
