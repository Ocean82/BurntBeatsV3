
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
