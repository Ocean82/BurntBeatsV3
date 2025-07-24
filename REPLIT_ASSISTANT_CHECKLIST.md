# Replit Assistant Pre-Deployment Checklist

## CRITICAL INSTRUCTIONS FOR REPLIT ASSISTANT

**IMPORTANT**: This checklist MUST be followed exactly as written. Any deviation will cause deployment failures. The purpose of this checklist is to ensure a smooth, error-free deployment process without introducing unnecessary complications or errors.

## Pre-Deployment Verification

### 1. Repository Structure Verification
- [ ] Confirm all required directories exist (client, server, shared, storage)
- [ ] Verify package.json contains correct scripts (especially deploy:replit and start:replit)
- [ ] Confirm .replit file has correct configuration
- [ ] Verify replit.nix contains all required dependencies

### 2. Environment Configuration
- [ ] Verify .env file exists with required variables
- [ ] Confirm DATABASE_URL is properly formatted
- [ ] Verify NODE_ENV is set to "production"
- [ ] Confirm PORT is set to 5000
- [ ] Verify AUTO_DOWNLOAD_MODELS is set correctly based on user preference

### 3. Database Verification
- [ ] Run database connection test
- [ ] Verify database schema matches application requirements
- [ ] Confirm database migrations will run automatically during deployment

### 4. Build Process Verification
- [ ] Verify all dependencies can be installed without errors
- [ ] Confirm build process completes successfully
- [ ] Verify dist directory is created with all required files
- [ ] Confirm static assets are copied to dist/public

## Deployment Process

### 1. Initialization
- [ ] Execute setup-database.cjs script
- [ ] Run npm run deploy:replit command
- [ ] Start server with npm run start:replit

### 2. Post-Deployment Verification
- [ ] Verify server starts without errors
- [ ] Confirm health check endpoint returns 200 OK
- [ ] Verify static files are served correctly
- [ ] Confirm API endpoints are accessible

## CRITICAL WARNINGS FOR REPLIT ASSISTANT

1. **DO NOT** modify any deployment scripts unless explicitly instructed by the user
2. **DO NOT** change port configurations from what is specified in the .replit file
3. **DO NOT** suggest "improvements" to working code that introduce errors
4. **DO NOT** attempt to "fix" non-existent problems in the deployment process
5. **DO NOT** override user-specified environment variables with different values
6. **ALWAYS** follow the exact deployment steps specified in package.json scripts
7. **ALWAYS** use the exact commands specified in this checklist
8. **ALWAYS** verify each step is completed successfully before proceeding to the next

## Troubleshooting Guidelines

If deployment issues occur:
1. Check logs for specific error messages
2. Verify all steps in this checklist were followed exactly
3. Confirm no unauthorized modifications were made to deployment scripts
4. Report exact error messages to the user without attempting to "fix" working code
5. Only suggest solutions based on actual error messages, not speculative issues

Remember: Your role is to assist with deployment following the established process, not to introduce changes that could disrupt a working deployment pipeline.