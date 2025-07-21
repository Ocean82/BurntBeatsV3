"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const audioldm2_service_js_1 = require("../audioldm2-service.js");
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const audioldm2Service = new audioldm2_service_js_1.AudioLDM2Service();
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    dest: path_1.default.join(process.cwd(), 'storage', 'temp'),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
});
// Generate personalized music
router.post('/generate', async (req, res) => {
    try {
        const { prompt, instanceWord, objectClass, audioLength = 10.0 } = req.body;
        if (!prompt || prompt.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required and cannot be empty',
                details: 'Please provide a valid music description'
            });
        }
        if (prompt.trim().length > 500) {
            return res.status(400).json({
                success: false,
                error: 'Prompt too long',
                details: 'Please keep your description under 500 characters'
            });
        }
        const outputDir = path_1.default.join(process.cwd(), 'storage', 'music', 'generated');
        await fs_1.promises.mkdir(outputDir, { recursive: true });
        const config = {
            modelPath: 'cvssp/audioldm2',
            outputDir,
            instanceWord: instanceWord?.trim() || undefined,
            objectClass: objectClass?.trim() || undefined,
            audioLengthInS: Math.min(Math.max(audioLength, 5), 30), // Clamp between 5-30 seconds
        };
        const audioFile = await audioldm2Service.generatePersonalizedMusic(prompt.trim(), config);
        if (!audioFile) {
            throw new Error('Audio generation service returned no file');
        }
        res.json({
            success: true,
            audioFile: path_1.default.basename(audioFile),
            message: 'Music generated successfully',
            prompt: prompt.trim(),
            duration: config.audioLengthInS
        });
    }
    catch (error) {
        console.error('AudioLDM2 generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate music',
            details: error instanceof Error ? error.message : 'Unknown error occurred',
            message: 'Music generation failed. Please try again.'
        });
    }
});
// Train a personalized model
router.post('/train', upload.array('audio_files'), async (req, res) => {
    try {
        const { instanceWord, objectClass, maxTrainSteps = 300 } = req.body;
        if (!instanceWord || !objectClass) {
            return res.status(400).json({
                error: 'Instance word and object class are required'
            });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'Audio files are required for training'
            });
        }
        // Create training directory
        const trainingDir = path_1.default.join(process.cwd(), 'storage', 'models', 'training', `${instanceWord}_${objectClass}_${Date.now()}`);
        await fs_1.promises.mkdir(trainingDir, { recursive: true });
        // Move uploaded files to training directory
        const files = req.files;
        for (const file of files) {
            const destPath = path_1.default.join(trainingDir, file.originalname);
            await fs_1.promises.rename(file.path, destPath);
        }
        const outputDir = path_1.default.join(process.cwd(), 'storage', 'models', 'audioldm2', `${instanceWord}_${objectClass}`);
        const config = {
            dataDir: trainingDir,
            instanceWord,
            objectClass,
            outputDir,
            maxTrainSteps: parseInt(maxTrainSteps),
        };
        // Start training (this will run in background)
        audioldm2Service.trainDreamBooth(config)
            .then(modelPath => {
            console.log('Training completed:', modelPath);
        })
            .catch(error => {
            console.error('Training failed:', error);
        });
        res.json({
            success: true,
            message: 'Training started successfully',
            trainingId: path_1.default.basename(outputDir)
        });
    }
    catch (error) {
        console.error('Training error:', error);
        res.status(500).json({
            error: 'Failed to start training',
            details: error.message
        });
    }
});
// Get available models
router.get('/models', async (req, res) => {
    try {
        const models = await audioldm2Service.getAvailableModels();
        res.json({ models });
    }
    catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({
            error: 'Failed to fetch models',
            details: error.message
        });
    }
});
// Get training status
router.get('/training/:trainingId/status', async (req, res) => {
    try {
        const { trainingId } = req.params;
        const modelDir = path_1.default.join(process.cwd(), 'storage', 'models', 'audioldm2', trainingId);
        try {
            await fs_1.promises.access(path_1.default.join(modelDir, 'trained_pipeline'));
            res.json({ status: 'completed' });
        }
        catch {
            // Check if training is in progress
            try {
                await fs_1.promises.access(modelDir);
                res.json({ status: 'training' });
            }
            catch {
                res.json({ status: 'not_found' });
            }
        }
    }
    catch (error) {
        console.error('Error checking training status:', error);
        res.status(500).json({
            error: 'Failed to check training status',
            details: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=audioldm2.js.map