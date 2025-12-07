#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');
const workerDir = join(rootDir, 'packages/worker');
const cliDir = join(rootDir, 'packages/cli');

console.log('🚀 Setting up Phleg development environment...\n');

// Function to run commands
function runCommand(command, args, cwd, description) {
  return new Promise((resolve, reject) => {
    console.log(`📦 ${description}...`);
    
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completed\n`);
        resolve();
      } else {
        reject(new Error(`${description} failed with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function setupDevEnvironment() {
  try {
    // 1. Build all packages
    await runCommand('npm', ['run', 'build'], rootDir, 'Building all packages');

    // 2. Start the worker in background
    console.log('🔧 Starting local Cloudflare Worker...');
    const workerProcess = spawn('node', ['node_modules/wrangler/bin/wrangler.js', 'dev'], {
      cwd: workerDir,
      stdio: 'pipe'
    });

    let workerReady = false;
    let workerUrl = '';

    workerProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Worker] ${output.trim()}`);
      
      // Extract local URL from wrangler output
      if (output.includes('http://')) {
        const match = output.match(/http:\/\/[^\s]+/);
        if (match) {
          workerUrl = match[0];
          workerReady = true;
          console.log(`\n🌐 Worker running at: ${workerUrl}\n`);
        }
      }
    });

    workerProcess.stderr.on('data', (data) => {
      console.error(`[Worker Error] ${data.toString().trim()}`);
    });

    // Wait for worker to start
    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (!workerReady) {
      console.log('⚠️  Could not detect worker URL, using default: http://localhost:8787');
      workerUrl = 'http://localhost:8787';
    }

    // 3. Set environment variable for CLI
    process.env.PHLEG_ENDPOINT = workerUrl;
    console.log(`🔧 Set PHLEG_ENDPOINT=${workerUrl}\n`);

    // 4. Link the CLI for local testing
    await runCommand('npm', ['link'], cliDir, 'Linking CLI package');

    console.log('🎉 Development environment ready!');
    console.log('\n📋 Available commands:');
    console.log('  npm run dev:worker    - Start worker only');
    console.log('  npm run dev:cli       - Start CLI only');
    console.log('  npm test              - Run all tests');
    console.log('  phleg send <file>     - Test file upload');
    console.log('  phleg receive <code>  - Test file download');
    console.log('\n💡 The worker is running in the background. Press Ctrl+C to stop.');

    // Keep the script running
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down...');
      workerProcess.kill();
      process.exit(0);
    });

    // Wait for user to stop
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDevEnvironment();