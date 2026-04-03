import { z } from 'zod';

export const createRecordSchema = z.object({
    amount: z
        .number()
        .min(1, 'Amount is required')
        .positive('Amount must be greater than 0'),
    type: z.enum(['income', 'expense']),
    category: z
        .string()
        .trim()
        .min(1, 'Category is required')
        .max(100, 'Category cannot exceed 100 characters'),
    date: z
        .string()
        .min(1, 'Date is required')
        .datetime({ message: 'Invalid date format. Use ISO 8601 format.' })
        .or(z.date())
        .transform((val) => new Date(val)),
    note: z.string().trim().max(500, 'Note cannot exceed 500 characters').optional(),
});

export const updateRecordSchema = createRecordSchema.partial();

export const listRecordsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    type: z.enum(['income', 'expense']).optional(),
    category: z.string().trim().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().trim().optional(),
    sortBy: z.enum(['date', 'amount', 'category', 'createdAt']).optional().default('date'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type ListRecordsQuery = z.infer<typeof listRecordsQuerySchema>;
