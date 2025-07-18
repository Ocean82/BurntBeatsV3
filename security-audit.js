
const fs = require('fs');
const path = require('path');

class SecurityAuditor {
  constructor() {
    this.vulnerabilities = [];
    this.recommendations = [];
  }

  async auditProject() {
    console.log('🔍 Starting comprehensive security audit...\n');

    await this.checkDependencies();
    await this.checkEnvironmentVariables();
    await this.checkFilePermissions();
    await this.checkCodePatterns();
    await this.checkConfiguration();

    this.generateReport();
  }

  async checkDependencies() {
    console.log('📦 Checking dependencies for vulnerabilities...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Check for known vulnerable packages
      const vulnerablePackages = [
        'node-forge', 'request', 'bootstrap', 'jquery'
      ];

      for (const pkg of vulnerablePackages) {
        if (dependencies[pkg]) {
          this.vulnerabilities.push({
            type: 'Dependency',
            severity: 'Medium',
            description: `Potentially vulnerable package detected: ${pkg}`,
            recommendation: `Review and update ${pkg} to latest secure version`
          });
        }
      }

      console.log('✅ Dependencies checked\n');
    } catch (error) {
      console.log('❌ Error checking dependencies\n');
    }
  }

  async checkEnvironmentVariables() {
    console.log('🔐 Checking environment variable security...');

    const envExample = fs.existsSync('.env.example');
    const envLocal = fs.existsSync('.env.local');
    const envFile = fs.existsSync('.env');

    if (!envExample) {
      this.vulnerabilities.push({
        type: 'Configuration',
        severity: 'Low',
        description: 'Missing .env.example file',
        recommendation: 'Create .env.example with placeholder values'
      });
    }

    if (envLocal || envFile) {
      // Check if .env files are in gitignore
      const gitignore = fs.readFileSync('.gitignore.consolidated', 'utf8');
      if (!gitignore.includes('.env')) {
        this.vulnerabilities.push({
          type: 'Configuration',
          severity: 'High',
          description: 'Environment files not in .gitignore',
          recommendation: 'Add .env* to .gitignore to prevent credential exposure'
        });
      }
    }

    console.log('✅ Environment variables checked\n');
  }

  async checkFilePermissions() {
    console.log('📁 Checking file permissions...');

    const sensitiveFiles = [
      '.env', '.env.local', 'server/db.ts', 'server/index.ts'
    ];

    for (const file of sensitiveFiles) {
      if (fs.existsSync(file)) {
        try {
          const stats = fs.statSync(file);
          const mode = stats.mode.toString(8).slice(-3);
          
          if (mode === '777' || mode === '666') {
            this.vulnerabilities.push({
              type: 'File Permissions',
              severity: 'Medium',
              description: `File ${file} has overly permissive permissions (${mode})`,
              recommendation: 'Restrict file permissions to 644 or 600'
            });
          }
        } catch (error) {
          // File permission check failed
        }
      }
    }

    console.log('✅ File permissions checked\n');
  }

  async checkCodePatterns() {
    console.log('🔍 Checking code for security patterns...');

    const files = this.getAllFiles(['server', 'client/src'], ['.ts', '.tsx', '.js', '.jsx']);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');

      // Check for hardcoded secrets
      const secretPatterns = [
        /password\s*=\s*["'][^"']+["']/gi,
        /api[_-]?key\s*=\s*["'][^"']+["']/gi,
        /secret\s*=\s*["'][^"']+["']/gi,
        /token\s*=\s*["'][^"']+["']/gi
      ];

      secretPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          this.vulnerabilities.push({
            type: 'Hardcoded Secrets',
            severity: 'High',
            description: `Potential hardcoded secret in ${file}`,
            recommendation: 'Move secrets to environment variables'
          });
        }
      });

      // Check for SQL injection vulnerabilities
      if (content.includes('SELECT') && content.includes('${') || content.includes('`')) {
        this.vulnerabilities.push({
          type: 'SQL Injection',
          severity: 'High',
          description: `Potential SQL injection vulnerability in ${file}`,
          recommendation: 'Use parameterized queries or ORM'
        });
      }

      // Check for XSS vulnerabilities
      if (content.includes('innerHTML') || content.includes('dangerouslySetInnerHTML')) {
        this.vulnerabilities.push({
          type: 'XSS',
          severity: 'Medium',
          description: `Potential XSS vulnerability in ${file}`,
          recommendation: 'Sanitize user input before rendering'
        });
      }
    }

    console.log('✅ Code patterns checked\n');
  }

  async checkConfiguration() {
    console.log('⚙️ Checking security configuration...');

    // Check if HTTPS is configured
    const serverFiles = this.getAllFiles(['server'], ['.ts', '.js']);
    let httpsConfigured = false;

    for (const file of serverFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('https') || content.includes('ssl')) {
        httpsConfigured = true;
        break;
      }
    }

    if (!httpsConfigured) {
      this.recommendations.push({
        type: 'Configuration',
        description: 'HTTPS not explicitly configured',
        recommendation: 'Ensure HTTPS is enabled in production'
      });
    }

    console.log('✅ Configuration checked\n');
  }

  getAllFiles(dirs, extensions) {
    let files = [];

    for (const dir of dirs) {
      if (fs.existsSync(dir)) {
        files = files.concat(this.getFilesRecursively(dir, extensions));
      }
    }

    return files;
  }

  getFilesRecursively(dir, extensions) {
    let files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files = files.concat(this.getFilesRecursively(fullPath, extensions));
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }

    return files;
  }

  generateReport() {
    console.log('📊 Security Audit Report');
    console.log('========================\n');

    if (this.vulnerabilities.length === 0) {
      console.log('🎉 No major vulnerabilities detected!\n');
    } else {
      console.log(`⚠️  Found ${this.vulnerabilities.length} potential vulnerabilities:\n`);

      const high = this.vulnerabilities.filter(v => v.severity === 'High');
      const medium = this.vulnerabilities.filter(v => v.severity === 'Medium');
      const low = this.vulnerabilities.filter(v => v.severity === 'Low');

      if (high.length > 0) {
        console.log('🔴 HIGH SEVERITY:');
        high.forEach(v => {
          console.log(`   • ${v.description}`);
          console.log(`     → ${v.recommendation}\n`);
        });
      }

      if (medium.length > 0) {
        console.log('🟡 MEDIUM SEVERITY:');
        medium.forEach(v => {
          console.log(`   • ${v.description}`);
          console.log(`     → ${v.recommendation}\n`);
        });
      }

      if (low.length > 0) {
        console.log('🟢 LOW SEVERITY:');
        low.forEach(v => {
          console.log(`   • ${v.description}`);
          console.log(`     → ${v.recommendation}\n`);
        });
      }
    }

    if (this.recommendations.length > 0) {
      console.log('💡 Additional Recommendations:\n');
      this.recommendations.forEach(r => {
        console.log(`   • ${r.description}`);
        console.log(`     → ${r.recommendation}\n`);
      });
    }

    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      vulnerabilities: this.vulnerabilities,
      recommendations: this.recommendations,
      summary: {
        total: this.vulnerabilities.length,
        high: this.vulnerabilities.filter(v => v.severity === 'High').length,
        medium: this.vulnerabilities.filter(v => v.severity === 'Medium').length,
        low: this.vulnerabilities.filter(v => v.severity === 'Low').length
      }
    };

    fs.writeFileSync('security-audit-report.json', JSON.stringify(report, null, 2));
    console.log('📄 Report saved to security-audit-report.json');
  }
}

const auditor = new SecurityAuditor();
auditor.auditProject().catch(console.error);
