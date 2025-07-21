export interface AIModelConfig {
    basePath: string;
    huggingfaceCache: string;
    torchHome: string;
    rvc: {
        modelsPath: string;
        pretrainedPath: string;
        hubertPath: string;
        rmvpePath: string;
        uvr5Weights: string;
    };
    music: {
        audioldm2Cache: string;
        music21Corpus: string;
        midiModels: string;
    };
    features: {
        librosaCache: string;
        essentiaModels: string;
    };
    processing: {
        maxCacheSize: number;
        autoDownload: boolean;
        offlineMode: boolean;
    };
}
export declare const aiModelConfig: AIModelConfig;
export declare function getModelPath(category: keyof AIModelConfig['rvc'] | keyof AIModelConfig['music'], model?: string): string;
export declare function ensureModelDirectories(): void;
export default aiModelConfig;
