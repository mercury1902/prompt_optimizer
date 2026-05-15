import type { APIRoute } from "astro";

/**
 * Health check endpoint for monitoring API status
 * Returns: { status: 'ok' | 'error', version: string, timestamp: string }
 */
export const GET: APIRoute = async () => {
  const health = {
    status: 'ok' as const,
    version: '2026-04-07-001',
    timestamp: new Date().toISOString(),
    checks: {
      api: true,
      env: {
        nineRouterKey: !!import.meta.env.PUBLIC_NINEROUTER_API_KEY,
        nineRouterModel: !!import.meta.env.PUBLIC_NINEROUTER_MODEL,
        nineRouterUrl: !!import.meta.env.PUBLIC_NINEROUTER_BASE_URL,
      }
    }
  };

  // Determine overall status
  const hasRequiredEnv = health.checks.env.nineRouterKey &&
                         health.checks.env.nineRouterModel &&
                         health.checks.env.nineRouterUrl;

  if (!hasRequiredEnv) {
    health.status = 'error';
    health.checks.api = false;
  }

  return new Response(JSON.stringify(health), {
    status: health.status === 'ok' ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
};
