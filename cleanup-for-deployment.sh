#!/bin/bash
# Pre-deployment cleanup script to reduce Docker image size

echo "🧹 Starting deployment cleanup to reduce Docker image size..."

# Clean up temporary build files
echo "Cleaning temporary build files..."
rm -rf build-output.log deployment.log ci-validation-report.json 2>/dev/null || true
rm -rf dist/reports dist/storage dist/uploads dist/voice-bank 2>/dev/null || true

# Clean up large attached assets that don't need to be in production
echo "Cleaning large attached assets..."
find attached_assets/ -name "*.wav" -delete 2>/dev/null || true
find attached_assets/ -name "*.mp3" -delete 2>/dev/null || true
find attached_assets/ -name "*.flac" -delete 2>/dev/null || true
find attached_assets/ -name "*.zip" -delete 2>/dev/null || true
find attached_assets/ -name "*.tar*" -delete 2>/dev/null || true

# Clean up development-only scripts
echo "Cleaning development scripts..."
rm -rf build-*.cjs fix-*.cjs deploy-*.cjs quick-*.cjs validate-*.cjs verify-*.cjs 2>/dev/null || true

# Clean up test and coverage files
echo "Cleaning test files..."
rm -rf coverage/ test-results/ playwright-report/ 2>/dev/null || true

# Clean up logs
echo "Cleaning log files..."
find . -name "*.log" -delete 2>/dev/null || true

# Clean up Python cache (if accessible)
echo "Cleaning Python cache..."
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true

# Show remaining size
echo "✅ Cleanup complete!"
echo "Current project size:"
du -sh . 2>/dev/null || echo "Size calculation not available"

echo "🐳 Ready for Docker deployment with reduced image size"