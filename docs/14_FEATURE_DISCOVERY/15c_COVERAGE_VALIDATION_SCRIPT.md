# Documentation Coverage Validation Script

**Script:** validate-coverage.ts  
**Version:** 1.0  
**Created:** 2026-03-29  
**Purpose:** Automated 100% documentation coverage validation

---

## Validation Script

```typescript
// scripts/validate-coverage.ts

interface ValidationResult {
  category: string
  total: number
  documented: number
  coverage: number
  missing: MissingItem[]
}

interface MissingItem {
  file: string
  reason: string
  priority: "HIGH" | "MEDIUM" | "LOW"
}

interface CoverageReport {
  timestamp: string
  totalFiles: number
  documentedFiles: number
  overallCoverage: number
  byCategory: ValidationResult[]
  criticalGaps: MissingItem[]
}

const CATEGORIES = {
  UI_COMPONENTS: {
    paths: [
      "packages/kilo-vscode/webview-ui/src/**/*.ts",
      "packages/kilo-vscode/webview-ui/src/**/*.tsx",
      "packages/kilo-ui/src/**/*.ts",
      "packages/kilo-ui/src/**/*.tsx",
      "packages/ui/src/**/*.ts",
      "packages/ui/src/**/*.tsx",
    ],
    exclude: ["*.test.ts", "*.test.tsx", "*.stories.tsx"],
    outputDir: "Source/UI/",
  },
  BACKEND_SERVICES: {
    paths: ["packages/opencode/src/**/*.ts", "packages/opencode/src/**/*.tsx"],
    exclude: ["*.test.ts"],
    outputDir: "Source/ENGINE/",
  },
  SDK_API: {
    paths: ["packages/sdk/**/*.ts", "packages/opencode/src/server/**/*.ts"],
    exclude: ["src/gen/**"],
    outputDir: "Source/WIRING/SDK/",
  },
  DESKTOP: {
    paths: ["packages/desktop-electron/**/*.ts", "packages/desktop/src/**/*.ts"],
    exclude: ["*.test.ts"],
    outputDir: "Source/DESKTOP/",
  },
  INFRASTRUCTURE: {
    paths: [".github/**/*", "github/**/*", "scripts/**/*", "nix/**/*"],
    exclude: [],
    outputDir: "Source/OPERATIONS/",
  },
  TESTS: {
    paths: ["packages/**/test/**/*", "packages/**/tests/**/*"],
    exclude: [],
    outputDir: "Source/OPERATIONS/TESTING/",
  },
} as const

const REQUIRED_DIAGRAMS = {
  "Source/SYSTEM/": ["system-overview.svg", "dependency-map.svg"],
  "Source/WIRING/": ["middleware-chain.svg", "api-endpoints.svg"],
  "Source/UI/": ["reactive-flow.svg", "component-tree.svg"],
  "Source/ENGINE/": ["agent-runtime.svg", "planning-loop.svg"],
  "Source/DESKTOP/": ["electron-architecture.svg", "tauri-commands.svg"],
  "Source/OPERATIONS/": ["ci-pipeline.svg", "build-flow.svg"],
}

async function scanSourceFiles(pattern: string, exclude: string[]): Promise<string[]> {
  // Implementation using glob
  const files = await Bun.file(pattern).text()
  return files.split("\n").filter((f) => f && !exclude.some((e) => f.includes(e)))
}

async function checkDocumentationExists(file: string, outputDir: string): Promise<boolean> {
  const docName = file
    .replace(/\.ts$/, ".md")
    .replace(/\.tsx$/, ".md")
    .split("/")
    .pop()

  const docPath = `${outputDir}${docName}`
  try {
    await Bun.file(docPath)
    return true
  } catch {
    return false
  }
}

function generateCoverageReport(results: ValidationResult[]): CoverageReport {
  const totalFiles = results.reduce((sum, r) => sum + r.total, 0)
  const documentedFiles = results.reduce((sum, r) => sum + r.documented, 0)

  return {
    timestamp: new Date().toISOString(),
    totalFiles,
    documentedFiles,
    overallCoverage: (documentedFiles / totalFiles) * 100,
    byCategory: results,
    criticalGaps: results
      .flatMap((r) => r.missing)
      .filter((m) => m.priority === "HIGH")
      .slice(0, 20),
  }
}

async function validateCoverage(): Promise<CoverageReport> {
  const results: ValidationResult[] = []

  for (const [category, config] of Object.entries(CATEGORIES)) {
    const files: string[] = []

    for (const pattern of config.paths) {
      const matched = await scanSourceFiles(pattern, config.exclude)
      files.push(...matched)
    }

    const documented = await Promise.all(files.map((f) => checkDocumentationExists(f, config.outputDir)))

    const documentedCount = documented.filter(Boolean).length
    const missing = files
      .filter((_, i) => !documented[i])
      .map((f) => ({
        file: f,
        reason: "No corresponding markdown documentation",
        priority: "HIGH" as const,
      }))

    results.push({
      category,
      total: files.length,
      documented: documentedCount,
      coverage: files.length ? (documentedCount / files.length) * 100 : 0,
      missing,
    })
  }

  return generateCoverageReport(results)
}

async function validateDiagrams(): Promise<ValidationResult> {
  const missing: MissingItem[] = []

  for (const [dir, diagrams] of Object.entries(REQUIRED_DIAGRAMS)) {
    for (const diagram of diagrams) {
      const path = `${dir}${diagram}`
      try {
        await Bun.file(path)
      } catch {
        missing.push({
          file: path,
          reason: "Required diagram missing",
          priority: "HIGH",
        })
      }
    }
  }

  const total = Object.values(REQUIRED_DIAGRAMS).flat().length
  return {
    category: "DIAGRAMS",
    total,
    documented: total - missing.length,
    coverage: ((total - missing.length) / total) * 100,
    missing,
  }
}

function printReport(report: CoverageReport): void {
  console.log("=".repeat(80))
  console.log("DOCUMENTATION COVERAGE REPORT")
  console.log("=".repeat(80))
  console.log(`Generated: ${report.timestamp}`)
  console.log(`Overall Coverage: ${report.overallCoverage.toFixed(2)}%`)
  console.log(`Total Files: ${report.totalFiles}`)
  console.log(`Documented: ${report.documentedFiles}`)
  console.log(`Missing: ${report.totalFiles - report.documentedFiles}`)
  console.log("")
  console.log("BY CATEGORY:")
  console.log("-".repeat(80))

  for (const result of report.byCategory) {
    const bar = "█".repeat(Math.floor(result.coverage / 5)) + "░".repeat(20 - Math.floor(result.coverage / 5))
    console.log(`${result.category}: ${bar} ${result.coverage.toFixed(1)}% (${result.documented}/${result.total})`)
  }

  console.log("")
  console.log("CRITICAL GAPS:")
  console.log("-".repeat(80))

  for (const gap of report.criticalGaps) {
    console.log(`[${gap.priority}] ${gap.file}`)
    console.log(`  Reason: ${gap.reason}`)
  }

  console.log("=".repeat(80))
}

// Run validation
const coverageReport = await validateCoverage()
const diagramReport = await validateDiagrams()

coverageReport.byCategory.push(diagramReport)
coverageReport.totalFiles += diagramReport.total
coverageReport.documentedFiles += diagramReport.documented

printReport(coverageReport)

// Exit with error code if coverage < 100%
if (coverageReport.overallCoverage < 100) {
  console.error(`\nERROR: Coverage is ${coverageReport.overallCoverage.toFixed(2)}%, target is 100%`)
  process.exit(1)
}
```

