"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xssProtection = exports.validateRequest = exports.validateAudioFile = exports.usernameSchema = exports.emailSchema = exports.strictStringSchema = void 0;
const zod_1 = require("zod");
// Enhanced validation schemas
exports.strictStringSchema = zod_1.z.string()
    .min(1)
    .max(1000)
    .regex(/^[a-zA-Z0-9\s\-_.,!?'"]+$/, 'Invalid characters detected');
exports.emailSchema = zod_1.z.string()
    .email('Invalid email format')
    .max(254);
exports.usernameSchema = zod_1.z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores');
// File validation
const validateAudioFile = (file) => {
    const allowedMimeTypes = [
        'audio/mp3',
        'audio/wav',
        'audio/flac',
        'audio/m4a',
        'audio/mpeg',
        'audio/x-wav'
    ];
    const allowedExtensions = ['.mp3', '.wav', '.flac', '.m4a'];
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return false;
    }
    if (file.size > maxSize) {
        return false;
    }
    const hasValidExtension = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
    return hasValidExtension;
};
exports.validateAudioFile = validateAudioFile;
// Enhanced request validation
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: result.error.issues
                });
            }
            req.body = result.data;
            next();
        }
        catch (error) {
            return res.status(400).json({
                error: 'Invalid request format'
            });
        }
    };
};
exports.validateRequest = validateRequest;
// XSS protection validation
const xssProtection = (req, res, next) => {
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
        /<link/gi,
        /<meta/gi
    ];
    const checkForXSS = (value) => {
        return xssPatterns.some(pattern => pattern.test(value));
    };
    const validateObject = (obj) => {
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string' && checkForXSS(value)) {
                return false;
            }
            if (typeof value === 'object' && value !== null && !validateObject(value)) {
                return false;
            }
        }
        return true;
    };
    if (req.body && !validateObject(req.body)) {
        return res.status(400).json({ error: 'Potentially malicious content detected.' });
    }
    if (req.query && !validateObject(req.query)) {
        return res.status(400).json({ error: 'Potentially malicious content detected.' });
    }
    next();
};
exports.xssProtection = xssProtection;
//# sourceMappingURL=validation.js.map