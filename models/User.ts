import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'viewer' | 'analyst' | 'admin';
export type UserStatus = 'active' | 'inactive';

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
    toSafeObject(): Omit<IUser & { _id: string }, 'password'>;
}

export interface IUserModel extends Model<IUserDocument> {
    findByEmail(email: string): Promise<IUserDocument | null>;
}

const userSchema = new Schema<IUserDocument>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
            index: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Never return password in queries
        },
        role: {
            type: String,
            enum: {
                values: ['viewer', 'analyst', 'admin'] as UserRole[],
                message: 'Role must be viewer, analyst, or admin',
            },
            default: 'viewer',
            index: true,
        },
        status: {
            type: String,
            enum: {
                values: ['active', 'inactive'] as UserStatus[],
                message: 'Status must be active or inactive',
            },
            default: 'active',
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Hash password before save
userSchema.pre<IUserDocument>('save', async function (this: IUserDocument) {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
    const obj = this.toObject({ getters: true, virtuals: true });
    const { password, __v, ...rest } = obj as any;

    const safe = {
        ...rest,
        id: obj._id?.toString() || obj.id || '',
        created_at: obj.createdAt ? new Date(obj.createdAt).toISOString() : obj.created_at,
        updated_at: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : obj.updated_at,
    };

    delete (safe as any)._id;
    delete (safe as any).createdAt;
    delete (safe as any).updatedAt;

    return safe;
};

// Static methods
userSchema.statics.findByEmail = function (email: string) {
    return this.findOne({ email: email.toLowerCase() }).select('+password');
};

const User = (mongoose.models.User as IUserModel) ?? mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;
