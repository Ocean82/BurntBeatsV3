
#!/usr/bin/env python3
"""
Melody Dataset Loader for Burnt Beats MIR
Handles the melody research dataset with 3000 synthesized melodies
"""

import os
import sys
import sqlite3
import xml.etree.ElementTree as ET
from pathlib import Path
import numpy as np
import json
from typing import Dict, List, Optional, Tuple
import logging

# Add parent directories to path for imports
sys.path.append(str(Path(__file__).parent.parent.parent))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MelodyDatasetLoader:
    """Loader for melody research dataset integration with Burnt Beats"""
    
    def __init__(self, dataset_path: str = "attached_assets"):
        self.dataset_path = Path(dataset_path)
        self.mir_data_path = Path("mir-data")
        
        # Create melody-specific directories
        self.melody_dir = self.mir_data_path / "audio" / "melodies"
        self.metadata_dir = self.mir_data_path / "metadata" / "melodies"
        self.features_dir = self.mir_data_path / "features" / "melodies"
        
        self._setup_directories()
        
        # Dataset metadata
        self.dataset_info = {
            'name': 'Melody Research Dataset',
            'total_melodies': 3000,
            'unique_melodies': 30,
            'transformations_per_melody': 100,
            'description': 'Dataset for evaluation of audio melodic descriptors',
            'citation': 'M. Panteli and S. Dixon. On the Evaluation of Rhythmic and Melodic Descriptors for Music Similarity. ISMIR 2016.'
        }
        
        logger.info("Melody Dataset Loader initialized")
    
    def _setup_directories(self):
        """Setup directory structure for melody dataset"""
        directories = [
            self.melody_dir,
            self.metadata_dir,
            self.features_dir,
            self.melody_dir / "wav",
            self.melody_dir / "flac", 
            self.melody_dir / "spectrograms",
            self.metadata_dir / "transformations",
            self.features_dir / "extracted"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    def load_dataset_metadata(self) -> Dict:
        """Load metadata from XML files"""
        metadata = {}
        
        # Load main metadata
        meta_xml_path = self.dataset_path / "melody_dataset_meta_1752353352611.xml"
        if meta_xml_path.exists():
            try:
                tree = ET.parse(meta_xml_path)
                root = tree.getroot()
                
                metadata['dataset_info'] = {}
                for child in root:
                    if child.text:
                        metadata['dataset_info'][child.tag] = child.text.strip()
                
                logger.info("Loaded dataset metadata from XML")
            except Exception as e:
                logger.error(f"Error loading metadata XML: {e}")
        
        # Load file information
        files_xml_path = self.dataset_path / "melody_dataset_files_1752353352610.xml"
        if files_xml_path.exists():
            try:
                tree = ET.parse(files_xml_path)
                root = tree.getroot()
                
                metadata['files'] = {}
                for file_elem in root.findall('file'):
                    filename = file_elem.get('name')
                    file_info = {
                        'source': file_elem.get('source', 'unknown'),
                        'format': file_elem.find('format').text if file_elem.find('format') is not None else 'unknown',
                        'size': int(file_elem.find('size').text) if file_elem.find('size') is not None else 0
                    }
                    
                    # Add additional attributes
                    for attr in ['md5', 'length', 'track']:
                        elem = file_elem.find(attr)
                        if elem is not None:
                            file_info[attr] = elem.text
                    
                    metadata['files'][filename] = file_info
                
                logger.info(f"Loaded information for {len(metadata['files'])} files")
            except Exception as e:
                logger.error(f"Error loading files XML: {e}")
        
        return metadata
    
    def process_melody_files(self) -> Dict:
        """Process melody WAV files for integration"""
        processed_files = {}
        
        # Look for WAV files in attached assets
        wav_files = list(self.dataset_path.glob("*.wav"))
        
        for wav_file in wav_files:
            try:
                # Extract melody information from filename
                melody_id = wav_file.stem
                
                # Copy to melody directory
                target_path = self.melody_dir / "wav" / wav_file.name
                if not target_path.exists():
                    import shutil
                    shutil.copy2(wav_file, target_path)
                    logger.info(f"Copied {wav_file.name} to melody dataset")
                
                # Create melody metadata
                melody_info = {
                    'melody_id': melody_id,
                    'original_file': wav_file.name,
                    'file_path': str(target_path),
                    'dataset': 'melody_research_dataset',
                    'transformations': self._extract_transformation_info(melody_id)
                }
                
                processed_files[melody_id] = melody_info
                
            except Exception as e:
                logger.error(f"Error processing {wav_file}: {e}")
        
        return processed_files
    
    def _extract_transformation_info(self, melody_id: str) -> Dict:
        """Extract transformation information from melody ID"""
        # Parse melody ID to understand transformations
        # Format appears to be like "1_1_1" where parts might indicate:
        # - Base melody number
        # - Transformation type
        # - Transformation variant
        
        parts = melody_id.split('_')
        if len(parts) >= 3:
            return {
                'base_melody': parts[0],
                'transformation_type': parts[1],
                'transformation_variant': parts[2],
                'estimated_transformations': [
                    'timbre_change',
                    'recording_quality_variation',
                    'tempo_modification',
                    'key_transposition'
                ]
            }
        
        return {'base_melody': melody_id, 'transformations': []}
    
    def integrate_with_burnt_beats_mir(self) -> Dict:
        """Integrate melody dataset with Burnt Beats MIR pipeline"""
        try:
            # Load metadata
            metadata = self.load_dataset_metadata()
            
            # Process melody files
            processed_melodies = self.process_melody_files()
            
            # Create integration summary
            integration_results = {
                'dataset_info': self.dataset_info,
                'loaded_metadata': len(metadata.get('files', {})),
                'processed_melodies': len(processed_melodies),
                'integration_status': 'success',
                'melodies': processed_melodies,
                'metadata': metadata
            }
            
            # Save integration results
            self._save_integration_results(integration_results)
            
            # Create melody index for fast lookup
            self._create_melody_index(processed_melodies)
            
            logger.info(f"Successfully integrated {len(processed_melodies)} melodies")
            return integration_results
            
        except Exception as e:
            logger.error(f"Error during integration: {e}")
            return {
                'integration_status': 'failed',
                'error': str(e),
                'processed_melodies': 0
            }
    
    def _save_integration_results(self, results: Dict):
        """Save integration results to JSON"""
        output_path = self.metadata_dir / "integration_results.json"
        
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        logger.info(f"Integration results saved to {output_path}")
    
    def _create_melody_index(self, melodies: Dict):
        """Create searchable index of melodies"""
        melody_index = {
            'total_count': len(melodies),
            'by_base_melody': {},
            'by_transformation': {},
            'file_paths': {}
        }
        
        for melody_id, info in melodies.items():
            # Index by base melody
            base_melody = info.get('transformations', {}).get('base_melody', 'unknown')
            if base_melody not in melody_index['by_base_melody']:
                melody_index['by_base_melody'][base_melody] = []
            melody_index['by_base_melody'][base_melody].append(melody_id)
            
            # Index by transformation type
            transform_type = info.get('transformations', {}).get('transformation_type', 'unknown')
            if transform_type not in melody_index['by_transformation']:
                melody_index['by_transformation'][transform_type] = []
            melody_index['by_transformation'][transform_type].append(melody_id)
            
            # Index file paths
            melody_index['file_paths'][melody_id] = info.get('file_path')
        
        # Save index
        index_path = self.metadata_dir / "melody_index.json"
        with open(index_path, 'w') as f:
            json.dump(melody_index, f, indent=2)
        
        logger.info(f"Melody index created with {len(melodies)} entries")
    
    def get_melody_by_id(self, melody_id: str) -> Optional[Dict]:
        """Get melody information by ID"""
        index_path = self.metadata_dir / "melody_index.json"
        
        if not index_path.exists():
            logger.warning("Melody index not found. Run integration first.")
            return None
        
        try:
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            file_path = index['file_paths'].get(melody_id)
            if file_path and Path(file_path).exists():
                return {
                    'melody_id': melody_id,
                    'file_path': file_path,
                    'exists': True
                }
        except Exception as e:
            logger.error(f"Error reading melody index: {e}")
        
        return None
    
    def get_melodies_by_base(self, base_melody: str) -> List[str]:
        """Get all melody variations for a base melody"""
        index_path = self.metadata_dir / "melody_index.json"
        
        if not index_path.exists():
            return []
        
        try:
            with open(index_path, 'r') as f:
                index = json.load(f)
            
            return index['by_base_melody'].get(base_melody, [])
        except Exception as e:
            logger.error(f"Error reading melody index: {e}")
            return []

# CLI interface for testing
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Melody Dataset Loader")
    parser.add_argument("--integrate", action="store_true", help="Integrate melody dataset")
    parser.add_argument("--list", action="store_true", help="List available melodies")
    parser.add_argument("--melody-id", help="Get specific melody info")
    
    args = parser.parse_args()
    
    loader = MelodyDatasetLoader()
    
    if args.integrate:
        print("🎵 Integrating melody dataset...")
        results = loader.integrate_with_burnt_beats_mir()
        print(json.dumps(results, indent=2, default=str))
    
    elif args.list:
        print("📋 Available melodies:")
        # Implementation for listing melodies
        
    elif args.melody_id:
        melody_info = loader.get_melody_by_id(args.melody_id)
        if melody_info:
            print(f"🎼 Melody {args.melody_id}:")
            print(json.dumps(melody_info, indent=2))
        else:
            print(f"❌ Melody {args.melody_id} not found")
    
    else:
        print("🎵 Melody Dataset Loader ready")
        print("Use --help for available commands")
