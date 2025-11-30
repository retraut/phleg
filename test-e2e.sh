#!/bin/bash

# Quick test script for Phleg
set -e

echo "🧪 Testing Phleg CLI + Worker..."

# Start worker in background
echo "🚀 Starting worker..."
cd packages/worker
npm run dev &
WORKER_PID=$!
sleep 5

# Test CLI
echo "📤 Testing file upload..."
cd ../cli
echo "test content" > test.txt
npm run dev send test.txt > upload_result.txt
FILE_ID=$(cat upload_result.txt)

echo "📥 Testing file download..."
npm run dev receive $FILE_ID

# Cleanup
echo "🧹 Cleaning up..."
kill $WORKER_PID
rm test.txt upload_result.txt

echo "✅ All tests passed!"