#!/bin/bash

echo "🚀 Installing Chromium for Railway (faster alternative)..."

# Update package list
apt-get update

# Install Chromium (faster than Chrome)
apt-get install -y --no-install-recommends chromium-browser

# Verify installation
if [ -f "/usr/bin/chromium-browser" ]; then
    echo "✅ Chromium installed successfully at /usr/bin/chromium-browser"
    /usr/bin/chromium-browser --version
else
    echo "❌ Chromium installation failed"
    exit 1
fi

# Clean up to reduce image size
apt-get clean
rm -rf /var/lib/apt/lists/*

echo "🎉 Chromium installation completed!"
