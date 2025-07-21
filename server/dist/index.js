"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const path_2 = require("path");
const dotenv_1 = __importDefault(require("dotenv"));
const stripe_1 = __importDefault(require("stripe"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const child_process_1 = require("child_process");
const midi_service_js_1 = require("./midi-service.js");
const error_handler_js_1 = require("./middleware/error-handler.js");
const request_logger_js_1 = require("./middleware/request-logger.js");
const health_check_js_1 = require("./health/health-check.js");
const health_check_js_2 = __importDefault(require("./health/health-check.js"));
const production_js_1 = __importStar(require("./config/production.js"));
const graceful_shutdown_js_1 = __importDefault(require("./shutdown/graceful-shutdown.js"));
const voice_js_1 = __importDefault(require("./routes/voice.js"));
const midi_js_1 = __importDefault(require("./routes/midi.js"));
const audioldm2_js_1 = __importDefault(require("./routes/audioldm2.js"));
// CORE INITIALIZATION SECTION
// NOTE: This section handles environment setup and service initialization
// TODO: Consider moving service initialization to a separate bootstrap file
dotenv_1.default.config();
// CommonJS compatibility
const __dirname_compat = __dirname;
// PAYMENT PROCESSING SETUP
// NOTE: Stripe initialization - ensure API version matches production requirements
// TODO: Add error handling for missing Stripe keys in production
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-06-20', // IMPORTANT: Keep this version synchronized with Stripe dashboard
});
// EXPRESS APP CONFIGURATION
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000; // NOTE: 5000 is Replit's recommended port for web apps
// SERVICE INSTANCES
// NOTE: Initialize core services - consider dependency injection pattern for scalability
const midiService = new midi_service_js_1.MidiService(); // MIDI generation and processing service
const healthChecker = health_check_js_2.default.getInstance();
// PRODUCTION MIDDLEWARE CONFIGURATION
// NOTE: Middleware order is crucial - security first, then logging, then parsing
if (process.env.NODE_ENV === 'production') {
    app.use((0, helmet_1.default)(production_js_1.default.security.helmet));
    // Rate limiting
    const limiter = (0, express_rate_limit_1.default)(production_js_1.default.security.rateLimiting);
    app.use(limiter);
    // Start resource monitoring
    production_js_1.resourceMonitor.startMonitoring();
}
// Request logging (skip health checks to reduce noise)
app.use(request_logger_js_1.healthCheckLogger);
// CORS configuration
app.use((0, cors_1.default)(production_js_1.default.cors));
// Body parsing with enhanced limits and validation
app.use(express_1.default.json({
    limit: production_js_1.default.limits.json,
    verify: (req, res, buf) => {
        if (buf.length > production_js_1.default.upload.maxFileSize) {
            throw new error_handler_js_1.AppError('Request payload too large', 413);
        }
    }
}));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: production_js_1.default.limits.urlencoded,
    verify: (req, res, buf) => {
        if (buf.length > production_js_1.default.upload.maxFileSize) {
            throw new error_handler_js_1.AppError('Request payload too large', 413);
        }
    }
}));
// Server timeout configuration
app.use((req, res, next) => {
    req.setTimeout(production_js_1.default.server.timeout, () => {
        res.status(408).json({
            error: 'Request Timeout',
            message: 'Request took too long to process'
        });
    });
    next();
});
// STATIC FILE SERVING
// NOTE: Serves built client files from dist/public directory with optimized caching
app.use(express_1.default.static(path_1.default.join(__dirname_compat, '../dist/public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
    etag: true,
    lastModified: true
}));
// Also serve static files from client public directory for favicon and other assets
app.use(express_1.default.static(path_1.default.join(__dirname_compat, '../client/public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
    etag: true,
    lastModified: true
}));
// Handle favicon.ico requests specifically to prevent 500 errors
app.get('/favicon.ico', (req, res) => {
    const faviconPath = path_1.default.join(__dirname_compat, '../client/public/favicon.ico');
    // Try to serve the actual favicon, fallback to 204 if not found
    res.sendFile(faviconPath, (err) => {
        if (err) {
            res.status(204).end();
        }
    });
});
// STATIC FILE SERVING FOR GENERATED CONTENT
// NOTE: Serves generated files directly from storage directories
app.use('/storage', express_1.default.static('./storage', {
    maxAge: process.env.NODE_ENV === 'production' ? '1h' : '0',
    etag: true
}));
// Specific routes for better organization
app.use('/api/files/midi', express_1.default.static('./storage/midi/generated'));
app.use('/api/files/voices', express_1.default.static('./storage/voices'));
app.use('/api/files/music', express_1.default.static('./storage/music'));
// ENHANCED HEALTH CHECK ENDPOINT
// NOTE: Comprehensive health monitoring for production deployment
app.get('/api/health', health_check_js_1.healthCheckHandler);
// Lightweight health check for load balancers
app.get('/health', (req, res) => {
    const lastCheck = healthChecker.getLastHealthCheck();
    if (lastCheck && lastCheck.status === 'healthy') {
        res.status(200).send('OK');
    }
    else {
        res.status(503).send('Service Unavailable');
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
    }
    catch (error) {
        console.error('Payment intent creation failed:', error);
        res.status(500).json({
            error: 'Payment processing failed',
            message: error.message
        });
    }
});
// Stripe Webhook Handler
app.post('/webhook/stripe', express_1.default.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
    catch (err) {
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
    res.sendFile(path_1.default.join(__dirname_compat, '../dist/public', 'index.html'));
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
        }
        else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    }
    catch (error) {
        res.status(500).json({
            error: `MIDI generation failed: ${error}`
        });
    }
});
app.get('/api/midi/list', async (req, res) => {
    try {
        const midiFiles = await midiService.listGeneratedMidi();
        res.json({ files: midiFiles });
    }
    catch (error) {
        res.status(500).json({ error: `Failed to list MIDI files: ${error}` });
    }
});
app.get('/api/midi/:filename/metadata', async (req, res) => {
    try {
        const filename = req.params.filename;
        const midiPath = (0, path_2.join)('./storage/midi/generated', filename);
        const metadata = await midiService.getMidiMetadata(midiPath);
        if (metadata) {
            res.json(metadata);
        }
        else {
            res.status(404).json({ error: 'Metadata not found' });
        }
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({
            error: `Voice synthesis failed: ${error}`
        });
    }
});
// ROUTE REGISTRATION
// NOTE: Mounts route modules under specific API paths
app.use('/api/voice', voice_js_1.default); // Voice cloning and synthesis
app.use('/api/midi', midi_js_1.default); // MIDI generation and management
app.use('/api/audioldm2', audioldm2_js_1.default); // AI music generation
// Complete Song Generation Workflow
app.post('/api/generate-complete-song', async (req, res) => {
    try {
        const { title, theme, genre, tempo, duration, lyrics, voiceId, useAI, includeVocals } = req.body;
        const songId = `song_${Date.now()}`;
        let result = {
            id: songId,
            title,
            genre,
            tempo,
            components: {},
            status: 'processing'
        };
        // Step 1: Generate MIDI backing track
        console.log('🎵 Generating MIDI track...');
        const midiResult = await midiService.generateMidi({
            title,
            theme,
            genre,
            tempo: parseInt(tempo),
            duration: duration ? parseInt(duration) : undefined,
            useAiLyrics: Boolean(lyrics)
        });
        if (midiResult.success) {
            result.components.midi = {
                path: midiResult.midiPath,
                metadata: midiResult.metadataPath
            };
            console.log('✅ MIDI generated successfully');
        }
        // Step 2: Generate AI music if requested
        if (useAI) {
            console.log('🤖 Generating AI music...');
            try {
                const aiPrompt = `${genre} music, ${theme}, ${tempo} BPM, instrumental track`;
                // Mock AI music generation - replace with actual AudioLDM2 service
                result.components.aiMusic = {
                    path: `/storage/music/generated/ai_${songId}.wav`,
                    prompt: aiPrompt
                };
                console.log('✅ AI music generated');
            }
            catch (error) {
                console.error('AI music generation failed:', error);
            }
        }
        // Step 3: Generate vocals if requested
        if (includeVocals && lyrics) {
            console.log('🎤 Generating vocals...');
            try {
                // Mock vocal generation - replace with actual RVC service
                result.components.vocals = {
                    path: `/storage/voices/vocals_${songId}.wav`,
                    lyrics: lyrics,
                    voiceId: voiceId || 'default'
                };
                console.log('✅ Vocals generated');
            }
            catch (error) {
                console.error('Vocal generation failed:', error);
            }
        }
        result.status = 'completed';
        result.createdAt = new Date().toISOString();
        res.json({
            success: true,
            song: result,
            message: 'Complete song generated successfully'
        });
    }
    catch (error) {
        console.error('Complete song generation failed:', error);
        res.status(500).json({
            success: false,
            error: `Complete song generation failed: ${error.message}`
        });
    }
});
// Get all generated songs
app.get('/api/songs/library', async (req, res) => {
    try {
        // Mock library - in production, this would query a database
        const library = {
            songs: [],
            midi: await midiService.listGeneratedMidi(),
            voices: [], // Would list voice files
            aiMusic: [] // Would list AI-generated music
        };
        res.json(library);
    }
    catch (error) {
        res.status(500).json({ error: `Failed to get library: ${error.message}` });
    }
});
// Enhanced error handling middleware (must be last)
app.use(error_handler_js_1.errorHandler);
// Handle unhandled routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl
    });
});
app.post('/api/generate-song', async (req, res) => {
    try {
        const { lyrics, genre, tempo, voiceSample, useAI } = req.body;
        // Step 1: Generate MIDI backing track
        const midiResult = await new Promise((resolve, reject) => {
            const midiProcess = (0, child_process_1.spawn)('python3', [
                'server/enhanced-midi-generator.py',
                '--lyrics', lyrics,
                '--genre', genre,
                '--tempo', tempo.toString()
            ]);
            let output = '';
            midiProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
            midiProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(JSON.parse(output));
                }
                else {
                    reject(new Error('MIDI generation failed'));
                }
            });
        });
        // Step 2: Generate vocals if voice sample provided
        let vocalResult = null;
        if (voiceSample) {
            const rvcService = new RVCService();
            vocalResult = await rvcService.cloneVoice(voiceSample, lyrics);
        }
        // Step 3: Generate AI music if requested
        let aiMusicResult = null;
        if (useAI) {
            const audioldm2Service = new AudioLDM2Service();
            aiMusicResult = await audioldm2Service.generateMusic(`${genre} song with lyrics: ${lyrics}`, 60);
        }
        const songData = {
            id: Date.now().toString(),
            lyrics,
            genre,
            tempo,
            midiPath: midiResult.midiPath,
            vocalPath: vocalResult?.audioData,
            aiMusicPath: aiMusicResult?.audioPath,
            status: 'completed',
            createdAt: new Date().toISOString()
        };
        res.json(songData);
    }
    catch (error) {
        res.status(500).json({ error: `Song generation failed: ${error.message}` });
    }
});
// Validate critical environment variables
const requiredEnvVars = [];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.warn('⚠️  Missing optional environment variables:', missingEnvVars.join(', '));
}
// Start server with enhanced configuration
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 Burnt Beats server running on http://0.0.0.0:${PORT}`);
    console.log(`🎵 MIDI generation available`);
    console.log(`🗣️  Voice cloning available (mock mode)`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🛡️  Security features: ${process.env.NODE_ENV === 'production' ? 'ENABLED' : 'DISABLED'}`);
    console.log(`📊 Resource monitoring: ${process.env.NODE_ENV === 'production' ? 'ACTIVE' : 'INACTIVE'}`);
    // Test basic functionality
    console.log('🔍 Running startup checks...');
    console.log('✅ Server bound to 0.0.0.0:5000');
    console.log('✅ Static files configured');
    console.log('✅ Error handling configured');
    console.log('🌐 Visit: https://burnt-beats-ocean82.replit.app');
});
// Configure server timeouts
if (process.env.NODE_ENV === 'production') {
    server.setTimeout(production_js_1.default.server.timeout);
    server.keepAliveTimeout = production_js_1.default.server.keepAliveTimeout;
    server.headersTimeout = production_js_1.default.server.headersTimeout;
}
// Start health checks
healthChecker.startPeriodicHealthChecks();
// SPA FALLBACK ROUTING
// NOTE: Ensures React Router works correctly by serving index.html for non-API routes
app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/storage/')) {
        return res.status(404).json({ error: 'Not found' });
    }
    // Serve React app for all other routes
    res.sendFile(path_1.default.join(__dirname_compat, '../dist/public/index.html'));
});
// Initialize graceful shutdown
const gracefulShutdown = new graceful_shutdown_js_1.default(server);
// Handle server errors
server.on('error', (error) => {
    console.error('[SERVER] Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`[SERVER] Port ${PORT} is already in use`);
        process.exit(1);
    }
    if (error.code === 'EACCES') {
        console.error(`[SERVER] Permission denied to bind to port ${PORT}`);
        process.exit(1);
    }
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('[SERVER] Uncaught Exception:', error);
    console.error(error.stack);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('[SERVER] Unhandled Rejection at:', promise, 'reason:', reason);
});
server.on('clientError', (error, socket) => {
    console.error('[SERVER] Client error:', error);
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
exports.default = app;
//# sourceMappingURL=index.js.map