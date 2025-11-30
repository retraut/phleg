import { describe, it, expect, vi } from 'vitest';
import { sendFile } from '../src/send.js';

// Mock node-fetch
vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

// Mock fs with proper export
vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    statSync: vi.fn(),
    createReadStream: vi.fn()
  },
  existsSync: vi.fn(),
  statSync: vi.fn(),
  createReadStream: vi.fn()
}));

describe('sendFile', () => {
  it('should handle file not found', async () => {
    const { existsSync } = await import('fs');
    vi.mocked(existsSync).mockReturnValue(false);
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const processSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit');
    });

    await expect(sendFile('nonexistent.txt')).rejects.toThrow('exit');
    
    expect(consoleSpy).toHaveBeenCalledWith('File not found:', 'nonexistent.txt');
    
    consoleSpy.mockRestore();
    processSpy.mockRestore();
  });
});