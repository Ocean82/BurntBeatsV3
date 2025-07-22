
#!/usr/bin/env python3
"""
Comprehensive Feature Extractor for Burnt Beats MIR Pipeline
Extracts various audio features for music analysis and generation
"""

import numpy as np
import librosa
import scipy.stats
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import json
import logging

logger = logging.getLogger(__name__)

class BurntBeatsFeatureExtractor:
    """Advanced feature extraction for music analysis"""
    
    def __init__(self, sample_rate: int = 22050):
        self.sr = sample_rate
        self.hop_length = 512
        self.frame_length = 2048
    
    def extract_temporal_features(self, audio: np.ndarray) -> Dict[str, float]:
        """Extract time-domain features"""
        features = {}
        
        # Basic statistics
        features['duration'] = len(audio) / self.sr
        features['rms_energy'] = np.sqrt(np.mean(audio**2))
        features['zero_crossing_rate'] = np.mean(librosa.feature.zero_crossing_rate(audio))
        
        # Dynamic range
        features['dynamic_range'] = np.max(audio) - np.min(audio)
        features['crest_factor'] = np.max(np.abs(audio)) / features['rms_energy']
        
        return features
    
    def extract_spectral_features(self, audio: np.ndarray) -> Dict[str, np.ndarray]:
        """Extract frequency-domain features"""
        features = {}
        
        # MFCC - Mel-frequency cepstral coefficients
        features['mfcc'] = librosa.feature.mfcc(
            y=audio, sr=self.sr, n_mfcc=13, 
            hop_length=self.hop_length
        )
        
        # Chroma features
        features['chroma'] = librosa.feature.chroma_stft(
            y=audio, sr=self.sr, 
            hop_length=self.hop_length
        )
        
        # Spectral contrast
        features['spectral_contrast'] = librosa.feature.spectral_contrast(
            y=audio, sr=self.sr,
            hop_length=self.hop_length
        )
        
        # Tonnetz (tonal centroid features)
        features['tonnetz'] = librosa.feature.tonnetz(
            y=audio, sr=self.sr
        )
        
        # Spectral centroid, bandwidth, rolloff
        features['spectral_centroid'] = librosa.feature.spectral_centroid(
            y=audio, sr=self.sr
        )
        features['spectral_bandwidth'] = librosa.feature.spectral_bandwidth(
            y=audio, sr=self.sr
        )
        features['spectral_rolloff'] = librosa.feature.spectral_rolloff(
            y=audio, sr=self.sr
        )
        
        return features
    
    def extract_rhythmic_features(self, audio: np.ndarray) -> Dict[str, np.ndarray]:
        """Extract rhythm and tempo features"""
        features = {}
        
        # Tempo estimation
        tempo, beats = librosa.beat.beat_track(
            y=audio, sr=self.sr,
            hop_length=self.hop_length
        )
        features['tempo'] = tempo
        features['beat_frames'] = beats
        features['beat_times'] = librosa.frames_to_time(beats, sr=self.sr)
        
        # Onset detection
        onset_frames = librosa.onset.onset_detect(
            y=audio, sr=self.sr,
            hop_length=self.hop_length
        )
        features['onset_times'] = librosa.frames_to_time(onset_frames, sr=self.sr)
        
        # Rhythm patterns
        tempogram = librosa.feature.tempogram(
            y=audio, sr=self.sr,
            hop_length=self.hop_length
        )
        features['tempogram'] = tempogram
        
        return features
    
    def extract_harmonic_features(self, audio: np.ndarray) -> Dict[str, np.ndarray]:
        """Extract harmonic content features"""
        features = {}
        
        # Harmonic-percussive separation
        harmonic, percussive = librosa.effects.hpss(audio)
        features['harmonic_component'] = harmonic
        features['percussive_component'] = percussive
        
        # Pitch tracking
        pitches, magnitudes = librosa.piptrack(
            y=audio, sr=self.sr,
            hop_length=self.hop_length
        )
        features['pitch_contour'] = pitches
        features['pitch_magnitudes'] = magnitudes
        
        # Constant-Q transform for better pitch resolution
        cqt = librosa.cqt(y=audio, sr=self.sr)
        features['cqt'] = np.abs(cqt)
        
        return features
    
    def extract_genre_features(self, audio: np.ndarray) -> Dict[str, float]:
        """Extract features commonly used for genre classification"""
        features = {}
        
        # Spectral features statistical moments
        spectral_centroids = librosa.feature.spectral_centroid(y=audio, sr=self.sr)[0]
        features['spectral_centroid_mean'] = np.mean(spectral_centroids)
        features['spectral_centroid_std'] = np.std(spectral_centroids)
        
        # MFCC statistics
        mfcc = librosa.feature.mfcc(y=audio, sr=self.sr, n_mfcc=13)
        for i in range(13):
            features[f'mfcc_{i}_mean'] = np.mean(mfcc[i])
            features[f'mfcc_{i}_std'] = np.std(mfcc[i])
        
        # Chroma statistics
        chroma = librosa.feature.chroma_stft(y=audio, sr=self.sr)
        features['chroma_mean'] = np.mean(chroma)
        features['chroma_std'] = np.std(chroma)
        
        # Zero crossing rate
        zcr = librosa.feature.zero_crossing_rate(audio)[0]
        features['zcr_mean'] = np.mean(zcr)
        features['zcr_std'] = np.std(zcr)
        
        return features
    
    def extract_voice_features(self, audio: np.ndarray) -> Dict[str, np.ndarray]:
        """Extract features specific to voice analysis (for RVC integration)"""
        features = {}
        
        # Fundamental frequency (F0) tracking
        f0 = librosa.yin(audio, fmin=50, fmax=2000, sr=self.sr)
        features['f0'] = f0
        
        # Formant-like features using MFCC
        mfcc = librosa.feature.mfcc(y=audio, sr=self.sr, n_mfcc=13)
        features['voice_mfcc'] = mfcc
        
        # Spectral slope (voice quality indicator)
        stft = librosa.stft(audio)
        freqs = librosa.fft_frequencies(sr=self.sr)
        spectral_slope = []
        
        for frame in range(stft.shape[1]):
            magnitude = np.abs(stft[:, frame])
            if np.sum(magnitude) > 0:
                slope = np.polyfit(freqs, magnitude, 1)[0]
                spectral_slope.append(slope)
        
        features['spectral_slope'] = np.array(spectral_slope)
        
        return features
    
    def extract_all_features(self, audio: np.ndarray) -> Dict:
        """Extract comprehensive feature set"""
        all_features = {}
        
        logger.info("Extracting temporal features...")
        all_features['temporal'] = self.extract_temporal_features(audio)
        
        logger.info("Extracting spectral features...")
        all_features['spectral'] = self.extract_spectral_features(audio)
        
        logger.info("Extracting rhythmic features...")
        all_features['rhythmic'] = self.extract_rhythmic_features(audio)
        
        logger.info("Extracting harmonic features...")
        all_features['harmonic'] = self.extract_harmonic_features(audio)
        
        logger.info("Extracting genre features...")
        all_features['genre'] = self.extract_genre_features(audio)
        
        logger.info("Extracting voice features...")
        all_features['voice'] = self.extract_voice_features(audio)
        
        return all_features
    
    def save_features(self, features: Dict, output_path: Path, track_id: str):
        """Save extracted features to files"""
        # Create output directory
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save each feature type
        for feature_type, feature_data in features.items():
            type_dir = output_path / feature_type
            type_dir.mkdir(exist_ok=True)
            
            if isinstance(feature_data, dict):
                # Handle nested dictionaries
                for sub_feature, data in feature_data.items():
                    if isinstance(data, np.ndarray):
                        np.save(type_dir / f"{track_id}_{sub_feature}.npy", data)
                    else:
                        # Save scalar values as JSON
                        with open(type_dir / f"{track_id}_{sub_feature}.json", 'w') as f:
                            json.dump({sub_feature: float(data)}, f)
            else:
                # Direct numpy array
                np.save(type_dir / f"{track_id}.npy", feature_data)
        
        logger.info(f"Saved features for {track_id} to {output_path}")

