import { z } from 'zod';

export const updateRoleSchema = z.object({
  role: z.enum(['viewer', 'analyst', 'admin']),
});

export const updateStatusSchema = z.object({
  status: z.enum(['active', 'inactive']),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  role: z.enum(['viewer', 'analyst', 'admin']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().trim().optional(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
