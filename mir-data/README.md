
# Music Information Retrieval (MIR) Data for Burnt Beats

This directory contains curated datasets and tools for music analysis, feature extraction, and algorithm testing within the Burnt Beats platform.

## Directory Structure

```
mir-data/
├── audio/                    # Core audio files
│   ├── samples/             # Test audio samples
│   ├── stems/               # Isolated instrument tracks
│   └── generated/           # AI-generated content from Burnt Beats
├── annotations/             # Ground truth data
│   ├── beats/               # Beat timing annotations
│   ├── chords/              # Chord progression labels
│   ├── melody/              # Melody line annotations
│   └── tempo/               # Tempo and rhythm data
├── features/                # Precomputed features
│   ├── mfcc/                # Mel-frequency cepstral coefficients
│   ├── chroma/              # Chroma feature vectors
│   └── spectral/            # Spectral analysis features
├── spectrograms/            # Visual representations
│   ├── mel/                 # Mel-scale spectrograms
│   ├── cqt/                 # Constant-Q Transform visualizations
│   └── piano-rolls/         # MIDI visualization as images
├── metadata/                # File information and labels
│   ├── genres.json          # Genre classifications
│   ├── instruments.json     # Instrument labels
│   └── recordings.json      # Technical recording info
└── scripts/                 # Analysis and processing tools
    ├── extractors/          # Feature extraction scripts
    ├── analyzers/           # Audio analysis tools
    └── loaders/             # Data loading utilities
```

## Integration with Burnt Beats

This MIR data structure is designed to work seamlessly with:
- Voice cloning and RVC pipeline
- AI music generation workflows
- Audio quality assessment
- Genre and style analysis
- Real-time audio processing
