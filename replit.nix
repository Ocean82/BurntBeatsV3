
{ pkgs ? import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/nixos-24.05.tar.gz") {} }:

pkgs.mkShell {
  buildInputs = [
    # Core runtime environments
    pkgs.nodejs-20_x
    pkgs.python311
    pkgs.postgresql_15
    
    # Development tools
    pkgs.git
    pkgs.pkg-config
    
    # Audio processing libraries
    pkgs.alsa-lib
    pkgs.fluidsynth
    pkgs.libjack2
    pkgs.portmidi
    pkgs.ffmpeg
    
    # System libraries
    pkgs.glibcLocales
    pkgs.libxcrypt
    pkgs.xsimd
    
    # Python packages for audio/ML
    pkgs.python311Packages.numpy
    pkgs.python311Packages.pillow
    pkgs.python311Packages.setuptools
    pkgs.python311Packages.pip
    
    # Additional utilities
    pkgs.which
    pkgs.curl
    pkgs.unzip
  ];

  shellHook = ''
    echo "🎵 Burnt Beats Development Environment Ready!"
    echo "Node.js: $(node --version)"
    echo "Python: $(python --version)"
    echo "PostgreSQL available: $(which psql && echo "✓" || echo "✗")"
    echo ""
    echo "Available commands:"
    echo "  npm install    - Install Node.js dependencies"
    echo "  pip install -r requirements.txt - Install Python dependencies"
    echo "  npm run dev    - Start development server"
    echo "  npm run build  - Build for production"
    echo ""
    
    # Set environment variables
    export NODE_ENV=development
    export PYTHONPATH="$PWD:$PYTHONPATH"
    export PATH="$PWD/node_modules/.bin:$PATH"
  '';
}
