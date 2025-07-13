
import { Router } from 'express';
import path from 'path';
import fs from 'fs/promises';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: path.join(process.cwd(), 'storage', 'temp'),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Voice cloning endpoint
router.post('/clone', upload.single('audio'), async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    const audioFile = req.file;

    if (!audioFile || !text) {
      return res.status(400).json({ 
        error: 'Audio file and text are required for voice cloning' 
      });
    }

    // Mock implementation - replace with actual RVC integration
    const result = {
      success: true,
      voiceId: `rvc_${Date.now()}`,
      audioUrl: `/storage/voices/cloned_${Date.now()}.wav`,
      message: 'Voice cloned successfully (mock mode)'
    };

    res.json(result);
  } catch (error) {
    console.error('Voice cloning error:', error);
    res.status(500).json({ 
      error: 'Voice cloning failed',
      details: error.message 
    });
  }
});

// Voice synthesis endpoint
router.post('/synthesize', async (req, res) => {
  try {
    const { text, voiceId, midiPath } = req.body;

    if (!text || !voiceId) {
      return res.status(400).json({ 
        error: 'Text and voice ID are required for synthesis' 
      });
    }

    // Mock implementation
    const result = {
      success: true,
      audioUrl: `/storage/voices/synthesized_${Date.now()}.wav`,
      midiIntegration: midiPath ? true : false,
      message: 'Voice synthesized successfully'
    };

    res.json(result);
  } catch (error) {
    console.error('Voice synthesis error:', error);
    res.status(500).json({ 
      error: 'Voice synthesis failed',
      details: error.message 
    });
  }
});

// Get available voices
router.get('/available', async (req, res) => {
  try {
    const voicesDir = path.join(process.cwd(), 'storage', 'voice-bank', 'samples');
    const files = await fs.readdir(voicesDir);
    const voices = files
      .filter(file => file.endsWith('.mp3') || file.endsWith('.wav'))
      .map(file => ({
        id: file.replace(/\.(mp3|wav)$/, ''),
        name: file.replace(/\.(mp3|wav)$/, '').replace(/_/g, ' '),
        file: file
      }));

    res.json({ voices });
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch available voices',
      details: error.message 
    });
  }
});

export default router;
