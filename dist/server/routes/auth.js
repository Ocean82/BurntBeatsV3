"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_schemas_js_1 = require("../../shared/auth-schemas.js");
const auth_js_1 = require("../middleware/auth.js");
const security_js_1 = require("../middleware/security.js");
const router = express_1.default.Router();
const users = new Map();
// Register endpoint
router.post('/register', security_js_1.strictLimiter, async (req, res) => {
    try {
        console.log('🔐 Registration attempt:', { email: req.body.email, username: req.body.username });
        // Validate input
        const validation = auth_schemas_js_1.registerSchema.safeParse(req.body);
        if (!validation.success) {
            console.log('❌ Registration validation failed:', validation.error.errors);
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validation.error.errors
            });
        }
        const { username, email, password } = validation.data;
        // Check if user already exists
        const existingUser = Array.from(users.values()).find(user => user.email.toLowerCase() === email.toLowerCase() ||
            user.username.toLowerCase() === username.toLowerCase());
        if (existingUser) {
            console.log('❌ User already exists:', { email, username });
            return res.status(409).json({
                success: false,
                error: 'User already exists',
                message: 'A user with this email or username already exists'
            });
        }
        // Hash password
        const passwordHash = await (0, auth_js_1.hashPassword)(password);
        // Create user
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newUser = {
            id: userId,
            username,
            email,
            passwordHash,
            createdAt: new Date()
        };
        users.set(userId, newUser);
        // Create session
        req.session.userId = userId;
        req.session.username = username;
        req.session.email = email;
        console.log('✅ User registered successfully:', { userId, username, email });
        res.status(201).json({
            success: true,
            user: {
                id: userId,
                username,
                email,
                createdAt: newUser.createdAt
            },
            message: 'Registration successful'
        });
    }
    catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed',
            message: 'An error occurred during registration. Please try again.'
        });
    }
});
// Login endpoint
router.post('/login', security_js_1.strictLimiter, async (req, res) => {
    try {
        const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
        console.log('🔐 Login attempt:', { email: req.body.email, ip: clientIp });
        // Check rate limiting
        if (!(0, auth_js_1.trackLoginAttempt)(clientIp)) {
            console.log('❌ Too many login attempts from IP:', clientIp);
            return res.status(429).json({
                success: false,
                error: 'Too many login attempts',
                message: 'Please wait 15 minutes before trying again'
            });
        }
        // Validate input
        const validation = auth_schemas_js_1.loginSchema.safeParse(req.body);
        if (!validation.success) {
            console.log('❌ Login validation failed:', validation.error.errors);
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validation.error.errors
            });
        }
        const { email, password } = validation.data;
        // Find user
        const user = Array.from(users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }
        // Verify password
        const isValidPassword = await (0, auth_js_1.verifyPassword)(password, user.passwordHash);
        if (!isValidPassword) {
            console.log('❌ Invalid password for user:', email);
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }
        // Reset login attempts on successful login
        (0, auth_js_1.resetLoginAttempts)(clientIp);
        // Create session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.email = user.email;
        console.log('✅ User logged in successfully:', { userId: user.id, username: user.username, email: user.email });
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            },
            message: 'Login successful'
        });
    }
    catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
            message: 'An error occurred during login. Please try again.'
        });
    }
});
// Logout endpoint
router.post('/logout', (req, res) => {
    try {
        const userId = req.session?.userId;
        console.log('🚪 Logout request:', { userId });
        req.session.destroy((err) => {
            if (err) {
                console.error('❌ Session destruction error:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Logout failed',
                    message: 'An error occurred during logout'
                });
            }
            res.clearCookie('sessionId');
            console.log('✅ User logged out successfully:', { userId });
            res.json({
                success: true,
                message: 'Logout successful'
            });
        });
    }
    catch (error) {
        console.error('❌ Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed',
            message: 'An error occurred during logout'
        });
    }
});
// Get current user endpoint
router.get('/me', (req, res) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated',
                message: 'Please log in to access this resource'
            });
        }
        const user = users.get(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
                message: 'User session is invalid'
            });
        }
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    }
    catch (error) {
        console.error('❌ Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user',
            message: 'An error occurred while fetching user data'
        });
    }
});
exports.default = router;
