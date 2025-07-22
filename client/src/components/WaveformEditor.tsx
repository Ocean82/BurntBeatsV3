
import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, Pause, Stop, Volume2, Scissors, Copy, 
  ZoomIn, ZoomOut, RotateCcw, Save, Upload,
  Sliders, Filter, Zap
} from 'lucide-react';

export const WaveformEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

  useEffect(() => {
    const initAudioContext = () => {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    };

    initAudioContext();
  }, []);

  const drawWaveform = (buffer: AudioBuffer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.fillStyle = '#4f46e5';
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      
      const y1 = (1 + min) * amp;
      const y2 = (1 + max) * amp;
      
      ctx.fillRect(i, y1, 1, y2 - y1);
    }

    // Draw selection
    if (selectionStart !== null && selectionEnd !== null) {
      const startX = (selectionStart / duration) * width;
      const endX = (selectionEnd / duration) * width;
      
      ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.fillRect(startX, 0, endX - startX, height);
    }

    // Draw playhead
    const playheadX = (currentTime / duration) * width;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !audioContext) return;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);
    
    setAudioBuffer(buffer);
    setDuration(buffer.duration);
    drawWaveform(buffer);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !duration) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const clickTime = (x / canvas.width) * duration;

    if (event.shiftKey && selectionStart !== null) {
      setSelectionEnd(clickTime);
    } else {
      setSelectionStart(clickTime);
      setSelectionEnd(null);
      setCurrentTime(clickTime);
    }
  };

  const applyEffect = (effectType: string) => {
    if (!audioBuffer || selectionStart === null || selectionEnd === null) return;
    
    // This would contain actual audio processing logic
    console.log(`Applying ${effectType} effect from ${selectionStart}s to ${selectionEnd}s`);
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Waveform Editor</h2>
          
          <div className="flex items-center gap-2">
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer transition-colors">
              <Upload className="w-4 h-4 inline mr-2" />
              Load Audio
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">
              <Save className="w-4 h-4 inline mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentTime(0);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full transition-colors"
            >
              <Stop className="w-5 h-5" />
            </button>

            <div className="ml-4 text-sm font-mono">
              {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.5))}
              className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm w-16 text-center">{zoom}x</span>
            <button
              onClick={() => setZoom(Math.min(10, zoom + 0.5))}
              className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Waveform Display */}
      <div className="p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full h-48 bg-gray-800 rounded cursor-crosshair"
          onClick={handleCanvasClick}
        />
      </div>

      {/* Selection Info */}
      {selectionStart !== null && selectionEnd !== null && (
        <div className="bg-gray-800 p-4 border-t border-gray-700">
          <div className="text-sm">
            <span className="text-gray-400">Selection: </span>
            <span className="font-mono">
              {selectionStart.toFixed(2)}s - {selectionEnd.toFixed(2)}s 
              ({(selectionEnd - selectionStart).toFixed(2)}s)
            </span>
          </div>
        </div>
      )}

      {/* Effects Panel */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Audio Effects</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 p-3 rounded">
            <h4 className="font-medium mb-2 flex items-center">
              <Volume2 className="w-4 h-4 mr-2" />
              Amplify
            </h4>
            <input
              type="range"
              min="0"
              max="200"
              defaultValue="100"
              className="w-full"
            />
            <div className="text-xs text-gray-400 mt-1">100%</div>
          </div>

          <div className="bg-gray-700 p-3 rounded">
            <h4 className="font-medium mb-2 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              EQ
            </h4>
            <div className="space-y-1">
              <input type="range" min="-12" max="12" defaultValue="0" className="w-full" />
              <input type="range" min="-12" max="12" defaultValue="0" className="w-full" />
              <input type="range" min="-12" max="12" defaultValue="0" className="w-full" />
            </div>
          </div>

          <div className="bg-gray-700 p-3 rounded">
            <h4 className="font-medium mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Reverb
            </h4>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="20"
              className="w-full"
            />
            <div className="text-xs text-gray-400 mt-1">20%</div>
          </div>

          <div className="bg-gray-700 p-3 rounded">
            <h4 className="font-medium mb-2 flex items-center">
              <Sliders className="w-4 h-4 mr-2" />
              Compress
            </h4>
            <input
              type="range"
              min="1"
              max="20"
              defaultValue="4"
              className="w-full"
            />
            <div className="text-xs text-gray-400 mt-1">4:1</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => applyEffect('normalize')}
            disabled={selectionStart === null || selectionEnd === null}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            Normalize
          </button>
          <button
            onClick={() => applyEffect('fadeIn')}
            disabled={selectionStart === null || selectionEnd === null}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            Fade In
          </button>
          <button
            onClick={() => applyEffect('fadeOut')}
            disabled={selectionStart === null || selectionEnd === null}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            Fade Out
          </button>
          <button
            onClick={() => applyEffect('reverse')}
            disabled={selectionStart === null || selectionEnd === null}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Reverse
          </button>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { Waveform, Play, Save, Cut, Copy, Volume2 } from 'lucide-react';

