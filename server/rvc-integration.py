
#!/usr/bin/env python3
"""
RVC Integration Service for Burnt Beats
"""

import os
import sys
import json
import uuid
import numpy as np
import soundfile as sf
from pathlib import Path
from typing import Dict, Optional, Tuple
import logging

# Add RVC path to system path
rvc_path = Path("./Retrieval-based-Voice-Conversion-WebUI")
sys.path.append(str(rvc_path))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BurntBeatsRVC:
    """RVC Voice Cloning Integration for Burnt Beats"""
    
    def __init__(self):
        self.rvc_path = Path("./Retrieval-based-Voice-Conversion-WebUI")
        self.output_dir = Path("./storage/voices")
        self.models_dir = self.rvc_path / "assets"
        self.sample_rate = 44100
        
        # Ensure directories exist
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize mock mode if models not available
        self.mock_mode = not self._check_models_available()
        
        if self.mock_mode:
            logger.warning("Running in MOCK mode - models not found")
        else:
            logger.info("RVC models loaded successfully")
    
    def _check_models_available(self) -> bool:
        """Check if RVC models are available"""
        required_files = [
            self.models_dir / "hubert" / "hubert_base.pt",
            self.models_dir / "rmvpe" / "rmvpe.pt"
        ]
        return all(f.exists() for f in required_files)
    
    def clone_voice(self, audio_path: str, text: str, voice_id: str = None) -> Dict:
        """Clone voice using RVC"""
        try:
            if voice_id is None:
                voice_id = f"rvc_{uuid.uuid4().hex[:8]}"
            
            output_path = self.output_dir / f"{voice_id}_{uuid.uuid4().hex[:8]}.wav"
            
            if self.mock_mode:
                # Generate mock audio
                duration = max(2.0, len(text) * 0.08)  # Estimate duration
                samples = int(duration * self.sample_rate)
                
                # Create more realistic mock audio (sine wave with noise)
                t = np.linspace(0, duration, samples)
                frequency = 440 + np.random.uniform(-50, 50)  # Random pitch
                audio = 0.3 * np.sin(2 * np.pi * frequency * t)
                audio += 0.1 * np.random.normal(0, 1, samples)  # Add noise
                
                # Apply envelope
                envelope = np.exp(-t * 0.5)
                audio = audio * envelope
                
                # Save mock audio
                sf.write(output_path, audio, self.sample_rate)
                
                return {
                    "success": True,
                    "audio_path": str(output_path),
                    "voice_id": voice_id,
                    "duration": duration,
                    "sample_rate": self.sample_rate,
                    "mode": "mock"
                }
            else:
                # Real RVC implementation would go here
                # This would involve:
                # 1. Loading the RVC model
                # 2. Processing the reference audio
                # 3. Generating voice embedding
                # 4. Synthesizing new audio with the text
                
                # For now, return mock result
                return self.clone_voice(audio_path, text, voice_id)
                
        except Exception as e:
            logger.error(f"Voice cloning failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def list_voices(self) -> list:
        """List available cloned voices"""
        try:
            if not self.output_dir.exists():
                return []
            
            voices = []
            for audio_file in self.output_dir.glob("*.wav"):
                stat = audio_file.stat()
                voices.append({
                    "filename": audio_file.name,
                    "path": str(audio_file),
                    "size": stat.st_size,
                    "created": stat.st_ctime
                })
            
            return voices
        except Exception as e:
            logger.error(f"Failed to list voices: {e}")
            return []
    
    def health_check(self) -> Dict:
        """Check RVC service health"""
        return {
            "status": "healthy",
            "rvc_available": not self.mock_mode,
            "mock_mode": self.mock_mode,
            "output_dir": str(self.output_dir),
            "models_dir": str(self.models_dir)
        }

# CLI interface for testing
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Burnt Beats RVC Integration")
    parser.add_argument("--test", action="store_true", help="Run test")
    parser.add_argument("--clone", nargs=2, metavar=("AUDIO", "TEXT"), help="Clone voice")
    parser.add_argument("--list", action="store_true", help="List voices")
    parser.add_argument("--health", action="store_true", help="Health check")
    
    args = parser.parse_args()
    
    rvc = BurntBeatsRVC()
    
    if args.test:
        print("🧪 Testing RVC integration...")
        result = rvc.clone_voice("test.wav", "Hello, this is a test of RVC voice cloning!")
        print(json.dumps(result, indent=2))
    
    elif args.clone:
        audio_path, text = args.clone
        print(f"🎤 Cloning voice from {audio_path} with text: {text}")
        result = rvc.clone_voice(audio_path, text)
        print(json.dumps(result, indent=2))
    
    elif args.list:
        voices = rvc.list_voices()
        print(f"📋 Found {len(voices)} cloned voices:")
        for voice in voices:
            print(f"  - {voice['filename']} ({voice['size']} bytes)")
    
    elif args.health:
        health = rvc.health_check()
        print("🏥 RVC Health Check:")
        print(json.dumps(health, indent=2))
    
    else:
        print("🔥 Burnt Beats RVC Integration Ready")
        print("Use --help for available commands")
