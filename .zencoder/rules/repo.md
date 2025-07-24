---
description: Repository Information Overview
alwaysApply: true
---

# BurntBeatz Information

## Summary
BurntBeatz is an AI-powered music generation platform with voice cloning and MIDI synthesis capabilities. It features a React-based frontend with Tailwind styling, Express backend, and integrates various AI models for audio generation and voice synthesis.

## Structure
- **client/**: React frontend application
- **server/**: Express backend server with API routes
- **components/**: Shared React components
- **shared/**: Shared types and schemas
- **tests/**: Test files (unit, integration, e2e)
- **storage/**: Storage for models, MIDI files, and voice samples
- **migrations/**: Database migration files
- **mir-data/**: Music information retrieval data and scripts

## Language & Runtime
**Language**: TypeScript/JavaScript
**Version**: Node.js 20.x (20.18.0 recommended)
**Build System**: Vite, esbuild
**Package Manager**: npm 10.x (10.8.2 recommended)

## Dependencies
**Main Dependencies**:
- React 18.3.1
- Express 4.21.2
- Drizzle ORM 0.39.3
- Zod 3.24.2
- Stripe 18.3.0
- Tailwind CSS 3.4.17
- WebSockets (ws 8.18.3)

**Development Dependencies**:
- TypeScript 5.8.3
- Vite 6.3.5
- Vitest 3.2.4
- Playwright 1.53.1
- ESLint 9.31.0
- Prettier 3.4.2

## Build & Installation
```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Production deployment
npm run deploy
```

## Docker
**Dockerfile**: Dockerfile
**Image**: node:20-alpine
**Configuration**: Single-stage build with production dependencies only, runs on port 5000, includes health check

## Testing
**Frameworks**: 
- Vitest (unit/integration)
- Playwright (e2e)
- Jest (component tests)

**Test Location**: 
- tests/ (main test directory)
- test/ (component tests)

**Run Commands**:
```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Run with coverage
npm run test:ci
```

## Database
**ORM**: Drizzle ORM
**Migrations**: SQL-based migrations in migrations/ directory
**Commands**:
```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate
```

## AI Components
**Voice Cloning**: RVC integration (server/rvc-service.ts)
**Audio Generation**: AudioLDM2 service (server/audioldm2-service.ts)
**MIDI Processing**: Various Python scripts for MIDI generation and processing