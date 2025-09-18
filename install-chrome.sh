#!/bin/bash

echo "🚀 Installing Chrome for Railway..."

# Update package list
apt-get update

# Install Chrome dependencies
apt-get install -y wget gnupg

# Add Google Chrome repository
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# Update package list again
apt-get update

# Install Google Chrome
apt-get install -y google-chrome-stable

# Verify installation
if [ -f "/usr/bin/google-chrome-stable" ]; then
    echo "✅ Chrome installed successfully at /usr/bin/google-chrome-stable"
    /usr/bin/google-chrome-stable --version
else
    echo "❌ Chrome installation failed"
    exit 1
fi

echo "🎉 Chrome installation completed!"
