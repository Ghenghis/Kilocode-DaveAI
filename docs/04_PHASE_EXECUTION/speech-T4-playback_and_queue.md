# Speech Phase T4 — Playback and Queue

This document isolates the speech/TTS work so it can be finished without contaminating unrelated subsystems.

## Goal

Finish and prove playback and queue with explicit provider-aware evidence.

## Required surfaces

Expected surfaces include:

- speech settings schema/types
- secure secret handling
- provider registry definitions
- discovery service
- playback/queue/controller
- stream/player utils
- speech UI tab and message contracts
- artifact packet generation
- Playwright coverage

## Runtime truth

Speech is not proven until:

- real provider health path is checked
- UI displays provider state accurately
- stop/test/fallback are visible and functional
- issue/proof/failure packets are emitted

## Failure classes

Classify failures as one of:

- config schema mismatch
- missing secret
- invalid Azure region/key
- local endpoint unreachable
- unsupported voice/model
- autoplay restriction
- UI event not wired
- playback overlap
- fallback not logged

## Pass criteria

The speech phase is green only when the relevant provider and UI behavior have both been validated and captured.
