import express from 'express';
import { MidiService } from '../midi-service.js';
import path from 'path';
import fs from 'fs';
import { requireAuth, strictLimiter } from '../middleware/security.js';
import midiCatalogRouter from './midi-catalog.js';
const router = express.Router();
const midiService = new MidiService();
// Mount catalog routes
router.use('/catalog', midiCatalogRouter);
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
        }
        else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    }
    catch (error) {
        console.error('MIDI generation error:', error);
        res.status(500).json({
            error: `MIDI generation failed: ${error}`
        });
    }
});
// List generated MIDI files
router.get('/list', async (req, res) => {
    const timer = req.timing?.startTimer('midi-list');
    try {
        const fileSystemTimer = req.timing?.startTimer('filesystem');
        const midiDir = path.join(__dirname, '../../storage/midi/generated');
        if (!fs.existsSync(midiDir)) {
            fileSystemTimer?.end('Directory check');
            timer?.end('MIDI file listing');
            return res.json({ files: [] });
        }
        const files = fs.readdirSync(midiDir)
            .filter((file) => file.endsWith('.mid') || file.endsWith('.midi'))
            .map((filename) => {
            const filePath = path.join(midiDir, filename);
            const stats = fs.statSync(filePath);
            return {
                filename,
                path: `/storage/midi/generated/${filename}`,
                size: stats.size,
                created: stats.ctime.toISOString()
            };
        });
        fileSystemTimer?.end('File system operations');
        req.timing?.addMetric('file-count', files.length, 'Number of MIDI files found');
        timer?.end('MIDI file listing');
        res.json({ files, count: files.length });
    }
    catch (error) {
        timer?.end('MIDI file listing (error)');
        console.error('Error listing MIDI files:', error);
        res.status(500).json({
            error: 'Failed to list MIDI files',
            details: error instanceof Error ? error.message : 'Unknown error'
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
        }
        else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    }
    catch (error) {
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
        }
        else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    }
    catch (error) {
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
        }
        else {
            res.status(404).json({ error: 'Metadata not found' });
        }
    }
    catch (error) {
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
        }
        else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Error getting grooves by tempo:', error);
        res.status(500).json({ error: `Failed to get grooves: ${error}` });
    }
});
// Import advanced rhythm patterns from MIDI Land
router.post('/rhythm/import-midi-land', strictLimiter, requireAuth, async (req, res) => {
    try {
        const result = await midiService.importMidiLandRhythms();
        if (result.success) {
            res.json({
                success: true,
                message: 'MIDI Land rhythms imported successfully',
                imported: result.imported,
                catalogPath: result.catalogPath
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
        console.error('MIDI Land import error:', error);
        res.status(500).json({ error: `MIDI Land import failed: ${error}` });
    }
});
// Get rhythm patterns by category
router.get('/rhythm/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const rhythms = await midiService.getRhythmsByCategory(category);
        res.json({ category, rhythms });
    }
    catch (error) {
        console.error('Error getting rhythms by category:', error);
        res.status(500).json({ error: `Failed to get rhythms: ${error}` });
    }
});
// Get advanced rhythm patterns
router.get('/rhythm/advanced', async (req, res) => {
    try {
        const { tempo, category, style } = req.query;
        const filters = {
            tempo: tempo ? parseInt(tempo) : undefined,
            category: category,
            style: style
        };
        const rhythms = await midiService.getAdvancedRhythms(filters);
        res.json({ rhythms, filters });
    }
    catch (error) {
        console.error('Error getting advanced rhythms:', error);
        res.status(500).json({ error: `Failed to get advanced rhythms: ${error}` });
    }
});
export default router;
