FROM node:20-alpine

WORKDIR /app

# Copy only essential production files
COPY dist/package.json ./package.json
COPY dist/index.js ./index.js
COPY dist/public/ ./public/

# Install only production dependencies
RUN npm install --only=production --no-cache && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/cache/apk/* ~/.npm

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S burnt-beats -u 1001 -G nodejs

USER burnt-beats

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http'); http.get('http://localhost:5000/api/health', (res) => { res.statusCode === 200 ? process.exit(0) : process.exit(1); }).on('error', () => process.exit(1));"

# Start the application
CMD ["node", "index.js"]