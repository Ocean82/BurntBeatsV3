
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Stop, Volume2, Settings, Download, 
  Layers, Sliders, Copy, Scissors, Undo, Redo,
  ZoomIn, ZoomOut, Grid, Metronome
} from 'lucide-react';
import { useMidiPlayer } from '../hooks/useMidiPlayer';

interface Track {
  id: string;
  name: string;
  instrument: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  color: string;
  notes: MidiNote[];
}

interface MidiNote {
  id: string;
  pitch: number;
  velocity: number;
  start: number;
  duration: number;
  channel: number;
}

export const AdvancedMidiEditor: React.FC = () => {
  const { 
    state: playerState, 
    currentFile, 
    tracks: playerTracks,
    play, 
    pause, 
    stop,
    setVolume,
    toggleTrackMute,
    setTrackVolume 
  } = useMidiPlayer();

  const [tracks, setTracks] = useState<Track[]>([
    {
      id: '1',
      name: 'Piano',
      instrument: 'acoustic_grand_piano',
      volume: 80,
      pan: 0,
      muted: false,
      solo: false,
      color: '#4f46e5',
      notes: []
    },
    {
      id: '2', 
      name: 'Drums',
      instrument: 'standard_drum_kit',
      volume: 75,
      pan: 0,
      muted: false,
      solo: false,
      color: '#dc2626',
      notes: []
    }
  ]);

  const [selectedTrack, setSelectedTrack] = useState<string>('1');
  const [zoom, setZoom] = useState(1);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const pianoRollRef = useRef<HTMLDivElement>(null);

  const handleTrackVolumeChange = (trackId: string, volume: number) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, volume } : track
    ));
  };

  const handleTrackMute = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ));
  };

  const handleTrackSolo = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, solo: !track.solo } : track
    ));
  };

  const addNewTrack = () => {
    const newTrack: Track = {
      id: Date.now().toString(),
      name: `Track ${tracks.length + 1}`,
      instrument: 'acoustic_grand_piano',
      volume: 80,
      pan: 0,
      muted: false,
      solo: false,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      notes: []
    };
    setTracks(prev => [...prev, newTrack]);
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Transport Controls */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => playerState.isPlaying ? pause() : play()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
            >
              {playerState.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={stop}
              className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full transition-colors"
            >
              <Stop className="w-5 h-5" />
            </button>
            
            <div className="ml-4 flex items-center gap-2">
              <span className="text-sm text-gray-400">Tempo:</span>
              <span className="text-white font-mono">120 BPM</span>
            </div>

            <button
              onClick={() => setMetronomeEnabled(!metronomeEnabled)}
              className={`p-2 rounded transition-colors ${
                metronomeEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
              }`}
            >
              <Metronome className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-400 w-16 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(4, zoom + 0.25))}
              className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`p-2 rounded transition-colors ${
                snapToGrid ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded transition-colors">
            <Undo className="w-4 h-4" />
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded transition-colors">
            <Redo className="w-4 h-4" />
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded transition-colors">
            <Copy className="w-4 h-4" />
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded transition-colors">
            <Scissors className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex">
        {/* Track List */}
        <div className="w-80 bg-gray-800 border-r border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <button
              onClick={addNewTrack}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
            >
              Add Track
            </button>
          </div>

          <div className="space-y-2 p-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedTrack === track.id ? 'bg-gray-700' : 'bg-gray-750 hover:bg-gray-700'
                }`}
                onClick={() => setSelectedTrack(track.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: track.color }}
                    />
                    <span className="font-medium">{track.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrackMute(track.id);
                      }}
                      className={`px-2 py-1 text-xs rounded ${
                        track.muted ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      M
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrackSolo(track.id);
                      }}
                      className={`px-2 py-1 text-xs rounded ${
                        track.solo ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      S
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-400 mb-2">{track.instrument}</div>

                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="127"
                    value={track.volume}
                    onChange={(e) => handleTrackVolumeChange(track.id, parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-400 w-8">{track.volume}</span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <Sliders className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="-64"
                    max="63"
                    value={track.pan}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-400 w-8">{track.pan > 0 ? 'R' : track.pan < 0 ? 'L' : 'C'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Piano Roll Editor */}
        <div className="flex-1 bg-gray-900">
          <div className="h-96 relative overflow-auto" ref={pianoRollRef}>
            {/* Piano Keys */}
            <div className="absolute left-0 w-16 bg-gray-800 border-r border-gray-700 z-10">
              {Array.from({ length: 88 }, (_, i) => {
                const noteNumber = 21 + i; // A0 to C8
                const isBlackKey = [1, 3, 6, 8, 10].includes(noteNumber % 12);
                
                return (
                  <div
                    key={noteNumber}
                    className={`h-4 border-b border-gray-600 flex items-center px-2 text-xs ${
                      isBlackKey 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-200 text-gray-800'
                    }`}
                    style={{ height: `${16 * zoom}px` }}
                  >
                    {isBlackKey ? '' : ['C', 'D', 'E', 'F', 'G', 'A', 'B'][noteNumber % 12]}
                  </div>
                );
              })}
            </div>

            {/* Grid and Notes Area */}
            <div className="ml-16 min-w-full" style={{ transform: `scaleX(${zoom})` }}>
              <div className="relative">
                {/* Grid Lines */}
                <div className="absolute inset-0">
                  {Array.from({ length: 32 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute border-r border-gray-700"
                      style={{ left: `${i * 64}px`, height: `${88 * 16 * zoom}px` }}
                    />
                  ))}
                </div>

                {/* Note Lanes */}
                {Array.from({ length: 88 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-4 border-b border-gray-700 ${
                      [1, 3, 6, 8, 10].includes((21 + i) % 12) ? 'bg-gray-800' : 'bg-gray-750'
                    }`}
                    style={{ height: `${16 * zoom}px` }}
                  />
                ))}

                {/* MIDI Notes */}
                {tracks.find(t => t.id === selectedTrack)?.notes.map((note) => (
                  <div
                    key={note.id}
                    className="absolute bg-blue-500 border border-blue-400 rounded cursor-pointer hover:bg-blue-400"
                    style={{
                      left: `${note.start * 64}px`,
                      top: `${(127 - note.pitch - 21) * 16 * zoom}px`,
                      width: `${note.duration * 64}px`,
                      height: `${16 * zoom - 2}px`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspector Panel */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Velocity</label>
            <input
              type="range"
              min="1"
              max="127"
              defaultValue="64"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Pitch</label>
            <select className="w-full bg-gray-700 text-white p-1 rounded">
              <option>C4</option>
              <option>D4</option>
              <option>E4</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Length</label>
            <select className="w-full bg-gray-700 text-white p-1 rounded">
              <option>1/16</option>
              <option>1/8</option>
              <option>1/4</option>
              <option>1/2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Channel</label>
            <select className="w-full bg-gray-700 text-white p-1 rounded">
              <option>1</option>
              <option>2</option>
              <option>10 (Drums)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
