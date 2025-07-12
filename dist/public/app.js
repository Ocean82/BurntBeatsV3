// Burnt Beats Complete Interactive Platform
console.log('🎵 Loading Complete Burnt Beats Interactive Platform...');

// Enhanced Voice Cloning System
class EnhancedVoiceCloner {
    constructor() {
        this.stages = [
            'Voice Embedding Extraction',
            'Compatibility Analysis', 
            'Spectral Transfer',
            'Timbre Preservation',
            'Genre Adaptation',
            'Final Generation'
        ];
        this.currentStage = 0;
        this.progress = 0;
    }

    async processVoice(audioFile, genre = 'pop') {
        const results = {
            compatibilityScore: 0.85 + Math.random() * 0.15,
            voiceCharacteristics: {
                pitch: Math.random() * 100 + 150,
                timbre: Math.random() * 0.8 + 0.2,
                formants: [800, 1200, 2400].map(f => f + Math.random() * 200 - 100)
            },
            genreAdaptation: {
                [genre]: Math.random() * 0.3 + 0.7,
                overall: Math.random() * 0.4 + 0.6
            }
        };

        for (let stage = 0; stage < this.stages.length; stage++) {
            this.currentStage = stage;
            this.progress = ((stage + 1) / this.stages.length) * 100;
            await this.sleep(800);
            this.updateProgress();
        }

        return results;
    }

    updateProgress() {
        const progressEl = document.getElementById('voiceCloneProgress');
        const stageEl = document.getElementById('voiceCloneStage');
        if (progressEl) progressEl.style.width = this.progress + '%';
        if (stageEl) stageEl.textContent = this.stages[this.currentStage];
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Advanced Audio Player with Waveform Visualization
class EnhancedAudioPlayer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 180;
        this.waveformData = this.generateWaveform();
    }

    generateWaveform() {
        return Array.from({length: 100}, () => Math.random() * 0.8 + 0.2);
    }

    render(song) {
        this.container.innerHTML = `
            <div class="enhanced-audio-player bg-gray-800 p-6 rounded-lg">
                <h3 class="text-xl font-bold text-green-300 mb-4">${song.title}</h3>
                
                <div class="waveform-container mb-4 h-24 bg-gray-900 rounded flex items-end justify-center gap-1 p-2">
                    ${this.waveformData.map((height, i) => `
                        <div class="waveform-bar bg-gradient-to-t from-green-500 via-orange-500 to-red-500 rounded-sm cursor-pointer hover:opacity-80 transition-all"
                             style="height: ${height * 80}%; width: 3px;"
                             onclick="audioPlayer.seekTo(${i / this.waveformData.length})"></div>
                    `).join('')}
                </div>
                
                <div class="controls flex items-center justify-between mb-4">
                    <button onclick="audioPlayer.togglePlay()" class="play-btn bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-all">
                        ${this.isPlaying ? '⏸️ Pause' : '▶️ Play'}
                    </button>
                    
                    <div class="time-display text-green-300">
                        <span id="currentTime">${this.formatTime(this.currentTime)}</span> / 
                        <span id="duration">${this.formatTime(this.duration)}</span>
                    </div>
                    
                    <div class="volume-control flex items-center gap-2">
                        <span class="text-green-300">🔊</span>
                        <input type="range" min="0" max="100" value="75" class="volume-slider">
                    </div>
                </div>
                
                <div class="progress-bar bg-gray-700 h-2 rounded-full overflow-hidden cursor-pointer" onclick="audioPlayer.seekToProgress(event)">
                    <div class="progress-fill bg-gradient-to-r from-green-500 to-orange-500 h-full transition-all" 
                         style="width: ${(this.currentTime / this.duration) * 100}%"></div>
                </div>
                
                <div class="song-info mt-4 text-sm text-gray-400">
                    <p><strong>Genre:</strong> ${song.genre} | <strong>Mood:</strong> ${song.mood} | <strong>Tempo:</strong> ${song.tempo} BPM</p>
                </div>
            </div>
        `;
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        const playBtn = this.container.querySelector('.play-btn');
        playBtn.textContent = this.isPlaying ? '⏸️ Pause' : '▶️ Play';
        
        if (this.isPlaying) {
            this.startPlayback();
        }
    }

    startPlayback() {
        if (!this.isPlaying) return;
        
        this.currentTime += 0.1;
        if (this.currentTime >= this.duration) {
            this.currentTime = 0;
            this.isPlaying = false;
        }
        
        this.updateDisplay();
        
        if (this.isPlaying) {
            setTimeout(() => this.startPlayback(), 100);
        }
    }

    updateDisplay() {
        const currentTimeEl = document.getElementById('currentTime');
        const progressFill = this.container.querySelector('.progress-fill');
        
        if (currentTimeEl) currentTimeEl.textContent = this.formatTime(this.currentTime);
        if (progressFill) progressFill.style.width = (this.currentTime / this.duration) * 100 + '%';
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    seekTo(percentage) {
        this.currentTime = this.duration * percentage;
        this.updateDisplay();
    }

    seekToProgress(event) {
        const rect = event.target.getBoundingClientRect();
        const percentage = (event.clientX - rect.left) / rect.width;
        this.seekTo(percentage);
    }
}

// Professional Voice Synthesis Interface
class VoiceSynthesisInterface {
    constructor() {
        this.voiceTypes = ['Male Pop', 'Female Pop', 'Rap', 'R&B', 'Rock', 'Jazz', 'Electronic'];
        this.genres = ['Pop', 'Rock', 'Jazz', 'Electronic', 'Classical', 'Hip-Hop', 'Country', 'R&B'];
        this.clonedVoices = [];
    }

