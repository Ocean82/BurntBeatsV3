
#!/usr/bin/env python3
"""
MIDI Catalog Service for Burnt Beats
Analyzes and catalogs MIDI files in the templates directory
"""

import os
import json
import mido
from pathlib import Path
import argparse

class MidiCatalog:
    def __init__(self, templates_dir="./storage/midi/templates"):
        self.templates_dir = Path(templates_dir)
        self.catalog_file = self.templates_dir / "midi_catalog.json"
        
    def analyze_midi_file(self, midi_path):
        """Analyze a MIDI file and extract metadata"""
        try:
            mid = mido.MidiFile(midi_path)
            
            metadata = {
                "filename": os.path.basename(midi_path),
                "path": str(midi_path),
                "type": mid.type,
                "ticks_per_beat": mid.ticks_per_beat,
                "length": mid.length,
                "num_tracks": len(mid.tracks),
                "tracks": []
            }
            
            # Analyze each track
            for i, track in enumerate(mid.tracks):
                track_info = {
                    "track_number": i,
                    "name": getattr(track, 'name', f'Track {i}'),
                    "num_messages": len(track),
                    "instruments": [],
                    "tempo_changes": [],
                    "key_signatures": [],
                    "time_signatures": []
                }
                
                current_time = 0
                for msg in track:
                    current_time += msg.time
                    
                    if msg.type == 'program_change':
                        track_info["instruments"].append({
                            "time": current_time,
                            "channel": msg.channel,
                            "program": msg.program
                        })
                    elif msg.type == 'set_tempo':
                        bpm = mido.tempo2bpm(msg.tempo)
                        track_info["tempo_changes"].append({
                            "time": current_time,
                            "tempo": msg.tempo,
                            "bpm": round(bpm, 2)
                        })
                    elif msg.type == 'key_signature':
                        track_info["key_signatures"].append({
                            "time": current_time,
                            "key": msg.key
                        })
                    elif msg.type == 'time_signature':
                        track_info["time_signatures"].append({
                            "time": current_time,
                            "numerator": msg.numerator,
                            "denominator": msg.denominator
                        })
                
                metadata["tracks"].append(track_info)
            
            # Extract overall tempo and key if available
            metadata["estimated_tempo"] = self.estimate_overall_tempo(metadata)
            metadata["estimated_key"] = self.estimate_overall_key(metadata)
            
            return metadata
            
        except Exception as e:
            return {
                "filename": os.path.basename(midi_path),
                "error": str(e),
                "status": "error"
            }
    
    def estimate_overall_tempo(self, metadata):
        """Estimate the overall tempo of the MIDI file"""
        tempos = []
        for track in metadata["tracks"]:
            for tempo_change in track["tempo_changes"]:
                tempos.append(tempo_change["bpm"])
        
        if tempos:
            return round(sum(tempos) / len(tempos), 2)
        return 120  # Default tempo
    
    def estimate_overall_key(self, metadata):
        """Estimate the overall key of the MIDI file"""
        keys = []
        for track in metadata["tracks"]:
            for key_sig in track["key_signatures"]:
                keys.append(key_sig["key"])
        
        if keys:
            return keys[0]  # Return first key signature found
        return "C"  # Default key
    
    def scan_midi_templates(self):
        """Scan the templates directory for MIDI files"""
        catalog = {
            "generated_at": str(Path().absolute()),
            "templates_directory": str(self.templates_dir),
            "total_files": 0,
            "midi_files": []
        }
        
        midi_files = list(self.templates_dir.glob("*.mid")) + list(self.templates_dir.glob("*.midi"))
        catalog["total_files"] = len(midi_files)
        
        print(f"🎵 Scanning {len(midi_files)} MIDI files...")
        
        for midi_file in midi_files:
            print(f"   📄 Analyzing: {midi_file.name}")
            metadata = self.analyze_midi_file(midi_file)
            catalog["midi_files"].append(metadata)
        
        return catalog
    
    def save_catalog(self, catalog):
        """Save the catalog to JSON file"""
        with open(self.catalog_file, 'w') as f:
            json.dump(catalog, f, indent=2)
        print(f"💾 Catalog saved to: {self.catalog_file}")
    
    def load_catalog(self):
        """Load existing catalog"""
        if self.catalog_file.exists():
            with open(self.catalog_file, 'r') as f:
                return json.load(f)
        return None
    
    def get_template_suggestions(self, genre=None, tempo_range=None):
        """Get template suggestions based on criteria"""
        catalog = self.load_catalog()
        if not catalog:
            return []
        
        suggestions = []
        for midi_file in catalog["midi_files"]:
            if "error" in midi_file:
                continue
                
            match = True
            
            # Filter by tempo if specified
            if tempo_range and "estimated_tempo" in midi_file:
                tempo = midi_file["estimated_tempo"]
                if not (tempo_range[0] <= tempo <= tempo_range[1]):
                    match = False
            
            if match:
                suggestions.append({
                    "filename": midi_file["filename"],
                    "path": midi_file["path"],
                    "tempo": midi_file.get("estimated_tempo", "Unknown"),
                    "key": midi_file.get("estimated_key", "Unknown"),
                    "length": midi_file.get("length", "Unknown"),
                    "tracks": midi_file.get("num_tracks", "Unknown")
                })
        
        return suggestions

