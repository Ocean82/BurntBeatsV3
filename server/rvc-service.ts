
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export interface VoiceCloneRequest {
  audioPath: string;
  text: string;
  outputPath?: string;
  voiceId?: string;
}

export interface VoiceCloneResult {
  success: boolean;
  audioPath?: string;
  voiceId?: string;
  error?: string;
}

export class RVCService {
  private pythonPath = 'python3';
  private rvcPath = './Retrieval-based-Voice-Conversion-WebUI';
  private outputDir = './storage/voices';

  async cloneVoice(request: VoiceCloneRequest): Promise<VoiceCloneResult> {
    try {
      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const outputPath = path.join(this.outputDir, `cloned_voice_${timestamp}.wav`);

      // Build RVC command (this would need to match actual RVC API)
      const args = [
        path.join(this.rvcPath, 'tools/infer_cli.py'),
        '--input', request.audioPath,
        '--output', outputPath,
        '--text', request.text
      ];

      if (request.voiceId) {
        args.push('--voice-id', request.voiceId);
      }

      // Execute RVC script
      const result = await this.executeRVCScript(args);
      
      if (result.success) {
        // Check if output file was created
        const audioExists = await this.fileExists(outputPath);

        return {
          success: audioExists,
          audioPath: audioExists ? outputPath : undefined,
          voiceId: `rvc_${timestamp}`,
          error: audioExists ? undefined : 'Voice clone file was not generated'
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
        error: `RVC voice cloning failed: ${error}`
      };
    }
  }

  private async executeRVCScript(args: string[]): Promise<{ success: boolean; error?: string }> {
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
            error: `RVC process exited with code ${code}. Error: ${stderr}` 
          });
        }
      });

      process.on('error', (error) => {
        resolve({ 
          success: false, 
          error: `Failed to start RVC process: ${error.message}` 
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

  async listClonedVoices(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.outputDir);
      return files.filter(file => file.endsWith('.wav'));
    } catch {
      return [];
    }
  }
}
