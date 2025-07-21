import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import multer from 'multer';
import { spawn } from 'child_process';
import { requireAuth, strictLimiter, validateFileUpload } from '../middleware/security.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: path.join(process.cwd(), 'storage', 'temp'),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Security: Only allow audio files
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg', 'audio/aac'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  },
});

// Extract voice features endpoint
router.post('/extract-features', upload.single('audio'), async (req, res) => {
  try {
    const { voiceId } = req.body;
    const audioFile = req.file;

    if (!audioFile || !voiceId) {
      return res.status(400).json({ 
        error: 'Audio file and voice ID are required' 
      });
    }

    // Input validation
    if (!/^[a-zA-Z0-9_-]+$/.test(voiceId)) {
      return res.status(400).json({ 
        error: 'Invalid voice ID format' 
      });
    }

    // Execute RVC feature extraction
    const result = await executeRVCScript([
      '--action', 'extract',
      '--audio', audioFile.path,
      '--voice-id', voiceId
    ]);

    // Clean up temp file
    await fs.unlink(audioFile.path);

    if (result.success) {
      res.json({
        success: true,
        voiceId: result.voice_id,
        features: {
          f0Path: result.f0_path,
          contentPath: result.content_path,
          embeddingPath: result.embedding_path
        },
        message: 'Voice features extracted successfully'
      });
    } else {
      res.status(500).json({ 
        error: 'Feature extraction failed',
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Voice feature extraction error:', error);
    res.status(500).json({ 
      error: 'Voice feature extraction failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Voice synthesis endpoint
router.post('/synthesize', async (req, res) => {
  try {
    const { text, voiceId, style = 'natural' } = req.body;

    // Input validation
    if (!text || !voiceId) {
      return res.status(400).json({ 
        success: false,
        error: 'Text and voice ID are required for synthesis',
        details: 'Both text content and voice selection are mandatory'
      });
    }

    // Sanitize inputs
    const sanitizedText = text.replace(/[<>]/g, '').trim();
    if (sanitizedText.length === 0 || sanitizedText.length > 1000) {
      return res.status(400).json({ 
        success: false,
        error: 'Text must be between 1 and 1000 characters',
        details: `Current length: ${sanitizedText.length} characters`
      });
    }

    // Execute RVC voice cloning
    const result = await executeRVCScript([
      '--action', 'clone',
      '--voice-id', voiceId,
      '--text', sanitizedText,
      '--style', style
    ]);

    if (result && result.success) {
      res.json({
        success: true,
        audioUrl: `/storage/voices/${path.basename(result.audio_path)}`,
        voiceId: result.voice_id,
        message: 'Voice synthesized successfully',
        filename: path.basename(result.audio_path),
        text: sanitizedText,
        style
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Voice synthesis failed',
        details: result?.error || 'RVC processing error',
        message: 'Unable to generate voice. Please try again.'
      });
    }
  } catch (error) {
    console.error('Voice synthesis error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Voice synthesis failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      message: 'Voice synthesis service error. Please try again later.'
    });
  }
});

// Get available voices
router.get('/available', async (req, res) => {
  try {
    const result = await executeRVCScript(['--action', 'list']);

    if (Array.isArray(result)) {
      res.json({ voices: result });
    } else {
      res.json({ voices: [] });
    }
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch available voices',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Voice model training endpoint
router.post('/train', upload.array('audio_files', 10), async (req, res) => {
  try {
    const { voiceId, epochs = 100 } = req.body;
    const audioFiles = req.files as Express.Multer.File[];

    if (!voiceId || !audioFiles || audioFiles.length === 0) {
      return res.status(400).json({ 
        error: 'Voice ID and audio files are required for training' 
      });
    }

    // Validate file count
    if (audioFiles.length > 10) {
      return res.status(400).json({ 
        error: 'Maximum 10 audio files allowed for training' 
      });
    }

    // Create training directory
    const trainingDir = path.join(
      process.cwd(), 
      'storage', 
      'voices', 
      'training', 
      `${voiceId}_${Date.now()}`
    );
    await fs.mkdir(trainingDir, { recursive: true });

    // Move uploaded files to training directory
    const trainingFiles = [];
    for (const file of audioFiles) {
      const destPath = path.join(trainingDir, file.originalname);
      await fs.rename(file.path, destPath);
      trainingFiles.push(destPath);
    }

    // Start training process (async)
    const trainingId = path.basename(trainingDir);
    startTrainingProcess(voiceId, trainingDir, parseInt(epochs));

    res.json({
      success: true,
      message: 'Voice training started',
      trainingId,
      filesProcessed: trainingFiles.length
    });
  } catch (error) {
    console.error('Voice training error:', error);
    res.status(500).json({ 
      error: 'Voice training failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Training status endpoint
router.get('/training/:trainingId/status', async (req, res) => {
  try {
    const { trainingId } = req.params;

    // Check training status
    const trainingDir = path.join(
      process.cwd(), 
      'storage', 
      'voices', 
      'training', 
      trainingId
    );

    const statusFile = path.join(trainingDir, 'status.json');

    try {
      const statusData = await fs.readFile(statusFile, 'utf-8');
      const status = JSON.parse(statusData);
      res.json(status);
    } catch {
      res.json({ 
        status: 'not_found',
        message: 'Training session not found'
      });
    }
  } catch (error) {
    console.error('Error checking training status:', error);
    res.status(500).json({ 
      error: 'Failed to check training status',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Helper function to execute RVC script
async function executeRVCScript(args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'server', 'rvc-integration.py');
    const pythonProcess = spawn('python3', [scriptPath, ...args]);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } catch (error) {
          reject(new Error('Failed to parse RVC output'));
        }
      } else {
        reject(new Error(stderr || 'RVC script execution failed'));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(error);
    });
  });
}

// Helper function to start training process
async function startTrainingProcess(voiceId: string, trainingDir: string, epochs: number) {
  try {
    const statusFile = path.join(trainingDir, 'status.json');

    // Update status to training
    await fs.writeFile(statusFile, JSON.stringify({
      status: 'training',
      voiceId,
      progress: 0,
      epochs,
      startTime: new Date().toISOString()
    }));

    // Simulate training process
    setTimeout(async () => {
      try {
        // Update status to completed
        await fs.writeFile(statusFile, JSON.stringify({
          status: 'completed',
          voiceId,
          progress: 100,
          epochs,
          startTime: new Date().toISOString(),
          completedTime: new Date().toISOString()
        }));

        console.log(`Training completed for voice: ${voiceId}`);
      } catch (error) {
        console.error('Training completion error:', error);
      }
    }, 30000); // 30 seconds for demo
  } catch (error) {
    console.error('Training process error:', error);
  }
}

export default router;