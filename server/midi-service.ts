
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export interface MidiGenerationRequest {
  title: string;
  theme: string;
  genre: string;
  tempo: number;
  duration?: number;
  useAiLyrics?: boolean;
  voiceId?: string;
  generateVoice?: boolean;
}

export interface MidiGenerationResult {
  success: boolean;
  midiPath?: string;
  metadataPath?: string;
  error?: string;
}

export class MidiService {
  private pythonPath = 'python3';
  private generatorScript = './music Gen extra/Main.py';
  private outputDir = './storage/midi/generated';
  private templatesDir = './storage/midi/templates';

  async generateMidi(request: MidiGenerationRequest): Promise<MidiGenerationResult> {
    try {
      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedTitle = request.title.replace(/[^a-zA-Z0-9]/g, '_');
      const outputPath = path.join(this.outputDir, `${sanitizedTitle}_${timestamp}.mid`);

      // Use enhanced Python script with chords2midi
      const enhancedArgs = [
        './server/enhanced-midi-generator.py',
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
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `MIDI generation failed: ${error}`
      };
    }
  }

  private async executePythonScript(args: string[]): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const process = spawn(this.pythonPath, args);
      let stderr = '';
      let stdout = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({ 
            success: false, 
            error: `Process exited with code ${code}. Error: ${stderr}` 
          });
        }
      });

      process.on('error', (error) => {
        resolve({ 
          success: false, 
          error: `Failed to start process: ${error.message}` 
        });
      });
    });
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async listGeneratedMidi(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.outputDir);
      return files.filter(file => file.endsWith('.mid'));
    } catch {
      return [];
    }
  }

  async getMidiMetadata(midiPath: string): Promise<any> {
    try {
      const metadataPath = midiPath.replace('.mid', '_metadata.json');
      const metadata = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(metadata);
    } catch {
      return null;
    }
  }

  async listMidiTemplates(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.templatesDir);
      return files.filter(file => file.endsWith('.mid') || file.endsWith('.midi'));
    } catch {
      return [];
    }
  }

  async generateFromTemplate(templateName: string, customizations?: any): Promise<MidiGenerationResult> {
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
    } catch (error) {
      return {
        success: false,
        error: `Template generation failed: ${error}`
      };
    }
  }

  async catalogTemplates(): Promise<{ success: boolean; catalogPath?: string; error?: string }> {
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
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Catalog generation failed: ${error}`
      };
    }
  }

  async extractGrooveDataset(): Promise<{ success: boolean; catalogPath?: string; error?: string }> {
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
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Groove dataset extraction failed: ${error}`
      };
    }
  }

  async getGroovesByStyle(style: string): Promise<any[]> {
    try {
      const result = await this.executePythonScript([
        './server/groove-dataset-loader.py',
        '--style', style
      ]);

      if (result.success) {
        // Parse the JSON output from the Python script
        return [];
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }

  async getGroovesByTempo(minTempo: number, maxTempo: number): Promise<any[]> {
    try {
      const result = await this.executePythonScript([
        './server/groove-dataset-loader.py',
        '--tempo-min', minTempo.toString(),
        '--tempo-max', maxTempo.toString()
      ]);

      if (result.success) {
        return [];
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }
}
