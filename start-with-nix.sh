
#!/bin/bash

# Load the Nix environment
source /etc/bashrc
export PATH="/nix/var/nix/profiles/default/bin:$PATH"

# Find Node.js in the Nix store
NODE_PATH=$(find /nix/store -name "node" -type f -executable 2>/dev/null | head -1)

if [ -z "$NODE_PATH" ]; then
    echo "❌ Node.js not found in Nix store"
    exit 1
fi

echo "✅ Using Node.js at: $NODE_PATH"

# Run the production deployment
$NODE_PATH deploy-production-fix.cjs && cd dist && $NODE_PATH index.js
