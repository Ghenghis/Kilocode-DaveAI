# Provider Validation Guide

## Azure TTS

1. Store key in secret storage only.
2. Validate region/endpoint pair.
3. Run provider healthcheck.
4. Attempt synthesis with short phrase.
5. Confirm provider-health packet and UI state.
6. Force invalid key and verify failure packet.

## Stock speech

1. Enable stock provider.
2. Trigger short utterance.
3. Verify speech synthesis event and stop path.
4. Verify fallback from provider error to stock when configured.

## Local provider

1. Validate base URL/port and timeout.
2. Run discovery scan.
3. Trigger short synthesis.
4. Verify online/offline badge and failure packet behavior.

## Acceptance rule

No provider is counted healthy unless:

- healthcheck passes,
- UI reflects healthy state,
- failure path also tested,
- packet output is recorded.
