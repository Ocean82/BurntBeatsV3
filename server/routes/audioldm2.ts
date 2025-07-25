import express from 'express';
import { AudioLDM2Service } from '../audioldm2-service.js';
import path from 'path';
import { promises as fs } from 'fs';
import multer from 'multer';

const router = express.Router();
const audioldm2Service = new AudioLDM2Service();

// Configure multer for file uploads
const upload = multer({
  dest: path.join(process.cwd(), 'storage', 'temp'),
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

    const outputDir = path.join(process.cwd(), 'storage', 'music', 'generated');
    await fs.mkdir(outputDir, { recursive: true });

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
      audioFile: path.basename(audioFile),
      message: 'Music generated successfully',
      prompt: prompt.trim(),
      duration: config.audioLengthInS
    });

  } catch (error) {
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
    const trainingDir = path.join(
      process.cwd(), 
      'storage', 
      'models', 
      'training', 
      `${instanceWord}_${objectClass}_${Date.now()}`
    );
    await fs.mkdir(trainingDir, { recursive: true });

    // Move uploaded files to training directory
    const files = req.files as Express.Multer.File[];
    for (const file of files) {
      const destPath = path.join(trainingDir, file.originalname);
      await fs.rename(file.path, destPath);
    }

    const outputDir = path.join(process.cwd(), 'storage', 'models', 'audioldm2', `${instanceWord}_${objectClass}`);

    const config = {
      modelPath: 'cvssp/audioldm2',
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
      trainingId: path.basename(outputDir)
    });

  } catch (error) {
    console.error('Training error:', error);
    res.status(500).json({ 
      error: 'Failed to start training',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Get available models
router.get('/models', async (req, res) => {
  try {
    const models = await audioldm2Service.getAvailableModels();
    res.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ 
      error: 'Failed to fetch models',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Get training status
router.get('/training/:trainingId/status', async (req, res) => {
  try {
    const { trainingId } = req.params;
    const modelDir = path.join(process.cwd(), 'storage', 'models', 'audioldm2', trainingId);

    try {
      await fs.access(path.join(modelDir, 'trained_pipeline'));
      res.json({ status: 'completed' });
    } catch {
      // Check if training is in progress
      try {
        await fs.access(modelDir);
        res.json({ status: 'training' });
      } catch {
        res.json({ status: 'not_found' });
      }
    }
  } catch (error) {
    console.error('Error checking training status:', error);
    res.status(500).json({ 
      error: 'Failed to check training status',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;