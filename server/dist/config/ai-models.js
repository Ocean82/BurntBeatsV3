"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiModelConfig = void 0;
exports.getModelPath = getModelPath;
exports.ensureModelDirectories = ensureModelDirectories;
const fs_1 = require("fs");
exports.aiModelConfig = {
    basePath: process.env.AI_MODEL_BASE_PATH || './storage/models',
    huggingfaceCache: process.env.HUGGINGFACE_CACHE_DIR || './storage/models/huggingface',
    torchHome: process.env.TORCH_HOME || './storage/models/torch',
    rvc: {
        modelsPath: process.env.RVC_MODELS_PATH || './Retrieval-based-Voice-Conversion-WebUI/assets/weights',
        pretrainedPath: process.env.RVC_PRETRAINED_PATH || './Retrieval-based-Voice-Conversion-WebUI/assets/pretrained_v2',
        hubertPath: process.env.RVC_HUBERT_PATH || './Retrieval-based-Voice-Conversion-WebUI/assets/hubert',
        rmvpePath: process.env.RVC_RMVPE_PATH || './Retrieval-based-Voice-Conversion-WebUI/assets/rmvpe',
        uvr5Weights: process.env.RVC_UVR5_WEIGHTS || './Retrieval-based-Voice-Conversion-WebUI/assets/uvr5_weights'
    },
    music: {
        audioldm2Cache: process.env.AUDIOLDM2_CACHE_PATH || './storage/models/audioldm2',
        music21Corpus: process.env.MUSIC21_CORPUS_PATH || './storage/models/music21_corpus',
        midiModels: process.env.MIDI_MODELS_PATH || './storage/models/midi'
    },
    features: {
        librosaCache: process.env.LIBROSA_CACHE_DIR || './storage/models/librosa',
        essentiaModels: process.env.ESSENTIA_MODELS_PATH || './storage/models/essentia'
    },
    processing: {
        maxCacheSize: parseInt(process.env.MODEL_CACHE_SIZE_GB || '5'),
        autoDownload: Boolean(process.env.AUTO_DOWNLOAD_MODELS !== 'false'),
        offlineMode: Boolean(process.env.OFFLINE_MODE === 'true')
    }
};
function getModelPath(category, model) {
    const config = exports.aiModelConfig;
    // RVC model paths
    if (category in config.rvc) {
        const basePath = config.rvc[category];
        return model ? `${basePath}/${model}` : basePath;
    }
    // Music model paths
    if (category in config.music) {
        const basePath = config.music[category];
        return model ? `${basePath}/${model}` : basePath;
    }
    return config.basePath;
}
function ensureModelDirectories() {
    const directories = [
        exports.aiModelConfig.basePath,
        exports.aiModelConfig.huggingfaceCache,
        exports.aiModelConfig.torchHome,
        ...Object.values(exports.aiModelConfig.rvc),
        ...Object.values(exports.aiModelConfig.music),
        ...Object.values(exports.aiModelConfig.features)
    ];
    directories.forEach(dir => {
        if (!(0, fs_1.existsSync)(dir)) {
            (0, fs_1.mkdirSync)(dir, { recursive: true });
            console.log(`📁 Created model directory: ${dir}`);
        }
    });
}
exports.default = exports.aiModelConfig;
//# sourceMappingURL=ai-models.js.map