def main():
    parser = argparse.ArgumentParser(description='MIDI Catalog Service')
    parser.add_argument('--scan', action='store_true', help='Scan and catalog MIDI templates')
    parser.add_argument('--list', action='store_true', help='List all cataloged MIDI files')
    parser.add_argument('--suggest', help='Get suggestions for genre')
    parser.add_argument('--tempo-min', type=int, help='Minimum tempo for suggestions')
    parser.add_argument('--tempo-max', type=int, help='Maximum tempo for suggestions')
    
    args = parser.parse_args()
    
    catalog_service = MidiCatalog()
    
    if args.scan:
        print("🎵 Burnt Beats MIDI Template Catalog")
        print("=" * 40)
        catalog = catalog_service.scan_midi_templates()
        catalog_service.save_catalog(catalog)
        print(f"\n✅ Cataloged {catalog['total_files']} MIDI files")
        
    elif args.list:
        catalog = catalog_service.load_catalog()
        if catalog:
            print("🎵 MIDI Template Catalog")
            print("=" * 40)
            for midi_file in catalog["midi_files"]:
                if "error" not in midi_file:
                    print(f"🎼 {midi_file['filename']}")
                    print(f"   Tempo: {midi_file.get('estimated_tempo', 'Unknown')} BPM")
                    print(f"   Key: {midi_file.get('estimated_key', 'Unknown')}")
                    print(f"   Duration: {midi_file.get('length', 'Unknown'):.2f}s" if isinstance(midi_file.get('length'), (int, float)) else f"   Duration: {midi_file.get('length', 'Unknown')}")
                    print(f"   Tracks: {midi_file.get('num_tracks', 'Unknown')}")
                    print()
        else:
            print("No catalog found. Run with --scan first.")
            
    elif args.suggest:
        tempo_range = None
        if args.tempo_min and args.tempo_max:
            tempo_range = (args.tempo_min, args.tempo_max)
        
        suggestions = catalog_service.get_template_suggestions(
            genre=args.suggest,
            tempo_range=tempo_range
        )
        
        print(f"🎵 MIDI Template Suggestions for '{args.suggest}'")
        print("=" * 50)
        for suggestion in suggestions:
            print(f"🎼 {suggestion['filename']}")
            print(f"   Tempo: {suggestion['tempo']} BPM")
            print(f"   Key: {suggestion['key']}")
            print(f"   Duration: {suggestion['length']:.2f}s" if isinstance(suggestion['length'], (int, float)) else f"   Duration: {suggestion['length']}")
            print()
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
