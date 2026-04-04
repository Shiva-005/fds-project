import { verifyJWT, authorizeRoles, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { FinanceController } from '@/controllers/finance.controller';

// GET /api/records/:id — all roles
export const GET = verifyJWT(
    authorizeRoles('viewer', 'analyst', 'admin')(
        async (req: AuthenticatedRequest, context: { params: Promise<Record<string, string>> }) => {
            const params = await context.params;
            return FinanceController.getRecordById(req, params.id);
        }
    )
);

// PATCH /api/records/:id — analyst and admin
export const PATCH = verifyJWT(
    authorizeRoles('analyst', 'admin')(
        async (req: AuthenticatedRequest, context: { params: Promise<Record<string, string>> }) => {
            const params = await context.params;
            return FinanceController.updateRecord(req, params.id);
        }
    )
);

// DELETE /api/records/:id — analyst and admin
export const DELETE = verifyJWT(
    authorizeRoles('analyst', 'admin')(
        async (req: AuthenticatedRequest, context: { params: Promise<Record<string, string>> }) => {
            const params = await context.params;
            return FinanceController.deleteRecord(req, params.id);
        }
    )
);