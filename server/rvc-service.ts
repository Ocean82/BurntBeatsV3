
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

  private async executeRVCScript(args: string[]): Promise<{ success: boolean; error?: string; result?: any }> {
    return new Promise((resolve) => {
      // Use our Python RVC integration script
      const pythonScript = './server/rvc-integration.py';
      const childProcess = spawn(this.pythonPath, [pythonScript, '--clone', ...args]);
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
          try {
            // Parse JSON response from Python script
            const result = JSON.parse(stdout);
            resolve({ success: true, result });
          } catch (e) {
            resolve({ 
              success: false, 
              error: `Failed to parse RVC response: ${e}` 
            });
          }
        } else {
          resolve({ 
            success: false, 
            error: `RVC process exited with code ${code}. Error: ${stderr}` 
          });
        }
      });

      childProcess.on('error', (error) => {
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
