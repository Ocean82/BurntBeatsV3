# BurntBeatz Deployment Guide for Replit

This guide provides step-by-step instructions for deploying BurntBeatz on Replit.

## Prerequisites

- Replit account
- Node.js 20+
- Python 3.11+
- PostgreSQL database

## Deployment Steps

### 1. Setup Database

1. Create a `.env` file in the root directory with your database connection:

```
DATABASE_URL=postgresql://username:password@hostname:5432/database
```

2. Run the database setup script:

```bash
node setup-database.cjs
```

3. Run database migrations:

```bash
npm run db:migrate:replit
```

### 2. Build and Deploy

1. Run the deployment script:

```bash
npm run deploy:replit
```

This script will:
- Set up the database connection
- Install dependencies
- Run database migrations
- Build the application
- Create necessary directories
- Set up environment variables

### 3. Start the Server

```bash
npm run start:replit
```

Or use the Replit Run button.

## Environment Variables

- `NODE_ENV`: Set to "production"
- `PORT`: Set to 5000
- `DATABASE_URL`: PostgreSQL connection string
- `AUTO_DOWNLOAD_MODELS`: Set to "true" to download AI models automatically

## Directory Structure

- `storage/midi/generated`: Generated MIDI files
- `storage/midi/user-uploads`: User uploaded MIDI files
- `storage/voices`: Voice samples and clones
- `storage/models`: AI models
- `storage/temp`: Temporary files

## Troubleshooting

### Server Won't Start

1. Check if the database is running:
   ```bash
   node setup-database.cjs
   ```

2. Verify the build was successful:
   ```bash
   ls -la dist
   ```

3. Check the logs for errors:
   ```bash
   npm run health-check
   ```

### Database Connection Issues

1. Verify your DATABASE_URL in the .env file
2. Run the database setup script again:
   ```bash
   node setup-database.cjs
   ```

### Missing Dependencies

1. Run the deployment script again:
   ```bash
   npm run deploy:replit
   ```

## Maintenance

### Updating the Application

1. Pull the latest changes
2. Run the deployment script:
   ```bash
   npm run deploy:replit
   ```

### Clearing Temporary Files

```bash
npm run cleanup
```

### Health Check

```bash
npm run health-check
```