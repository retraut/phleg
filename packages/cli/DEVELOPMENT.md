# Phleg CLI - Development Setup

This guide explains how to set up and work with the Phleg CLI development environment.

## Quick Start

### Option 1: Full Development Setup
```bash
# From project root
./tests.sh
```
This will:
- Check Node.js version
- Build all packages
- Link the CLI for local testing
- Run all tests
- Provide setup instructions

### Option 2: Test with Local Worker
```bash
# From project root
./test-local.sh
```
This will:
- Build packages
- Start local worker in background
- Run all tests against the local worker
- Keep worker running for manual testing
- Clean up on exit

## Manual Setup

### 1. Start Worker Locally
```bash
cd packages/worker
npm run dev
```
The worker will start at `http://localhost:8787`

### 2. Configure CLI for Local Worker
```bash
# Set environment variable
export PHLEG_ENDPOINT=http://localhost:8788

# Or use the .env.local file
cp .env.local .env
```

### 3. Build and Link CLI
```bash
cd packages/cli
npm run build
npm link
```

### 4. Test Locally
```bash
# Send a file
phleg send test.txt

# Receive the file (use the code from send command)
phleg receive abc12345
```

## Development Scripts

### Available Commands

**From project root:**
- `npm run dev:setup` - Full development environment setup
- `npm run test:local` - Run tests against local worker
- `npm run dev:worker` - Start worker only
- `npm run dev:cli` - Start CLI only
- `npm test` - Run all tests
- `npm run build` - Build all packages

**From CLI package:**
- `npm run dev:setup` - CLI-specific setup
- `npm run test:local` - CLI tests with local worker
- `npm run dev` - Run CLI in development mode
- `npm test` - Run CLI tests

## Environment Variables

- `PHLEG_ENDPOINT` - URL of the Phleg worker (default: production URL)
- `NODE_ENV` - Set to `development` for local development

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with local worker
npm run test:local

# Run tests in watch mode
cd packages/cli && npm test -- --watch
```

### Test Structure
- Unit tests in `src/*.test.ts`
- Uses Vitest framework
- Mocks external dependencies (fs, fetch)
- Tests error conditions and edge cases

## File Structure

```
packages/cli/
├── scripts/
│   ├── dev-setup.js    # Development environment setup
│   └── test-local.js   # Test runner with local worker
├── src/
│   ├── index.ts        # CLI entry point
│   ├── send.ts         # File upload
│   ├── receive.ts      # File download
│   └── send.test.ts    # Tests
├── .env.local          # Local development config
└── DEVELOPMENT.md      # This file
```

## Troubleshooting

### Worker Not Starting
- Ensure Wrangler is installed: `npm install -g wrangler`
- Check if port 8787 is available
- Verify worker dependencies: `cd packages/worker && npm install`

### CLI Not Working
- Build the CLI: `npm run build`
- Link the CLI: `npm link`
- Check environment variables: `echo $PHLEG_ENDPOINT`

### Tests Failing
- Ensure worker is running for local tests
- Check if all dependencies are installed
- Run `npm run build` before tests

## Development Workflow

1. Make changes to TypeScript files
2. Run `npm run build` to compile
3. Test with `npm run dev:setup` or manual testing
4. Run tests with `npm test` or `npm run test:local`
5. Commit and push changes

## Related Packages

- **worker**: Cloudflare Worker backend (`packages/worker/`)
- **shared**: Shared types and constants (`packages/shared/`)

Always test changes against the local worker before deploying to production.