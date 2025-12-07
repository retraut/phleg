#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');
const workerDir = join(rootDir, 'packages/worker');

console.log('🧪 Starting local test environment...\n');

async function runTests() {
  let workerProcess;
  
  try {
    // 1. Build all packages
    console.log('📦 Building packages...');
    await new Promise((resolve, reject) => {
      const build = spawn('npm', ['run', 'build'], {
        cwd: rootDir,
        stdio: 'inherit',
        shell: true
      });
      
      build.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Build failed with code ${code}`));
      });
    });

    // 2. Start worker in background
    console.log('\n🔧 Starting local worker...');
    workerProcess = spawn('node', ['node_modules/wrangler/bin/wrangler.js', 'dev'], {
      cwd: workerDir,
      stdio: 'pipe'
    });

    let workerReady = false;
    let workerUrl = '';

    workerProcess.stdout.on('data', (data) => {
      const output = data.toString();
      
      // Extract local URL from wrangler output
      if (output.includes('http://')) {
        const match = output.match(/http:\/\/[^\s]+/);
        if (match) {
          workerUrl = match[0];
          workerReady = true;
          console.log(`✅ Worker running at: ${workerUrl}`);
        }
      }
    });

    // Wait for worker to start
    await new Promise((resolve) => setTimeout(resolve, 5000));

    if (!workerReady) {
      workerUrl = 'http://localhost:8787';
      console.log(`⚠️  Using default worker URL: ${workerUrl}`);
    }

    // 3. Set environment for tests
    process.env.PHLEG_ENDPOINT = workerUrl;
    console.log(`🔧 Set PHLEG_ENDPOINT=${workerUrl}\n`);

    // 4. Run tests
    console.log('🧪 Running tests...\n');
    await new Promise((resolve, reject) => {
      const test = spawn('npm', ['test'], {
        cwd: rootDir,
        stdio: 'inherit',
        shell: true
      });
      
      test.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Tests failed with code ${code}`));
      });
    });

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('\n❌ Test run failed:', error.message);
    process.exit(1);
  } finally {
    // Cleanup
    if (workerProcess) {
      workerProcess.kill();
    }
  }
}

runTests();