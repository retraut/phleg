# Phleg CLI - Agent Guide

This document provides essential information for AI agents working with the Phleg CLI codebase.

## Project Overview

Phleg is a CLI + Cloudflare Workers + R2 one-time file sharing service. This package contains the CLI component that communicates with a Cloudflare Worker backend.

## Essential Commands

### Development
- `npm run dev` - Run the CLI in development mode with tsx
- `npm run build` - Build the CLI using esbuild (outputs to `dist/index.cjs`)
- `npm test` - Run tests with Vitest

### Publishing
- `npm run prepublishOnly` - Build before publishing
- `npm link` - Link for local development testing

## Code Organization

### Source Structure
- `src/index.ts` - Main CLI entry point using Commander.js
- `src/send.ts` - File upload functionality
- `src/receive.ts` - File download functionality
- `src/send.test.ts` - Tests for send functionality

### Dependencies
- **commander** - CLI framework
- **node-fetch** - HTTP requests
- **shared package** - Shared types and constants from `../../shared/src/index`

## Code Patterns & Conventions

### TypeScript Configuration
- Target: ES2022
- Module: ESNext with Node resolution
- Strict mode enabled
- Output directory: `dist/`

### Error Handling
- Use `process.exit(1)` for fatal errors
- Console.error for user-facing error messages
- Try/catch blocks with proper error propagation

### File Operations
- Use Node.js native `fs` module (not promises)
- Stream files for upload/download to handle large files
- Check file existence with `fs.existsSync`
- Use `path` module for cross-platform path handling

### HTTP Communication
- Custom User-Agent format: `phleg-cli/{version}`
- Environment variable `PHLEG_ENDPOINT` for worker URL
- PUT method for uploads, GET for downloads
- Headers: `x-filename`, `x-mime`, `Content-Length`

## Testing

### Test Framework
- **Vitest** for testing
- Mock external dependencies (fs, fetch)
- Test error conditions and edge cases

### Test Patterns
- Mock file system operations
- Mock HTTP requests
- Test process.exit scenarios
- Use vi.spyOn for console and process mocking

## Development Environment

### Local Testing
- Use `PHLEG_ENDPOINT=http://localhost:8787` for local worker
- Scripts in `scripts/` folder automate setup and testing
- `.env.local` provides default local configuration

### Testing with Local Worker
- Worker runs on `http://localhost:8787` by default
- Use `npm run dev:setup` for complete environment
- Use `npm run test:local` for tests against local worker

## Important Gotchas

1. **Shared Dependency**: The CLI depends on the shared package (`../../shared/src/index`) for types and constants. Changes to shared types may require updates here.

2. **File Naming**: Downloaded files use Content-Disposition header for filename, with fallback to `phleg-{code}`. Existing files are automatically renamed with counter suffix.

3. **Stream Handling**: Files are streamed for both upload and download to handle large files efficiently.

4. **Environment Variables**: `PHLEG_ENDPOINT` can be set to override the default worker URL.

5. **Exit Codes**: The CLI uses process.exit(1) for errors, so tests need to mock process.exit to prevent test runner termination.

## Build Output

- Built as CommonJS module (`dist/index.cjs`)
- Target: Node.js 18+
- Bundled with esbuild
- Entry point: `src/index.ts`

## Development Workflow

### Quick Development Setup
- `./tests.sh` - Full development environment setup and testing
- `./test-local.sh` - Run tests with local worker
- See `DEVELOPMENT.md` for detailed setup instructions

### Manual Development
1. Make changes to TypeScript files in `src/`
2. Test with `npm run dev`
3. Run tests with `npm test`
4. Build with `npm run build`
5. Test built CLI locally with `npm link`

## Related Packages

- **worker**: Cloudflare Worker backend
- **shared**: Shared types and constants

Always check for breaking changes in shared dependencies when modifying this package.