import { describe, it, expect, beforeEach, vi } from 'vitest';
// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
    value: {
        randomUUID: vi.fn(() => '12345678-1234-1234-1234-123456789abc')
    },
    writable: true
});
// Define functions inline for testing
function generateId() {
    return crypto.randomUUID().slice(0, 8);
}
function assertPhlegUA(request, env) {
    const ua = request.headers.get('user-agent') || '';
    if (!ua.startsWith(env.ALLOWED_UA_PREFIX || 'phleg-cli')) {
        return new Response('Forbidden', { status: 403, statusText: 'Forbidden' });
    }
    return null;
}
describe('Worker utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('should generate 8-character ID', () => {
        const id = generateId();
        expect(id).toBe('12345678');
        expect(id.length).toBe(8);
    });
    it('should allow valid User-Agent', () => {
        const request = new Request('http://localhost', {
            headers: { 'user-agent': 'phleg-cli/0.1.0' }
        });
        const env = { ALLOWED_UA_PREFIX: 'phleg-cli' };
        const result = assertPhlegUA(request, env);
        expect(result).toBeNull();
    });
    it('should block invalid User-Agent', () => {
        const request = new Request('http://localhost', {
            headers: { 'user-agent': 'curl/7.68.0' }
        });
        const env = { ALLOWED_UA_PREFIX: 'phleg-cli' };
        const result = assertPhlegUA(request, env);
        expect(result?.status).toBe(403);
        expect(result?.statusText).toBe('Forbidden');
    });
});
