import express from 'express';
import { loginSchema, registerSchema } from '../../shared/auth-schemas.js';
import { hashPassword, verifyPassword, trackLoginAttempt, resetLoginAttempts } from '../middleware/auth.js';
import { strictLimiter } from '../middleware/security.js';

const router = express.Router();

// In-memory user store (replace with database in production)
interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

const users: Map<string, User> = new Map();

// Register endpoint
router.post('/register', strictLimiter, async (req, res) => {
  try {
    console.log('🔐 Registration attempt:', { email: req.body.email, username: req.body.username });
    
    // Validate input
    const validation = registerSchema.safeParse(req.body);
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
    const existingUser = Array.from(users.values()).find(
      user => user.email.toLowerCase() === email.toLowerCase() || 
              user.username.toLowerCase() === username.toLowerCase()
    );

    if (existingUser) {
      console.log('❌ User already exists:', { email, username });
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'A user with this email or username already exists'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = {
      id: userId,
      username,
      email,
      passwordHash,
      createdAt: new Date()
    };

    users.set(userId, newUser);

    // Create session
    (req.session as any).userId = userId;
    (req.session as any).username = username;
    (req.session as any).email = email;

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

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: 'An error occurred during registration. Please try again.'
    });
  }
});

// Login endpoint
router.post('/login', strictLimiter, async (req, res) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    console.log('🔐 Login attempt:', { email: req.body.email, ip: clientIp });

    // Check rate limiting
    if (!trackLoginAttempt(clientIp)) {
      console.log('❌ Too many login attempts from IP:', clientIp);
      return res.status(429).json({
        success: false,
        error: 'Too many login attempts',
        message: 'Please wait 15 minutes before trying again'
      });
    }

    // Validate input
    const validation = loginSchema.safeParse(req.body);
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
    const user = Array.from(users.values()).find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Reset login attempts on successful login
    resetLoginAttempts(clientIp);

    // Create session
    (req.session as any).userId = user.id;
    (req.session as any).username = user.username;
    (req.session as any).email = user.email;

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

  } catch (error) {
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
    const userId = (req.session as any)?.userId;
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

  } catch (error) {
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
    const userId = (req.session as any)?.userId;
    
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

  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user',
      message: 'An error occurred while fetching user data'
    });
  }
});

export default router;
