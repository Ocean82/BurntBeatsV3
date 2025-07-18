export interface MidiGenerationRequest {
    title: string;
    theme: string;
    genre: string;
    tempo: number;
    duration?: number;
    useAiLyrics?: boolean;
    voiceId?: string;
    generateVoice?: boolean;
}
export interface MidiGenerationResult {
    success: boolean;
    midiPath?: string;
    metadataPath?: string;
    error?: string;
}
declare class MidiService {
    private pythonPath;
    private generatorScript;
    private outputDir;
    private templatesDir;
    generateMidi(request: MidiGenerationRequest): Promise<MidiGenerationResult>;
    private executePythonScript;
    private fileExists;
    listGeneratedMidi(): Promise<string[]>;
    getMidiMetadata(midiPath: string): Promise<any>;
    listMidiTemplates(): Promise<string[]>;
    generateFromTemplate(templateName: string, customizations?: any): Promise<MidiGenerationResult>;
    catalogTemplates(): Promise<{
        success: boolean;
        catalogPath?: string;
        error?: string;
    }>;
    extractGrooveDataset(): Promise<{
        success: boolean;
        catalogPath?: string;
        error?: string;
    }>;
    getGroovesByStyle(style: string): Promise<any[]>;
    getGroovesByTempo(minTempo: number, maxTempo: number): Promise<any[]>;
    processChordSets(): Promise<{
        success: boolean;
        catalogPath?: string;
        error?: string;
    }>;
    validateAllMidiFiles(): Promise<{
        success: boolean;
        report?: any;
        error?: string;
    }>;
    repairMidiFiles(): Promise<{
        success: boolean;
        fixed: number;
        error?: string;
    }>;
    getChordSetsByCategory(category?: string, tempoRange?: [number, number]): Promise<any[]>;
    generateFromChordSet(chordSetName: string, customizations?: any): Promise<MidiGenerationResult>;
}
export { MidiService };
