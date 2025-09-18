#!/bin/bash

echo "🚀 Installing Chrome for Railway (optimized)..."

# Update package list (faster with --no-install-recommends)
apt-get update

# Install Chrome dependencies
apt-get install -y --no-install-recommends wget gnupg ca-certificates

# Add Google Chrome repository
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# Update package list again
apt-get update

# Install Google Chrome with minimal dependencies
apt-get install -y --no-install-recommends google-chrome-stable

# Verify installation
if [ -f "/usr/bin/google-chrome-stable" ]; then
    echo "✅ Chrome installed successfully at /usr/bin/google-chrome-stable"
    /usr/bin/google-chrome-stable --version
else
    echo "❌ Chrome installation failed"
    exit 1
fi

# Clean up to reduce image size
apt-get clean
rm -rf /var/lib/apt/lists/*

echo "🎉 Chrome installation completed!"
