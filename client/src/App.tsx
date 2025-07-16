
import React, { useState, useEffect } from 'react';
import './App.css';

interface User {
  id: string;
  name: string;
  email: string;
}

interface ServerStatus {
  status: string;
  version: string;
  environment: string;
  message: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setServerStatus(data);
      }
    } catch (error) {
      console.error('Server status check failed:', error);
      setServerStatus({
        status: 'offline',
        version: 'unknown',
        environment: 'unknown',
        message: 'Connection failed'
      });
    } finally {
      setLoading(false);
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

    // Simulate login/registration
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
            
            <div className="mt-6 text-center">
              <p className="text-orange-400/60 text-sm">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main application interface
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

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">Create Your Next Hit</h2>
          <p className="text-white/80 text-lg">AI-powered music generation at your fingertips</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">🎵 Music Generation</h3>
            <p className="text-white/80 mb-4">Generate custom beats and melodies with AI</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded font-semibold transition-colors">
              Start Creating
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">🎤 Voice Cloning</h3>
            <p className="text-white/80 mb-4">Clone voices and generate custom vocals</p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded font-semibold transition-colors">
              Clone Voice
            </button>
          </div>
        </div>

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
      </main>
    </div>
  );
}

export default App;
