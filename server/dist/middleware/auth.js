"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetLoginAttempts = exports.trackLoginAttempt = exports.sessionConfig = exports.verifyPassword = exports.hashPassword = exports.validatePassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
// Password validation schema
const passwordSchema = zod_1.z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
const validatePassword = (password) => {
    try {
        passwordSchema.parse(password);
        return true;
    }
    catch {
        return false;
    }
};
exports.validatePassword = validatePassword;
const hashPassword = async (password) => {
    const saltRounds = 12;
    return bcrypt_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const verifyPassword = async (password, hash) => {
    return bcrypt_1.default.compare(password, hash);
};
exports.verifyPassword = verifyPassword;
// Secure session configuration
exports.sessionConfig = {
    name: 'sessionId',
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict'
    }
};
// Login attempt tracking
const loginAttempts = new Map();
const trackLoginAttempt = (ip) => {
    const now = Date.now();
    const attempt = loginAttempts.get(ip);
    if (!attempt) {
        loginAttempts.set(ip, { count: 1, lastAttempt: now });
        return true;
    }
    // Reset if more than 15 minutes have passed
    if (now - attempt.lastAttempt > 15 * 60 * 1000) {
        loginAttempts.set(ip, { count: 1, lastAttempt: now });
        return true;
    }
    // Block if more than 5 attempts in 15 minutes
    if (attempt.count >= 5) {
        return false;
    }
    attempt.count++;
    attempt.lastAttempt = now;
    return true;
};
exports.trackLoginAttempt = trackLoginAttempt;
const resetLoginAttempts = (ip) => {
    loginAttempts.delete(ip);
};
exports.resetLoginAttempts = resetLoginAttempts;
//# sourceMappingURL=auth.js.map