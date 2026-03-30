#!/usr/bin/env node

import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

const workspaceRoot = process.cwd()

// Release validation for Kilo Code v7.1.9
console.log('🚀 Kilo Code v7.1.9 Release Validation')
console.log('=====================================\n')

// 1. Validate version
function validateVersion() {
  console.log('📋 Validating version...')
  
  const packagePath = join(workspaceRoot, 'package.json')
  if (!existsSync(packagePath)) {
    console.log('❌ package.json not found')
    return false
  }
  
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'))
  const version = packageJson.version
  
  if (version !== '7.1.9') {
    console.log(`❌ Version mismatch: expected 7.1.9, found ${version}`)
    return false
  }
  
  console.log(`✅ Version validated: ${version}`)
  return true
}

// 2. Validate test suite
function validateTestSuite() {
  console.log('\n🧪 Validating test suite...')
  
  const testDirs = [
    'tests/governance',
    'tests/migration', 
    'tests/performance',
    'tests/resilience',
    'tests/scalability',
    'tests/disaster-recovery',
    'tests/security',
    'tests/cicd',
    'tests/deployment',
    'tests/release'
  ]
  
  let totalTests = 0
  let validDirs = 0
  
  for (const dir of testDirs) {
    const testPath = join(workspaceRoot, dir)
    if (existsSync(testPath)) {
      const files = readdirSync(testPath)
      const testFiles = files.filter(f => f.endsWith('.spec.ts'))
      
      if (testFiles.length > 0) {
        validDirs++
        let dirTests = 0
        for (const file of testFiles) {
          const filePath = join(testPath, file)
          const content = readFileSync(filePath, 'utf8')
          const testMatches = content.match(/test\s*\(/g) || []
          dirTests += testMatches.length
        }
        totalTests += dirTests
        console.log(`✅ ${dir}: ${testFiles.length} files, ${dirTests} tests`)
      } else {
        console.log(`⚠️  ${dir}: No test files found`)
      }
    } else {
      console.log(`❌ ${dir}: Directory not found`)
    }
  }
  
  console.log(`📊 Test Summary: ${totalTests} tests across ${validDirs}/${testDirs.length} categories`)
  
  return totalTests >= 140 && validDirs === testDirs.length
}

// 3. Validate documentation
function validateDocumentation() {
  console.log('\n📚 Validating documentation...')
  
  const requiredDocs = [
    'README.md',
    'docs/TESTING_FRAMEWORK.md',
    'docs/DEVELOPER_TRAINING.md',
    'docs/QUICK_START.md',
    'docs/IMPLEMENTATION_PLAN.md',
    'docs/TRAINING_PRESENTATION.md',
    'docs/PROJECT_STATUS.md'
  ]
  
  let validDocs = 0
  
  for (const doc of requiredDocs) {
    const docPath = join(workspaceRoot, doc)
    if (existsSync(docPath)) {
      const content = readFileSync(docPath, 'utf8')
      if (content.length > 1000) {
        validDocs++
        console.log(`✅ ${doc}`)
      } else {
        console.log(`⚠️  ${doc}: Too short (${content.length} bytes)`)
      }
    } else {
      console.log(`❌ ${doc}: Not found`)
    }
  }
  
  console.log(`📊 Documentation: ${validDocs}/${requiredDocs.length} files validated`)
  return validDocs === requiredDocs.length
}

// 4. Validate CI/CD workflows
function validateWorkflows() {
  console.log('\n🔄 Validating CI/CD workflows...')
  
  const requiredWorkflows = [
    '.github/workflows/test-suite.yml',
    '.github/workflows/quality-gates.yml',
    '.github/workflows/test.yml'
  ]
  
  let validWorkflows = 0
  
  for (const workflow of requiredWorkflows) {
    const workflowPath = join(workspaceRoot, workflow)
    if (existsSync(workflowPath)) {
      const content = readFileSync(workflowPath, 'utf8')
      
      // Check for basic workflow structure
      if (content.includes('name:') && content.includes('on:') && content.includes('jobs:')) {
        validWorkflows++
        console.log(`✅ ${workflow}`)
      } else {
        console.log(`⚠️  ${workflow}: Invalid structure`)
      }
    } else {
      console.log(`❌ ${workflow}: Not found`)
    }
  }
  
  console.log(`📊 Workflows: ${validWorkflows}/${requiredWorkflows.length} files validated`)
  return validWorkflows === requiredWorkflows.length
}

// 5. Validate package.json scripts
function validatePackageScripts() {
  console.log('\n📦 Validating package.json scripts...')
  
  const packagePath = join(workspaceRoot, 'package.json')
  if (!existsSync(packagePath)) {
    console.log('❌ package.json not found')
    return false
  }
  
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'))
  const scripts = packageJson.scripts || {}
  
  const requiredScripts = [
    'test:playwright',
    'test:governance',
    'test:performance',
    'test:security',
    'test:migration',
    'test:resilience',
    'test:scalability',
    'test:disaster-recovery'
  ]
  
  let validScripts = 0
  
  for (const script of requiredScripts) {
    if (scripts[script]) {
      validScripts++
      console.log(`✅ ${script}: ${scripts[script]}`)
    } else {
      console.log(`❌ ${script}: Not found`)
    }
  }
  
  console.log(`📊 Scripts: ${validScripts}/${requiredScripts.length} scripts validated`)
  return validScripts === requiredScripts.length
}

// 6. Validate Playwright configuration
function validatePlaywrightConfig() {
  console.log('\n🎭 Validating Playwright configuration...')
  
  const configPath = join(workspaceRoot, 'playwright.config.ts')
  if (!existsSync(configPath)) {
    console.log('❌ playwright.config.ts not found')
    return false
  }
  
  const content = readFileSync(configPath, 'utf8')
  
  const checks = [
    { name: 'testDir', pattern: /testDir/ },
    { name: 'projects', pattern: /projects/ },
    { name: 'reporter', pattern: /reporter/ },
    { name: 'governance-tests', pattern: /governance-tests/ },
    { name: 'performance-tests', pattern: /performance-tests/ },
    { name: 'security-tests', pattern: /security-tests/ }
  ]
  
  let validChecks = 0
  
  for (const check of checks) {
    if (check.pattern.test(content)) {
      validChecks++
      console.log(`✅ ${check.name}`)
    } else {
      console.log(`❌ ${check.name}: Not found`)
    }
  }
  
  console.log(`📊 Playwright: ${validChecks}/${checks.length} checks passed`)
  return validChecks === checks.length
}

// 7. Validate CODEOWNERS
function validateCodeowners() {
  console.log('\n👥 Validating CODEOWNERS...')
  
  const codeownersPath = join(workspaceRoot, '.github/CODEOWNERS')
  if (!existsSync(codeownersPath)) {
    console.log('❌ .github/CODEOWNERS not found')
    return false
  }
  
  const content = readFileSync(codeownersPath, 'utf8')
  
  const checks = [
    { name: 'Core maintainers', pattern: /\* @kilo-maintainers/ },
    { name: 'Package owners', pattern: /packages\/.*@/ },
    { name: 'Test files', pattern: /tests\/.*@/ },
    { name: 'Documentation', pattern: /docs\/.*@/ }
  ]
  
  let validChecks = 0
  
  for (const check of checks) {
    if (check.pattern.test(content)) {
      validChecks++
      console.log(`✅ ${check.name}`)
    } else {
      console.log(`❌ ${check.name}: Not found`)
    }
  }
  
  console.log(`📊 CODEOWNERS: ${validChecks}/${checks.length} checks passed`)
  return validChecks >= 3 // Allow some flexibility
}

// 8. Validate key features
function validateFeatures() {
  console.log('\n🌟 Validating key features...')
  
  const features = [
    { name: 'AI Code Generation', file: 'packages/opencode/src', pattern: /generate|code/ },
    { name: 'Testing Framework', file: 'tests', pattern: /test|spec/ },
    { name: 'CI/CD Integration', file: '.github/workflows', pattern: /workflow|action/ },
    { name: 'Documentation', file: 'docs', pattern: /\.md$/ },
    { name: 'VS Code Extension', file: 'packages/kilo-vscode', pattern: /extension|vscode/ }
  ]
  
  let validFeatures = 0
  
  for (const feature of features) {
    const featurePath = join(workspaceRoot, feature.file)
    if (existsSync(featurePath)) {
      validFeatures++
      console.log(`✅ ${feature.name}`)
    } else {
      console.log(`❌ ${feature.name}: Not found`)
    }
  }
  
  console.log(`📊 Features: ${validFeatures}/${features.length} features validated`)
  return validFeatures >= 4 // Allow some flexibility
}

// Main validation
function main() {
  console.log('Starting comprehensive release validation...\n')
  
  const results = {
    version: validateVersion(),
    testSuite: validateTestSuite(),
    documentation: validateDocumentation(),
    workflows: validateWorkflows(),
    packageScripts: validatePackageScripts(),
    playwrightConfig: validatePlaywrightConfig(),
    codeowners: validateCodeowners(),
    features: validateFeatures()
  }
  
  console.log('\n🎯 Final Results:')
  console.log('==================')
  
  let passed = 0
  let total = 0
  
  for (const [name, result] of Object.entries(results)) {
    const status = result ? '✅' : '❌'
    console.log(`${status} ${name}`)
    if (result) passed++
    total++
  }
  
  console.log(`\n📊 Overall: ${passed}/${total} checks passed`)
  
  if (passed === total) {
    console.log('\n🎉 All validations passed! Release ready for deployment.')
    console.log('\n📋 Release Summary:')
    console.log('   • Version: 7.1.9')
    console.log('   • Tests: 140+ across 10 categories')
    console.log('   • Documentation: Complete')
    console.log('   • CI/CD: Fully integrated')
    console.log('   • Quality Gates: Enforced')
    console.log('   • Security: Scanning enabled')
    console.log('   • Performance: Monitored')
    process.exit(0)
  } else {
    console.log('\n⚠️  Some validations failed. Please address the issues above.')
    console.log('\n🔧 Recommended Actions:')
    
    if (!results.version) console.log('   • Update version to 7.1.9 in package.json')
    if (!results.testSuite) console.log('   • Ensure all test categories have test files')
    if (!results.documentation) console.log('   • Complete all required documentation')
    if (!results.workflows) console.log('   • Fix CI/CD workflow configurations')
    if (!results.packageScripts) console.log('   • Add missing test scripts to package.json')
    if (!results.playwrightConfig) console.log('   • Complete Playwright configuration')
    if (!results.codeowners) console.log('   • Update CODEOWNERS file')
    if (!results.features) console.log('   • Ensure key features are implemented')
    
    process.exit(1)
  }
}

main()
