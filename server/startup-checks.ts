import fs from 'fs';
import path from 'path';

/**
 * Database health check function
 * Currently using file-based storage, but can be extended for real databases
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // For now, we're using file-based storage
    // Check if storage directories exist and are writable
    const storageDir = './storage';

    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    // Test write access
    const testFile = path.join(storageDir, 'health-check.tmp');
    fs.writeFileSync(testFile, 'health-check');
    fs.unlinkSync(testFile);

    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Comprehensive startup checks for production readiness
 */
export async function runStartupChecks(): Promise<void> {
  console.log('🔍 Running startup checks...');

  // Check database/storage health
  try {
    const dbHealth = await checkDatabaseHealth();
    if (dbHealth) {
      console.log('✅ Storage system verified');
    } else {
      console.error('❌ Storage system check failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Storage system check failed:', error);
    process.exit(1);
  }

  // Check critical directories
  const criticalDirs = [
    './storage/midi/generated',
    './storage/midi/templates',
    './storage/voice-bank',
    './storage/voices',
    './storage/models'
  ];

  for (const dir of criticalDirs) {
    if (!fs.existsSync(dir)) {
      console.log(`📁 Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Check environment variables
  const requiredEnvVars = ['NODE_ENV'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars.join(', '));
  }

  // Check AI models (optional)
  const modelPath = './Retrieval-based-Voice-Conversion-WebUI/assets/hubert/hubert_base.pt';
  if (fs.existsSync(modelPath)) {
    console.log('✅ AI models found');
  } else {
    console.log('ℹ️ AI models not found (will download if needed)');
  }

  console.log('✅ Startup checks completed successfully');
}

export default { runStartupChecks, checkDatabaseHealth };