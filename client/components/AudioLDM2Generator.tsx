
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Upload, Music, Brain, Download } from 'lucide-react';

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

  const generateMusic = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
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
        alert('Failed to generate music: ' + data.error);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate music');
    } finally {
      setIsGenerating(false);
    }
  };

  const trainModel = async () => {
    if (!trainingFiles || !instanceWord || !objectClass) {
      alert('Please provide training files, instance word, and object class');
      return;
    }

    setIsTraining(true);
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
        alert('Training started successfully! This may take several hours.');
      } else {
        alert('Failed to start training: ' + data.error);
      }
    } catch (error) {
      console.error('Training error:', error);
      alert('Failed to start training');
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Music Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Personalized Music Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Music Description
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the music you want to generate..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Instance Word (optional)
              </label>
              <Input
                value={instanceWord}
                onChange={(e) => setInstanceWord(e.target.value)}
                placeholder="sks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Object Class (optional)
              </label>
              <Input
                value={objectClass}
                onChange={(e) => setObjectClass(e.target.value)}
                placeholder="guitar, piano, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Duration (seconds)
              </label>
              <Input
                type="number"
                value={audioLength}
                onChange={(e) => setAudioLength(Number(e.target.value))}
                min="5"
                max="30"
              />
            </div>
          </div>

          <Button
            onClick={generateMusic}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating Music...
              </>
            ) : (
              <>
                <Music className="w-4 h-4 mr-2" />
                Generate Music
              </>
            )}
          </Button>

          {generatedAudio && (
            <div className="border rounded-lg p-4 bg-green-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Generated Audio</span>
                <a
                  href={generatedAudio}
                  download
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
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
        </CardContent>
      </Card>

      {/* Model Training */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Train Personalized Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Instance Word *
              </label>
              <Input
                value={instanceWord}
                onChange={(e) => setInstanceWord(e.target.value)}
                placeholder="sks, unique_sound, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Object Class *
              </label>
              <Input
                value={objectClass}
                onChange={(e) => setObjectClass(e.target.value)}
                placeholder="guitar, voice, drum, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Training Audio Files
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
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
                className="cursor-pointer text-blue-600 hover:text-blue-800"
              >
                Click to select audio files
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Upload 5-20 audio files of your concept (WAV, MP3)
              </p>
            </div>
            {trainingFiles && (
              <p className="text-sm text-green-600 mt-2">
                {trainingFiles.length} files selected
              </p>
            )}
          </div>

          <Button
            onClick={trainModel}
            disabled={isTraining || !trainingFiles || !instanceWord || !objectClass}
            className="w-full"
          >
            {isTraining ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Starting Training...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Train Model
              </>
            )}
          </Button>

          <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
            <strong>Training Notes:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Training takes 2-4 hours depending on data</li>
              <li>Use consistent, high-quality audio samples</li>
              <li>5-20 samples work best for training</li>
              <li>Each sample should be 5-30 seconds long</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
