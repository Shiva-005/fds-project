# Financial Dashboard System (FDS)

A modern, full-stack financial records management and analytics dashboard built with **Next.js 16**, **TypeScript**, **MongoDB**, and **React 19**. Track income and expenses, visualize financial trends, and manage user accounts with role-based access control.

## 🎯 Features

### 📊 Core Functionality
- **Financial Record Management**: Create, read, update, and delete income/expense records
- **Dashboard Analytics**: View financial summaries, category breakdowns, recent transactions, and trends
- **User Management**: Admin panel for managing users and their roles
- **Role-Based Access Control**: Three user roles (viewer, analyst, admin) with granular permissions

### 🔐 Security Features
- **JWT Authentication**: Secure token-based authentication with HttpOnly cookies
- **Password Security**: Bcrypt password hashing with configurable cost factors
- **Rate Limiting**: Built-in rate limiting to prevent API abuse
- **Input Validation**: Zod schemas for comprehensive request validation
- **CORS Support**: Properly configured cross-origin request handling

### 🎨 User Interface
- **Modern Design**: Built with Radix UI components and Tailwind CSS
- **Responsive Layout**: Mobile-friendly interface with responsive panels
- **Dark Mode Support**: Next.js Themes integration for theme switching
- **Smooth Animations**: Framer Motion for polished animations and transitions
- **Toast Notifications**: Sonner for user-friendly notifications

### 📈 Developer Experience
- **TypeScript**: Full type safety with strict mode enabled
- **ESLint**: Code quality enforcement with Next.js ESLint config
- **Comprehensive Logging**: Winston-based structured logging
- **Error Handling**: Standardized response utilities for consistent API responses
- **React Compiler**: Babel plugin for optimized React compilation

## 🏗️ Architecture

