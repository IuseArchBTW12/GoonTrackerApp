#!/bin/bash

# GoonTracker - Complete Development Environment Starter
# This script starts all necessary services

echo "🚀 Starting GoonTracker Development Environment"
echo "=============================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found!"
    echo "   Copy .env.local.example and add your keys"
    exit 1
fi

# Check for Clerk keys
if grep -q "your_publishable_key_here" .env.local 2>/dev/null || grep -q "pk_test_placeholder" .env.local 2>/dev/null; then
    echo "⚠️  Warning: Using placeholder Clerk keys"
    echo "   Get real keys from: https://dashboard.clerk.com"
    echo ""
fi

# Kill any existing processes on port 3000
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo ""
echo "📦 Starting services..."
echo ""

# Start Convex in background
echo "1️⃣  Starting Convex backend..."
npx convex dev > convex.log 2>&1 &
CONVEX_PID=$!
echo "   ✓ Convex running (PID: $CONVEX_PID)"

# Wait for Convex to initialize
sleep 5

# Start Next.js
echo ""
echo "2️⃣  Starting Next.js frontend..."
echo ""
npm run dev

# Cleanup on exit
trap "echo '\n\n🛑 Shutting down...'; kill $CONVEX_PID 2>/dev/null; echo '✓ Stopped Convex'; exit" INT TERM EXIT
