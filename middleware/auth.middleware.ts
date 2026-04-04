import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken, JWTPayload } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse } from '@/utils/response';
// import { logger } from '@/utils/logger';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export type AuthenticatedRequest = NextRequest & {
    user: JWTPayload;
};

type RouteHandler<P = unknown> = (
    req: AuthenticatedRequest,
    context: { params: P }
) => Promise<NextResponse>;

/**
 * Middleware: Verify JWT and attach user to request
 */
export function verifyJWT<P = unknown>(handler: RouteHandler<P>) {
    return async (req: NextRequest, context: { params: P }): Promise<NextResponse> => {
        try {
            const token = getTokenFromRequest(req);

            if (!token) {
                return unauthorizedResponse('Authentication token is missing');
            }

            let payload: JWTPayload;
            try {
                payload = verifyToken(token);
            } catch {
                return unauthorizedResponse('Invalid or expired authentication token');
            }

            // Verify user still exists and is active
            try {
                await connectDB();
                const user = await User.findById(payload.userId).select('status role');
                if (!user) {
                    return unauthorizedResponse('User no longer exists');
                }
                if (user.status === 'inactive') {
                    return unauthorizedResponse('Your account has been deactivated');
                }

                // Attach user to request (mutate the request object)
                (req as AuthenticatedRequest).user = {
                    userId: payload.userId,
                    email: payload.email,
                    role: user.role,
                };
            } catch (dbError) {
                // If database connection fails, allow the request with basic user info from token
                console.warn('Database connection failed during auth verification, allowing with token data:', dbError);
                (req as AuthenticatedRequest).user = {
                    userId: payload.userId,
                    email: payload.email,
                    role: payload.role || 'viewer',
                };
            }

            return handler(req as AuthenticatedRequest, context);
        } catch (error) {
            // logger.error('Auth middleware error', { error });
            return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
        }
    };
}

/**
 * Middleware: Authorize based on roles (use after verifyJWT)
 */
export function authorizeRoles(...roles: Array<'viewer' | 'analyst' | 'admin'>) {
    return function <P = unknown>(handler: RouteHandler<P>): RouteHandler<P> {
        return async (req: AuthenticatedRequest, context: { params: P }): Promise<NextResponse> => {
            const { role } = req.user;

            if (!roles.includes(role)) {
                // logger.warn('Forbidden access attempt', {
                //     userId: req.user.userId,
                //     userRole: role,
                //     requiredRoles: roles,
                // });
                return forbiddenResponse(`Access restricted to: ${roles.join(', ')}`);
            }

            return handler(req, context);
        };
    };
}

/**
 * Compose: verifyJWT + authorizeRoles in one step
 */
export function withAuth(...roles: Array<'viewer' | 'analyst' | 'admin'>) {
    return function (handler: RouteHandler) {
        return verifyJWT(authorizeRoles(...roles)(handler));
    };
}
