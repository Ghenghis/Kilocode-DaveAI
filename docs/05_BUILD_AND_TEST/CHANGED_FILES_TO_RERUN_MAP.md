# Changed Files to Rerun Map

## Why this exists
Agents must not rerun the entire universe after every tiny change.

## Policy
For each patch, map changed files to:
- package-level test command
- unit test file(s)
- Playwright subset if UI-visible
- provider validation if backend/provider-visible
- release workflow rerun if packaging-affecting
