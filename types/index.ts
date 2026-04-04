export type UserRole = 'viewer' | 'analyst' | 'admin';
export type UserStatus = 'active' | 'inactive';
export type RecordType = 'income' | 'expense';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialRecord {
  _id: string;
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  note?: string;
  createdBy: { _id: string; name: string; email: string } | string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
}

export interface CategoryBreakdown {
  category: string;
  totalAmount: number;
  breakdown: { type: RecordType; total: number; count: number }[];
}

export interface MonthlyTrend {
  year: number;
  month: number;
  data: { type: RecordType; total: number; count: number }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface RecordFilters {
  page: number;
  limit: number;
  type?: RecordType | '';
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
