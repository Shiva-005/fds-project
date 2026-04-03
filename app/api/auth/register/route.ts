import { NextRequest } from 'next/server';
import { AuthController } from '@/controllers/auth.controller';
import { createRateLimiter } from '@/utils/rateLimiter';

const rateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

export async function POST(req: NextRequest) {
  const limited = rateLimiter(req);
  if (limited) return limited;
  return AuthController.register(req);
}
