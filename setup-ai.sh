#!/bin/bash

echo "🤖 AI Features Setup Script"
echo "=========================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    touch .env.local
    echo "✅ Created .env.local file"
else
    echo "✅ .env.local file already exists"
fi

# Check if OPENAI_API_KEY is already set
if grep -q "OPENAI_API_KEY" .env.local; then
    echo "⚠️  OPENAI_API_KEY is already set in .env.local"
    echo "Current value:"
    grep "OPENAI_API_KEY" .env.local | head -1
    echo ""
    read -p "Do you want to update it? (y/n): " update_key
    if [ "$update_key" = "y" ] || [ "$update_key" = "Y" ]; then
        read -p "Enter your OpenAI API key: " api_key
        # Remove existing OPENAI_API_KEY lines and add new ones
        sed -i '' '/OPENAI_API_KEY/d' .env.local
        echo "OPENAI_API_KEY=$api_key" >> .env.local
        echo "NEXT_PUBLIC_OPENAI_API_KEY=$api_key" >> .env.local
        echo "✅ Updated both OPENAI_API_KEY and NEXT_PUBLIC_OPENAI_API_KEY"
    fi
else
    echo "🔑 OpenAI API Key Setup"
    echo "Get your API key from: https://platform.openai.com/"
    echo ""
    read -p "Enter your OpenAI API key: " api_key
    echo "OPENAI_API_KEY=$api_key" >> .env.local
    echo "NEXT_PUBLIC_OPENAI_API_KEY=$api_key" >> .env.local
    echo "✅ Added both OPENAI_API_KEY and NEXT_PUBLIC_OPENAI_API_KEY to .env.local"
fi

echo ""
echo "🚀 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Restart your development server: npm run dev"
echo "2. Go to /ai to test the AI features"
echo "3. Check the AI-SETUP-GUIDE.md for more details"
echo ""
echo "Your .env.local file now contains:"
echo "=================================="
cat .env.local
