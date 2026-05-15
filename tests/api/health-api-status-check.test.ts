import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '../../src/pages/api/health';

// Health endpoint tests that don't rely on import.meta.env mocking
// We test the actual API behavior with the current environment
describe('Health API Status Check Tests', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Response Structure', () => {
    it('should return JSON response', async () => {
      const response = await GET({} as any);

      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should include no-cache header', async () => {
      const response = await GET({} as any);

      expect(response.headers.get('Cache-Control')).toBe('no-cache');
    });

    it('should have all required response fields', async () => {
      const response = await GET({} as any);
      const body = await response.json();

      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('version');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('checks');
      expect(body.checks).toHaveProperty('api');
      expect(body.checks).toHaveProperty('env');
      expect(body.checks.env).toHaveProperty('nineRouterKey');
      expect(body.checks.env).toHaveProperty('nineRouterModel');
      expect(body.checks.env).toHaveProperty('nineRouterUrl');
    });

    it('should return valid ISO timestamp', async () => {
      const response = await GET({} as any);
      const body = await response.json();

      const timestamp = new Date(body.timestamp);
      expect(timestamp.toISOString()).toBe(body.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should return version in correct format', async () => {
      const response = await GET({} as any);
      const body = await response.json();

      expect(body.version).toMatch(/^\d{4}-\d{2}-\d{2}-\d{3}$/);
    });
  });

  describe('Status Values', () => {
    it('should return either ok or error status', async () => {
      const response = await GET({} as any);
      const body = await response.json();

      expect(['ok', 'error']).toContain(body.status);
    });

    it('should return boolean values for env checks', async () => {
      const response = await GET({} as any);
      const body = await response.json();

      expect(typeof body.checks.env.nineRouterKey).toBe('boolean');
      expect(typeof body.checks.env.nineRouterModel).toBe('boolean');
      expect(typeof body.checks.env.nineRouterUrl).toBe('boolean');
    });

    it('should return boolean for api check', async () => {
      const response = await GET({} as any);
      const body = await response.json();

      expect(typeof body.checks.api).toBe('boolean');
    });
  });

  describe('Status Code Logic', () => {
    it('should return 200 when status is ok', async () => {
      const response = await GET({} as any);
      const body = await response.json();

      // Status code should match status value
      if (body.status === 'ok') {
        expect(response.status).toBe(200);
      }
    });

    it('should return 503 when status is error', async () => {
      const response = await GET({} as any);
      const body = await response.json();

      if (body.status === 'error') {
        expect(response.status).toBe(503);
      }
    });
  });

  describe('Consistency Checks', () => {
    it('should have api false when any env check fails', async () => {
      const response = await GET({} as any);
      const body = await response.json();

      const allEnvOk = body.checks.env.nineRouterKey &&
                       body.checks.env.nineRouterModel &&
                       body.checks.env.nineRouterUrl;

      if (!allEnvOk) {
        expect(body.checks.api).toBe(false);
        expect(body.status).toBe('error');
      }
    });

    it('should have status error when api check is false', async () => {
      const response = await GET({} as any);
      const body = await response.json();

      if (body.checks.api === false) {
        expect(body.status).toBe('error');
      }
    });
  });

  describe('Performance', () => {
    it('should respond quickly (< 100ms)', async () => {
      const start = Date.now();
      await GET({} as any);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('API Contract', () => {
    it('should not throw errors', async () => {
      await expect(GET({} as any)).resolves.not.toThrow();
    });

    it('should return parseable JSON', async () => {
      const response = await GET({} as any);
      const text = await response.text();

      expect(() => JSON.parse(text)).not.toThrow();
    });

    it('should have consistent structure across calls', async () => {
      const response1 = await GET({} as any);
      const body1 = await response1.json();

      const response2 = await GET({} as any);
      const body2 = await response2.json();

      expect(Object.keys(body1)).toEqual(Object.keys(body2));
      expect(Object.keys(body1.checks)).toEqual(Object.keys(body2.checks));
      expect(Object.keys(body1.checks.env)).toEqual(Object.keys(body2.checks.env));
    });
  });
});
