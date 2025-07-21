import bcrypt from 'bcrypt';
import { z } from 'zod';
// Password validation schema
const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
export const validatePassword = (password) => {
    try {
        passwordSchema.parse(password);
        return true;
    }
    catch {
        return false;
    }
};
export const hashPassword = async (password) => {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
};
export const verifyPassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};
// Secure session configuration
export const sessionConfig = {
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
export const trackLoginAttempt = (ip) => {
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
export const resetLoginAttempts = (ip) => {
    loginAttempts.delete(ip);
};
