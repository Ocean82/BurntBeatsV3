#!/bin/bash
echo "Setting up AI models..."

# Navigate to RVC directory
cd Retrieval-based-Voice-Conversion-WebUI

# Make scripts executable
chmod +x tools/dlmodels.sh

# Download RVC models
echo "Downloading RVC models..."
python tools/download_models.py

# Alternative: Use shell script
# ./tools/dlmodels.sh

echo "RVC models setup complete!"