# Install and Workspace Proof

## Purpose

Prove the repo can install in a clean environment.

## Required checks

- package manager version
- lockfile consistency
- workspace package resolution
- restored packages folder completeness
- postinstall hooks

## Artifacts

- install stdout/stderr log
- environment summary
- issue packet if install fails
- blocker packet if workspace graph is broken

## Common failures

- missing package path
- mismatched lockfile
- stale workspace reference
- unsupported native dependency
