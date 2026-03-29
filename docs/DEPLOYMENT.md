# Deployment Guide

## Overview

Kilo Code can be deployed in multiple configurations:
- **Cloud**: Using Kilo's hosted services
- **Self-hosted**: Running your own infrastructure

## Installation Methods

### npm (Recommended for CLI)

```bash
# Install globally
npm install -g @kilocode/cli

# Or run with npx
npx @kilocode/cli
```

### GitHub Releases

Download pre-built binaries from [Releases](https://github.com/Kilo-Org/kilocode/releases):

| Platform | Architecture | File |
|----------|--------------|------|
| Windows | x64 | `kilo-windows-x64.zip` |
| Windows | x64-baseline | `kilo-windows-x64-baseline.zip` |
| Linux | x64 (glibc) | `kilo-linux-x64.tar.gz` |
| Linux | x64 (musl) | `kilo-linux-x64-musl.tar.gz` |
| Linux | arm64 (glibc) | `kilo-linux-arm64.tar.gz` |
| Linux | arm64 (musl) | `kilo-linux-arm64-musl.tar.gz` |
| macOS | x64 | `kilo-darwin-x64.zip` |
| macOS | arm64 | `kilo-darwin-arm64.zip` |

### VS Code Extension

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=kilocode.Kilo-Code).

## Self-Hosted Deployment

### Prerequisites

- Bun 1.3.10+ (for development)
- Node.js 18+ (for production)
- Git

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `KILO_API_URL` | `https://api.kilo.ai` | Kilo API endpoint |
| `KILO_SESSION_INGEST_URL` | `https://ingest.kilosessions.ai` | Session export endpoint |
| `KILO_MODELS_URL` | `https://models.dev` | Model metadata endpoint |

### CLI Deployment

1. Download the appropriate binary for your platform
2. Extract to a directory in your PATH
3. Run `kilo --version` to verify

```bash
# Linux/macOS
tar -xzf kilo-linux-x64.tar.gz
sudo mv kilo /usr/local/bin/

# Windows
# Extract zip to a directory in your PATH
```

### Docker Deployment

```dockerfile
FROM ghcr.io/kilo-org/kilo:latest

# Or build your own
FROM oven/bun:1-alpine
RUN bun install -g @kilocode/cli
CMD ["kilo"]
```

### VS Code Extension Deployment

For enterprise deployment, the VSIX can be distributed via:

1. **VS Code Admin Policies** - Deploy via enterprise VS Code settings
2. **Internal Extension Gallery** - Host your own extension gallery

```bash
# Download VSIX
curl -L -o kilo-vscode.vsix https://github.com/Kilo-Org/kilocode/releases/latest/download/kilo-vscode-win32-x64.vsix

# Install manually
code --install-extension kilo-vscode.vsix
```

## Cloud Configuration

### Using Kilo API (Default)

No configuration needed - uses Kilo's hosted services.

### Custom Backend

Point to your own Kilo API server:

```bash
KILO_API_URL=http://localhost:3000 kilo run "your task"
```

### Enterprise Setup

For enterprise deployments with custom auth:

```bash
# Set up authentication
KILO_API_KEY=your-api-key
KILO_ORG_ID=your-org-id
KILO_API_URL=https://api.your-enterprise.com
```

## Kubernetes Deployment

### CLI Deployment

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kilo-config
data:
  KILO_API_URL: "https://api.kilo.ai"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kilo-cli
spec:
  replicas: 1
  template:
    spec:
      containers:
        - name: kilo
          image: ghcr.io/kilo-org/kilo:latest
          envFrom:
            - configMapRef:
                name: kilo-config
          env:
            - name: KILO_API_KEY
              secretRef:
                name: kilo-secrets
```

### VS Code Extension Enterprise

Deploy via VS Code's administrative settings:

```json
{
  "extensions.autoUpdate": false,
  "extensions.enabledExtensions": ["kilocode.Kilo-Code"],
  "kilo.apiKey": "your-api-key"
}
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Install Kilo
  run: npm install -g @kilocode/cli

- name: Run Kilo
  env:
    KILO_API_KEY: ${{ secrets.KILO_API_KEY }}
  run: kilo run --auto "review and fix tests"
```

### Autonomous Mode

Use `--auto` flag for fully autonomous operation in CI:

```bash
kilo run --auto "run tests and fix any failures"
```

## Platform-Specific Notes

### Windows

- Use `kilo.exe` or add to PATH
- PowerShell recommended for best experience
- VS Code extension works with VS Code Insiders

### Linux

- Desktop integration available for GNOME/KDE
- AppImage also available for portable installation

### macOS

- Works with both Intel and Apple Silicon
- Notarize for Gatekeeper compatibility

## Health Checks

Verify your deployment:

```bash
# Check CLI
kilo --version

# Check API connectivity
kilo doctor

# Test authentication
kilo auth status
```

## Troubleshooting

### Installation Issues

**npm permission error:**
```bash
npm install -g @kilocode/cli --unsafe-perm
```

**Binary not found:**
Ensure the binary is in your PATH.

### Connection Issues

**API unreachable:**
```bash
KILO_API_URL=https://api.kilo.ai kilo doctor
```

**Authentication failed:**
```bash
kilo auth login
```

## Updates

```bash
# CLI
npm update -g @kilocode/cli

# VS Code Extension
code --update-extensions
```
