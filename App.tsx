
import React, { useState, useEffect } from 'react';
import { AudioLDM2Generator } from './components/AudioLDM2Generator';
import { MidiRetriever } from './components/MidiRetriever';
import './App.css';

interface ServerStatus {
  status: string;
  version: string;
  environment: string;
  message: string;
}

function App() {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'music' | 'midi'>('music');

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await fetch('/api/status');
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      setServerStatus(data);
    } catch (error) {
      console.error('Failed to check server status:', error);
      setServerStatus({
        status: 'offline',
        version: 'unknown',
        environment: 'unknown',
        message: 'Failed to connect to server'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAudioGenerated = (audioUrl: string) => {
    console.log('Audio generated:', audioUrl);
    // You can add additional logic here
  };

  const handleMidiSelect = (filename: string) => {
    console.log('MIDI selected:', filename);
    // You can add additional logic here
  };

  return (
    <div className="app min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <header className="app-header py-8 text-center border-b border-white/20">
        <h1 className="logo text-4xl md:text-6xl font-bold text-white mb-2">
          🔥 Burnt Beats
        </h1>
        <p className="tagline text-lg md:text-xl text-white/80">
          AI-powered music creation platform
        </p>
      </header>

      <main className="app-main py-8">
        <div className="container mx-auto px-4">
          {/* Status Card */}
          <div className="status-card max-w-2xl mx-auto mb-8 bg-white/10 rounded-lg p-6 backdrop-blur-sm border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              Server Status: 
              <span className={`status inline-flex items-center gap-1 ${
                serverStatus?.status === 'online' 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    Checking...
                  </>
                ) : (
                  <>
                    <div className={`w-2 h-2 rounded-full ${
                      serverStatus?.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    {serverStatus?.status === 'online' ? 'Online' : 'Offline'}
                  </>
                )}
              </span>
            </h2>
            {serverStatus && (
              <div className="status-details space-y-2 text-white/80">
                <p><strong>Version:</strong> {serverStatus.version}</p>
                <p><strong>Environment:</strong> {serverStatus.environment}</p>
                <p><strong>Message:</strong> {serverStatus.message}</p>
              </div>
            )}
          </div>

          {serverStatus?.status === 'online' ? (
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex justify-center">
                <div className="bg-white/10 rounded-lg p-1 backdrop-blur-sm border border-white/20">
                  <button
                    onClick={() => setSelectedTab('music')}
                    className={`px-6 py-2 rounded-md font-medium transition-colors ${
                      selectedTab === 'music'
                        ? 'bg-blue-600 text-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Music Generation
                  </button>
                  <button
                    onClick={() => setSelectedTab('midi')}
                    className={`px-6 py-2 rounded-md font-medium transition-colors ${
                      selectedTab === 'midi'
                        ? 'bg-blue-600 text-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    MIDI Manager
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {selectedTab === 'music' && (
                <div className="music-generator">
                  <AudioLDM2Generator onAudioGenerated={handleAudioGenerated} />
                </div>
              )}

              {selectedTab === 'midi' && (
                <div className="midi-manager">
                  <MidiRetriever onMidiSelect={handleMidiSelect} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-red-100 mb-2">
                  Server Unavailable
                </h3>
                <p className="text-red-200/80">
                  The server is currently offline. Please try again later.
                </p>
                <button
                  onClick={checkServerStatus}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
