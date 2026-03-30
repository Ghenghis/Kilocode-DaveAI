#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const workspaceRoot = process.cwd()

// Simple test syntax validation
function validateTestSyntax() {
  console.log('🔍 Validating test syntax...')
  
  const testFiles = [
    'tests/governance/governance-policies.spec.ts',
    'tests/governance/merge-enforcement.spec.ts',
    'tests/governance/release-automation.spec.ts',
    'tests/governance/quality-assurance.spec.ts',
    'tests/governance/compliance-validation.spec.ts',
    'tests/migration/migration-strategy-testing.spec.ts',
    'tests/performance/performance-optimization.spec.ts',
    'tests/resilience/resilience-testing.spec.ts',
    'tests/scalability/scalability-testing.spec.ts',
    'tests/disaster-recovery/disaster-recovery.spec.ts',
    'tests/security/artifact-security-validation.spec.ts',
    'tests/cicd/cicd-workflow-testing.spec.ts',
    'tests/deployment/deployment-validation.spec.ts',
    'tests/release/release-pipeline-testing.spec.ts'
  ]
  
  let validFiles = 0
  let totalTests = 0
  
  for (const file of testFiles) {
    const filePath = join(workspaceRoot, file)
    
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf8')
      
      // Check for basic test structure
      const hasImport = content.includes('import { test, expect }')
      const hasDescribe = content.includes('test.describe')
      const hasTest = content.includes('test(')
      const hasExpect = content.includes('expect(')
      
      console.log(`📄 ${file}:`)
      console.log(`   ✅ Import: ${hasImport}`)
      console.log(`   ✅ Describe: ${hasDescribe}`)
      console.log(`   ✅ Test: ${hasTest}`)
      console.log(`   ✅ Expect: ${hasExpect}`)
      
      if (hasImport && hasDescribe && hasTest && hasExpect) {
        validFiles++
        
        // Count test cases
        const testMatches = content.match(/test\s*\(/g) || []
        totalTests += testMatches.length
        
        console.log(`   📊 Tests: ${testMatches.length}`)
      }
      
      console.log('')
    } else {
      console.log(`❌ Missing file: ${file}`)
    }
  }
  
  console.log(`📊 Summary:`)
  console.log(`   Valid files: ${validFiles}/${testFiles.length}`)
  console.log(`   Total tests: ${totalTests}`)
  
  return validFiles === testFiles.length
}

// Check test categories
function validateTestCategories() {
  console.log('\n🔍 Validating test categories...')
  
  const categories = {
    'Governance': ['governance-policies', 'merge-enforcement', 'release-automation', 'quality-assurance', 'compliance-validation'],
    'Migration': ['migration-strategy-testing'],
    'Performance': ['performance-optimization'],
    'Resilience': ['resilience-testing'],
    'Scalability': ['scalability-testing'],
    'Disaster Recovery': ['disaster-recovery'],
    'Security': ['artifact-security-validation'],
    'CI/CD': ['cicd-workflow-testing'],
    'Deployment': ['deployment-validation'],
    'Release': ['release-pipeline-testing']
  }
  
  let validCategories = 0
  
  for (const [category, tests] of Object.entries(categories)) {
    console.log(`📁 ${category}:`)
    
    let categoryValid = true
    for (const test of tests) {
      const dirName = category.toLowerCase() === 'ci/cd' ? 'cicd' : category.toLowerCase().replace(' ', '-')
      const filePath = join(workspaceRoot, 'tests', dirName, `${test}.spec.ts`)
      
      if (existsSync(filePath)) {
        console.log(`   ✅ ${test}`)
      } else {
        console.log(`   ❌ ${test}`)
        categoryValid = false
      }
    }
    
    if (categoryValid) {
      validCategories++
    }
    
    console.log('')
  }
  
  console.log(`📊 Categories: ${validCategories}/${Object.keys(categories).length} valid`)
  
  return validCategories === Object.keys(categories).length
}

// Main validation
function main() {
  console.log('🚀 Kilo Code Test Suite Validation - Simple Mode\n')
  
  const syntaxValid = validateTestSyntax()
  const categoriesValid = validateTestCategories()
  
  console.log('\n🎯 Final Results:')
  console.log(`   Test Syntax: ${syntaxValid ? '✅' : '❌'}`)
  console.log(`   Test Categories: ${categoriesValid ? '✅' : '❌'}`)
  
  const allValid = syntaxValid && categoriesValid
  
  if (allValid) {
    console.log('\n🎉 Test suite validation successful!')
    console.log('\n📋 Next Steps:')
    console.log('   1. Install dependencies: bun install')
    console.log('   2. Run specific tests: bun run test:governance')
    console.log('   3. Run all tests: bun run test:playwright')
    console.log('   4. View test reports: open test-results/html/index.html')
    process.exit(0)
  } else {
    console.log('\n⚠️  Some validations failed. Please address the issues above.')
    process.exit(1)
  }
}

main()
