
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export interface AudioLDM2Config {
  modelPath: string;
  outputDir: string;
  instanceWord?: string;
  objectClass?: string;
  numInferenceSteps?: number;
  guidanceScale?: number;
  audioLengthInS?: number;
}

export class AudioLDM2Service {
  private pythonPath: string;
  private scriptPath: string;

  constructor() {
    this.pythonPath = 'python3';
    this.scriptPath = path.join(process.cwd(), 'temp-dreamsound-repo');
  }

  async generatePersonalizedMusic(prompt: string, config: AudioLDM2Config): Promise<string> {
    const outputFile = path.join(config.outputDir, `generated_${Date.now()}.wav`);
    
    const args = [
      path.join(this.scriptPath, 'inference_audioldm2.py'),
      '--prompt', prompt,
      '--model_path', config.modelPath,
      '--output_file', outputFile,
      '--num_inference_steps', (config.numInferenceSteps || 50).toString(),
      '--guidance_scale', (config.guidanceScale || 3.5).toString(),
      '--audio_length_in_s', (config.audioLengthInS || 10.0).toString()
    ];

    if (config.instanceWord && config.objectClass) {
      args.push('--instance_word', config.instanceWord);
      args.push('--object_class', config.objectClass);
    }

    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, args);
      
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(outputFile);
        } else {
          reject(new Error(`AudioLDM2 generation failed: ${stderr}`));
        }
      });
    });
  }

  async trainDreamBooth(config: {
    dataDir: string;
    instanceWord: string;
    objectClass: string;
    outputDir: string;
    maxTrainSteps?: number;
    learningRate?: number;
  }): Promise<string> {
    const args = [
      path.join(this.scriptPath, 'dreambooth_audioldm2.py'),
      '--pretrained_model_name_or_path', 'cvssp/audioldm2',
      '--train_data_dir', config.dataDir,
      '--instance_word', config.instanceWord,
      '--object_class', config.objectClass,
      '--output_dir', config.outputDir,
      '--train_batch_size', '1',
      '--gradient_accumulation_steps', '4',
      '--max_train_steps', (config.maxTrainSteps || 300).toString(),
      '--learning_rate', (config.learningRate || 1.0e-05).toString(),
      '--validation_steps', '50',
      '--num_validation_audio_files', '3',
      '--save_as_full_pipeline'
    ];

    return new Promise((resolve, reject) => {
      const process = spawn('accelerate', ['launch', ...args]);
      
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('Training output:', data.toString());
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error('Training error:', data.toString());
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(path.join(config.outputDir, 'trained_pipeline'));
        } else {
          reject(new Error(`DreamBooth training failed: ${stderr}`));
        }
      });
    });
  }

  async getAvailableModels(): Promise<string[]> {
    const modelsDir = path.join(process.cwd(), 'storage', 'models', 'audioldm2');
    try {
      await fs.access(modelsDir);
      const files = await fs.readdir(modelsDir);
      return files.filter(file => file.endsWith('.pt') || file.endsWith('.ckpt'));
    } catch {
      return ['cvssp/audioldm2']; // Default model
    }
  }
}
