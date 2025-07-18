
import { useState, useCallback, useRef } from 'react';
import { useApi } from './useApi';

interface AudioGenerationParams {
  prompt: string;
  instanceWord?: string;
  objectClass?: string;
  audioLength?: number;
}

interface GenerationProgress {
  stage: 'idle' | 'processing' | 'generating' | 'finalizing' | 'complete' | 'error';
  progress: number;
  message: string;
}

interface AudioResult {
  audioUrl: string;
  audioFile: string;
  filename: string;
  duration?: number;
  metadata?: any;
}

export function useAudioGeneration() {
  const [progress, setProgress] = useState<GenerationProgress>({
    stage: 'idle',
    progress: 0,
    message: '',
  });
  
  const [result, setResult] = useState<AudioResult | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const api = useApi<AudioResult>();
  const abortControllerRef = useRef<AbortController | null>(null);

  const validateParams = useCallback((params: AudioGenerationParams): string | null => {
    if (!params.prompt || params.prompt.trim().length < 3) {
      return 'Prompt must be at least 3 characters long';
    }
    
    if (params.audioLength && (params.audioLength < 5 || params.audioLength > 30)) {
      return 'Duration must be between 5 and 30 seconds';
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
    setIsWorking(true);
    setUploadProgress(0);
    setProcessingStage('Initializing...');
    
    try {
      setProgress({
        stage: 'processing',
        progress: 10,
        message: 'Initializing audio generation...',
      });

      setProcessingStage('Generating audio...');
      setUploadProgress(25);

      const result = await api.execute('/api/audioldm2/generate', {
        method: 'POST',
        body: JSON.stringify(params),
        signal: abortControllerRef.current.signal,
      });

      setUploadProgress(75);
      setProcessingStage('Finalizing...');

      if (result && result.success !== false) {
        setProgress({
          stage: 'complete',
          progress: 100,
          message: 'Audio generation complete!',
        });
        setUploadProgress(100);
        setProcessingStage('Complete!');
        
        const audioResult = {
          audioUrl: result.audioUrl || `/storage/music/generated/${result.audioFile}`,
          audioFile: result.audioFile,
          filename: result.filename || result.audioFile,
          duration: result.duration,
          metadata: result.metadata
        };
        
        setResult(audioResult);
        return audioResult;
      } else {
        throw new Error(result?.error || 'Generation failed');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setProgress({
          stage: 'idle',
          progress: 0,
          message: 'Generation cancelled',
        });
        setProcessingStage('Cancelled');
      } else {
        setProgress({
          stage: 'error',
          progress: 0,
          message: error.message || 'Generation failed',
        });
        setProcessingStage('Error');
      }
      return null;
    } finally {
      setIsWorking(false);
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
      setIsWorking(false);
      setProcessingStage('');
      setUploadProgress(0);
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
    setUploadProgress(0);
    setProcessingStage('');
    api.reset();
  }, [cancel, api]);

  return {
    progress,
    result,
    generate,
    cancel,
    reset,
    isWorking,
    processingStage,
    uploadProgress,
    isGenerating: progress.stage !== 'idle' && progress.stage !== 'complete' && progress.stage !== 'error',
  };
}
