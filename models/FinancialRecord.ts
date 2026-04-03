import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type RecordType = 'income' | 'expense';

export interface IFinancialRecord {
    amount: number;
    type: RecordType;
    category: string;
    date: Date;
    note?: string;
    createdBy: Types.ObjectId;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type IFinancialRecordDocument = IFinancialRecord & Document;

export type IFinancialRecordModel = Model<IFinancialRecordDocument>;

const financialRecordSchema = new Schema<IFinancialRecordDocument>(
    {
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be greater than 0'],
        },
        type: {
            type: String,
            enum: {
                values: ['income', 'expense'] as RecordType[],
                message: 'Type must be income or expense',
            },
            required: [true, 'Type is required'],
            index: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
            maxlength: [100, 'Category cannot exceed 100 characters'],
            index: true,
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
            index: true,
        },
        note: {
            type: String,
            trim: true,
            maxlength: [500, 'Note cannot exceed 500 characters'],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Creator reference is required'],
            index: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Compound indexes for common query patterns
financialRecordSchema.index({ type: 1, date: -1 });
financialRecordSchema.index({ category: 1, date: -1 });
financialRecordSchema.index({ isDeleted: 1, date: -1 });
financialRecordSchema.index({ date: -1, type: 1, category: 1 });

// Text index for search
financialRecordSchema.index({ category: 'text', note: 'text' });

const FinancialRecord =
    (mongoose.models.FinancialRecord as IFinancialRecordModel) ??
    mongoose.model<IFinancialRecordDocument, IFinancialRecordModel>('FinancialRecord', financialRecordSchema);

export default FinancialRecord;
