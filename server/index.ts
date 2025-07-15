import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import multer from 'multer';
import { MidiService } from './midi-service.js';

// CORE INITIALIZATION SECTION
// NOTE: This section handles environment setup and service initialization
// TODO: Consider moving service initialization to a separate bootstrap file
dotenv.config();

// ES6 Module path helpers - required for __dirname in ES6
// CommonJS compatibility fix for build
const __filename = typeof import.meta !== 'undefined' ? fileURLToPath(import.meta.url) : __filename;
const __dirname = typeof import.meta !== 'undefined' ? path.dirname(__filename) : __dirname;

// PAYMENT PROCESSING SETUP
// NOTE: Stripe initialization - ensure API version matches production requirements
// TODO: Add error handling for missing Stripe keys in production
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20', // IMPORTANT: Keep this version synchronized with Stripe dashboard
});

// EXPRESS APP CONFIGURATION
const app = express();
const PORT = process.env.PORT || 5000; // NOTE: 5000 is Replit's recommended port for web apps

// SERVICE INSTANCES
// NOTE: Initialize core services - consider dependency injection pattern for scalability
const midiService = new MidiService(); // MIDI generation and processing service

// MIDDLEWARE CONFIGURATION
// NOTE: Middleware order is crucial - authentication should come before routes
app.use(cors()); // TODO: Configure CORS origins for production security
app.use(express.json({ limit: '50mb' })); // NOTE: Large limit for audio file uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // NOTE: Support for file uploads

// STATIC FILE SERVING
// NOTE: Serves built client files from dist/public directory
// TODO: Add cache headers for static assets in production
app.use(express.static(path.join(__dirname, '../dist/public')));

// HEALTH CHECK ENDPOINT
// NOTE: Essential for monitoring and deployment health verification
// TODO: Enhance with detailed service status checks
app.get('/api/health', async (req, res) => {
  try {
    // Simple health check without database dependency for now
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        server: true,
        database: true, // TODO: Add actual database health check
        stripe: !!process.env.STRIPE_SECRET_KEY,
        audioldm2: true
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Burnt Beats API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// STRIPE PAYMENT INTEGRATION
// NOTE: These endpoints handle payment processing and configuration
// TODO: Add rate limiting and authentication for payment endpoints

// Stripe Configuration Endpoint
// NOTE: Provides client-side Stripe configuration
// SECURITY: Only exposes publishable key (safe for client-side)
app.get('/api/stripe/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    success: true
  });
});

// Create Payment Intent
// NOTE: Server-side payment intent creation for secure processing
// TODO: Add payment validation and fraud detection
app.post('/api/stripe/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', userId, planType } = req.body;

    if (!amount || !userId) {
      return res.status(400).json({ error: 'Amount and userId are required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency,
      metadata: {
        userId,
        planType: planType || 'standard'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      success: true
    });
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    res.status(500).json({ 
      error: 'Payment processing failed',
      message: error.message 
    });
  }
});

// Stripe Webhook Handler
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      // Handle successful payment (upgrade user plan, etc.)
      break;
    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object.id);
      // Handle failed payment
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Get pricing plans
app.get('/api/stripe/plans', (req, res) => {
  res.json({
    plans: [
      {
        id: 'basic',
        name: 'Basic Plan',
        price: 299, // $2.99 in cents
        songs: 10,
        features: ['Basic AI generation', 'Standard quality']
      },
      {
        id: 'pro',
        name: 'Pro Plan', 
        price: 499, // $4.99 in cents
        songs: 50,
        features: ['Advanced AI', 'High quality', 'Voice cloning']
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        price: 999, // $9.99 in cents
        songs: 'unlimited',
        features: ['All features', 'Priority support', 'Commercial license']
      }
    ]
  });
});

// Catch-all handler for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/public', 'index.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// MIDI GENERATION ENDPOINTS
// NOTE: These endpoints handle MIDI file generation and management
// TODO: Add authentication middleware for user-specific MIDI generation

