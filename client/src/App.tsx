import React, { useState, useEffect, useCallback } from 'react';
import { AudioLDM2Generator } from './components/AudioLDM2Generator';
import { MidiRetriever } from './components/MidiRetriever';
import { LandingPage } from './components/LandingPage';
import { Music, Mic, FileMusic, Settings, Play, Download, Upload } from 'lucide-react';
import { 
  useApi, 
  useMidiGeneration, 
  useVoiceSynthesis, 
  useLocalStorage,
  useErrorBoundary,
  useAudioGeneration,
  useFileUpload 
} from './hooks';
import { VoiceCloningStudio } from './components/VoiceCloningStudio';
import './App.css';

// Ensure buttons are not blocked by overlays
const buttonStyles = `
  button:not(:disabled) {
    pointer-events: auto !important;
    position: relative;
    z-index: 10;
  }

  button:disabled {
    pointer-events: none !important;
    opacity: 0.5;
    cursor: not-allowed;
  }

  .interactive-element {
    position: relative;
    z-index: 10;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = buttonStyles;
  document.head.appendChild(styleElement);
}

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

type ActiveView = 'landing' | 'audio-generator' | 'voice-studio' | 'midi-retriever' | 'midi' | 'audio' | 'voice' | 'library';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab: React.Dispatch<React.SetStateAction<'midi' | 'audio' | 'voice' | 'library'>>> = useState<'midi' | 'audio' | 'voice' | 'library'>('midi');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  // Hooks for robust state management
  const serverStatusApi = useApi<ServerStatus>();
  const midiGeneration = useMidiGeneration();
  const voiceSynthesis = useVoiceSynthesis();
  const audioGeneration = useAudioGeneration();
  const fileUpload = useFileUpload();
  const { captureError, clearError, hasError, error: boundaryError } = useErrorBoundary();

  // Persistent state with localStorage
  const [generatedContent, setGeneratedContent] = useLocalStorage<GeneratedContent[]>('burnt-beats-generated-content', []);
  const [musicForm, setMusicForm] = useLocalStorage('burnt-beats-music-form', {
    title: '',
    theme: '',
    genre: 'pop',
    tempo: 120,
    duration: 60,
    useAiLyrics: false
  });
  const [voiceForm, setVoiceForm] = useLocalStorage('burnt-beats-voice-form', {
    text: '',
    voiceId: 'default',
    style: 'neutral'
  });

  // Local state
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceFile, setSelectedVoiceFile] = useState<File | null>(null);
  const [activeView, setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>> = useState<ActiveView>('landing');

  useEffect(() => {
    checkServerStatus();
    loadAvailableVoices();
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkServerStatus = async () => {
    try {
      const data = await serverStatusApi.execute('/api/status');
      if (data) {
        setServerStatus(data);
      } else {
        setServerStatus({
          status: 'offline',
          version: 'unknown',
          environment: 'unknown',
          message: 'Failed to connect to server'
        });
      }
    } catch (error) {
      console.warn('Server status check failed:', error);
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
    try {
      clearError();
      const result = await midiGeneration.generate(musicForm);

      if (result) {
        const newContent: GeneratedContent = {
          type: 'midi',
          filename: result.filename || result.midiPath.split('/').pop() || 'generated.mid',
          path: result.midiPath,
          metadata: result.metadata,
          timestamp: new Date().toISOString()
        };
        setGeneratedContent(prev => [newContent, ...prev]);
        alert('MIDI generated successfully!');
      }
    } catch (error) {
      captureError(error as Error, 'MIDI generation');
      alert(`MIDI generation failed: ${(error as Error).message}`);
    }
  };

  // Voice Generation Handler
  const handleVoiceGeneration = async () => {
    try {
      clearError();
      const result = await voiceSynthesis.synthesize({
        text: voiceForm.text,
        voiceId: voiceForm.voiceId,
        style: voiceForm.style,
        audioFile: selectedVoiceFile || undefined,
      });

      if (result) {
        const newContent: GeneratedContent = {
          type: 'voice',
          filename: result.filename || result.audioUrl.split('/').pop() || 'generated.wav',
          path: result.audioUrl,
          timestamp: new Date().toISOString()
        };
        setGeneratedContent(prev => [newContent, ...prev]);
        alert('Voice generated successfully!');
        setSelectedVoiceFile(null); // Reset file selection
      }
    } catch (error) {
      captureError(error as Error, 'Voice synthesis');
      alert(`Voice generation failed: ${(error as Error).message}`);
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

  const handleGetStarted = useCallback(() => {
    console.log('App handleGetStarted called'); // Debug log
    setActiveView('audio-generator');
  }, []);

  const handleNavigationClick = useCallback((view: ActiveView) => {
    console.log(`Navigation to ${view} clicked`); // Debug log
    setActiveView(view);
  }, []);

  const handleTabClick = useCallback((tab: 'midi' | 'audio' | 'voice' | 'library') => {
    console.log(`Tab ${tab} clicked`); // Debug log
    setActiveTab(tab);
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'audio-generator':
        return (
          <AudioLDM2Generator 
            onAudioGenerated={handleAudioGenerated}
            audioGeneration={audioGeneration}
          />
        );
      case 'voice-studio':
        return (
          <VoiceCloningStudio 
            voiceSynthesis={voiceSynthesis}
            fileUpload={fileUpload}
          />
        );
      case 'midi-retriever':
        return <MidiRetriever onMidiSelect={handleMidiSelect} />;
      case 'midi':
          return (
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
                  type="button"
                  onClick={handleMidiGeneration}
                  disabled={midiGeneration.isGenerating || !musicForm.title.trim() || !musicForm.theme.trim()}
                  aria-label={midiGeneration.isGenerating ? 'Generating MIDI...' : 'Generate MIDI music'}
                  className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
                  style={{ pointerEvents: midiGeneration.isGenerating ? 'none' : 'auto' }}
                >
                  {midiGeneration.isGenerating ? (
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
          );
      case 'audio':
        return (
          <div className="max-w-4xl mx-auto">
            <AudioLDM2Generator 
              onAudioGenerated={handleAudioGenerated}
              audioGeneration={audioGeneration}
            />
          </div>
        );
      case 'voice':
        return (
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
                  type="button"
                  onClick={handleVoiceGeneration}
                  disabled={voiceSynthesis.isWorking || !voiceForm.text.trim()}
                  aria-label={voiceSynthesis.isWorking ? 'Generating voice...' : 'Generate voice synthesis'}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 z-10"
                  style={{ pointerEvents: voiceSynthesis.isWorking ? 'none' : 'auto' }}
                >
                  {voiceSynthesis.isWorking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      {voiceSynthesis.processingStage || 'Generating Voice...'}
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
        );
      case 'library':
        return (
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
        );
      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 shadow-2xl shadow-orange-500/50 flex items-center justify-center">
              <span className="text-3xl animate-pulse">🔥</span>
            </div>
          </div>
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Burnt Beats
          </h1>
          <p className="text-white/70">Initializing AI Music Platform...</p>
        </div>
      </div>
    );
  }

  if (showLanding && !user) {
    return <LandingPage onGetStarted={() => {
      setShowLanding(false);
      setShowLogin(true);
    }} />;
  }

  if (showLogin && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md card-gradient">
          <div className="text-center p-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/50 flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-purple-400 bg-clip-text text-transparent">
                Burnt Beats
              </h1>
            </div>
            <p className="text-orange-300/80 text-sm sm:text-base">AI-Powered Music Creation Platform</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-2 bg-black/60 border border-orange-500/20 rounded-lg p-1 mb-6">
              <button 
                onClick={() => setIsLogin(true)}
                className={`py-2 px-4 rounded text-orange-300 font-semibold transition-colors text-sm sm:text-base ${isLogin ? 'bg-orange-500/30 text-white' : 'hover:bg-orange-500/10'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`py-2 px-4 rounded text-orange-300 font-semibold transition-colors text-sm sm:text-base ${!isLogin ? 'bg-orange-500/30 text-white' : 'hover:bg-orange-500/10'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-orange-300 mb-2 block text-sm sm:text-base">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name" 
                    required
                    className="input-field text-sm sm:text-base"
                  />
                </div>
              )}

              <div>
                <label className="text-orange-300 mb-2 block text-sm sm:text-base">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email" 
                  required
                  className="input-field text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="text-orange-300 mb-2 block text-sm sm:text-base">Password</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password" 
                  required
                  className="input-field text-sm sm:text-base"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="text-orange-300 mb-2 block text-sm sm:text-base">Confirm Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password" 
                    required
                    className="input-field text-sm sm:text-base"
                  />
                </div>
              )}

              <button 
                type="submit" 
                className="btn-primary w-full text-sm sm:text-base"
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
    <div className="App">
      {/* Navigation */}
      {activeView !== 'landing' && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveView('landing')}
                className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
              >
                <span className="text-2xl">🔥</span>
                <span className="font-bold text-xl">Burnt Beats</span>
              </button>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleNavigationClick('audio-generator')}
                  disabled={false}
                  aria-label="Navigate to Audio Generator"
                  className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 z-10 ${
                    activeView === 'audio-generator'
                      ? 'bg-orange-500 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  Audio Generator
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigationClick('voice-studio')}
                  disabled={false}
                  aria-label="Navigate to Voice Studio"
                  className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 z-10 ${
                    activeView === 'voice-studio'
                      ? 'bg-orange-500 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  Voice Studio
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigationClick('midi-retriever')}
                  disabled={false}
                  aria-label="Navigate to MIDI Files"
                  className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 z-10 ${
                    activeView === 'midi-retriever'
                      ? 'bg-orange-500 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  MIDI Files
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('library')}
                  disabled={false}
                  aria-label="Navigate to Library"
                  className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 z-10 ${
                    activeTab === 'library'
                      ? 'bg-orange-500 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  Library
                </button>
                <button
                  type="button"
                  onClick={() => handleTabClick('midi')}
                  disabled={false}
                  aria-label="Navigate to MIDI Generation"
                  className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 z-10 ${
                    activeTab === 'midi'
                      ? 'bg-orange-500 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  MIDI Generation
                </button>
                 <button
                  type="button"
                  onClick={() => handleTabClick('audio')}
                  disabled={false}
                  aria-label="Navigate to AI Music"
                  className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 z-10 ${
                    activeTab === 'audio'
                      ? 'bg-orange-500 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  AI Music
                </button>
                 <button
                  type="button"
                  onClick={() => handleTabClick('voice')}
                  disabled={false}
                  aria-label="Navigate to Voice Synthesis"
                  className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 z-10 ${
                    activeTab === 'voice'
                      ? 'bg-orange-500 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  Voice Synthesis
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className={activeView !== 'landing' ? 'pt-20' : ''}>
        {renderActiveView()}
      </main>
    </div>
  );
}

export default App;