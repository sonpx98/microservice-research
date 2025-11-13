#!/bin/bash

# Start Multi-Zone Development
# Runs both blog-shell and keystatic-admin concurrently

echo "🚀 Starting Multi-Zone Development..."
echo ""
echo "Zone 1: Blog Shell (http://localhost:5006)"
echo "Zone 2: Keystatic Admin (http://localhost:5007)"
echo ""
echo "Access:"
echo "  - Blog: http://localhost:5006"
echo "  - Keystatic CMS: http://localhost:5006/keystatic (proxied to :5007)"
echo ""

# Go to root
cd "$(dirname "$0")/.."

# Install dependencies if needed
if [ ! -d "packages/keystatic-admin/node_modules" ]; then
  echo "📦 Installing dependencies for keystatic-admin..."
  pnpm install --filter @microservice-research/keystatic-admin
fi

# Start both zones
echo "🎬 Starting both zones..."
pnpm --filter @microservice-research/blog-shell dev &
BLOG_PID=$!

pnpm --filter @microservice-research/keystatic-admin dev &
ADMIN_PID=$!

echo ""
echo "✅ Both zones started!"
echo "   Blog PID: $BLOG_PID"
echo "   Admin PID: $ADMIN_PID"
echo ""
echo "Press Ctrl+C to stop both zones..."

# Wait for both processes
wait $BLOG_PID $ADMIN_PID
