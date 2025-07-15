#!/bin/bash

# Install production dependencies script
# This script copies dependencies from the main node_modules to dist for production use

set -e

echo "🔧 Installing production dependencies for deployment..."

# Create node_modules in dist
mkdir -p dist/node_modules

# Copy essential dependencies
echo "📦 Copying essential Node.js modules..."

DEPS=(
    "express"
    "cors" 
    "dotenv"
    "stripe"
    "multer"
    "helmet"
    "ws"
    "zod"
    "drizzle-orm"
    "nanoid"
    "@neondatabase"
    "@google-cloud"
    "express-session"
    "express-rate-limit"
    "connect-pg-simple"
)

for dep in "${DEPS[@]}"; do
    if [ -d "node_modules/$dep" ]; then
        echo "Copying $dep..."
        cp -r "node_modules/$dep" "dist/node_modules/"
    else
        echo "⚠️ Warning: $dep not found in node_modules"
    fi
done

echo "✅ Production dependencies installed in dist/node_modules"
echo "🚀 Ready for production deployment"