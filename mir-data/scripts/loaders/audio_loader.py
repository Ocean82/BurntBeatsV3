
#!/usr/bin/env python3
"""
Audio Loader for Burnt Beats MIR Data
Handles loading and preprocessing of audio files for analysis
"""

import os
import json
import numpy as np
import librosa
import soundfile as sf
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BurntBeatsMIRLoader:
    """Main loader class for MIR data in Burnt Beats"""
    
    def __init__(self, mir_data_path: str = "mir-data"):
        self.mir_path = Path(mir_data_path)
        self.audio_path = self.mir_path / "audio"
        self.annotations_path = self.mir_path / "annotations"
        self.features_path = self.mir_path / "features"
        self.metadata_path = self.mir_path / "metadata"
        
        # Ensure directories exist
        for path in [self.audio_path, self.annotations_path, self.features_path, self.metadata_path]:
            path.mkdir(parents=True, exist_ok=True)
    
    def load_audio(self, file_path: Union[str, Path], sr: int = 22050) -> Tuple[np.ndarray, int]:
        """Load audio file with specified sample rate"""
        try:
            audio, sample_rate = librosa.load(file_path, sr=sr)
            logger.info(f"Loaded audio: {file_path} (duration: {len(audio)/sample_rate:.2f}s)")
            return audio, sample_rate
        except Exception as e:
            logger.error(f"Failed to load audio {file_path}: {e}")
            raise
    
    def load_stems(self, track_id: str) -> Dict[str, np.ndarray]:
        """Load isolated instrument stems for a track"""
        stems_dir = self.audio_path / "stems" / track_id
        stems = {}
        
        if stems_dir.exists():
            for stem_file in stems_dir.glob("*.wav"):
                instrument = stem_file.stem
                audio, _ = self.load_audio(stem_file)
                stems[instrument] = audio
                logger.info(f"Loaded {instrument} stem for {track_id}")
        
        return stems
    
    def load_annotations(self, track_id: str, annotation_type: str) -> Optional[np.ndarray]:
        """Load ground truth annotations for a track"""
        annotation_file = self.annotations_path / annotation_type / f"{track_id}.{annotation_type}"
        
        if annotation_file.exists():
            if annotation_type in ["beats", "tempo"]:
                return np.loadtxt(annotation_file)
            elif annotation_type in ["chords", "melody"]:
                with open(annotation_file, 'r') as f:
                    return [line.strip() for line in f.readlines()]
        
        logger.warning(f"No {annotation_type} annotations found for {track_id}")
        return None
    
    def load_precomputed_features(self, track_id: str, feature_type: str) -> Optional[np.ndarray]:
        """Load precomputed features (MFCC, chroma, etc.)"""
        feature_file = self.features_path / feature_type / f"{track_id}.npy"
        
        if feature_file.exists():
            features = np.load(feature_file)
            logger.info(f"Loaded {feature_type} features for {track_id}: {features.shape}")
            return features
        
        return None
    
    def extract_and_save_features(self, audio: np.ndarray, track_id: str, sr: int = 22050):
        """Extract and save common MIR features"""
        # MFCC features
        mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
        mfcc_path = self.features_path / "mfcc" / f"{track_id}.npy"
        mfcc_path.parent.mkdir(exist_ok=True)
        np.save(mfcc_path, mfcc)
        
        # Chroma features
        chroma = librosa.feature.chroma_stft(y=audio, sr=sr)
        chroma_path = self.features_path / "chroma" / f"{track_id}.npy"
        chroma_path.parent.mkdir(exist_ok=True)
        np.save(chroma_path, chroma)
        
        # Spectral contrast
        contrast = librosa.feature.spectral_contrast(y=audio, sr=sr)
        contrast_path = self.features_path / "spectral" / f"{track_id}.npy"
        contrast_path.parent.mkdir(exist_ok=True)
        np.save(contrast_path, contrast)
        
        logger.info(f"Extracted and saved features for {track_id}")
        
        return {
            "mfcc": mfcc,
            "chroma": chroma,
            "spectral_contrast": contrast
        }
    
    def load_metadata(self, metadata_type: str = "recordings") -> Dict:
        """Load metadata for tracks"""
        metadata_file = self.metadata_path / f"{metadata_type}.json"
        
        if metadata_file.exists():
            with open(metadata_file, 'r') as f:
                return json.load(f)
        
        return {}
    
    def save_metadata(self, metadata: Dict, metadata_type: str = "recordings"):
        """Save metadata for tracks"""
        metadata_file = self.metadata_path / f"{metadata_type}.json"
        
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Saved {metadata_type} metadata")
    
    def get_track_info(self, track_id: str) -> Dict:
        """Get comprehensive information about a track"""
        info = {
            "track_id": track_id,
            "has_audio": False,
            "has_stems": False,
            "annotations": [],
            "features": [],
            "metadata": {}
        }
        
        # Check for main audio file
        audio_file = self.audio_path / "samples" / f"{track_id}.wav"
        if audio_file.exists():
            info["has_audio"] = True
        
        # Check for stems
        stems_dir = self.audio_path / "stems" / track_id
        if stems_dir.exists() and any(stems_dir.glob("*.wav")):
            info["has_stems"] = True
        
        # Check annotations
        for annotation_type in ["beats", "chords", "melody", "tempo"]:
            if (self.annotations_path / annotation_type / f"{track_id}.{annotation_type}").exists():
                info["annotations"].append(annotation_type)
        
        # Check features
        for feature_type in ["mfcc", "chroma", "spectral"]:
            if (self.features_path / feature_type / f"{track_id}.npy").exists():
                info["features"].append(feature_type)
        
        # Load metadata
        recordings_meta = self.load_metadata("recordings")
        if track_id in recordings_meta:
            info["metadata"] = recordings_meta[track_id]
        
        return info

# Example usage for Burnt Beats integration
if __name__ == "__main__":
    # Initialize the loader
    loader = BurntBeatsMIRLoader()
    
    # Example: Process a track
    track_id = "example_track"
    
    # Load audio
    try:
        audio_file = loader.audio_path / "samples" / f"{track_id}.wav"
        if audio_file.exists():
            audio, sr = loader.load_audio(audio_file)
            
            # Extract features
            features = loader.extract_and_save_features(audio, track_id, sr)
            
            # Get track info
            info = loader.get_track_info(track_id)
            print(f"Track info: {info}")
        
    except Exception as e:
        logger.error(f"Error processing track: {e}")
