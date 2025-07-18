import React, { useState } from 'react';
import { Music, Brain, Download } from 'lucide-react';
import { useAudioGeneration } from '../hooks';

interface AudioLDM2GeneratorProps {
  onAudioGenerated?: (audioUrl: string) => void;
}

export function AudioLDM2Generator({ onAudioGenerated }: AudioLDM2GeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [instanceWord, setInstanceWord] = useState('');
  const [objectClass, setObjectClass] = useState('');
  const [audioLength, setAudioLength] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [trainingFiles, setTrainingFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMusic = async () => {
    if (!prompt.trim()) {
      setError('Please enter a music description');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/audioldm2/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          instanceWord: instanceWord || undefined,
          objectClass: objectClass || undefined,
          audioLength,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const audioUrl = `/storage/music/generated/${data.audioFile}`;
        setGeneratedAudio(audioUrl);
        onAudioGenerated?.(audioUrl);
      } else {
        setError('Failed to generate music: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError('Failed to generate music: Network error');
    } finally {
      setIsGenerating(false);
    }
  };

  const trainModel = async () => {
    if (!trainingFiles || !instanceWord || !objectClass) {
      setError('Please provide training files, instance word, and object class');
      return;
    }

    setIsTraining(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('instanceWord', instanceWord);
      formData.append('objectClass', objectClass);

      for (let i = 0; i < trainingFiles.length; i++) {
        formData.append('audio_files', trainingFiles[i]);
      }

      const response = await fetch('/api/audioldm2/train', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setError(null);
        alert('Training started successfully! This may take several hours.');
      } else {
        setError('Failed to start training: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Training error:', error);
      setError('Failed to start training: Network error');
    } finally {
      setIsTraining(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-100 relative">
          <button
            onClick={clearError}
            className="absolute top-2 right-2 text-red-300 hover:text-red-100"
          >
            ×
          </button>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Music Generation */}
      <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-5 h-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Personalized Music Generation</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Music Description *
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the music you want to generate..."
              rows={3}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Instance Word (optional)
              </label>
              <input
                type="text"
                value={instanceWord}
                onChange={(e) => setInstanceWord(e.target.value)}
                placeholder="sks"
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Object Class (optional)
              </label>
              <input
                type="text"
                value={objectClass}
                onChange={(e) => setObjectClass(e.target.value)}
                placeholder="guitar, piano, etc."
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Duration (seconds)
              </label>
              <input
                type="number"
                value={audioLength}
                onChange={(e) => setAudioLength(Number(e.target.value))}
                min="5"
                max="30"
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={generateMusic}
            disabled={isGenerating || !prompt.trim()}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Generating Music...
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                Generate Music
              </>
            )}
          </button>

          {generatedAudio && (
            <div className="border border-green-500/50 rounded-lg p-4 bg-green-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-green-100">Generated Audio</span>
                <a
                  href={generatedAudio}
                  download
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
              <audio controls className="w-full">
                <source src={generatedAudio} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      </div>

      {/* Model Training */}
      <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Train Personalized Model</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Instance Word *
              </label>
              <input
                type="text"
                value={instanceWord}
                onChange={(e) => setInstanceWord(e.target.value)}
                placeholder="sks, unique_sound, etc."
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Object Class *
              </label>
              <input
                type="text"
                value={objectClass}
                onChange={(e) => setObjectClass(e.target.value)}
                placeholder="guitar, voice, drum, etc."
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Training Audio Files *
            </label>
            <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-white/50 transition-colors">
              <Upload className="w-8 h-8 mx-auto mb-2 text-white/60" />
              <input
                type="file"
                multiple
                accept="audio/*"
                onChange={(e) => setTrainingFiles(e.target.files)}
                className="hidden"
                id="training-files"
              />
              <label
                htmlFor="training-files"
                className="cursor-pointer text-blue-400 hover:text-blue-300 transition-colors"
              >
                Click to select audio files
              </label>
              <p className="text-sm text-white/60 mt-1">
                Upload 5-20 audio files of your concept (WAV, MP3)
              </p>
            </div>
            {trainingFiles && (
              <p className="text-sm text-green-400 mt-2">
                {trainingFiles.length} files selected
              </p>
            )}
          </div>

          <button
            onClick={trainModel}
            disabled={isTraining || !trainingFiles || !instanceWord || !objectClass}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {isTraining ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Starting Training...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Train Model
              </>
            )}
          </button>

          <div className="text-sm text-white/80 p-4 bg-white/10 rounded-lg border border-white/20">
            <strong className="text-white">Training Notes:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Training takes 2-4 hours depending on data</li>
              <li>Use consistent, high-quality audio samples</li>
              <li>5-20 samples work best for training</li>
              <li>Each sample should be 5-30 seconds long</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}