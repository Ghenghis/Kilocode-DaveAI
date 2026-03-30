# Kilo Code Architecture

## Overview

Kilo Code is an AI-powered coding agent built as a monorepo using Turborepo and Bun workspaces. It provides code generation, inline autocomplete, task automation, and automated refactoring through a VS Code extension, CLI, and desktop application.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Kilo Code                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  VS Code     │  │    CLI       │  │   Desktop    │               │
│  │  Extension   │  │  (kilo)      │  │   App        │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
│         │                 │                 │                        │
│         └────────┬────────┴────────┬────────┘                        │
│                  │                 │                                 │
│                  ▼                 ▼                                  │
│         ┌──────────────────────────────┐                            │
│         │     @kilocode/cli           │                            │
│         │   (packages/opencode/)      │                            │
│         │                              │                            │
│         │  ┌──────────────────────┐  │                            │
│         │  │   AI Agent Runtime   │  │                            │
│         │  │   - Session Manager   │  │                            │
│         │  │   - Tool Executor    │  │                            │
│         │  │   - MCP Client       │  │                            │
│         │  └──────────────────────┘  │                            │
│         │                              │                            │
│         │  ┌──────────────────────┐  │                            │
│         │  │   HTTP Server        │  │                            │
│         │  │   + SSE Streaming    │  │                            │
│         │  └──────────────────────┘  │                            │
│         │                              │                            │
│         │  ┌──────────────────────┐  │                            │
│         │  │   TUI Interface     │  │                            │
│         │  └──────────────────────┘  │                            │
│         └──────────────────────────────┘                            │
│                           │                                          │
│                           ▼                                          │
│         ┌──────────────────────────────┐                            │
│         │     @kilocode/sdk           │                            │
│         │   (Auto-generated TS SDK)    │                            │
│         └──────────────────────────────┘                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Packages

### packages/opencode/ - @kilocode/cli

The core CLI package containing:

- **Agent Runtime**: AI agent that generates code, runs commands, and automates tasks
- **Session Manager**: Manages multiple concurrent coding sessions with git worktree isolation
- **Tool Executor**: Executes tools (edit, write, bash, web search, etc.)
- **MCP Client**: Model Context Protocol client for extending capabilities
- **HTTP Server**: REST API server with SSE streaming for real-time updates
- **TUI**: Terminal User Interface for CLI usage

### packages/kilo-vscode/ - kilo-code

VS Code extension that:

- Provides sidebar chat interface
- Integrates CLI as child process
- Implements Agent Manager for multi-session orchestration
- Supports git worktree isolation per session

### packages/sdk/js/ - @kilocode/sdk

Auto-generated TypeScript SDK for the server API. Generated from OpenAPI specs in `packages/opencode/src/server/`.

### packages/kilo-ui/ - @kilocode/kilo-ui

SolidJS component library shared by:

- VS Code extension webview
- Desktop app
- Web app

### packages/kilo-gateway/ - @kilocode/kilo-gateway

Kilo-specific gateway handling:

- Authentication
- Provider routing
- API integration

### packages/kilo-telemetry/ - @kilocode/kilo-telemetry

- PostHog analytics
- OpenTelemetry tracing

### packages/kilo-i18n/ - @kilocode/kilo-i18n

Internationalization with 15+ locale translations.

## Data Flow

### CLI Execution Flow

```
User Input (natural language)
        │
        ▼
┌───────────────────┐
│   CLI Parser      │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   Session Manager │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   AI Agent       │◄────► @kilocode/sdk
│   (LLM calls)    │      (Server API)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   Tool Executor  │
│  - Edit          │
│  - Bash          │
│  - WebSearch     │
│  - ...           │
└───────────────────┘
        │
        ▼
File System / Commands
```

### VS Code Extension Flow

```
VS Code User
      │
      ▼
┌───────────────────┐
│ Webview UI       │◄────► VS Code API
└───────────────────┘
      │
      ▼
┌───────────────────┐
│ KiloProvider     │◄────► @kilocode/sdk
│ (IPC Bridge)     │      (Server API)
└───────────────────┘
      │
      ▼
┌───────────────────┐
│ kilo serve       │
│ (Child Process)  │
└───────────────────┘
```

## Agent Manager

The Agent Manager enables multiple concurrent coding sessions, each isolated in its own git worktree:

```
┌────────────────────────────────────────────┐
│           Agent Manager                     │
│                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │ Session  │  │ Session  │  │ Session  ││
│  │ A        │  │ B        │  │ C        ││
│  │ (worktree)│  │ (worktree)│  │ (worktree)││
│  └──────────┘  └──────────┘  └──────────┘│
│                                            │
└────────────────────────────────────────────┘
```

## Security Model

- **Workspace Isolation**: Each session operates in an isolated git worktree
- **File Access Control**: FileIgnoreController prevents access outside workspace
- **Permission System**: Permission queue for sensitive operations
- **Secret Handling**: Environment variable management with `.env` file support

## Platform Support

| Platform      | CLI | VS Code Extension | Desktop App |
| ------------- | --- | ----------------- | ----------- |
| Linux x64     | ✅  | ✅                | ✅          |
| Linux arm64   | ✅  | ✅                | ✅          |
| macOS x64     | ✅  | ✅                | ✅          |
| macOS arm64   | ✅  | ✅                | ✅          |
| Windows x64   | ✅  | ✅                | ✅          |
| Windows arm64 | ✅  | ✅                | ✅          |

## Build System

- **Runtime**: Bun 1.3.10+
- **Build Tool**: Turborepo 2.8+
- **Bundler**: esbuild (via Bun)
- **Testing**: Bun test + Playwright
- **Type Checking**: tsgo (TypeScript Go)

## Release Process

Releases are fully automated via GitHub Actions:

1. Version bump computation
2. Build CLI for all platforms
3. Build VSIX for all platforms
4. Publish to npm, VS Code Marketplace, Docker Hub, AUR, Homebrew

See [RELEASING.md](../RELEASING.md) for details.
