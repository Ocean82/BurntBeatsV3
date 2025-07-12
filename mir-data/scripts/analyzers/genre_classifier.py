
#!/usr/bin/env python3
"""
Genre Classification for Burnt Beats
Analyzes audio content to predict and classify musical genres
"""

import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class BurntBeatsGenreClassifier:
    """Genre classification system for Burnt Beats music analysis"""
    
    def __init__(self, model_path: Optional[str] = None):
        self.model = None
        self.scaler = StandardScaler()
        self.genre_labels = [
            'pop', 'rock', 'jazz', 'classical', 'electronic', 
            'hip-hop', 'country', 'blues', 'reggae', 'folk'
        ]
        self.feature_names = []
        
        if model_path and Path(model_path).exists():
            self.load_model(model_path)
        else:
            self.model = RandomForestClassifier(
                n_estimators=100, 
                random_state=42,
                max_depth=10
            )
    
    def extract_classification_features(self, features_dict: Dict) -> np.ndarray:
        """Extract features suitable for genre classification"""
        classification_features = []
        
        # Get genre-specific features if available
        if 'genre' in features_dict:
            genre_features = features_dict['genre']
            for key in sorted(genre_features.keys()):
                classification_features.append(genre_features[key])
        
        # Temporal features
        if 'temporal' in features_dict:
            temporal = features_dict['temporal']
            classification_features.extend([
                temporal.get('rms_energy', 0),
                temporal.get('zero_crossing_rate', 0),
                temporal.get('dynamic_range', 0)
            ])
        
        # Spectral features statistics
        if 'spectral' in features_dict:
            spectral = features_dict['spectral']
            
            # MFCC statistics
            if 'mfcc' in spectral:
                mfcc = spectral['mfcc']
                classification_features.extend([
                    np.mean(mfcc),
                    np.std(mfcc),
                    np.mean(mfcc[0]),  # First MFCC coefficient
                    np.std(mfcc[0])
                ])
            
            # Chroma statistics
            if 'chroma' in spectral:
                chroma = spectral['chroma']
                classification_features.extend([
                    np.mean(chroma),
                    np.std(chroma)
                ])
            
            # Spectral centroid statistics
            if 'spectral_centroid' in spectral:
                centroid = spectral['spectral_centroid']
                classification_features.extend([
                    np.mean(centroid),
                    np.std(centroid)
                ])
        
        # Rhythmic features
        if 'rhythmic' in features_dict:
            rhythmic = features_dict['rhythmic']
            classification_features.extend([
                rhythmic.get('tempo', 120),  # Default tempo
                len(rhythmic.get('beat_times', [])) / 60 if rhythmic.get('beat_times') is not None else 2  # Beats per second
            ])
        
        return np.array(classification_features)
    
    def train_model(self, training_data: List[Tuple[Dict, str]]) -> float:
        """Train the genre classification model"""
        X = []
        y = []
        
        for features_dict, genre_label in training_data:
            feature_vector = self.extract_classification_features(features_dict)
            if len(feature_vector) > 0:
                X.append(feature_vector)
                y.append(genre_label)
        
        if not X:
            raise ValueError("No valid training data provided")
        
        X = np.array(X)
        y = np.array(y)
        
        # Store feature names for consistency
        self.feature_names = [f"feature_{i}" for i in range(X.shape[1])]
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        accuracy = np.mean(y_pred == y_test)
        
        logger.info(f"Genre classification model trained with accuracy: {accuracy:.3f}")
        logger.info(f"Classification report:\n{classification_report(y_test, y_pred)}")
        
        return accuracy
    
    def predict_genre(self, features_dict: Dict) -> Tuple[str, float]:
        """Predict genre from extracted features"""
        if self.model is None:
            raise ValueError("Model not trained or loaded")
        
        feature_vector = self.extract_classification_features(features_dict)
        if len(feature_vector) == 0:
            return "unknown", 0.0
        
        # Reshape for prediction
        feature_vector = feature_vector.reshape(1, -1)
        
        # Scale features
        feature_vector_scaled = self.scaler.transform(feature_vector)
        
        # Predict
        prediction = self.model.predict(feature_vector_scaled)[0]
        probabilities = self.model.predict_proba(feature_vector_scaled)[0]
        confidence = np.max(probabilities)
        
        return prediction, confidence
    
    def get_genre_probabilities(self, features_dict: Dict) -> Dict[str, float]:
        """Get probability distribution over all genres"""
        if self.model is None:
            raise ValueError("Model not trained or loaded")
        
        feature_vector = self.extract_classification_features(features_dict)
        if len(feature_vector) == 0:
            return {genre: 0.0 for genre in self.genre_labels}
        
        # Reshape and scale
        feature_vector = feature_vector.reshape(1, -1)
        feature_vector_scaled = self.scaler.transform(feature_vector)
        
        # Get probabilities
        probabilities = self.model.predict_proba(feature_vector_scaled)[0]
        
        # Map to genre labels
        genre_probs = {}
        for i, genre in enumerate(self.model.classes_):
            genre_probs[genre] = probabilities[i]
        
        return genre_probs
    
    def save_model(self, model_path: str):
        """Save trained model and scaler"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'genre_labels': self.genre_labels,
            'feature_names': self.feature_names
        }
        
        joblib.dump(model_data, model_path)
        logger.info(f"Model saved to {model_path}")
    
    def load_model(self, model_path: str):
        """Load trained model and scaler"""
        model_data = joblib.load(model_path)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.genre_labels = model_data.get('genre_labels', self.genre_labels)
        self.feature_names = model_data.get('feature_names', [])
        
        logger.info(f"Model loaded from {model_path}")
    
    def analyze_burnt_beats_track(self, features_dict: Dict) -> Dict:
        """Comprehensive genre analysis for Burnt Beats tracks"""
        analysis = {}
        
        # Primary genre prediction
        primary_genre, confidence = self.predict_genre(features_dict)
        analysis['primary_genre'] = primary_genre
        analysis['confidence'] = confidence
        
        # Genre probability distribution
        genre_probs = self.get_genre_probabilities(features_dict)
        analysis['genre_probabilities'] = genre_probs
        
        # Top 3 likely genres
        sorted_genres = sorted(genre_probs.items(), key=lambda x: x[1], reverse=True)
        analysis['top_3_genres'] = sorted_genres[:3]
        
        # Genre characteristics
        if 'rhythmic' in features_dict:
            tempo = features_dict['rhythmic'].get('tempo', 120)
            analysis['tempo_category'] = self._categorize_tempo(tempo)
        
        if 'spectral' in features_dict and 'spectral_centroid' in features_dict['spectral']:
            centroid_mean = np.mean(features_dict['spectral']['spectral_centroid'])
            analysis['brightness'] = 'bright' if centroid_mean > 2000 else 'warm'
        
        return analysis
    
    def _categorize_tempo(self, tempo: float) -> str:
        """Categorize tempo into descriptive categories"""
        if tempo < 60:
            return "very_slow"
        elif tempo < 90:
            return "slow"
        elif tempo < 120:
            return "moderate"
        elif tempo < 150:
            return "fast"
        else:
            return "very_fast"

# Integration class for Burnt Beats workflow
class BurntBeatsGenreAnalyzer:
    """High-level genre analysis for Burnt Beats platform"""
    
    def __init__(self, mir_data_path: str = "mir-data"):
        self.mir_path = Path(mir_data_path)
        self.classifier = BurntBeatsGenreClassifier()
        self.load_pretrained_model()
    
    def load_pretrained_model(self):
        """Load pre-trained model if available"""
        model_path = self.mir_path / "models" / "genre_classifier.joblib"
        if model_path.exists():
            self.classifier.load_model(str(model_path))
            logger.info("Loaded pre-trained genre classification model")
        else:
            logger.info("No pre-trained model found. Train model before using.")
    
    def analyze_generated_music(self, audio_features: Dict, track_metadata: Dict = None) -> Dict:
        """Analyze generated music from Burnt Beats"""
        
        # Basic genre analysis
        genre_analysis = self.classifier.analyze_burnt_beats_track(audio_features)
        
        # Add Burnt Beats specific insights
        analysis = {
            'genre_analysis': genre_analysis,
            'burnt_beats_score': self._calculate_burnt_beats_score(audio_features),
            'recommendations': self._generate_recommendations(genre_analysis, track_metadata)
        }
        
        return analysis
    
    def _calculate_burnt_beats_score(self, features: Dict) -> Dict:
        """Calculate quality and creativity scores for Burnt Beats"""
        scores = {}
        
        # Creativity score based on genre diversity
        if 'genre_probabilities' in features:
            genre_probs = features['genre_probabilities']
            entropy = -sum(p * np.log2(p + 1e-10) for p in genre_probs.values() if p > 0)
            scores['creativity'] = min(1.0, entropy / 3.0)  # Normalize to 0-1
        
        # Quality score based on audio characteristics
        if 'temporal' in features:
            temporal = features['temporal']
            quality = min(1.0, temporal.get('rms_energy', 0) * 5)  # Simple quality metric
            scores['audio_quality'] = quality
        
        return scores
    
    def _generate_recommendations(self, genre_analysis: Dict, metadata: Dict = None) -> List[str]:
        """Generate recommendations for improving generated music"""
        recommendations = []
        
        primary_genre = genre_analysis.get('primary_genre', 'unknown')
        confidence = genre_analysis.get('confidence', 0)
        
        if confidence < 0.7:
            recommendations.append("Consider enhancing genre-specific characteristics")
        
        if primary_genre == 'electronic':
            recommendations.append("Try adding more rhythmic elements or synthesizer textures")
        elif primary_genre == 'rock':
            recommendations.append("Consider adding guitar-like timbres or driving rhythms")
        elif primary_genre == 'jazz':
            recommendations.append("Experiment with complex harmonies and swing rhythms")
        
        return recommendations

if __name__ == "__main__":
    # Example usage
    analyzer = BurntBeatsGenreAnalyzer()
    print("Burnt Beats Genre Analyzer ready")
