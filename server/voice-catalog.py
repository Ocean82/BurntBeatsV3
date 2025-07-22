
#!/usr/bin/env python3
"""
Voice Catalog Manager for Burnt Beats
Manages and displays available voice samples
"""

import json
import os
from pathlib import Path
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VoiceCatalog:
    """Manage voice sample catalog"""
    
    def __init__(self):
        self.voice_bank_path = Path("storage/voice-bank/samples")
        self.analysis_path = Path("mir-data/voice_analysis")
        self.catalog_file = self.analysis_path / "voice_catalog.json"
        
    def get_available_voices(self) -> List[Dict]:
        """Get list of available voice samples with metadata"""
        voices = []
        
        if not self.voice_bank_path.exists():
            return voices
        
        # Find all audio files
        audio_extensions = ['.mp3', '.wav', '.flac', '.m4a']
        
        for ext in audio_extensions:
            for audio_file in self.voice_bank_path.glob(f"*{ext}"):
                voice_info = {
                    "id": audio_file.stem.replace(' ', '_').lower(),
                    "name": audio_file.stem.replace('_', ' ').title(),
                    "file_path": str(audio_file),
                    "file_size": audio_file.stat().st_size,
                    "format": audio_file.suffix.lower(),
                    "available_for_cloning": True
                }
                
                # Add analysis data if available
                analysis_file = self.analysis_path / f"{voice_info['id']}_processing.json"
                if analysis_file.exists():
                    try:
                        with open(analysis_file, 'r') as f:
                            analysis_data = json.load(f)
                        voice_info.update({
                            "duration": analysis_data.get("total_duration", 0),
                            "chunk_count": analysis_data.get("chunk_count", 0),
                            "quality_score": analysis_data.get("quality_score", 0),
                            "suitable_for_rvc": analysis_data.get("suitable_for_rvc", False)
                        })
                    except Exception as e:
                        logger.error(f"Error reading analysis for {voice_info['id']}: {e}")
                
                voices.append(voice_info)
        
        return sorted(voices, key=lambda x: x['name'])
    
    def get_voice_by_id(self, voice_id: str) -> Dict:
        """Get specific voice by ID"""
        voices = self.get_available_voices()
        for voice in voices:
            if voice['id'] == voice_id:
                return voice
        return {}
    
    def save_catalog(self) -> bool:
        """Save voice catalog to file"""
        try:
            voices = self.get_available_voices()
            catalog_data = {
                "voice_count": len(voices),
                "last_updated": str(Path().stat().st_mtime),
                "voices": voices
            }
            
            self.analysis_path.mkdir(parents=True, exist_ok=True)
            with open(self.catalog_file, 'w') as f:
                json.dump(catalog_data, f, indent=2)
            
            return True
        except Exception as e:
            logger.error(f"Error saving catalog: {e}")
            return False
    
    def load_catalog(self) -> Dict:
        """Load voice catalog from file"""
        if self.catalog_file.exists():
            try:
                with open(self.catalog_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading catalog: {e}")
        
        # Return fresh catalog if file doesn't exist or has errors
        return {
            "voice_count": 0,
            "voices": self.get_available_voices()
        }

if __name__ == "__main__":
    catalog = VoiceCatalog()
    voices = catalog.get_available_voices()
    
    print("🎤 Burnt Beats Voice Catalog")
    print("=" * 40)
    
    if not voices:
        print("No voice samples found in voice bank.")
        print("Add voice samples to: storage/voice-bank/samples/")
    else:
        print(f"Found {len(voices)} voice samples:\n")
        
        for voice in voices:
            print(f"🎵 {voice['name']}")
            print(f"   ID: {voice['id']}")
            print(f"   Format: {voice['format']}")
            print(f"   Size: {voice['file_size']/1024/1024:.1f} MB")
            if 'duration' in voice:
                print(f"   Duration: {voice['duration']:.1f}s")
            if 'suitable_for_rvc' in voice:
                status = "✅" if voice['suitable_for_rvc'] else "⚠️"
                print(f"   RVC Ready: {status}")
            print()
        
        # Save catalog
        if catalog.save_catalog():
            print("📝 Voice catalog saved successfully")
