# KiloCode Exclusion Policies

This document outlines the files and folders that should be excluded from version control to maintain a clean, focused codebase.

## Exclusion Categories

### 1. Analysis and Reverse Engineering Folders

These folders contain detailed analysis artifacts that are not part of the core codebase:

- `KILO_CODE_REVERSE_ENGINEERING_CORPUS/` - Complete reverse engineering analysis
- `EXECUTION_COMPLETION/` - Execution completion documentation and checklists
- `.dave/` - Dave AI agent configuration and analysis data

### 2. Development Notes and Version Manifests

Temporary documentation and version-specific notes:

- `START_V*_FROM_HERE.md` - Version start instructions
- `V*_*.md` - Version-specific notes and manifests
- `V*_*.json` - Version configuration files

**Note**: These files have been cleaned up and removed from the repository as they were outdated.

### 3. Archive and Backup Files

Compressed archives and backups:

- `*.zip` - ZIP archives
- `*.tar.gz` - Compressed tar archives
- `*.rar` - RAR archives
- `*.7z` - 7-Zip archives

### 4. Local Configuration and State

User-specific configuration and runtime state:

- `.opencode/` - OpenCode local configuration
- `opencode-dev` - Development build outputs
- `opencode.json` - Local OpenCode configuration

### 5. Standard Development Exclusions

Already covered in .gitignore but worth noting:

- `node_modules/` - Dependencies
- `dist/`, `ts-dist/` - Build outputs
- `.turbo` - Turborepo cache
- `logs/` - Log files
- `tmp/` - Temporary files

## Rationale

These exclusions ensure:

1. **Clean Repository**: Only essential source code is tracked
2. **Developer Privacy**: Local configurations remain private
3. **Reduced Noise**: Analysis artifacts don't clutter the main codebase
4. **Consistent Builds**: Generated files are rebuilt rather than tracked

## Adding New Exclusions

When adding new exclusions:

1. Consider if the file is generated or user-specific
2. Use pattern matching for similar files (`V*_*.md`)
3. Document the rationale in this file
4. Test that exclusions don't break development workflows

## Review Process

Review these exclusions quarterly or when:

- New analysis tools are introduced
- Development workflow changes
- New file types are added to the project

## Exceptions

If a file in an excluded category needs to be tracked:

1. Use `git add -f` to force inclusion
2. Document the exception in this file
3. Consider if the file should be moved to a different location
