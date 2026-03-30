# Build Triage and Rerun Rules

## First failing signal wins

Always fix the first meaningful failure from the build, not the deepest stack frame.

## Per-failure capture

- package
- file
- plugin/tool name
- exact stack excerpt
- whether it is bundler, transform, or runtime-prebuild
