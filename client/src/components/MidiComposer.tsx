
import React, { useState } from 'react';
import { 
  Music, Plus, Save, Play, Pause, Download,
  Layers, Settings, Shuffle, Zap, BookOpen,
  Volume2, Sliders
} from 'lucide-react';

interface CompositionTemplate {
  id: string;
  name: string;
  genre: string;
  tempo: number;
  timeSignature: string;
  tracks: {
    name: string;
    instrument: string;
    pattern: string;
  }[];
}

export const MidiComposer: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [composition, setComposition] = useState({
    title: 'Untitled Composition',
    tempo: 120,
    timeSignature: '4/4',
    key: 'C major',
    tracks: []
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);

  const templates: CompositionTemplate[] = [
    {
      id: 'pop-ballad',
      name: 'Pop Ballad',
      genre: 'Pop',
      tempo: 80,
      timeSignature: '4/4',
      tracks: [
        { name: 'Piano', instrument: 'acoustic_grand_piano', pattern: 'chord-progression' },
        { name: 'Strings', instrument: 'string_ensemble_1', pattern: 'pad' },
        { name: 'Bass', instrument: 'acoustic_bass', pattern: 'root-notes' },
        { name: 'Drums', instrument: 'standard_drum_kit', pattern: 'ballad-beat' }
      ]
    },
    {
      id: 'rock-anthem',
      name: 'Rock Anthem',
      genre: 'Rock',
      tempo: 140,
      timeSignature: '4/4',
      tracks: [
        { name: 'Electric Guitar', instrument: 'distortion_guitar', pattern: 'power-chords' },
        { name: 'Bass Guitar', instrument: 'electric_bass_pick', pattern: 'rock-bass' },
        { name: 'Drums', instrument: 'standard_drum_kit', pattern: 'rock-beat' },
        { name: 'Lead Guitar', instrument: 'overdriven_guitar', pattern: 'melody' }
      ]
    },
    {
      id: 'jazz-fusion',
      name: 'Jazz Fusion',
      genre: 'Jazz',
      tempo: 130,
      timeSignature: '4/4',
      tracks: [
        { name: 'Electric Piano', instrument: 'electric_grand_piano', pattern: 'jazz-chords' },
        { name: 'Bass', instrument: 'electric_bass_finger', pattern: 'walking-bass' },
        { name: 'Drums', instrument: 'standard_drum_kit', pattern: 'fusion-beat' },
        { name: 'Saxophone', instrument: 'tenor_sax', pattern: 'jazz-melody' }
      ]
    }
  ];

  const chordProgressions = [
    { name: 'I-V-vi-IV', description: 'Pop progression', chords: ['C', 'G', 'Am', 'F'] },
    { name: 'ii-V-I', description: 'Jazz progression', chords: ['Dm', 'G', 'C'] },
    { name: 'vi-IV-I-V', description: 'Folk progression', chords: ['Am', 'F', 'C', 'G'] },
    { name: 'I-vi-ii-V', description: 'Circle of fifths', chords: ['C', 'Am', 'Dm', 'G'] }
  ];

  const generateComposition = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setComposition({
      title: `${template.name} Composition`,
      tempo: template.tempo,
      timeSignature: template.timeSignature,
      key: 'C major',
      tracks: template.tracks.map(track => ({
        ...track,
        id: Math.random().toString(36).substr(2, 9),
        volume: 80,
        muted: false
      }))
    });

    setSelectedTemplate(templateId);
    setShowTemplates(false);
  };

  const addTrack = () => {
    const newTrack = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Track ${composition.tracks.length + 1}`,
      instrument: 'acoustic_grand_piano',
      pattern: 'chord-progression',
      volume: 80,
      muted: false
    };

    setComposition(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack]
    }));
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">MIDI Composer</h2>
            <p className="text-gray-400">Create music with AI-powered templates and tools</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Templates
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">
              <Save className="w-4 h-4 inline mr-2" />
              Save
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Templates Panel */}
        {showTemplates && (
          <div className="w-80 bg-gray-800 border-r border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-4">Composition Templates</h3>
            
            <div className="space-y-3 mb-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                    selectedTemplate === template.id
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }`}
                  onClick={() => generateComposition(template.id)}
                >
                  <h4 className="font-medium mb-1">{template.name}</h4>
                  <p className="text-sm text-gray-400 mb-2">{template.genre}</p>
                  <div className="text-xs text-gray-500">
                    {template.tempo} BPM • {template.timeSignature} • {template.tracks.length} tracks
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h4 className="font-medium mb-3">Chord Progressions</h4>
              <div className="space-y-2">
                {chordProgressions.map((progression, index) => (
                  <div key={index} className="p-3 bg-gray-700 rounded-lg">
                    <div className="font-medium text-sm">{progression.name}</div>
                    <div className="text-xs text-gray-400 mb-2">{progression.description}</div>
                    <div className="flex gap-1">
                      {progression.chords.map((chord, chordIndex) => (
                        <span key={chordIndex} className="text-xs bg-gray-600 px-2 py-1 rounded">
                          {chord}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Composition Area */}
        <div className="flex-1">
          {/* Composition Settings */}
          <div className="bg-gray-800 p-4 border-b border-gray-700">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={composition.title}
                  onChange={(e) => setComposition(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tempo</label>
                <input
                  type="number"
                  value={composition.tempo}
                  onChange={(e) => setComposition(prev => ({ ...prev, tempo: parseInt(e.target.value) }))}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Time Signature</label>
                <select
                  value={composition.timeSignature}
                  onChange={(e) => setComposition(prev => ({ ...prev, timeSignature: e.target.value }))}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                >
                  <option>4/4</option>
                  <option>3/4</option>
                  <option>6/8</option>
                  <option>5/4</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Key</label>
                <select
                  value={composition.key}
                  onChange={(e) => setComposition(prev => ({ ...prev, key: e.target.value }))}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                >
                  <option>C major</option>
                  <option>G major</option>
                  <option>D major</option>
                  <option>A major</option>
                  <option>E major</option>
                  <option>B major</option>
                  <option>F♯ major</option>
                  <option>A minor</option>
                  <option>E minor</option>
                  <option>B minor</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={addTrack}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Track
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors">
                  <Zap className="w-4 h-4 inline mr-2" />
                  AI Generate
                </button>
              </div>
            </div>
          </div>

          {/* Track List */}
          <div className="p-4">
            {composition.tracks.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400 mb-4">No tracks yet. Choose a template or add tracks manually.</p>
                <button
                  onClick={addTrack}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add First Track
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {composition.tracks.map((track, index) => (
                  <div key={track.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: `hsl(${index * 137.5}, 70%, 50%)` }}
                        />
                        <input
                          type="text"
                          value={track.name}
                          className="bg-transparent text-white font-medium text-lg border-none outline-none"
                          onChange={(e) => {
                            const newTracks = [...composition.tracks];
                            newTracks[index].name = e.target.value;
                            setComposition(prev => ({ ...prev, tracks: newTracks }));
                          }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newTracks = [...composition.tracks];
                            newTracks[index].muted = !newTracks[index].muted;
                            setComposition(prev => ({ ...prev, tracks: newTracks }));
                          }}
                          className={`px-3 py-1 text-sm rounded transition-colors ${
                            track.muted
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          }`}
                        >
                          {track.muted ? 'Muted' : 'Mute'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Instrument</label>
                        <select
                          value={track.instrument}
                          onChange={(e) => {
                            const newTracks = [...composition.tracks];
                            newTracks[index].instrument = e.target.value;
                            setComposition(prev => ({ ...prev, tracks: newTracks }));
                          }}
                          className="w-full bg-gray-700 text-white p-2 rounded"
                        >
                          <option value="acoustic_grand_piano">Piano</option>
                          <option value="electric_guitar_clean">Guitar</option>
                          <option value="acoustic_bass">Bass</option>
                          <option value="standard_drum_kit">Drums</option>
                          <option value="string_ensemble_1">Strings</option>
                          <option value="tenor_sax">Saxophone</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Pattern</label>
                        <select
                          value={track.pattern}
                          className="w-full bg-gray-700 text-white p-2 rounded"
                        >
                          <option value="chord-progression">Chord Progression</option>
                          <option value="melody">Melody</option>
                          <option value="bass-line">Bass Line</option>
                          <option value="drum-pattern">Drum Pattern</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Volume</label>
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-gray-400" />
                          <input
                            type="range"
                            min="0"
                            max="127"
                            value={track.volume}
                            onChange={(e) => {
                              const newTracks = [...composition.tracks];
                              newTracks[index].volume = parseInt(e.target.value);
                              setComposition(prev => ({ ...prev, tracks: newTracks }));
                            }}
                            className="flex-1"
                          />
                          <span className="text-xs text-gray-400 w-8">{track.volume}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Settings, Play, Download, Shuffle, RotateCcw } from 'lucide-react';

interface CompositionSettings {
  title: string;
  genre: string;
  key: string;
  timeSignature: string;
  tempo: number;
  duration: number;
  complexity: string;
  instruments: string[];
  chordProgression: string;
  melodyStyle: string;
}

export const MidiComposer: React.FC = () => {
  const [settings, setSettings] = useState<CompositionSettings>({
    title: '',
    genre: 'pop',
    key: 'C major',
    timeSignature: '4/4',
    tempo: 120,
    duration: 60,
    complexity: 'medium',
    instruments: ['piano'],
    chordProgression: 'I-V-vi-IV',
    melodyStyle: 'stepwise'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMidi, setGeneratedMidi] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const genres = ['pop', 'rock', 'jazz', 'classical', 'electronic', 'folk', 'blues', 'country'];
  const keys = [
    'C major', 'G major', 'D major', 'A major', 'E major', 'B major', 'F# major',
    'C# major', 'F major', 'Bb major', 'Eb major', 'Ab major', 'Db major', 'Gb major',
    'A minor', 'E minor', 'B minor', 'F# minor', 'C# minor', 'G# minor', 'D# minor',
    'A# minor', 'D minor', 'G minor', 'C minor', 'F minor', 'Bb minor', 'Eb minor'
  ];
  const timeSignatures = ['4/4', '3/4', '2/4', '6/8', '9/8', '12/8', '5/4', '7/8'];
  const complexities = ['simple', 'medium', 'complex'];
  const instruments = [
    'piano', 'guitar', 'bass', 'drums', 'violin', 'flute', 'trumpet', 'saxophone',
    'clarinet', 'cello', 'harp', 'organ', 'synthesizer'
  ];
  const chordProgressions = [
    'I-V-vi-IV', 'I-vi-IV-V', 'vi-IV-I-V', 'I-IV-V-I', 'ii-V-I', 'I-vi-ii-V',
    'vi-V-IV-V', 'I-iii-vi-IV', 'I-V-vi-iii-IV-I-IV-V'
  ];
  const melodyStyles = ['stepwise', 'leaping', 'scalar', 'arpeggiated', 'chromatic', 'modal'];

  const handleGenerate = async () => {
    if (!settings.title.trim()) {
      alert('Please enter a title for your composition');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/midi/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedMidi(result.midiUrl);
      } else {
        throw new Error('Failed to generate composition');
      }
    } catch (error) {
      console.error('Error generating composition:', error);
      alert('Failed to generate composition. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = () => {
    if (!generatedMidi) return;
    setIsPlaying(!isPlaying);
    // TODO: Implement MIDI playback
  };

  const handleDownload = () => {
    if (!generatedMidi) return;
    
    const link = document.createElement('a');
    link.href = generatedMidi;
    link.download = `${settings.title.replace(/\s+/g, '_')}.mid`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRandomize = () => {
    setSettings({
      ...settings,
      genre: genres[Math.floor(Math.random() * genres.length)],
      key: keys[Math.floor(Math.random() * keys.length)],
      timeSignature: timeSignatures[Math.floor(Math.random() * timeSignatures.length)],
      tempo: 80 + Math.floor(Math.random() * 100),
      complexity: complexities[Math.floor(Math.random() * complexities.length)],
      chordProgression: chordProgressions[Math.floor(Math.random() * chordProgressions.length)],
      melodyStyle: melodyStyles[Math.floor(Math.random() * melodyStyles.length)]
    });
  };

  const handleReset = () => {
    setSettings({
      title: '',
      genre: 'pop',
      key: 'C major',
      timeSignature: '4/4',
      tempo: 120,
      duration: 60,
      complexity: 'medium',
      instruments: ['piano'],
      chordProgression: 'I-V-vi-IV',
      melodyStyle: 'stepwise'
    });
    setGeneratedMidi(null);
  };

  const handleInstrumentToggle = (instrument: string) => {
    setSettings(prev => ({
      ...prev,
      instruments: prev.instruments.includes(instrument)
        ? prev.instruments.filter(i => i !== instrument)
        : [...prev.instruments, instrument]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 border border-white/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-400" />
            <h3 className="text-xl font-semibold text-white">MIDI Composer</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomize}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded flex items-center gap-1"
            >
              <Shuffle className="w-4 h-4" />
              Randomize
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Basic Settings</h4>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Title *</label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter composition title"
                className="w-full bg-white/10 border border-white/20 rounded-md text-white px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Genre</label>
                <select
                  value={settings.genre}
                  onChange={(e) => setSettings(prev => ({ ...prev, genre: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-md text-white px-3 py-2"
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre.charAt(0).toUpperCase() + genre.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Key</label>
                <select
                  value={settings.key}
                  onChange={(e) => setSettings(prev => ({ ...prev, key: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-md text-white px-3 py-2"
                >
                  {keys.map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Time Signature</label>
                <select
                  value={settings.timeSignature}
                  onChange={(e) => setSettings(prev => ({ ...prev, timeSignature: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-md text-white px-3 py-2"
                >
                  {timeSignatures.map(sig => (
                    <option key={sig} value={sig}>{sig}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Complexity</label>
                <select
                  value={settings.complexity}
                  onChange={(e) => setSettings(prev => ({ ...prev, complexity: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-md text-white px-3 py-2"
                >
                  {complexities.map(complexity => (
                    <option key={complexity} value={complexity}>
                      {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tempo: {settings.tempo} BPM
              </label>
              <input
                type="range"
                min="60"
                max="180"
                value={settings.tempo}
                onChange={(e) => setSettings(prev => ({ ...prev, tempo: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Duration: {settings.duration} seconds
              </label>
              <input
                type="range"
                min="30"
                max="300"
                value={settings.duration}
                onChange={(e) => setSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Advanced Settings</h4>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Chord Progression</label>
              <select
                value={settings.chordProgression}
                onChange={(e) => setSettings(prev => ({ ...prev, chordProgression: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-md text-white px-3 py-2"
              >
                {chordProgressions.map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Melody Style</label>
              <select
                value={settings.melodyStyle}
                onChange={(e) => setSettings(prev => ({ ...prev, melodyStyle: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-md text-white px-3 py-2"
              >
                {melodyStyles.map(style => (
                  <option key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Instruments</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {instruments.map(instrument => (
                  <label
                    key={instrument}
                    className="flex items-center gap-2 text-white cursor-pointer hover:bg-white/5 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={settings.instruments.includes(instrument)}
                      onChange={() => handleInstrumentToggle(instrument)}
                      className="rounded"
                    />
                    <span className="text-sm">{instrument.charAt(0).toUpperCase() + instrument.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !settings.title.trim()}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Composing...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" />
                Generate Composition
              </>
            )}
          </button>
        </div>

        {generatedMidi && (
          <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">{settings.title}</h4>
                <p className="text-white/60 text-sm">
                  {settings.genre} • {settings.key} • {settings.tempo} BPM • {settings.timeSignature}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlay}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center gap-1"
                >
                  <Play className="w-4 h-4" />
                  {isPlaying ? 'Stop' : 'Play'}
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
