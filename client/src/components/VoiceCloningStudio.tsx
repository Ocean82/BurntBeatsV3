import React, { useState, useRef, useCallback } from 'react';
import { useVoiceSynthesis } from '../hooks/useVoiceSynthesis';
import { useAudioGeneration } from '../hooks/useAudioGeneration';

interface VoiceModel {
  id: string;
  name: string;
  hasEmbedding: boolean;
  hasF0: boolean;
  hasContent: boolean;
}

interface AudioGenerationRequest {
  prompt: string;
  instanceWord?: string;
  objectClass?: string;
  audioLength?: number;
}

export function VoiceCloningStudio() {
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [voiceModels, setVoiceModels] = useState<VoiceModel[]>([]);
  const [inputText, setInputText] = useState('');
  const [audioPrompt, setAudioPrompt] = useState('');
  const [recordingMode, setRecordingMode] = useState<'upload' | 'record'>('upload');
  const [isRecording, setIsRecording] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const voiceSynthesis = useVoiceSynthesis();
  const audioGeneration = useAudioGeneration();

  // Load available voice models
  const loadVoiceModels = useCallback(async () => {
    try {
      const response = await fetch('/api/voice/available');
      const data = await response.json();
      setVoiceModels(data.voices || []);
    } catch (error) {
      console.error('Failed to load voice models:', error);
    }
  }, []);

  // Initialize component
  React.useEffect(() => {
    loadVoiceModels();
  }, [loadVoiceModels]);

  // Handle voice upload
  const handleVoiceUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('voiceId', `voice_${Date.now()}`);

      const response = await fetch('/api/voice/extract-features', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        console.log('Voice features extracted:', result);
        loadVoiceModels(); // Refresh voice models
      } else {
        console.error('Feature extraction failed:', result.error);
      }
    } catch (error) {
      console.error('Voice upload failed:', error);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleVoiceUpload(file);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recorded_voice.wav', { type: 'audio/wav' });
        handleVoiceUpload(audioFile);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording failed:', error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle voice synthesis
  const handleVoiceSynthesis = async () => {
    if (!selectedVoice || !inputText) return;

    try {
      const result = await voiceSynthesis.synthesize({
        text: inputText,
        voiceId: selectedVoice,
      });

      if (result) {
        console.log('Voice synthesis complete:', result);
      }
    } catch (error) {
      console.error('Voice synthesis failed:', error);
    }
  };

  // Handle audio generation
  const handleAudioGeneration = async () => {
    if (!audioPrompt) return;

    try {
      const request: AudioGenerationRequest = {
        prompt: audioPrompt,
        instanceWord: selectedVoice,
        objectClass: 'voice',
        audioLength: 10.0,
      };

      const result = await audioGeneration.generate(request);

      if (result) {
        console.log('Audio generation complete:', result);
      }
    } catch (error) {
      console.error('Audio generation failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2">
            Voice Cloning Studio
          </h1>
          <p className="text-gray-400 text-lg">
            Create unique voices and generate personalized music
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Voice Upload Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-orange-400 mb-4">
              🎤 Voice Input
            </h2>

            {/* Recording Mode Toggle */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setRecordingMode('upload')}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    recordingMode === 'upload'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-orange-400'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setRecordingMode('record')}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    recordingMode === 'record'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-orange-400'
                  }`}
                >
                  Record Live
                </button>
              </div>
            </div>

            {/* File Upload */}
            {recordingMode === 'upload' && (
              <div className="mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-orange-400 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎵</div>
                    <div className="text-gray-300">Click to upload voice sample</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Supports MP3, WAV, FLAC (max 10MB)
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Live Recording */}
            {recordingMode === 'record' && (
              <div className="mb-6">
                <div className="text-center p-6 bg-gray-700/50 rounded-lg">
                  <div className="text-4xl mb-4">
                    {isRecording ? '🔴' : '🎙️'}
                  </div>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                  <div className="text-sm text-gray-400 mt-2">
                    {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                  </div>
                </div>
              </div>
            )}

            {/* Voice Model Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Voice Model
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-400 focus:outline-none"
              >
                <option value="">Choose a voice model...</option>
                {voiceModels.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} {voice.hasEmbedding ? '✓' : '⏳'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Voice Synthesis Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-orange-400 mb-4">
              🗣️ Voice Synthesis
            </h2>

            {/* Text Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Text to Synthesize
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to convert to speech..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-400 focus:outline-none resize-none"
                rows={4}
              />
            </div>

            {/* Synthesis Button */}
            <button
              onClick={handleVoiceSynthesis}
              disabled={!selectedVoice || !inputText || voiceSynthesis.isWorking}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-red-600 transition-all"
            >
              {voiceSynthesis.isWorking ? 'Synthesizing...' : 'Synthesize Voice'}
            </button>

            {/* Progress */}
            {voiceSynthesis.isWorking && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>{voiceSynthesis.processingStage}</span>
                  <span>{voiceSynthesis.uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${voiceSynthesis.uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Result */}
            {voiceSynthesis.result && (
              <div className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <h3 className="text-green-400 font-semibold mb-2">✅ Synthesis Complete</h3>
                <audio controls className="w-full">
                  <source src={voiceSynthesis.result.audioUrl} type="audio/wav" />
                </audio>
              </div>
            )}
          </div>
        </div>

        {/* AudioLDM2 Generation Section */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-orange-400 mb-4">
            🎵 AI Music Generation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Audio Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Audio Description
              </label>
              <textarea
                value={audioPrompt}
                onChange={(e) => setAudioPrompt(e.target.value)}
                placeholder="Describe the music you want to generate..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-400 focus:outline-none resize-none"
                rows={4}
              />
            </div>

            {/* Generation Controls */}
            <div className="space-y-4">
              <button
                onClick={handleAudioGeneration}
                disabled={!audioPrompt || audioGeneration.isWorking}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                {audioGeneration.isWorking ? 'Generating...' : 'Generate Music'}
              </button>

              {/* Progress */}
              {audioGeneration.isWorking && (
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>{audioGeneration.processingStage}</span>
                    <span>{audioGeneration.uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${audioGeneration.uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Result */}
              {audioGeneration.result && (
                <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                  <h3 className="text-green-400 font-semibold mb-2">✅ Generation Complete</h3>
                  <audio controls className="w-full">
                    <source src={audioGeneration.result.audioUrl} type="audio/wav" />
                  </audio>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}