---

## Coverage Requirements

### File Documentation Requirements

| Type                 | Requirement              |
| -------------------- | ------------------------ |
| TypeScript/TSX Files | 1 markdown per file      |
| Configuration        | 1 markdown per config    |
| API Endpoints        | 1 markdown per endpoint  |
| Components           | 1 markdown per component |
| Hooks                | 1 markdown per hook      |
| Utilities            | 1 markdown per utility   |

### Diagram Requirements

| Category   | Required Diagrams                     |
| ---------- | ------------------------------------- |
| System     | system-overview, dependency-map       |
| Wiring     | middleware-chain, api-endpoints       |
| UI         | reactive-flow, component-tree         |
| Engine     | agent-runtime, planning-loop          |
| Desktop    | electron-architecture, tauri-commands |
| Operations | ci-pipeline, build-flow               |

### Content Requirements

Each markdown must contain:

- YAML frontmatter with metadata
- Description of the documented item
- Code references with links
- Usage examples
- Related documentation links
- Cross-references to related files

---

## Validation Checklist

### Pre-Deployment

- [ ] All source files identified
- [ ] All categories mapped
- [ ] Required diagrams listed
- [ ] Validation script tested

### Post-Documentation

- [ ] Run validation script
- [ ] Review missing items
- [ ] Address critical gaps
- [ ] Verify 100% coverage
- [ ] Generate final report

---

_Document Version: 1.0_  
_Status: READY FOR USE_
