import FinancialRecord, { IFinancialRecordDocument } from '@/models/FinancialRecord';
import { CreateRecordInput, UpdateRecordInput, ListRecordsQuery } from '@/validators/record.validator';
import { connectDB } from '@/lib/db';
// import { logger } from '@/utils/logger';
import mongoose from 'mongoose';

export interface PaginatedRecords {
    records: IFinancialRecordDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const FinanceService = {
    async createRecord(data: CreateRecordInput, userId: string): Promise<IFinancialRecordDocument> {
        await connectDB();
        const record = new FinancialRecord({ ...data, createdBy: userId });
        await record.save();
        // logger.info('Financial record created', { recordId: record._id, userId });
        return record;
    },

    async listRecords(userId: string, userRole: string, query: ListRecordsQuery): Promise<PaginatedRecords> {
        await connectDB();

        const { page, limit, type, category, startDate, endDate, search, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;

        const filter: Record<string, unknown> = { isDeleted: false };
        if (userRole !== 'admin' && userRole !== 'analyst' && userRole !== 'viewer') {
            filter.createdBy = new mongoose.Types.ObjectId(userId);
        }
        if (type) filter.type = type;
        if (category) filter.category = { $regex: category, $options: 'i' };
        if (startDate || endDate) {
            const dateFilter: Record<string, Date> = {};
            if (startDate) dateFilter.$gte = new Date(startDate);
            if (endDate) dateFilter.$lte = new Date(endDate);
            filter.date = dateFilter;
        }
        if (search) {
            filter.$text = { $search: search };
        }

        const sortField = sortBy ?? 'date';
        const sortDir = sortOrder === 'asc' ? 1 : -1;

        const [recordsRaw, total] = await Promise.all([
            FinancialRecord.find(filter)
                .populate('createdBy', 'name email')
                .sort({ [sortField]: sortDir })
                .skip(skip)
                .limit(limit),
            FinancialRecord.countDocuments(filter),
        ]);

        const records = recordsRaw.map((record: any) => {
            const r = record.toObject({ getters: true, virtuals: true });
            return {
                ...r,
                id: r._id?.toString() || r.id,
                user_id:
                    (r.createdBy?.id && r.createdBy.id.toString()) ||
                    (r.createdBy?._id && r.createdBy._id.toString()) ||
                    r.user_id || r.createdBy,
                created_at: r.createdAt ? new Date(r.createdAt).toISOString() : r.created_at,
                updated_at: r.updatedAt ? new Date(r.updatedAt).toISOString() : r.updated_at,
                date: r.date ? (typeof r.date === 'string' ? r.date : new Date(r.date).toISOString()) : r.date,
            };
        });

        return {
            records: records as unknown as IFinancialRecordDocument[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    },

    async getRecordById(id: string): Promise<IFinancialRecordDocument | null> {
        await connectDB();
        return FinancialRecord.findOne({ _id: id, isDeleted: false }).populate('createdBy', 'name email');
    },

    async updateRecord(id: string, data: UpdateRecordInput): Promise<IFinancialRecordDocument | null> {
        await connectDB();
        const record = await FinancialRecord.findOneAndUpdate(
            { _id: id, isDeleted: false },
            data,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');
        // if (record) logger.info('Financial record updated', { recordId: id });
        return record;
    },

    async softDeleteRecord(id: string): Promise<boolean> {
        await connectDB();
        const result = await FinancialRecord.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        // if (result) logger.info('Financial record soft-deleted', { recordId: id });
        return !!result;
    },

    // ─── Dashboard Aggregations ─────────────────────────────────────────────────

    async getSummary(userId: string, userRole?: string) {
        await connectDB();
        const matchFilter: Record<string, unknown> = { isDeleted: false };
        if (userRole !== 'admin' && userRole !== 'analyst' && userRole !== 'viewer') {
            matchFilter.createdBy = new mongoose.Types.ObjectId(userId);
        }
        const result = await FinancialRecord.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
        ]);

        const income = result.find((r) => r._id === 'income');
        const expense = result.find((r) => r._id === 'expense');

        const totalIncome = income?.total ?? 0;
        const totalExpense = expense?.total ?? 0;

        return {
            totalIncome,
            totalExpense,
            netBalance: totalIncome - totalExpense,
            incomeCount: income?.count ?? 0,
            expenseCount: expense?.count ?? 0,
        };
    },

    async getCategoryBreakdown(userId: string, userRole?: string) {
        await connectDB();
        const matchFilter: Record<string, unknown> = { isDeleted: false };
        if (userRole !== 'admin' && userRole !== 'analyst' && userRole !== 'viewer') {
            matchFilter.createdBy = new mongoose.Types.ObjectId(userId);
        }
        const result = await FinancialRecord.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: { category: '$category', type: '$type' },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: '$_id.category',
                    breakdown: {
                        $push: {
                            type: '$_id.type',
                            total: '$total',
                            count: '$count',
                        },
                    },
                    totalAmount: { $sum: '$total' },
                },
            },
            { $sort: { totalAmount: -1 } },
            {
                $project: {
                    _id: 0,
                    category: '$_id',
                    breakdown: 1,
                    totalAmount: 1,
                },
            },
        ]);
        return result;
    },

    async getMonthlyTrends(userId: string, months = 12, userRole?: string) {
        await connectDB();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months + 1);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const matchFilter: Record<string, unknown> = {
            isDeleted: false,
            date: { $gte: startDate },
        };
        if (userRole !== 'admin' && userRole !== 'analyst' && userRole !== 'viewer') {
            matchFilter.createdBy = new mongoose.Types.ObjectId(userId);
        }

        return FinancialRecord.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                        type: '$type',
                    },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: { year: '$_id.year', month: '$_id.month' },
                    data: {
                        $push: {
                            type: '$_id.type',
                            total: '$total',
                            count: '$count',
                        },
                    },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            {
                $project: {
                    _id: 0,
                    year: '$_id.year',
                    month: '$_id.month',
                    data: 1,
                },
            },
        ]);
    },

    async getRecentTransactions(userId: string, limit = 5, userRole?: string) {
        await connectDB();
        const filter: Record<string, unknown> = { isDeleted: false };
        if (userRole !== 'admin' && userRole !== 'analyst') {
            filter.createdBy = new mongoose.Types.ObjectId(userId);
        }
        return FinancialRecord.find(filter)
            .populate('createdBy', 'name email')
            .sort({ date: -1 })
            .limit(limit)
            .lean();
    },
};
