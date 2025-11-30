# Phleg CLI

CLI + Cloudflare Workers + R2 one-time file sharing service with custom User-Agent.

## Installation

```bash
npm install -g phleg
```

## Usage

### Send a file
```bash
phleg send myfile.txt
# Returns: abc12345
```

### Receive a file
```bash
phleg receive abc12345
# Downloads: myfile.txt
```

### Configuration

Set your Phleg worker endpoint:
```bash
export PHLEG_ENDPOINT="https://your-worker.your-subdomain.workers.dev"
```

## Features

- 🚀 One-time file sharing
- 🔒 Secure with custom User-Agent
- ☁️ Cloudflare Workers + R2 storage
- 📱 Cross-platform CLI
- 🗑️ Self-destruct after download

## Development

```bash
git clone https://github.com/retraut/phleg.git
cd phleg
npm install
npm run build
npm link
```

## License

MIT