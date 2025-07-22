"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RVCService = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class RVCService {
    constructor() {
        this.rvcPath = './Retrieval-based-Voice-Conversion-WebUI';
        this.modelsPath = `${this.rvcPath}/assets/weights`;
        this.outputDir = './storage/voices';
        this.pythonPath = 'python3';
    }
    async cloneVoice(request) {
        try {
            // Ensure output directory exists
            await fs_1.promises.mkdir(this.outputDir, { recursive: true });
            // Generate unique filename
            const timestamp = Date.now();
            const outputPath = path_1.default.join(this.outputDir, `cloned_voice_${timestamp}.wav`);
            // Build RVC command (this would need to match actual RVC API)
            const args = [
                path_1.default.join(this.rvcPath, 'tools/infer_cli.py'),
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
                error: `RVC voice cloning failed: ${error}`
            };
        }
    }
    async executeRVCScript(args) {
        return new Promise((resolve) => {
            // Use our Python RVC integration script
            const pythonScript = './server/rvc-integration.py';
            const childProcess = (0, child_process_1.spawn)(this.pythonPath, [pythonScript, '--clone', ...args]);
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
                    }
                    catch (e) {
                        resolve({
                            success: false,
                            error: `Failed to parse RVC response: ${e}`
                        });
                    }
                }
                else {
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
    async fileExists(filePath) {
        try {
            await fs_1.promises.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async listClonedVoices() {
        try {
            const files = await fs_1.promises.readdir(this.outputDir);
            return files.filter(file => file.endsWith('.wav'));
        }
        catch {
            return [];
        }
    }
    async loadModel(modelPath) {
        // Check if model exists and load it
        const { existsSync } = await Promise.resolve().then(() => __importStar(require('fs')));
        return existsSync(`${this.modelsPath}/${modelPath}`);
    }
}
exports.RVCService = RVCService;
