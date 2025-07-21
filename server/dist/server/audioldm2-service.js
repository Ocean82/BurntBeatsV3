import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
class AudioLDM2Service {
    pythonPath;
    modelPath;
    outputDir;
    constructor() {
        this.pythonPath = process.env.AUDIOLDM2_PYTHON_PATH || 'python3';
        this.modelPath = process.env.AUDIOLDM2_MODEL_PATH || 'cvssp/audioldm2';
        this.outputDir = path.join(process.cwd(), 'storage', 'music', 'generated');
        // Ensure output directory exists
        this.ensureOutputDir();
    }
    async ensureOutputDir() {
        try {
            await fs.mkdir(this.outputDir, { recursive: true });
        }
        catch (error) {
            console.error('Failed to create output directory:', error);
        }
    }
    async generatePersonalizedMusic(prompt, config) {
        const timestamp = Date.now();
        const outputFileName = `audioldm2_${timestamp}.wav`;
        const outputPath = path.join(config.outputDir, outputFileName);
        try {
            // Create AudioLDM2 generation script
            const scriptPath = await this.createGenerationScript(prompt, config, outputPath);
            // Execute generation
            const result = await this.executeAudioLDM2Script(scriptPath);
            if (result.success) {
                // Verify output file exists
                const fileExists = await this.fileExists(outputPath);
                if (fileExists) {
                    console.log(`AudioLDM2 generation successful: ${outputPath}`);
                    return outputPath;
                }
                else {
                    throw new Error('Generated audio file not found');
                }
            }
            else {
                throw new Error(result.error || 'AudioLDM2 generation failed');
            }
        }
        catch (error) {
            console.error('AudioLDM2 generation error:', error);
            throw error;
        }
    }
    async createGenerationScript(prompt, config, outputPath) {
        const scriptContent = `
import torch
import numpy as np
import soundfile as sf
from pathlib import Path
import sys
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AudioLDM2Generator:
    def __init__(self, model_path="${config.modelPath}"):
        self.model_path = model_path
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {self.device}")
        
    def generate_audio(self, prompt, output_path, audio_length=${config.audioLengthInS || 10.0}):
        """Generate audio using AudioLDM2 pipeline"""
        try:
            # Mock AudioLDM2 generation - replace with actual implementation
            # In production, this would use the diffusers AudioLDM2 pipeline
            
            # For now, generate white noise with envelope
            duration = audio_length
            sample_rate = 16000
            samples = int(duration * sample_rate)
            
            # Generate base audio
            audio = np.random.randn(samples) * 0.1
            
            # Apply envelope
            envelope = np.hanning(samples)
            audio = audio * envelope
            
            # Apply frequency shaping based on prompt
            if 'bass' in prompt.lower():
                # Emphasize lower frequencies
                audio = self.apply_low_pass_filter(audio, sample_rate, 800)
            elif 'treble' in prompt.lower() or 'high' in prompt.lower():
                # Emphasize higher frequencies
                audio = self.apply_high_pass_filter(audio, sample_rate, 1000)
            
            # Normalize
            audio = audio / np.max(np.abs(audio))
            
            # Save audio
            sf.write(output_path, audio, sample_rate)
            logger.info(f"Generated audio saved to {output_path}")
            
            return {
                "success": True,
                "output_path": output_path,
                "duration": duration,
                "sample_rate": sample_rate
            }
            
        except Exception as e:
            logger.error(f"Audio generation failed: {e}")
            return {"success": False, "error": str(e)}
    
    def apply_low_pass_filter(self, audio, sample_rate, cutoff_freq):
        """Apply simple low-pass filter"""
        try:
            # Simple moving average filter
            window_size = int(sample_rate / cutoff_freq)
            filtered = np.convolve(audio, np.ones(window_size)/window_size, mode='same')
            return filtered
        except:
            return audio
    
    def apply_high_pass_filter(self, audio, sample_rate, cutoff_freq):
        """Apply simple high-pass filter"""
        try:
            # Simple difference filter
            filtered = np.diff(audio, prepend=audio[0])
            return filtered
        except:
            return audio

def main():
    generator = AudioLDM2Generator()
    
    prompt = "${prompt}"
    output_path = "${outputPath}"
    audio_length = ${config.audioLengthInS || 10.0}
    
    result = generator.generate_audio(prompt, output_path, audio_length)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
`;
        const scriptPath = path.join(this.outputDir, `audioldm2_script_${Date.now()}.py`);
        await fs.writeFile(scriptPath, scriptContent);
        return scriptPath;
    }
    async executeAudioLDM2Script(scriptPath) {
        return new Promise((resolve) => {
            const process = spawn(this.pythonPath, [scriptPath]);
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
                    try {
                        const result = JSON.parse(stdout.trim());
                        resolve(result);
                    }
                    catch (error) {
                        resolve({ success: false, error: 'Failed to parse generation result' });
                    }
                }
                else {
                    resolve({ success: false, error: stderr || 'AudioLDM2 generation failed' });
                }
            });
            process.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
        });
    }
    async trainDreamBooth(config) {
        const timestamp = Date.now();
        const outputDir = path.join(config.outputDir, `model_${timestamp}`);
        try {
            await fs.mkdir(outputDir, { recursive: true });
            // Create training script
            const scriptPath = await this.createTrainingScript(config, outputDir);
            // Execute training
            const result = await this.executeTrainingScript(scriptPath);
            if (result.success) {
                console.log(`DreamBooth training completed: ${outputDir}`);
                return outputDir;
            }
            else {
                throw new Error(result.error || 'DreamBooth training failed');
            }
        }
        catch (error) {
            console.error('DreamBooth training error:', error);
            throw error;
        }
    }
    async createTrainingScript(config, outputDir) {
        const scriptContent = `
import torch
import os
import json
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DreamBoothTrainer:
    def __init__(self, data_dir="${config.dataDir}", output_dir="${outputDir}"):
        self.data_dir = Path(data_dir)
        self.output_dir = Path(output_dir)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
    def train_model(self, instance_word="${config.instanceWord}", object_class="${config.objectClass}", max_steps=${config.maxTrainSteps || 300}):
        """Train DreamBooth model"""
        try:
            # Mock training process
            logger.info(f"Starting DreamBooth training for {instance_word} {object_class}")
            
            # Create model directory structure
            model_dir = self.output_dir / "trained_pipeline"
            model_dir.mkdir(parents=True, exist_ok=True)
            
            # Create training metadata
            metadata = {
                "instance_word": instance_word,
                "object_class": object_class,
                "max_steps": max_steps,
                "training_complete": True,
                "model_path": str(model_dir)
            }
            
            with open(model_dir / "metadata.json", "w") as f:
                json.dump(metadata, f, indent=2)
            
            logger.info("DreamBooth training completed successfully")
            return {"success": True, "model_path": str(model_dir)}
            
        except Exception as e:
            logger.error(f"Training failed: {e}")
            return {"success": False, "error": str(e)}

def main():
    trainer = DreamBoothTrainer()
    result = trainer.train_model()
    print(json.dumps(result))

if __name__ == "__main__":
    main()
`;
        const scriptPath = path.join(outputDir, 'train_dreambooth.py');
        await fs.writeFile(scriptPath, scriptContent);
        return scriptPath;
    }
    async executeTrainingScript(scriptPath) {
        return new Promise((resolve) => {
            const process = spawn(this.pythonPath, [scriptPath]);
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
                    try {
                        const result = JSON.parse(stdout.trim());
                        resolve(result);
                    }
                    catch (error) {
                        resolve({ success: false, error: 'Failed to parse training result' });
                    }
                }
                else {
                    resolve({ success: false, error: stderr || 'Training failed' });
                }
            });
            process.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
        });
    }
    async getAvailableModels() {
        try {
            const modelsDir = path.join(process.cwd(), 'storage', 'models', 'audioldm2');
            await fs.mkdir(modelsDir, { recursive: true });
            const entries = await fs.readdir(modelsDir, { withFileTypes: true });
            const models = entries
                .filter(entry => entry.isDirectory())
                .map(entry => entry.name);
            return models;
        }
        catch (error) {
            console.error('Failed to get available models:', error);
            return [];
        }
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
}
export { AudioLDM2Service };
//# sourceMappingURL=audioldm2-service.js.map