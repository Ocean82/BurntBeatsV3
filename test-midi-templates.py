
#!/usr/bin/env python3
"""
Test script to demonstrate MIDI template usage
"""

import json
import os
from server.midi_catalog import MidiCatalog

def main():
    print("🎵 Burnt Beats MIDI Template Demo")
    print("=" * 40)
    
    catalog = MidiCatalog()
    
    # Load the catalog
    catalog_data = catalog.load_catalog()
    if not catalog_data:
        print("❌ No catalog found. Running scan...")
        catalog_data = catalog.scan_midi_templates()
        catalog.save_catalog(catalog_data)
    
    print(f"\n📊 Found {catalog_data['total_files']} MIDI templates:")
    
    for midi_file in catalog_data['midi_files']:
        if 'error' not in midi_file:
            print(f"\n🎼 {midi_file['filename']}")
            print(f"   ⏱️  Duration: {midi_file.get('length', 'Unknown'):.2f}s" if isinstance(midi_file.get('length'), (int, float)) else f"   Duration: {midi_file.get('length', 'Unknown')}")
            print(f"   🎵 Tempo: {midi_file.get('estimated_tempo', 'Unknown')} BPM")
            print(f"   🎹 Key: {midi_file.get('estimated_key', 'Unknown')}")
            print(f"   🎛️  Tracks: {midi_file.get('num_tracks', 'Unknown')}")
            
            # Show some track details
            if midi_file.get('tracks'):
                print(f"   📋 Track Details:")
                for track in midi_file['tracks'][:3]:  # Show first 3 tracks
                    instruments = len(track.get('instruments', []))
                    print(f"      - Track {track['track_number']}: {track['num_messages']} messages, {instruments} instruments")
    
    # Show suggestions for different genres
    print(f"\n🎯 Template Suggestions:")
    print(f"   🎸 Fast tempo (120-180 BPM):")
    fast_suggestions = catalog.get_template_suggestions(tempo_range=(120, 180))
    for suggestion in fast_suggestions[:2]:
        print(f"      - {suggestion['filename']} ({suggestion['tempo']} BPM)")
    
    print(f"   🎺 Slow tempo (60-119 BPM):")
    slow_suggestions = catalog.get_template_suggestions(tempo_range=(60, 119))
    for suggestion in slow_suggestions[:2]:
        print(f"      - {suggestion['filename']} ({suggestion['tempo']} BPM)")

if __name__ == "__main__":
    main()
