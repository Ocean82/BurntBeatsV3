
/**
 * Production configuration for Burnt Beats
 * Contains all production-specific settings
 */

module.exports = {
  // Server configuration
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 5000,
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://*.replit.app', 'https://*.replit.dev']
        : true,
      credentials: true
    }
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
  },

  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'burnt-beats-default-secret',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },

  // File upload limits
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/flac',
      'audio/aac',
      'application/octet-stream'
    ]
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000
  },

  // Feature flags
  features: {
    voiceCloning: true,
    midiGeneration: true,
    audioldm2: true,
    payments: !!process.env.STRIPE_SECRET_KEY,
    analytics: process.env.NODE_ENV === 'production'
  },

  // Logging
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: 'combined'
  }
};
