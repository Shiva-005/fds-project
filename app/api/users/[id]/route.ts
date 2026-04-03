import { verifyJWT, authorizeRoles, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { UserController } from '@/controllers/user.controller';

// GET /api/users/:id — admin or self
export const GET = verifyJWT(
    authorizeRoles('viewer', 'analyst', 'admin')(
        async (req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
            const { id } = await context.params;
            return UserController.getUserById(req, id);
        }
    )
);

// PUT /api/users/:id — update role (admin only)
export const PUT = verifyJWT(
    authorizeRoles('admin')(
        async (req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
            const { id } = await context.params;
            return UserController.updateRole(req, id);
        }
    )
);

// PATCH /api/users/:id — update status (admin only)
export const PATCH = verifyJWT(
    authorizeRoles('admin')(
        async (req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
            const { id } = await context.params;
            return UserController.updateStatus(req, id);
        }
    )
);

// DELETE /api/users/:id — admin only
export const DELETE = verifyJWT(
    authorizeRoles('admin')(
        async (req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
            const { id } = await context.params;
            return UserController.deleteUser(req, id);
        }
    )
);