```
fds-project/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes (Route Handlers)
│   │   ├── auth/               # Authentication endpoints
│   │   ├── dashboard/          # Analytics endpoints
│   │   ├── records/            # Financial records endpoints
│   │   └── users/              # User management endpoints
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page (Testing dashboard)
│   └── globals.css             # Global styles
├── controllers/                 # Request handlers & business logic
│   ├── auth.controller.ts
│   ├── finance.controller.ts
│   └── user.controller.ts
├── services/                    # Data layer & business logic
│   ├── finance.service.ts
│   └── user.service.ts
├── models/                      # MongoDB schemas & Mongoose models
│   ├── User.ts
│   └── FinancialRecord.ts
├── lib/                         # Core utilities
│   ├── auth.ts                 # JWT utilities
│   └── db.ts                   # MongoDB connection management
├── middleware/                  # Request middleware
│   └── auth.middleware.ts       # JWT verification & role authorization
├── validators/                  # Input validation schemas
│   ├── auth.validator.ts
│   ├── record.validator.ts
│   └── user.validator.ts
├── utils/                       # Utility functions
│   ├── logger.ts               # Winston logging setup
│   ├── rateLimiter.ts          # Rate limiting implementation
│   └── response.ts             # Standardized response helpers
└── public/                      # Static assets
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ or 20+
- **MongoDB** 5.0+ (local or Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fds-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/finance_dashboard
   DB_NAME=finance_dashboard
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # Admin Account (for initial setup)
   ADMIN_EMAIL=admin@financeapp.com
   ADMIN_PASSWORD=AdminSecure123!
   
   # Node Environment
   NODE_ENV=development
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Or using MongoDB Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Available Scripts

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user (returns JWT)
- `POST /api/auth/logout` - Logout user

### Financial Records
- `GET /api/records` - List all records (with pagination & filtering)
- `POST /api/records` - Create a new record (admin only)
- `PATCH /api/records/[id]` - Update a record (admin only)
- `DELETE /api/records/[id]` - Delete a record (admin only)

### Dashboard Analytics
- `GET /api/dashboard/summary` - Financial summary (total income/expense)
- `GET /api/dashboard/category-breakdown` - Income/expense by category
- `GET /api/dashboard/trends` - Trends over time
- `GET /api/dashboard/recent` - Recent transactions

### User Management
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create user (admin only)
- `PATCH /api/users/[id]` - Update user (admin only)
- `DELETE /api/users/[id]` - Delete user (admin only)

## 🔑 User Roles & Permissions

### Admin
- Full access to all endpoints
- Create, update, delete records
- Manage users and their roles
- Access all analytics

### Analyst
- Read access to financial records
- Create and manage own records
- Access analytics dashboards

### Viewer
- Read-only access to financial data
- View analytics dashboards
- Cannot create or modify records

## 💾 Database Schema

### User Model
```typescript
{
  name: string;              // Required, 2-100 chars
  email: string;             // Unique, required
  password: string;          // Hashed, min 8 chars
  role: 'viewer' | 'analyst' | 'admin';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
```

### Financial Record Model
```typescript
{
  amount: number;            // > 0
  type: 'income' | 'expense';
  category: string;          // Required, max 100 chars
  date: Date;                // Transaction date
  note?: string;             // Optional note
  createdBy: ObjectId;       // Reference to User
  isDeleted: boolean;        // Soft delete flag
  createdAt: Date;
  updatedAt: Date;
}
```

## 🧪 Testing the API

The home page (`/`) includes an interactive testing dashboard where you can:
- Register new users
- Login and manage tokens
- Create, read, update, and delete financial records
- Manage users
- Test all API endpoints

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/finance_dashboard` |
| `DB_NAME` | Database name | `finance_dashboard` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `ADMIN_EMAIL` | Default admin email | `admin@financeapp.com` |
| `ADMIN_PASSWORD` | Default admin password | `AdminSecure123!` |
| `NODE_ENV` | Environment (development/production) | `development` |

### TypeScript Configuration

- **Target**: ES2017
- **Module**: ESNext
- **Strict Mode**: Enabled
- **Path Aliases**: `@/*` for root imports

### Tailwind CSS

Configured with:
- Radix UI plugin for component variables
- CSS nesting support
- Automatic dark mode support

## 📚 Tech Stack

### Frontend
- **React 19.2.4** - UI library
- **Next.js 16.2.2** - Full-stack framework
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **Radix UI** - Headless component library
- **Framer Motion** - Animation library
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Next.js 16** - API routes & server runtime
- **Node.js** - JavaScript runtime
- **MongoDB 9.3.3** - NoSQL database
- **Mongoose 9.3.3** - ODM library
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Express Rate Limit** - Rate limiting

### Development Tools
- **ESLint 9** - Code linting
- **Babel React Compiler** - React optimization
- **Winston** - Logging

## 🔒 Security Best Practices

✅ Implemented:
- Password hashing with bcryptjs
- JWT tokens with configurable expiration
- HttpOnly cookies (secure by default in production)
- Rate limiting on all endpoints
- Input validation with Zod schemas
- CORS headers
- User role-based authorization
- Soft delete for financial records (audit trail)
- Proper error messages (no sensitive data leakage)

## 📝 Logging

The application uses Winston for structured logging:
```typescript
logger.info('User logged in', { userId, email });
logger.error('Database connection failed', { error: err });
logger.warn('Rate limit exceeded', { ip, endpoint });
```

Logs include:
- Timestamp
- Log level (info, warn, error)
- Message
- Contextual metadata

## 🐛 Common Issues & Solutions

### MongoDB Connection Fails
```bash
# Check if MongoDB is running
mongo --version

# Start MongoDB (macOS)
brew services start mongodb-community

# Or using Docker
docker run -d -p 27017:27017 mongo
```

### JWT Token Expired
- Tokens expire after the duration specified in `JWT_EXPIRES_IN`
- Log in again to get a fresh token

### Rate Limit Hit
- Wait for the duration specified in the `Retry-After` header
- Rate limits are applied per IP per endpoint

### ValidationError from Zod
- Check request payload against the schema
- Ensure all required fields are present and correct type

## 🚀 Production Deployment

### Pre-Deployment Checklist
```bash
# ✅ Run linter
npm run lint

# ✅ Build project
npm run build

# ✅ Set secure environment variables
#    - Use strong JWT_SECRET
#    - Use production MongoDB URI
#    - Enable NODE_ENV=production

# ✅ Use HTTPS in production
#    - Set cookie secure flag (automatic when NODE_ENV=production)
```

## 📖 Learn More

### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### Related Guides
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)


## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions or issues:
- Create an issue on GitHub
- Check existing documentation
- Review the testing dashboard on the home page

---

**Made with ❤️ using Next.js, MongoDB, and React**
