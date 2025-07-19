
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
