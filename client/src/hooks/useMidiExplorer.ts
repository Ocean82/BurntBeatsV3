
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
import { useState, useEffect, useCallback } from 'react';

interface MidiFile {
  path: string;
  filename: string;
  category: string;
  tempo: number;
  timeSignature: string;
  tracks: number;
  duration: number;
  tags?: string[];
  genre?: string;
  complexity?: string;
}

interface MidiCatalog {
  total_files: number;
  files: MidiFile[];
}

interface Filters {
  search?: string;
  category?: string;
  genre?: string;
  timeSignature?: string;
  complexity?: string;
  tempo?: [number, number];
}

interface FilterOptions {
  categories?: string[];
  genres?: string[];
  timeSignatures?: string[];
  complexities?: string[];
  tempoRange?: [number, number];
}

export const useMidiExplorer = () => {
  const [catalog, setCatalog] = useState<MidiCatalog | null>(null);
  const [filteredFiles, setFilteredFiles] = useState<MidiFile[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/midi/catalog');
      if (!response.ok) {
        throw new Error(`Failed to load catalog: ${response.statusText}`);
      }

      const data = await response.json();
      setCatalog(data);
      setFilteredFiles(data.files || []);

      // Extract filter options from catalog
      const files = data.files || [];
      const categories = [...new Set(files.map((f: MidiFile) => f.category))];
      const genres = [...new Set(files.map((f: MidiFile) => f.genre).filter(Boolean))];
      const timeSignatures = [...new Set(files.map((f: MidiFile) => f.timeSignature))];
      const complexities = [...new Set(files.map((f: MidiFile) => f.complexity).filter(Boolean))];
      const tempos = files.map((f: MidiFile) => f.tempo).filter(t => t > 0);
      const tempoRange: [number, number] = tempos.length > 0 
        ? [Math.min(...tempos), Math.max(...tempos)]
        : [60, 180];

      setFilterOptions({
        categories,
        genres,
        timeSignatures,
        complexities,
        tempoRange
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error loading MIDI catalog:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    if (!catalog) return;

    let filtered = [...catalog.files];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(file =>
        file.filename.toLowerCase().includes(searchTerm) ||
        file.category.toLowerCase().includes(searchTerm) ||
        file.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(file => file.category === filters.category);
    }

    // Genre filter
    if (filters.genre) {
      filtered = filtered.filter(file => file.genre === filters.genre);
    }

    // Time signature filter
    if (filters.timeSignature) {
      filtered = filtered.filter(file => file.timeSignature === filters.timeSignature);
    }

    // Complexity filter
    if (filters.complexity) {
      filtered = filtered.filter(file => file.complexity === filters.complexity);
    }

    // Tempo range filter
    if (filters.tempo) {
      const [minTempo, maxTempo] = filters.tempo;
      filtered = filtered.filter(file => file.tempo >= minTempo && file.tempo <= maxTempo);
    }

    setFilteredFiles(filtered);
  }, [catalog, filters]);

  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return {
    catalog,
    filteredFiles,
    filters,
    filterOptions,
    loading,
    error,
    updateFilters,
    clearFilters,
    reload: loadCatalog
  };
};