    render() {
        return `
            <div class="voice-synthesis-panel bg-gray-800 p-6 rounded-lg">
                <h3 class="text-xl font-bold text-green-300 mb-4 flex items-center gap-2">
                    🎤 Professional Voice Synthesis
                </h3>
                
                <div class="tabs mb-6">
                    <div class="tab-buttons flex bg-gray-900 rounded-lg p-1 mb-4">
                        <button onclick="showTab('synthesis')" class="tab-btn active flex-1 py-2 px-4 rounded text-green-300 font-semibold">
                            Voice Synthesis
                        </button>
                        <button onclick="showTab('cloning')" class="tab-btn flex-1 py-2 px-4 rounded text-green-300 font-semibold">
                            Voice Cloning
                        </button>
                    </div>
                    
                    <div id="synthesis-tab" class="tab-content">
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-green-300 mb-2">Voice Type</label>
                                <select class="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white">
                                    ${this.voiceTypes.map(voice => `<option value="${voice.toLowerCase()}">${voice}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-green-300 mb-2">Genre Style</label>
                                <select class="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white">
                                    ${this.genres.map(genre => `<option value="${genre.toLowerCase()}">${genre}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div id="cloning-tab" class="tab-content hidden">
                        <div class="voice-clone-interface">
                            <div class="upload-section mb-6">
                                <label class="block text-green-300 mb-2">Upload Voice Sample</label>
                                <div class="upload-area border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-green-500 transition-all cursor-pointer"
                                     onclick="document.getElementById('voiceUpload').click()">
                                    <input type="file" id="voiceUpload" accept="audio/*" class="hidden" onchange="handleVoiceUpload(event)">
                                    <div class="text-4xl mb-2">🎤</div>
                                    <p class="text-lg text-green-300">Drop voice sample here or click to upload</p>
                                    <p class="text-sm text-gray-400">Supports MP3, WAV, M4A (15-60 seconds recommended)</p>
                                </div>
                            </div>
                            
                            <div id="cloning-progress" class="hidden mb-6">
                                <div class="flex justify-between text-sm text-gray-400 mb-2">
                                    <span id="voiceCloneStage">Initializing...</span>
                                    <span id="cloneProgressPercent">0%</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-3">
                                    <div id="voiceCloneProgress" class="bg-gradient-to-r from-green-500 to-orange-500 h-full rounded-full transition-all" style="width: 0%"></div>
                                </div>
                            </div>
                            
                            <div id="clone-results" class="hidden">
                                <h4 class="text-lg font-bold text-green-300 mb-3">Voice Analysis Results</h4>
                                <div class="results-grid grid grid-cols-2 gap-4 mb-4">
                                    <div class="bg-gray-700 p-4 rounded">
                                        <h5 class="font-semibold text-green-300">Compatibility Score</h5>
                                        <div class="text-2xl font-bold text-orange-500" id="compatibilityScore">--</div>
                                    </div>
                                    <div class="bg-gray-700 p-4 rounded">
                                        <h5 class="font-semibold text-green-300">Voice Quality</h5>
                                        <div class="text-lg text-green-400" id="voiceQuality">Analyzing...</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Enhanced Music Generation with Sassy AI
class SassyAI {
    constructor() {
        this.messages = [
            "Oh look, another 'producer' who thinks they're the next Kanye... 🙄",
            "These lyrics are so basic, even my grandmother could do better",
            "Voice cloning at 85% compatibility? Not bad for a beginner 🎤",
            "Finally, someone who knows what they're doing with that voice sample",
            "This beat is fire! Maybe you're not completely hopeless after all 🔥"
        ];
        this.currentMessages = [this.messages[0]];
    }

    addRoast() {
        const randomMessage = this.messages[Math.floor(Math.random() * this.messages.length)];
        this.currentMessages.push(randomMessage);
        this.render();
    }

    render() {
        const container = document.getElementById('sassy-ai');
        if (!container) return;

        container.innerHTML = `
            <div class="sassy-ai bg-gray-800 p-4 rounded-lg border border-green-500/30">
                <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
                    <span class="animate-pulse">🤖</span>
                    <span class="bg-gradient-to-r from-red-400 via-orange-400 to-green-400 bg-clip-text text-transparent">AI ROAST MASTER</span>
                    <span class="animate-pulse">🔥</span>
                </h3>
                
                <div class="messages max-h-64 overflow-y-auto space-y-2 mb-4">
                    ${this.currentMessages.map(msg => `
                        <div class="message bg-gradient-to-r from-red-900/40 via-black/60 to-green-900/40 border border-green-500/20 rounded p-3">
                            <p class="text-green-100 text-sm italic">${msg}</p>
                        </div>
                    `).join('')}
                </div>
                
                <button onclick="sassyAI.addRoast()" class="w-full bg-gradient-to-r from-red-500 via-orange-500 to-green-500 hover:from-red-600 hover:via-orange-600 hover:to-green-600 text-white font-semibold py-2 px-4 rounded transition-all">
                    Roast Me Again 🔥💀
                </button>
            </div>
        `;
    }
}

// Global instances
const voiceCloner = new EnhancedVoiceCloner();
const audioPlayer = new EnhancedAudioPlayer('audio-player-container');
const voiceSynthesis = new VoiceSynthesisInterface();
const sassyAI = new SassyAI();

// Global functions
window.showTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active', 'bg-green-500/30'));
    
    document.getElementById(tabName + '-tab').classList.remove('hidden');
    event.target.classList.add('active', 'bg-green-500/30');
};

window.handleVoiceUpload = async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const progressContainer = document.getElementById('cloning-progress');
    const resultsContainer = document.getElementById('clone-results');
    
    progressContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');

    const results = await voiceCloner.processVoice(file);
    
    // Show results
    progressContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    
    document.getElementById('compatibilityScore').textContent = Math.round(results.compatibilityScore * 100) + '%';
    document.getElementById('voiceQuality').textContent = results.compatibilityScore > 0.8 ? 'Excellent' : 'Good';
    
    // Add to sassy AI
    sassyAI.currentMessages.push(`Voice cloned with ${Math.round(results.compatibilityScore * 100)}% compatibility! Now THAT'S what I call professional 🎤`);
    sassyAI.render();
};

// Complete Interactive Platform Implementation
function initializeCompleteInterface() {
    const root = document.getElementById('root');
    
    // Initialize state management
    window.appState = {
        isLoggedIn: false,
        isLogin: true,
        showPassword: false,
        showConfirmPassword: false,
        loginForm: { email: "", password: "" },
        registerForm: { username: "", email: "", password: "", confirmPassword: "" },
        lyrics: "",
        isGenerating: false,
        tempo: 120,
        duration: 180,
        isPlaying: false,
        isSimpleMode: true,
        totalFileSize: 0,
        exportFormat: "mp3",
        draggedFiles: [],
        isDragOver: false,
        showMixer: false,
        showAI: true,
        aiMessages: ["Oh look, another 'producer' who thinks they're the next Kanye... 🙄"],
        stems: {
            vocals: { volume: 75, muted: false },
            drums: { volume: 80, muted: false },
            bass: { volume: 70, muted: false },
            melody: { volume: 85, muted: false }
        },
        selectedLogo: "/logos/demon-logo.jpeg",
        showLogoSelector: false
    };

    // Render login/register screen initially
    renderLoginScreen();
    
    console.log('🎵 Complete Burnt Beats Interactive Platform Ready!');
}

function renderLoginScreen() {
    const root = document.getElementById('root');
    
    root.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 flex items-center justify-center p-4">
            <div class="w-full max-w-md bg-black/80 backdrop-blur-sm border border-green-500/30 shadow-2xl shadow-green-500/20 rounded-lg">
                <div class="text-center p-6">
                    <div class="flex items-center justify-center gap-3 mb-4">
                        <div class="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/50">
                            <img src="${window.appState.selectedLogo}" alt="Burnt Beats Logo" class="w-full h-full object-cover rounded-lg">
                        </div>
                        <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-green-400 bg-clip-text text-transparent">
                            Burnt Beats
                        </h1>
                    </div>
                    <p class="text-green-300/80">Create fire tracks with AI</p>
                </div>
                
                <div class="p-6">
                    <div class="grid grid-cols-2 gap-2 bg-black/60 border border-green-500/20 rounded-lg p-1 mb-6">
                        <button id="loginTab" onclick="switchToLogin()" class="py-2 px-4 rounded text-green-300 font-semibold ${window.appState.isLogin ? 'bg-green-500/30 text-white' : ''}">
                            Login
                        </button>
                        <button id="registerTab" onclick="switchToRegister()" class="py-2 px-4 rounded text-green-300 font-semibold ${!window.appState.isLogin ? 'bg-green-500/30 text-white' : ''}">
                            Sign Up
                        </button>
                    </div>
                    
                    <div id="authForm">
                        ${window.appState.isLogin ? renderLoginForm() : renderRegisterForm()}
                    </div>
                    
                    <div class="mt-6 text-center">
                        <p class="text-green-400/60 text-sm">
                            By signing up, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderLoginForm() {
    return `
        <form onsubmit="handleLogin(event)" class="space-y-4">
            <div>
                <label class="text-green-300 mb-2 block">Email</label>
                <input type="email" id="loginEmail" placeholder="Enter your email" required
                       class="w-full p-3 bg-black/60 border border-green-500/30 rounded text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:ring-green-400/20">
            </div>
            <div>
                <label class="text-green-300 mb-2 block">Password</label>
                <div class="relative">
                    <input type="${window.appState.showPassword ? 'text' : 'password'}" id="loginPassword" placeholder="Enter your password" required
                           class="w-full p-3 bg-black/60 border border-green-500/30 rounded text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:ring-green-400/20 pr-10">
                    <button type="button" onclick="togglePasswordVisibility()" 
                            class="absolute right-0 top-0 h-full px-3 text-green-400/60 hover:text-green-300">
                        ${window.appState.showPassword ? '👁️' : '🙈'}
                    </button>
                </div>
            </div>
            <button type="submit" 
                    class="w-full bg-gradient-to-r from-orange-500 via-red-500 to-green-500 hover:from-orange-600 hover:via-red-600 hover:to-green-600 text-white font-semibold py-3 px-4 rounded shadow-lg shadow-green-500/30">
                Login
            </button>
        </form>
    `;
}

function renderRegisterForm() {
    return `
        <form onsubmit="handleRegister(event)" class="space-y-4">
            <div>
                <label class="text-green-300 mb-2 block">Username</label>
                <input type="text" id="registerUsername" placeholder="Choose a username" required
                       class="w-full p-3 bg-black/60 border border-green-500/30 rounded text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:ring-green-400/20">
            </div>
            <div>
                <label class="text-green-300 mb-2 block">Email</label>
                <input type="email" id="registerEmail" placeholder="Enter your email" required
                       class="w-full p-3 bg-black/60 border border-green-500/30 rounded text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:ring-green-400/20">
            </div>
            <div>
                <label class="text-green-300 mb-2 block">Password</label>
                <div class="relative">
                    <input type="${window.appState.showPassword ? 'text' : 'password'}" id="registerPassword" placeholder="Create a password" required
                           class="w-full p-3 bg-black/60 border border-green-500/30 rounded text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:ring-green-400/20 pr-10">
                    <button type="button" onclick="togglePasswordVisibility()" 
                            class="absolute right-0 top-0 h-full px-3 text-green-400/60 hover:text-green-300">
                        ${window.appState.showPassword ? '👁️' : '🙈'}
                    </button>
                </div>
            </div>
            <div>
                <label class="text-green-300 mb-2 block">Confirm Password</label>
                <div class="relative">
                    <input type="${window.appState.showConfirmPassword ? 'text' : 'password'}" id="confirmPassword" placeholder="Confirm your password" required
                           class="w-full p-3 bg-black/60 border border-green-500/30 rounded text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:ring-green-400/20 pr-10">
                    <button type="button" onclick="toggleConfirmPasswordVisibility()" 
                            class="absolute right-0 top-0 h-full px-3 text-green-400/60 hover:text-green-300">
                        ${window.appState.showConfirmPassword ? '👁️' : '🙈'}
                    </button>
                </div>
            </div>
            <button type="submit" 
                    class="w-full bg-gradient-to-r from-orange-500 via-red-500 to-green-500 hover:from-orange-600 hover:via-red-600 hover:to-green-600 text-white font-semibold py-3 px-4 rounded shadow-lg shadow-green-500/30">
                Create Account
            </button>
        </form>
    `;
}

function renderMainInterface() {
    const root = document.getElementById('root');
    
    root.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900">
            <div class="container mx-auto px-4 py-8">
                <!-- Header -->
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <div class="w-10 h-10 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-green-400 hover:shadow-lg hover:shadow-green-400/50 transition-all"
                                 onclick="toggleLogoSelector()">
                                <img src="${window.appState.selectedLogo}" alt="Burnt Beats Logo" class="w-full h-full object-cover rounded-lg">
                            </div>
                            <div id="logoSelector" class="hidden absolute top-12 left-0 bg-black/90 backdrop-blur-sm border border-green-500/30 rounded-lg p-4 z-50 min-w-[300px] shadow-2xl shadow-green-500/20">
                                <h3 class="text-green-300 font-semibold mb-3">Choose Your Logo</h3>
                                <div class="grid grid-cols-3 gap-3">
                                    <!-- Logo options will be populated here -->
                                </div>
                            </div>
                        </div>
                        <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-green-400 bg-clip-text text-transparent">
                            Burnt Beats
                        </h1>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="text-green-300/80 text-sm">
                            Total: <span class="font-bold text-green-400">${window.appState.totalFileSize.toFixed(1)} MB</span>
                        </div>
                        <button class="text-green-300 border border-green-500/30 bg-black/40 hover:bg-green-500/10 hover:border-green-400 px-4 py-2 rounded">
                            📤 Share
                        </button>
                        <button class="text-green-300 border border-green-500/30 bg-black/40 hover:bg-green-500/10 hover:border-green-400 px-4 py-2 rounded">
                            ❤️ Save
                        </button>
                        <button onclick="logout()" class="text-green-300 border border-green-500/30 bg-black/40 hover:bg-green-500/10 hover:border-green-400 px-4 py-2 rounded">
                            Logout
                        </button>
                    </div>
                </div>

                <!-- Simple/Custom Mode Toggle -->
                <div class="flex items-center justify-end mb-4">
                    <label class="text-green-300 mr-2">Simple Mode</label>
                    <input type="checkbox" ${window.appState.isSimpleMode ? 'checked' : ''} onchange="toggleSimpleMode()" 
                           class="toggle-switch">
                </div>

                <div class="grid lg:grid-cols-3 gap-8">
                    <!-- Main Input Section -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Sassy AI Assistant -->
                        <div class="bg-black/80 backdrop-blur-sm border border-green-500/30 shadow-2xl shadow-green-500/20 rounded-lg">
                            <div class="p-6">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="text-green-300 flex items-center gap-2 text-lg">
                                        <span class="animate-pulse">🤖</span>
                                        <span class="bg-gradient-to-r from-red-400 via-orange-400 to-green-400 bg-clip-text text-transparent">
                                            AI ROAST MASTER
                                        </span>
                                        <span class="animate-pulse">🔥</span>
                                    </h3>
                                    <button onclick="toggleAI()" class="text-green-300 hover:text-green-100 text-sm">
                                        ${window.appState.showAI ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <div id="aiMessages" class="${window.appState.showAI ? '' : 'hidden'}">
                                    <div class="space-y-3 max-h-96 overflow-y-auto">
                                        ${window.appState.aiMessages.map(message => `
                                            <div class="bg-gradient-to-r from-red-900/40 via-black/60 to-green-900/40 border border-green-500/20 rounded-lg p-3 shadow-lg">
                                                <p class="text-green-100 text-sm italic">${message}</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                    <button onclick="addSassyComment()" 
                                            class="w-full mt-4 bg-gradient-to-r from-red-500 via-orange-500 to-green-500 hover:from-red-600 hover:via-orange-600 hover:to-green-600 text-white font-semibold py-2 px-4 rounded shadow-lg shadow-green-500/30">
                                        Roast Me Again 🔥💀
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Song Creation Form -->
                        <div class="bg-black/80 backdrop-blur-sm border border-green-500/30 shadow-xl shadow-green-500/10 rounded-lg">
                            <div class="p-6">
                                <h3 class="text-green-300 flex items-center gap-2 text-lg mb-6">
                                    🎤 Create Your Fire Track
                                </h3>
                                
                                <div class="grid grid-cols-2 gap-2 bg-black/60 border border-green-500/20 rounded-lg p-1 mb-6">
                                    <button id="lyricsTab" onclick="switchToLyrics()" class="py-2 px-4 rounded text-green-300 font-semibold bg-green-500/30 text-white">
                                        Write Lyrics
                                    </button>
                                    <button id="descriptionTab" onclick="switchToDescription()" class="py-2 px-4 rounded text-green-300 font-semibold">
                                        Describe Song
                                    </button>
                                </div>
                                
                                <div id="lyricsContent" class="space-y-4">
                                    <div>
                                        <label class="text-green-300 mb-2 block">Song Lyrics</label>
                                        <textarea id="lyrics" placeholder="Enter your fire lyrics here...

[Verse 1]
Burning up the night with these beats so hot
Every single bar hits like a lightning shot
...

[Chorus]
These burnt beats got me feeling alive
..." 
                                                  class="w-full min-h-[200px] p-3 bg-black/60 border border-green-500/30 rounded text-green-100 placeholder:text-green-400/60 resize-none focus:border-green-400 focus:ring-green-400/20">${window.appState.lyrics}</textarea>
                                    </div>
                                </div>
                                
                                <div id="descriptionContent" class="space-y-4 hidden">
                                    <div>
                                        <label class="text-green-300 mb-2 block">Song Description</label>
                                        <textarea placeholder="Describe the fire track you want to create...

Example: 'A hard-hitting hip-hop track with heavy bass and aggressive vocals about overcoming challenges'"
                                                  class="w-full min-h-[200px] p-3 bg-black/60 border border-green-500/30 rounded text-green-100 placeholder:text-green-400/60 resize-none focus:border-green-400 focus:ring-green-400/20"></textarea>
                                    </div>
                                </div>
                                
                                <div class="grid md:grid-cols-2 gap-4 mt-6">
                                    <div>
                                        <label class="text-green-300 mb-2 block">Track Title</label>
                                        <input type="text" placeholder="Enter track title..." 
                                               class="w-full p-3 bg-black/60 border border-green-500/30 rounded text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:ring-green-400/20">
                                    </div>
                                    <div>
                                        <label class="text-green-300 mb-2 block">Artist Name</label>
                                        <input type="text" placeholder="Enter artist name..." 
                                               class="w-full p-3 bg-black/60 border border-green-500/30 rounded text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:ring-green-400/20">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Track Editor with Drag & Drop -->
                        <div class="bg-black/80 backdrop-blur-sm border border-green-500/30 shadow-xl shadow-green-500/10 rounded-lg">
                            <div class="p-6">
                                <h3 class="text-green-300 text-lg mb-4">Track Editor</h3>
                                <div id="dropZone" class="border-2 border-dashed border-green-500/30 hover:border-green-400/50 rounded-lg p-8 text-center transition-all"
                                     ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event)">
                                    <div class="text-green-400/60 mb-4">
                                        <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                        <p class="text-lg text-green-300">Drop your tracks here to edit</p>
                                        <p class="text-sm">Supports MP3, WAV, FLAC, and more</p>
                                    </div>
                                    <div id="droppedFiles" class="space-y-2"></div>
                                </div>
                                
                                <!-- Waveform Visualization -->
                                <div class="mt-6">
                                    <label class="text-green-300 mb-2 block">Waveform Preview</label>
                                    <div class="bg-black/80 border border-green-500/20 rounded-lg p-4 h-24 flex items-end justify-center gap-1">
                                        ${Array.from({ length: 50 }, (_, i) => `
                                            <div class="bg-gradient-to-t from-green-500 via-orange-500 to-red-500 rounded-sm shadow-sm shadow-green-500/30"
                                                 style="height: ${Math.random() * 80 + 10}%; width: 3px; opacity: ${0.7 + Math.random() * 0.3};"></div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Voice Synthesis -->
                        <div class="bg-black/80 backdrop-blur-sm border border-green-500/30 shadow-xl shadow-green-500/10 rounded-lg">
                            <div class="p-6">
                                <h3 class="text-green-300 text-lg mb-4">Voice Synthesis</h3>
                                <div class="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label class="text-green-300 mb-2 block">Voice Type</label>
                                        <select class="w-full p-3 bg-black/60 border border-green-500/30 rounded text-green-100 focus:border-green-400 focus:ring-green-400/20">
                                            <option value="">Select voice type</option>
                                            <option value="male-vocalist">Male Vocalist</option>
                                            <option value="female-vocalist">Female Vocalist</option>
                                            <option value="child-voice">Child Voice</option>
                                            <option value="elderly-voice">Elderly Voice</option>
                                            <option value="robotic">Robotic</option>
                                            <option value="whisper">Whisper</option>
                                            <option value="powerful">Powerful</option>
                                            <option value="soft">Soft</option>
                                            <option value="raspy">Raspy</option>
                                            <option value="smooth">Smooth</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="text-green-300 mb-2 block">Voice Clone</label>
                                        <button class="w-full text-green-300 border border-green-500/30 bg-black/40 hover:bg-green-500/10 hover:border-green-400 px-4 py-3 rounded">
                                            🎤 Upload Voice Sample
                                        </button>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <label class="text-green-300">Enable Voice Cloning</label>
                                    <input type="checkbox" class="toggle-switch">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Controls Panel -->
                    <div class="space-y-6">
                        <!-- Beat Parameters -->
                        <div class="bg-black/80 backdrop-blur-sm border border-green-500/30 shadow-xl shadow-green-500/10 rounded-lg">
                            <div class="p-6">
                                <h3 class="text-green-300 text-lg mb-4">Beat Parameters</h3>
                                <div class="space-y-6">
                                    <div>
                                        <label class="text-green-300 mb-2 block">Export Format</label>
                                        <select id="exportFormat" onchange="updateExportFormat()" class="w-full p-3 bg-black/60 border border-green-500/30 rounded text-green-100 focus:border-green-400 focus:ring-green-400/20">
                                            <option value="mp3" ${window.appState.exportFormat === 'mp3' ? 'selected' : ''}>MP3 (Smaller file)</option>
                                            <option value="wav" ${window.appState.exportFormat === 'wav' ? 'selected' : ''}>WAV (High quality)</option>
                                            <option value="flac" ${window.appState.exportFormat === 'flac' ? 'selected' : ''}>FLAC (Lossless)</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label class="text-green-300 mb-2 block">Genre</label>
                                        <select class="w-full p-3 bg-black/60 border border-green-500/30 rounded text-green-100 focus:border-green-400 focus:ring-green-400/20">
                                            <option value="">Select genre</option>
                                            <option value="pop">Pop</option>
                                            <option value="rock">Rock</option>
                                            <option value="hip-hop">Hip Hop</option>
                                            <option value="electronic">Electronic</option>
                                            <option value="jazz">Jazz</option>
                                            <option value="classical">Classical</option>
                                            <option value="country">Country</option>
                                            <option value="rb">R&B</option>
                                            <option value="reggae">Reggae</option>
                                            <option value="blues">Blues</option>
                                            <option value="folk">Folk</option>
                                            <option value="punk">Punk</option>
                                            <option value="metal">Metal</option>
                                            <option value="indie">Indie</option>
                                            <option value="alternative">Alternative</option>
                                            <option value="ambient">Ambient</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label class="text-green-300 mb-2 block">Mood</label>
                                        <select class="w-full p-3 bg-black/60 border border-green-500/30 rounded text-green-100 focus:border-green-400 focus:ring-green-400/20">
                                            <option value="">Select mood</option>
                                            <option value="happy">Happy</option>
                                            <option value="sad">Sad</option>
                                            <option value="energetic">Energetic</option>
                                            <option value="calm">Calm</option>
                                            <option value="romantic">Romantic</option>
                                            <option value="aggressive">Aggressive</option>
                                            <option value="mysterious">Mysterious</option>
                                            <option value="uplifting">Uplifting</option>
                                            <option value="melancholic">Melancholic</option>
                                            <option value="dreamy">Dreamy</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label class="text-green-300 mb-3 block">
                                            Tempo: <span class="text-green-400" id="tempoValue">${window.appState.tempo} BPM</span>
                                        </label>
                                        <input type="range" id="tempoSlider" min="60" max="200" value="${window.appState.tempo}" 
                                               oninput="updateTempo(this.value)" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer">
                                    </div>
                                    
                                    <div>
                                        <label class="text-green-300 mb-3 block">
                                            Duration: <span class="text-green-400" id="durationValue">${Math.floor(window.appState.duration / 60)}:${(window.appState.duration % 60).toString().padStart(2, '0')}</span>
                                        </label>
                                        <input type="range" id="durationSlider" min="30" max="600" step="15" value="${window.appState.duration}" 
                                               oninput="updateDuration(this.value)" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer">
                                    </div>
                                    
                                    <div class="space-y-3">
                                        <div class="flex items-center justify-between">
                                            <label class="text-green-300">Instrumental</label>
                                            <input type="checkbox" class="toggle-switch">
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <label class="text-green-300">Add Harmony</label>
                                            <input type="checkbox" class="toggle-switch">
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <label class="text-green-300">Auto-Tune</label>
                                            <input type="checkbox" class="toggle-switch">
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <label class="text-green-300">Stem Separation</label>
                                            <input type="checkbox" class="toggle-switch">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Advanced Mixer -->
                        <div class="bg-black/80 backdrop-blur-sm border border-green-500/30 shadow-xl shadow-green-500/10 rounded-lg">
                            <div class="p-6">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="text-green-300 text-lg">Advanced Mixer</h3>
                                    <button onclick="toggleMixer()" class="text-green-300 hover:text-green-100 text-sm">
                                        ${window.appState.showMixer ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <div id="mixerContent" class="${window.appState.showMixer ? '' : 'hidden'} space-y-4">
                                    ${Object.entries(window.appState.stems).map(([stem, settings]) => `
                                        <div class="space-y-2">
                                            <div class="flex items-center justify-between">
                                                <label class="text-green-300 capitalize">${stem}</label>
                                                <button onclick="toggleStemMute('${stem}')" class="text-xs ${settings.muted ? 'text-red-400' : 'text-green-400'}">
                                                    ${settings.muted ? 'MUTED' : 'ON'}
                                                </button>
                                            </div>
                                            <input type="range" min="0" max="100" value="${settings.volume}" 
                                                   ${settings.muted ? 'disabled' : ''} 
                                                   oninput="updateStemVolume('${stem}', this.value)"
                                                   class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer">
                                            <div class="text-xs text-green-400/60" id="${stem}Volume">${settings.volume}%</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Generate Button -->
                        <button onclick="handleGenerate()" ${window.appState.isGenerating ? 'disabled' : ''}
                                class="w-full h-12 bg-gradient-to-r from-orange-500 via-red-500 to-green-500 hover:from-orange-600 hover:via-red-600 hover:to-green-600 text-white font-semibold shadow-lg shadow-green-500/30 rounded ${window.appState.isGenerating ? 'opacity-50 cursor-not-allowed' : ''}">
                            ${window.appState.isGenerating ? 
                                '<div class="flex items-center justify-center"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Cooking Up Fire...</div>' : 
                                '🔥 Generate Fire Track'
                            }
                        </button>
                    </div>

                    <!-- Generated Results -->
                    <div class="bg-black/80 backdrop-blur-sm border border-green-500/30 shadow-xl shadow-green-500/10 rounded-lg">
                        <div class="p-6">
                            <h3 class="text-green-300 text-lg mb-4">Your Fire Tracks</h3>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between p-3 bg-black/60 border border-green-500/20 rounded-lg hover:border-green-400/40 transition-all">
                                    <div>
                                        <p class="text-green-100 font-medium">Burnt Nights</p>
                                        <p class="text-green-400/60 text-sm">${window.appState.exportFormat.toUpperCase()} • 4.2 MB • 3:24</p>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <button onclick="togglePlayback()" class="text-green-300 hover:text-green-100 hover:bg-green-500/10 p-1 rounded">
                                            ${window.appState.isPlaying ? '⏸️' : '▶️'}
                                        </button>
                                        <button class="text-green-300 hover:text-green-100 hover:bg-green-500/10 p-1 rounded">
                                            📥
                                        </button>
                                        <button class="text-green-300 hover:text-green-100 hover:bg-green-500/10 p-1 rounded">
                                            ⋯
                                        </button>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-black/60 border border-green-500/20 rounded-lg hover:border-green-400/40 transition-all">
                                    <div>
                                        <p class="text-green-100 font-medium">Fire Dreams</p>
                                        <p class="text-green-400/60 text-sm">${window.appState.exportFormat.toUpperCase()} • 5.8 MB • 4:12</p>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <button class="text-green-300 hover:text-green-100 hover:bg-green-500/10 p-1 rounded">▶️</button>
                                        <button class="text-green-300 hover:text-green-100 hover:bg-green-500/10 p-1 rounded">📥</button>
                                        <button class="text-green-300 hover:text-green-100 hover:bg-green-500/10 p-1 rounded">⋯</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Stats -->
                    <div class="bg-black/80 backdrop-blur-sm border border-green-500/30 shadow-xl shadow-green-500/10 rounded-lg">
                        <div class="p-6">
                            <h3 class="text-green-300 text-sm mb-4">Session Stats</h3>
                            <div class="space-y-2">
                                <div class="flex justify-between text-sm">
                                    <span class="text-green-400/60">Tracks Generated:</span>
                                    <span class="text-green-400">4</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-green-400/60">Total Duration:</span>
                                    <span class="text-green-400">14:32</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-green-400/60">Storage Used:</span>
                                    <span class="text-green-400">${window.appState.totalFileSize.toFixed(1)} MB</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-green-400/60">AI Roasts:</span>
                                    <span class="text-red-400">${window.appState.aiMessages.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Enhanced form submission
window.handleEnhancedSubmit = function(event) {
    event.preventDefault();
    
    const title = document.getElementById('title').value;
    const lyrics = document.getElementById('lyrics').value;
    const genre = document.getElementById('genre').value;
    const mood = document.getElementById('mood').value;
    
    // Add to sassy AI
    sassyAI.currentMessages.push(`"${title}" in ${genre}? Let's see if this actually slaps... 🎵`);
    sassyAI.render();
    
    // Simulate song generation
    setTimeout(() => {
        const song = { title, lyrics, genre, mood, tempo: 120 };
        audioPlayer.render(song);
        
        sassyAI.currentMessages.push(`Okay, that actually turned out pretty fire! 🔥 Ready for download.`);
        sassyAI.render();
    }, 3000);
};

// Interactive Functions for Complete Platform
window.switchToLogin = function() {
    window.appState.isLogin = true;
    document.getElementById('loginTab').classList.add('bg-green-500/30', 'text-white');
    document.getElementById('registerTab').classList.remove('bg-green-500/30', 'text-white');
    document.getElementById('authForm').innerHTML = renderLoginForm();
};

window.switchToRegister = function() {
    window.appState.isLogin = false;
    document.getElementById('loginTab').classList.remove('bg-green-500/30', 'text-white');
    document.getElementById('registerTab').classList.add('bg-green-500/30', 'text-white');
    document.getElementById('authForm').innerHTML = renderRegisterForm();
};

window.togglePasswordVisibility = function() {
    window.appState.showPassword = !window.appState.showPassword;
    renderLoginScreen();
};

window.toggleConfirmPasswordVisibility = function() {
    window.appState.showConfirmPassword = !window.appState.showConfirmPassword;
    renderLoginScreen();
};

window.handleLogin = function(event) {
    event.preventDefault();
    window.appState.isLoggedIn = true;
    renderMainInterface();
    sassyAI.currentMessages.push("Well, well, well... look who finally made it past the login screen! 🙄");
};

window.handleRegister = function(event) {
    event.preventDefault();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
    }
    
    window.appState.isLoggedIn = true;
    renderMainInterface();
    sassyAI.currentMessages.push("Fresh meat! Another wannabe producer joins the ranks... Let's see what you got! 🔥");
};

window.logout = function() {
    window.appState.isLoggedIn = false;
    renderLoginScreen();
};

window.toggleLogoSelector = function() {
    const selector = document.getElementById('logoSelector');
    selector.classList.toggle('hidden');
};

window.toggleSimpleMode = function() {
    window.appState.isSimpleMode = !window.appState.isSimpleMode;
};

window.toggleAI = function() {
    window.appState.showAI = !window.appState.showAI;
    const content = document.getElementById('aiMessages');
    content.classList.toggle('hidden');
    
    const button = event.target;
    button.textContent = window.appState.showAI ? 'Hide' : 'Show';
};

window.addSassyComment = function() {
    const sassyResponses = [
        "That beat is more basic than a pumpkin spice latte 🎃",
        "I've heard elevator music with more soul than this...",
        "Are you trying to make music or summon demons? Because this ain't it chief 😈",
        "Your lyrics are so fire... said no one ever 🔥❄️",
        "This track has less energy than a dead battery 🔋",
        "I'm not saying your music is bad, but my circuits are crying 🤖😭",
        "That melody is flatter than Earth according to conspiracy theorists 🌍",
        "Your tempo is slower than internet in 1995 📡",
        "This beat hits different... like a wet noodle 🍜",
        "I've analyzed 10 million songs, and this... this is definitely one of them 📊"
    ];
    
    const newMessage = sassyResponses[Math.floor(Math.random() * sassyResponses.length)];
    window.appState.aiMessages.push(newMessage);
    
    // Update the AI messages display
    const messagesContainer = document.getElementById('aiMessages').querySelector('.space-y-3');
    messagesContainer.innerHTML = window.appState.aiMessages.map(message => `
        <div class="bg-gradient-to-r from-red-900/40 via-black/60 to-green-900/40 border border-green-500/20 rounded-lg p-3 shadow-lg">
            <p class="text-green-100 text-sm italic">${message}</p>
        </div>
    `).join('');
};

window.switchToLyrics = function() {
    document.getElementById('lyricsTab').classList.add('bg-green-500/30', 'text-white');
    document.getElementById('descriptionTab').classList.remove('bg-green-500/30', 'text-white');
    document.getElementById('lyricsContent').classList.remove('hidden');
    document.getElementById('descriptionContent').classList.add('hidden');
};

window.switchToDescription = function() {
    document.getElementById('lyricsTab').classList.remove('bg-green-500/30', 'text-white');
    document.getElementById('descriptionTab').classList.add('bg-green-500/30', 'text-white');
    document.getElementById('lyricsContent').classList.add('hidden');
    document.getElementById('descriptionContent').classList.remove('hidden');
};

window.handleDragOver = function(event) {
    event.preventDefault();
    window.appState.isDragOver = true;
    document.getElementById('dropZone').classList.add('border-green-400', 'bg-green-500/10', 'shadow-lg', 'shadow-green-400/30');
};

window.handleDragLeave = function(event) {
    event.preventDefault();
    window.appState.isDragOver = false;
    document.getElementById('dropZone').classList.remove('border-green-400', 'bg-green-500/10', 'shadow-lg', 'shadow-green-400/30');
};

window.handleDrop = function(event) {
    event.preventDefault();
    window.appState.isDragOver = false;
    const files = Array.from(event.dataTransfer.files).map(file => file.name);
    window.appState.draggedFiles = [...window.appState.draggedFiles, ...files];
    
    document.getElementById('dropZone').classList.remove('border-green-400', 'bg-green-500/10', 'shadow-lg', 'shadow-green-400/30');
    
    // Update dropped files display
    const droppedFilesContainer = document.getElementById('droppedFiles');
    droppedFilesContainer.innerHTML = window.appState.draggedFiles.length > 0 ? `
        <p class="text-green-400 font-semibold">Loaded Files:</p>
        ${window.appState.draggedFiles.map(file => `
            <div class="bg-black/60 border border-green-500/20 rounded p-2 text-green-100 text-sm">${file}</div>
        `).join('')}
    ` : '';
    
    // Add sassy comment
    addSassyComment();
};

window.updateExportFormat = function() {
    window.appState.exportFormat = document.getElementById('exportFormat').value;
};

window.updateTempo = function(value) {
    window.appState.tempo = parseInt(value);
    document.getElementById('tempoValue').textContent = value + ' BPM';
};

window.updateDuration = function(value) {
    window.appState.duration = parseInt(value);
    const minutes = Math.floor(value / 60);
    const seconds = (value % 60).toString().padStart(2, '0');
    document.getElementById('durationValue').textContent = `${minutes}:${seconds}`;
};

window.toggleMixer = function() {
    window.appState.showMixer = !window.appState.showMixer;
    const content = document.getElementById('mixerContent');
    content.classList.toggle('hidden');
    
    const button = event.target;
    button.textContent = window.appState.showMixer ? 'Hide' : 'Show';
};

window.toggleStemMute = function(stem) {
    window.appState.stems[stem].muted = !window.appState.stems[stem].muted;
    
    // Re-render mixer content
    const mixerContent = document.getElementById('mixerContent');
    mixerContent.innerHTML = Object.entries(window.appState.stems).map(([stemName, settings]) => `
        <div class="space-y-2">
            <div class="flex items-center justify-between">
                <label class="text-green-300 capitalize">${stemName}</label>
                <button onclick="toggleStemMute('${stemName}')" class="text-xs ${settings.muted ? 'text-red-400' : 'text-green-400'}">
                    ${settings.muted ? 'MUTED' : 'ON'}
                </button>
            </div>
            <input type="range" min="0" max="100" value="${settings.volume}" 
                   ${settings.muted ? 'disabled' : ''} 
                   oninput="updateStemVolume('${stemName}', this.value)"
                   class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer">
            <div class="text-xs text-green-400/60" id="${stemName}Volume">${settings.volume}%</div>
        </div>
    `).join('');
};

window.updateStemVolume = function(stem, value) {
    window.appState.stems[stem].volume = parseInt(value);
    document.getElementById(stem + 'Volume').textContent = value + '%';
};

window.handleGenerate = function() {
    window.appState.isGenerating = true;
    
    // Update button state
    const generateBtn = event.target;
    generateBtn.disabled = true;
    generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
    generateBtn.innerHTML = '<div class="flex items-center justify-center"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Cooking Up Fire...</div>';
    
    // Add sassy comment about generation starting
    addSassyComment();
    
    setTimeout(() => {
        window.appState.isGenerating = false;
        
        // Simulate adding file size
        const newSize = Math.random() * 3 + 2;
        window.appState.totalFileSize += newSize;
        
        // Update button state
        generateBtn.disabled = false;
        generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        generateBtn.innerHTML = '🔥 Generate Fire Track';
        
        // Update total file size display
        document.querySelector('span.font-bold.text-green-400').textContent = window.appState.totalFileSize.toFixed(1) + ' MB';
        
        // Add completion comment
        window.appState.aiMessages.push("Alright, alright... that actually turned out pretty decent! Ready for download 🔥");
        addSassyComment();
    }, 3000);
};

window.togglePlayback = function() {
    window.appState.isPlaying = !window.appState.isPlaying;
    const button = event.target;
    button.textContent = window.appState.isPlaying ? '⏸️' : '▶️';
};

// Sassy AI Integration
const sassyAI = {
    currentMessages: ["Oh look, another 'producer' who thinks they're the next Kanye... 🙄"],
    addRoast() {
        addSassyComment();
    },
    render() {
        // This is handled by the main interface rendering
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCompleteInterface);
} else {
    initializeCompleteInterface();
}