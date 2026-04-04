import { NextResponse } from 'next/server';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { FinanceService } from '@/services/finance.service';
import {
  createRecordSchema,
  updateRecordSchema,
  listRecordsQuerySchema,
} from '@/validators/record.validator';
import {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} from '@/utils/response';
// import { logger } from '@/utils/logger';

export const FinanceController = {
  async createRecord(req: AuthenticatedRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const parsed = createRecordSchema.safeParse(body);
      if (!parsed.success) return validationErrorResponse(parsed.error.issues);

      const record = await FinanceService.createRecord(parsed.data, req.user.userId);
      const normalized = record.toObject ? record.toObject({ getters: true, virtuals: true }) : record;
      normalized.id = normalized._id?.toString() || normalized.id;
      return createdResponse(normalized, 'Financial record created successfully');
    } catch (error) {
      // logger.error('Create record error', { error });
      return errorResponse('Failed to create record', 500);
    }
  },

  async listRecords(req: AuthenticatedRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const queryObj = Object.fromEntries(searchParams.entries());
      const parsed = listRecordsQuerySchema.safeParse(queryObj);
      if (!parsed.success) return validationErrorResponse(parsed.error.issues);

      const result = await FinanceService.listRecords(req.user.userId, req.user.role, parsed.data);
      return successResponse(result.records, 'Records retrieved successfully', 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error) {
      // logger.error('List records error', { error });
      return errorResponse('Failed to retrieve records', 500);
    }
  },

  async getRecordById(_req: AuthenticatedRequest, id: string): Promise<NextResponse> {
    try {
      const record = await FinanceService.getRecordById(id);
      if (!record) return notFoundResponse('Financial record not found');
      const normalized = record.toObject ? record.toObject({ getters: true, virtuals: true }) : record;
      normalized.id = normalized._id?.toString() || normalized.id;
      return successResponse(normalized, 'Record retrieved successfully');
    } catch (error) {
      // logger.error('Get record error', { error });
      return errorResponse('Failed to retrieve record', 500);
    }
  },

  async updateRecord(req: AuthenticatedRequest, id: string): Promise<NextResponse> {
    try {
      const body = await req.json();
      const parsed = updateRecordSchema.safeParse(body);
      if (!parsed.success) return validationErrorResponse(parsed.error.issues);

      // Check ownership for analyst
      if (req.user.role === 'analyst') {
        const record = await FinanceService.getRecordById(id);
        if (!record || record.createdBy.toString() !== req.user.userId) {
          return errorResponse('Forbidden: You can only edit your own records', 403);
        }
      }

      const record = await FinanceService.updateRecord(id, parsed.data);
      if (!record) return notFoundResponse('Financial record not found');
      const normalized = record.toObject ? record.toObject({ getters: true, virtuals: true }) : record;
      normalized.id = normalized._id?.toString() || normalized.id;
      return successResponse(normalized, 'Record updated successfully');
    } catch (error) {
      // logger.error('Update record error', { error });
      return errorResponse('Failed to update record', 500);
    }
  },

  async deleteRecord(req: AuthenticatedRequest, id: string): Promise<NextResponse> {
    try {
      // Check ownership for analyst
      if (req.user.role === 'analyst') {
        const record = await FinanceService.getRecordById(id);
        if (!record || record.createdBy.toString() !== req.user.userId) {
          return errorResponse('Forbidden: You can only delete your own records', 403);
        }
      }

      const deleted = await FinanceService.softDeleteRecord(id);
      if (!deleted) return notFoundResponse('Financial record not found');
      return successResponse(null, 'Record deleted successfully');
    } catch (error) {
      // logger.error('Delete record error', { error });
      return errorResponse('Failed to delete record', 500);
    }
  },

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  async getSummary(req: AuthenticatedRequest): Promise<NextResponse> {
    try {
      const summary = await FinanceService.getSummary(req.user.userId, req.user.role);
      return successResponse(summary, 'Dashboard summary retrieved');
    } catch (error) {
      // logger.error('Get summary error', { error });
      return errorResponse('Failed to retrieve summary', 500);
    }
  },

  async getCategoryBreakdown(req: AuthenticatedRequest): Promise<NextResponse> {
    try {
      const breakdown = await FinanceService.getCategoryBreakdown(req.user.userId, req.user.role);
      return successResponse(breakdown, 'Category breakdown retrieved');
    } catch (error) {
      // logger.error('Get category breakdown error', { error });
      return errorResponse('Failed to retrieve category breakdown', 500);
    }
  },

  async getMonthlyTrends(req: AuthenticatedRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const months = parseInt(searchParams.get('months') ?? '12', 10);
      const trends = await FinanceService.getMonthlyTrends(req.user.userId, months, req.user.role);
      return successResponse(trends, 'Monthly trends retrieved');
    } catch (error) {
      // logger.error('Get trends error', { error });
      return errorResponse('Failed to retrieve trends', 500);
    }
  },

  async getRecentTransactions(req: AuthenticatedRequest): Promise<NextResponse> {
    try {
      const transactions = await FinanceService.getRecentTransactions(req.user.userId, 5, req.user.role);
      return successResponse(transactions, 'Recent transactions retrieved');
    } catch (error) {
      // logger.error('Get recent transactions error', { error });
      return errorResponse('Failed to retrieve recent transactions', 500);
    }
  },
};
