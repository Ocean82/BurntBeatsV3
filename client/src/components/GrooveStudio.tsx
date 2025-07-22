
import React, { useState } from 'react';
import { Layers, Play, Download, Settings, Upload } from 'lucide-react';

export const GrooveStudio: React.FC = () => {
  const [selectedGroove, setSelectedGroove] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [grooveSettings, setGrooveSettings] = useState({
    tempo: 120,
    complexity: 'medium',
    style: 'funk'
  });

  const grooveStyles = [
    { id: 'funk', name: 'Funk', description: 'Syncopated rhythms with emphasis on the first beat' },
    { id: 'rock', name: 'Rock', description: 'Steady 4/4 patterns with strong backbeat' },
    { id: 'jazz', name: 'Jazz', description: 'Complex polyrhythmic patterns' },
    { id: 'latin', name: 'Latin', description: 'Afro-Cuban and Brazilian rhythms' },
    { id: 'electronic', name: 'Electronic', description: 'Programmed beats and sequences' }
  ];

  const handlePlayGroove = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual playback
  };

  const handleGenerateGroove = async () => {
    try {
      const response = await fetch('/api/groove/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grooveSettings)
      });

      if (response.ok) {
        const result = await response.json();
        setSelectedGroove(result.grooveId);
      }
    } catch (error) {
      console.error('Error generating groove:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 border border-white/20 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Groove Studio</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Settings Panel */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Style</label>
              <select
                value={grooveSettings.style}
                onChange={(e) => setGrooveSettings(prev => ({ ...prev, style: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-md text-white px-3 py-2"
              >
                {grooveStyles.map(style => (
                  <option key={style.id} value={style.id}>{style.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tempo: {grooveSettings.tempo} BPM
              </label>
              <input
                type="range"
                min="60"
                max="180"
                value={grooveSettings.tempo}
                onChange={(e) => setGrooveSettings(prev => ({ ...prev, tempo: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Complexity</label>
              <select
                value={grooveSettings.complexity}
                onChange={(e) => setGrooveSettings(prev => ({ ...prev, complexity: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-md text-white px-3 py-2"
              >
                <option value="simple">Simple</option>
                <option value="medium">Medium</option>
                <option value="complex">Complex</option>
              </select>
            </div>

            <button
              onClick={handleGenerateGroove}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Generate Groove
            </button>
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-md p-4">
              <h4 className="text-white font-medium mb-2">Current Groove</h4>
              {selectedGroove ? (
                <div className="space-y-3">
                  <p className="text-white/70 text-sm">Groove ID: {selectedGroove}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePlayGroove}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      {isPlaying ? 'Stop' : 'Play'}
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      Export
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-white/50 text-sm">No groove selected</p>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-md p-4">
              <h4 className="text-white font-medium mb-2">Style Info</h4>
              {grooveStyles.find(s => s.id === grooveSettings.style) && (
                <p className="text-white/70 text-sm">
                  {grooveStyles.find(s => s.id === grooveSettings.style)?.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
