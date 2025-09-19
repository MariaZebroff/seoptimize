#!/bin/bash

echo "🚀 Installing Chrome for REAL Lighthouse on Railway..."

# Check if we're running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script must be run as root (use sudo)"
    exit 1
fi

# Update package list
echo "📦 Updating package list..."
apt-get update -y

# Install essential dependencies first
echo "🔧 Installing essential dependencies..."
apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    ca-certificates \
    curl \
    lsb-release \
    software-properties-common

# Install Chrome dependencies with correct package names for Ubuntu 24.04
echo "🔧 Installing Chrome dependencies..."
apt-get install -y --no-install-recommends \
    fonts-liberation \
    libasound2t64 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc-s1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    libu2f-udev \
    libvulkan1

# Add Google Chrome repository with proper GPG key handling
echo "🔑 Adding Google Chrome repository..."
curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# Update package list again
echo "📦 Updating package list after adding Chrome repository..."
apt-get update -y

# Install Google Chrome
echo "🚀 Installing Google Chrome..."
apt-get install -y --no-install-recommends google-chrome-stable

# Verify installation
echo "🔍 Verifying Chrome installation..."
if [ -f "/usr/bin/google-chrome-stable" ]; then
    echo "✅ Chrome installed successfully at /usr/bin/google-chrome-stable"
    /usr/bin/google-chrome-stable --version
    echo "✅ Chrome version check completed"
else
    echo "❌ Chrome installation failed - binary not found"
    echo "🔍 Checking what was installed..."
    find /usr -name "*chrome*" -type f 2>/dev/null | head -10
    exit 1
fi

# Create a symlink for easier access
echo "🔗 Creating symlink for easier access..."
ln -sf /usr/bin/google-chrome-stable /usr/bin/chrome 2>/dev/null || true
ln -sf /usr/bin/google-chrome-stable /usr/bin/google-chrome 2>/dev/null || true

# Test Chrome launch
echo "🧪 Testing Chrome launch..."
if /usr/bin/google-chrome-stable --headless --no-sandbox --disable-gpu --version >/dev/null 2>&1; then
    echo "✅ Chrome test launch successful"
else
    echo "⚠️ Chrome test launch failed, but binary exists"
fi

# Clean up to reduce image size
echo "🧹 Cleaning up..."
apt-get clean
rm -rf /var/lib/apt/lists/*

echo "🎉 Chrome installation completed! Ready for REAL Lighthouse!"
echo "📍 Chrome location: /usr/bin/google-chrome-stable"
echo "🔗 Symlinks created: /usr/bin/chrome, /usr/bin/google-chrome"