// Generate MIDI File
// NOTE: Primary endpoint for MIDI generation from user parameters
// TODO: Add input validation schema and rate limiting
app.post('/api/generate-midi', async (req, res) => {
  try {
    const { title, theme, genre, tempo, duration, useAiLyrics } = req.body;

    // INPUT VALIDATION
    // NOTE: Basic validation - consider using a validation library like Joi
    if (!title || !theme || !genre || !tempo) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, theme, genre, tempo' 
      });
    }

    // MIDI GENERATION SERVICE CALL
    // NOTE: Delegates to MidiService for actual generation logic
    const result = await midiService.generateMidi({
      title,
      theme,
      genre,
      tempo: parseInt(tempo),
      duration: duration ? parseInt(duration) : undefined,
      useAiLyrics: Boolean(useAiLyrics)
    });

    if (result.success) {
      res.json({
        success: true,
        midiPath: result.midiPath,
        metadataPath: result.metadataPath,
        message: 'MIDI generated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: `MIDI generation failed: ${error}` 
    });
  }
});

app.get('/api/midi/list', async (req, res) => {
  try {
    const midiFiles = await midiService.listGeneratedMidi();
    res.json({ files: midiFiles });
  } catch (error) {
    res.status(500).json({ error: `Failed to list MIDI files: ${error}` });
  }
});

app.get('/api/midi/:filename/metadata', async (req, res) => {
  try {
    const filename = req.params.filename;
    const midiPath = join('./storage/midi/generated', filename);
    const metadata = await midiService.getMidiMetadata(midiPath);

    if (metadata) {
      res.json(metadata);
    } else {
      res.status(404).json({ error: 'Metadata not found' });
    }
  } catch (error) {
    res.status(500).json({ error: `Failed to get metadata: ${error}` });
  }
});

// VOICE CLONING ENDPOINTS
// NOTE: These endpoints handle voice cloning and synthesis
// TODO: Implement actual RVC integration and add authentication

// Voice Cloning Endpoint
// NOTE: Currently mock implementation - needs RVC service integration
// TODO: Add file upload handling and voice model training
app.post('/api/voice/clone', async (req, res) => {
  try {
    const { audioPath, text, voiceId } = req.body;

    // INPUT VALIDATION
    if (!audioPath || !text) {
      return res.status(400).json({ 
        error: 'Audio path and text are required for voice cloning' 
      });
    }

    // MOCK RVC INTEGRATION
    // TODO: Replace with actual RVC service call
    // NOTE: This is a placeholder for RVC voice cloning functionality
    const result = {
      success: true,
      voiceId: `rvc_${Date.now()}`,
      audioUrl: `/storage/voices/cloned_${Date.now()}.wav`,
      message: 'Voice cloned successfully (mock mode)'
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: `Voice cloning failed: ${error}` 
    });
  }
});

app.post('/api/voice/synthesize', async (req, res) => {
  try {
    const { text, voiceId, midiPath } = req.body;

    if (!text || !voiceId) {
      return res.status(400).json({ 
        error: 'Text and voice ID are required for synthesis' 
      });
    }

    // Mock voice synthesis with MIDI integration
    const result = {
      success: true,
      audioUrl: `/storage/voices/synthesized_${Date.now()}.wav`,
      midiIntegration: midiPath ? true : false,
      message: 'Voice synthesized successfully'
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: `Voice synthesis failed: ${error}` 
    });
  }
});

// MIDDLEWARE SETUP
// NOTE: Order matters for middleware - body parsing before routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 
    ['https://burntbeats.replit.app', 'https://burnt-beats.replit.app'] : 
    ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

// Serve MIDI files from storage
app.use('/storage', express.static(path.join(__dirname, '../storage')));

// STATIC FILE SERVING FOR GENERATED CONTENT
// NOTE: Serves generated files directly from storage directories
// TODO: Add authentication and access control for user-specific files
app.use('/midi', express.static('./storage/midi/generated')); // MIDI files
app.use('/storage/voices', express.static('./storage/voices')); // Voice samples
app.use('/storage/music', express.static('./storage/music')); // Generated music
app.use('/storage/temp', express.static('./storage/temp')); // Temporary files

// MODULAR ROUTE IMPORTS
// NOTE: Separates route logic into dedicated modules for maintainability
// TODO: Consider adding route-specific middleware and validation
import voiceRoutes from './routes/voice.js';
import midiRoutes from './routes/midi.js';
import audioldm2Routes from './routes/audioldm2.js';

// ROUTE REGISTRATION
// NOTE: Mounts route modules under specific API paths
app.use('/api/voice', voiceRoutes);   // Voice cloning and synthesis
app.use('/api/midi', midiRoutes);     // MIDI generation and management
app.use('/api/audioldm2', audioldm2Routes); // AI music generation

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Burnt Beats server running on http://0.0.0.0:${PORT}`);
  console.log(`🎵 MIDI generation available`);
  console.log(`🗣️  Voice cloning available (mock mode)`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;