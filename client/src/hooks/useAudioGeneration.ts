
import { useState, useCallback, useRef } from 'react';
import { useApi } from './useApi';

interface AudioGenerationParams {
  prompt: string;
  duration?: number;
  genre?: string;
  style?: string;
}

interface GenerationProgress {
  stage: 'idle' | 'processing' | 'generating' | 'finalizing' | 'complete' | 'error';
  progress: number;
  message: string;
}

interface AudioResult {
  url: string;
  filename: string;
  duration: number;
  metadata?: any;
}

export function useAudioGeneration() {
  const [progress, setProgress] = useState<GenerationProgress>({
    stage: 'idle',
    progress: 0,
    message: '',
  });
  
  const [result, setResult] = useState<AudioResult | null>(null);
  const api = useApi<AudioResult>();
  const abortControllerRef = useRef<AbortController | null>(null);

  const validateParams = useCallback((params: AudioGenerationParams): string | null => {
    if (!params.prompt || params.prompt.trim().length < 3) {
      return 'Prompt must be at least 3 characters long';
    }
    
    if (params.duration && (params.duration < 5 || params.duration > 120)) {
      return 'Duration must be between 5 and 120 seconds';
    }
    
    return null;
  }, []);

  const generate = useCallback(async (params: AudioGenerationParams) => {
    const validationError = validateParams(params);
    if (validationError) {
      setProgress({
        stage: 'error',
        progress: 0,
        message: validationError,
      });
      return null;
    }

    // Cancel any existing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setResult(null);
    
    try {
      setProgress({
        stage: 'processing',
        progress: 10,
        message: 'Initializing audio generation...',
      });

      const result = await api.execute('/api/audioldm2/generate', {
        method: 'POST',
        body: JSON.stringify(params),
        signal: abortControllerRef.current.signal,
      });

      if (result) {
        setProgress({
          stage: 'complete',
          progress: 100,
          message: 'Audio generation complete!',
        });
        setResult(result);
        return result;
      } else {
        throw new Error('Generation failed');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setProgress({
          stage: 'idle',
          progress: 0,
          message: 'Generation cancelled',
        });
      } else {
        setProgress({
          stage: 'error',
          progress: 0,
          message: error.message || 'Generation failed',
        });
      }
      return null;
    }
  }, [api, validateParams]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setProgress({
        stage: 'idle',
        progress: 0,
        message: 'Generation cancelled',
      });
    }
  }, []);

  const reset = useCallback(() => {
    cancel();
    setResult(null);
    setProgress({
      stage: 'idle',
      progress: 0,
      message: '',
    });
    api.reset();
  }, [cancel, api]);

  return {
    progress,
    result,
    generate,
    cancel,
    reset,
    isGenerating: progress.stage !== 'idle' && progress.stage !== 'complete' && progress.stage !== 'error',
  };
}
