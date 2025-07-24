# BurntBeatz Deployment Checklist

Use this checklist to verify that all deployment steps have been completed successfully.

## Pre-Deployment Checks

- [ ] Repository cloned/forked to Replit
- [ ] Node.js 20+ available
- [ ] Python 3.11+ available
- [ ] PostgreSQL 16+ available
- [ ] All required files present

## Database Setup

- [ ] Database connection configured in .env file
- [ ] Database setup script run successfully
- [ ] Migrations run successfully
- [ ] Database tables created

## Build Process

- [ ] Dependencies installed
- [ ] Application built successfully
- [ ] dist directory created with index.js
- [ ] Static assets copied to dist/public

## Environment Configuration

- [ ] .env file created with required variables
- [ ] NODE_ENV set to "production"
- [ ] PORT set to 5000
- [ ] AUTO_DOWNLOAD_MODELS set to "true" if needed
- [ ] OFFLINE_MODE set to "false"

## Directory Structure

- [ ] storage/midi/generated directory created
- [ ] storage/midi/user-uploads directory created
- [ ] storage/voices directory created
- [ ] storage/models directory created
- [ ] storage/temp directory created

## Replit Configuration

- [ ] .replit file configured correctly
- [ ] replit.nix file created with dependencies
- [ ] Port 5000 mapped to 80
- [ ] Deployment target set to "autoscale"
- [ ] Run command set to "npm run start:replit"
- [ ] Build command set to "npm run deploy:replit"

## Final Checks

- [ ] Server starts without errors
- [ ] Health check endpoint returns 200 OK
- [ ] Database connection successful
- [ ] Static files served correctly
- [ ] API endpoints accessible
- [ ] CORS configured correctly

## Post-Deployment Verification

- [ ] Application accessible via Replit URL
- [ ] Login/registration works
- [ ] MIDI generation works
- [ ] Voice cloning works (if enabled)
- [ ] Audio generation works (if enabled)
- [ ] No console errors in browser

## Troubleshooting

If any checks fail, refer to the DEPLOYMENT_GUIDE.md file for troubleshooting steps.