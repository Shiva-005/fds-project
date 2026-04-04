import { verifyJWT, authorizeRoles, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { FinanceController } from '@/controllers/finance.controller';

// GET /api/records — all roles
export const GET = verifyJWT(
    authorizeRoles('viewer', 'analyst', 'admin')(
        async (req: AuthenticatedRequest) => FinanceController.listRecords(req)
    )
);

// POST /api/records — analyst and admin
export const POST = verifyJWT(
    authorizeRoles('analyst', 'admin')(
        async (req: AuthenticatedRequest) => FinanceController.createRecord(req)
    )
);
