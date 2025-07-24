# 🔥 BurntBeatz - Replit Deployment Todo List

This document outlines all the steps needed to make BurntBeatz fully deployment-ready for Replit.

## 🚀 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Verify `.replit` file has correct configuration
  - [ ] Check that `entrypoint` is set to "index.js"
  - [ ] Ensure `localPort` is set to 5000
  - [ ] Confirm modules include "nodejs-20", "python-3.11", "postgresql-16"
  - [ ] Verify port mappings (especially port 5000 → 80)
- [ ] Verify `.replit.nix` file exists and has correct dependencies
- [ ] Set up environment variables in Replit Secrets tab:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `AUTO_DOWNLOAD_MODELS=true`
  - [ ] `STRIPE_SECRET_KEY` (if using Stripe)
  - [ ] `STRIPE_PUBLISHABLE_KEY` (if using Stripe)

### 2. Dependency Management
- [ ] Run `npm install` to verify all dependencies can be installed
- [ ] Check for any platform-specific dependencies that might cause issues
- [ ] Ensure Python dependencies are listed in a requirements.txt file
- [ ] Verify all @types packages are installed for TypeScript compilation

### 3. Storage & Directory Structure
- [ ] Create required storage directories:
  - [ ] `storage/midi/generated`
  - [ ] `storage/midi/templates`
  - [ ] `storage/voice-bank`
  - [ ] `storage/voices`
  - [ ] `storage/models`
- [ ] Ensure `dist` directory exists for build output

## 🛠️ Build Process Optimization

### 1. TypeScript Compilation Fixes
- [ ] Run `npm run replit:fix` to apply TypeScript fixes
- [ ] Verify TypeScript compilation works with `npx tsc --noEmit`
- [ ] Check for any import.meta.url usage that needs to be fixed
- [ ] Ensure express-session types are properly installed

### 2. Build Configuration
- [ ] Test build with `node deploy-production-fix.cjs`
- [ ] Verify esbuild can bundle the server correctly
- [ ] Check for any external dependencies that need special handling
- [ ] Ensure all paths are relative and work in Replit environment

### 3. Size Optimization
- [ ] Run `node lightweight-deploy.cjs` to reduce bundle size
- [ ] Remove unnecessary dev dependencies from production build
- [ ] Exclude large packages like Playwright, testing libraries
- [ ] Optimize any large assets or models

## 🔒 Security & Configuration

### 1. Server Configuration
- [ ] Update CORS settings for Replit domain
- [ ] Set proper security headers with Helmet
- [ ] Configure rate limiting for API endpoints
- [ ] Ensure proper error handling for production

### 2. Database Setup
- [ ] Configure database connection for Replit PostgreSQL
- [ ] Run migrations with `npm run db:migrate`
- [ ] Test database connectivity
- [ ] Set up proper connection pooling

### 3. File System Permissions
- [ ] Ensure write permissions for storage directories
- [ ] Set up proper file upload limits
- [ ] Configure temporary file cleanup

## 🧪 Testing & Validation

### 1. Local Testing
- [ ] Run `npm run replit:ready` to check deployment readiness
- [ ] Verify all TypeScript errors are fixed
- [ ] Test server startup locally
- [ ] Validate API endpoints function correctly

### 2. Replit-Specific Testing
- [ ] Test with Replit's Node.js version
- [ ] Verify Python integration works
- [ ] Check for any path-related issues
- [ ] Test file system operations

### 3. Performance Testing
- [ ] Check memory usage during startup
- [ ] Verify CPU usage is reasonable
- [ ] Test startup time
- [ ] Validate response times for key endpoints

## 🚀 Deployment Process

### 1. Initial Deployment
- [ ] Run `npm run replit:deploy` for initial deployment
- [ ] Check build logs for any errors
- [ ] Verify server starts correctly
- [ ] Test public URL access

### 2. Post-Deployment Verification
- [ ] Check `/api/health` endpoint returns 200
- [ ] Verify frontend loads correctly
- [ ] Test authentication flow
- [ ] Validate file uploads work
- [ ] Test AI model integration

### 3. Monitoring & Maintenance
- [ ] Set up error logging
- [ ] Configure performance monitoring
- [ ] Establish deployment workflow for updates
- [ ] Document restart procedures

## 🔄 Deployment Workflow

### Option 1: Automatic Deployment (Recommended)
```bash
# One-step deployment
npm run replit:deploy

# Or step by step
npm run replit:fix
npm run replit:ready
node lightweight-deploy.cjs
cd dist && node index.js
```

### Option 2: Manual Deployment
```bash
# Install dependencies
npm install --no-optional --prefer-offline

# Build for production
node deploy-production-fix.cjs

# Install production dependencies in dist
cd dist && npm install --production --no-optional

# Start the server
node index.js
```

## 🆘 Troubleshooting Guide

### Common Issues and Solutions

#### TypeScript Compilation Errors
- **Issue**: Missing type definitions
- **Solution**: Run `npm run replit:fix` or manually install missing @types packages

#### Build Failures
- **Issue**: esbuild fails to bundle server
- **Solution**: Try the fallback build in lightweight-deploy.cjs or use simple-build.cjs

#### Server Won't Start
- **Issue**: Missing dependencies or configuration
- **Solution**: Check logs, ensure all directories exist, verify environment variables

#### Database Connection Issues
- **Issue**: Cannot connect to PostgreSQL
- **Solution**: Check connection string, ensure PostgreSQL module is enabled in .replit

#### Memory/CPU Limits
- **Issue**: Application crashes due to resource limits
- **Solution**: Optimize bundle size, reduce dependencies, use lightweight-deploy.cjs

## 🎯 Final Checklist

- [ ] Server builds successfully
- [ ] Server starts without errors
- [ ] Frontend loads correctly
- [ ] API endpoints respond properly
- [ ] File uploads work
- [ ] AI models function correctly
- [ ] Authentication works
- [ ] Database operations succeed
- [ ] Error handling is robust
- [ ] Performance is acceptable

Once all items are checked, your BurntBeatz application should be fully deployment-ready for Replit! 🎉