import { useState, useCallback } from 'react';
import { useApi } from './useApi';

interface AudioGenerationOptions {
  prompt: string;
  instanceWord?: string;
  objectClass?: string;
  audioLength?: number;
}

interface AudioGenerationResult {
  audioFile: string;
  success: boolean;
  message?: string;
  error?: string;
}

export function useAudioGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const api = useApi<AudioGenerationResult>();

  const generate = useCallback(async (options: AudioGenerationOptions) => {
    try {
      setIsGenerating(true);
      setError(null);
      setProgress('Initializing audio generation...');

      // Validate inputs
      if (!options.prompt?.trim()) {
        throw new Error('Please provide a music description');
      }

      setProgress('Generating audio with AI model...');

      const result = await api.execute('/api/audioldm2/generate', {
        method: 'POST',
        body: {
          prompt: options.prompt.trim(),
          instanceWord: options.instanceWord?.trim() || undefined,
          objectClass: options.objectClass?.trim() || undefined,
          audioLength: options.audioLength || 10
        },
        requireAuth: false
      });

      if (result?.success && result.audioFile) {
        setProgress('Audio generated successfully!');
        const audioUrl = `/storage/music/generated/${result.audioFile}`;
        setGeneratedAudio(audioUrl);

        // Clear progress after a short delay
        setTimeout(() => setProgress(null), 2000);

        return { 
          audioUrl, 
          success: true, 
          filename: result.audioFile,
          message: result.message 
        };
      } else {
        throw new Error(result?.error || result?.message || 'Audio generation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Audio generation failed';
      setError(errorMessage);
      setProgress(null);
      console.error('Audio generation error:', err);
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
    setGeneratedAudio(null);
    setError(null);
    setProgress(null);
    api.reset();
  }, [api]);

  return {
    generate,
    isGenerating,
    generatedAudio,
    error,
    progress,
    clearError,
    reset,
    apiState: api,
    // Computed states for UI
    canGenerate: !isGenerating && !api.loading,
    hasResult: !!generatedAudio,
    processingStage: progress
  };
}