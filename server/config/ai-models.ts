
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

export const aiModelConfig: AIModelConfig = {
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

export function getModelPath(category: keyof AIModelConfig['rvc'] | keyof AIModelConfig['music'], model?: string): string {
  const config = aiModelConfig;
  
  // RVC model paths
  if (category in config.rvc) {
    const basePath = config.rvc[category as keyof typeof config.rvc];
    return model ? `${basePath}/${model}` : basePath;
  }
  
  // Music model paths
  if (category in config.music) {
    const basePath = config.music[category as keyof typeof config.music];
    return model ? `${basePath}/${model}` : basePath;
  }
  
  return config.basePath;
}

export function ensureModelDirectories(): void {
  const fs = require('fs');
  const path = require('path');
  
  const directories = [
    aiModelConfig.basePath,
    aiModelConfig.huggingfaceCache,
    aiModelConfig.torchHome,
    ...Object.values(aiModelConfig.rvc),
    ...Object.values(aiModelConfig.music),
    ...Object.values(aiModelConfig.features)
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created model directory: ${dir}`);
    }
  });
}

export default aiModelConfig;
