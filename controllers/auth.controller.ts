import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { signToken, setAuthCookie, clearAuthCookie } from '@/lib/auth';
import { registerSchema, loginSchema } from '@/validators/auth.validator';
import {
  successResponse,
  createdResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '@/utils/response';
import { logger } from '@/utils/logger';
import { ZodError } from 'zod';
import { connectDB } from '@/lib/db';

export const AuthController = {
  async register(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const parsed = registerSchema.safeParse(body);

      if (!parsed.success) {
        return validationErrorResponse(parsed.error.issues);
      }

      const user = await UserService.createUser(parsed.data);
      const token = signToken({ userId: String(user._id), email: user.email, role: user.role });
      const response = createdResponse(
        { user: user.toSafeObject(), token },
        'User registered successfully'
      );
      return setAuthCookie(response, token);
    } catch (error) {
      if (error instanceof ZodError) return validationErrorResponse(error.issues);
      if (error instanceof Error && error.message.includes('already exists')) {
        return errorResponse(error.message, 409);
      }
      logger.error('Register error', { error });
      return errorResponse('Registration failed', 500);
    }
  },

  async login(req: NextRequest): Promise<NextResponse> {
    try {
      await connectDB();
      const body = await req.json();
      const parsed = loginSchema.safeParse(body);

      if (!parsed.success) {
        return validationErrorResponse(parsed.error.issues);
      }

      const { email, password } = parsed.data;
      
      const user = await UserService.findByEmail(email);

      if (!user || !(await user.comparePassword(password))) {
        return unauthorizedResponse('Invalid email or password');
      }

      if (user.status === 'inactive') {
        return unauthorizedResponse('Your account has been deactivated. Contact an administrator.');
      }

      const token = signToken({ userId: String(user._id), email: user.email, role: user.role });
      const response = successResponse({ user: user.toSafeObject(), token }, 'Login successful');
      setAuthCookie(response, token);
      logger.info('User logged in', { userId: user._id });
      return response;
    } catch (error) {
      logger.error('Login error', { error });
      return errorResponse('Login failed', 500);
    }
  },

  async logout(_req: NextRequest): Promise<NextResponse> {
    const response = successResponse(null, 'Logged out successfully');
    return clearAuthCookie(response);
  },
};
