
import { useState, useCallback } from 'react';
import { useApi } from './useApi';

interface MidiParams {
  title: string;
  theme: string;
  genre: string;
  tempo: number;
  duration: number;
  useAiLyrics?: boolean;
}

interface MidiResult {
  midiPath: string;
  filename: string;
  metadata: {
    title: string;
    genre: string;
    tempo: number;
    duration: number;
    tracks: number;
  };
}

const SUPPORTED_GENRES = ['pop', 'rock', 'jazz', 'electronic', 'classical', 'hiphop', 'blues'];

export function useMidiGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<MidiResult | null>(null);
  const api = useApi<MidiResult>();

  const validateParams = useCallback((params: MidiParams): string | null => {
    if (!params.title || params.title.trim().length < 2) {
      return 'Title must be at least 2 characters long';
    }

    if (!params.theme || params.theme.trim().length < 3) {
      return 'Theme must be at least 3 characters long';
    }

    if (!SUPPORTED_GENRES.includes(params.genre)) {
      return `Genre must be one of: ${SUPPORTED_GENRES.join(', ')}`;
    }

    if (params.tempo < 60 || params.tempo > 200) {
      return 'Tempo must be between 60 and 200 BPM';
    }

    if (params.duration < 30 || params.duration > 600) {
      return 'Duration must be between 30 seconds and 10 minutes';
    }

    return null;
  }, []);

  const generate = useCallback(async (params: MidiParams) => {
    const validationError = validateParams(params);
    if (validationError) {
      throw new Error(validationError);
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const result = await api.execute('/api/midi/generate', {
        method: 'POST',
        body: JSON.stringify(params),
      });

      if (result && result.success !== false) {
        setResult(result);
        return result;
      } else {
        throw new Error(result?.error || 'MIDI generation failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'MIDI generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [api, validateParams]);

  const reset = useCallback(() => {
    setResult(null);
    setIsGenerating(false);
    api.reset();
  }, [api]);

  return {
    generate,
    reset,
    isGenerating,
    result,
    error: api.error,
    supportedGenres: SUPPORTED_GENRES,
  };
}
