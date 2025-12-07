#!/bin/bash

# Phleg Development Environment Setup & Test Runner

echo "🚀 Setting up Phleg development environment..."
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

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed or not in PATH"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    print_success "Node.js version $NODE_VERSION (>= $REQUIRED_VERSION required)"
else
    print_error "Node.js version $NODE_VERSION is too old. Required: >= $REQUIRED_VERSION"
    exit 1
fi

# Build all packages
print_status "Building all packages..."
if npm run build; then
    print_success "Packages built successfully"
else
    print_error "Build failed"
    exit 1
fi

# Link CLI for local testing
print_status "Linking CLI package..."
cd packages/cli
if npm link; then
    print_success "CLI linked successfully"
else
    print_error "CLI linking failed"
    exit 1
fi
cd ../..

# Run tests
print_status "Running tests..."
echo ""
if npm test; then
    print_success "All tests passed!"
else
    print_error "Tests failed"
    exit 1
fi

echo ""
echo "=================================================="
print_success "Development environment setup complete!"
echo ""

# Instructions for local testing
print_status "📋 Available commands:"
echo "  npm run dev:worker    - Start worker only"
echo "  npm run dev:cli       - Start CLI only"
echo "  npm test              - Run all tests"
echo "  phleg send <file>     - Test file upload"
echo "  phleg receive <code>  - Test file download"
echo ""

print_status "💡 For local testing with worker:"
echo "  1. Start worker: ${YELLOW}cd packages/worker && npm run dev${NC}"
echo "  2. Set environment: ${YELLOW}export PHLEG_ENDPOINT=http://localhost:8788${NC}"
echo "  3. Test upload: ${YELLOW}phleg send packages/cli/test.txt${NC}"
echo "  4. Test download: ${YELLOW}phleg receive <code-from-upload>${NC}"
echo ""

print_status "🧪 Quick test with local worker:"
echo "  Run: ${YELLOW}./test-local.sh${NC} (if available)"
echo ""

print_success "Ready for development! 🎉"