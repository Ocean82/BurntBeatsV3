"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireAuth = exports.sqlInjectionProtection = exports.securityHeaders = exports.validateFileUpload = exports.csrfProtection = exports.validateInput = exports.strictLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
// Rate limiting configuration
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 15 * 60 * 1000
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.strictLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 requests per windowMs for sensitive endpoints
    message: {
        error: 'Rate limit exceeded for sensitive operations.',
        retryAfter: 15 * 60 * 1000
    }
});
// Input validation middleware
const validateInput = (req, res, next) => {
    const sanitizeString = (str) => {
        if (typeof str !== 'string')
            return '';
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    };
    const sanitizeObject = (obj) => {
        if (typeof obj === 'string') {
            return sanitizeString(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
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
exports.validateInput = validateInput;
// CSRF protection
const csrfProtection = (req, res, next) => {
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
exports.csrfProtection = csrfProtection;
// File upload validation
const validateFileUpload = (req, res, next) => {
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
    const hasValidExtension = validExtensions.some(ext => req.file.originalname.toLowerCase().endsWith(ext));
    if (!hasValidExtension) {
        return res.status(400).json({ error: 'Invalid file extension.' });
    }
    next();
};
exports.validateFileUpload = validateFileUpload;
// Security headers configuration
exports.securityHeaders = (0, helmet_1.default)({
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
const sqlInjectionProtection = (req, res, next) => {
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
        /(--|\*\/|\/\*)/g,
        /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
        /['"]/g,
        /(\bunion\b.*\bselect\b)/gi,
        /(\bscript\b)/gi
    ];
    const checkForSqlInjection = (value) => {
        return sqlPatterns.some(pattern => pattern.test(value));
    };
    const validateParams = (obj) => {
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
exports.sqlInjectionProtection = sqlInjectionProtection;
// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session?.userId) {
        return res.status(401).json({ error: 'Authentication required.' });
    }
    next();
};
exports.requireAuth = requireAuth;
// Admin role middleware
const requireAdmin = (req, res, next) => {
    if (!req.session?.userId || !req.session?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
