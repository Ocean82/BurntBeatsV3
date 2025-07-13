
#!/usr/bin/env python3
"""
Groove Dataset Loader for Burnt Beats
Processes the groove-v1.0.0-midionly dataset
"""

import os
import sys
import json
import zipfile
import mido
from pathlib import Path
import argparse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GrooveDatasetLoader:
    def __init__(self, dataset_path="attached_assets/groove-v1.0.0-midionly_1752376915409.zip"):
        self.dataset_path = Path(dataset_path)
        self.storage_dir = Path("storage/midi")
        self.templates_dir = self.storage_dir / "templates"
        self.groove_dir = self.storage_dir / "groove-dataset"
        
        # Ensure directories exist
        self.groove_dir.mkdir(parents=True, exist_ok=True)
        self.templates_dir.mkdir(parents=True, exist_ok=True)
        
    def extract_dataset(self):
        """Extract the groove dataset ZIP file"""
        if not self.dataset_path.exists():
            logger.error(f"Dataset file not found: {self.dataset_path}")
            return False
            
        try:
            with zipfile.ZipFile(self.dataset_path, 'r') as zip_ref:
                # Extract to groove dataset directory
                zip_ref.extractall(self.groove_dir)
                logger.info(f"Extracted dataset to: {self.groove_dir}")
                return True
        except Exception as e:
            logger.error(f"Error extracting dataset: {e}")
            return False
    
    def scan_midi_files(self):
        """Scan extracted MIDI files and analyze them"""
        midi_files = []
        
        # Look for MIDI files in the extracted directory
        for midi_file in self.groove_dir.rglob("*.mid"):
            midi_files.append(midi_file)
        for midi_file in self.groove_dir.rglob("*.midi"):
            midi_files.append(midi_file)
            
        logger.info(f"Found {len(midi_files)} MIDI files in groove dataset")
        return midi_files
    
    def analyze_groove_midi(self, midi_path):
        """Analyze a groove MIDI file specifically"""
        try:
            mid = mido.MidiFile(midi_path)
            
            metadata = {
                "filename": midi_path.name,
                "path": str(midi_path),
                "source": "groove-v1.0.0",
                "type": mid.type,
                "ticks_per_beat": mid.ticks_per_beat,
                "length": mid.length,
                "num_tracks": len(mid.tracks),
                "drum_patterns": [],
                "tempo_info": {},
                "style_info": {}
            }
            
            # Analyze drum patterns and groove characteristics
            for i, track in enumerate(mid.tracks):
                track_info = {
                    "track_number": i,
                    "name": getattr(track, 'name', f'Track {i}'),
                    "num_messages": len(track),
                    "drum_hits": [],
                    "velocity_patterns": [],
                    "timing_patterns": []
                }
                
                current_time = 0
                velocities = []
                note_timings = []
                
                for msg in track:
                    current_time += msg.time
                    
                    if msg.type == 'note_on' and msg.velocity > 0:
                        # Analyze drum hits (typically channel 9 for drums)
                        if msg.channel == 9:  # Standard drum channel
                            track_info["drum_hits"].append({
                                "time": current_time,
                                "note": msg.note,
                                "velocity": msg.velocity,
                                "drum_type": self.get_drum_type(msg.note)
                            })
                        
                        velocities.append(msg.velocity)
                        note_timings.append(current_time)
                    
                    elif msg.type == 'set_tempo':
                        bpm = mido.tempo2bpm(msg.tempo)
                        metadata["tempo_info"] = {
                            "tempo": msg.tempo,
                            "bpm": round(bpm, 2),
                            "time": current_time
                        }
                
                # Calculate groove characteristics
                if velocities:
                    track_info["avg_velocity"] = sum(velocities) / len(velocities)
                    track_info["velocity_range"] = max(velocities) - min(velocities)
                
                if note_timings and len(note_timings) > 1:
                    intervals = [note_timings[i+1] - note_timings[i] for i in range(len(note_timings)-1)]
                    track_info["avg_interval"] = sum(intervals) / len(intervals) if intervals else 0
                
                metadata["drum_patterns"].append(track_info)
            
            # Classify groove style based on patterns
            metadata["style_info"] = self.classify_groove_style(metadata)
            
            return metadata
            
        except Exception as e:
            logger.error(f"Error analyzing {midi_path}: {e}")
            return {
                "filename": midi_path.name,
                "error": str(e),
                "status": "error"
            }
    
    def get_drum_type(self, note):
        """Map MIDI note numbers to drum types"""
        drum_map = {
            36: "kick", 35: "kick",  # Kick drums
            38: "snare", 40: "snare",  # Snare drums
            42: "hihat_closed", 44: "hihat_pedal",  # Hi-hats
            46: "hihat_open",
            49: "crash", 57: "crash",  # Crash cymbals
            51: "ride", 59: "ride",  # Ride cymbals
            47: "tom_low", 48: "tom_mid", 45: "tom_low",  # Toms
            50: "tom_high", 43: "tom_floor"
        }
        return drum_map.get(note, f"percussion_{note}")
    
    def classify_groove_style(self, metadata):
        """Classify the groove style based on patterns"""
        style_info = {
            "estimated_genre": "unknown",
            "complexity": "medium",
            "energy": "medium"
        }
        
        # Simple classification based on tempo and patterns
        tempo = metadata.get("tempo_info", {}).get("bpm", 120)
        
        if tempo < 80:
            style_info["estimated_genre"] = "ballad"
            style_info["energy"] = "low"
        elif tempo < 100:
            style_info["estimated_genre"] = "mid-tempo"
        elif tempo < 140:
            style_info["estimated_genre"] = "rock"
            style_info["energy"] = "high"
        else:
            style_info["estimated_genre"] = "electronic"
            style_info["energy"] = "high"
        
        # Analyze complexity based on number of drum hits
        total_hits = sum(len(track.get("drum_hits", [])) for track in metadata.get("drum_patterns", []))
        if total_hits > 100:
            style_info["complexity"] = "high"
        elif total_hits < 30:
            style_info["complexity"] = "low"
        
        return style_info
    
    def process_dataset(self):
        """Main processing function"""
        logger.info("🥁 Processing Groove MIDI Dataset")
        logger.info("=" * 40)
        
        # Extract dataset
        if not self.extract_dataset():
            return False
        
        # Scan for MIDI files
        midi_files = self.scan_midi_files()
        if not midi_files:
            logger.warning("No MIDI files found in dataset")
            return False
        
        # Process each MIDI file
        catalog = {
            "dataset_name": "groove-v1.0.0-midionly",
            "processed_at": str(Path().absolute()),
            "total_files": len(midi_files),
            "groove_patterns": []
        }
        
        logger.info(f"Processing {len(midi_files)} groove MIDI files...")
        
        processed_count = 0
        for midi_file in midi_files:
            logger.info(f"   🥁 Analyzing: {midi_file.name}")
            
            metadata = self.analyze_groove_midi(midi_file)
            if "error" not in metadata:
                catalog["groove_patterns"].append(metadata)
                processed_count += 1
                
                # Copy promising files to templates directory
                if self.is_good_template(metadata):
                    template_name = f"groove_{processed_count}_{midi_file.stem}.mid"
                    template_path = self.templates_dir / template_name
                    
                    try:
                        import shutil
                        shutil.copy2(midi_file, template_path)
                        logger.info(f"     ✅ Added to templates: {template_name}")
                    except Exception as e:
                        logger.warning(f"     ⚠️  Could not copy to templates: {e}")
        
        # Save catalog
        catalog_path = self.groove_dir / "groove_catalog.json"
        with open(catalog_path, 'w') as f:
            json.dump(catalog, f, indent=2)
        
        # Update main MIDI catalog
        self.update_main_catalog(catalog)
        
        logger.info(f"\n✅ Processed {processed_count}/{len(midi_files)} groove MIDI files")
        logger.info(f"📊 Catalog saved to: {catalog_path}")
        
        return True
    
    def is_good_template(self, metadata):
        """Determine if a groove is worth adding to templates"""
        # Check for reasonable tempo
        tempo = metadata.get("tempo_info", {}).get("bpm", 0)
        if not (60 <= tempo <= 200):
            return False
        
        # Check for drum content
        has_drums = any(
            len(track.get("drum_hits", [])) > 5 
            for track in metadata.get("drum_patterns", [])
        )
        
        # Check length (not too short or too long)
        length = metadata.get("length", 0)
        if not (5 <= length <= 300):  # 5 seconds to 5 minutes
            return False
        
        return has_drums
    
    def update_main_catalog(self, groove_catalog):
        """Update the main MIDI catalog with groove dataset info"""
        try:
            main_catalog_path = self.templates_dir / "midi_catalog.json"
            
            # Load existing catalog or create new one
            if main_catalog_path.exists():
                with open(main_catalog_path, 'r') as f:
                    main_catalog = json.load(f)
            else:
                main_catalog = {
                    "generated_at": str(Path().absolute()),
                    "templates_directory": str(self.templates_dir),
                    "total_files": 0,
                    "midi_files": []
                }
            
            # Add groove dataset info
            main_catalog["datasets"] = main_catalog.get("datasets", [])
            main_catalog["datasets"].append({
                "name": "groove-v1.0.0-midionly",
                "processed_files": len(groove_catalog["groove_patterns"]),
                "added_templates": sum(1 for pattern in groove_catalog["groove_patterns"] 
                                     if self.is_good_template(pattern))
            })
            
            # Save updated catalog
            with open(main_catalog_path, 'w') as f:
                json.dump(main_catalog, f, indent=2)
            
            logger.info(f"📚 Updated main catalog: {main_catalog_path}")
            
        except Exception as e:
            logger.warning(f"Could not update main catalog: {e}")

def main():
    parser = argparse.ArgumentParser(description='Groove Dataset Loader')
    parser.add_argument('--process', action='store_true', help='Process the groove dataset')
    parser.add_argument('--dataset-path', help='Path to groove dataset ZIP file')
    
    args = parser.parse_args()
    
    dataset_path = args.dataset_path or "attached_assets/groove-v1.0.0-midionly_1752376915409.zip"
    loader = GrooveDatasetLoader(dataset_path)
    
    if args.process:
        success = loader.process_dataset()
        if success:
            print("\n🎉 Groove dataset processing completed successfully!")
            sys.exit(0)
        else:
            print("\n❌ Groove dataset processing failed")
            sys.exit(1)
    else:
        print("🥁 Groove Dataset Loader ready")
        print("Use --process to process the dataset")

if __name__ == "__main__":
    main()
