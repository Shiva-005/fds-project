import { verifyJWT, authorizeRoles, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { FinanceController } from '@/controllers/finance.controller';

// GET /api/dashboard/summary — all roles
export const GET = verifyJWT(
    authorizeRoles('viewer', 'analyst', 'admin')(
        async (req: AuthenticatedRequest) => FinanceController.getSummary(req)
    )
);
