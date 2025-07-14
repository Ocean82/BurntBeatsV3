
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

// AUDIOLDM2 CONFIGURATION INTERFACE
// NOTE: Defines configuration options for AudioLDM2 model
// TODO: Add validation for required vs optional parameters
export interface AudioLDM2Config {
  modelPath: string;           // Path to the AudioLDM2 model
  outputDir: string;           // Output directory for generated audio
  instanceWord?: string;       // Custom instance word for personalization
  objectClass?: string;        // Object class for model training
  numInferenceSteps?: number;  // Number of inference steps (default: 50)
  guidanceScale?: number;      // Guidance scale for generation (default: 3.5)
  audioLengthInS?: number;     // Audio length in seconds (default: 10.0)
}

// AUDIOLDM2 SERVICE CLASS
// NOTE: Handles AI music generation using AudioLDM2 model
// TODO: Add model caching and performance optimization
export class AudioLDM2Service {
  private pythonPath: string;  // Python executable path
  private scriptPath: string;  // Path to AudioLDM2 scripts

  constructor() {
    // SERVICE INITIALIZATION
    // NOTE: Sets up paths and ensures directory structure
    this.pythonPath = 'python3';
    this.scriptPath = path.join(process.cwd(), 'temp-dreamsound-repo');
    
    // DIRECTORY SETUP
    // NOTE: Ensures all required directories exist on startup
    this.ensureDirectories();
  }

  // DIRECTORY STRUCTURE SETUP
  // NOTE: Creates essential directories for AudioLDM2 operation
  // TODO: Add error handling for permission issues
  private async ensureDirectories() {
    const dirs = [
      'storage/models/audioldm2',  // Model storage
      'storage/music/generated',   // Generated music output
      'storage/temp'               // Temporary files
    ];
    
    // CREATE DIRECTORIES SILENTLY
    // NOTE: Uses recursive creation and ignores existing directories
    for (const dir of dirs) {
      await fs.mkdir(path.join(process.cwd(), dir), { recursive: true }).catch(() => {});
    }
  }

  // PERSONALIZED MUSIC GENERATION METHOD
  // NOTE: Generates music using AudioLDM2 with custom prompts
  // TODO: Add progress tracking and intermediate result saving
  async generatePersonalizedMusic(prompt: string, config: AudioLDM2Config): Promise<string> {
    // OUTPUT FILE NAMING
    // NOTE: Creates unique filename with timestamp
    const outputFile = path.join(config.outputDir, `generated_${Date.now()}.wav`);
    
    // PYTHON SCRIPT ARGUMENTS
    // NOTE: Builds command line arguments for AudioLDM2 inference
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
      const childProcess = spawn(this.pythonPath, args);
      
      let stdout = '';
      let stderr = '';

      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      childProcess.on('close', (code) => {
        if (code === 0) {
          resolve(outputFile);
        } else {
          reject(new Error(`AudioLDM2 generation failed: ${stderr}`));
        }
      });

      childProcess.on('error', (error) => {
        reject(new Error(`Failed to start AudioLDM2 process: ${error.message}`));
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
      const childProcess = spawn('accelerate', ['launch', ...args]);
      
      let stdout = '';
      let stderr = '';

      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('Training output:', data.toString());
      });

      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error('Training error:', data.toString());
      });

      childProcess.on('close', (code) => {
        if (code === 0) {
          resolve(path.join(config.outputDir, 'trained_pipeline'));
        } else {
          reject(new Error(`DreamBooth training failed: ${stderr}`));
        }
      });

      childProcess.on('error', (error) => {
        reject(new Error(`Failed to start training process: ${error.message}`));
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
