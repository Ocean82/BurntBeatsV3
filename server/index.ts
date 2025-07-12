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

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

const app = express();
const PORT = process.env.PORT || 5000;

const midiService = new MidiService();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbHealth = await dbOperations.healthCheck();
  res.json({ 
    status: dbHealth.status,
    timestamp: new Date().toISOString(),
    services: {
      server: true,
      database: dbHealth.database,
      stripe: !!process.env.STRIPE_SECRET_KEY
    }
  });
});

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Burnt Beats API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Stripe Configuration Endpoint
app.get('/api/stripe/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    success: true
  });
});

// Create Payment Intent
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
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// MIDI Generation Routes
app.post('/api/generate-midi', async (req, res) => {
  try {
    const { title, theme, genre, tempo, duration, useAiLyrics } = req.body;

    if (!title || !theme || !genre || !tempo) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, theme, genre, tempo' 
      });
    }

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

// Serve MIDI files
app.use('/midi', express.static('./storage/midi/generated'));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Burnt Beats server running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;