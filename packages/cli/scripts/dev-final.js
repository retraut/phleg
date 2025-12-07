#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');
const cliDir = join(rootDir, 'packages/cli');

console.log('🚀 Setting up Phleg development environment...\n');

// Function to run commands with spawn
function runCommand(command, args, cwd, description) {
  return new Promise((resolve, reject) => {
    console.log(`📦 ${description}...`);
    
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit'
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
    await runCommand('npm', ['run', 'build'], rootDir, 'Building packages');

    // 2. Link the CLI for local testing
    await runCommand('npm', ['link'], cliDir, 'Linking CLI package');

    console.log('🎉 Development environment ready!');
    console.log('\n📋 Available commands:');
    console.log('  npm run dev:worker    - Start worker only');
    console.log('  npm run dev:cli       - Start CLI only');
    console.log('  npm test              - Run all tests');
    console.log('  phleg send <file>     - Test file upload');
    console.log('  phleg receive <code>  - Test file download');
    console.log('\n💡 For local testing:');
    console.log('  1. Start worker: cd packages/worker && npm run dev');
    console.log('  2. Set env: export PHLEG_ENDPOINT=http://localhost:8787');
    console.log('  3. Test: phleg send test.txt');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDevEnvironment();