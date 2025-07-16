
import { useState, useCallback, useRef } from 'react';
import { useApi } from './useApi';

interface VoiceParams {
  text: string;
  voiceId?: string;
  style?: string;
  audioFile?: File;
}

interface VoiceResult {
  audioUrl: string;
  filename: string;
  voiceId?: string;
}

interface VoiceProcessingState {
  uploading: boolean;
  processing: boolean;
  uploadProgress: number;
  processingStage: string;
}

export function useVoiceSynthesis() {
  const [state, setState] = useState<VoiceProcessingState>({
    uploading: false,
    processing: false,
    uploadProgress: 0,
    processingStage: '',
  });

  const [result, setResult] = useState<VoiceResult | null>(null);
  const api = useApi<VoiceResult>();
  const abortControllerRef = useRef<AbortController | null>(null);

  const validateParams = useCallback((params: VoiceParams): string | null => {
    if (!params.text || params.text.trim().length < 1) {
      return 'Text is required for voice synthesis';
    }

    if (params.text.length > 1000) {
      return 'Text must be under 1000 characters';
    }

    if (params.audioFile) {
      if (!params.audioFile.type.startsWith('audio/')) {
        return 'Please upload a valid audio file';
      }

      if (params.audioFile.size > 10 * 1024 * 1024) { // 10MB limit
        return 'Audio file must be under 10MB';
      }
    }

    return null;
  }, []);

  const synthesize = useCallback(async (params: VoiceParams) => {
    const validationError = validateParams(params);
    if (validationError) {
      throw new Error(validationError);
    }

    // Cancel any existing synthesis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setResult(null);

    try {
      setState(prev => ({ 
        ...prev, 
        uploading: true, 
        uploadProgress: 0,
        processingStage: 'Preparing synthesis...'
      }));

      const formData = new FormData();
      formData.append('text', params.text);
      
      if (params.voiceId) {
        formData.append('voiceId', params.voiceId);
      }
      
      if (params.style) {
        formData.append('style', params.style);
      }
      
      if (params.audioFile) {
        formData.append('audio', params.audioFile);
        setState(prev => ({ ...prev, processingStage: 'Uploading voice sample...' }));
      }

      setState(prev => ({ 
        ...prev, 
        uploading: false, 
        processing: true,
        processingStage: 'Synthesizing voice...'
      }));

      const result = await api.execute('/api/voice/synthesize', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
        headers: {}, // Let browser set Content-Type for FormData
      });

      if (result) {
        setState(prev => ({ 
          ...prev, 
          processing: false,
          processingStage: 'Complete!'
        }));
        setResult(result);
        return result;
      } else {
        throw new Error('Voice synthesis failed');
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        uploading: false, 
        processing: false,
        processingStage: error.name === 'AbortError' ? 'Cancelled' : 'Error'
      }));
      
      if (error.name !== 'AbortError') {
        throw error;
      }
      return null;
    }
  }, [api, validateParams]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState({
        uploading: false,
        processing: false,
        uploadProgress: 0,
        processingStage: 'Cancelled',
      });
    }
  }, []);

  const reset = useCallback(() => {
    cancel();
    setResult(null);
    setState({
      uploading: false,
      processing: false,
      uploadProgress: 0,
      processingStage: '',
    });
    api.reset();
  }, [cancel, api]);

  return {
    ...state,
    result,
    synthesize,
    cancel,
    reset,
    isWorking: state.uploading || state.processing,
  };
}
