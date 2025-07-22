import { useState, useCallback } from 'react';
import { useApi } from './useApi';

interface MidiGenerationOptions {
  title: string;
  theme: string;
  genre: string;
  tempo: number;
  duration?: number;
  useAiLyrics?: boolean;
}

interface MidiGenerationResult {
  midiPath: string;
  metadataPath?: string;
  success: boolean;
  filename?: string;
  metadata?: any;
  message?: string;
  error?: string;
}

export function useMidiGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<MidiGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const api = useApi<MidiGenerationResult>();

  const generate = useCallback(async (options: MidiGenerationOptions) => {
    try {
      setIsGenerating(true);
      setError(null);
      setResult(null);
      setProgress('Initializing MIDI generation...');

      // Validate inputs
      if (!options.title?.trim()) {
        throw new Error('Please provide a song title');
      }

      if (!options.theme?.trim()) {
        throw new Error('Please provide a theme or mood');
      }

      if (!options.genre) {
        throw new Error('Please select a genre');
      }

      if (!options.tempo || options.tempo < 60 || options.tempo > 200) {
        throw new Error('Tempo must be between 60 and 200 BPM');
      }

      setProgress('Generating MIDI composition...');

      const data = await api.execute('/api/midi/generate', {
        method: 'POST',
        body: {
          title: options.title.trim(),
          theme: options.theme.trim(),
          genre: options.genre,
          tempo: options.tempo,
          duration: options.duration || 60,
          useAiLyrics: !!options.useAiLyrics
        },
        requireAuth: true
      });

      if (data?.success && data.midiPath) {
        setProgress('MIDI generation complete!');

        const result = {
          midiPath: data.midiPath,
          metadataPath: data.metadataPath,
          success: true,
          filename: data.midiPath?.split('/').pop() || 'generated.mid',
          metadata: data.metadata,
          message: data.message
        };

        setResult(result);

        // Clear progress after a short delay
        setTimeout(() => setProgress(null), 2000);

        return result;
      } else {
        throw new Error(data?.error || data?.message || 'MIDI generation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'MIDI generation failed';
      setError(errorMessage);
      setProgress(null);
      console.error('MIDI generation error:', err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [api]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setResult(null);
    setError(null);
    setProgress(null);
    api.reset();
  }, [api]);

  return {
    generate,
    isGenerating,
    result,
    error,
    progress,
    clearError,
    reset,
    apiState: api,
    // Computed states for UI
    canGenerate: !isGenerating && !api.loading,
    hasResult: !!result,
    processingStage: progress
  };
}