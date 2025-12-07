#!/usr/bin/env node

import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

console.log('🧪 Starting local test environment...\n');

// Function to run commands
function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`📦 ${description}...`);
    
    exec(command, { cwd: rootDir }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`${description} failed: ${error.message}`));
        return;
      }
      console.log(`✅ ${description} completed\n`);
      resolve(stdout);
    });
  });
}

async function runTests() {
  try {
    // 1. Build all packages
    await runCommand('npm run build', 'Building packages');

    // 2. Run tests
    console.log('🧪 Running tests...\n');
    await runCommand('npm test', 'Running tests');

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('\n❌ Test run failed:', error.message);
    process.exit(1);
  }
}

runTests();