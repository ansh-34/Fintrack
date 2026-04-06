# FinTrack - Finance Data Processing & Access Control Backend

A full-stack MERN application for managing financial records with role-based access control and dashboard analytics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ES Modules) |
| Backend Framework | Express.js |
| Database | MongoDB + Mongoose ODM |
| Authentication | JWT (cookie-based + Bearer token) |
| Validation | Joi |
| Frontend | React 18 + Vite |
| Routing | React Router v7 |
| HTTP Client | Axios |

## Architecture

```
Client (React + Vite)
  |
  | HTTP (proxied via Vite in dev)
  v
Express Server
  ├── Routes          → define endpoints
  ├── Middleware       → auth, RBAC, validation, error handling
  ├── Controllers      → handle request/response
  ├── Services         → business logic + validation schemas
  ├── Models           → Mongoose schemas
  └── MongoDB          → data persistence
```

### Design Decisions

- **Cookie-based auth**: JWT stored in httpOnly cookie prevents XSS token theft. Bearer token supported as fallback for API testing tools.
- **Service layer pattern**: Business logic separated from controllers. Controllers handle HTTP concerns only.
- **Joi co-located with services**: Validation schemas live next to the business logic they protect, keeping related code together.
- **Soft delete for transactions**: Records are never permanently deleted - `isDeleted` flag + `deletedAt` timestamp. A Mongoose pre-find hook automatically excludes soft-deleted records.
- **MongoDB**: Chosen for flexible schema and native aggregation pipeline support for dashboard analytics.

## Project Structure

```
fintrack-api/
├── server/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── constants.js           # Roles, types, categories
│   ├── models/
│   │   ├── User.js                # User schema with password hashing
│   │   └── Transaction.js         # Transaction schema with soft delete
│   ├── middleware/
│   │   ├── auth.js                # JWT verification + cookie handling
│   │   ├── rbac.js                # Role-based authorization
│   │   ├── validate.js            # Joi body/query validation
│   │   └── errorHandler.js        # Global error handler
│   ├── services/
│   │   ├── auth.service.js        # Register, login logic
│   │   ├── user.service.js        # User CRUD + role management
│   │   ├── transaction.service.js # Transaction CRUD + ownership
│   │   └── dashboard.service.js   # Aggregation analytics
│   ├── controllers/               # HTTP request handlers
│   ├── routes/                    # Express route definitions
│   ├── utils/
│   │   ├── ApiError.js            # Custom error class
│   │   └── response.js            # Response envelope helpers
│   ├── seed.js                    # Database seeder
│   └── index.js                   # App entry point
├── client/
│   ├── src/
│   │   ├── api/client.js          # Axios instance
│   │   ├── context/AuthContext.jsx # Auth state management
│   │   ├── components/Layout.jsx  # Sidebar layout
│   │   └── pages/                 # Dashboard, Transactions, Users, Login
│   └── index.html
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd fintrack-api

# Install server dependencies
cd server
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your MongoDB URI

# Seed the database
npm run seed

# Start the server
npm run dev
```

```bash
# In a new terminal - install and start client
cd client
npm install
npm run dev
```

- Server: http://localhost:5000
- Client: http://localhost:3000

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| MONGO_URI | mongodb://localhost:27017/fintrack | MongoDB connection string |
| JWT_SECRET | (required) | Secret key for JWT signing |
| JWT_EXPIRE | 7d | Token expiration time |
| CLIENT_URL | http://localhost:3000 | CORS allowed origin |

## API Documentation

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/logout` | Logout (clears cookie) | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

**Register:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "admin@fintrack.com",
  "password": "admin123"
}
```

### Users (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (paginated, searchable) |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id/role` | Update user role |
| PATCH | `/api/users/:id/status` | Activate/deactivate user |
| DELETE | `/api/users/:id` | Delete user |

**Query params for listing:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` - search by name or email
- `role` - filter by role (viewer/analyst/admin)
- `sortBy` - name, email, createdAt, role
- `order` - asc/desc

### Transactions

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/transactions` | List transactions | All |
| GET | `/api/transactions/:id` | Get transaction | All |
| POST | `/api/transactions` | Create transaction | Analyst, Admin |
| PATCH | `/api/transactions/:id` | Update transaction | Analyst (own), Admin |
| DELETE | `/api/transactions/:id` | Soft delete | Analyst (own), Admin |

