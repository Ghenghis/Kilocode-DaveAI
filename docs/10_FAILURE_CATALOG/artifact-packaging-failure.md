# Artifact Packaging Failure

This document defines how to identify, classify, and fix this failure class.

## Symptoms
Document the exact command, screen, or provider path where the failure appears.

## Likely causes
List concrete root-cause hypotheses, not vague guesses.

## Evidence to capture
- command
- file path
- log excerpt
- screenshot/trace if UI-related
- owner package

## Fix strategy
Fix the root cause only. Rerun the exact failing path before expanding scope.

## Do not do this
- do not suppress the error
- do not broad-rewrite adjacent code
- do not mark complete without rerun evidence
