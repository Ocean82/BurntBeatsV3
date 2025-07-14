
import React, { useState } from 'react';

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
        throw new Error('Failed to retrieve MIDI files');
      }
      
      const data = await response.json();
      setMidiFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadMidi = async (filename: string) => {
    try {
      const response = await fetch(`/storage/midi/generated/${filename}`);
      if (!response.ok) {
        throw new Error('Failed to download MIDI file');
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
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const getMidiMetadata = async (filename: string) => {
    try {
      const response = await fetch(`/api/midi/${filename}/metadata`);
      if (!response.ok) {
        throw new Error('Failed to get metadata');
      }
      
      const metadata = await response.json();
      alert(`MIDI Metadata:\n${JSON.stringify(metadata, null, 2)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get metadata');
    }
  };

  return (
    <div className="midi-retriever">
      <button 
        onClick={retrieveMidiFiles}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Retrieve MIDI Files'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {midiFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Available MIDI Files:</h3>
          <div className="space-y-2">
            {midiFiles.map((file) => (
              <div 
                key={file.filename} 
                className="flex items-center justify-between p-3 bg-gray-100 rounded"
              >
                <span className="font-medium">{file.filename}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => onMidiSelect?.(file.filename)}
                    className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Select
                  </button>
                  <button
                    onClick={() => downloadMidi(file.filename)}
                    className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => getMidiMetadata(file.filename)}
                    className="bg-purple-500 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Info
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {midiFiles.length === 0 && !loading && !error && (
        <p className="mt-4 text-gray-500">Click "Retrieve MIDI Files" to see available files.</p>
      )}
    </div>
  );
};
