import React, { useState } from 'react';
import { Download, FileMusic, Info, Play } from 'lucide-react';

interface MidiFile {
  filename: string;
  path: string;
  size?: number;
  created?: string;
}

interface MidiRetrieverProps {
  onMidiSelect?: (filename: string) => void;
}

export const MidiRetriever: React.FC<MidiRetrieverProps> = ({ onMidiSelect }) => {
  const [midiFiles, setMidiFiles] = useState<MidiFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retrieveMidiFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/midi/list');
      if (!response.ok) {
        throw new Error(`Failed to retrieve MIDI files: ${response.statusText}`);
      }

      const data = await response.json();
      setMidiFiles(data.files || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error retrieving MIDI files:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadMidi = async (filename: string) => {
    try {
      const response = await fetch(`/storage/midi/generated/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to download MIDI file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      setError(errorMessage);
      console.error('Error downloading MIDI file:', err);
    }
  };

  const getMidiMetadata = async (filename: string) => {
    try {
      const response = await fetch(`/api/midi/${filename}/metadata`);
      if (!response.ok) {
        throw new Error(`Failed to get metadata: ${response.statusText}`);
      }

      const metadata = await response.json();
      alert(`MIDI Metadata:\n${JSON.stringify(metadata, null, 2)}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get metadata';
      setError(errorMessage);
      console.error('Error getting MIDI metadata:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <div className="midi-retriever max-w-4xl mx-auto p-4">
      <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <FileMusic className="w-5 h-5 text-green-400" />
          <h3 className="text-xl font-semibold text-white">MIDI File Manager</h3>
        </div>

        <button 
          onClick={retrieveMidiFiles}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-md transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Loading...
            </>
          ) : (
            <>
              <FileMusic className="w-4 h-4" />
              Retrieve MIDI Files
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 text-red-100 rounded-md relative">
            <button
              onClick={clearError}
              className="absolute top-2 right-2 text-red-300 hover:text-red-100"
            >
              ×
            </button>
            <strong>Error:</strong> {error}
          </div>
        )}

        {midiFiles.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-4 text-white">Available MIDI Files ({midiFiles.length})</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {midiFiles.map((file) => (
                <div 
                  key={file.filename} 
                  className="flex items-center justify-between p-4 bg-white/10 rounded-md border border-white/20 hover:bg-white/15 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileMusic className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-white block">{file.filename}</span>
                      {file.size && (
                        <span className="text-sm text-white/60">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {onMidiSelect && (
                      <button
                        onClick={() => onMidiSelect(file.filename)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1"
                        title="Select this MIDI file"
                      >
                        <Play className="w-3 h-3" />
                        Select
                      </button>
                    )}
                    <button
                      onClick={() => downloadMidi(file.filename)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1"
                      title="Download MIDI file"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                    <button
                      onClick={() => getMidiMetadata(file.filename)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1"
                      title="View metadata"
                    >
                      <Info className="w-3 h-3" />
                      Info
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {midiFiles.length === 0 && !loading && !error && (
          <p className="mt-4 text-white/60 text-center py-8">
            Click "Retrieve MIDI Files" to see available files.
          </p>
        )}
      </div>
    </div>
  );
};