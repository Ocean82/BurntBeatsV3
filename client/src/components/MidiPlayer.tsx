
import React, { useState } from 'react';
import { 
  Play, Pause, Stop, Volume2, Settings, Download, 
  SkipBack, SkipForward, Repeat, Shuffle, Music,
  Sliders, Eye, EyeOff
} from 'lucide-react';
import { useMidiPlayer } from '../hooks/useMidiPlayer';

export const MidiPlayer: React.FC = () => {
  const { 
    state, 
    currentFile, 
    tracks, 
    error,
    play, 
    pause, 
    stop, 
    seek,
    setVolume,
    toggleTrackMute,
    setTrackVolume 
  } = useMidiPlayer();

  const [showTracks, setShowTracks] = useState(true);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [shuffleMode, setShuffle] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(event.target.value);
    seek(time);
  };

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 text-red-100 rounded-md p-4">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!currentFile) {
    return (
      <div className="bg-gray-800/50 border border-gray-600 text-gray-300 rounded-md p-8 text-center">
        <Music className="w-12 h-12 mx-auto mb-4 text-gray-500" />
        <p>No MIDI file loaded. Select a file from the Explorer to start playing.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Current Track Info */}
      <div className="bg-gray-800 p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">
              {currentFile.split('/').pop()?.replace(/\.(mid|midi)$/i, '')}
            </h2>
            <p className="text-gray-400">
              {tracks.length} tracks • {formatTime(state.duration)}
            </p>
          </div>
          
          <button
            onClick={() => setShowTracks(!showTracks)}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors"
          >
            {showTracks ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Controls */}
      <div className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <input
            type="range"
            min="0"
            max={state.duration}
            value={state.currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(state.currentTime / state.duration) * 100}%, #374151 ${(state.currentTime / state.duration) * 100}%, #374151 100%)`
            }}
          />
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>{formatTime(state.currentTime)}</span>
            <span>{formatTime(state.duration)}</span>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setShuffle(!shuffleMode)}
            className={`p-3 rounded-full transition-colors ${
              shuffleMode ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={() => state.isPlaying ? pause() : play()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full transition-colors"
          >
            {state.isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>

          <button
            onClick={stop}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors"
          >
            <Stop className="w-5 h-5" />
          </button>

          <button className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
              const currentIndex = modes.indexOf(repeatMode);
              setRepeatMode(modes[(currentIndex + 1) % modes.length]);
            }}
            className={`p-3 rounded-full transition-colors ${
              repeatMode !== 'none' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            <Repeat className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-4 mb-6">
          <Volume2 className="w-5 h-5 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={state.volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-400 w-12">
            {Math.round(state.volume * 100)}%
          </span>
        </div>
      </div>

      {/* Track List */}
      {showTracks && (
        <div className="bg-gray-800 border-t border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold text-lg">Tracks</h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {tracks.map((track, index) => (
              <div
                key={`${track.name}-${index}`}
                className="p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{track.name}</span>
                      <span className="text-sm text-gray-400">
                        Ch. {track.channel} • {track.notes} notes
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Instrument: {track.instrument}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTrackMute(index)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        track.muted 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {track.muted ? 'Muted' : 'Mute'}
                    </button>

                    <div className="flex items-center gap-2 w-32">
                      <Volume2 className="w-4 h-4 text-gray-400" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={track.volume}
                        onChange={(e) => setTrackVolume(index, parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-gray-600 rounded appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Controls */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">
              {state.isLoading ? 'Loading...' : state.isLoaded ? 'Ready' : 'No file loaded'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { 
  Play, Pause, Stop, Volume2, Settings, Download, 
  SkipBack, SkipForward, Repeat, Shuffle, Music,
  Sliders, Eye, EyeOff
} from 'lucide-react';
import { useMidiPlayer } from '../hooks/useMidiPlayer';

export const MidiPlayer: React.FC = () => {
  const { 
    state, 
    currentFile, 
    tracks, 
    error,
    play, 
    pause, 
    stop, 
    seek,
    setVolume,
    toggleTrackMute,
    setTrackVolume 
  } = useMidiPlayer();

  const [showTracks, setShowTracks] = useState(true);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [shuffleMode, setShuffle] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(event.target.value);
    seek(time);
  };

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 text-red-100 rounded-md p-4">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!currentFile) {
    return (
      <div className="bg-gray-800/50 border border-gray-600 text-gray-300 rounded-md p-8 text-center">
        <Music className="w-12 h-12 mx-auto mb-4 text-gray-500" />
        <p>No MIDI file loaded. Select a file from the Explorer to start playing.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Current Track Info */}
      <div className="bg-gray-800 p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">
              {currentFile.split('/').pop()?.replace(/\.(mid|midi)$/i, '')}
            </h2>
            <p className="text-gray-400">
              {tracks.length} tracks • {formatTime(state.duration)}
            </p>
          </div>
          
          <button
            onClick={() => setShowTracks(!showTracks)}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors"
          >
            {showTracks ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Controls */}
      <div className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <input
            type="range"
            min="0"
            max={state.duration}
            value={state.currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(state.currentTime / state.duration) * 100}%, #374151 ${(state.currentTime / state.duration) * 100}%, #374151 100%)`
            }}
          />
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>{formatTime(state.currentTime)}</span>
            <span>{formatTime(state.duration)}</span>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setShuffle(!shuffleMode)}
            className={`p-3 rounded-full transition-colors ${
              shuffleMode ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={() => state.isPlaying ? pause() : play()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full transition-colors"
          >
            {state.isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>

          <button
            onClick={stop}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors"
          >
            <Stop className="w-5 h-5" />
          </button>

          <button className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
              const currentIndex = modes.indexOf(repeatMode);
              setRepeatMode(modes[(currentIndex + 1) % modes.length]);
            }}
            className={`p-3 rounded-full transition-colors ${
              repeatMode !== 'none' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            <Repeat className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-4 mb-6">
          <Volume2 className="w-5 h-5 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={state.volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-400 w-12">
            {Math.round(state.volume * 100)}%
          </span>
        </div>
      </div>

      {/* Track List */}
      {showTracks && (
        <div className="bg-gray-800 border-t border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold text-lg">Tracks</h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {tracks.map((track, index) => (
              <div
                key={`${track.name}-${index}`}
                className="p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{track.name}</span>
                      <span className="text-sm text-gray-400">
                        Ch. {track.channel} • {track.notes} notes
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Instrument: {track.instrument}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTrackMute(index)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        track.muted 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {track.muted ? 'Muted' : 'Mute'}
                    </button>

                    <div className="flex items-center gap-2 w-32">
                      <Volume2 className="w-4 h-4 text-gray-400" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={track.volume}
                        onChange={(e) => setTrackVolume(index, parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-gray-600 rounded appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Controls */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">
              {state.isLoading ? 'Loading...' : state.isLoaded ? 'Ready' : 'No file loaded'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Stop, SkipForward, SkipBack, Volume2, Upload } from 'lucide-react';

interface MidiPlayerProps {
  midiUrl?: string;
}

export const MidiPlayer: React.FC<MidiPlayerProps> = ({ midiUrl: initialMidiUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [midiUrl, setMidiUrl] = useState(initialMidiUrl || '');
  const [midiFile, setMidiFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (midiUrl) {
      loadMidiFile(midiUrl);
    }
  }, [midiUrl]);

  const loadMidiFile = async (url: string) => {
    setIsLoading(true);
    try {
      // In a real implementation, you would load and parse the MIDI file
      // For now, we'll simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDuration(120); // Mock duration
      setCurrentTime(0);
    } catch (error) {
      console.error('Error loading MIDI file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMidiFile(file);
    setIsLoading(true);

    try {
      // Create URL for the uploaded file
      const url = URL.createObjectURL(file);
      setMidiUrl(url);
      await loadMidiFile(url);
    } catch (error) {
      console.error('Error uploading MIDI file:', error);
    }
  };

  const handlePlay = () => {
    if (!midiUrl) return;

    if (isPlaying) {
      handlePause();
    } else {
      setIsPlaying(true);
      // TODO: Implement actual MIDI playback
      // Start playback simulation
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            clearInterval(interval);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    // TODO: Pause actual playback
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    // TODO: Stop actual playback
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(event.target.value);
    setCurrentTime(newTime);
    // TODO: Seek to new position in playback
  };

  const handleSkipForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    setCurrentTime(newTime);
    // TODO: Seek to new position
  };

  const handleSkipBack = () => {
    const newTime = Math.max(currentTime - 10, 0);
    setCurrentTime(newTime);
    // TODO: Seek to new position
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/10 border border-white/20 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Play className="w-5 h-5 text-green-400" />
          <h3 className="text-xl font-semibold text-white">MIDI Player</h3>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".mid,.midi"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Load MIDI File
          </button>
          {midiFile && (
            <p className="text-white/70 text-sm mt-2">
              Loaded: {midiFile.name}
            </p>
          )}
        </div>

        {/* Player Interface */}
        {midiUrl && (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/70">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                disabled={isLoading}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleSkipBack}
                disabled={isLoading}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white p-3 rounded-full transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={handlePlay}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-800 text-white p-4 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              <button
                onClick={handleStop}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-800 text-white p-3 rounded-full transition-colors"
              >
                <Stop className="w-5 h-5" />
              </button>

              <button
                onClick={handleSkipForward}
                disabled={isLoading}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white p-3 rounded-full transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-white/70" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-white/70 text-sm w-10">{volume}%</span>
            </div>

            {/* Status */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-white/70">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/70" />
                <span>Loading MIDI file...</span>
              </div>
            )}

            {!isLoading && isPlaying && (
              <div className="text-center text-green-400 text-sm">
                ♪ Playing
              </div>
            )}
          </div>
        )}

        {!midiUrl && (
          <div className="text-center py-8">
            <Play className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">Load a MIDI file to start playing</p>
          </div>
        )}
      </div>
    </div>
  );
};
