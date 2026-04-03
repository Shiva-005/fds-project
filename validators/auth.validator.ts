import { z } from 'zod';

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email format')
        .toLowerCase(),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    role: z.enum(['viewer', 'analyst', 'admin']).optional().default('viewer'),
});

export const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email format').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
