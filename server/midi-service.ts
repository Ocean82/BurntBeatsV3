
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

  async generateMidi(request: MidiGenerationRequest): Promise<MidiGenerationResult> {
    try {
      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedTitle = request.title.replace(/[^a-zA-Z0-9]/g, '_');
      const outputPath = path.join(this.outputDir, `${sanitizedTitle}_${timestamp}.mid`);

      // Build command arguments
      const args = [
        this.generatorScript,
        request.title,
        request.theme,
        request.genre,
        request.tempo.toString(),
        outputPath
      ];

      if (request.useAiLyrics) {
        args.push('--ai-lyrics');
      }

      if (request.duration) {
        args.push(`--duration=${request.duration}`);
      }

      // Execute Python script
      const result = await this.executePythonScript(args);
      
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
}
