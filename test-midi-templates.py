
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
    
    # Group templates by type
    chord_templates = []
    song_templates = []
    
    for midi_file in catalog_data['midi_files']:
        if 'error' not in midi_file:
            filename = midi_file['filename'].lower()
            if 'chord' in filename or 'progression' in filename:
                chord_templates.append(midi_file)
            else:
                song_templates.append(midi_file)
    
    print(f"\n🎼 Chord Progression Templates ({len(chord_templates)}):")
    for midi_file in chord_templates[:5]:  # Show first 5
        print(f"   🎹 {midi_file['filename']}")
        print(f"      Tempo: {midi_file.get('estimated_tempo', 'Unknown')} BPM, Key: {midi_file.get('estimated_key', 'Unknown')}")
    
    print(f"\n🎵 Full Song Templates ({len(song_templates)}):")
    for midi_file in song_templates[:5]:  # Show first 5
        print(f"   🎼 {midi_file['filename']}")
        print(f"      Duration: {midi_file.get('length', 'Unknown'):.2f}s" if isinstance(midi_file.get('length'), (int, float)) else f"      Duration: {midi_file.get('length', 'Unknown')}")
        print(f"      Tempo: {midi_file.get('estimated_tempo', 'Unknown')} BPM")
        print(f"      Tracks: {midi_file.get('num_tracks', 'Unknown')}")
    
    # Show suggestions for different genres
    print(f"\n🎯 Template Suggestions:")
    print(f"   🎸 Fast tempo (120-180 BPM):")
    fast_suggestions = catalog.get_template_suggestions(tempo_range=(120, 180))
    for suggestion in fast_suggestions[:3]:
        print(f"      - {suggestion['filename']} ({suggestion['tempo']} BPM)")
    
    print(f"   🎺 Slow tempo (60-119 BPM):")
    slow_suggestions = catalog.get_template_suggestions(tempo_range=(60, 119))
    for suggestion in slow_suggestions[:3]:
        print(f"      - {suggestion['filename']} ({suggestion['tempo']} BPM)")
    
    print(f"\n📈 Template Statistics:")
    print(f"   Total Templates: {catalog_data['total_files']}")
    print(f"   Chord Progressions: {len(chord_templates)}")
    print(f"   Full Songs: {len(song_templates)}")
    
    if catalog_data['total_files'] > 10:
        print(f"   🎉 Rich collection available for diverse music generation!")

if __name__ == "__main__":
    main()
