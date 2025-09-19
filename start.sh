#!/bin/bash

echo "🚀 Starting SEO Optimize application..."

# Check if required environment variables are set
echo "🔍 Checking environment variables..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "⚠️ NEXT_PUBLIC_SUPABASE_URL not set"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY not set"
fi

if [ -z "$ENABLE_LIGHTHOUSE" ]; then
    echo "⚠️ ENABLE_LIGHTHOUSE not set, defaulting to true"
    export ENABLE_LIGHTHOUSE=true
fi

# Check if Chrome/Chromium is available
echo "🔍 Checking Chrome/Chromium availability..."
if [ -f "/usr/bin/chromium-browser" ]; then
    echo "✅ Chromium found at /usr/bin/chromium-browser"
    /usr/bin/chromium-browser --version
elif [ -f "/usr/bin/google-chrome-stable" ]; then
    echo "✅ Chrome found at /usr/bin/google-chrome-stable"
    /usr/bin/google-chrome-stable --version
else
    echo "⚠️ No Chrome/Chromium found - Lighthouse may not work"
fi

# Start virtual display for Chrome (if available)
if command -v Xvfb &> /dev/null; then
    echo "🖥️ Starting virtual display for Chrome..."
    Xvfb :99 -screen 0 1024x768x24 -ac +extension GLX +render -noreset &
    export DISPLAY=:99
    echo "✅ Virtual display started on :99"
else
    echo "⚠️ Xvfb not available - Chrome may have issues in headless mode"
fi

# Start the application
echo "🚀 Starting Next.js application..."
exec npm start
