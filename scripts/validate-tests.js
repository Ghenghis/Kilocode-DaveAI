#!/usr/bin/env node

import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { readFileSync as fsReadFileSync, existsSync as fsExistsSync } from 'fs'

const workspaceRoot = process.cwd()

// Test structure validation
function validateTestStructure() {
  console.log('🔍 Validating test structure...')
  
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
  let validTests = 0
  
  for (const dir of testDirs) {
    const testPath = join(workspaceRoot, dir)
    if (existsSync(testPath)) {
      const files = readdirSync(testPath)
      const testFiles = files.filter(f => f.endsWith('.spec.ts'))
      
      console.log(`📁 ${dir}: ${testFiles.length} test files`)
      
      for (const file of testFiles) {
        const filePath = join(testPath, file)
        const content = readFileSync(filePath, 'utf8')
        
        totalTests++
        
        // Check if it has test structure
        if (content.includes('test.describe') && content.includes('test(')) {
          validTests++
        } else {
          console.log(`⚠️  Invalid test structure in ${file}`)
        }
      }
    } else {
      console.log(`❌ Missing directory: ${dir}`)
    }
  }
  
  console.log(`\n📊 Test Summary:`)
  console.log(`   Total test files: ${totalTests}`)
  console.log(`   Valid test files: ${validTests}`)
  console.log(`   Success rate: ${((validTests / totalTests) * 100).toFixed(1)}%`)
  
  return validTests === totalTests
}

// Validate Playwright configuration
function validatePlaywrightConfig() {
  console.log('\n🔍 Validating Playwright configuration...')
  
  const configPath = join(workspaceRoot, 'playwright.config.ts')
  if (existsSync(configPath)) {
    const content = readFileSync(configPath, 'utf8')
    
    const hasTestDir = content.includes('testDir')
    const hasProjects = content.includes('projects')
    const hasReporter = content.includes('reporter')
    
    console.log(`✅ Config file exists`)
    console.log(`✅ Has testDir: ${hasTestDir}`)
    console.log(`✅ Has projects: ${hasProjects}`)
    console.log(`✅ Has reporter: ${hasReporter}`)
    
    return hasTestDir && hasProjects && hasReporter
  } else {
    console.log('❌ Playwright config not found')
    return false
  }
}

// Validate package.json scripts
function validatePackageScripts() {
  console.log('\n🔍 Validating package.json scripts...')
  
  const packagePath = join(workspaceRoot, 'package.json')
  if (fsExistsSync(packagePath)) {
    const packageJson = JSON.parse(fsReadFileSync(packagePath, 'utf8'))
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
        console.log(`✅ ${script}: ${scripts[script]}`)
        validScripts++
      } else {
        console.log(`❌ Missing script: ${script}`)
      }
    }
    
    console.log(`\n📊 Scripts Summary: ${validScripts}/${requiredScripts.length} valid`)
    return validScripts === requiredScripts.length
  } else {
    console.log('❌ package.json not found')
    return false
  }
}

// Main validation
function main() {
  console.log('🚀 Kilo Code Test Suite Validation\n')
  
  const structureValid = validateTestStructure()
  const configValid = validatePlaywrightConfig()
  const scriptsValid = validatePackageScripts()
  
  console.log('\n🎯 Final Results:')
  console.log(`   Test Structure: ${structureValid ? '✅' : '❌'}`)
  console.log(`   Playwright Config: ${configValid ? '✅' : '❌'}`)
  console.log(`   Package Scripts: ${scriptsValid ? '✅' : '❌'}`)
  
  const allValid = structureValid && configValid && scriptsValid
  
  if (allValid) {
    console.log('\n🎉 All validations passed! Test suite is ready.')
    process.exit(0)
  } else {
    console.log('\n⚠️  Some validations failed. Please address the issues above.')
    process.exit(1)
  }
}

main()
