import { useState, useCallback } from 'react';
import { useApi } from './useApi';

interface VoiceSynthesisOptions {
  text: string;
  voiceId: string;
  style?: string;
  audioFile?: File;
}

interface VoiceSynthesisResult {
  audioUrl: string;
  voiceId: string;
  success: boolean;
  filename?: string;
  message?: string;
  error?: string;
}

export function useVoiceSynthesis() {
  const [isWorking, setIsWorking] = useState(false);
  const [result, setResult] = useState<VoiceSynthesisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<string | null>(null);
  const api = useApi<VoiceSynthesisResult>();

  const synthesize = useCallback(async (options: VoiceSynthesisOptions) => {
    try {
      setIsWorking(true);
      setError(null);
      setResult(null);
      setProcessingStage('Preparing voice synthesis...');

      // Validate inputs
      if (!options.text?.trim()) {
        throw new Error('Please provide text to synthesize');
      }

      if (options.text.trim().length > 1000) {
        throw new Error('Text must be 1000 characters or less');
      }

      if (!options.voiceId) {
        throw new Error('Please select a voice');
      }

      const formData = new FormData();
      formData.append('text', options.text.trim());
      formData.append('voiceId', options.voiceId);

      if (options.style) {
        formData.append('style', options.style);
      }

      if (options.audioFile) {
        setProcessingStage('Processing voice sample...');
        formData.append('audioFile', options.audioFile);
      }

      setProcessingStage('Generating voice...');

      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        }
      });

      if (!response.ok) {
        let errorMessage = `Voice synthesis failed: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Use default error message if JSON parsing fails
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success) {
        setProcessingStage('Voice synthesis complete!');
        setResult(data);

        // Clear processing stage after a short delay
        setTimeout(() => setProcessingStage(null), 2000);

        return {
          audioUrl: data.audioUrl,
          filename: data.filename || data.audioUrl.split('/').pop(),
          voiceId: data.voiceId,
          success: true,
          message: data.message
        };
      } else {
        throw new Error(data.error || data.message || 'Voice synthesis failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Voice synthesis failed';
      setError(errorMessage);
      setProcessingStage(null);
      console.error('Voice synthesis error:', err);
      throw err;
    } finally {
      setIsWorking(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsWorking(false);
    setResult(null);
    setError(null);
    setProcessingStage(null);
    api.reset();
  }, [api]);

  return {
    synthesize,
    isWorking,
    result,
    error,
    processingStage,
    clearError,
    reset,
    apiState: api,
    // Computed states for UI
    canSynthesize: !isWorking && !api.loading,
    hasResult: !!result,
    isProcessing: isWorking || api.loading
  };
}