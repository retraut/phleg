#!/usr/bin/env node

import { Command } from 'commander';
import { sendFile } from './send.js';
import { receiveFile } from './receive.js';

const program = new Command();

program
  .name('phleg')
  .description('CLI for Phleg one-time file sharing')
  .version('0.1.0');

program
  .command('send')
  .description('Send a file')
  .argument('<file>', 'file to send')
  .action(sendFile);

program
  .command('receive')
  .description('Receive a file')
  .argument('<code>', 'file code to receive')
  .action(receiveFile);

program.parse();