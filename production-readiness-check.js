#!/usr/bin/env node

/**
 * Production Readiness Check for Burnt Beats
 * Comprehensive validation of all systems before deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductionReadinessChecker {
  constructor() {
    this.projectRoot = process.cwd();
    this.issues = [];
    this.warnings = [];
    this.successes = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addIssue(component, message) {
    this.issues.push({ component, message });
    this.log(`${component}: ${message}`, 'error');
  }

  addWarning(component, message) {
    this.warnings.push({ component, message });
    this.log(`${component}: ${message}`, 'warning');
  }

  addSuccess(component, message) {
    this.successes.push({ component, message });
    this.log(`${component}: ${message}`, 'success');
  }

  checkServerIndexFile() {
    this.log('Checking server/index.ts for issues...');
    
    const serverIndexPath = path.join(this.projectRoot, 'server/index.ts');
    if (!fs.existsSync(serverIndexPath)) {
      this.addIssue('Server Index', 'server/index.ts not found');
      return;
    }

    const content = fs.readFileSync(serverIndexPath, 'utf8');
    
    // Check for duplicate route registrations
    const routeRegistrations = content.match(/app\.use\('\/api\/\w+'/g) || [];
    const uniqueRoutes = new Set(routeRegistrations);
    
    if (routeRegistrations.length !== uniqueRoutes.size) {
      this.addIssue('Server Index', 'Duplicate route registrations detected');
    } else {
      this.addSuccess('Server Index', 'No duplicate route registrations');
    }

    // Check for duplicate static file serving
    const staticServing = content.match(/express\.static/g) || [];
    if (staticServing.length > 3) {
      this.addWarning('Server Index', 'Multiple static file serving configurations detected');
    }

    // Check for missing imports
    const requiredImports = ['express', 'cors', 'path'];
    const missingImports = requiredImports.filter(imp => !content.includes(`import ${imp}`));
    
    if (missingImports.length > 0) {
      this.addIssue('Server Index', `Missing imports: ${missingImports.join(', ')}`);
    } else {
      this.addSuccess('Server Index', 'All required imports present');
    }
  }

  checkStartupChecks() {
    this.log('Checking startup-checks.ts...');
    
    const startupChecksPath = path.join(this.projectRoot, 'server/startup-checks.ts');
    if (!fs.existsSync(startupChecksPath)) {
      this.addIssue('Startup Checks', 'startup-checks.ts not found');
      return;
    }

    const content = fs.readFileSync(startupChecksPath, 'utf8');
    
    if (content.includes('checkDatabaseHealth') && content.includes('runStartupChecks')) {
      this.addSuccess('Startup Checks', 'Required functions are present');
    } else {
      this.addIssue('Startup Checks', 'Missing required functions');
    }
  }

  checkStorageDirectories() {
    this.log('Checking storage directories...');
    
    const requiredDirs = [
      'storage/midi/generated',
      'storage/midi/templates',
      'storage/voice-bank',
      'storage/voices',
      'storage/models'
    ];

    let missingDirs = [];
    let existingDirs = [];

    requiredDirs.forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        existingDirs.push(dir);
      } else {
        missingDirs.push(dir);
        // Create missing directories
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });

    if (missingDirs.length > 0) {
      this.addWarning('Storage', `Created missing directories: ${missingDirs.join(', ')}`);
    }
    
    this.addSuccess('Storage', `All required directories exist (${existingDirs.length + missingDirs.length} total)`);
  }

  checkPackageJson() {
    this.log('Checking package.json configuration...');
    
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const requiredScripts = [
      'build',
      'build:server',
      'build:client',
      'start',
      'dev'
    ];

    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    if (missingScripts.length > 0) {
      this.addIssue('Package.json', `Missing scripts: ${missingScripts.join(', ')}`);
    } else {
      this.addSuccess('Package.json', 'All required scripts present');
    }

    // Check for production dependencies
    const requiredDeps = ['express', 'cors'];
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
    
    if (missingDeps.length > 0) {
      this.addIssue('Package.json', `Missing dependencies: ${missingDeps.join(', ')}`);
    } else {
      this.addSuccess('Package.json', 'Core dependencies present');
    }
  }

  checkEnvironmentVariables() {
    this.log('Checking environment variables...');
    
    const requiredEnvVars = ['NODE_ENV'];
    const optionalEnvVars = ['PORT', 'STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY'];
    
    const missingRequired = requiredEnvVars.filter(envVar => !process.env[envVar]);
    const missingOptional = optionalEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingRequired.length > 0) {
      this.addIssue('Environment', `Missing required variables: ${missingRequired.join(', ')}`);
    } else {
      this.addSuccess('Environment', 'All required environment variables present');
    }
    
    if (missingOptional.length > 0) {
      this.addWarning('Environment', `Missing optional variables: ${missingOptional.join(', ')}`);
    }
  }

  checkBuildOutput() {
    this.log('Checking build output...');
    
    const distPath = path.join(this.projectRoot, 'dist');
    if (!fs.existsSync(distPath)) {
      this.addWarning('Build', 'dist directory not found - run npm run build');
      return;
    }

    const serverBundle = path.join(distPath, 'index.js');
    const clientAssets = path.join(distPath, 'public');
    
    if (fs.existsSync(serverBundle)) {
      this.addSuccess('Build', 'Server bundle exists');
    } else {
      this.addIssue('Build', 'Server bundle not found');
    }
    
    if (fs.existsSync(clientAssets)) {
      this.addSuccess('Build', 'Client assets exist');
    } else {
      this.addIssue('Build', 'Client assets not found');
    }
  }

  checkScripts() {
    this.log('Checking scripts directory...');
    
    const scriptsPath = path.join(this.projectRoot, 'scripts');
    if (!fs.existsSync(scriptsPath)) {
      this.addWarning('Scripts', 'scripts directory not found');
      return;
    }

    const requiredScripts = ['ci-setup.js', 'run-local-ci.js', 'validate-ci.js'];
    const existingScripts = requiredScripts.filter(script => 
      fs.existsSync(path.join(scriptsPath, script))
    );
    
    if (existingScripts.length === requiredScripts.length) {
      this.addSuccess('Scripts', 'All CI/CD scripts present');
    } else {
      const missing = requiredScripts.filter(script => !existingScripts.includes(script));
      this.addWarning('Scripts', `Missing scripts: ${missing.join(', ')}`);
    }
  }

  generateReport() {
    this.log('\n' + '='.repeat(60));
    this.log('🔥 BURNT BEATS PRODUCTION READINESS REPORT');
    this.log('='.repeat(60));
    
    this.log(`\n📊 SUMMARY:`);
    this.log(`✅ Successes: ${this.successes.length}`);
    this.log(`⚠️  Warnings: ${this.warnings.length}`);
    this.log(`❌ Issues: ${this.issues.length}`);
    
    if (this.issues.length > 0) {
      this.log(`\n❌ CRITICAL ISSUES (must fix before deployment):`);
      this.issues.forEach(issue => {
        this.log(`   • ${issue.component}: ${issue.message}`);
      });
    }
    
    if (this.warnings.length > 0) {
      this.log(`\n⚠️  WARNINGS (recommended to fix):`);
      this.warnings.forEach(warning => {
        this.log(`   • ${warning.component}: ${warning.message}`);
      });
    }
    
    const isProductionReady = this.issues.length === 0;
    
    this.log(`\n🚀 PRODUCTION READINESS: ${isProductionReady ? 'READY ✅' : 'NOT READY ❌'}`);
    
    if (isProductionReady) {
      this.log('\n🎉 Your app is ready for production deployment!');
      this.log('Next steps:');
      this.log('1. npm run build');
      this.log('2. npm start');
      this.log('3. Test at http://localhost:5000');
      this.log('4. Deploy to your hosting platform');
    } else {
      this.log('\n🔧 Please fix the critical issues above before deploying.');
    }
    
    return isProductionReady;
  }

  async run() {
    this.log('🔍 Starting Production Readiness Check...\n');
    
    try {
      this.checkServerIndexFile();
      this.checkStartupChecks();
      this.checkStorageDirectories();
      this.checkPackageJson();
      this.checkEnvironmentVariables();
      this.checkBuildOutput();
      this.checkScripts();
      
      const isReady = this.generateReport();
      process.exit(isReady ? 0 : 1);
      
    } catch (error) {
      this.log(`Production readiness check failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  new ProductionReadinessChecker().run();
}

export default ProductionReadinessChecker;
