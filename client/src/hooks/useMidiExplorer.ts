
import { useState, useEffect, useMemo } from 'react';
import { useApi } from './useApi';

export interface MidiFile {
  filename: string;
  path: string;
  category: string;
  tempo: number;
  timeSignature: string;
  tracks: number;
  duration: number;
  genre?: string;
  style?: string;
  complexity?: 'simple' | 'standard' | 'complex';
  tags?: string[];
}

export interface MidiCatalog {
  total_files: number;
  categories: Record<string, number>;
  tempo_distribution: Record<string, number>;
  time_signature_distribution: Record<string, number>;
  midi_files: MidiFile[];
}

export interface MidiFilters {
  category?: string;
  tempo?: [number, number];
  timeSignature?: string;
  genre?: string;
  complexity?: string;
  search?: string;
}

export function useMidiExplorer() {
  const { request } = useApi();
  const [catalog, setCatalog] = useState<MidiCatalog | null>(null);
  const [filters, setFilters] = useState<MidiFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load MIDI catalog on mount
  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await request('/api/midi/catalog', {
        method: 'GET'
      });
      
      if (response.success) {
        setCatalog(response.catalog);
      } else {
        setError(response.error || 'Failed to load MIDI catalog');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Filter MIDI files based on current filters
  const filteredFiles = useMemo(() => {
    if (!catalog) return [];

    return catalog.midi_files.filter(file => {
      // Category filter
      if (filters.category && file.category !== filters.category) {
        return false;
      }

      // Tempo range filter
      if (filters.tempo) {
        const [minTempo, maxTempo] = filters.tempo;
        if (file.tempo < minTempo || file.tempo > maxTempo) {
          return false;
        }
      }

      // Time signature filter
      if (filters.timeSignature && file.timeSignature !== filters.timeSignature) {
        return false;
      }

      // Genre filter
      if (filters.genre && file.genre !== filters.genre) {
        return false;
      }

      // Complexity filter
      if (filters.complexity && file.complexity !== filters.complexity) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchableText = [
          file.filename,
          file.category,
          file.genre,
          file.style,
          ...(file.tags || [])
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [catalog, filters]);

  // Get available filter options
  const filterOptions = useMemo(() => {
    if (!catalog) return {};

    const categories = Array.from(new Set(catalog.midi_files.map(f => f.category)));
    const timeSignatures = Array.from(new Set(catalog.midi_files.map(f => f.timeSignature)));
    const genres = Array.from(new Set(catalog.midi_files.map(f => f.genre).filter(Boolean)));
    const complexities = Array.from(new Set(catalog.midi_files.map(f => f.complexity).filter(Boolean)));

    return {
      categories,
      timeSignatures,
      genres,
      complexities,
      tempoRange: [
        Math.min(...catalog.midi_files.map(f => f.tempo)),
        Math.max(...catalog.midi_files.map(f => f.tempo))
      ]
    };
  }, [catalog]);

  const updateFilters = (newFilters: Partial<MidiFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    catalog,
    filteredFiles,
    filters,
    filterOptions,
    loading,
    error,
    updateFilters,
    clearFilters,
    refreshCatalog: loadCatalog
  };
}
