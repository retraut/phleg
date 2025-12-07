#!/bin/bash

# Phleg Development Environment - Live Testing with Current Code

echo "🚀 Starting Phleg Live Development Environment..."
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

print_info() {
    echo -e "${YELLOW}💡${NC} $1"
}

# Cleanup function
cleanup() {
    echo ""
    print_status "Cleaning up..."
    if [ ! -z "$WORKER_PID" ]; then
        print_status "Stopping worker (PID: $WORKER_PID)..."
        kill $WORKER_PID 2>/dev/null
        wait $WORKER_PID 2>/dev/null
        print_success "Worker stopped"
    fi
    
    # Remove temporary files
    rm -f test-upload-*.txt test-download-*.txt 2>/dev/null
    
    print_success "Cleanup complete"
}

# Set up cleanup on exit
trap cleanup EXIT

# Build current code
print_status "Building current code..."
if npm run build; then
    print_success "Current code built successfully"
else
    print_error "Build failed - check your code"
    exit 1
fi

# Start worker with current code
print_status "Starting worker with current code..."
cd packages/worker

# Start worker and capture output to both terminal and log
{
    npm run dev 2>&1 | while IFS= read -r line; do
        echo "[WORKER] $line"
        # Check if worker is ready
        if echo "$line" | grep -q "Ready on http://"; then
            WORKER_URL=$(echo "$line" | grep -o "http://[^ ]*")
            echo ""
            print_success "Worker ready at: $WORKER_URL"
            echo ""
        fi
    done
} &

WORKER_PID=$!
cd ../..

# Wait for worker to start
print_status "Waiting for worker to start..."
sleep 8

# Set environment for testing
export PHLEG_ENDPOINT="http://localhost:8788"
print_success "Set PHLEG_ENDPOINT=http://localhost:8788"

# Create test file
print_status "Creating test file..."
echo "Test content from $(date)" > test-live-upload.txt
print_success "Created test file: test-live-upload.txt"

# Test upload with current CLI code
print_status "Testing upload with current CLI code..."
echo ""
UPLOAD_RESULT=$(phleg send test-live-upload.txt 2>&1)
if [ $? -eq 0 ]; then
    FILE_CODE="$UPLOAD_RESULT"
    print_success "Upload successful! File code: $FILE_CODE"
    
    # Test download
    print_status "Testing download with current CLI code..."
    DOWNLOAD_RESULT=$(phleg receive "$FILE_CODE" 2>&1)
    if [ $? -eq 0 ]; then
        print_success "Download successful!"
        echo "Download result: $DOWNLOAD_RESULT"
        
        # Verify downloaded file
        DOWNLOADED_FILE=$(echo "$DOWNLOAD_RESULT" | sed 's/Saved //')
        if [ -f "$DOWNLOADED_FILE" ]; then
            print_success "File verified: $DOWNLOADED_FILE"
            echo "Content:"
            cat "$DOWNLOADED_FILE"
        fi
    else
        print_error "Download failed: $DOWNLOAD_RESULT"
    fi
else
    print_error "Upload failed: $UPLOAD_RESULT"
fi

echo ""
echo "=================================================="
print_success "Live development environment is running!"
echo ""

print_info "📋 Current setup:"
echo "  • Worker running on: http://localhost:8788"
echo "  • CLI using current built code"
echo "  • Environment: PHLEG_ENDPOINT=http://localhost:8788"
echo ""

print_info "🧪 You can now test manually:"
echo "  phleg send <any-file>          - Upload a file"
echo "  phleg receive <file-code>       - Download a file"
echo "  npm run build                   - Rebuild after code changes"
echo ""

print_info "📝 Worker logs are shown above. Press Ctrl+C to stop everything."
echo ""

# Keep running and show worker logs
print_status "Worker is running. Monitoring logs..."
wait $WORKER_PID