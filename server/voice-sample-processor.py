
#!/usr/bin/env python3
"""
Voice Sample Processor for Burnt Beats RVC Integration
Processes real voice samples for voice cloning
"""

import os
import json
import librosa
import soundfile as sf
import numpy as np
from pathlib import Path
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VoiceSampleProcessor:
    """Process voice samples for RVC training and cloning"""
    
    def __init__(self):
        self.voice_bank_path = Path("storage/voice-bank/samples")
        self.processed_path = Path("storage/voices/processed")
        self.analysis_path = Path("mir-data/voice_analysis")
        self.target_sr = 22050
        self.chunk_duration = 10.0  # seconds
        
        # Ensure directories exist
        for path in [self.processed_path, self.analysis_path]:
            path.mkdir(parents=True, exist_ok=True)
    
    def analyze_voice_sample(self, audio_path: str) -> Dict:
        """Analyze voice sample quality and characteristics"""
        try:
            # Load audio
            audio, sr = librosa.load(audio_path, sr=self.target_sr)
            duration = len(audio) / sr
            
            # Basic audio analysis
            rms = librosa.feature.rms(y=audio)[0]
            spectral_centroid = librosa.feature.spectral_centroid(y=audio, sr=sr)[0]
            zero_crossing_rate = librosa.feature.zero_crossing_rate(audio)[0]
            
            # Voice-specific features
            pitches, magnitudes = librosa.piptrack(y=audio, sr=sr)
            pitch_mean = np.mean(pitches[pitches > 0]) if np.any(pitches > 0) else 0
            
            # Quality metrics
            snr_estimate = np.mean(rms) / (np.std(rms) + 1e-8)
            
            analysis = {
                "duration": float(duration),
                "sample_rate": sr,
                "rms_mean": float(np.mean(rms)),
                "rms_std": float(np.std(rms)),
                "pitch_mean": float(pitch_mean),
                "spectral_centroid_mean": float(np.mean(spectral_centroid)),
                "zero_crossing_rate_mean": float(np.mean(zero_crossing_rate)),
                "snr_estimate": float(snr_estimate),
                "suitable_for_rvc": duration > 5.0 and snr_estimate > 2.0,
                "quality_score": min(10.0, snr_estimate * 2.0),
                "recommended_for_training": duration > 30.0 and snr_estimate > 3.0
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing voice sample {audio_path}: {e}")
            return {"error": str(e)}
    
    def preprocess_for_rvc(self, audio_path: str, voice_id: str) -> Dict:
        """Preprocess voice sample for RVC training"""
        try:
            # Load and normalize audio
            audio, sr = librosa.load(audio_path, sr=self.target_sr)
            
            # Normalize audio level
            audio = librosa.util.normalize(audio)
            
            # Remove silence
            audio, _ = librosa.effects.trim(audio, top_db=20)
            
            # Split into chunks if long
            chunks = []
            chunk_samples = int(self.chunk_duration * sr)
            
            if len(audio) > chunk_samples:
                for i in range(0, len(audio), chunk_samples):
                    chunk = audio[i:i + chunk_samples]
                    if len(chunk) >= sr * 2:  # At least 2 seconds
                        chunks.append(chunk)
            else:
                chunks = [audio]
            
            # Save processed chunks
            output_files = []
            for i, chunk in enumerate(chunks):
                output_file = self.processed_path / f"{voice_id}_chunk_{i:03d}.wav"
                sf.write(output_file, chunk, sr)
                output_files.append(str(output_file))
            
            processing_result = {
                "voice_id": voice_id,
                "original_file": audio_path,
                "processed_files": output_files,
                "chunk_count": len(chunks),
                "total_duration": len(audio) / sr,
                "sample_rate": sr,
                "processing_date": str(Path(audio_path).stat().st_mtime)
            }
            
            # Save processing metadata
            metadata_file = self.analysis_path / f"{voice_id}_processing.json"
            with open(metadata_file, 'w') as f:
                json.dump(processing_result, f, indent=2)
            
            return processing_result
            
        except Exception as e:
            logger.error(f"Error preprocessing {audio_path}: {e}")
            return {"error": str(e)}
    
    def process_all_samples(self) -> Dict:
        """Process all voice samples in the voice bank"""
        if not self.voice_bank_path.exists():
            return {"error": "Voice bank directory not found"}
        
        results = {
            "processed_voices": [],
            "analysis_results": [],
            "errors": []
        }
        
        # Find all audio files
        audio_extensions = ['.mp3', '.wav', '.flac', '.m4a']
        audio_files = []
        
        for ext in audio_extensions:
            audio_files.extend(self.voice_bank_path.glob(f"*{ext}"))
        
        logger.info(f"Found {len(audio_files)} voice samples to process")
        
        for audio_file in audio_files:
            try:
                # Generate voice ID from filename
                voice_id = audio_file.stem.replace(' ', '_').lower()
                
                logger.info(f"Processing voice sample: {voice_id}")
                
                # Analyze sample
                analysis = self.analyze_voice_sample(str(audio_file))
                analysis['voice_id'] = voice_id
                analysis['original_file'] = str(audio_file)
                results['analysis_results'].append(analysis)
                
                # Preprocess for RVC if suitable
                if analysis.get('suitable_for_rvc', False):
                    processing_result = self.preprocess_for_rvc(str(audio_file), voice_id)
                    results['processed_voices'].append(processing_result)
                else:
                    logger.warning(f"Voice sample {voice_id} not suitable for RVC training")
                
            except Exception as e:
                error_msg = f"Error processing {audio_file}: {e}"
                logger.error(error_msg)
                results['errors'].append(error_msg)
        
        # Save summary
        summary_file = self.analysis_path / "voice_processing_summary.json"
        with open(summary_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        return results
    
    def get_voice_catalog(self) -> List[Dict]:
        """Get catalog of available voice samples"""
        catalog = []
        
        if self.analysis_path.exists():
            for analysis_file in self.analysis_path.glob("*_processing.json"):
                try:
                    with open(analysis_file, 'r') as f:
                        voice_data = json.load(f)
                    catalog.append(voice_data)
                except Exception as e:
                    logger.error(f"Error reading {analysis_file}: {e}")
        
        return catalog

def main():
    """CLI interface for voice sample processing"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Process voice samples for RVC")
    parser.add_argument("--process-all", action="store_true", help="Process all voice samples")
    parser.add_argument("--analyze", help="Analyze specific voice sample")
    parser.add_argument("--catalog", action="store_true", help="Show voice catalog")
    
    args = parser.parse_args()
    
    processor = VoiceSampleProcessor()
    
    if args.process_all:
        print("🎤 Processing all voice samples...")
        results = processor.process_all_samples()
        
        print(f"\n📊 Processing Summary:")
        print(f"✅ Processed voices: {len(results['processed_voices'])}")
        print(f"📈 Analysis completed: {len(results['analysis_results'])}")
        print(f"❌ Errors: {len(results['errors'])}")
        
        if results['errors']:
            print("\n⚠️  Errors encountered:")
            for error in results['errors']:
                print(f"  - {error}")
    
    elif args.analyze:
        print(f"🔍 Analyzing voice sample: {args.analyze}")
        analysis = processor.analyze_voice_sample(args.analyze)
        print(json.dumps(analysis, indent=2))
    
    elif args.catalog:
        catalog = processor.get_voice_catalog()
        print(f"📋 Voice Catalog ({len(catalog)} voices):")
        for voice in catalog:
            print(f"  🎵 {voice['voice_id']}: {voice['chunk_count']} chunks, {voice['total_duration']:.1f}s")
    
    else:
        print("🎤 Burnt Beats Voice Sample Processor")
        print("Use --help for available commands")

if __name__ == "__main__":
    main()
