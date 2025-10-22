#!/bin/bash

# Check if dev server is running
if lsof -Pi :4321 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Dev server is running on port 4321!"
    echo "Please stop it first (Ctrl+C) before running this script."
    exit 1
fi

echo "🧹 Cleaning all caches and build artifacts..."

# Remove caches safely
if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    echo "  ✓ Vite cache cleared"
fi

if [ -d ".astro" ]; then
    rm -rf .astro
    echo "  ✓ Astro cache cleared"
fi

if [ -d "dist" ]; then
    rm -rf dist
    echo "  ✓ Build output cleared"
fi

echo ""
echo "✅ All caches cleared successfully!"
echo ""
echo "💡 Additional steps:"
echo "1. Close your browser tabs for localhost:4321"
echo "2. Clear browser cache (Cmd+Shift+Delete / Ctrl+Shift+Delete)"
echo "3. Or open in incognito/private window"
echo ""
echo "Now run: yarn dev"
