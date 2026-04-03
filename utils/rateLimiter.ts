import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
    windowMs: number;
    max: number;
    message?: string;
}

export function createRateLimiter(options: RateLimitOptions) {
    const { windowMs, max, message = 'Too many requests, please try again later.' } = options;

    return function rateLimit(req: NextRequest): NextResponse | null {
        const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
        const key = `${ip}:${req.nextUrl.pathname}`;
        const now = Date.now();

        const entry = rateLimitStore.get(key);

        if (!entry || now > entry.resetTime) {
            rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
            return null;
        }

        if (entry.count >= max) {
            return NextResponse.json(
                { success: false, message },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((entry.resetTime - now) / 1000)),
                        'X-RateLimit-Limit': String(max),
                        'X-RateLimit-Remaining': '0',
                    },
                }
            );
        }

        entry.count++;
        return null;
    };
}

// Cleanup old entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) rateLimitStore.delete(key);
    }
}, 10 * 60 * 1000);