**Create transaction:**
```json
POST /api/transactions
{
  "amount": 5000,
  "type": "expense",
  "category": "groceries",
  "date": "2026-04-01T00:00:00.000Z",
  "description": "Monthly groceries from BigBasket",
  "merchant": "BigBasket",
  "paymentMethod": "upi",
  "tags": ["essential", "recurring"]
}
```

**Query params for listing:**
- `page`, `limit` - pagination
- `type` - income/expense
- `category` - filter by category
- `startDate`, `endDate` - date range
- `search` - search description, merchant, category
- `merchant` - filter by merchant
- `paymentMethod` - filter by payment method
- `tag` - filter by tag
- `sortBy` - date/amount/createdAt
- `order` - asc/desc

### Dashboard (All authenticated users)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Income, expense, net balance totals |
| GET | `/api/dashboard/categories?type=expense` | Category-wise breakdown |
| GET | `/api/dashboard/trends?months=6` | Monthly income/expense trends |
| GET | `/api/dashboard/recent?limit=5` | Recent transactions |
| GET | `/api/dashboard/payment-methods` | Payment method breakdown |

### Response Format

All responses follow a consistent envelope:

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "total": 60, "page": 1, "limit": 20, "totalPages": 3 }
}

// Error
{
  "success": false,
  "error": "Validation failed",
  "details": ["\"amount\" must be a positive number"]
}
```

## Role-Based Access Control

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View dashboard | Yes | Yes | Yes |
| View transactions | Yes | Yes | Yes |
| Create transactions | No | Yes | Yes |
| Edit own transactions | No | Yes | Yes |
| Edit any transaction | No | No | Yes |
| Delete own transactions | No | Yes | Yes |
| Delete any transaction | No | No | Yes |
| Manage users | No | No | Yes |

## Data Models

### User
| Field | Type | Description |
|-------|------|-------------|
| name | String | Required, max 100 chars |
| email | String | Required, unique, validated |
| password | String | Hashed with bcrypt (12 rounds) |
| role | String | viewer / analyst / admin |
| isActive | Boolean | Account status |

### Transaction
| Field | Type | Description |
|-------|------|-------------|
| amount | Number | Required, positive |
| type | String | income / expense |
| category | String | From predefined list |
| date | Date | Transaction date |
| description | String | Optional, max 500 |
| merchant | String | Who the transaction was with |
| paymentMethod | String | cash, credit_card, debit_card, bank_transfer, upi, other |
| tags | [String] | Flexible labels |
| createdBy | ObjectId | Reference to User |
| isDeleted | Boolean | Soft delete flag |
| deletedAt | Date | When soft-deleted |

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fintrack.com | admin123 |
| Analyst | analyst@fintrack.com | analyst123 |
| Viewer | viewer@fintrack.com | viewer123 |

## Assumptions & Tradeoffs

1. **MongoDB chosen over SQL**: The aggregation pipeline is more natural for dashboard analytics than SQL GROUP BY with conditional sums. Trade-off: no foreign key enforcement at the DB level.
2. **Amounts stored as Number (float)**: For simplicity. In production, amounts should be stored as integers (cents/paise) to avoid floating-point precision issues.
3. **Soft delete for transactions only**: Users are hard-deleted since they may need to be fully removed (GDPR). Transactions use soft delete to maintain audit trails.
4. **Predefined categories**: Categories are enforced via an enum rather than being user-definable. This simplifies aggregation and prevents category sprawl.
5. **Cookie + Bearer dual auth**: Cookies for the React client (httpOnly, secure). Bearer tokens for API testing tools like Postman.
6. **No rate limiting**: Omitted for simplicity. In production, use express-rate-limit.
7. **SQLite-free**: Unlike file-based DBs, MongoDB provides better support for concurrent access and aggregation pipelines.

## Available Scripts

### Server
```bash
npm run dev    # Start with nodemon (auto-reload)
npm start      # Production start
npm run seed   # Seed database with sample data
```

### Client
```bash
npm run dev    # Start Vite dev server
npm run build  # Production build
```
