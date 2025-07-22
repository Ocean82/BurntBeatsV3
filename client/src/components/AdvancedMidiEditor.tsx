
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
import React, { useState, useRef, useEffect } from 'react';
import { Edit, Play, Save, Undo, Redo, Volume2 } from 'lucide-react';

interface MidiNote {
  pitch: number;
  start: number;
  duration: number;
  velocity: number;
}

interface MidiTrack {
  id: string;
  name: string;
  notes: MidiNote[];
  channel: number;
  volume: number;
  muted: boolean;
}

export const AdvancedMidiEditor: React.FC = () => {
  const [tracks, setTracks] = useState<MidiTrack[]>([
    {
      id: '1',
      name: 'Piano',
      notes: [],
      channel: 0,
      volume: 100,
      muted: false
    }
  ]);
  const [selectedTrack, setSelectedTrack] = useState<string>('1');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawPianoRoll();
  }, [tracks, zoom, currentTime]);

  const drawPianoRoll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;

    // Vertical lines (time grid)
    for (let x = 0; x < canvas.width; x += 20 * zoom) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines (pitch grid)
    for (let y = 0; y < canvas.height; y += 10) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw notes
    const track = tracks.find(t => t.id === selectedTrack);
    if (track) {
      ctx.fillStyle = '#4CAF50';
      track.notes.forEach(note => {
        const x = note.start * 20 * zoom;
        const y = (127 - note.pitch) * 10;
        const width = note.duration * 20 * zoom;
        const height = 8;

        ctx.fillRect(x, y, width, height);
      });
    }

    // Draw playhead
    ctx.strokeStyle = '#FF5722';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentTime * 20 * zoom, 0);
    ctx.lineTo(currentTime * 20 * zoom, canvas.height);
    ctx.stroke();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const time = x / (20 * zoom);
    const pitch = 127 - Math.floor(y / 10);

    addNote(pitch, time, 1, 100);
  };

  const addNote = (pitch: number, start: number, duration: number, velocity: number) => {
    const newNote: MidiNote = { pitch, start, duration, velocity };
    
    setTracks(prev => prev.map(track => 
      track.id === selectedTrack 
        ? { ...track, notes: [...track.notes, newNote] }
        : track
    ));
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual MIDI playback
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/midi/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracks })
      });

      if (response.ok) {
        console.log('MIDI saved successfully');
      }
    } catch (error) {
      console.error('Error saving MIDI:', error);
    }
  };

  const addTrack = () => {
    const newTrack: MidiTrack = {
      id: Date.now().toString(),
      name: `Track ${tracks.length + 1}`,
      notes: [],
      channel: tracks.length,
      volume: 100,
      muted: false
    };
    setTracks([...tracks, newTrack]);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/10 border border-white/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">MIDI Editor</h3>
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
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded flex items-center gap-1">
              <Undo className="w-4 h-4" />
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded flex items-center gap-1">
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Track Controls */}
        <div className="mb-4">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-white font-medium">Tracks:</span>
            <button
              onClick={addTrack}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
            >
              Add Track
            </button>
          </div>
          
          <div className="space-y-2">
            {tracks.map(track => (
              <div
                key={track.id}
                className={`flex items-center gap-4 p-2 rounded ${
                  selectedTrack === track.id ? 'bg-white/20' : 'bg-white/5'
                } cursor-pointer`}
                onClick={() => setSelectedTrack(track.id)}
              >
                <span className="text-white font-medium w-20">{track.name}</span>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-white/60" />
                  <input
                    type="range"
                    min="0"
                    max="127"
                    value={track.volume}
                    onChange={(e) => {
                      const volume = parseInt(e.target.value);
                      setTracks(prev => prev.map(t => 
                        t.id === track.id ? { ...t, volume } : t
                      ));
                    }}
                    className="w-24"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTracks(prev => prev.map(t => 
                      t.id === track.id ? { ...t, muted: !t.muted } : t
                    ));
                  }}
                  className={`px-2 py-1 rounded text-xs ${
                    track.muted ? 'bg-red-600' : 'bg-gray-600'
                  }`}
                >
                  {track.muted ? 'Muted' : 'Active'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Piano Roll */}
        <div className="border border-white/20 rounded">
          <div className="flex items-center justify-between p-2 bg-white/5">
            <span className="text-white text-sm">Piano Roll - {tracks.find(t => t.id === selectedTrack)?.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">Zoom:</span>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            onClick={handleCanvasClick}
            className="w-full cursor-crosshair"
            style={{ backgroundColor: '#1a1a1a' }}
          />
        </div>

        <div className="text-white/60 text-sm mt-2">
          Click on the piano roll to add notes. Selected track: {tracks.find(t => t.id === selectedTrack)?.name}
        </div>
      </div>
    </div>
  );
};
