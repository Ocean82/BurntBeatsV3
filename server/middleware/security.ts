import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting configuration
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 * 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs for sensitive endpoints
  message: {
    error: 'Rate limit exceeded for sensitive operations.',
    retryAfter: 15 * 60 * 1000
  }
});

// Input validation middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return '';
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[sanitizeString(key)] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// CSRF protection
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body.csrfToken;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

// File upload validation
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }

  const allowedMimeTypes = [
    'audio/mp3',
    'audio/wav',
    'audio/flac',
    'audio/m4a',
    'audio/mpeg',
    'audio/x-wav'
  ];

  const maxFileSize = 100 * 1024 * 1024; // 100MB

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file type. Only audio files are allowed.' });
  }

  if (req.file.size > maxFileSize) {
    return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
  }

  // Additional filename validation
  const validExtensions = ['.mp3', '.wav', '.flac', '.m4a'];
  const hasValidExtension = validExtensions.some(ext => 
    req.file!.originalname.toLowerCase().endsWith(ext)
  );

  if (!hasValidExtension) {
    return res.status(400).json({ error: 'Invalid file extension.' });
  }

  next();
};

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// SQL injection protection for query parameters
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|\*\/|\/\*)/g,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /['"]/g,
    /(\bunion\b.*\bselect\b)/gi,
    /(\bscript\b)/gi
  ];

  const checkForSqlInjection = (value: string): boolean => {
    return sqlPatterns.some(pattern => pattern.test(value));
  };

  const validateParams = (obj: any): boolean => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && checkForSqlInjection(value)) {
        return false;
      }
    }
    return true;
  };

  if (!validateParams(req.query) || !validateParams(req.params) || 
      (req.body && !validateParams(req.body))) {
    return res.status(400).json({ error: 'Invalid request parameters detected.' });
  }

  next();
};

// Authentication middleware
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  next();
};

// Admin role middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId || !req.session?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

module.exports = {
  securityHeaders, 
  validateInput, 
  sqlInjectionProtection,
  apiLimiter,
  csrfProtection,
  requireAuth,
  strictLimiter,
  validateFileUpload
};