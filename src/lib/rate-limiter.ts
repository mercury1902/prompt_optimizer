// Rate limiter stub - Phase 4 will implement full version

export interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  totalRequests: number;
}

export function checkRateLimit(
  identifier: string,
  config: { requestsPerMinute: number; requestsPerHour: number }
): RateLimitInfo {
  // Stub: always allow
  return {
    allowed: true,
    remaining: config.requestsPerMinute,
    resetTime: new Date(Date.now() + 60000),
    totalRequests: 0,
  };
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return ip;
}
