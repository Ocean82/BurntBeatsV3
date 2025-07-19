
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
