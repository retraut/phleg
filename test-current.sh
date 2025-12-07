#!/bin/bash

# Phleg Current Code Test - Quick test with local worker

echo "🧪 Testing Current Code with Local Worker..."
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
    fi
    
    # Remove temporary files
    rm -f test-current-*.txt 2>/dev/null
    
    print_success "Cleanup complete"
}

# Set up cleanup on exit
trap cleanup EXIT

# Check if worker is already running
if pgrep -f "wrangler dev" > /dev/null; then
    print_info "Worker is already running, using existing instance..."
    WORKER_RUNNING=true
else
    # Build current code
    print_status "Building current code..."
    if npm run build; then
        print_success "Current code built successfully"
    else
        print_error "Build failed - check your code"
        exit 1
    fi

    # Start worker
    print_status "Starting worker..."
    cd packages/worker
    npm run dev > /dev/null 2>&1 &
    WORKER_PID=$!
    cd ../..
    
    # Wait for worker to start
    print_status "Waiting for worker to start..."
    sleep 5
fi

# Set environment
export PHLEG_ENDPOINT="http://localhost:8788"
print_success "Set PHLEG_ENDPOINT=http://localhost:8788"

# Create test content
TEST_CONTENT="Current code test at $(date)"
print_status "Creating test file..."
echo "$TEST_CONTENT" > test-current-upload.txt
print_success "Created: test-current-upload.txt"

# Test upload
print_status "Testing upload..."
UPLOAD_OUTPUT=$(phleg send test-current-upload.txt 2>&1)
UPLOAD_EXIT=$?

if [ $UPLOAD_EXIT -eq 0 ]; then
    FILE_CODE="$UPLOAD_OUTPUT"
    print_success "Upload successful! Code: $FILE_CODE"
    
    # Test download
    print_status "Testing download..."
    DOWNLOAD_OUTPUT=$(phleg receive "$FILE_CODE" 2>&1)
    DOWNLOAD_EXIT=$?
    
    if [ $DOWNLOAD_EXIT -eq 0 ]; then
        DOWNLOADED_FILE=$(echo "$DOWNLOAD_OUTPUT" | sed 's/Saved //')
        print_success "Download successful! File: $DOWNLOADED_FILE"
        
        # Verify content
        print_status "Verifying content..."
        if [ -f "$DOWNLOADED_FILE" ]; then
            DOWNLOADED_CONTENT=$(cat "$DOWNLOADED_FILE")
            if [ "$DOWNLOADED_CONTENT" = "$TEST_CONTENT" ]; then
                print_success "Content verified: ✓"
                echo "Original: $TEST_CONTENT"
                echo "Downloaded: $DOWNLOADED_CONTENT"
            else
                print_error "Content mismatch!"
                echo "Original: $TEST_CONTENT"
                echo "Downloaded: $DOWNLOADED_CONTENT"
            fi
        else
            print_error "Downloaded file not found: $DOWNLOADED_FILE"
        fi
    else
        print_error "Download failed: $DOWNLOAD_OUTPUT"
    fi
else
    print_error "Upload failed: $UPLOAD_OUTPUT"
fi

echo ""
echo "=================================================="
print_success "Current code test completed!"

if [ "$WORKER_RUNNING" = "true" ]; then
    print_info "Worker was already running - left active"
else
    print_info "Worker was started for this test - now stopped"
fi