
import React, { useState, useEffect } from 'react';
import { AudioLDM2Generator } from './components/AudioLDM2Generator';
import { MidiRetriever } from './components/MidiRetriever';
import { Music, Mic, FileMusic, Settings, Play, Download, Upload } from 'lucide-react';
import './App.css';

interface ServerStatus {
  status: string;
  version: string;
  environment: string;
  message: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface GeneratedContent {
  type: 'midi' | 'audio' | 'voice';
  filename: string;
  path: string;
  metadata?: any;
  timestamp: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState<'midi' | 'audio' | 'voice' | 'library'>('midi');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  // Music Generation State
  const [musicForm, setMusicForm] = useState({
    title: '',
    theme: '',
    genre: 'pop',
    tempo: 120,
    duration: 60,
    useAiLyrics: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);

  // Voice Generation State
  const [voiceForm, setVoiceForm] = useState({
    text: '',
    voiceId: 'default',
    style: 'neutral'
  });
  const [isVoiceGenerating, setIsVoiceGenerating] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceFile, setSelectedVoiceFile] = useState<File | null>(null);

  useEffect(() => {
    checkServerStatus();
    loadAvailableVoices();
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

  const loadAvailableVoices = async () => {
    try {
      const response = await fetch('/api/voice/available');
      if (response.ok) {
        const data = await response.json();
        setAvailableVoices(data.voices || []);
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    setUser({
      id: '1',
      name: formData.name || 'User',
      email: formData.email
    });
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowLogin(true);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
  };

  // MIDI Generation Handler
  const handleMidiGeneration = async () => {
    if (!musicForm.title || !musicForm.theme || !musicForm.genre) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/midi/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(musicForm)
      });

      const result = await response.json();
      if (result.success) {
        const newContent: GeneratedContent = {
          type: 'midi',
          filename: result.midiPath.split('/').pop(),
          path: result.midiPath,
          metadata: result.metadata,
          timestamp: new Date().toISOString()
        };
        setGeneratedContent(prev => [newContent, ...prev]);
        alert('MIDI generated successfully!');
      } else {
        alert('MIDI generation failed: ' + result.error);
      }
    } catch (error) {
      console.error('MIDI generation error:', error);
      alert('MIDI generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Voice Generation Handler
  const handleVoiceGeneration = async () => {
    if (!voiceForm.text || !voiceForm.voiceId) {
      alert('Please enter text and select a voice');
      return;
    }

    setIsVoiceGenerating(true);
    try {
      const formData = new FormData();
      formData.append('text', voiceForm.text);
      formData.append('voiceId', voiceForm.voiceId);
      if (selectedVoiceFile) {
        formData.append('audio', selectedVoiceFile);
      }

      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        const newContent: GeneratedContent = {
          type: 'voice',
          filename: result.audioUrl.split('/').pop(),
          path: result.audioUrl,
          timestamp: new Date().toISOString()
        };
        setGeneratedContent(prev => [newContent, ...prev]);
        alert('Voice generated successfully!');
      } else {
        alert('Voice generation failed: ' + result.error);
      }
    } catch (error) {
      console.error('Voice generation error:', error);
      alert('Voice generation failed');
    } finally {
      setIsVoiceGenerating(false);
    }
  };

  const handleAudioGenerated = (audioUrl: string) => {
    const newContent: GeneratedContent = {
      type: 'audio',
      filename: audioUrl.split('/').pop() || 'generated_audio.wav',
      path: audioUrl,
      timestamp: new Date().toISOString()
    };
    setGeneratedContent(prev => [newContent, ...prev]);
  };

  const handleMidiSelect = (filename: string) => {
    console.log('Selected MIDI:', filename);
    // Could be used to load MIDI for further processing
  };

  const downloadFile = (path: string, filename: string) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Burnt Beats...</p>
        </div>
      </div>
    );
  }

  if (showLogin && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/80 backdrop-blur-sm border border-orange-500/30 shadow-2xl shadow-orange-500/20 rounded-lg">
          <div className="text-center p-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/50 flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-purple-400 bg-clip-text text-transparent">
                Burnt Beats
              </h1>
            </div>
            <p className="text-orange-300/80">AI-Powered Music Creation Platform</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-2 bg-black/60 border border-orange-500/20 rounded-lg p-1 mb-6">
              <button 
                onClick={() => setIsLogin(true)}
                className={`py-2 px-4 rounded text-orange-300 font-semibold transition-colors ${isLogin ? 'bg-orange-500/30 text-white' : 'hover:bg-orange-500/10'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`py-2 px-4 rounded text-orange-300 font-semibold transition-colors ${!isLogin ? 'bg-orange-500/30 text-white' : 'hover:bg-orange-500/10'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-orange-300 mb-2 block">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name" 
                    required
                    className="w-full p-3 bg-black/60 border border-orange-500/30 rounded text-orange-100 placeholder:text-orange-400/60 focus:border-orange-400 focus:ring-orange-400/20 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-orange-300 mb-2 block">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email" 
                  required
                  className="w-full p-3 bg-black/60 border border-orange-500/30 rounded text-orange-100 placeholder:text-orange-400/60 focus:border-orange-400 focus:ring-orange-400/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-orange-300 mb-2 block">Password</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password" 
                  required
                  className="w-full p-3 bg-black/60 border border-orange-500/30 rounded text-orange-100 placeholder:text-orange-400/60 focus:border-orange-400 focus:ring-orange-400/20 focus:outline-none"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="text-orange-300 mb-2 block">Confirm Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password" 
                    required
                    className="w-full p-3 bg-black/60 border border-orange-500/30 rounded text-orange-100 placeholder:text-orange-400/60 focus:border-orange-400 focus:ring-orange-400/20 focus:outline-none"
                  />
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 hover:from-orange-600 hover:via-red-600 hover:to-purple-600 text-white font-semibold py-3 px-4 rounded shadow-lg shadow-orange-500/30 transition-all duration-200"
              >
                {isLogin ? 'Login' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <h1 className="text-2xl font-bold text-white">Burnt Beats</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/80">Welcome, {user?.name}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
            <button
              onClick={() => setActiveTab('midi')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'midi' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileMusic className="w-4 h-4" />
              MIDI Generation
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'audio' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Music className="w-4 h-4" />
              AI Music
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'voice' 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Mic className="w-4 h-4" />
              Voice Synthesis
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'library' 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Settings className="w-4 h-4" />
              Library
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'midi' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FileMusic className="w-6 h-6 text-blue-400" />
                MIDI Generation
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Title *</label>
                  <input
                    type="text"
                    value={musicForm.title}
                    onChange={(e) => setMusicForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter song title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Theme *</label>
                  <input
                    type="text"
                    value={musicForm.theme}
                    onChange={(e) => setMusicForm(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter theme or mood"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Genre *</label>
                  <select
                    value={musicForm.genre}
                    onChange={(e) => setMusicForm(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pop">Pop</option>
                    <option value="rock">Rock</option>
                    <option value="jazz">Jazz</option>
                    <option value="electronic">Electronic</option>
                    <option value="classical">Classical</option>
                    <option value="hiphop">Hip Hop</option>
                    <option value="blues">Blues</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Tempo: {musicForm.tempo} BPM</label>
                  <input
                    type="range"
                    min="60"
                    max="180"
                    value={musicForm.tempo}
                    onChange={(e) => setMusicForm(prev => ({ ...prev, tempo: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Duration: {musicForm.duration}s</label>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    value={musicForm.duration}
                    onChange={(e) => setMusicForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="aiLyrics"
                    checked={musicForm.useAiLyrics}
                    onChange={(e) => setMusicForm(prev => ({ ...prev, useAiLyrics: e.target.checked }))}
                    className="mr-2 w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="aiLyrics" className="text-white">Use AI-generated lyrics</label>
                </div>
              </div>
              
              <button
                onClick={handleMidiGeneration}
                disabled={isGenerating}
                className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Generating MIDI...
                  </>
                ) : (
                  <>
                    <FileMusic className="w-4 h-4" />
                    Generate MIDI
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="max-w-4xl mx-auto">
            <AudioLDM2Generator onAudioGenerated={handleAudioGenerated} />
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Mic className="w-6 h-6 text-green-400" />
                Voice Synthesis
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Text to Synthesize *</label>
                  <textarea
                    value={voiceForm.text}
                    onChange={(e) => setVoiceForm(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Enter text to convert to speech..."
                    rows={4}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Voice Model</label>
                    <select
                      value={voiceForm.voiceId}
                      onChange={(e) => setVoiceForm(prev => ({ ...prev, voiceId: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="default">Default Voice</option>
                      {availableVoices.map((voice: any) => (
                        <option key={voice.id} value={voice.id}>{voice.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Style</label>
                    <select
                      value={voiceForm.style}
                      onChange={(e) => setVoiceForm(prev => ({ ...prev, style: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="neutral">Neutral</option>
                      <option value="happy">Happy</option>
                      <option value="sad">Sad</option>
                      <option value="angry">Angry</option>
                      <option value="excited">Excited</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Upload Voice Sample (Optional)</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setSelectedVoiceFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>
                
                <button
                  onClick={handleVoiceGeneration}
                  disabled={isVoiceGenerating}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  {isVoiceGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Generating Voice...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      Generate Voice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <MidiRetriever onMidiSelect={handleMidiSelect} />
            
            {/* Generated Content Library */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-400" />
                Generated Content Library
              </h3>
              
              {generatedContent.length === 0 ? (
                <p className="text-white/60 text-center py-8">No generated content yet. Create some music or voice content!</p>
              ) : (
                <div className="space-y-3">
                  {generatedContent.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/10 rounded-md border border-white/20">
                      <div className="flex items-center gap-3">
                        {item.type === 'midi' && <FileMusic className="w-5 h-5 text-blue-400" />}
                        {item.type === 'audio' && <Music className="w-5 h-5 text-purple-400" />}
                        {item.type === 'voice' && <Mic className="w-5 h-5 text-green-400" />}
                        <div>
                          <span className="font-medium text-white block">{item.filename}</span>
                          <span className="text-sm text-white/60">{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.type === 'audio' || item.type === 'voice' ? (
                          <audio controls className="max-w-xs">
                            <source src={item.path} type="audio/wav" />
                          </audio>
                        ) : (
                          <button
                            onClick={() => window.open(item.path, '_blank')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            View
                          </button>
                        )}
                        <button
                          onClick={() => downloadFile(item.path, item.filename)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Server Status */}
        {serverStatus && (
          <div className="mt-8 max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <h4 className="text-sm font-semibold text-white mb-2">Server Status</h4>
            <div className="text-sm text-white/80">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={serverStatus.status === 'online' ? 'text-green-400' : 'text-red-400'}>
                  {serverStatus.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Environment:</span>
                <span>{serverStatus.environment}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
