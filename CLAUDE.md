# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Phleg is a monorepo containing a CLI + Cloudflare Workers + R2 one-time file sharing service. Files are deleted after first download. The project uses npm workspaces with three packages:

- `packages/cli` - Node.js CLI tool for file upload/download
- `packages/worker` - Cloudflare Worker backend API with R2 storage
- `packages/shared` - Shared TypeScript types and constants

## Architecture

### Communication Flow
1. CLI sends file via PUT to `/upload` with custom User-Agent `phleg-cli/{version}`
2. Worker stores file in R2 bucket with metadata (filename, mime type, size)
3. CLI receives file via GET to `/file/{id}` with same User-Agent
4. Worker marks file as downloaded and schedules deletion

### Security
- User-Agent validation between CLI and worker
- Environment variable configuration (`PHLEG_ENDPOINT` for worker URL)
- 100MB default file size limit
- One-time download only (files deleted after first access)

### Key Files
- `packages/cli/src/index.ts` - CLI entry point using Commander.js
- `packages/worker/src/index.ts` - Worker entry point with upload/download handlers
- `packages/shared/src/index.ts` - Shared interfaces (FileMeta, Env, etc.)
- `packages/worker/wrangler.toml` - Cloudflare Workers configuration with R2 binding

## Development Commands

### Root (Monorepo)
```bash
npm install                    # Install all workspace dependencies
npm run build                  # Build all packages
npm test                       # Run tests in all packages
npm run lint                   # Lint TypeScript files
npm run dev:worker             # Start worker in dev mode
npm run dev:cli                # Test CLI locally
npm run test:local             # Run tests against local worker
npm run ci                     # Build, test, and lint (CI command)
```

### CLI Package (`packages/cli/`)
```bash
npm run build                  # Bundle with esbuild to dist/index.cjs
npm run dev                    # Run CLI with tsx
npm test                       # Run Vitest tests
npm run dev:setup              # Full development environment setup
npm run test:local             # Tests with local worker
npm link                       # Link CLI for local testing
```

### Worker Package (`packages/worker/`)
```bash
npm run dev                    # Start wrangler dev server
npm run deploy                 # Deploy to Cloudflare Workers
npm run build                  # Compile TypeScript
npm test                       # Run Vitest tests
```

### Shared Package (`packages/shared/`)
```bash
npm run build                  # Compile TypeScript to dist/
npm run dev                    # Watch mode compilation
npm test                       # Run Vitest tests
```

## Testing

### Test Framework
- **Vitest** across all packages
- Unit tests in `*.test.ts` files
- Mock external dependencies (fs, fetch, etc.)
- CLI tests mock `process.exit` to prevent test runner termination

### Test Scripts
- `./tests.sh` - Full development environment setup and testing
- `./test-local.sh` - Run tests with local worker
- `./test-current.sh` - Run tests in current package
- `./test-e2e.sh` - End-to-end tests

### Local Testing Setup
1. Set `PHLEG_ENDPOINT=http://localhost:8787` for local worker
2. Start worker: `npm run dev:worker`
3. Build and link CLI: `cd packages/cli && npm run build && npm link`
4. Test: `phleg send test.txt`

## Build System

### TypeScript Configuration
- Each package has its own `tsconfig.json`
- CLI: ES2022 target, ESNext modules, Node resolution
- Worker: Cloudflare Workers compatibility
- Shared: Declaration files for type sharing

### Bundling
- CLI uses **esbuild** for fast bundling to CommonJS
- Worker and shared packages use **tsc** for compilation
- Output directories: `cli/dist/`, `worker/src/`, `shared/dist/`

## Environment Variables

### Development
- `PHLEG_ENDPOINT` - Worker URL (default: production, local: `http://localhost:8787`)
- `NODE_ENV` - Set to `development` for local development

### Deployment (GitHub Actions)
- `CLOUDFLARE_API_TOKEN` - Cloudflare Workers deployment
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `NPM_TOKEN` - npm publishing token

## Code Patterns

### Error Handling
- CLI uses `process.exit(1)` for fatal errors with user-friendly messages
- Worker returns appropriate HTTP status codes (400, 404, 500)
- Try/catch blocks with proper error propagation

### File Operations
- Stream files for upload/download to handle large files
- Use Node.js native `fs` module (not promises)
- Check file existence with `fs.existsSync`
- Use `path` module for cross-platform path handling

### HTTP Communication
- Custom User-Agent format: `phleg-cli/{version}`
- PUT method for uploads, GET for downloads
- Headers: `x-filename`, `x-mime`, `Content-Length`
- Content-Disposition header for download filenames

## CI/CD Pipeline

### GitHub Actions (`.github/workflows/ci.yml`)
1. **Test Job**: Build all packages, run tests, lint code
2. **Deploy Worker**: Deploy to Cloudflare Workers on main branch push
3. **Publish NPM**: Publish CLI package to npm on version tags

### Deployment Requirements
- Node.js >=18
- Wrangler CLI for Cloudflare Workers
- npm workspaces enabled

## Development Workflow

1. Make changes to TypeScript files in respective packages
2. Run `npm run build` in affected packages
3. Test locally with `npm run dev:setup` or manual testing
4. Run tests with `npm test` or `npm run test:local`
5. Ensure linting passes: `npm run lint`
6. Commit and push changes

## Important Notes

- The CLI depends on shared package types (`../../shared/src/index`)
- Downloaded files use Content-Disposition header for filename, with fallback to `phleg-{code}`
- Existing files are automatically renamed with counter suffix (e.g., `file.txt`, `file (1).txt`)
- File size limits are enforced both client-side (CLI) and server-side (worker)
- Changes to shared types may require updates in both CLI and worker packages