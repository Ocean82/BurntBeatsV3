
#!/usr/bin/env python3
"""
Enhanced MIDI generator for Burnt Beats using chords2midi library
"""

import argparse
import json
import sys
import os
from pathlib import Path

def install_chords2midi():
    """Install chords2midi if not available"""
    try:
        import chords2midi
        return True
    except ImportError:
        print("Installing chords2midi...")
        import subprocess
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "chords2midi"])
            import chords2midi
            return True
        except Exception as e:
            print(f"Failed to install chords2midi: {e}")
            return False

def generate_chord_progression(genre, key="C", num_bars=8):
    """Generate genre-appropriate chord progressions"""
    progressions = {
        "pop": ["C", "Am", "F", "G"],
        "rock": ["C", "F", "G", "C"],
        "jazz": ["Cmaj7", "Am7", "Dm7", "G7"],
        "blues": ["C7", "F7", "C7", "G7"],
        "electronic": ["Cm", "Ab", "Eb", "Bb"],
        "classical": ["C", "F", "G", "Am"],
        "country": ["C", "F", "G", "C"],
        "hip-hop": ["Cm", "Fm", "Gm", "Cm"]
    }
    
    base_progression = progressions.get(genre.lower(), progressions["pop"])
    
    # Extend progression to fill bars
    full_progression = []
    for i in range(num_bars):
        full_progression.append(base_progression[i % len(base_progression)])
    
    return full_progression

def create_enhanced_midi(title, theme, genre, tempo, output_path, duration=None, ai_lyrics=False, voice_id=None):
    """Create MIDI file using chords2midi with enhanced features"""
    
    if not install_chords2midi():
        # Fallback to basic MIDI generation
        return create_basic_midi(title, theme, genre, tempo, output_path, duration)
    
    try:
        from chords2midi import ChordProgression
        
        # Generate chord progression
        num_bars = 8 if not duration else max(4, duration // 4)
        chords = generate_chord_progression(genre, num_bars=num_bars)
        
        # Create chord progression object
        progression = ChordProgression(chords)
        
        # Set tempo and other parameters
        progression.tempo = tempo
        
        # Generate MIDI
        progression.to_midi(output_path)
        
        # Create metadata
        metadata = {
            "title": title,
            "theme": theme,
            "genre": genre,
            "tempo": tempo,
            "duration": duration or 32,
            "chords": chords,
            "num_bars": num_bars,
            "generated_with": "chords2midi",
            "ai_lyrics": ai_lyrics,
            "voice_id": voice_id
        }
        
        metadata_path = output_path.replace('.mid', '_metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Enhanced MIDI generated: {output_path}")
        return True
        
    except Exception as e:
        print(f"Error with chords2midi: {e}")
        return create_basic_midi(title, theme, genre, tempo, output_path, duration)

def create_basic_midi(title, theme, genre, tempo, output_path, duration=None):
    """Fallback basic MIDI generation"""
    try:
        import mido
        
        # Create basic MIDI file
        mid = mido.MidiFile()
        track = mido.MidiTrack()
        mid.tracks.append(track)
        
        # Set tempo
        track.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(tempo)))
        
        # Add basic chord progression
        chords = generate_chord_progression(genre)
        time_per_chord = 480  # ticks
        
        for i, chord_name in enumerate(chords):
            # Simple chord mapping
            chord_notes = get_chord_notes(chord_name)
            
            # Note on
            for note in chord_notes:
                track.append(mido.Message('note_on', channel=0, note=note, velocity=64, time=0))
            
            # Note off after duration
            for j, note in enumerate(chord_notes):
                time = time_per_chord if j == 0 else 0
                track.append(mido.Message('note_off', channel=0, note=note, velocity=64, time=time))
        
        # Save MIDI file
        mid.save(output_path)
        
        # Create basic metadata
        metadata = {
            "title": title,
            "theme": theme,
            "genre": genre,
            "tempo": tempo,
            "duration": duration or 16,
            "generated_with": "basic_mido",
            "chords": chords
        }
        
        metadata_path = output_path.replace('.mid', '_metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Basic MIDI generated: {output_path}")
        return True
        
    except Exception as e:
        print(f"Error generating basic MIDI: {e}")
        return False

def get_chord_notes(chord_name):
    """Map chord names to MIDI notes"""
    base_notes = {
        'C': 60, 'C#': 61, 'Db': 61, 'D': 62, 'D#': 63, 'Eb': 63,
        'E': 64, 'F': 65, 'F#': 66, 'Gb': 66, 'G': 67, 'G#': 68,
        'Ab': 68, 'A': 69, 'A#': 70, 'Bb': 70, 'B': 71
    }
    
    # Extract root note
    root = chord_name[0]
    if len(chord_name) > 1 and chord_name[1] in ['#', 'b']:
        root = chord_name[:2]
    
    base_note = base_notes.get(root, 60)
    
    # Major triad by default
    if 'm' in chord_name.lower():
        return [base_note, base_note + 3, base_note + 7]  # Minor
    elif '7' in chord_name:
        return [base_note, base_note + 4, base_note + 7, base_note + 10]  # Dominant 7
    else:
        return [base_note, base_note + 4, base_note + 7]  # Major

def main():
    parser = argparse.ArgumentParser(description='Enhanced MIDI Generator for Burnt Beats')
    parser.add_argument('--title', required=True, help='Song title')
    parser.add_argument('--theme', required=True, help='Song theme')
    parser.add_argument('--genre', required=True, help='Music genre')
    parser.add_argument('--tempo', type=int, required=True, help='Tempo (BPM)')
    parser.add_argument('--output', required=True, help='Output MIDI file path')
    parser.add_argument('--duration', type=int, help='Duration in seconds')
    parser.add_argument('--ai-lyrics', action='store_true', help='Use AI lyrics')
    parser.add_argument('--voice-id', help='Voice ID for cloning')
    
    args = parser.parse_args()
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    
    success = create_enhanced_midi(
        args.title,
        args.theme,
        args.genre,
        args.tempo,
        args.output,
        args.duration,
        args.ai_lyrics,
        args.voice_id
    )
    
    if success:
        print("✅ MIDI generation completed successfully")
        sys.exit(0)
    else:
        print("❌ MIDI generation failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
