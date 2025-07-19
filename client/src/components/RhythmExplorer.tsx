
import React, { useState, useEffect } from 'react';
import { 
  Music, Play, Pause, Download, Filter, Search, 
  Layers, Clock, BarChart3, RefreshCw
} from 'lucide-react';

interface RhythmPattern {
  filename: string;
  local_path: string;
  category: string;
  analysis: {
    primary_bpm?: number;
    primary_time_signature?: string;
    note_density?: number;
    length_seconds?: number;
    num_tracks?: number;
  };
  original_path?: string;
}

interface RhythmCatalog {
  total_files: number;
  categories: Record<string, { count: number; files: any[] }>;
  tempo_ranges: Record<string, { count: number; files: string[] }>;
  rhythm_files: RhythmPattern[];
}

export const RhythmExplorer: React.FC = () => {
  const [catalog, setCatalog] = useState<RhythmCatalog | null>(null);
  const [filteredRhythms, setFilteredRhythms] = useState<RhythmPattern[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [tempoFilter, setTempoFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [playingFile, setPlayingFile] = useState<string | null>(null);

  useEffect(() => {
    loadRhythmCatalog();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [catalog, selectedCategory, tempoFilter, searchTerm]);

  const loadRhythmCatalog = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/midi/rhythm/advanced');
      if (response.ok) {
        const data = await response.json();
        setCatalog(data.rhythms);
      }
    } catch (error) {
      console.error('Error loading rhythm catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const importMidiLandRhythms = async () => {
    setImporting(true);
    try {
      const response = await fetch('/api/midi/rhythm/import-midi-land', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully imported ${result.imported} rhythm patterns!`);
        loadRhythmCatalog(); // Refresh catalog
      } else {
        const error = await response.json();
        alert(`Import failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error importing MIDI Land rhythms:', error);
      alert('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const applyFilters = () => {
    if (!catalog) return;

    let filtered = catalog.rhythm_files || [];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(rhythm => rhythm.category === selectedCategory);
    }

    // Tempo filter
    if (tempoFilter) {
      const targetTempo = parseInt(tempoFilter);
      if (!isNaN(targetTempo)) {
        filtered = filtered.filter(rhythm => {
          if (rhythm.analysis?.primary_bpm) {
            const bpmDiff = Math.abs(rhythm.analysis.primary_bpm - targetTempo);
            return bpmDiff <= 10; // 10 BPM tolerance
          }
          return false;
        });
      }
    }

    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(rhythm =>
        rhythm.filename.toLowerCase().includes(term) ||
        rhythm.category.toLowerCase().includes(term) ||
        (rhythm.original_path && rhythm.original_path.toLowerCase().includes(term))
      );
    }

    setFilteredRhythms(filtered);
  };

  const playRhythm = (filename: string) => {
    if (playingFile === filename) {
      setPlayingFile(null);
      // Stop playback logic here
    } else {
      setPlayingFile(filename);
      // Start playback logic here
    }
  };

  const downloadRhythm = (rhythm: RhythmPattern) => {
    // Create download link
    const link = document.createElement('a');
    link.href = `/storage/midi/rhythm-patterns/advanced/midi_land/${rhythm.category}/${rhythm.filename}`;
    link.download = rhythm.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      drums: <BarChart3 className="w-4 h-4" />,
      percussion: <Layers className="w-4 h-4" />,
      breakbeats: <Music className="w-4 h-4" />,
      fills: <RefreshCw className="w-4 h-4" />,
      world_rhythms: <Clock className="w-4 h-4" />,
      patterns: <Music className="w-4 h-4" />
    };
    return icons[category] || <Music className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-2 text-white">Loading rhythm patterns...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Advanced Rhythm Explorer</h2>
            <p className="text-gray-400">
              Professional rhythm patterns from Ocean82/midi_land
              {catalog && ` • ${catalog.total_files} patterns available`}
            </p>
          </div>
          
          <button
            onClick={importMidiLandRhythms}
            disabled={importing}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2" />
                Importing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 inline mr-2" />
                Import MIDI Land
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rhythms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white appearance-none focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {catalog && Object.keys(catalog.categories).map(category => (
                <option key={category} value={category}>
                  {category.replace('_', ' ').toUpperCase()} ({catalog.categories[category].count})
                </option>
              ))}
            </select>
          </div>

          {/* Tempo Filter */}
          <div className="relative">
            <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="number"
              placeholder="Target BPM..."
              value={tempoFilter}
              onChange={(e) => setTempoFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Rhythm List */}
      <div className="p-4">
        {filteredRhythms.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400 mb-4">
              {catalog ? 'No rhythms match your filters.' : 'No rhythm patterns imported yet.'}
            </p>
            {!catalog && (
              <button
                onClick={importMidiLandRhythms}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded transition-colors"
              >
                Import MIDI Land Rhythms
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRhythms.map((rhythm, index) => (
              <div
                key={`${rhythm.filename}-${index}`}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-blue-400">
                      {getCategoryIcon(rhythm.category)}
                      <span className="text-xs uppercase tracking-wide">
                        {rhythm.category.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white">
                        {rhythm.filename.replace(/\.(mid|midi)$/i, '')}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        {rhythm.analysis?.primary_bpm && (
                          <span>{Math.round(rhythm.analysis.primary_bpm)} BPM</span>
                        )}
                        {rhythm.analysis?.primary_time_signature && (
                          <span>{rhythm.analysis.primary_time_signature}</span>
                        )}
                        {rhythm.analysis?.length_seconds && (
                          <span>{formatDuration(rhythm.analysis.length_seconds)}</span>
                        )}
                        {rhythm.analysis?.note_density && (
                          <span>{rhythm.analysis.note_density} notes/sec</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playRhythm(rhythm.filename)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
                    >
                      {playingFile === rhythm.filename ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => downloadRhythm(rhythm)}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
