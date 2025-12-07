#!/bin/bash

# Phleg Quick Restart - Rebuild and restart dev environment after code changes

echo "🔄 Quick Restart - Rebuilding and restarting..."
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

# Check if dev-env is running
if pgrep -f "dev-env.sh" > /dev/null; then
    print_status "Stopping existing dev environment..."
    pkill -f "dev-env.sh"
    sleep 2
fi

# Kill any remaining worker processes
if pgrep -f "wrangler dev" > /dev/null; then
    print_status "Stopping worker processes..."
    pkill -f "wrangler dev"
    sleep 1
fi

# Build current code
print_status "Rebuilding current code..."
if npm run build; then
    print_success "Code rebuilt successfully"
else
    print_error "Build failed - check your code changes"
    exit 1
fi

# Quick test to verify build
print_status "Quick verification test..."
export PHLEG_ENDPOINT="http://localhost:8788"
echo "quick test" > quick-test.txt

if phleg send quick-test.txt > /dev/null 2>&1; then
    print_success "CLI is working"
    rm -f quick-test.txt quick-test-*.txt 2>/dev/null
else
    print_error "CLI test failed"
    exit 1
fi

print_success "Ready! You can now run ./dev-env.sh to test your changes"
echo ""
echo "💡 Or test manually:"
echo "  export PHLEG_ENDPOINT=http://localhost:8788"
echo "  phleg send <file>"
echo "  phleg receive <code>"