// Simple in-memory rate limiter for Next.js API routes.
// NOTE: This is per-process only. For multi-replica deployments, use Redis.
const rateLimitMap = new Map();

// Periodically clean up stale entries to prevent memory leaks.
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of rateLimitMap.entries()) {
        const fresh = timestamps.filter(t => now - t < 60 * 1000 * 10);
        if (fresh.length === 0) {
            rateLimitMap.delete(key);
        } else {
            rateLimitMap.set(key, fresh);
        }
    }
}, 5 * 60 * 1000);

/**
 * @param {object} options
 * @param {number} options.limit     Max requests allowed in the window
 * @param {number} options.windowMs  Window size in milliseconds
 * @returns {(req: Request) => boolean}  Returns true if the request is allowed
 */
export function rateLimit({ limit = 10, windowMs = 60 * 1000 } = {}) {
    return function check(req) {
        const ip =
            req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
            req.headers.get('x-real-ip') ||
            'unknown';

        const now = Date.now();
        const windowStart = now - windowMs;

        const timestamps = (rateLimitMap.get(ip) || []).filter(t => t > windowStart);
        timestamps.push(now);
        rateLimitMap.set(ip, timestamps);

        return timestamps.length <= limit;
    };
}
