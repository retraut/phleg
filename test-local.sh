#!/bin/bash

# Phleg Local Test Runner with Worker

echo "🧪 Starting Phleg local test environment..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}📦${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

# Cleanup function
cleanup() {
    if [ ! -z "$WORKER_PID" ]; then
        print_status "Stopping worker..."
        kill $WORKER_PID 2>/dev/null
        wait $WORKER_PID 2>/dev/null
    fi
    print_success "Cleanup complete"
}

# Set up cleanup on exit
trap cleanup EXIT

# Build all packages
print_status "Building all packages..."
if npm run build; then
    print_success "Packages built successfully"
else
    print_error "Build failed"
    exit 1
fi

# Start worker in background
print_status "Starting local worker..."
cd packages/worker
npm run dev &
WORKER_PID=$!
cd ../..

# Wait for worker to start
print_status "Waiting for worker to start..."
sleep 5

# Set environment for local worker
export PHLEG_ENDPOINT="http://localhost:8788"
print_success "Set PHLEG_ENDPOINT=http://localhost:8788"

# Run tests
print_status "Running tests against local worker..."
echo ""
if npm test; then
    print_success "All tests passed!"
else
    print_error "Tests failed"
    exit 1
fi

echo ""
echo "=================================================="
print_success "Local test environment complete!"
echo ""

# Keep running for manual testing
print_status "Worker is running in background on http://localhost:8788"
print_status "Press Ctrl+C to stop the worker and exit"
print_status ""
print_status "You can now test manually:"
echo "  export PHLEG_ENDPOINT=http://localhost:8788"
echo "  phleg send packages/cli/test.txt"
echo "  phleg receive <code-from-upload>"
echo ""

# Wait for user to stop
wait $WORKER_PID