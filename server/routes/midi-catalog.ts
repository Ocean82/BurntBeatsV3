
import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';

const router = express.Router();

// Get comprehensive MIDI catalog
router.get('/catalog', async (req, res) => {
  try {
    const catalogPath = path.join('./storage/midi/comprehensive_midi_catalog.json');
    
    // Check if catalog exists
    try {
      await fs.access(catalogPath);
    } catch {
      return res.status(404).json({
        success: false,
        error: 'MIDI catalog not found. Please run catalog generation first.'
      });
    }

    // Read catalog
    const catalogData = await fs.readFile(catalogPath, 'utf-8');
    const catalog = JSON.parse(catalogData);

    // Transform data for frontend
    const transformedCatalog = {
      total_files: catalog.total_files || 0,
      categories: catalog.categories || {},
      tempo_distribution: catalog.tempo_distribution || {},
      time_signature_distribution: catalog.time_signature_distribution || {},
      midi_files: (catalog.processed || []).map((file: any) => ({
        filename: file.analysis?.filename || 'Unknown',
        path: file.integrated_path || file.original_path,
        category: file.category || 'uncategorized',
        tempo: file.analysis?.estimated_tempo || 120,
        timeSignature: file.analysis?.time_signature || '4/4',
        tracks: file.analysis?.num_tracks || 0,
        duration: file.analysis?.length || 0,
        genre: extractGenreFromPath(file.integrated_path || file.original_path),
        style: extractStyleFromPath(file.integrated_path || file.original_path),
        complexity: determineComplexity(file.analysis),
        tags: generateTags(file.analysis, file.category)
      }))
    };

    res.json({
      success: true,
      catalog: transformedCatalog
    });

  } catch (error) {
    console.error('Error reading MIDI catalog:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to read MIDI catalog'
    });
  }
});

// Get MIDI files by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const catalogPath = path.join('./storage/midi/comprehensive_midi_catalog.json');
    
    const catalogData = await fs.readFile(catalogPath, 'utf-8');
    const catalog = JSON.parse(catalogData);

    const categoryFiles = (catalog.processed || [])
      .filter((file: any) => file.category === category)
      .map((file: any) => ({
        filename: file.analysis?.filename || 'Unknown',
        path: file.integrated_path || file.original_path,
        tempo: file.analysis?.estimated_tempo || 120,
        timeSignature: file.analysis?.time_signature || '4/4',
        tracks: file.analysis?.num_tracks || 0,
        duration: file.analysis?.length || 0
      }));

    res.json({
      success: true,
      category,
      files: categoryFiles,
      count: categoryFiles.length
    });

  } catch (error) {
    console.error('Error getting category files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get category files'
    });
  }
});

// Get groove patterns with filtering
router.get('/groove-patterns', async (req, res) => {
  try {
    const { tempo_min, tempo_max, style } = req.query;
    const grooveCatalogPath = path.join('./storage/midi/groove-dataset/groove_catalog.json');
    
    const grooveData = await fs.readFile(grooveCatalogPath, 'utf-8');
    const groove = JSON.parse(grooveData);

    let patterns = groove.groove_patterns || [];

    // Apply filters
    if (tempo_min || tempo_max) {
      patterns = patterns.filter((pattern: any) => {
        const tempo = extractTempoFromFilename(pattern.filename);
        const min = tempo_min ? parseInt(tempo_min as string) : 0;
        const max = tempo_max ? parseInt(tempo_max as string) : 300;
        return tempo >= min && tempo <= max;
      });
    }

    if (style) {
      patterns = patterns.filter((pattern: any) => 
        pattern.filename.toLowerCase().includes((style as string).toLowerCase())
      );
    }

    res.json({
      success: true,
      patterns: patterns.map((pattern: any) => ({
        filename: pattern.filename,
        path: pattern.path,
        tempo: extractTempoFromFilename(pattern.filename),
        style: extractStyleFromFilename(pattern.filename),
        tracks: pattern.num_tracks || 1,
        duration: pattern.length || 0
      })),
      total: patterns.length
    });

  } catch (error) {
    console.error('Error getting groove patterns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get groove patterns'
    });
  }
});

// Refresh catalog (trigger regeneration)
router.post('/refresh', async (req, res) => {
  try {
    // Import and run the comprehensive processor
    const { spawn } = require('child_process');
    
    const process = spawn('python3', ['./server/comprehensive-midi-processor.py', '--all'], {
      stdio: 'pipe'
    });

    let output = '';
    let error = '';

    process.stdout.on('data', (data: Buffer) => {
      output += data.toString();
    });

    process.stderr.on('data', (data: Buffer) => {
      error += data.toString();
    });

    process.on('close', (code: number) => {
      if (code === 0) {
        res.json({
          success: true,
          message: 'MIDI catalog refreshed successfully',
          output
        });
      } else {
        res.status(500).json({
          success: false,
          error: `Catalog refresh failed with code ${code}: ${error}`
        });
      }
    });

  } catch (error) {
    console.error('Error refreshing catalog:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh catalog'
    });
  }
});

// Helper functions
function extractGenreFromPath(filePath: string): string {
  const filename = path.basename(filePath).toLowerCase();
  const genreMap: Record<string, string> = {
    'funk': 'funk',
    'rock': 'rock',
    'jazz': 'jazz',
    'latin': 'latin',
    'blues': 'blues',
    'pop': 'pop',
    'soul': 'soul',
    'hiphop': 'hip-hop',
    'reggae': 'reggae',
    'country': 'country',
    'gospel': 'gospel',
    'afro': 'afrobeat'
  };

  for (const [key, genre] of Object.entries(genreMap)) {
    if (filename.includes(key)) {
      return genre;
    }
  }
  return 'other';
}

function extractStyleFromPath(filePath: string): string {
  const filename = path.basename(filePath).toLowerCase();
  if (filename.includes('beat')) return 'beat';
  if (filename.includes('fill')) return 'fill';
  if (filename.includes('groove')) return 'groove';
  return 'pattern';
}

function extractTempoFromFilename(filename: string): number {
  const tempoMatch = filename.match(/_(\d+)_beat|_(\d+)_fill|_(\d+)bpm/);
  if (tempoMatch) {
    return parseInt(tempoMatch[1] || tempoMatch[2] || tempoMatch[3]);
  }
  return 120; // Default tempo
}

function extractStyleFromFilename(filename: string): string {
  const parts = filename.split('_');
  for (const part of parts) {
    if (part.includes('funk') || part.includes('rock') || part.includes('jazz')) {
      return part;
    }
  }
  return 'unknown';
}

function determineComplexity(analysis: any): string {
  if (!analysis) return 'standard';
  
  const tracks = analysis.num_tracks || 0;
  const tempo = analysis.estimated_tempo || 120;
  
  if (tracks <= 2 && tempo <= 100) return 'simple';
  if (tracks >= 5 || tempo >= 150) return 'complex';
  return 'standard';
}

function generateTags(analysis: any, category: string): string[] {
  const tags: string[] = [];
  
  if (category) tags.push(category);
  
  if (analysis) {
    if (analysis.has_drums) tags.push('drums');
    if (analysis.num_tracks > 4) tags.push('multi-track');
    if (analysis.estimated_tempo > 140) tags.push('fast');
    if (analysis.estimated_tempo < 80) tags.push('slow');
  }
  
  return tags;
}

export default router;
