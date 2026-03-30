#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

const workspaceRoot = process.cwd()

console.log('🔧 Configuring Package Publishing')
console.log('==================================')

// Get current version from package.json
const mainPackageJson = JSON.parse(readFileSync(join(workspaceRoot, 'package.json'), 'utf8'))
const currentVersion = mainPackageJson.version

console.log(`📦 Current version: ${currentVersion}`)

// Packages to configure for publishing
const publishablePackages = [
  {
    name: '@kilocode/cli',
    path: 'packages/opencode',
    description: 'AI-powered development CLI with enterprise features',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    bin: {
      'kilo': 'dist/cli.js'
    },
    files: ['dist/**/*', 'README.md', 'LICENSE'],
    keywords: ['ai', 'cli', 'development', 'automation', 'enterprise'],
    repository: {
      type: 'git',
      url: 'https://github.com/Ghenghis/Kilocode-DaveAI.git',
      directory: 'packages/opencode'
    }
  },
  {
    name: '@kilocode/kilo-gateway',
    path: 'packages/kilo-gateway',
    description: 'API Gateway for Kilo Code services',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    files: ['dist/**/*', 'README.md', 'LICENSE'],
    keywords: ['api', 'gateway', 'microservices', 'routing'],
    repository: {
      type: 'git',
      url: 'https://github.com/Ghenghis/Kilocode-DaveAI.git',
      directory: 'packages/kilo-gateway'
    }
  },
  {
    name: '@kilocode/kilo-telemetry',
    path: 'packages/kilo-telemetry',
    description: 'Telemetry and analytics for Kilo Code',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    files: ['dist/**/*', 'README.md', 'LICENSE'],
    keywords: ['telemetry', 'analytics', 'monitoring', 'metrics'],
    repository: {
      type: 'git',
      url: 'https://github.com/Ghenghis/Kilocode-DaveAI.git',
      directory: 'packages/kilo-telemetry'
    }
  },
  {
    name: '@kilocode/kilo-i18n',
    path: 'packages/kilo-i18n',
    description: 'Internationalization support for Kilo Code',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    files: ['dist/**/*', 'README.md', 'LICENSE', 'locales/**/*'],
    keywords: ['i18n', 'internationalization', 'localization', 'translations'],
    repository: {
      type: 'git',
      url: 'https://github.com/Ghenghis/Kilocode-DaveAI.git',
      directory: 'packages/kilo-i18n'
    }
  },
  {
    name: '@kilocode/plugin',
    path: 'packages/plugin',
    description: 'Plugin system for Kilo Code extensions',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    files: ['dist/**/*', 'README.md', 'LICENSE'],
    keywords: ['plugin', 'extension', 'modular', 'architecture'],
    repository: {
      type: 'git',
      url: 'https://github.com/Ghenghis/Kilocode-DaveAI.git',
      directory: 'packages/plugin'
    }
  },
  {
    name: '@kilocode/util',
    path: 'packages/util',
    description: 'Shared utilities for Kilo Code projects',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    files: ['dist/**/*', 'README.md', 'LICENSE'],
    keywords: ['utilities', 'helpers', 'common', 'shared'],
    repository: {
      type: 'git',
      url: 'https://github.com/Ghenghis/Kilocode-DaveAI.git',
      directory: 'packages/util'
    }
  },
  {
    name: '@kilocode/kilo-ui',
    path: 'packages/kilo-ui',
    description: 'UI component library for Kilo Code',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    files: ['dist/**/*', 'README.md', 'LICENSE'],
    keywords: ['ui', 'components', 'react', 'design-system'],
    repository: {
      type: 'git',
      url: 'https://github.com/Ghenghis/Kilocode-DaveAI.git',
      directory: 'packages/kilo-ui'
    }
  },
  {
    name: '@opencode-ai/app',
    path: 'packages/app',
    description: 'Web application for Kilo Code',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    files: ['dist/**/*', 'public/**/*', 'README.md', 'LICENSE'],
    keywords: ['web', 'app', 'frontend', 'interface'],
    repository: {
      type: 'git',
      url: 'https://github.com/Ghenghis/Kilocode-DaveAI.git',
      directory: 'packages/app'
    }
  },
  {
    name: '@opencode-ai/desktop',
    path: 'packages/desktop',
    description: 'Desktop application built with Tauri',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    files: ['dist/**/*', 'README.md', 'LICENSE'],
    keywords: ['desktop', 'tauri', 'native', 'application'],
    repository: {
      type: 'git',
      url: 'https://github.com/Ghenghis/Kilocode-DaveAI.git',
      directory: 'packages/desktop'
    }
  },
  {
    name: '@opencode-ai/desktop-electron',
    path: 'packages/desktop-electron',
    description: 'Electron-based desktop application',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    files: ['dist/**/*', 'README.md', 'LICENSE'],
    keywords: ['desktop', 'electron', 'native', 'application'],
    repository: {
      type: 'git',
      url: 'https://github.com/Ghenghis/Kilocode-DaveAI.git',
      directory: 'packages/desktop-electron'
    }
  },
  {
    name: '@opencode-ai/storybook',
    path: 'packages/storybook',
    description: 'Storybook for Kilo Code components',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    files: ['dist/**/*', 'stories/**/*', 'README.md', 'LICENSE'],
    keywords: ['storybook', 'components', 'documentation', 'design'],
    repository: {
      type: 'git',
      url: 'https://github.com/Ghenghis/Kilocode-DaveAI.git',
      directory: 'packages/storybook'
    }
  },
  {
    name: '@kilocode/kilo-docs',
    path: 'packages/kilo-docs',
    description: 'Documentation site for Kilo Code',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    files: ['dist/**/*', 'docs/**/*', 'README.md', 'LICENSE'],
    keywords: ['documentation', 'docs', 'site', 'content'],
    repository: {
      type: 'git',
      url: 'https://github.com/Ghenghis/Kilocode-DaveAI.git',
      directory: 'packages/kilo-docs'
    }
  },
  {
    name: '@kilocode/sdk',
    path: 'packages/sdk/js',
    description: 'SDK for Kilo Code integration',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    files: ['dist/**/*', 'README.md', 'LICENSE'],
    keywords: ['sdk', 'api', 'integration', 'client'],
    repository: {
      type: 'git',
      url: 'https://github.com/Ghenghis/Kilocode-DaveAI.git',
      directory: 'packages/sdk/js'
    }
  }
]

