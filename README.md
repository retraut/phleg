# Phleg

CLI + Cloudflare Workers + R2 one-time file sharing service with custom User-Agent.

## Structure

- `packages/worker` - Cloudflare Worker API
- `packages/cli` - Node.js CLI tool
- `packages/shared` - Shared TypeScript types

## Development

```bash
npm install
npm run build
npm run dev:worker  # Start worker in dev mode
npm run dev:cli     # Test CLI locally
```

## Usage

```bash
# Send file
phleg send myfile.txt

# Receive file
phleg receive abc12345
```