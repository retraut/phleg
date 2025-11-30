import { describe, it, expect, beforeEach } from 'vitest';
import { FileMeta } from '../src/index.js';

describe('FileMeta', () => {
  it('should create valid file metadata', () => {
    const meta: FileMeta = {
      filename: 'test.txt',
      mime: 'text/plain',
      size: 1024,
      createdAt: Date.now(),
      downloaded: false
    };

    expect(meta.filename).toBe('test.txt');
    expect(meta.mime).toBe('text/plain');
    expect(meta.size).toBe(1024);
    expect(meta.downloaded).toBe(false);
    expect(typeof meta.createdAt).toBe('number');
  });
});