export const WaveformEditor: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (audioBuffer) {
      drawWaveform();
    }
  }, [audioBuffer, currentTime, selectionStart, selectionEnd]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const context = new AudioContext();
      const buffer = await context.decodeAudioData(arrayBuffer);
      
      setAudioContext(context);
      setAudioBuffer(buffer);
    } catch (error) {
      console.error('Error loading audio file:', error);
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw selection
    if (selectionStart !== selectionEnd) {
      const startX = (selectionStart / audioBuffer.duration) * width;
      const endX = (selectionEnd / audioBuffer.duration) * width;
      ctx.fillStyle = 'rgba(74, 144, 226, 0.3)';
      ctx.fillRect(startX, 0, endX - startX, height);
    }

    // Draw waveform
    ctx.beginPath();
    ctx.moveTo(0, amp);
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 1;

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    
    ctx.stroke();

    // Draw playhead
    const playheadX = (currentTime / audioBuffer.duration) * width;
    ctx.strokeStyle = '#FF5722';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const time = (x / canvas.width) * audioBuffer.duration;

    if (event.shiftKey) {
      setSelectionEnd(time);
    } else {
      setCurrentTime(time);
      setSelectionStart(time);
      setSelectionEnd(time);
    }
  };

  const handlePlay = async () => {
    if (!audioContext || !audioBuffer) return;

    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    const startTime = selectionStart || 0;
    const duration = selectionEnd > selectionStart ? selectionEnd - selectionStart : undefined;
    
    source.start(0, startTime, duration);
    setIsPlaying(true);

    source.onended = () => {
      setIsPlaying(false);
    };
  };

  const handleCut = () => {
    if (!audioBuffer || selectionStart === selectionEnd) return;
    
    // TODO: Implement audio cutting logic
    console.log('Cut selection:', selectionStart, 'to', selectionEnd);
  };

  const handleCopy = () => {
    if (!audioBuffer || selectionStart === selectionEnd) return;
    
    // TODO: Implement audio copying logic
    console.log('Copy selection:', selectionStart, 'to', selectionEnd);
  };

  const handleSave = async () => {
    if (!audioBuffer) return;

    try {
      // TODO: Implement audio export logic
      console.log('Saving audio...');
    } catch (error) {
      console.error('Error saving audio:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/10 border border-white/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Waveform className="w-5 h-5 text-green-400" />
            <h3 className="text-xl font-semibold text-white">Waveform Editor</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
            >
              Load Audio
            </button>
            {audioBuffer && (
              <>
                <button
                  onClick={handlePlay}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center gap-1"
                >
                  <Play className="w-4 h-4" />
                  {isPlaying ? 'Stop' : 'Play'}
                </button>
                <button
                  onClick={handleCut}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded flex items-center gap-1"
                  disabled={selectionStart === selectionEnd}
                >
                  <Cut className="w-4 h-4" />
                  Cut
                </button>
                <button
                  onClick={handleCopy}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded flex items-center gap-1"
                  disabled={selectionStart === selectionEnd}
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </>
            )}
          </div>
        </div>

        {audioFile && (
          <div className="mb-4 p-3 bg-white/5 rounded">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">File: {audioFile.name}</span>
              {audioBuffer && (
                <span className="text-white/60 text-sm">
                  Duration: {audioBuffer.duration.toFixed(2)}s | 
                  Sample Rate: {audioBuffer.sampleRate}Hz | 
                  Channels: {audioBuffer.numberOfChannels}
                </span>
              )}
            </div>
          </div>
        )}

        {audioBuffer ? (
          <div className="space-y-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={200}
              onClick={handleCanvasClick}
              className="w-full border border-white/20 rounded cursor-crosshair"
            />
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-white/60">
                Current Time: {currentTime.toFixed(2)}s
              </div>
              <div className="text-white/60">
                Selection: {selectionStart.toFixed(2)}s - {selectionEnd.toFixed(2)}s
              </div>
              <div className="text-white/60">
                Duration: {(selectionEnd - selectionStart).toFixed(2)}s
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Waveform className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">Load an audio file to start editing</p>
          </div>
        )}
      </div>
    </div>
  );
};
