# Phase 09 — Release Artifacts and Actions

This phase document defines the exact goal, inputs, commands, evidence, stop rules, and pass criteria for Phase 09.

## Goal
Complete the work specific to release artifacts and actions without expanding scope beyond what the evidence requires.

## Files and surfaces likely touched
Typical surfaces include:
- root scripts and workspace config
- package manifests
- source contracts and provider registry files
- UI/webview message contracts
- test configuration
- GitHub workflow files
Agents must update this section with exact files once the real failure is known.

## Commands
Run only the phase-relevant commands.
Capture stdout/stderr to artifacts.
Do not batch unrelated commands into one giant run if that obscures the first failing signal.

## Evidence required
- issue packets for failures
- rerun logs
- changed-files list
- screenshots or traces when UI-related
- proof packet when the phase turns green

## Stop rules
Stop if:
- errors increase after a patch
- the same command fails differently without explanation
- an adjacent subsystem is accidentally broken
- evidence becomes ambiguous

## Pass criteria
A phase passes only when:
- the phase command(s) are green
- no unresolved blocker packet exists for this phase
- outputs are archived
- next phase dependencies are satisfied
