
#!/usr/bin/env python3
"""
AI Model Path Manager for Burnt Beats
Manages model paths and downloads for various AI services
"""

import os
import json
from pathlib import Path
from typing import Dict, Any
import urllib.request
import hashlib

class ModelManager:
    def __init__(self):
        self.config = self.load_config()
        self.ensure_directories()
    
    def load_config(self) -> Dict[str, Any]:
        """Load model configuration from environment variables"""
        return {
            'base_path': os.getenv('AI_MODEL_BASE_PATH', './storage/models'),
            'huggingface_cache': os.getenv('HUGGINGFACE_CACHE_DIR', './storage/models/huggingface'),
            'torch_home': os.getenv('TORCH_HOME', './storage/models/torch'),
            
            'rvc': {
                'models_path': os.getenv('RVC_MODELS_PATH', './Retrieval-based-Voice-Conversion-WebUI/assets/weights'),
                'pretrained_path': os.getenv('RVC_PRETRAINED_PATH', './Retrieval-based-Voice-Conversion-WebUI/assets/pretrained_v2'),
                'hubert_path': os.getenv('RVC_HUBERT_PATH', './Retrieval-based-Voice-Conversion-WebUI/assets/hubert'),
                'rmvpe_path': os.getenv('RVC_RMVPE_PATH', './Retrieval-based-Voice-Conversion-WebUI/assets/rmvpe'),
                'uvr5_weights': os.getenv('RVC_UVR5_WEIGHTS', './Retrieval-based-Voice-Conversion-WebUI/assets/uvr5_weights')
            },
            
            'music': {
                'audioldm2_cache': os.getenv('AUDIOLDM2_CACHE_PATH', './storage/models/audioldm2'),
                'music21_corpus': os.getenv('MUSIC21_CORPUS_PATH', './storage/models/music21_corpus'),
                'midi_models': os.getenv('MIDI_MODELS_PATH', './storage/models/midi')
            },
            
            'processing': {
                'auto_download': os.getenv('AUTO_DOWNLOAD_MODELS', 'true').lower() == 'true',
                'offline_mode': os.getenv('OFFLINE_MODE', 'false').lower() == 'true',
                'max_cache_size': int(os.getenv('MODEL_CACHE_SIZE_GB', '5'))
            },
            
            'model_urls': {
                'hubert_base': os.getenv('HUBERT_MODEL_URL', 'https://huggingface.co/lj1995/VoiceConversionWebUI/resolve/main/hubert_base.pt'),
                'rmvpe': os.getenv('RMVPE_MODEL_URL', 'https://huggingface.co/lj1995/VoiceConversionWebUI/resolve/main/rmvpe.pt')
            }
        }
    
    def ensure_directories(self):
        """Create all necessary model directories"""
        directories = [
            self.config['base_path'],
            self.config['huggingface_cache'],
            self.config['torch_home']
        ]
        
        # Add RVC directories
        directories.extend(self.config['rvc'].values())
        
        # Add music directories
        directories.extend(self.config['music'].values())
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
            print(f"📁 Ensured directory exists: {directory}")
    
    def get_model_path(self, category: str, model_name: str = None) -> str:
        """Get the full path for a model"""
        if category in self.config['rvc']:
            base_path = self.config['rvc'][category]
        elif category in self.config['music']:
            base_path = self.config['music'][category]
        else:
            base_path = self.config['base_path']
        
        if model_name:
            return os.path.join(base_path, model_name)
        return base_path
    
    def download_model(self, model_key: str, target_path: str = None) -> bool:
        """Download a model if it doesn't exist"""
        if self.config['processing']['offline_mode']:
            print(f"⚠️  Offline mode enabled, skipping download for {model_key}")
            return False
        
        if model_key not in self.config['model_urls']:
            print(f"❌ Unknown model key: {model_key}")
            return False
        
        url = self.config['model_urls'][model_key]
        
        if not target_path:
            if model_key == 'hubert_base':
                target_path = os.path.join(self.config['rvc']['hubert_path'], 'hubert_base.pt')
            elif model_key == 'rmvpe':
                target_path = os.path.join(self.config['rvc']['rmvpe_path'], 'rmvpe.pt')
            else:
                target_path = os.path.join(self.config['base_path'], f"{model_key}.pt")
        
        if os.path.exists(target_path):
            print(f"✅ Model already exists: {target_path}")
            return True
        
        try:
            print(f"📥 Downloading {model_key} from {url}")
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            urllib.request.urlretrieve(url, target_path)
            print(f"✅ Downloaded {model_key} to {target_path}")
            return True
        except Exception as e:
            print(f"❌ Failed to download {model_key}: {e}")
            return False
    
    def verify_model(self, model_path: str, expected_hash: str = None) -> bool:
        """Verify model integrity"""
        if not os.path.exists(model_path):
            return False
        
        if expected_hash:
            with open(model_path, 'rb') as f:
                file_hash = hashlib.md5(f.read()).hexdigest()
            return file_hash == expected_hash
        
        # Basic size check (models should be > 1MB)
        return os.path.getsize(model_path) > 1024 * 1024
    
    def setup_environment_variables(self):
        """Set up environment variables for AI libraries"""
        # HuggingFace transformers cache
        os.environ['TRANSFORMERS_CACHE'] = self.config['huggingface_cache']
        os.environ['HF_HOME'] = self.config['huggingface_cache']
        
        # PyTorch model cache
        os.environ['TORCH_HOME'] = self.config['torch_home']
        
        # Librosa cache
        if 'librosa_cache' in self.config:
            os.environ['LIBROSA_DATA_DIR'] = self.config['librosa_cache']
        
        print("🔧 Environment variables configured for AI models")
    
    def get_status(self) -> Dict[str, Any]:
        """Get status of all models"""
        status = {
            'directories': {},
            'models': {},
            'config': self.config['processing']
        }
        
        # Check directories
        all_dirs = [self.config['base_path'], self.config['huggingface_cache']]
        all_dirs.extend(self.config['rvc'].values())
        all_dirs.extend(self.config['music'].values())
        
        for directory in all_dirs:
            status['directories'][directory] = os.path.exists(directory)
        
        # Check key models
        key_models = {
            'hubert_base': os.path.join(self.config['rvc']['hubert_path'], 'hubert_base.pt'),
            'rmvpe': os.path.join(self.config['rvc']['rmvpe_path'], 'rmvpe.pt')
        }
        
        for model_name, model_path in key_models.items():
            status['models'][model_name] = {
                'exists': os.path.exists(model_path),
                'path': model_path,
                'size_mb': round(os.path.getsize(model_path) / (1024*1024), 2) if os.path.exists(model_path) else 0
            }
        
        return status

def main():
    """Initialize model manager and setup environment"""
    print("🤖 Burnt Beats AI Model Manager")
    print("=" * 50)
    
    manager = ModelManager()
    manager.setup_environment_variables()
    
    # Download essential models if auto-download is enabled
    if manager.config['processing']['auto_download']:
        print("\n📥 Auto-downloading essential models...")
        manager.download_model('hubert_base')
        manager.download_model('rmvpe')
    
    # Show status
    status = manager.get_status()
    print(f"\n📊 Model Manager Status:")
    print(f"   Directories created: {sum(status['directories'].values())}/{len(status['directories'])}")
    print(f"   Models available: {sum(1 for m in status['models'].values() if m['exists'])}/{len(status['models'])}")
    print(f"   Auto-download: {status['config']['auto_download']}")
    print(f"   Offline mode: {status['config']['offline_mode']}")
    
    return manager

if __name__ == "__main__":
    main()
