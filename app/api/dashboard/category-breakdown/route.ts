import { verifyJWT, authorizeRoles, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { FinanceController } from '@/controllers/finance.controller';

// GET /api/dashboard/category-breakdown — analyst + admin
export const GET = verifyJWT(
    authorizeRoles('analyst', 'admin')(
        async (req: AuthenticatedRequest) => FinanceController.getCategoryBreakdown(req)
    )
);
