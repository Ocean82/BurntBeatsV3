
import { useState, useEffect, useRef, useCallback } from 'react';

export interface MidiPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoaded: boolean;
  isLoading: boolean;
}

export interface MidiTrackInfo {
  name: string;
  instrument: number;
  channel: number;
  notes: number;
  muted: boolean;
  volume: number;
}

export function useMidiPlayer() {
  const [state, setState] = useState<MidiPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isLoaded: false,
    isLoading: false
  });

  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [tracks, setTracks] = useState<MidiTrackInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const playerRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();

  // Initialize Web Audio API
  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (err) {
        setError('Web Audio API not supported');
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update playback position
  const updatePosition = useCallback(() => {
    if (playerRef.current && state.isPlaying) {
      setState(prev => ({
        ...prev,
        currentTime: playerRef.current.currentTime
      }));
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    }
  }, [state.isPlaying]);

  const loadMidiFile = async (filePath: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    setError(null);

    try {
      // Load MIDI file and parse it
      const response = await fetch(filePath);
      const arrayBuffer = await response.arrayBuffer();
      
      // Here you would integrate with a MIDI parsing library like midi-parser-js
      // For now, simulating the load process
      
      setCurrentFile(filePath);
      setState(prev => ({
        ...prev,
        isLoaded: true,
        isLoading: false,
        duration: 120 // This would come from MIDI parsing
      }));

      // Extract track information (would come from MIDI parser)
      setTracks([
        { name: 'Piano', instrument: 0, channel: 0, notes: 150, muted: false, volume: 1 },
        { name: 'Drums', instrument: 128, channel: 9, notes: 200, muted: false, volume: 1 },
        { name: 'Bass', instrument: 32, channel: 1, notes: 80, muted: false, volume: 1 }
      ]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load MIDI file');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const play = () => {
    if (!state.isLoaded) return;
    
    setState(prev => ({ ...prev, isPlaying: true }));
    updatePosition();
  };

  const pause = () => {
    setState(prev => ({ ...prev, isPlaying: false }));
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const stop = () => {
    pause();
    setState(prev => ({ ...prev, currentTime: 0 }));
  };

  const seek = (time: number) => {
    setState(prev => ({ ...prev, currentTime: Math.max(0, Math.min(time, prev.duration)) }));
  };

  const setVolume = (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setState(prev => ({ ...prev, volume: clampedVolume }));
  };

  const toggleTrackMute = (trackIndex: number) => {
    setTracks(prev => prev.map((track, index) => 
      index === trackIndex ? { ...track, muted: !track.muted } : track
    ));
  };

  const setTrackVolume = (trackIndex: number, volume: number) => {
    setTracks(prev => prev.map((track, index) => 
      index === trackIndex ? { ...track, volume: Math.max(0, Math.min(1, volume)) } : track
    ));
  };

  return {
    state,
    currentFile,
    tracks,
    error,
    loadMidiFile,
    play,
    pause,
    stop,
    seek,
    setVolume,
    toggleTrackMute,
    setTrackVolume
  };
}
import { useState, useCallback, useRef } from 'react';

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
}

export const useMidiPlayer = () => {
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 100,
    isLoading: false
  });

  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadMidiFile = useCallback(async (filePath: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      setError(null);

      // Stop current playback if any
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // In a real implementation, you would:
      // 1. Load the MIDI file
      // 2. Convert to audio or use Web MIDI API
      // 3. Set up playback

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentFile(filePath);
      setState(prev => ({
        ...prev,
        duration: 120, // Mock duration
        currentTime: 0,
        isPlaying: false,
        isLoading: false
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load MIDI file';
      setError(errorMessage);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const play = useCallback(() => {
    if (!currentFile) return;

    setState(prev => ({ ...prev, isPlaying: true }));
    setError(null);

    // Start time tracking
    intervalRef.current = setInterval(() => {
      setState(prev => {
        const newTime = prev.currentTime + 1;
        if (newTime >= prev.duration) {
          // End of track
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return {
            ...prev,
            isPlaying: false,
            currentTime: 0
          };
        }
        return {
          ...prev,
          currentTime: newTime
        };
      });
    }, 1000);
  }, [currentFile]);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0
    }));

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
  }, []);

  const seek = useCallback((time: number) => {
    setState(prev => ({
      ...prev,
      currentTime: Math.max(0, Math.min(time, prev.duration))
    }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    setState(prev => ({ ...prev, volume: clampedVolume }));
    
    // In a real implementation, you would update the audio gain
  }, []);

  return {
    state,
    currentFile,
    error,
    loadMidiFile,
    play,
    pause,
    stop,
    seek,
    setVolume
  };
};
