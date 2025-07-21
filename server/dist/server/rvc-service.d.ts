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
export declare class RVCService {
    private rvcPath;
    private modelsPath;
    private outputDir;
    private pythonPath;
    cloneVoice(request: VoiceCloneRequest): Promise<VoiceCloneResult>;
    private executeRVCScript;
    private fileExists;
    listClonedVoices(): Promise<string[]>;
    loadModel(modelPath: string): Promise<boolean>;
}
