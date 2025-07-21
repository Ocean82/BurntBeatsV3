import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
// MIDI SERVICE CLASS
// NOTE: Handles all MIDI generation and template management
// TODO: Add caching mechanism for frequently used templates
class MidiService {
    constructor() {
        // SERVICE CONFIGURATION
        // NOTE: These paths are configurable for different environments
        this.pythonPath = 'python3'; // Python executable
        this.generatorScript = './music Gen extra/Main.py'; // Main generator script
        this.outputDir = './storage/midi/generated'; // Output directory
        this.templatesDir = './storage/midi/templates'; // Template directory
    }
    // MAIN MIDI GENERATION METHOD
    // NOTE: Orchestrates the entire MIDI generation process
    // TODO: Add progress tracking and cancellation support
    async generateMidi(request) {
        try {
            // DIRECTORY PREPARATION
            // NOTE: Ensures output directory exists before generation
            await fs.mkdir(this.outputDir, { recursive: true });
            // FILENAME GENERATION
            // NOTE: Creates unique filename with timestamp to prevent conflicts
            const timestamp = Date.now();
            const sanitizedTitle = request.title.replace(/[^a-zA-Z0-9]/g, '_'); // Remove special chars
            const outputPath = path.join(this.outputDir, `${sanitizedTitle}_${timestamp}.mid`);
            // PYTHON SCRIPT ARGUMENTS
            // NOTE: Builds argument array for Python script execution
            // TODO: Add validation for script path existence
            const enhancedArgs = [
                './server/enhanced-midi-generator.py', // Enhanced generator script
                '--title', request.title,
                '--theme', request.theme,
                '--genre', request.genre,
                '--tempo', request.tempo.toString(),
                '--output', outputPath
            ];
            if (request.useAiLyrics) {
                enhancedArgs.push('--ai-lyrics');
            }
            if (request.duration) {
                enhancedArgs.push('--duration', request.duration.toString());
            }
            if (request.voiceId) {
                enhancedArgs.push('--voice-id', request.voiceId);
            }
            // Execute enhanced Python script with chords2midi
            const result = await this.executePythonScript(enhancedArgs);
            if (result.success) {
                // Check if files were created
                const midiExists = await this.fileExists(outputPath);
                const metadataPath = outputPath.replace('.mid', '_metadata.json');
                const metadataExists = await this.fileExists(metadataPath);
                return {
                    success: midiExists,
                    midiPath: midiExists ? outputPath : undefined,
                    metadataPath: metadataExists ? metadataPath : undefined,
                    error: midiExists ? undefined : 'MIDI file was not generated'
                };
            }
            else {
                return {
                    success: false,
                    error: result.error
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: `MIDI generation failed: ${error}`
            };
        }
    }
    async executePythonScript(args) {
        return new Promise((resolve) => {
            const childProcess = spawn(this.pythonPath, args);
            let stderr = '';
            let stdout = '';
            childProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            childProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            childProcess.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true });
                }
                else {
                    resolve({
                        success: false,
                        error: `Process exited with code ${code}. Error: ${stderr}`
                    });
                }
            });
            childProcess.on('error', (error) => {
                resolve({
                    success: false,
                    error: `Failed to start process: ${error.message}`
                });
            });
        });
    }
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async listGeneratedMidi() {
        try {
            const files = await fs.readdir(this.outputDir);
            return files.filter(file => file.endsWith('.mid'));
        }
        catch {
            return [];
        }
    }
    async getMidiMetadata(midiPath) {
        try {
            const metadataPath = midiPath.replace('.mid', '_metadata.json');
            const metadata = await fs.readFile(metadataPath, 'utf-8');
            return JSON.parse(metadata);
        }
        catch {
            return null;
        }
    }
    async listMidiTemplates() {
        try {
            const files = await fs.readdir(this.templatesDir);
            return files.filter(file => file.endsWith('.mid') || file.endsWith('.midi'));
        }
        catch {
            return [];
        }
    }
    async generateFromTemplate(templateName, customizations) {
        try {
            const templatePath = path.join(this.templatesDir, templateName);
            const exists = await this.fileExists(templatePath);
            if (!exists) {
                return {
                    success: false,
                    error: `Template ${templateName} not found`
                };
            }
            // Generate unique filename for the customized version
            const timestamp = Date.now();
            const baseName = templateName.replace(/\.(mid|midi)$/, '');
            const outputPath = path.join(this.outputDir, `${baseName}_custom_${timestamp}.mid`);
            // Copy template to generated directory
            await fs.copyFile(templatePath, outputPath);
            // Create metadata for the template-based generation
            const metadata = {
                source_template: templateName,
                generated_at: new Date().toISOString(),
                customizations: customizations || {},
                generation_method: 'template_based'
            };
            const metadataPath = outputPath.replace('.mid', '_metadata.json');
            await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
            return {
                success: true,
                midiPath: outputPath,
                metadataPath: metadataPath
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Template generation failed: ${error}`
            };
        }
    }
    async catalogTemplates() {
        try {
            const result = await this.executePythonScript([
                './server/midi-catalog.py',
                '--scan'
            ]);
            if (result.success) {
                return {
                    success: true,
                    catalogPath: './storage/midi/templates/midi_catalog.json'
                };
            }
            else {
                return {
                    success: false,
                    error: result.error
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: `Catalog generation failed: ${error}`
            };
        }
    }
    async extractGrooveDataset() {
        try {
            const result = await this.executePythonScript([
                './server/groove-dataset-loader.py',
                '--extract'
            ]);
            if (result.success) {
                return {
                    success: true,
                    catalogPath: './storage/midi/groove/metadata/groove_catalog.json'
                };
            }
            else {
                return {
                    success: false,
                    error: result.error
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: `Groove dataset extraction failed: ${error}`
            };
        }
    }
    async getGroovesByStyle(style) {
        try {
            const result = await this.executePythonScript([
                './server/groove-dataset-loader.py',
                '--style', style
            ]);
            if (result.success) {
                // Parse the JSON output from the Python script
                return [];
            }
            else {
                return [];
            }
        }
        catch (error) {
            return [];
        }
    }
    async getGroovesByTempo(minTempo, maxTempo) {
        try {
            const result = await this.executePythonScript([
                './server/groove-dataset-loader.py',
                '--tempo-min', minTempo.toString(),
                '--tempo-max', maxTempo.toString()
            ]);
            if (result.success) {
                return [];
            }
            else {
                return [];
            }
        }
        catch (error) {
            return [];
        }
    }
    async processChordSets() {
        try {
            const result = await this.executePythonScript([
                './server/chord-sets-processor.py',
                '--process'
            ]);
            if (result.success) {
                return {
                    success: true,
                    catalogPath: './storage/midi/templates/chord-sets/chord_sets_catalog.json'
                };
            }
            else {
                return {
                    success: false,
                    error: result.error
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: `Chord sets processing failed: ${error}`
            };
        }
    }
    async validateAllMidiFiles() {
        try {
            const result = await this.executePythonScript([
                './server/midi-validation.py',
                '--validate'
            ]);
            if (result.success) {
                // Try to read the validation report
                try {
                    const reportPath = './storage/midi/validation_report.json';
                    const reportExists = await this.fileExists(reportPath);
                    if (reportExists) {
                        const report = JSON.parse(await fs.readFile(reportPath, 'utf-8'));
                        return {
                            success: true,
                            report: report
                        };
                    }
                }
                catch (reportError) {
                    console.warn('Could not read validation report:', reportError);
                }
                return {
                    success: true,
                    report: { message: 'Validation completed successfully' }
                };
            }
            else {
                return {
                    success: false,
                    error: result.error
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: `MIDI validation failed: ${error}`
            };
        }
    }
    async repairMidiFiles() {
        try {
            const result = await this.executePythonScript([
                './server/midi-validation.py',
                '--fix'
            ]);
            if (result.success) {
                return {
                    success: true,
                    fixed: 0 // This could be enhanced to return actual count
                };
            }
            else {
                return {
                    success: false,
                    fixed: 0,
                    error: result.error
                };
            }
        }
        catch (error) {
            return {
                success: false,
                fixed: 0,
                error: `MIDI repair failed: ${error}`
            };
        }
    }
    async getChordSetsByCategory(category, tempoRange) {
        try {
            const args = ['./server/chord-sets-processor.py', '--list'];
            if (category) {
                args.push('--category', category);
            }
            if (tempoRange) {
                args.push('--tempo-min', tempoRange[0].toString());
                args.push('--tempo-max', tempoRange[1].toString());
            }
            const result = await this.executePythonScript(args);
            if (result.success) {
                // Parse the JSON output from the Python script
                return [];
            }
            else {
                return [];
            }
        }
        catch (error) {
            return [];
        }
    }
    async generateFromChordSet(chordSetName, customizations) {
        try {
            const chordSetPath = path.join('./storage/midi/templates/chord-sets', chordSetName);
            const exists = await this.fileExists(chordSetPath);
            if (!exists) {
                return {
                    success: false,
                    error: `Chord set ${chordSetName} not found`
                };
            }
            // Generate unique filename for the chord-based generation
            const timestamp = Date.now();
            const baseName = chordSetName.replace(/\.(mid|midi)$/, '');
            const outputPath = path.join(this.outputDir, `${baseName}_generated_${timestamp}.mid`);
            // Copy chord set to generated directory as base
            await fs.copyFile(chordSetPath, outputPath);
            // Create metadata for the chord-based generation
            const metadata = {
                source_chord_set: chordSetName,
                generated_at: new Date().toISOString(),
                customizations: customizations || {},
                generation_method: 'chord_set_based'
            };
            const metadataPath = outputPath.replace('.mid', '_metadata.json');
            await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
            return {
                success: true,
                midiPath: outputPath,
                metadataPath: metadataPath
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Chord set generation failed: ${error}`
            };
        }
    }
    async importMidiLandRhythms() {
        try {
            const result = await this.executePythonScript([
                './server/midi-land-importer.py',
                '--import'
            ]);
            if (result.success) {
                // Try to read the import report to get statistics
                try {
                    const reportPath = './storage/midi/rhythm-patterns/advanced/midi_land/import_report.json';
                    const reportExists = await this.fileExists(reportPath);
                    if (reportExists) {
                        const report = JSON.parse(await fs.readFile(reportPath, 'utf-8'));
                        return {
                            success: true,
                            imported: report.imported_files.length,
                            catalogPath: './storage/midi/rhythm-patterns/advanced/midi_land/rhythm_catalog.json'
                        };
                    }
                }
                catch (reportError) {
                    console.warn('Could not read import report:', reportError);
                }
                return {
                    success: true,
                    imported: 0,
                    catalogPath: './storage/midi/rhythm-patterns/advanced/midi_land/rhythm_catalog.json'
                };
            }
            else {
                return {
                    success: false,
                    error: result.error
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: `MIDI Land import failed: ${error}`
            };
        }
    }
    async getRhythmsByCategory(category) {
        try {
            const catalogPath = './storage/midi/rhythm-patterns/advanced/midi_land/rhythm_catalog.json';
            const catalogExists = await this.fileExists(catalogPath);
            if (catalogExists) {
                const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf-8'));
                if (catalog.categories && catalog.categories[category]) {
                    return catalog.categories[category].files;
                }
            }
            return [];
        }
        catch (error) {
            console.error('Error getting rhythms by category:', error);
            return [];
        }
    }
    async getAdvancedRhythms(filters) {
        try {
            const catalogPath = './storage/midi/rhythm-patterns/advanced/midi_land/rhythm_catalog.json';
            const catalogExists = await this.fileExists(catalogPath);
            if (!catalogExists) {
                return [];
            }
            const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf-8'));
            let rhythms = catalog.rhythm_files || [];
            // Apply filters
            if (filters.category) {
                rhythms = rhythms.filter((rhythm) => rhythm.category === filters.category);
            }
            if (filters.tempo) {
                const targetTempo = filters.tempo;
                const tempoTolerance = 10; // BPM tolerance
                rhythms = rhythms.filter((rhythm) => {
                    if (rhythm.analysis && rhythm.analysis.primary_bpm) {
                        const bpmDiff = Math.abs(rhythm.analysis.primary_bpm - targetTempo);
                        return bpmDiff <= tempoTolerance;
                    }
                    return false;
                });
            }
            if (filters.style) {
                rhythms = rhythms.filter((rhythm) => rhythm.filename.toLowerCase().includes(filters.style.toLowerCase()) ||
                    (rhythm.original_path && rhythm.original_path.toLowerCase().includes(filters.style.toLowerCase())));
            }
            return rhythms;
        }
        catch (error) {
            console.error('Error getting advanced rhythms:', error);
            return [];
        }
    }
}
export { MidiService };
