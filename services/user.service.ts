import User, { IUserDocument, UserRole, UserStatus } from '@/models/User';
import { RegisterInput } from '@/validators/auth.validator';
import { ListUsersQuery } from '@/validators/user.validator';
import { connectDB } from '@/lib/db';
// import { logger } from '@/utils/logger';

export interface PaginatedUsers {
  users: ReturnType<IUserDocument['toSafeObject']>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const UserService = {
  async createUser(data: RegisterInput): Promise<IUserDocument> {
    await connectDB();

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const user = new User(data);
    await user.save();
    // logger.info('User created', { userId: user._id, email: user.email });
    return user;
  },

  async findByEmail(email: string): Promise<IUserDocument | null> {
    await connectDB();
    return User.findByEmail(email);
  },

  async findById(id: string): Promise<IUserDocument | null> {
    await connectDB();
    return User.findById(id);
  },

  async listUsers(query: ListUsersQuery): Promise<PaginatedUsers> {
    await connectDB();

    const { page, limit, role, status, search } = query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return {
      users: users.map((user) => user.toSafeObject()),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async updateRole(id: string, role: UserRole): Promise<IUserDocument | null> {
    await connectDB();
    const user = await User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });
    // if (user) logger.info('User role updated', { userId: id, newRole: role });
    return user;
  },

  async updateStatus(id: string, status: UserStatus): Promise<IUserDocument | null> {
    await connectDB();
    const user = await User.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    // if (user) logger.info('User status updated', { userId: id, newStatus: status });
    return user;
  },

  async deleteUser(id: string): Promise<boolean> {
    await connectDB();
    const result = await User.findByIdAndDelete(id);
    return !!result;
  },
};
