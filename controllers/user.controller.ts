import { NextResponse } from 'next/server';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { UserService } from '@/services/user.service';
import {
  updateRoleSchema,
  updateStatusSchema,
  listUsersQuerySchema,
} from '@/validators/user.validator';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  forbiddenResponse,
} from '@/utils/response';
// import { logger } from '@/utils/logger';

export const UserController = {
  async listUsers(req: AuthenticatedRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const queryObj = Object.fromEntries(searchParams.entries());
      const parsed = listUsersQuerySchema.safeParse(queryObj);

      if (!parsed.success) return validationErrorResponse(parsed.error.issues);

      const result = await UserService.listUsers(parsed.data);
      return successResponse(result.users, 'Users retrieved successfully', 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error) {
      // logger.error('List users error', { error });
      return errorResponse('Failed to retrieve users', 500);
    }
  },

  async getUserById(req: AuthenticatedRequest, id: string): Promise<NextResponse> {
    try {
      // Non-admins can only view their own profile
      if (req.user.role !== 'admin' && req.user.userId !== id) {
        return forbiddenResponse('You can only view your own profile');
      }

      const user = await UserService.findById(id);
      if (!user) return notFoundResponse('User not found');

      return successResponse(user.toSafeObject(), 'User retrieved successfully');
    } catch (error) {
      // logger.error('Get user error', { error });
      return errorResponse('Failed to retrieve user', 500);
    }
  },

  async updateRole(req: AuthenticatedRequest, id: string): Promise<NextResponse> {
    try {
      const body = await req.json();
      const parsed = updateRoleSchema.safeParse(body);
      if (!parsed.success) return validationErrorResponse(parsed.error.issues);

      // Prevent admins from demoting themselves
      if (req.user.userId === id) {
        return errorResponse('Admins cannot change their own role', 400);
      }

      const user = await UserService.updateRole(id, parsed.data.role);
      if (!user) return notFoundResponse('User not found');

      return successResponse(user.toSafeObject(), 'User role updated successfully');
    } catch (error) {
      // logger.error('Update role error', { error });
      return errorResponse('Failed to update role', 500);
    }
  },

  async updateStatus(req: AuthenticatedRequest, id: string): Promise<NextResponse> {
    try {
      const body = await req.json();
      const parsed = updateStatusSchema.safeParse(body);
      if (!parsed.success) return validationErrorResponse(parsed.error.issues);

      // Prevent admins from deactivating themselves
      if (req.user.userId === id) {
        return errorResponse('Admins cannot change their own status', 400);
      }

      const user = await UserService.updateStatus(id, parsed.data.status);
      if (!user) return notFoundResponse('User not found');

      return successResponse(user.toSafeObject(), `User ${parsed.data.status === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      // logger.error('Update status error', { error });
      return errorResponse('Failed to update status', 500);
    }
  },

  async deleteUser(req: AuthenticatedRequest, id: string): Promise<NextResponse> {
    try {
      if (req.user.userId === id) {
        return errorResponse('Admins cannot delete their own account', 400);
      }

      const deleted = await UserService.deleteUser(id);
      if (!deleted) return notFoundResponse('User not found');

      return successResponse(null, 'User deleted successfully');
    } catch (error) {
      // logger.error('Delete user error', { error });
      return errorResponse('Failed to delete user', 500);
    }
  },
};
