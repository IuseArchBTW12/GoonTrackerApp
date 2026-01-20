#!/bin/bash

# GoonTracker Development Startup Script
# This script starts both Convex and Next.js dev servers

echo "🚀 Starting GoonTracker Development Environment..."
echo ""

# Check if .env.local exists and has Clerk keys
if grep -q "your_publishable_key_here" .env.local 2>/dev/null; then
    echo "⚠️  WARNING: Clerk keys not configured in .env.local"
    echo "   Get your keys from: https://dashboard.clerk.com"
    echo ""
fi

# Start Convex in background
echo "📊 Starting Convex backend..."
npx convex dev &
CONVEX_PID=$!

# Wait a moment for Convex to initialize
sleep 3

# Start Next.js
echo "⚡ Starting Next.js frontend..."
echo ""
npm run dev

# Cleanup on exit
trap "kill $CONVEX_PID 2>/dev/null" EXIT
