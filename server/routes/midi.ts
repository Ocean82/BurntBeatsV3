const express = require('express');
const { MidiService } = require('../midi-service');
const path = require('path');
const fs = require('fs').promises;
const { requireAuth, strictLimiter } = require('../middleware/security');

const router = express.Router();
const midiService = new MidiService();

// Generate MIDI endpoint
router.post('/generate', strictLimiter, requireAuth, async (req, res) => {
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
    const files = await midiService.listGeneratedMidi();
    const fileDetails = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join('./storage/midi/generated', filename);
        try {
          const stats = await fs.stat(filePath);
          return {
            filename,
            path: filePath,
            size: stats.size,
            created: stats.birthtime.toISOString()
          };
        } catch (error) {
          return {
            filename,
            path: filePath,
            error: 'Could not read file stats'
          };
        }
      })
    );

    res.json({
      success: true,
      files: fileDetails
    });
  } catch (error) {
    console.error('Error listing MIDI files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list MIDI files'
    });
  }
});

// Validate all MIDI files
router.post('/validate', async (req, res) => {
  try {
    const result = await midiService.validateAllMidiFiles();

    if (result.success) {
      res.json({
        success: true,
        message: 'MIDI validation completed',
        report: result.report
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error validating MIDI files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate MIDI files'
    });
  }
});

// Repair MIDI files
router.post('/repair', async (req, res) => {
  try {
    const result = await midiService.repairMidiFiles();

    if (result.success) {
      res.json({
        success: true,
        message: 'MIDI repair completed',
        fixed: result.fixed
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error repairing MIDI files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to repair MIDI files'
    });
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

// Extract groove dataset
router.post('/groove/extract', async (req, res) => {
  try {
    const result = await midiService.extractGrooveDataset();

    if (result.success) {
      res.json({
        success: true,
        message: 'Groove dataset extracted successfully',
        catalogPath: result.catalogPath
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Groove extraction error:', error);
    res.status(500).json({ error: `Groove extraction failed: ${error}` });
  }
});

// Get grooves by style
router.get('/groove/style/:style', async (req, res) => {
  try {
    const style = req.params.style;
    const grooves = await midiService.getGroovesByStyle(style);
    res.json({ style, grooves });
  } catch (error) {
    console.error('Error getting grooves by style:', error);
    res.status(500).json({ error: `Failed to get grooves: ${error}` });
  }
});

// Get grooves by tempo range
router.get('/groove/tempo/:minTempo/:maxTempo', async (req, res) => {
  try {
    const minTempo = parseInt(req.params.minTempo);
    const maxTempo = parseInt(req.params.maxTempo);

    if (isNaN(minTempo) || isNaN(maxTempo)) {
      return res.status(400).json({ error: 'Invalid tempo values' });
    }

    const grooves = await midiService.getGroovesByTempo(minTempo, maxTempo);
    res.json({ tempoRange: { min: minTempo, max: maxTempo }, grooves });
  } catch (error) {
    console.error('Error getting grooves by tempo:', error);
    res.status(500).json({ error: `Failed to get grooves: ${error}` });
  }
});

module.exports = router;