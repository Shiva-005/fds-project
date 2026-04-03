import { NextRequest } from 'next/server';
import { verifyJWT, authorizeRoles, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { UserController } from '@/controllers/user.controller';

// GET /api/users - List all users (admin only)
export const GET = verifyJWT(
  authorizeRoles('admin')(
    async (req: AuthenticatedRequest) => UserController.listUsers(req)
  )
);

// Unused params placeholder to satisfy Next.js App Router typing
export async function OPTIONS(_req: NextRequest) {
  return new Response(null, { status: 204 });
}
