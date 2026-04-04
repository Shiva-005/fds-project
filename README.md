# Financial Dashboard System (FDS)

A full-stack financial records management application built with **Next.js 16**, **TypeScript**, **MongoDB**, and **React 19**. Users can log in, view dashboards, manage financial records, and administer accounts with role-based access control.

## 🎯 Features

### 📊 Core Functionality
- **Financial Record Management**: Create, read, update, and delete income and expense records
- **Dashboard Analytics**: Financial summary, category breakdown, recent transactions, and trend charts
- **User Management**: Admin interface for listing and updating users
- **Role-Based Access Control**: Viewer, analyst, and admin roles with permission checks

### 🔐 Security Features
- **JWT Authentication**: Token-based auth with HttpOnly cookies
- **Password Security**: Bcrypt password hashing
- **Rate Limiting**: Endpoint-level request throttling for auth routes
- **Input Validation**: Zod schemas validate incoming request payloads
- **Secure Cookies**: `secure` cookie flag enabled in production

### 🎨 User Interface
- **Custom UI**: Responsive interface built with CSS and custom React components
- **Dashboard Layout**: Sidebar navigation, topbar actions, and page sections
- **Record Management**: Filters, create/edit forms, and recent transaction list
- **Settings Screen**: User preferences and account actions
- **Charting**: Chart.js loaded via CDN for dashboard visuals

### 📈 Developer Experience
- **TypeScript**: Strong typing throughout frontend and backend
- **ESLint**: Next.js linting for code quality
- **Logging**: Structured logging via Winston
- **API Error Handling**: Consistent response utilities across route handlers

## 🏗️ Architecture

The application uses the Next.js App Router with a nested dashboard segment group. The root layout wraps all pages with authentication and toast providers, while the dashboard layout enforces client-side auth and renders the sidebar/topbar shell.

```
fds-project/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Authenticated dashboard segment group
│   │   ├── analytics/            # Analytics page
│   │   │   └── page.tsx
│   │   ├── dashboard/            # Main dashboard page
│   │   │   └── page.tsx
│   │   ├── records/              # Records management page
│   │   │   └── page.tsx
│   │   ├── settings/             # User settings page
│   │   │   └── page.tsx
│   │   └── users/                # User management page
│   │       └── page.tsx
│   ├── api/                      # API Routes (Route Handlers)
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── dashboard/            # Analytics endpoints
│   │   ├── records/              # Financial records endpoints
│   │   └── users/                # User management endpoints
│   ├── login/                    # Login page
│   │   └── page.tsx
│   ├── register/                 # Registration page
│   │   └── page.tsx
│   ├── page.tsx                  # Redirects to /login
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── controllers/                  # Request handlers & business logic
│   ├── auth.controller.ts
│   ├── finance.controller.ts
│   └── user.controller.ts
├── services/                     # Data access and domain logic
│   ├── finance.service.ts
│   └── user.service.ts
├── models/                       # Mongoose schemas and models
│   ├── User.ts
│   └── FinancialRecord.ts
├── lib/                          # Core utilities
│   ├── auth.ts                   # JWT and cookie helpers
│   └── db.ts                     # MongoDB connection management
├── middleware/                   # Authentication middleware
│   └── auth.middleware.ts        # JWT verification and role checks
├── validators/                   # Request validation schemas
│   ├── auth.validator.ts
│   ├── record.validator.ts
│   └── user.validator.ts
├── utils/                        # Utility helpers
│   ├── logger.ts                 # Winston logger setup
│   ├── rateLimiter.ts            # Rate limiting utility
│   └── response.ts               # Standard response helpers
└── public/                       # Static assets
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
   # MongoDB Atlas connection string
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.zyjxhuq.mongodb.net/finance_dashboard?retryWrites=true&w=majority
   JWT_SECRET=replace-with-strong-secret
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```

   If you prefer to use a local MongoDB instance instead, replace `MONGODB_URI` with a local connection string like `mongodb://localhost:27017/finance_dashboard`.

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

## � Admin User Setup

The project does not currently include an automatic admin seed script. To create an administrator account:

- Use the `POST /api/auth/register` endpoint to register a new user.
- Then update that user in the database to the `admin` role, or insert an admin user directly into MongoDB.

If you prefer to create the first admin user directly in MongoDB, insert a user document with:

- `name`
- `email`
- `password` hashed with bcrypt
- `role: 'admin'`
- `status: 'active'`

> Tip: If you create an admin account manually, make sure the password is hashed before storing it.

## �📖 Available Scripts

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
- `POST /api/auth/login` - Log in a user and set auth cookie
- `POST /api/auth/logout` - Clear auth cookie

### Financial Records
- `GET /api/records` - List records with optional filtering
- `POST /api/records` - Create a new record
- `PATCH /api/records/[id]` - Update a record
- `DELETE /api/records/[id]` - Soft delete a record

### Dashboard Analytics
- `GET /api/dashboard/summary` - Financial summary totals
- `GET /api/dashboard/category-breakdown` - Category breakdown data
- `GET /api/dashboard/trends` - Trends over time
- `GET /api/dashboard/recent` - Recent transactions

### User Management
- `GET /api/users` - List all users
- `POST /api/users` - Create a new user
- `PATCH /api/users/[id]` - Update user details
- `DELETE /api/users/[id]` - Delete a user

## 🔑 User Roles & Permissions

### Admin
- Full access to dashboard and data management
- Create, update, and delete records
- Manage user accounts and roles

### Analyst
- Access analytics and record listings
- Create and edit own records

### Viewer
- Read-only access to records and dashboards
- Cannot modify records or manage users

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

The app redirects `/` to `/login` and then provides an authenticated dashboard flow where you can:
- Register new users
- Log in and manage tokens
- Create, read, update, and delete financial records
- View analytics and recent transactions
- Manage users (admin only)

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas or local connection string | `mongodb+srv://<username>:<password>@cluster0.zyjxhuq.mongodb.net/finance_dashboard?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key for JWT signing | `replace-with-strong-secret` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `NODE_ENV` | Environment (development/production) | `development` |

### TypeScript Configuration

- **Target**: ES2017
- **Module**: ESNext
- **Strict Mode**: Enabled
- **Path Aliases**: `@/*` for root imports


## 📚 Tech Stack

### Frontend
- **React 19.2.4**
- **Next.js 16.2.2**
- **TypeScript 5**
- **CSS**
- **Zod** for frontend and backend validation

### Backend
- **Next.js 16** server runtime
- **Node.js**
- **MongoDB**
- **Mongoose 9.3.3**
- **JWT** for auth
- **Bcryptjs** for password hashing

### Development Tools
- **ESLint 9**
- **Babel React Compiler**
- **Winston** for logging

## 🔒 Security Best Practices

✅ Implemented:
- Password hashing with bcryptjs
- JWT tokens with configurable expiration
- HttpOnly cookies for authentication
- Rate limiting for authentication endpoints
- Input validation using Zod
- Role-based authorization
- Soft deletion for records

## 📝 Logging

The application uses Winston for structured logging:
```typescript
logger.info('User logged in', { userId, email });
logger.error('Database connection failed', { error: err });
logger.warn('Rate limit exceeded', { ip, endpoint });
```

Logs include:
- Timestamp
- Log level
- Message
- Metadata

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
- Tokens expire after `JWT_EXPIRES_IN`
- Log in again to refresh the token

### Rate Limit Hit
- Wait for the `Retry-After` header
- Rate limiting is applied per IP on login/register

### ValidationError from Zod
- Verify request payload shape
- Ensure required fields are present

## 🚀 Production Deployment

### Pre-Deployment Checklist
```bash
npm run lint
npm run build
```
- Use a secure `JWT_SECRET`
- Use a production `MONGODB_URI`
- Set `NODE_ENV=production`
- Serve over HTTPS

## 📖 Learn More

### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)

## 🤝 Contributing

Contributions are welcome. Please open a PR for improvements.

## 📞 Support

For questions or issues:
- Create an issue on GitHub
- Check existing documentation

---

**Made with ❤️ using Next.js, MongoDB, and React**
