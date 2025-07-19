
#!/usr/bin/env python3
"""
Groove Dataset Loader for Burnt Beats
Integrates the Groove v1.0.0 MIDI dataset
"""

import os
import sys
import json
import mido
from pathlib import Path
import logging
from typing import Dict, List, Optional
import shutil

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GrooveDatasetLoader:
    """Loader for Groove v1.0.0 MIDI dataset integration"""
    
    def __init__(self, dataset_path: str = "attached_assets"):
        self.dataset_path = Path(dataset_path)
        self.storage_path = Path("storage/midi/groove")
        self.templates_path = Path("storage/midi/templates")
        
        # Setup directories
        self._setup_directories()
        
        # Dataset metadata
        self.dataset_info = {
            'name': 'Groove v1.0.0 MIDI Dataset',
            'version': '1.0.0',
            'description': 'Professional MIDI groove patterns and rhythms',
            'type': 'midi_only',
            'source': 'groove-v1.0.0-midionly'
        }
        
        logger.info("Groove Dataset Loader initialized")
    
    def _setup_directories(self):
        """Setup directory structure for groove dataset"""
        directories = [
            self.storage_path,
            self.storage_path / "patterns",
            self.storage_path / "styles", 
            self.storage_path / "metadata",
            self.storage_path / "analyzed"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    def extract_and_catalog_grooves(self) -> Dict:
        """Extract MIDI files from the dataset and catalog them"""
        results = {
            'extracted_files': [],
            'groove_patterns': {},
            'styles': {},
            'metadata': {},
            'integration_status': 'in_progress'
        }
        
        try:
            # Look for extracted groove files
            groove_files = []
            
            # Search for MIDI files in various subdirectories and the entire system
            search_locations = [
                self.dataset_path,
                Path("attached_assets"),
                Path("mir-data"),
                Path("assets"),
                Path("storage/midi/groove-dataset")
            ]
            
            for location in search_locations:
                if location.exists():
                    for pattern in ['**/*.mid', '**/*.midi', '**/*.MID', '**/*.MIDI']:
                        groove_files.extend(list(location.glob(pattern)))
            
            logger.info(f"Found {len(groove_files)} MIDI files in groove dataset")
            
            for midi_file in groove_files:
                try:
                    # Analyze the MIDI file
                    analysis = self._analyze_groove_midi(midi_file)
                    
                    # Categorize by style/genre
                    style = self._detect_groove_style(midi_file, analysis)
                    
                    # Copy to organized storage
                    target_path = self._organize_groove_file(midi_file, style)
                    
                    # Store results
                    file_info = {
                        'original_path': str(midi_file),
                        'storage_path': str(target_path),
                        'style': style,
                        'analysis': analysis,
                        'tempo': analysis.get('estimated_tempo', 120),
                        'time_signature': analysis.get('time_signature', '4/4'),
                        'groove_type': self._classify_groove_type(analysis)
                    }
                    
                    results['extracted_files'].append(file_info)
                    
                    # Group by style
                    if style not in results['styles']:
                        results['styles'][style] = []
                    results['styles'][style].append(file_info)
                    
                    # Group by groove pattern type
                    groove_type = file_info['groove_type']
                    if groove_type not in results['groove_patterns']:
                        results['groove_patterns'][groove_type] = []
                    results['groove_patterns'][groove_type].append(file_info)
                    
                except Exception as e:
                    logger.error(f"Error processing {midi_file}: {e}")
                    continue
            
            results['integration_status'] = 'success'
            results['total_files'] = len(results['extracted_files'])
            
            # Save catalog
            self._save_groove_catalog(results)
            
            # Copy best grooves to templates
            self._copy_featured_grooves_to_templates(results)
            
            logger.info(f"Successfully processed {len(results['extracted_files'])} groove files")
            
        except Exception as e:
            logger.error(f"Error during groove extraction: {e}")
            results['integration_status'] = 'failed'
            results['error'] = str(e)
        
        return results
    
    def _analyze_groove_midi(self, midi_path: Path) -> Dict:
        """Analyze a groove MIDI file"""
        try:
            mid = mido.MidiFile(midi_path)
            
            analysis = {
                'filename': midi_path.name,
                'length': mid.length,
                'ticks_per_beat': mid.ticks_per_beat,
                'num_tracks': len(mid.tracks),
                'drum_tracks': 0,
                'melody_tracks': 0,
                'tempo_changes': [],
                'time_signatures': []
            }
            
            current_time = 0
            for track in mid.tracks:
                is_drum_track = False
                
                for msg in track:
                    current_time += msg.time
                    
                    # Check for drum channel (channel 9/10)
                    if hasattr(msg, 'channel') and msg.channel == 9:
                        is_drum_track = True
                    
                    # Extract tempo
                    if msg.type == 'set_tempo':
                        bpm = mido.tempo2bpm(msg.tempo)
                        analysis['tempo_changes'].append({
                            'time': current_time,
                            'bpm': round(bpm, 2)
                        })
                    
                    # Extract time signature
                    elif msg.type == 'time_signature':
                        analysis['time_signatures'].append({
                            'time': current_time,
                            'numerator': msg.numerator,
                            'denominator': msg.denominator
                        })
                
                if is_drum_track:
                    analysis['drum_tracks'] += 1
                else:
                    analysis['melody_tracks'] += 1
            
            # Estimate overall tempo
            if analysis['tempo_changes']:
                analysis['estimated_tempo'] = analysis['tempo_changes'][0]['bpm']
            else:
                analysis['estimated_tempo'] = 120
            
            # Estimate time signature
            if analysis['time_signatures']:
                ts = analysis['time_signatures'][0]
                analysis['time_signature'] = f"{ts['numerator']}/{ts['denominator']}"
            else:
                analysis['time_signature'] = "4/4"
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing {midi_path}: {e}")
            return {'error': str(e), 'filename': midi_path.name}
    
    def _detect_groove_style(self, midi_path: Path, analysis: Dict) -> str:
        """Detect the musical style/genre of the groove"""
        filename = midi_path.name.lower()
        parent_dir = midi_path.parent.name.lower()
        
        # Style detection based on filename and directory
        style_keywords = {
            'rock': ['rock', 'punk', 'metal', 'grunge'],
            'jazz': ['jazz', 'swing', 'bebop', 'fusion'],
            'funk': ['funk', 'soul', 'r&b', 'rnb'],
            'latin': ['latin', 'salsa', 'bossa', 'samba', 'mambo'],
            'electronic': ['electronic', 'edm', 'techno', 'house', 'trance'],
            'hip_hop': ['hip', 'hop', 'rap', 'trap', 'drill'],
            'pop': ['pop', 'commercial', 'mainstream'],
            'blues': ['blues', 'shuffle'],
            'reggae': ['reggae', 'ska', 'dub'],
            'country': ['country', 'folk', 'bluegrass'],
            'world': ['world', 'ethnic', 'traditional']
        }
        
        # Check tempo-based classification
        tempo = analysis.get('estimated_tempo', 120)
        
        for style, keywords in style_keywords.items():
            for keyword in keywords:
                if keyword in filename or keyword in parent_dir:
                    return style
        
        # Tempo-based fallback classification
        if tempo < 80:
            return 'ballad'
        elif tempo < 100:
            return 'medium'
        elif tempo < 140:
            return 'upbeat' 
        else:
            return 'fast'
    
    def _classify_groove_type(self, analysis: Dict) -> str:
        """Classify the type of groove pattern"""
        if analysis.get('drum_tracks', 0) > 0:
            return 'drum_pattern'
        elif analysis.get('melody_tracks', 0) > 0:
            if analysis.get('num_tracks', 0) > 2:
                return 'full_arrangement'
            else:
                return 'melody_pattern'
        else:
            return 'chord_progression'
    
    def _organize_groove_file(self, source_path: Path, style: str) -> Path:
        """Copy and organize groove file by style"""
        # Create style directory
        style_dir = self.storage_path / "styles" / style
        style_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy file
        target_path = style_dir / source_path.name
        shutil.copy2(source_path, target_path)
        
        return target_path
    
    def _save_groove_catalog(self, results: Dict):
        """Save the groove catalog to JSON"""
        catalog_path = self.storage_path / "metadata" / "groove_catalog.json"
        
        with open(catalog_path, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        logger.info(f"Groove catalog saved to {catalog_path}")
    
    def _copy_featured_grooves_to_templates(self, results: Dict):
        """Copy the best grooves to main templates directory"""
        featured_count = 0
        max_featured = 20  # Limit featured grooves
        
        # Sort by quality factors (tempo stability, track count, etc.)
        all_grooves = results['extracted_files']
        
        # Select featured grooves (variety of styles and tempos)
        featured_grooves = []
        styles_covered = set()
        
        for groove in all_grooves:
            if len(featured_grooves) >= max_featured:
                break
                
            style = groove['style']
            tempo = groove['tempo']
            
            # Prefer variety in styles and good tempo ranges
            if (style not in styles_covered or len(styles_covered) < 5) and 80 <= tempo <= 160:
                featured_grooves.append(groove)
                styles_covered.add(style)
        
        # Copy featured grooves to templates
        for groove in featured_grooves:
            source_path = Path(groove['storage_path'])
            if source_path.exists():
                # Create descriptive filename
                style = groove['style']
                tempo = int(groove['tempo'])
                groove_type = groove['groove_type']
                
                new_name = f"groove_{style}_{tempo}bpm_{groove_type}_{source_path.stem}.mid"
                target_path = self.templates_path / new_name
                
                shutil.copy2(source_path, target_path)
                featured_count += 1
                logger.info(f"Added featured groove: {new_name}")
        
        logger.info(f"Added {featured_count} featured grooves to templates")
    
    def get_grooves_by_style(self, style: str) -> List[Dict]:
        """Get all grooves of a specific style"""
        catalog_path = self.storage_path / "metadata" / "groove_catalog.json"
        
        if not catalog_path.exists():
            return []
        
        try:
            with open(catalog_path, 'r') as f:
                catalog = json.load(f)
            
            return catalog.get('styles', {}).get(style, [])
        except Exception as e:
            logger.error(f"Error reading groove catalog: {e}")
            return []
    
    def get_grooves_by_tempo_range(self, min_tempo: int, max_tempo: int) -> List[Dict]:
        """Get grooves within a tempo range"""
        catalog_path = self.storage_path / "metadata" / "groove_catalog.json"
        
        if not catalog_path.exists():
            return []
        
        try:
            with open(catalog_path, 'r') as f:
                catalog = json.load(f)
            
            matching_grooves = []
            for groove in catalog.get('extracted_files', []):
                tempo = groove.get('tempo', 120)
                if min_tempo <= tempo <= max_tempo:
                    matching_grooves.append(groove)
            
            return matching_grooves
        except Exception as e:
            logger.error(f"Error reading groove catalog: {e}")
            return []

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Groove Dataset Loader")
    parser.add_argument("--extract", action="store_true", help="Extract and catalog groove dataset")
    parser.add_argument("--style", help="List grooves by style")
    parser.add_argument("--tempo-min", type=int, help="Minimum tempo filter")
    parser.add_argument("--tempo-max", type=int, help="Maximum tempo filter")
    
    args = parser.parse_args()
    
    loader = GrooveDatasetLoader()
    
    if args.extract:
        print("🥁 Extracting Groove v1.0.0 MIDI Dataset...")
        results = loader.extract_and_catalog_grooves()
        print(json.dumps(results, indent=2, default=str))
    
    elif args.style:
        grooves = loader.get_grooves_by_style(args.style)
        print(f"🎵 Grooves in style '{args.style}':")
        for groove in grooves:
            print(f"  🎼 {groove['filename']} - {groove['tempo']} BPM")
    
    elif args.tempo_min and args.tempo_max:
        grooves = loader.get_grooves_by_tempo_range(args.tempo_min, args.tempo_max)
        print(f"🎵 Grooves between {args.tempo_min}-{args.tempo_max} BPM:")
        for groove in grooves:
            print(f"  🎼 {groove['filename']} - {groove['tempo']} BPM ({groove['style']})")
    
    else:
        print("🥁 Groove Dataset Loader ready")
        print("Use --help for available commands")

if __name__ == "__main__":
    main()
