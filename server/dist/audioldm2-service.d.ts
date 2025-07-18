interface AudioLDM2Config {
    modelPath: string;
    outputDir: string;
    instanceWord?: string;
    objectClass?: string;
    audioLengthInS?: number;
    maxTrainSteps?: number;
    dataDir?: string;
}
declare class AudioLDM2Service {
    private pythonPath;
    private modelPath;
    private outputDir;
    constructor();
    private ensureOutputDir;
    generatePersonalizedMusic(prompt: string, config: AudioLDM2Config): Promise<string>;
    private createGenerationScript;
    private executeAudioLDM2Script;
    trainDreamBooth(config: AudioLDM2Config): Promise<string>;
    private createTrainingScript;
    private executeTrainingScript;
    getAvailableModels(): Promise<string[]>;
    private fileExists;
}
export { AudioLDM2Service };
