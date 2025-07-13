
import { Router } from 'express';
import { MidiService } from '../midi-service.js';
import path from 'path';
import fs from 'fs/promises';

const router = Router();
const midiService = new MidiService();

// Generate MIDI endpoint
router.post('/generate', async (req, res) => {
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
    console.error('MIDI generation error:', error);
    res.status(500).json({ 
      error: `MIDI generation failed: ${error}` 
    });
  }
});

// List generated MIDI files
router.get('/list', async (req, res) => {
  try {
    const midiFiles = await midiService.listGeneratedMidi();
    res.json({ files: midiFiles });
  } catch (error) {
    console.error('Error listing MIDI files:', error);
    res.status(500).json({ error: `Failed to list MIDI files: ${error}` });
  }
});

// Get MIDI metadata
router.get('/:filename/metadata', async (req, res) => {
  try {
    const filename = req.params.filename;
    const midiPath = path.join('./storage/midi/generated', filename);
    const metadata = await midiService.getMidiMetadata(midiPath);

    if (metadata) {
      res.json(metadata);
    } else {
      res.status(404).json({ error: 'Metadata not found' });
    }
  } catch (error) {
    console.error('Error getting metadata:', error);
    res.status(500).json({ error: `Failed to get metadata: ${error}` });
  }
});

export default router;
