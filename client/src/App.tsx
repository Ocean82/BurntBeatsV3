import React, { useState, useEffect } from 'react';
import { AudioLDM2Generator } from './components/AudioLDM2Generator';
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

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await fetch('/api/status');
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

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="logo">🔥 Burnt Beats</h1>
        <p className="tagline">AI-powered music creation platform</p>
      </header>

      <main className="app-main">
        <div className="status-card">
          <h2>Server Status: 
            <span className={`status ${serverStatus?.status === 'online' ? 'online' : 'offline'}`}>
              {loading ? 'Checking...' : serverStatus?.status === 'online' ? 'Online ✅' : 'Offline ❌'}
            </span>
          </h2>
          {serverStatus && (
            <div className="status-details">
              <p>Version: {serverStatus.version}</p>
              <p>Environment: {serverStatus.environment}</p>
              <p>Message: {serverStatus.message}</p>
            </div>
          )}
        </div>

        {serverStatus?.status === 'online' && (
          <div className="music-generator">
            <AudioLDM2Generator />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;