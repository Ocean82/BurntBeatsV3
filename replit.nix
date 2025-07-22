{ pkgs ? import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/nixos-23.05.tar.gz") {} }:

pkgs.mkShell {
		buildInputs = [
				pkgs.python310            # Python for backend processing, data manipulation, and AI libraries.
				pkgs.nodejs-20           # Node.js for the front-end or server-side handling (e.g., Express).
				pkgs.postgresql           # PostgreSQL as your database for user data and song storage.
				pkgs.git                  # For version control during development.
				pkgs.alsaLib              # Libraries for audio handling.
				pkgs.fluidsynth           # For synthesizing sound and music generation.
				pkgs.glibcLocales         # Ensures you have the right locale support.
				pkgs.libjack2             # For audio I/O capabilities.
				pkgs.libxcrypt            # For additional cryptographic functionality.
				pkgs.pkg-config           # Helps in configuration for other dependencies.
				pkgs.portmidi             # For MIDI input/output support.
				pkgs.xsimd                # For SIMD (Single Instruction, Multiple Data) support which can optimize performance for audio processing.
				pkgs.ffmpeg               # Added for audio and video handling (if needed for output).
				pkgs.numpy                # Useful for numerical operations, especially in audio processing.
				pkgs.pillow               # For handling image processing if you need to generate or manipulate album art.
		];

		shellHook = ''
				echo "Welcome to the Music App Dev Shell! 🎼"
				echo "Remember to activate your virtual environment for Python dependencies."
				echo "You can start the database with: pg_ctl -D /path/to/your/db start"
				echo "Have fun coding your next hit track! 🎵"
		'';
}