
import React, { useState } from 'react';
import { Search, Filter, Play, Download, Info, Music, Clock, Settings } from 'lucide-react';
import { useMidiExplorer } from '../hooks/useMidiExplorer';
import { useMidiPlayer } from '../hooks/useMidiPlayer';

export const MidiExplorer: React.FC = () => {
  const { 
    catalog, 
    filteredFiles, 
    filters, 
    filterOptions, 
    loading, 
    error, 
    updateFilters, 
    clearFilters 
  } = useMidiExplorer();

  const { 
    state: playerState, 
    currentFile, 
    loadMidiFile, 
    play, 
    pause 
  } = useMidiPlayer();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handlePlayFile = async (filePath: string) => {
    if (currentFile === filePath && playerState.isPlaying) {
      pause();
    } else {
      await loadMidiFile(filePath);
      play();
    }
  };

  const handleDownloadFile = (filePath: string, filename: string) => {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !catalog) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-white">Loading MIDI catalog...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 text-red-100 rounded-md p-4">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">MIDI Explorer</h2>
          <p className="text-white/60">
            {catalog?.total_files} files • {filteredFiles.length} filtered
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
        <input
          type="text"
          placeholder="Search MIDI files..."
          value={filters.search || ''}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white/10 border border-white/20 rounded-md p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => updateFilters({ category: e.target.value || undefined })}
                className="w-full bg-white/10 border border-white/20 rounded-md text-white px-3 py-2"
              >
                <option value="">All Categories</option>
                {filterOptions.categories?.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Time Signature Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Time Signature</label>
              <select
                value={filters.timeSignature || ''}
                onChange={(e) => updateFilters({ timeSignature: e.target.value || undefined })}
                className="w-full bg-white/10 border border-white/20 rounded-md text-white px-3 py-2"
              >
                <option value="">All Signatures</option>
                {filterOptions.timeSignatures?.map(sig => (
                  <option key={sig} value={sig}>{sig}</option>
                ))}
              </select>
            </div>

            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Genre</label>
              <select
                value={filters.genre || ''}
                onChange={(e) => updateFilters({ genre: e.target.value || undefined })}
                className="w-full bg-white/10 border border-white/20 rounded-md text-white px-3 py-2"
              >
                <option value="">All Genres</option>
                {filterOptions.genres?.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Complexity Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Complexity</label>
              <select
                value={filters.complexity || ''}
                onChange={(e) => updateFilters({ complexity: e.target.value || undefined })}
                className="w-full bg-white/10 border border-white/20 rounded-md text-white px-3 py-2"
              >
                <option value="">All Levels</option>
                {filterOptions.complexities?.map(complexity => (
                  <option key={complexity} value={complexity}>{complexity}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tempo Range */}
          {filterOptions.tempoRange && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tempo Range: {filters.tempo?.[0] || filterOptions.tempoRange[0]} - {filters.tempo?.[1] || filterOptions.tempoRange[1]} BPM
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min={filterOptions.tempoRange[0]}
                  max={filterOptions.tempoRange[1]}
                  value={filters.tempo?.[0] || filterOptions.tempoRange[0]}
                  onChange={(e) => updateFilters({ 
                    tempo: [parseInt(e.target.value), filters.tempo?.[1] || filterOptions.tempoRange[1]] 
                  })}
                  className="flex-1"
                />
                <input
                  type="range"
                  min={filterOptions.tempoRange[0]}
                  max={filterOptions.tempoRange[1]}
                  value={filters.tempo?.[1] || filterOptions.tempoRange[1]}
                  onChange={(e) => updateFilters({ 
                    tempo: [filters.tempo?.[0] || filterOptions.tempoRange[0], parseInt(e.target.value)] 
                  })}
                  className="flex-1"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* MIDI Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map((file, index) => (
          <div
            key={`${file.path}-${index}`}
            className="bg-white/10 border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-colors"
          >
            {/* File Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-white truncate" title={file.filename}>
                  {file.filename.replace(/\.(mid|midi)$/i, '')}
                </h3>
                <p className="text-sm text-white/60 capitalize">{file.category}</p>
              </div>
              <Music className="w-5 h-5 text-blue-400 flex-shrink-0" />
            </div>

            {/* File Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Tempo:</span>
                <span className="text-white">{file.tempo} BPM</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Time Signature:</span>
                <span className="text-white">{file.timeSignature}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Tracks:</span>
                <span className="text-white">{file.tracks}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Duration:</span>
                <span className="text-white">{Math.round(file.duration)}s</span>
              </div>
            </div>

            {/* Tags */}
            {file.tags && file.tags.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {file.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {file.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded">
                      +{file.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePlayFile(file.path)}
                className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors flex-1 justify-center ${
                  currentFile === file.path && playerState.isPlaying
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Play className="w-3 h-3" />
                {currentFile === file.path && playerState.isPlaying ? 'Playing' : 'Play'}
              </button>
              <button
                onClick={() => handleDownloadFile(file.path, file.filename)}
                className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded transition-colors"
                title="Download"
              >
                <Download className="w-3 h-3" />
              </button>
              <button
                onClick={() => setSelectedFile(selectedFile === file.path ? null : file.path)}
                className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded transition-colors"
                title="Info"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <Music className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">No MIDI files match your current filters.</p>
          <button
            onClick={clearFilters}
            className="mt-2 text-blue-400 hover:text-blue-300 underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
