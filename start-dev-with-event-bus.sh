#!/bin/bash

echo "🚀 Starting development environment with proper Module Federation setup"
echo ""

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "vite.*5007" 2>/dev/null
pkill -f "vite.*5004" 2>/dev/null
sleep 2

# Build and start interface-generator in preview mode (serves remoteEntry.js)
echo ""
echo "📦 Building interface-generator..."
cd packages/interface-generator
pnpm build

echo ""
echo "🎬 Starting interface-generator in preview mode (port 5007)..."
pnpm preview &
REMOTE_PID=$!
cd ../..

# Wait for remote to be ready
echo "⏳ Waiting for remote to be ready..."
sleep 3

# Verify remoteEntry.js is accessible
echo ""
echo "🔍 Verifying remoteEntry.js..."
if curl -s http://localhost:5007/assets/remoteEntry.js > /dev/null; then
    echo "✅ remoteEntry.js is accessible"
else
    echo "❌ remoteEntry.js is NOT accessible!"
    kill $REMOTE_PID
    exit 1
fi

# Start portfolio-home in dev mode
echo ""
echo "🏠 Starting portfolio-home in dev mode (port 5004)..."
cd packages/portfolio-home
pnpm start

echo ""
echo "✨ Development environment started!"
echo ""
echo "📍 URLs:"
echo "   - Portfolio Shell: http://localhost:5004"
echo "   - Interface Generator: http://localhost:5007"
echo ""
echo "🧪 Test Event Bus:"
echo "   1. Open http://localhost:5004"
echo "   2. Click 'Interface Generator' project"
echo "   3. Generate an interface"
echo "   4. Notification should appear in top-right corner"
echo ""
