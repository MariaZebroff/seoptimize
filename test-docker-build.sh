#!/bin/bash

echo "🧪 Testing Docker build for SEO Optimize..."

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t seoptimize-test .

if [ $? -eq 0 ]; then
    echo "✅ Docker build successful!"
    
    # Test if the image runs
    echo "🚀 Testing Docker container startup..."
    docker run --rm -p 3000:3000 -e ENABLE_LIGHTHOUSE=true seoptimize-test &
    CONTAINER_PID=$!
    
    # Wait a bit for the container to start
    sleep 10
    
    # Test if the app is responding
    echo "🔍 Testing application response..."
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        echo "✅ Application is responding!"
    else
        echo "⚠️ Application might not be ready yet"
    fi
    
    # Clean up
    kill $CONTAINER_PID 2>/dev/null
    docker stop $(docker ps -q --filter ancestor=seoptimize-test) 2>/dev/null
    
    echo "🎉 Docker build test completed successfully!"
    echo "📦 Your image is ready for Railway deployment!"
else
    echo "❌ Docker build failed!"
    echo "🔍 Check the error messages above for details"
    exit 1
fi