# Integration with Burnt Beats voice pipeline
class BurntBeatsVoiceAnalyzer(BurntBeatsFeatureExtractor):
    """Specialized analyzer for voice cloning features"""
    
    def analyze_voice_sample(self, audio: np.ndarray) -> Dict:
        """Analyze voice sample for RVC training compatibility"""
        analysis = {}
        
        # Voice quality metrics
        voice_features = self.extract_voice_features(audio)
        analysis['f0_range'] = (np.min(voice_features['f0']), np.max(voice_features['f0']))
        analysis['f0_mean'] = np.mean(voice_features['f0'])
        analysis['f0_std'] = np.std(voice_features['f0'])
        
        # Audio quality check
        temporal = self.extract_temporal_features(audio)
        analysis['duration'] = temporal['duration']
        analysis['rms_energy'] = temporal['rms_energy']
        analysis['quality_score'] = min(1.0, temporal['rms_energy'] * 10)  # Simple quality metric
        
        # Suitability for voice cloning
        analysis['suitable_for_rvc'] = (
            analysis['duration'] > 10.0 and  # At least 10 seconds
            analysis['quality_score'] > 0.3 and  # Decent quality
            analysis['f0_std'] > 10.0  # Some pitch variation
        )
        
        return analysis

if __name__ == "__main__":
    # Example usage
    extractor = BurntBeatsFeatureExtractor()
    voice_analyzer = BurntBeatsVoiceAnalyzer()
    
    print("Burnt Beats Feature Extractor initialized")
    print("Ready for MIR analysis and voice processing")
