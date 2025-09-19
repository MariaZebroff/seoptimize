#!/bin/bash

echo "🚀 Installing Chrome for REAL Lighthouse on Railway..."

# Update package list
apt-get update

# Install Chrome dependencies
apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
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
    lsb-release \
    xdg-utils

# Add Google Chrome repository
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# Update package list again
apt-get update

# Install Google Chrome
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

echo "🎉 Chrome installation completed! Ready for REAL Lighthouse!"