// Configure each package
let configuredCount = 0
let errorCount = 0

for (const pkgConfig of publishablePackages) {
  try {
    const packageJsonPath = join(workspaceRoot, pkgConfig.path, 'package.json')
    
    if (!existsSync(packageJsonPath)) {
      console.log(`⚠️  Package.json not found: ${pkgConfig.path}`)
      errorCount++
      continue
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    
    // Update package configuration
    const updatedPackageJson = {
      ...packageJson,
      name: pkgConfig.name,
      version: currentVersion,
      description: pkgConfig.description,
      main: pkgConfig.main,
      types: pkgConfig.types,
      files: pkgConfig.files,
      keywords: pkgConfig.keywords,
      repository: pkgConfig.repository,
      publishConfig: {
        access: 'public'
      },
      engines: {
        node: '>=18.0.0',
        bun: '>=1.0.0'
      },
      scripts: {
        ...packageJson.scripts,
        build: 'bun build src/index.ts --outdir dist --target node',
        dev: 'bun run src/index.ts',
        test: 'bun test',
        lint: 'bun run --bun lint',
        typecheck: 'bun run --bun tsc --noEmit',
        prepublishOnly: 'bun run build && bun run test'
      }
    }

    // Add bin field if applicable
    if (pkgConfig.bin) {
      updatedPackageJson.bin = pkgConfig.bin
    }

    // Write updated package.json
    writeFileSync(packageJsonPath, JSON.stringify(updatedPackageJson, null, 2))
    
    console.log(`✅ Configured: ${pkgConfig.name}`)
    configuredCount++
    
  } catch (error) {
    console.log(`❌ Error configuring ${pkgConfig.name}: ${error.message}`)
    errorCount++
  }
}

// Configure VS Code extension
try {
  const vscodePackageJsonPath = join(workspaceRoot, 'packages/kilo-vscode/package.json')
  
  if (existsSync(vscodePackageJsonPath)) {
    const vscodePackageJson = JSON.parse(readFileSync(vscodePackageJsonPath, 'utf8'))
    
    const updatedVscodePackageJson = {
      ...vscodePackageJson,
      version: currentVersion,
      publisher: 'kilocode',
      repository: {
        type: 'git',
        url: 'https://github.com/Ghenghis/Kilocode-DaveAI.git',
        directory: 'packages/kilo-vscode'
      },
      engines: {
        vscode: '^1.85.0'
      }
    }

    writeFileSync(vscodePackageJsonPath, JSON.stringify(updatedVscodePackageJson, null, 2))
    console.log(`✅ Configured: VS Code Extension`)
    configuredCount++
  }
} catch (error) {
  console.log(`❌ Error configuring VS Code extension: ${error.message}`)
  errorCount++
}

// Create package registry
const packageRegistry = {}
for (const pkgConfig of publishablePackages) {
  packageRegistry[pkgConfig.name] = {
    version: currentVersion,
    description: pkgConfig.description,
    path: pkgConfig.path,
    repository: pkgConfig.repository,
    keywords: pkgConfig.keywords
  }
}

// Add VS Code extension
packageRegistry['kilo-code'] = {
  version: currentVersion,
  description: 'VS Code extension for Kilo Code',
  path: 'packages/kilo-vscode',
  repository: {
    type: 'git',
    url: 'https://github.com/Ghenghis/Kilocode-DaveAI.git',
    directory: 'packages/kilo-vscode'
  },
  keywords: ['vscode', 'extension', 'ai', 'development']
}

writeFileSync(
  join(workspaceRoot, 'package-registry.json'),
  JSON.stringify(packageRegistry, null, 2)
)

console.log(`\n📊 Configuration Summary:`)
console.log(`✅ Successfully configured: ${configuredCount} packages`)
console.log(`❌ Errors: ${errorCount}`)
console.log(`📋 Package registry created: package-registry.json`)
console.log(`\n🚀 Ready for publishing!`)

if (errorCount > 0) {
  console.log(`\n⚠️  Some packages had configuration errors. Please review the logs above.`)
  process.exit(1)
} else {
  console.log(`\n🎉 All packages configured successfully!`)
}
