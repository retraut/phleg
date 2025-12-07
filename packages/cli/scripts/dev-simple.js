#!/usr/bin/env node

import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');
const cliDir = join(rootDir, 'packages/cli');

console.log('🚀 Setting up Phleg development environment...\n');

// Function to run commands
function runCommand(command, description, cwd = rootDir) {
  return new Promise((resolve, reject) => {
    console.log(`📦 ${description}...`);
    
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`${description} failed: ${error.message}`));
        return;
      }
      console.log(`✅ ${description} completed\n`);
      resolve(stdout);
    });
  });
}

async function setupDevEnvironment() {
  try {
    // 1. Build all packages
    await runCommand('npm run build', 'Building packages');

    // 2. Link the CLI for local testing
    await runCommand('npm link', 'Linking CLI package', cliDir);

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