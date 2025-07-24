# BurntBeatz Deployment Guide

This document provides instructions for deploying BurntBeatz on Replit.

## Prerequisites

- Replit account
- Node.js 20+
- Python 3.11
- PostgreSQL 16

## Deployment Steps

### 1. Initial Setup

1. Fork the BurntBeatz repository on Replit
2. Make sure the `.replit` file is properly configured:
   - Modules: nodejs-20, python-3.11, postgresql-16
   - Port mapping: 5000 → 80

### 2. Database Setup

The database will be automatically set up during deployment, but you can also run:

```bash
node setup-database.cjs
npm run db:migrate:replit
```

### 3. Deployment

Run the deployment script:

```bash
npm run deploy:replit
```

This script will:
- Set up the database connection
- Install Node.js dependencies
- Install Python dependencies
- Run database migrations
- Build the application
- Create necessary directories
- Set up environment variables

### 4. Starting the Server

After deployment, start the server:

```bash
npm run start:replit
```

Or simply click the "Run" button in Replit.

## Environment Variables

The following environment variables are set automatically:

- `NODE_ENV`: Set to "production"
- `PORT`: Set to 5000
- `DATABASE_URL`: Set automatically based on Replit configuration
- `AUTO_DOWNLOAD_MODELS`: Set to "true"
- `OFFLINE_MODE`: Set to "false"

## Health Check

To verify that the server is running correctly:

```bash
npm run health-check
```

## Troubleshooting

### Server Won't Start

1. Check the logs for errors
2. Verify that the database is running:
   ```bash
   npm run db:migrate:replit
   ```
3. Try rebuilding the application:
   ```bash
   npm run deploy:replit
   ```

### Database Connection Issues

1. Run the database setup script:
   ```bash
   node setup-database.cjs
   ```
2. Check if the DATABASE_URL environment variable is set correctly in the .env file

### Missing Dependencies

1. Install Node.js dependencies:
   ```bash
   npm install
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Maintenance

### Updating the Application

1. Pull the latest changes
2. Run the deployment script:
   ```bash
   npm run deploy:replit
   ```

### Database Migrations

To run database migrations:

```bash
npm run db:migrate:replit
```

### Clearing Temporary Files

To clear temporary files and caches:

```bash
npm run cleanup
```